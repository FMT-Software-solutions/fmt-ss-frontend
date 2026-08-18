import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { API_BASE_URL } from '@/lib/endpoints';
import type {
  ApplyDefaultsResponse,
  DefaultsCheckResponse,
  TemplateKind,
  TemplatesResponse,
} from '@/types/defaults';

const base = (appId: string) => `${API_BASE_URL}/admin/apps/${appId}/defaults`;

export function useDefaultTemplates(appId: string | undefined) {
  return useQuery({
    queryKey: ['defaults', appId],
    queryFn: () => apiFetch<TemplatesResponse>(base(appId!)),
    enabled: Boolean(appId),
  });
}

export function useSaveTemplate(appId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { kind: TemplateKind; payload: Record<string, unknown>; notes?: string }) =>
      apiFetch(base(appId!), { method: 'PUT', body: JSON.stringify(body) }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['defaults', appId] });
      void queryClient.invalidateQueries({ queryKey: ['audit'] });
      toast.success('Template saved');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

/** Reads current values off a known-good organization to seed a template. */
export function useCaptureTemplate(appId: string | undefined) {
  return useMutation({
    mutationFn: (body: { kind: TemplateKind; organizationId: string }) =>
      apiFetch<Record<string, unknown>>(`${base(appId!)}/capture`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDefaultsCheck(appId: string | undefined, orgId: string | undefined) {
  return useQuery({
    queryKey: ['defaults', appId, 'check', orgId],
    queryFn: () => apiFetch<DefaultsCheckResponse>(`${base(appId!)}/check/${orgId}`),
    enabled: Boolean(appId && orgId),
  });
}

export function useApplyDefaults(appId: string | undefined, orgId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { kinds?: TemplateKind[] }) =>
      apiFetch<ApplyDefaultsResponse>(`${base(appId!)}/apply/${orgId}`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ['defaults', appId, 'check', orgId] });
      void queryClient.invalidateQueries({ queryKey: ['apps', appId, 'organizations', orgId] });
      void queryClient.invalidateQueries({ queryKey: ['audit'] });
      if (result.success) {
        toast.success(`Applied ${result.applied.join(', ') || 'nothing'}`);
      } else {
        toast.error(`Some templates failed: ${result.failures.map((f) => f.kind).join(', ')}`);
      }
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
