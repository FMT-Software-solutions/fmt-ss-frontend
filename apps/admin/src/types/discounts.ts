export interface DiscountCode {
  id: string;
  code: string;
  description: string | null;
  value_type: 'percent' | 'fixed';
  value: number;
  app_ids: string[];
  min_total: number | null;
  max_discount: number | null;
  starts_at: string | null;
  ends_at: string | null;
  max_uses: number | null;
  per_customer_limit: number;
  first_purchase_only: boolean;
  is_active: boolean;
  created_at: string;
  uses: number;
  total_discounted: number;
}

export interface DiscountCodeInput {
  code: string;
  description?: string;
  valueType: 'percent' | 'fixed';
  value: number;
  appIds?: string[];
  minTotal?: number | null;
  maxDiscount?: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
  maxUses?: number | null;
  perCustomerLimit?: number;
  firstPurchaseOnly?: boolean;
  isActive?: boolean;
}
