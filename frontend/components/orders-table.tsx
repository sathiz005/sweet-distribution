import { Order } from "../types/order";
type Props = {
  orders: Order[];
  tab: string;
  isAdmin: boolean;
  onEdit: (order: Order) => void;
  onDeliver: (order: Order) => void;
  onPayment: (order: Order) => void;
  onDelete: (order: Order) => void;
};
export function OrderTable({
  orders,
  tab,
  isAdmin,
  onEdit,
  onDeliver,
  onPayment,
  onDelete,
}: Props) {
  const visible = orders.filter((o) => {
    const delivered = o.items.every((i) => i.delivered >= i.quantity);
    const paid =
      o.payments.reduce((s, p) => s + p.amount, 0) >=
      o.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    if (tab === "distribution") return !delivered;
    if (tab === "payments") return !paid;
    if (tab === "completed") return delivered && paid;
    return true;
  });
  return (
    <div className="table">
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>{tab === "payments" ? "Bill total" : "Order"}</th>
            {tab !== "payments" && <th>Delivery</th>}
            <th>
              {tab === "distribution" ? "Remaining to distribute" : "Billing"}
            </th>
            {isAdmin && tab !== "completed" && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {visible.map((o) => {
            const total = o.items.reduce(
                (s, i) => s + i.unitPrice * i.quantity,
                0,
              ),
              paid = o.payments.reduce((s, p) => s + p.amount, 0),
              delivered = o.items.every((i) => i.delivered >= i.quantity),
              partial = o.items.some((i) => i.delivered > 0);
            return (
              <tr key={o.id}>
                <td>
                  <b>{o.customerName}</b>
                  <small>{o.companyName || "No company"}</small>
                </td>
                <td>
                  {tab === "payments" ? (
                    <b>₹{total.toLocaleString("en-IN")}</b>
                  ) : (
                    o.items.map((i) => (
                      <div key={i.id}>
                        {i.product.name} · {i.product.packLabel} × {i.quantity}
                      </div>
                    ))
                  )}
                </td>
                {tab !== "payments" && (
                  <td>
                    <span
                      className={`pill ${delivered ? "progress" : partial ? "partial" : "newpill"}`}
                    >
                      {delivered ? "Delivered" : partial ? "Partial" : "New"}
                    </span>
                  </td>
                )}
                <td>
                  {tab === "distribution" ? (
                    o.items.map((i) => (
                      <div key={i.id}>
                        {i.product.name} · {i.product.packLabel}:{" "}
                        <b>{i.quantity - i.delivered}</b> packs left
                      </div>
                    ))
                  ) : tab === "completed" ? (
                    <b>₹{total.toLocaleString("en-IN")}</b>
                  ) : (
                    <>
                      <b>₹{total.toLocaleString("en-IN")}</b>
                      <small>
                        Paid ₹{paid.toLocaleString("en-IN")} · Due ₹
                        {(total - paid).toLocaleString("en-IN")}
                      </small>
                    </>
                  )}
                </td>
                {isAdmin && tab !== "completed" && (
                  <td>
                    <div className="actions">
                      {tab === "orders" && (
                        <>
                          <button className="tiny" onClick={() => onEdit(o)}>
                            Edit
                          </button>
                          <button
                            className="tiny danger"
                            onClick={() => onDelete(o)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {tab === "distribution" && (
                        <button
                          className="tiny primary"
                          onClick={() => onDeliver(o)}
                        >
                          Update distribution
                        </button>
                      )}
                      {tab === "payments" && (
                        <button
                          className="tiny primary"
                          onClick={() => onPayment(o)}
                        >
                          Update payment
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {!visible.length && <p className="empty">No orders to show.</p>}
    </div>
  );
}
