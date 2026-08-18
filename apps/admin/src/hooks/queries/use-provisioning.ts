import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { API_ENDPOINTS, withQuery } from '@/lib/endpoints';
import type { ListParams, Paginated } from '@/types/site';
import type {
  BillingDetails,
  ManualPurchase,
  PreflightResult,
  ProvisionableApp,
  ProvisioningRunResult,
} from '@/types/provisioning';

const provisioning = API_ENDPOINTS.admin.provisioning;

export function useProvisionableApps() {
  return useQuery({
    queryKey: ['provisioning', 'apps'],
    queryFn: () => apiFetch<ProvisionableApp[]>(provisioning.apps),
    staleTime: 5 * 60 * 1000,
  });
}

export function useProvisioningHistory(params: ListParams) {
  return useQuery({
    queryKey: ['provisioning', 'history', params],
    queryFn: () => apiFetch<Paginated<ManualPurchase>>(withQuery(provisioning.history, params)),
    placeholderData: (previous) => previous,
  });
}

export function usePreflight() {
  return useMutation({
    mutationFn: (body: { email: string; ownerEmail?: string; productIds: string[] }) =>
      apiFetch<PreflightResult>(provisioning.preflight, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useCreateProvisioningPurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: {
      billingDetails: BillingDetails;
      items: { productId: string; quantity: number; price?: number; title?: string }[];
      total: number;
      isExistingOrg?: boolean;
      note?: string;
    }) =>
      apiFetch<{ organizationId: string; purchase: { id: string }; clientReference: string }>(
        provisioning.purchase,
        { method: 'POST', body: JSON.stringify(body) },
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['provisioning', 'history'] });
      void queryClient.invalidateQueries({ queryKey: ['audit'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useRunProvisioning() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: {
      organizationId: string;
      purchaseId?: string;
      billingDetails: BillingDetails;
      apps: { productId: string; userEmail?: string }[];
      mode?: 'buy' | 'trial' | 'free';
    }) =>
      apiFetch<ProvisioningRunResult>(provisioning.run, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['provisioning'] });
      void queryClient.invalidateQueries({ queryKey: ['apps'] });
      void queryClient.invalidateQueries({ queryKey: ['audit'] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useSendConfirmationEmail() {
  return useMutation({
    mutationFn: (body: {
      organizationDetails: BillingDetails;
      items: { productId: string; quantity: number; price?: number; title?: string }[];
      total: number;
    }) =>
      apiFetch<{ success: boolean }>(provisioning.confirmationEmail, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: () => toast.success('Confirmation email sent'),
    onError: (error: Error) => toast.error(error.message),
  });
}
