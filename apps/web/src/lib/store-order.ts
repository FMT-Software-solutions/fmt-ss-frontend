import { API_BASE_URL } from "./endpoints";

/**
 * Website orders. The server prices the order and issues the payment
 * reference; the browser only pays it and then asks how it went.
 */

export type StoreProvider = "paystack" | "hubtel";

export interface StoreBillingDetails {
  organizationName: string;
  organizationEmail: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
}

export type CreatedOrder =
  | { provider: "paystack"; reference: string; amount: number; currency: "GHS"; email: string }
  | { provider: "hubtel"; reference: string; amount: number; currency: "GHS"; checkoutUrl: string };

export interface StoreOrderStatus {
  reference: string;
  status: "pending" | "completed" | "underpaid" | "failed";
  amount: number;
  items: Array<{ productId: string; title?: string; slug?: string }>;
}

async function readJson<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = Array.isArray(body?.message) ? body.message[0] : body?.message;
    throw Object.assign(new Error(message || "Something went wrong. Please try again."), { status: response.status });
  }
  return body as T;
}

export interface StoreQuote {
  subtotal: number;
  total: number;
  discount: { code: string; amount: number; description: string | null } | null;
}

/** Server price for the summary; throws with the reason if the code is rejected. */
export async function quoteStoreOrder(input: { productIds: string[]; discountCode?: string; email?: string }) {
  const response = await fetch(`${API_BASE_URL}/payments/orders/quote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return readJson<StoreQuote>(response);
}

export async function createStoreOrder(input: {
  productIds: string[];
  billingDetails: StoreBillingDetails;
  provider: StoreProvider;
  discountCode?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/payments/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return readJson<CreatedOrder>(response);
}

export async function getStoreOrder(reference: string) {
  const response = await fetch(`${API_BASE_URL}/payments/orders/${encodeURIComponent(reference)}`);
  return readJson<StoreOrderStatus>(response);
}

/** Ghana numbers only: 0XXXXXXXXX, XXXXXXXXX or 233XXXXXXXXX. */
export function normalizeGhanaPhone(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 9) return `+233${digits}`;
  if (digits.length === 10 && digits.startsWith("0")) return `+233${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith("233")) return `+${digits}`;
  return null;
}
