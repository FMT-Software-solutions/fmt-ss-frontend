import { useQuery } from '@tanstack/react-query';
import { client, groq } from '@/lib/sanity';
import type { IPremiumApp } from '@/types/premium-app';

const appBySlugQuery = groq`
  *[_type == "premiumApp" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    price,
    isFree,
    requiresAccount,
    hasTrialUsage,
    publishedAt,
    shortDescription,
    description,
    "mainImage": mainImage.asset->url,
    "screenshots": screenshots[].asset->url,
    "sectors": sectors[]->{
      _id,
      name,
      "slug": slug.current
    },
    features,
    requirements,
    systemRequirements,
    platforms,
    video,
    tags,
    appProvisioning,
    promotion {
      hasPromotion,
      discountPrice,
      startDate,
      endDate,
      isActive
    }
  }
`;

export function useAppBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['app', slug],
    queryFn: async () => {
      if (!slug) return null;
      const data = await client.fetch<IPremiumApp>(appBySlugQuery, { slug });
      return data;
    },
    enabled: !!slug,
  });
}
