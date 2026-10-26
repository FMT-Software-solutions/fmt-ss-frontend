import { API_BASE_URL } from "./endpoints";
import type { StoreBillingDetails } from "./store-order";

/**
 * Customer side of payment plans. The link token finds the plan; a one-time
 * code sent to the customer's email or phone unlocks a short session, kept in
 * sessionStorage for this tab only.
 */

export interface PlanScheduleRow {
  seq: number;
  due_date: string;
  amount: number;
  paid: number;
  status: "paid" | "partial" | "due" | "overdue" | "upcoming";
}

export interface CustomerPlan {
  appTitle: string;
  customerName: string | null;
  organizationName: string | null;
  status: "sent" | "active" | "suspended" | "completed";
  accepted: boolean;
  billingDetails: StoreBillingDetails | null;
  contactType: "email" | "phone";
  contact: string;
  total: number;
  basePrice: number;
  surchargePercent: number;
  amountPaid: number;
  graceDays: number;
  deposit: number;
  balance: number;
  dueNow: number;
  daysOverdue: number;
  next: { seq: number; due_date: string; amount: number; remaining: number } | null;
  schedule: PlanScheduleRow[];
  minimum: number;
  suggested: number;
  payments: Array<{ reference: string; amount_paid: number; method: string | null; provider: string; confirmed_at: string }>;
}

export type PlanPaymentStart =
  | { provider: "paystack"; reference: string; amount: number; currency: "GHS"; email: string }
  | { provider: "hubtel"; reference: string; amount: number; currency: "GHS"; checkoutUrl: string };

export class PlanApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const sessionKey = (token: string) => `fmt-plan-session:${token}`;

export const planSession = {
  get(token: string) {
    try {
      return sessionStorage.getItem(sessionKey(token));
    } catch {
      return null;
    }
  },
  set(token: string, session: string) {
    try {
      sessionStorage.setItem(sessionKey(token), session);
    } catch {
      /* private mode: the session just won't survive a reload */
    }
  },
  clear(token: string) {
    try {
      sessionStorage.removeItem(sessionKey(token));
    } catch {
      /* ignore */
    }
  },
};

async function call<T>(path: string, init: RequestInit & { session?: string | null } = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (init.session) headers.set("x-plan-session", init.session);
  const response = await fetch(`${API_BASE_URL}/payment-plans/${path}`, { ...init, headers });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = Array.isArray(body?.message) ? body.message[0] : body?.message;
    throw new PlanApiError(message || "Something went wrong. Please try again.", response.status);
  }
  return body as T;
}

const link = (token: string) => `link/${encodeURIComponent(token)}`;

export const planApi = {
  request: (input: { appId: string; contact: string; name?: string; organizationName?: string; message?: string }) =>
    call<{ received: boolean }>("requests", { method: "POST", body: JSON.stringify(input) }),
  summary: (token: string) =>
    call<{ appTitle: string; contactType: "email" | "phone"; maskedContact: string }>(link(token)),
  sendCode: (token: string) => call<{ sent: boolean; maskedContact: string }>(`${link(token)}/code`, { method: "POST" }),
  verify: (token: string, code: string) =>
    call<{ session: string; expiresAt: string }>(`${link(token)}/verify`, { method: "POST", body: JSON.stringify({ code }) }),
  plan: (token: string, session: string | null) => call<CustomerPlan>(`${link(token)}/plan`, { session }),
  accept: (token: string, session: string | null, billingDetails: StoreBillingDetails) =>
    call<CustomerPlan>(`${link(token)}/accept`, { method: "POST", session, body: JSON.stringify({ billingDetails }) }),
  pay: (token: string, session: string | null, amount: number, provider: "paystack" | "hubtel") =>
    call<PlanPaymentStart>(`${link(token)}/pay`, { method: "POST", session, body: JSON.stringify({ amount, provider }) }),
  payment: (reference: string) =>
    call<{ reference: string; status: "pending" | "completed" | "failed"; amount: number; amountPaid: number | null; planStatus: string }>(
      `payments/${encodeURIComponent(reference)}`,
    ),
};
