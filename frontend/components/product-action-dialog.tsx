"use client";
import { FormEvent, useState } from "react";
import { Product } from "../types/order";
import { ProductPicker } from "./product-picker";
type Part = { productId: string; quantity: string };
export function ProductActionDialog({
  product,
  products,
  action,
  onClose,
  onSave,
  onDelete,
}: {
  product: Product;
  products: Product[];
  action: "edit" | "delete";
  onClose: () => void;
  onSave: (data: {
    name: string;
    packLabel: string;
    price: number;
    components?: { name: string; quantity: string }[];
  }) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const saved = Array.isArray(product.components)
    ? (product.components as { name: string; quantity: string }[])
    : [];
  const pickerProducts = [
    ...products,
    ...saved
      .filter(
        (part) =>
          !products.some(
            (item) =>
              item.type === "SWEET" &&
              item.name === part.name &&
              item.packLabel === part.quantity,
          ),
      )
      .map((part, index) => ({
        id: `saved-${index}`,
        name: part.name,
        packLabel: part.quantity,
        price: 0,
        type: "SWEET" as const,
      })),
  ];
  const [parts, setParts] = useState<Part[]>(
    saved.map((part) => ({
      productId:
        pickerProducts.find(
          (item) =>
            item.type === "SWEET" &&
            item.name === part.name &&
            item.packLabel === part.quantity,
        )?.id || "",
      quantity: part.quantity,
    })) || [],
  );
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    if (action === "edit")
      await onSave({
        name: String(form.get("name")),
        packLabel: String(form.get("packLabel")),
        price: Number(form.get("price")),
        components:
          product.type === "COMBO"
            ? parts
                .filter((part) => part.productId)
                .map((part) => ({
                  name:
                    pickerProducts.find((item) => item.id === part.productId)
                      ?.name || "",
                  quantity:
                    pickerProducts.find((item) => item.id === part.productId)
                      ?.packLabel || "",
                }))
            : undefined,
      });
    else await onDelete();
  }
  return (
    <div className="modal">
      <form
        className={`modalbox action-dialog ${action === "edit" && product.type === "COMBO" ? "combo-edit-dialog" : ""}`}
        onSubmit={submit}
      >
        <div className="modalhead">
          <h3>
            {action === "edit"
              ? "Edit price-list item"
              : "Remove price-list item"}
          </h3>
          <button type="button" className="close" onClick={onClose}>
            ×
          </button>
        </div>
        {action === "edit" ? (
          <>
            <div className="form-grid">
              <label>
                Name
                <input required name="name" defaultValue={product.name} />
              </label>
              <label>
                Pack size
                <input
                  required
                  name="packLabel"
                  defaultValue={product.packLabel}
                />
              </label>
              <label>
                Price (₹)
                <input
                  required
                  min="1"
                  name="price"
                  type="number"
                  defaultValue={product.price}
                />
              </label>
            </div>
            {product.type === "COMBO" && (
              <div className="combo-panel edit-combo">
                <b>Combo contents</b>
                {parts.map((part, index) => (
                  <div className="combo-line" key={index}>
                    <ProductPicker
                      products={pickerProducts}
                      sweetsOnly
                      value={part.productId}
                      onChange={(productId) =>
                        setParts((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, productId } : item,
                          ),
                        )
                      }
                    />
                    <button
                      type="button"
                      className="secondary"
                      onClick={() =>
                        setParts((current) =>
                          current.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="secondary"
                  onClick={() =>
                    setParts((current) => [
                      ...current,
                      { productId: "", quantity: "" },
                    ])
                  }
                >
                  + Add sweet to combo
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="payment-info">
            Remove{" "}
            <b>
              {product.name} — {product.packLabel}
            </b>{" "}
            from the price list? Past orders will be preserved.
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
                ? "Remove item"
                : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
