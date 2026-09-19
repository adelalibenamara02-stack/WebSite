export type OrderReceipt = {
  reference: string;
  total: number;
  customer_name: string;
  phone: string;
  wilaya: string;
  commune: string;
  address: string;
  items: { name: string; quantity: number; price: number }[];
};

const KEY = "mn.lastOrder.v1";

export function saveReceipt(receipt: OrderReceipt) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(receipt));
  } catch {
    /* storage unavailable */
  }
}

export function readReceipt(): OrderReceipt | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as OrderReceipt) : null;
  } catch {
    return null;
  }
}
