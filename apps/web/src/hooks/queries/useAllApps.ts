import { useQuery } from '@tanstack/react-query';
import { client, groq } from '@/lib/sanity';
import type { IPremiumApp } from '@/types/premium-app';

export interface FilterParams {
  search?: string;
  sector?: string;
  minPrice?: number;
  maxPrice?: number;
}

const allAppsQuery = groq`
  *[_type == "premiumApp" && isPublished == true] | order(title asc) {
    _id,
    title,
    "slug": slug.current,
    price,
    isFree,
    shortDescription,
    "mainImage": mainImage.asset->url,
    "sectors": sectors[]->{
      _id,
      name,
      "slug": slug.current
    },
    promotion {
      hasPromotion,
      discountPrice,
      startDate,
      endDate,
      isActive
    }
  }
`;

export function useAllApps() {
  return useQuery({
    queryKey: ['allApps'],
    queryFn: async () => {
      const data = await client.fetch<IPremiumApp[]>(allAppsQuery);
      return data || [];
    },
  });
}
