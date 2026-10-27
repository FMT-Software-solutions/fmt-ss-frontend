import type { IPremiumApp } from "@/types/premium-app"

/** An app as the marketplace list query returns it (slug and image flattened to strings). */
export type MarketplaceApp = Pick<IPremiumApp, "_id" | "title" | "shortDescription" | "price" | "isFree" | "promotion" | "publishedAt"> &
  Partial<Pick<IPremiumApp, "tagline" | "hasTrialUsage" | "trialDays" | "paymentPlans" | "platforms" | "releases" | "sortOrder">> & {
    slug: string
    mainImage?: string
    featured?: boolean
    sectors?: Array<{ _id: string; name: string; slug: string }>
  }

/** Featured first, then the Sanity sort order, then name. */
export function sortRecommended<T extends Pick<IPremiumApp, "title"> & { featured?: boolean; sortOrder?: number }>(apps: T[]) {
  return [...apps].sort(
    (a, b) =>
      Number(!!b.featured) - Number(!!a.featured) ||
      (a.sortOrder ?? 999) - (b.sortOrder ?? 999) ||
      a.title.localeCompare(b.title),
  )
}
