export interface ProvisionableApp {
  productId: string;
  title: string;
  price: number;
  provisioningReady: boolean;
  /** Registered product app id, when this Sanity product maps to one. */
  appId: string | null;
  appName: string | null;
}

export interface BillingDetails {
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

export interface PreflightApp {
  productId: string;
  title: string | null;
  provisioningReady: boolean;
  appId: string | null;
  appName: string | null;
  entitlement: { app_id: string; status: string; plan_type: string | null } | null;
  existingInProductApp: { id: string; name: string | null } | null;
  existingUserInProductApp: { id: string; name: string | null } | null;
}

export interface PreflightResult {
  organization: { id: string; name: string | null; email: string | null; phone: string | null } | null;
  apps: PreflightApp[];
}

export interface ProvisioningRunResult {
  success: boolean;
  results: { productId: string; message?: string }[];
  errors: { productId: string; error?: string }[];
  summary: { total: number; successful: number; failed: number };
}

export interface ManualPurchase {
  id: string;
  client_reference: string | null;
  payment_reference: string;
  amount: number;
  status: string;
  items: { productId?: string; title?: string; name?: string; price?: number }[] | null;
  created_at: string | null;
  confirmation_email_details: unknown;
  organizations?: { id: string; name: string | null; email: string | null } | null;
}
