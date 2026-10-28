import { Order } from "../types/order";

function packWeight(label: string) {
  const value = label.toLowerCase().replaceAll(" ", "");
  if (value.includes("1/4kg")) return 0.25;
  if (value.includes("1/2kg")) return 0.5;
  if (value.includes("1kg")) return 1;
  return 0;
}
function componentWeight(quantity: string) {
  const value = Number.parseFloat(quantity);
  return quantity.toLowerCase().includes("gm")
    ? value / 1000
    : packWeight(quantity);
}

export function AnalysisDialog({
  orders,
  completed,
  onClose,
}: {
  orders: Order[];
  completed: boolean;
  onClose: () => void;
}) {
  const rows = new Map<
    string,
    { kg: number; customers: Map<string, number> }
  >();
  orders.forEach((order) => {
    const delivered = order.items.every(
      (item) => item.delivered >= item.quantity,
    );
    const paid =
      order.payments.reduce((sum, payment) => sum + payment.amount, 0) >=
      order.items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0,
      );
    if (completed ? !delivered || !paid : delivered) return;
    order.items.forEach((item) => {
      const packs = completed ? item.delivered : item.quantity - item.delivered;
      const components = item.product.components as
        { name: string; quantity: string }[] | undefined;
      const pieces =
        item.product.type === "COMBO" && Array.isArray(components)
          ? components.map((component) => ({
              name: component.name,
              kg: componentWeight(component.quantity) * packs,
            }))
          : [
              {
                name: item.product.name,
                kg: packWeight(item.product.packLabel || "") * packs,
              },
            ];
      pieces.forEach(({ name, kg }) => {
        const entry = rows.get(name) || { kg: 0, customers: new Map() };
        entry.kg += kg;
        entry.customers.set(
          order.customerName,
          (entry.customers.get(order.customerName) || 0) + kg,
        );
        rows.set(name, entry);
      });
    });
  });
  return (
    <div className="modal">
      <div className="modalbox">
        <div className="modalhead">
          <h3>
            {completed ? "Completed sweet analysis" : "Production required"}
          </h3>
          <button className="close" onClick={onClose}>
            ×
          </button>
        </div>
        <p className="payment-info">
          Expand an item to see the customer-wise quantity.
        </p>
        <div className="analysis-list">
          {[...rows.entries()].map(([name, row]) => (
            <details className="analysis-line" key={name}>
              <summary>
                <span>{name}</span>
                <span className="analysis-total">
                  {row.kg ? row.kg.toFixed(3) : "—"}
                  {row.kg ? " kg" : " pack size unavailable"}
                </span>
              </summary>
              <div className="customer-breakdown">
                {[...row.customers.entries()].map(([customer, kg]) => (
                  <div key={customer}>
                    <span>{customer}</span>
                    <span>
                      {kg ? kg.toFixed(3) : "—"}
                      {kg ? " kg" : ""}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          )) || <p className="empty">No matching orders yet.</p>}
        </div>
      </div>
    </div>
  );
}
