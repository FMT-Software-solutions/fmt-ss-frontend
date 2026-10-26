import type { BillingDetails } from './provisioning';

export type PlanStatus = 'draft' | 'sent' | 'active' | 'suspended' | 'completed' | 'cancelled';
export type Frequency = 'weekly' | 'biweekly' | 'monthly';

export interface PlanRequest {
  id: string;
  app_id: string;
  app_title: string | null;
  contact: string;
  contact_type: 'email' | 'phone';
  name: string | null;
  organization_name: string | null;
  message: string | null;
  status: 'new' | 'planned' | 'declined';
  plan_id: string | null;
  created_at: string;
}

export interface PaymentPlan {
  id: string;
  request_id: string | null;
  app_id: string;
  app_title: string;
  contact: string;
  contact_type: 'email' | 'phone';
  customer_name: string | null;
  organization_name: string | null;
  billing_details: BillingDetails | null;
  organization_id: string | null;
  base_price: number;
  surcharge_percent: number;
  total_amount: number;
  amount_paid: number;
  grace_days: number;
  notes: string | null;
  status: PlanStatus;
  link_sent_at: string | null;
  accepted_at: string | null;
  activated_at: string | null;
  suspended_at: string | null;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
}

export interface PlanListRow extends PaymentPlan {
  balance: number;
  due_now: number;
  next_due_date: string | null;
  days_overdue: number;
}

export interface ScheduleRow {
  seq: number;
  due_date: string;
  amount: number;
  paid: number;
  status: 'paid' | 'partial' | 'due' | 'overdue' | 'upcoming';
}

export interface PlanPayment {
  id: string;
  reference: string;
  provider: 'paystack' | 'hubtel' | 'manual';
  amount: number;
  amount_paid: number | null;
  status: 'pending' | 'completed' | 'failed';
  method: string | null;
  recorded_by: string | null;
  details: { note?: string | null } | null;
  created_at: string;
  confirmed_at: string | null;
}

export interface PlanEvent {
  id: number;
  type: string;
  summary: string | null;
  actor: string | null;
  created_at: string;
}

export interface PlanDetail {
  plan: PaymentPlan & { link: string | null };
  position: {
    balance: number;
    dueNow: number;
    daysOverdue: number;
    overdueSince: string | null;
    next: { seq: number; due_date: string; amount: number; remaining: number } | null;
    rows: ScheduleRow[];
  };
  payments: PlanPayment[];
  events: PlanEvent[];
}

export interface PlanSummary {
  newRequests: number;
  active: number;
  overdue: number;
  outstanding: number;
  dueNow: number;
}

export interface CreatePlanInput {
  requestId?: string;
  appId: string;
  contact: string;
  customerName?: string;
  organizationName?: string;
  basePrice?: number;
  surchargePercent?: number;
  deposit: number;
  count: number;
  frequency: Frequency;
  graceDays?: number;
  notes?: string;
}

export interface PlanQuote {
  appId: string;
  title: string;
  listPrice: number;
  price: number;
}
