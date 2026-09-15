import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export interface SEOMetadata {
  title: string;
  description: string;
  canonicalPath?: string;
  noindex?: boolean;
}

export const CANONICAL_ORIGIN = 'https://scrapitbro.pages.dev';

/**
 * Updates document head tags for SEO, Open Graph, Twitter, and indexation controls.
 */
export function updatePageSEO({ title, description, canonicalPath, noindex = false }: SEOMetadata): void {
  if (typeof document === 'undefined') return;

  // 1. Document Title
  document.title = title;

  // 2. Meta Description
  let descMeta = document.querySelector('meta[name="description"]');
  if (!descMeta) {
    descMeta = document.createElement('meta');
    descMeta.setAttribute('name', 'description');
    document.head.appendChild(descMeta);
  }
  descMeta.setAttribute('content', description);

  // 3. Robots (noindex, nofollow)
  let robotsMeta = document.querySelector('meta[name="robots"]');
  if (noindex) {
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', 'noindex, nofollow');
  } else if (robotsMeta) {
    robotsMeta.remove();
  }

  // 4. Canonical URL Link
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!noindex && canonicalPath) {
    const canonicalUrl = `${CANONICAL_ORIGIN}${canonicalPath === '/' ? '/' : canonicalPath}`;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);
  } else if (canonicalLink) {
    canonicalLink.remove();
  }

  // 5. Open Graph Meta Tags
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', title);

  let ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', description);

  let ogUrl = document.querySelector('meta[property="og:url"]');
  if (!noindex && canonicalPath) {
    const canonicalUrl = `${CANONICAL_ORIGIN}${canonicalPath === '/' ? '/' : canonicalPath}`;
    if (!ogUrl) {
      ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute('content', canonicalUrl);
  } else if (ogUrl) {
    ogUrl.remove();
  }

  // 6. Twitter Card Meta Tags
  let twTitle = document.querySelector('meta[name="twitter:title"]');
  if (twTitle) twTitle.setAttribute('content', title);

  let twDesc = document.querySelector('meta[name="twitter:description"]');
  if (twDesc) twDesc.setAttribute('content', description);
}

/**
 * React hook for managing page SEO metadata
 */
export function useSEO(metadata: SEOMetadata): void {
  const location = useLocation();

  useEffect(() => {
    updatePageSEO(metadata);
  }, [metadata.title, metadata.description, metadata.canonicalPath, metadata.noindex, location.pathname]);
}
