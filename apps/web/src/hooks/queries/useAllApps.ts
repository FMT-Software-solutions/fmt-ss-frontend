import { useQuery } from '@tanstack/react-query';
import { client, groq } from '@/lib/sanity';

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
      const data = await client.fetch<AppListItem[]>(allAppsQuery);
      return data || [];
    },
  });
}
