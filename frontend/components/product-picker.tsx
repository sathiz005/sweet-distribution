"use client";
import { useMemo, useState } from "react";
import { Product } from "../types/order";
export function ProductPicker({
  products,
  value,
  onChange,
  sweetsOnly = false,
}: {
  products: Product[];
  value: string;
  onChange: (id: string) => void;
  sweetsOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const available = useMemo(
    () =>
      products.filter(
        (p) =>
          (!sweetsOnly || p.type === "SWEET") &&
          `${p.name} ${p.packLabel}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [products, query, sweetsOnly],
  );
  const selected = products.find((p) => p.id === value);
  return (
    <div className="picker">
      <button
        type="button"
        className="picker-trigger"
        onClick={() => setOpen(!open)}
      >
      {selected
        ? `${selected.name} — ${selected.packLabel}${selected.price ? ` (₹${selected.price})` : ""}`
          : "Choose an item"}
        <span>⌄</span>
      </button>
      {open && (
        <div className="picker-menu">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sweets…"
          />
          {available.map((product) => (
            <button
              type="button"
              key={product.id}
              onClick={() => {
                onChange(product.id);
                setOpen(false);
                setQuery("");
              }}
            >
              <b>{product.name}</b>
          <small>{product.packLabel}{product.price ? ` · ₹${product.price}` : ""}</small>
            </button>
          ))}
          {!available.length && <p>No items found.</p>}
        </div>
      )}
    </div>
  );
}
