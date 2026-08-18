import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { API_BASE_URL } from '@/lib/endpoints';
import type { AnalyticsReport } from '@/types/analytics';

export function useAnalyticsReport(days: number) {
  const from = new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000);
  from.setHours(0, 0, 0, 0);

  return useQuery({
    queryKey: ['analytics', 'report', days],
    queryFn: () =>
      apiFetch<AnalyticsReport>(
        `${API_BASE_URL}/admin/analytics/report?from=${from.toISOString()}`,
      ),
  });
}
