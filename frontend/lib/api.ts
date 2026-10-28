import { Order, Product } from "../types/order";
const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
export async function getOrders(): Promise<Order[]> {
  const response = await fetch(`${api}/orders`);
  if (!response.ok)
    throw new Error("Cannot reach the API. Start NestJS on port 4000.");
  return response.json();
}
export async function login(username: string, password: string) {
  const response = await fetch(`${api}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Login failed");
  return data as { token: string; expiresIn: string };
}

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${api}/products`);
  if (!response.ok) throw new Error("Could not load the price list.");
  return response.json();
}

export async function createProduct(
  token: string,
  product: {
    name: string;
    packLabel: string;
    price: number;
    type: "SWEET" | "COMBO";
    components?: { name: string; quantity: string }[];
  },
): Promise<Product> {
  const response = await fetch(`${api}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(product),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Could not create item.");
  return data;
}

export async function createOrder(
  token: string,
  order: {
    customerName: string;
    companyName?: string;
    notes?: string;
    orderDate: string;
    items: { productId: string; quantity: number; unitPrice: number }[];
  },
): Promise<Order> {
  const response = await fetch(`${api}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(order),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Could not create order.");
  return data;
}

async function protectedRequest(
  url: string,
  token: string,
  method: string,
  body?: unknown,
) {
  const response = await fetch(`${api}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Could not save changes.");
  return data;
}

export const updateOrder = (token: string, id: string, order: unknown) =>
  protectedRequest(`/orders/${id}`, token, "PATCH", order);
export const updateDelivery = (token: string, id: string, items: unknown) =>
  protectedRequest(`/orders/${id}/delivery`, token, "PATCH", { items });
export const addPayment = (token: string, id: string, amount: number) =>
  protectedRequest(`/orders/${id}/payments`, token, "POST", { amount });
export const deleteOrder = (token: string, id: string) =>
  protectedRequest(`/orders/${id}`, token, "DELETE");
export const updateProduct = (token: string, id: string, product: unknown) =>
  protectedRequest(`/products/${id}`, token, "PATCH", product);
export const deleteProduct = (token: string, id: string) =>
  protectedRequest(`/products/${id}`, token, "DELETE");
