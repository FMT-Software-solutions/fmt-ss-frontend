export interface MainBalance {
  smsBalance: number | null;
  cashBalance: string | null;
  threshold: number;
  low: boolean;
  available: boolean;
  error?: string;
}

export interface SmsAppBreakdown {
  appId: string;
  appName: string;
  configured: boolean;
  organizations: number;
  credits: number;
  lowBalanceOrganizations: number;
}

export interface SmsOverview {
  mainBalance: MainBalance;
  totalOrgCredits: number;
  /** Credits that could not be delivered with the current Arkesel balance. */
  shortfall: number | null;
  coverage: number | null;
  lowBalanceOrganizations: number;
  threshold: number;
  byApp: SmsAppBreakdown[];
  errors: Record<string, string>;
}

export interface OrgBalance {
  appId: string;
  appName: string;
  organizationId: string;
  organizationName: string | null;
  organizationEmail: string | null;
  organizationPhone: string | null;
  creditBalance: number;
  bonusCreditsReceived: number;
  isActive: boolean | null;
  belowThreshold: boolean;
}

export interface SmsTransaction {
  id: string;
  appId: string;
  appName: string;
  organization_id: string;
  type: string;
  amount: number;
  description: string | null;
  created_at: string | null;
}

export interface UsagePoint {
  date: string;
  used: number;
  purchased: number;
  bonus: number;
}

export interface SmsUsage {
  from: string;
  to: string;
  series: UsagePoint[];
  totals: { used: number; purchased: number; bonus: number };
  byApp: { appId: string; appName: string; used: number }[];
}

export interface AlertCandidate extends OrgBalance {
  contactable: boolean;
  inCooldown: boolean;
  wouldAlert: boolean;
}

export interface AlertDryRun {
  threshold: number;
  cooldownHours: number;
  alertsUnavailable: boolean;
  errors: Record<string, string>;
  candidates: AlertCandidate[];
}
