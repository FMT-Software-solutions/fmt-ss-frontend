import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { API_BASE_URL } from '@/lib/endpoints';
import type {
  AlertDryRun,
  OrgBalance,
  SmsOverview,
  SmsTransaction,
  SmsUsage,
} from '@/types/sms';

const sms = `${API_BASE_URL}/admin/sms`;

export function useSmsOverview() {
  return useQuery({
    queryKey: ['sms', 'overview'],
    queryFn: () => apiFetch<SmsOverview>(`${sms}/overview`),
    // The Arkesel call is a live network hop; don't hammer it on every render.
    staleTime: 60 * 1000,
  });
}

export function useSmsBalances() {
  return useQuery({
    queryKey: ['sms', 'balances'],
    queryFn: () =>
      apiFetch<{ rows: OrgBalance[]; errors: Record<string, string> }>(`${sms}/balances`),
  });
}

export function useSmsUsage(appId?: string) {
  return useQuery({
    queryKey: ['sms', 'usage', appId],
    queryFn: () =>
      apiFetch<SmsUsage>(appId ? `${sms}/usage?appId=${appId}` : `${sms}/usage`),
  });
}

export function useSmsTransactions(limit = 15) {
  return useQuery({
    queryKey: ['sms', 'transactions', limit],
    queryFn: () => apiFetch<SmsTransaction[]>(`${sms}/transactions?limit=${limit}`),
  });
}

export function useAlertDryRun() {
  return useQuery({
    queryKey: ['sms', 'alerts', 'dry-run'],
    queryFn: () => apiFetch<AlertDryRun>(`${sms}/alerts/dry-run`),
  });
}

export function useSendLowBalanceAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { appId: string; organizationId: string }) =>
      apiFetch<{ success: boolean; credits: number; recipient: string }>(`${sms}/alerts/send`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ['sms'] });
      void queryClient.invalidateQueries({ queryKey: ['audit'] });
      toast.success(`Alert sent to ${result.recipient}`);
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
