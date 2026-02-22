import { useQuery } from '@tanstack/react-query';
import { client, featuredPremiumAppsQuery } from '@/lib/sanity';
import type { IPremiumAppListItem } from '@/types/premium-app';

export function useFeaturedApps() {
  return useQuery({
    queryKey: ['featuredApps'],
    queryFn: async () => {
      const data = await client.fetch<IPremiumAppListItem[]>(featuredPremiumAppsQuery);
      return data || [];
    },
  });
}
