import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/sanity';
import groq from 'groq';

interface AppListItem {
  _id: string;
  title: string;
}

const allAppsQuery = groq`
  *[_type == "premiumApp" && isPublished == true] | order(title asc) {
    _id,
    title
  }
`;

export function useAllApps() {
  return useQuery({
    queryKey: ['allApps'],
    queryFn: async () => {
      if (!import.meta.env.VITE_SANITY_PROJECT_ID) {
        return [];
      }
      
      const data = await client.fetch<AppListItem[]>(allAppsQuery);
      return data || [];
    },
    enabled: !!import.meta.env.VITE_SANITY_PROJECT_ID,
  });
}
