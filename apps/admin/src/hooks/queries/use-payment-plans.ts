import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { API_ENDPOINTS, withQuery } from '@/lib/endpoints';
import type { ListParams, Paginated } from '@/types/site';
import type { BillingDetails } from '@/types/provisioning';
import type {
  CreatePlanInput,
  PlanDetail,
  PlanListRow,
  PlanQuote,
  PlanRequest,
  PlanSummary,
} from '@/types/payment-plans';

const plans = API_ENDPOINTS.admin.paymentPlans;

export function usePlanSummary() {
  return useQuery({ queryKey: ['plans', 'summary'], queryFn: () => apiFetch<PlanSummary>(plans.summary) });
}

export function usePlans(params: ListParams) {
  return useQuery({
    queryKey: ['plans', 'list', params],
    queryFn: () => apiFetch<Paginated<PlanListRow>>(withQuery(plans.list, params)),
    placeholderData: (previous) => previous,
  });
}

export function usePlanRequests(params: ListParams) {
  return useQuery({
    queryKey: ['plans', 'requests', params],
    queryFn: () => apiFetch<Paginated<PlanRequest>>(withQuery(plans.requests, params)),
    placeholderData: (previous) => previous,
  });
}

export function usePlan(id: string | undefined) {
  return useQuery({
    queryKey: ['plans', 'detail', id],
    queryFn: () => apiFetch<PlanDetail>(plans.detail(id!)),
    enabled: Boolean(id),
  });
}

export function usePlanQuote(appId: string | undefined) {
  return useQuery({
    queryKey: ['plans', 'quote', appId],
    queryFn: () => apiFetch<PlanQuote>(plans.quote(appId!)),
    enabled: Boolean(appId),
    staleTime: 60_000,
  });
}

function useInvalidatePlans() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['plans'] });
}

export function useCreatePlan() {
  const invalidate = useInvalidatePlans();
  return useMutation({
    mutationFn: (input: CreatePlanInput) =>
      apiFetch<PlanDetail>(plans.list, { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => {
      void invalidate();
      toast.success('Plan created');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateRequest() {
  const invalidate = useInvalidatePlans();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PlanRequest['status'] }) =>
      apiFetch<PlanRequest>(plans.request(id), { method: 'PATCH', body: JSON.stringify({ status }) }),
    onSuccess: () => void invalidate(),
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useSendPlanLink(id: string) {
  const invalidate = useInvalidatePlans();
  return useMutation({
    mutationFn: (via: 'email' | 'sms' | 'both' | 'none') =>
      apiFetch<{ link: string; delivered: { email: boolean; sms: boolean } }>(plans.send(id), {
        method: 'POST',
        body: JSON.stringify({ via }),
      }),
    onSuccess: () => void invalidate(),
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useRecordPlanPayment(id: string) {
  const invalidate = useInvalidatePlans();
  return useMutation({
    mutationFn: (input: { amount: number; method?: string; note?: string; billingDetails?: BillingDetails }) =>
      apiFetch<PlanDetail>(plans.payments(id), { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => {
      void invalidate();
      toast.success('Payment recorded');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function usePlanStatusAction(id: string) {
  const invalidate = useInvalidatePlans();
  return useMutation({
    mutationFn: (input: { action: 'suspend' | 'reinstate' | 'cancel'; reason?: string }) =>
      apiFetch<PlanDetail>(plans.status(id), { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: (_, input) => {
      void invalidate();
      toast.success({ suspend: 'Plan suspended', reinstate: 'Plan reinstated', cancel: 'Plan cancelled' }[input.action]);
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
