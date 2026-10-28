import { Product } from "../types/order";

type Props = {
  products: Product[];
  isAdmin: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

export function CatalogueTable({ products, isAdmin, onEdit, onDelete }: Props) {
  const sweets = products.filter((product) => product.type === "SWEET");
  const combos = products.filter((product) => product.type === "COMBO");

  function renderRows(items: Product[]) {
    return items.map((product) => (
      <tr key={product.id}>
        <td>
          <b>{product.name}</b>
        </td>
        <td>{product.packLabel}</td>
        <td>₹{product.price.toLocaleString("en-IN")}</td>
        {isAdmin && (
          <td>
            <div className="actions">
              <button className="secondary" onClick={() => onEdit(product)}>
                Edit
              </button>
              <button className="danger" onClick={() => onDelete(product)}>
                Delete
              </button>
            </div>
          </td>
        )}
      </tr>
    ));
  }

  return (
    <div className="catalogue-grid">
      <section className="table">
        <h2>Sweets</h2>
        <table>
          <thead>
            <tr>
              <th>Sweet</th>
              <th>Pack size</th>
              <th>Price</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>{renderRows(sweets)}</tbody>
        </table>
        {!sweets.length && (
          <p className="empty">No sweets in the price list.</p>
        )}
      </section>
      <section className="table">
        <h2>Combos</h2>
        <table>
          <thead>
            <tr>
              <th>Combo</th>
              <th>Pack size</th>
              <th>Price</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>{renderRows(combos)}</tbody>
        </table>
        {!combos.length && (
          <p className="empty">No combos in the price list.</p>
        )}
      </section>
    </div>
  );
}
