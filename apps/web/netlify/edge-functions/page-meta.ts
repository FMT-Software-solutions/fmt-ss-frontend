/**
 * Link previews (WhatsApp, Facebook, X, LinkedIn, Slack…) for a single-page
 * app.
 *
 * Crawlers don't run JavaScript, so they only ever saw index.html's generic
 * <head>. This edge function rewrites the block between the page-meta
 * markers in index.html with the right title, description and image for the
 * requested page — an app page previews as that app, a checkout link as the
 * app being bought, private pages (payment plans, orders) preview generically
 * and aren't indexed.
 *
 * Responses are cached on Netlify's CDN for 5 minutes (stale for a week while
 * revalidating), so previews are instant and Sanity changes show within
 * minutes. Every deploy clears the cache.
 *
 * The tags carry data-rh="true" so react-helmet-async replaces them in the
 * browser instead of adding duplicates.
 */
import type { Config, Context } from "@netlify/edge-functions";

const SANITY = "https://cfyhidte.apicdn.sanity.io/v2024-03-13/data/query/production";
const SITE_NAME = "FMT Software Solutions";
const DEFAULT_IMAGE = "/og/fmt-default.jpg";
const DEFAULT_DESCRIPTION =
  "Business software for Ghana: inventory, sales, printing and church management apps. Free trials, Mobile Money and instalments.";

export interface PageMeta {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  type: "website" | "product";
  noindex?: boolean;
  price?: { amount: number; currency: string };
}

const STATIC: Record<string, Partial<PageMeta>> = {
  "/marketplace": {
    title: `Software Marketplace | ${SITE_NAME}`,
    description: "Inventory, sales, printing and church management software. Free trials, Mobile Money and instalments.",
    image: "/og/fmt-marketplace.jpg",
  },
  "/about": { title: `About us | ${SITE_NAME}`, description: "We build software that runs businesses and churches across Ghana." },
  "/contact": { title: `Contact us | ${SITE_NAME}`, description: "Talk to us about our apps or a custom project. WhatsApp +233 55 961 7959." },
  "/request-quote": { title: `Request a quote | ${SITE_NAME}`, description: "Tell us what you need built: web, desktop or mobile software." },
  "/reviews": { title: `Reviews | ${SITE_NAME}`, description: "What our customers say about our software." },
  "/privacy": { title: `Privacy policy | ${SITE_NAME}` },
  "/terms": { title: `Terms of use | ${SITE_NAME}` },
};

// Personal or one-off pages: generic preview, never indexed.
const PRIVATE = ["/plan/", "/order-complete", "/success", "/payment-complete", "/newsletter/"];

interface SanityApp {
  title: string;
  tagline?: string;
  shortDescription?: string;
  price?: number;
  isFree?: boolean;
  promotion?: { hasPromotion?: boolean; isActive?: boolean; discountPrice?: number; startDate?: string; endDate?: string };
  seo?: { metaTitle?: string; metaDescription?: string; ogImage?: string };
  mainImage?: string;
}

const APP_FIELDS = `{ title, tagline, shortDescription, price, isFree, promotion,
  seo{ metaTitle, metaDescription, "ogImage": ogImage.asset->url }, "mainImage": mainImage.asset->url }`;

async function fetchApp(filter: string, params: Record<string, string>): Promise<SanityApp | null> {
  const url = new URL(SANITY);
  url.searchParams.set("query", `*[_type == "premiumApp" && isPublished == true && ${filter}][0]${APP_FIELDS}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(`$${k}`, JSON.stringify(v));
  const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
  if (!res.ok) return null;
  return (await res.json()).result ?? null;
}

/** Same promotion rule as the site: only inside its dates. */
function currentPrice(app: SanityApp) {
  const p = app.promotion;
  const now = Date.now();
  const inWindow = (!p?.startDate || now >= Date.parse(p.startDate)) && (!p?.endDate || now <= Date.parse(p.endDate));
  const promo = p?.hasPromotion && p.isActive !== false && inWindow && p.discountPrice && p.discountPrice < (app.price ?? 0);
  return promo ? p!.discountPrice! : app.price ?? 0;
}

/** A 1200×630 JPEG from Sanity's image CDN (small and fast for WhatsApp). */
const shareImage = (url: string) => `${url}?w=1200&h=630&fit=crop&fm=jpg&q=82`;

function appMeta(app: SanityApp, prefix = ""): PageMeta {
  const price = currentPrice(app);
  return {
    title: prefix ? `${prefix}${app.title} | ${SITE_NAME}` : app.seo?.metaTitle || `${app.title}${app.tagline ? ` – ${app.tagline}` : ""}`,
    description: app.seo?.metaDescription || app.shortDescription?.trim() || DEFAULT_DESCRIPTION,
    image: app.seo?.ogImage ? shareImage(app.seo.ogImage) : app.mainImage ? shareImage(app.mainImage) : DEFAULT_IMAGE,
    imageAlt: app.title,
    type: "product",
    price: app.isFree ? { amount: 0, currency: "GHS" } : price ? { amount: price, currency: "GHS" } : undefined,
  };
}

export async function metaFor(pathname: string): Promise<PageMeta> {
  const path = pathname.replace(/\/+$/, "") || "/";
  const base: PageMeta = {
    title: `${SITE_NAME} – Software that runs your business`,
    description: DEFAULT_DESCRIPTION,
    image: DEFAULT_IMAGE,
    imageAlt: SITE_NAME,
    type: "website",
  };

  if (PRIVATE.some((p) => path === p.replace(/\/$/, "") || path.startsWith(p))) {
    return { ...base, noindex: true };
  }

  const app = path.match(/^\/marketplace\/([^/]+)$/);
  if (app) {
    const found = await fetchApp("slug.current == $slug", { slug: decodeURIComponent(app[1]) }).catch(() => null);
    return found ? appMeta(found) : base;
  }

  const checkout = path.match(/^\/checkout\/([^/]+)$/);
  if (checkout) {
    const found = await fetchApp("_id == $id", { id: decodeURIComponent(checkout[1]) }).catch(() => null);
    return found ? { ...appMeta(found, "Buy "), noindex: true } : { ...base, noindex: true };
  }

  return { ...base, ...(STATIC[path] ?? {}) };
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function renderMeta(meta: PageMeta, pageUrl: string, origin: string): string {
  const abs = (u: string) => (u.startsWith("http") ? u : `${origin}${u}`);
  const tag = (attr: "name" | "property", key: string, value: string) =>
    `<meta data-rh="true" ${attr}="${key}" content="${esc(value)}" />`;
  return [
    `<title>${esc(meta.title)}</title>`,
    tag("name", "description", meta.description),
    `<link data-rh="true" rel="canonical" href="${esc(pageUrl)}" />`,
    meta.noindex ? tag("name", "robots", "noindex, nofollow") : "",
    tag("property", "og:type", meta.type),
    tag("property", "og:site_name", SITE_NAME),
    tag("property", "og:url", pageUrl),
    tag("property", "og:title", meta.title),
    tag("property", "og:description", meta.description),
    tag("property", "og:image", abs(meta.image)),
    tag("property", "og:image:secure_url", abs(meta.image)),
    tag("property", "og:image:type", "image/jpeg"),
    tag("property", "og:image:width", "1200"),
    tag("property", "og:image:height", "630"),
    tag("property", "og:image:alt", meta.imageAlt),
    tag("property", "og:locale", "en_GB"),
    meta.price ? tag("property", "product:price:amount", String(meta.price.amount)) : "",
    meta.price ? tag("property", "product:price:currency", meta.price.currency) : "",
    tag("name", "twitter:card", "summary_large_image"),
    tag("name", "twitter:title", meta.title),
    tag("name", "twitter:description", meta.description),
    tag("name", "twitter:image", abs(meta.image)),
  ]
    .filter(Boolean)
    .join("\n    ");
}

const BLOCK = /<!-- page-meta:start -->[\s\S]*?<!-- page-meta:end -->/;

export default async function pageMeta(request: Request, context: Context) {
  const response = await context.next();
  if (!response.headers.get("content-type")?.includes("text/html")) return response;

  const html = await response.text();
  const url = new URL(request.url);
  let out = html;
  try {
    const meta = await metaFor(url.pathname);
    const pageUrl = `${url.origin}${url.pathname.replace(/\/+$/, "") || "/"}`;
    out = html.replace(BLOCK, `<!-- page-meta:start -->\n    ${renderMeta(meta, pageUrl, url.origin)}\n    <!-- page-meta:end -->`);
  } catch (error) {
    console.error("page-meta:", error);
  }

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.set("cache-control", "public, max-age=0, must-revalidate");
  headers.set("netlify-cdn-cache-control", "public, durable, s-maxage=300, stale-while-revalidate=604800");
  return new Response(out, { status: response.status, headers });
}

export const config: Config = {
  path: "/*",
  excludedPath: ["/assets/*", "/og/*", "/*.js", "/*.css", "/*.png", "/*.jpg", "/*.svg", "/*.ico", "/*.xml", "/*.txt", "/*.webp", "/*.json"],
  cache: "manual",
};
