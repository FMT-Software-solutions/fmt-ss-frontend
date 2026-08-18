export interface Paginated<T> {
  data: T[];
  meta: { page: number; limit: number; total: number };
}

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  status?: string;
  from?: string;
  to?: string;
}

export interface Message {
  id: string;
  name: string | null;
  email: string | null;
  message: string | null;
  status: string | null;
  read_at: string | null;
  archived_at: string | null;
  created_at: string;
}

export interface Quote {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  contact_number_1: string;
  contact_number_2: string | null;
  company: string | null;
  service_type: string;
  budget: string;
  description: string;
  status: string;
  created_at: string;
}

export interface PurchaseOrganization {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
}

export interface PurchaseItem {
  productId?: string;
  name?: string;
  title?: string;
  price?: number;
  quantity?: number;
  [key: string]: unknown;
}

export interface Purchase {
  id: string;
  amount: number;
  status: string;
  items: PurchaseItem[] | null;
  payment_reference: string;
  client_reference: string | null;
  external_transaction_id: string | null;
  payment_provider: string | null;
  payment_method: string | null;
  payment_details: Record<string, unknown> | null;
  organization_id: string;
  organizations?: PurchaseOrganization | null;
  created_at: string | null;
}

export interface Review {
  id: string;
  type: string;
  app_id: string | null;
  rating: number;
  content: string;
  name: string;
  email: string;
  company: string | null;
  position: string | null;
  status: string;
  is_featured: boolean;
  created_at: string;
}

export interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string | null;
  created_at: string | null;
}

export interface TrainingRegistration {
  id: string;
  kind: 'standard' | 'custom';
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string | null;
  training_slug: string;
  training_id: string;
  status: string;
  message: string | null;
  payment_method: string | null;
  details: Record<string, unknown> | null;
  created_at: string | null;
}

export interface Issue {
  id: string;
  issue_type: string;
  category: string;
  severity: string;
  title: string;
  description: string | null;
  error_message: string | null;
  stack_trace: string | null;
  component: string | null;
  url: string | null;
  status: string | null;
  resolution_notes: string | null;
  resolved_at: string | null;
  created_at: string | null;
}

export interface SiteStats {
  unreadMessages: number;
  pendingQuotes: number;
  pendingReviews: number;
  subscribers: number;
  openIssues: number;
  revenue30d: number;
  purchases30d: number;
}
