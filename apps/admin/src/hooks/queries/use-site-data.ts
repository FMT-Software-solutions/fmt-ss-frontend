import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { API_ENDPOINTS, withQuery } from '@/lib/endpoints';
import type {
  Issue,
  ListParams,
  Message,
  Paginated,
  Purchase,
  Quote,
  Review,
  SiteStats,
  Subscriber,
  TrainingRegistration,
} from '@/types/site';

const site = API_ENDPOINTS.admin.site;

/** Every list query keys off the same shape so mutations can invalidate a whole resource. */
const keys = {
  stats: ['site', 'stats'] as const,
  list: (resource: string, params: object) => ['site', resource, params] as const,
  resource: (resource: string) => ['site', resource] as const,
};

export function useSiteStats() {
  return useQuery({
    queryKey: keys.stats,
    queryFn: () => apiFetch<SiteStats>(site.stats),
  });
}

function useListQuery<T>(resource: string, url: string, params: ListParams) {
  return useQuery({
    queryKey: keys.list(resource, params),
    queryFn: () => apiFetch<Paginated<T>>(withQuery(url, params)),
    placeholderData: (previous) => previous,
  });
}

export const useMessages = (params: ListParams & { state?: string }) =>
  useListQuery<Message>('messages', site.messages, params);

export const useQuotes = (params: ListParams) =>
  useListQuery<Quote>('quotes', site.quotes, params);

export const usePurchases = (params: ListParams & { provider?: string }) =>
  useListQuery<Purchase>('purchases', site.purchases, params);

export const useReviews = (params: ListParams & { featured?: string; type?: string }) =>
  useListQuery<Review>('reviews', site.reviews, params);

export const useSubscribers = (params: ListParams) =>
  useListQuery<Subscriber>('newsletter', site.newsletter, params);

export const useTrainingRegistrations = (params: ListParams) =>
  useListQuery<TrainingRegistration>('training', site.trainingRegistrations, params);

export const useIssues = (params: ListParams) =>
  useListQuery<Issue>('issues', site.issues, params);

export function usePurchaseDetail(id: string | null) {
  return useQuery({
    queryKey: ['site', 'purchases', 'detail', id],
    queryFn: () => apiFetch<Purchase>(`${site.purchases}/${id}`),
    enabled: Boolean(id),
  });
}

/**
 * Mutations refresh both their own resource and the dashboard counters, since
 * moderating or reading an item changes those numbers.
 */
function useResourceMutation<TVariables>(
  resource: string,
  request: (variables: TVariables) => Promise<unknown>,
  successMessage: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: request,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: keys.resource(resource) });
      void queryClient.invalidateQueries({ queryKey: keys.stats });
      toast.success(successMessage);
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export const useUpdateMessage = () =>
  useResourceMutation<{ id: string; read?: boolean; archived?: boolean }>(
    'messages',
    ({ id, ...body }) =>
      apiFetch(`${site.messages}/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    'Message updated',
  );

export const useUpdateQuote = () =>
  useResourceMutation<{ id: string; status: string }>(
    'quotes',
    ({ id, status }) =>
      apiFetch(`${site.quotes}/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    'Quote updated',
  );

export const useUpdateReview = () =>
  useResourceMutation<{ id: string; status?: string; is_featured?: boolean }>(
    'reviews',
    ({ id, ...body }) =>
      apiFetch(`${site.reviews}/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    'Review updated',
  );

export const useUpdateIssue = () =>
  useResourceMutation<{ id: string; status?: string; resolution_notes?: string }>(
    'issues',
    ({ id, ...body }) =>
      apiFetch(`${site.issues}/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    'Issue updated',
  );

export const useDeleteSubscriber = () =>
  useResourceMutation<{ id: string }>(
    'newsletter',
    ({ id }) => apiFetch(`${site.newsletter}/${id}`, { method: 'DELETE' }),
    'Subscriber removed',
  );
