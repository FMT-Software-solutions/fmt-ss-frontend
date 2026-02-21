import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/sanity';
import groq from 'groq';
import type { IPremiumAppListItem } from '@/types/premium-app';

const recentPremiumAppsQuery = groq`
  *[_type == "premiumApp" && isPublished == true] | order(publishedAt desc)[0...3] {
    _id,
    title,
    slug,
    isPublished,
    mainImage,
    shortDescription,
    "sectors": sectors[]->name,
    features,
    platforms,
    tags,
    price,
    promotion {
      hasPromotion,
      discountPrice,
      isActive
    },
    publishedAt
  }
`;

export function useFeaturedApps() {
  return useQuery({
    queryKey: ['featuredApps'],
    queryFn: async () => {
      if (!import.meta.env.VITE_SANITY_PROJECT_ID) {
        return [];
      }
      
      const data = await client.fetch<IPremiumAppListItem[]>(recentPremiumAppsQuery);
      return data || [];
    },
    // We can also disable the query if project ID is missing, but returning empty array is safer for UI
    enabled: !!import.meta.env.VITE_SANITY_PROJECT_ID,
  });
}
