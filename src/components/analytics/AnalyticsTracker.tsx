import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

/**
 * AnalyticsTracker
 * Listens to SPA route changes and dispatches page_view events to Google Analytics 4.
 * 
 * Strict Privacy Protections:
 * - Sanitizes /photo/:id to /photo so no photo IDs, hashes, or UUIDs are sent to GA.
 * - Strips any query strings or URL fragments.
 * - Never transmits photo metadata, filenames, EXIF, or local storage data.
 */
export const AnalyticsTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Small delay to allow child pages to set document.title
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        const isPhotoDetail = location.pathname.startsWith('/photo/');
        // Privacy safeguard: scrub dynamic photo IDs from URL path
        const sanitizedPath = isPhotoDetail ? '/photo' : location.pathname;
        const sanitizedLocation = `${window.location.origin}${sanitizedPath}`;

        window.gtag('event', 'page_view', {
          page_path: sanitizedPath,
          page_title: document.title,
          page_location: sanitizedLocation,
        });
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return null;
};
