"use client";

import { FormEvent, useState } from "react";
import { Product } from "../types/order";
import { ProductPicker } from "./product-picker";

type Component = { productId: string; quantity: string };

type Props = {
  products: Product[];
  onClose: () => void;
  onCreate: (product: {
    name: string;
    packLabel: string;
    price: number;
    type: "SWEET" | "COMBO";
    components?: { name: string; quantity: string }[];
  }) => Promise<void>;
};

export function CreateProductDialog({ products, onClose, onCreate }: Props) {
  const [type, setType] = useState<"SWEET" | "COMBO">("SWEET");
  const [components, setComponents] = useState<Component[]>([
    { productId: "", quantity: "" },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateComponent(index: number, changes: Partial<Component>) {
    setComponents((current) =>
      current.map((component, componentIndex) =>
        componentIndex === index ? { ...component, ...changes } : component,
      ),
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const validComponents = components.filter(
      (component) => component.productId,
    );
    if (type === "COMBO" && !validComponents.length) {
      setError("Add at least one sweet and its quantity for this combo.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await onCreate({
        name: String(form.get("name")),
        packLabel: String(form.get("packLabel")),
        price: Number(form.get("price")),
        type,
        components:
          type === "COMBO"
            ? validComponents.map((component) => ({
                name:
                  products.find((product) => product.id === component.productId)
                    ?.name || "",
                quantity:
                  products.find((product) => product.id === component.productId)
                    ?.packLabel || "",
              }))
            : undefined,
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not save item.",
      );
      setSaving(false);
    }
  }

  return (
    <div className="modal">
      <form className="modalbox order-form product-dialog" onSubmit={submit}>
        <div className="modalhead">
          <h3>Add to price list</h3>
          <button type="button" className="close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="form-grid">
          <label>
            Item type
            <select
              value={type}
              onChange={(event) =>
                setType(event.target.value as "SWEET" | "COMBO")
              }
            >
              <option value="SWEET">Sweet</option>
              <option value="COMBO">Combo</option>
            </select>
          </label>
          <label>
            {type === "COMBO" ? "Combo name" : "Sweet name"}
            <input
              required
              name="name"
              placeholder={type === "COMBO" ? "Festival combo" : "Sweet name"}
            />
          </label>
          <label>
            Pack size
            <input
              required
              name="packLabel"
              placeholder="Example: 1 kg or 1/2 kg"
            />
          </label>
          <label>
            Price (₹)
            <input
              required
              min="1"
              name="price"
              type="number"
              placeholder="0"
            />
          </label>
        </div>
        {type === "COMBO" && (
          <div className="order-lines combo-panel">
            <b>Combo contents</b>
            <p className="helper">
              Add every sweet in the combo and its quantity.
            </p>
            {components.map((component, index) => (
              <div className="combo-line" key={index}>
                <ProductPicker
                  products={products}
                  sweetsOnly
                  value={component.productId}
                  onChange={(productId) =>
                    updateComponent(index, { productId })
                  }
                />
                {components.length > 1 && (
                  <button
                    type="button"
                    className="secondary"
                    onClick={() =>
                      setComponents((current) =>
                        current.filter(
                          (_, componentIndex) => componentIndex !== index,
                        ),
                      )
                    }
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="secondary"
              onClick={() =>
                setComponents((current) => [
                  ...current,
                  { productId: "", quantity: "" },
                ])
              }
            >
              + Add sweet to combo
            </button>
          </div>
        )}
        {error && <p className="form-error">{error}</p>}
        <div className="form-actions">
          <button type="button" className="cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="save" disabled={saving}>
            {saving ? "Saving…" : "Add item"}
          </button>
        </div>
      </form>
    </div>
  );
}
