import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { API_ENDPOINTS, withQuery } from '@/lib/endpoints';
import type { ListParams, Paginated } from '@/types/site';
import type { DiscountCode, DiscountCodeInput } from '@/types/discounts';

const discounts = API_ENDPOINTS.admin.discountCodes;

export function useDiscountCodes(params: ListParams) {
  return useQuery({
    queryKey: ['discount-codes', params],
    queryFn: () => apiFetch<Paginated<DiscountCode>>(withQuery(discounts.list, params)),
    placeholderData: (previous) => previous,
  });
}

export function useSaveDiscountCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: Partial<DiscountCodeInput> }) =>
      apiFetch<DiscountCode>(id ? discounts.detail(id) : discounts.list, {
        method: id ? 'PATCH' : 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['discount-codes'] }),
    onError: (error: Error) => toast.error(error.message),
  });
}
