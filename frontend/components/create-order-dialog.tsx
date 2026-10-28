"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Product } from "../types/order";
import { ProductPicker } from "./product-picker";

type Line = { productId: string; quantity: number };

type Props = {
  products: Product[];
  onClose: () => void;
  onCreate: (order: {
    customerName: string;
    companyName?: string;
    notes?: string;
    orderDate: string;
    items: { productId: string; quantity: number; unitPrice: number }[];
  }) => Promise<void>;
};

export function CreateOrderDialog({ products, onClose, onCreate }: Props) {
  const [lines, setLines] = useState<Line[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (products.length && !lines.length) {
      setLines([{ productId: products[0].id, quantity: 1 }]);
    }
  }, [products, lines.length]);

  const total = useMemo(
    () =>
      lines.reduce((sum, line) => {
        const product = products.find((item) => item.id === line.productId);
        return sum + (product?.price || 0) * line.quantity;
      }, 0),
    [lines, products],
  );

  function updateLine(index: number, changes: Partial<Line>) {
    setLines((current) =>
      current.map((line, lineIndex) =>
        lineIndex === index ? { ...line, ...changes } : line,
      ),
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const items = lines
      .map((line) => {
        const product = products.find((item) => item.id === line.productId);
        return product
          ? {
              productId: product.id,
              quantity: line.quantity,
              unitPrice: product.price,
            }
          : null;
      })
      .filter(Boolean) as {
      productId: string;
      quantity: number;
      unitPrice: number;
    }[];

    if (!items.length) {
      setError("Please add at least one sweet or combo.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await onCreate({
        customerName: String(form.get("customerName")),
        companyName: String(form.get("companyName")) || undefined,
        notes: String(form.get("notes")) || undefined,
        orderDate: new Date(String(form.get("orderDate"))).toISOString(),
        items,
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not save order.",
      );
      setSaving(false);
    }
  }

  return (
    <div className="modal">
      <form className="order-form" onSubmit={submit}>
        <button
          type="button"
          className="x"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2>Create order</h2>
        <p>
          Choose the packs the company needs. Quantity means number of packs.
        </p>
        <div className="form-grid">
          <label>
            Customer name
            <input required name="customerName" placeholder="Contact person" />
          </label>
          <label>
            Company name
            <input required name="companyName" placeholder="Company" />
          </label>
          <label>
            Order date
            <input
              required
              name="orderDate"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
            />
          </label>
        </div>

        <div className="order-lines">
          <b>Order items</b>
          {lines.map((line, index) => {
            const product = products.find((item) => item.id === line.productId);
            return (
              <div className="order-line" key={index}>
                <ProductPicker
                  products={products}
                  value={line.productId}
                  onChange={(productId) => updateLine(index, { productId })}
                />
                <input
                  min="1"
                  value={line.quantity}
                  type="number"
                  aria-label="Pack quantity"
                  onChange={(event) =>
                    updateLine(index, {
                      quantity: Math.max(1, Number(event.target.value)),
                    })
                  }
                />
                <span>
                  ₹
                  {((product?.price || 0) * line.quantity).toLocaleString(
                    "en-IN",
                  )}
                </span>
                {lines.length > 1 && (
                  <button
                    type="button"
                    className="secondary"
                    onClick={() =>
                      setLines((current) =>
                        current.filter((_, lineIndex) => lineIndex !== index),
                      )
                    }
                  >
                    Remove
                  </button>
                )}
              </div>
            );
          })}
          <button
            type="button"
            className="secondary"
            onClick={() =>
              setLines((current) => [
                ...current,
                { productId: products[0]?.id || "", quantity: 1 },
              ])
            }
          >
            + Add another item
          </button>
        </div>

        <label>
          Notes
          <textarea
            name="notes"
            placeholder="Optional delivery or packing notes"
          />
        </label>
        <div className="order-total">
          Order total <strong>₹{total.toLocaleString("en-IN")}</strong>
        </div>
        {error && <p className="form-error">{error}</p>}
        <button className="primary" disabled={!products.length || saving}>
          {saving ? "Saving…" : "Create order"}
        </button>
      </form>
    </div>
  );
}
