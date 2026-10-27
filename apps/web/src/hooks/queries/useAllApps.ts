import { useQuery } from '@tanstack/react-query';
import { client, groq } from '@/lib/sanity';
import type { MarketplaceApp } from '@/lib/apps';

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
    featured,
    sortOrder,
    hasTrialUsage,
    trialDays,
    "paymentPlans": paymentPlans{ enabled },
    "platforms": platforms{ desktop{ windows{ available } }, web{ available } },
    "releases": releases[0...1]{ version, releaseDate },
    publishedAt,
    tagline,
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
      const data = await client.fetch<MarketplaceApp[]>(allAppsQuery);
      return data || [];
    },
  });
}
