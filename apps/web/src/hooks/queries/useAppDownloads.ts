import { useQuery } from '@tanstack/react-query';
import { client, groq } from '@/lib/sanity';
import type { IPremiumApp } from '@/types/premium-app';

export type AppDownloads = Pick<IPremiumApp, '_id' | 'title' | 'isFree' | 'platforms' | 'systemRequirements' | 'releases'> & {
  slug: string;
  mainImage?: string;
};

// Every release, not just the 10 the app page shows.
const appDownloadsQuery = groq`
  *[_type == "premiumApp" && isPublished == true && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    isFree,
    "mainImage": mainImage.asset->url,
    platforms,
    systemRequirements,
    "releases": releases[defined(version)] | order(releaseDate desc) { version, releaseDate, notes, downloadUrl, fileSize }
  }
`;

export function useAppDownloads(slug: string | undefined) {
  return useQuery({
    queryKey: ['app-downloads', slug],
    queryFn: () => client.fetch<AppDownloads | null>(appDownloadsQuery, { slug }),
    enabled: !!slug,
  });
}
