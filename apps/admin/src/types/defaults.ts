export type TemplateKind = 'branding' | 'roles' | 'organization_settings';

export interface DefaultTemplate {
  id: string;
  app_id: string;
  kind: TemplateKind;
  payload: Record<string, unknown>;
  notes: string | null;
  is_active: boolean;
  updated_by: string | null;
  updated_at: string;
}

export interface TemplatesResponse {
  templates: DefaultTemplate[];
  unavailable: boolean;
}

export interface DefaultsDifference {
  field: string;
  current: unknown;
  expected: unknown;
}

export interface DefaultsCheck {
  kind: TemplateKind;
  inSync: boolean;
  differences: DefaultsDifference[];
}

export interface DefaultsCheckResponse {
  unavailable: boolean;
  inSync: boolean;
  checks: DefaultsCheck[];
}

export interface ApplyDefaultsResponse {
  applied: string[];
  failures: { kind: string; error: string }[];
  success: boolean;
}

export const TEMPLATE_LABELS: Record<TemplateKind, string> = {
  branding: 'Branding',
  roles: 'Roles',
  organization_settings: 'Organization settings',
};

export const TEMPLATE_DESCRIPTIONS: Record<TemplateKind, string> = {
  branding: 'Brand colours, theme, logo and notification settings applied to new organizations.',
  roles: 'Roles and their permissions, seeded for apps with a dynamic role system.',
  organization_settings: 'Baseline settings such as currency and AI daily limit.',
};
