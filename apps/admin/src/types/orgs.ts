export interface AppCapabilities {
  hasDynamicRoles: boolean;
  hasSubApps: boolean;
  hasWelcomeCredits: boolean;
  hasSmsDeliveryTracking: boolean;
  hasAiDailyLimit: boolean;
  hasServiceCatalog: boolean;
  staticRoles?: string[];
  membershipOverrideColumn?: string;
  membershipFlags?: string[];
}

export interface ProductApp {
  id: string;
  name: string;
  slug: string;
  description: string;
  capabilities: AppCapabilities;
  configured: boolean;
}

export interface AppSummary {
  appId: string;
  name: string;
  configured: boolean;
  organizations?: number;
  activeOrganizations?: number;
  users?: number;
  smsCredits?: number;
}

export interface AppSummaryResponse {
  data: AppSummary[];
  errors: Record<string, string>;
}

export interface OrganizationRow {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  is_active: boolean | null;
  has_purchased: boolean | null;
  trial_end_date: string | null;
  currency: string | null;
  created_at: string | null;
  smsCredits: number;
  memberCount: number;
}

export interface OrganizationDetail {
  organization: Record<string, unknown> & {
    id: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    logo?: string | null;
    currency?: string | null;
    theme_name?: string | null;
    is_active?: boolean | null;
    has_purchased?: boolean | null;
    trial_end_date?: string | null;
    sms_sender_id?: string | null;
    ai_daily_limit?: number | null;
    brand_colors?: unknown;
    created_at?: string | null;
  };
  branches: {
    id: string;
    name: string | null;
    location: string | null;
    contact: string | null;
    is_active: boolean | null;
    created_at: string | null;
  }[];
  smsBalance: { credit_balance: number; bonus_credits_received: number | null } | null;
  recentSmsTransactions: {
    id: string;
    type: string;
    amount: number;
    description: string | null;
    created_at: string | null;
  }[];
  subApps: {
    id: string;
    app_id: string;
    name: string | null;
    description: string | null;
    settings: unknown;
    access_levels: unknown;
    created_at: string | null;
  }[];
  capabilities: AppCapabilities;
}

export interface OrganizationMember {
  id: string;
  userId: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: string | null;
  roleName: string | null;
  roleType: string | null;
  isActive: boolean | null;
  createdAt: string | null;
  overrides: unknown;
  flags: Record<string, boolean | null>;
}

export interface OrganizationRole {
  id: string;
  name: string;
  type: string | null;
  description: string | null;
  permissions: unknown;
  created_at: string | null;
}

export interface AuditEntry {
  id: number;
  actor_email: string | null;
  action: string;
  app_id: string | null;
  organization_id: string | null;
  target_id: string | null;
  summary: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export interface RolesResponse {
  dynamic: boolean;
  staticRoles: string[];
  data: OrganizationRole[];
}
