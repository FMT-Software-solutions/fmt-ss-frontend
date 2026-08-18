import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { API_ENDPOINTS, withQuery } from '@/lib/endpoints';
import type { ListParams, Paginated } from '@/types/site';
import type {
  AppSummaryResponse,
  AuditEntry,
  OrganizationDetail,
  OrganizationMember,
  OrganizationRow,
  ProductApp,
  RolesResponse,
} from '@/types/orgs';

const apps = API_ENDPOINTS.admin.apps;

/**
 * The registry describes what each product's schema supports and never
 * changes at runtime, so it is fetched once and reused by every page that
 * needs to branch on capabilities.
 */
export function useAppRegistry() {
  return useQuery({
    queryKey: ['apps', 'registry'],
    queryFn: () => apiFetch<ProductApp[]>(apps.registry),
    staleTime: Infinity,
  });
}

export function useAppSummary() {
  return useQuery({
    queryKey: ['apps', 'summary'],
    queryFn: () => apiFetch<AppSummaryResponse>(apps.summary),
  });
}

export function useAppOrganizations(appId: string | undefined, params: ListParams) {
  return useQuery({
    queryKey: ['apps', appId, 'organizations', params],
    queryFn: () =>
      apiFetch<Paginated<OrganizationRow>>(withQuery(apps.organizations(appId!), params)),
    enabled: Boolean(appId),
    placeholderData: (previous) => previous,
  });
}

export function useOrganizationDetail(appId: string | undefined, orgId: string | undefined) {
  return useQuery({
    queryKey: ['apps', appId, 'organizations', orgId, 'detail'],
    queryFn: () => apiFetch<OrganizationDetail>(apps.organization(appId!, orgId!)),
    enabled: Boolean(appId && orgId),
  });
}

export function useOrganizationUsers(appId: string | undefined, orgId: string | undefined) {
  return useQuery({
    queryKey: ['apps', appId, 'organizations', orgId, 'users'],
    queryFn: () =>
      apiFetch<{ data: OrganizationMember[]; meta: { total: number } }>(
        apps.organizationUsers(appId!, orgId!),
      ),
    enabled: Boolean(appId && orgId),
  });
}

export function useOrganizationRoles(
  appId: string | undefined,
  orgId: string | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: ['apps', appId, 'organizations', orgId, 'roles'],
    queryFn: () => apiFetch<RolesResponse>(apps.organizationRoles(appId!, orgId!)),
    enabled: Boolean(appId && orgId) && enabled,
  });
}

export function useAuditLog(appId?: string, organizationId?: string, limit = 10) {
  return useQuery({
    queryKey: ['audit', appId, organizationId, limit],
    queryFn: () =>
      apiFetch<{ data: AuditEntry[]; unavailable: boolean }>(
        withQuery(API_ENDPOINTS.admin.audit, { appId, organizationId, limit }),
      ),
    enabled: Boolean(appId && organizationId),
  });
}

/**
 * After any write, refresh the organization's detail, member list and audit
 * trail, plus the cross-app summary whose totals may have shifted.
 */
function useOrgMutation<TVariables>(
  appId: string | undefined,
  orgId: string | undefined,
  request: (variables: TVariables) => Promise<unknown>,
  successMessage: (variables: TVariables, result: unknown) => string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: request,
    onSuccess: (result, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['apps', appId, 'organizations', orgId] });
      void queryClient.invalidateQueries({ queryKey: ['apps', appId, 'organizations'] });
      void queryClient.invalidateQueries({ queryKey: ['apps', 'summary'] });
      void queryClient.invalidateQueries({ queryKey: ['audit'] });
      toast.success(successMessage(variables, result));
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useAdjustSmsCredits(appId: string | undefined, orgId: string | undefined) {
  return useOrgMutation<{ delta: number; reason: string }>(
    appId,
    orgId,
    (body) =>
      apiFetch<{ previous_balance: number; new_balance: number }>(
        apps.smsCredits(appId!, orgId!),
        { method: 'POST', body: JSON.stringify(body) },
      ),
    ({ delta }, result) => {
      const balance = (result as { new_balance?: number })?.new_balance;
      const verb = delta > 0 ? 'Granted' : 'Removed';
      return `${verb} ${Math.abs(delta)} credits${balance === undefined ? '' : ` · new balance ${balance}`}`;
    },
  );
}

export function useUpdateOrganization(appId: string | undefined, orgId: string | undefined) {
  return useOrgMutation<Record<string, unknown>>(
    appId,
    orgId,
    (body) => apiFetch(apps.organization(appId!, orgId!), {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
    () => 'Organization updated',
  );
}

export function useUpdateMember(appId: string | undefined, orgId: string | undefined) {
  return useOrgMutation<{ membershipId: string; is_active: boolean }>(
    appId,
    orgId,
    ({ membershipId, is_active }) =>
      apiFetch(apps.member(appId!, orgId!, membershipId), {
        method: 'PATCH',
        body: JSON.stringify({ is_active }),
      }),
    ({ is_active }) => (is_active ? 'Member activated' : 'Member deactivated'),
  );
}
