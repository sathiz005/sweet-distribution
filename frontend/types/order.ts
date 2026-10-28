export type OrderItem = {
  id: string;
  quantity: number;
  delivered: number;
  unitPrice: number;
  product: {
    name: string;
    packLabel?: string;
    type?: "SWEET" | "COMBO";
    components?: unknown;
  };
};
export type Payment = { id: string; amount: number };
export type Product = {
  id: string;
  name: string;
  packLabel: string;
  price: number;
  type: "SWEET" | "COMBO";
  components?: unknown;
};
export type Order = {
  id: string;
  customerName: string;
  companyName?: string;
  orderDate?: string;
  notes?: string;
  items: OrderItem[];
  payments: Payment[];
};
