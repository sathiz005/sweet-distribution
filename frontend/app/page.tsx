"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { CatalogueTable } from "../components/catalogue-table";
import { AnalysisDialog } from "../components/analysis-dialog";
import { CreateOrderDialog } from "../components/create-order-dialog";
import { CreateProductDialog } from "../components/create-product-dialog";
import { OrderTable } from "../components/orders-table";
import { OrderActionDialog } from "../components/order-action-dialog";
import { ProductActionDialog } from "../components/product-action-dialog";
import { StatCard } from "../components/stat-card";
import {
  createOrder,
  createProduct,
  deleteOrder,
  deleteProduct,
  getOrders,
  getProducts,
  login,
  addPayment,
  updateDelivery,
  updateOrder,
  updateProduct,
} from "../lib/api";
import { Order, Product } from "../types/order";
const tabs = ["orders", "distribution", "payments", "completed", "catalogue"];
export default function Home() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tab, setTab] = useState("orders");
  const [loginOpen, setLoginOpen] = useState(false);
  const [createOrderOpen, setCreateOrderOpen] = useState(false);
  const [createProductOpen, setCreateProductOpen] = useState(false);
  const [analysis, setAnalysis] = useState<"required" | "completed" | null>(
    null,
  );
  const [orderAction, setOrderAction] = useState<{
    order: Order;
    type: "edit" | "delivery" | "payment" | "delete";
  } | null>(null);
  const [productAction, setProductAction] = useState<{
    product: Product;
    type: "edit" | "delete";
  } | null>(null);
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setToken(window.localStorage.getItem("venkateswari-admin-token") || "");
    Promise.all([getOrders(), getProducts()])
      .then(([nextOrders, nextProducts]) => {
        setOrders(nextOrders);
        setProducts(nextProducts);
      })
      .catch((error) => setMessage(error.message));
  }, []);
  useEffect(() => {
    if (!message) return;
    const timeout = window.setTimeout(() => setMessage(""), 3000);
    return () => window.clearTimeout(timeout);
  }, [message]);
  const summary = useMemo(
    () =>
      orders.reduce(
        (result, order) => {
          const total = order.items.reduce(
              (sum, item) => sum + item.unitPrice * item.quantity,
              0,
            ),
            paid = order.payments.reduce(
              (sum, payment) => sum + payment.amount,
              0,
            ),
            completed =
              order.items.every((item) => item.delivered >= item.quantity) &&
              paid >= total;
          result.total += total;
          result.paid += paid;
          result.due += total - paid;
          if (completed) result.completed += total;
          return result;
        },
        { total: 0, paid: 0, due: 0, completed: 0 },
      ),
    [orders],
  );
  const openOrders = orders.filter((order) =>
    order.items.some((item) => item.delivered < item.quantity),
  ).length;
  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const session = await login(
        String(form.get("username")),
        String(form.get("password")),
      );
      setToken(session.token);
      window.localStorage.setItem("venkateswari-admin-token", session.token);
      setLoginOpen(false);
      setMessage("Administrator access enabled for this browser.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login failed");
    }
  }
  function handleLogout() {
    window.localStorage.removeItem("venkateswari-admin-token");
    setToken("");
    setMessage("Logged out. View-only mode is active.");
  }

  async function handleCreateOrder(order: {
    customerName: string;
    companyName?: string;
    notes?: string;
    orderDate: string;
    items: { productId: string; quantity: number; unitPrice: number }[];
  }) {
    const createdOrder = await createOrder(token, order);
    setOrders((current) => [createdOrder, ...current]);
    setCreateOrderOpen(false);
    setMessage("Order created successfully.");
  }

  async function handleCreateProduct(product: {
    name: string;
    packLabel: string;
    price: number;
    type: "SWEET" | "COMBO";
    components?: { name: string; quantity: string }[];
  }) {
    const createdProduct = await createProduct(token, product);
    setProducts((current) =>
      [...current, createdProduct].sort((first, second) =>
        first.name.localeCompare(second.name),
      ),
    );
    setCreateProductOpen(false);
    setMessage("Price-list item added successfully.");
  }

  async function refreshOrders(message: string) {
    setOrders(await getOrders());
    setMessage(message);
  }

  function handleOrderEdit(order: Order) {
    setOrderAction({ order, type: "edit" });
  }
  function handleDelivery(order: Order) {
    setOrderAction({ order, type: "delivery" });
  }
  function handlePayment(order: Order) {
    setOrderAction({ order, type: "payment" });
  }
  function handleOrderDelete(order: Order) {
    setOrderAction({ order, type: "delete" });
  }

  function handleProductEdit(product: Product) {
    setProductAction({ product, type: "edit" });
  }
  function handleProductDelete(product: Product) {
    setProductAction({ product, type: "delete" });
  }
  return (
    <main>
      <header className="top">
        <div className="brand">
          <div className="mark">✦</div>
          <div>
            <h1>Venkateswari Sweets</h1>
            <small>Order Book</small>
          </div>
        </div>
        <span className="today">
          {new Intl.DateTimeFormat("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          }).format(new Date())}
        </span>
        <button
          className="login-button"
          onClick={() => (token ? handleLogout() : setLoginOpen(true))}
        >
          {token ? "Log out" : "Login"}
        </button>
      </header>
      <nav className="nav">
        {tabs.map((name) => (
          <button
            className={tab === name ? "active" : ""}
            onClick={() => setTab(name)}
            key={name}
          >
            {name}
          </button>
        ))}
      </nav>
      <section className="content">
        <div className="hero">
          <div>
            <h1>
              {tab === "orders"
                ? "Orders at a glance"
                : tab[0].toUpperCase() + tab.slice(1)}
            </h1>
            <p>
              {token
                ? "Administrator access is active."
                : "View-only mode. Login to make changes."}
            </p>
          </div>
          {tab === "orders" && (
            <div className="header-actions">
              <button
                className="analysis-btn"
                onClick={() => setAnalysis("required")}
              >
                Required analysis
              </button>
              {token && (
                <button
                  className="primary"
                  onClick={() => setCreateOrderOpen(true)}
                >
                  + Create new order
                </button>
              )}
            </div>
          )}
          {tab === "completed" && (
            <div className="header-actions">
              <button
                className="analysis-btn"
                onClick={() => setAnalysis("completed")}
              >
                Completed analysis
              </button>
              <div className="completed-total">
                <small>COMPLETED SALES TOTAL</small>
                <strong>₹{summary.completed.toLocaleString("en-IN")}</strong>
              </div>
            </div>
          )}
          {token && tab === "catalogue" && (
            <button
              className="primary"
              onClick={() => setCreateProductOpen(true)}
            >
              + Add sweet or combo
            </button>
          )}
        </div>
        {tab === "orders" && (
          <div className="stats">
            <StatCard
              label="Total orders"
              value={orders.length}
              currency={false}
              note={`${openOrders} still in fulfilment`}
            />
            <StatCard
              label="Order value"
              value={summary.total}
              note="All recorded orders"
            />
            <StatCard
              label="Amount received"
              value={summary.paid}
              note="Payments collected"
            />
            <StatCard
              label="Amount due"
              value={summary.due}
              note="Needs follow-up"
              due
            />
          </div>
        )}
        {tab === "catalogue" ? (
          <CatalogueTable
            products={products}
            isAdmin={Boolean(token)}
            onEdit={handleProductEdit}
            onDelete={handleProductDelete}
          />
        ) : (
          <>
            <div className="section-title">
              <h3>
                {tab === "orders"
                  ? "All orders"
                  : tab === "distribution"
                    ? "Distribution waiting"
                    : tab === "payments"
                      ? "Payments due"
                      : "Completed orders"}
              </h3>
              <span>
                {tab === "orders" &&
                  `${orders.length} order${orders.length === 1 ? "" : "s"}`}
              </span>
            </div>
            <OrderTable
              orders={orders}
              tab={tab}
              isAdmin={Boolean(token)}
              onEdit={handleOrderEdit}
              onDeliver={handleDelivery}
              onPayment={handlePayment}
              onDelete={handleOrderDelete}
            />
          </>
        )}
      </section>
      {loginOpen && (
        <div className="modal">
          <form onSubmit={handleLogin}>
            <button
              type="button"
              className="x"
              onClick={() => setLoginOpen(false)}
            >
              ×
            </button>
            <h2>Administrator login</h2>
            <p>Only the shop owner can change records.</p>
            <input required name="username" placeholder="Username" />
            <input
              required
              name="password"
              type="password"
              placeholder="Password"
            />
            <button className="primary">Login</button>
          </form>
        </div>
      )}
      {createOrderOpen && (
        <CreateOrderDialog
          products={products}
          onClose={() => setCreateOrderOpen(false)}
          onCreate={handleCreateOrder}
        />
      )}
      {createProductOpen && (
        <CreateProductDialog
          products={products}
          onClose={() => setCreateProductOpen(false)}
          onCreate={handleCreateProduct}
        />
      )}
      {analysis && (
        <AnalysisDialog
          orders={orders}
          completed={analysis === "completed"}
          onClose={() => setAnalysis(null)}
        />
      )}
      {orderAction && (
        <OrderActionDialog
          order={orderAction.order}
          action={orderAction.type}
          onClose={() => setOrderAction(null)}
          onEdit={async (data) => {
            await updateOrder(token, orderAction.order.id, data);
            setOrderAction(null);
            await refreshOrders("Order details updated.");
          }}
          onDelivery={async (items) => {
            await updateDelivery(token, orderAction.order.id, items);
            setOrderAction(null);
            await refreshOrders("Delivery quantities updated.");
          }}
          onPayment={async (amount) => {
            await addPayment(token, orderAction.order.id, amount);
            setOrderAction(null);
            await refreshOrders("Payment recorded.");
          }}
          onDelete={async () => {
            await deleteOrder(token, orderAction.order.id);
            setOrderAction(null);
            await refreshOrders("Order deleted.");
          }}
        />
      )}
      {productAction && (
        <ProductActionDialog
          product={productAction.product}
          products={products}
          action={productAction.type}
          onClose={() => setProductAction(null)}
          onSave={async (data) => {
            const updated = await updateProduct(
              token,
              productAction.product.id,
              { ...productAction.product, ...data },
            );
            setProducts((current) =>
              current.map((item) => (item.id === updated.id ? updated : item)),
            );
            setProductAction(null);
            setMessage("Price-list item updated.");
          }}
          onDelete={async () => {
            await deleteProduct(token, productAction.product.id);
            setProducts((current) =>
              current.filter((item) => item.id !== productAction.product.id),
            );
            setProductAction(null);
            setMessage("Price-list item removed.");
          }}
        />
      )}
      {message && (
        <div className="toast" role="status">
          {message}
        </div>
      )}
    </main>
  );
}
