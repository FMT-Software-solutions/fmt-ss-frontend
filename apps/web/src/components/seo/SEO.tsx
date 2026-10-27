import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  siteName?: string;
  twitterHandle?: string;
  canonicalUrl?: string;
  schema?: Record<string, any>;
}

const DEFAULT_TITLE = 'FMT Software Solutions';
const DEFAULT_DESCRIPTION = 'Business software for Ghana: inventory, sales, printing and church management apps. Free trials, Mobile Money and instalments.';
// Same image the edge function (netlify/edge-functions/page-meta.ts) serves to link previews.
const DEFAULT_IMAGE = 'https://fmtsoftware.com/og/fmt-default.jpg';
const DEFAULT_URL = 'https://fmtsoftware.com';
const DEFAULT_SITE_NAME = 'FMT Software Solutions';
const DEFAULT_TWITTER_HANDLE = '@fmtsoftware'; // Placeholder

export const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = [],
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  siteName = DEFAULT_SITE_NAME,
  twitterHandle = DEFAULT_TWITTER_HANDLE,
  canonicalUrl,
  schema,
}: SEOProps) => {
  const pageTitle = title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE;
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : DEFAULT_URL);
  const canonical = canonicalUrl || currentUrl;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data (JSON-LD) */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};
