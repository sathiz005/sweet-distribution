"use client";

import { FormEvent, useState } from "react";
import { Order } from "../types/order";

type Action = "edit" | "delivery" | "payment" | "delete";

export function OrderActionDialog({
  order,
  action,
  onClose,
  onEdit,
  onDelivery,
  onPayment,
  onDelete,
}: {
  order: Order;
  action: Action;
  onClose: () => void;
  onEdit: (data: {
    customerName: string;
    companyName: string;
    orderDate: string;
    notes: string;
  }) => Promise<void>;
  onDelivery: (items: { id: string; delivered: number }[]) => Promise<void>;
  onPayment: (amount: number) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const total = order.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const paid = order.payments.reduce((sum, payment) => sum + payment.amount, 0);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    if (action === "edit")
      await onEdit({
        customerName: String(form.get("customerName")),
        companyName: String(form.get("companyName")),
        orderDate: String(form.get("orderDate")),
        notes: String(form.get("notes")),
      });
    if (action === "delivery")
      await onDelivery(
        order.items.map((item) => ({
          id: item.id,
          delivered: Number(form.get(item.id)),
        })),
      );
    if (action === "payment") await onPayment(Number(form.get("amount")));
    if (action === "delete") await onDelete();
  }
  const title =
    action === "edit"
      ? "Edit order"
      : action === "delivery"
        ? "Update distribution"
        : action === "payment"
          ? "Record payment"
          : "Delete order";
  return (
    <div className="modal">
      <form className="modalbox action-dialog" onSubmit={submit}>
        <div className="modalhead">
          <h3>{title}</h3>
          <button type="button" className="close" onClick={onClose}>
            ×
          </button>
        </div>
        {action === "edit" && (
          <div className="form-grid">
            <label>
              Customer name
              <input
                required
                name="customerName"
                defaultValue={order.customerName}
              />
            </label>
            <label>
              Company name
              <input
                required
                name="companyName"
                defaultValue={order.companyName || ""}
              />
            </label>
            <label>
              Order date
              <input
                required
                name="orderDate"
                type="date"
                defaultValue={order.orderDate?.slice(0, 10)}
              />
            </label>
            <label>
              Notes
              <textarea
                name="notes"
                defaultValue={order.notes || ""}
                placeholder="Optional delivery or packing notes"
              />
            </label>
          </div>
        )}
        {action === "delivery" && (
          <>
            <p className="payment-info">
              {order.customerName} · Enter the total packs delivered so far.
            </p>
            <div className="delivery-items">
              {order.items.map((item) => (
                <label key={item.id}>
                  {item.product.name}
                  <small>Ordered: {item.quantity} packs</small>
                  <input
                    name={item.id}
                    min="0"
                    max={item.quantity}
                    type="number"
                    defaultValue={item.delivered}
                  />
                </label>
              ))}
            </div>
          </>
        )}
        {action === "payment" && (
          <>
            <p className="payment-info">
              <b>{order.customerName}</b>
              <br />
              Total bill ₹{total.toLocaleString("en-IN")} · Already received ₹
              {paid.toLocaleString("en-IN")} · Due ₹
              {(total - paid).toLocaleString("en-IN")}
            </p>
            <div className="payment-row">
              <input
                required
                name="amount"
                min="1"
                max={total - paid}
                type="number"
                placeholder="Payment received (₹)"
                autoFocus
              />
            </div>
          </>
        )}
        {action === "delete" && (
          <p className="payment-info">
            Delete the order for <b>{order.customerName}</b>? This cannot be
            undone.
          </p>
        )}
        <div className="form-actions">
          <button type="button" className="cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className={action === "delete" ? "danger save" : "save"}
            disabled={saving}
          >
            {saving
              ? "Saving…"
              : action === "delete"
                ? "Delete order"
                : action === "payment"
                  ? "Add payment"
                  : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
