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
    tagline,
    benefits[]{ title, description },
    whatsIncluded,
    faqs[]{ question, answer },
    trialDays,
    paymentPlans,
    addOns[]{ name, description, price, unit },
    contact,
    seo{ metaTitle, metaDescription, "ogImage": ogImage.asset->url },
    "releases": releases[0...10]{ version, releaseDate, notes, downloadUrl, fileSize },
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
