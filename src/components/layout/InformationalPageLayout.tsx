import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Footer } from '@/components/layout/Footer';
import { ArrowLeft } from 'lucide-react';

export interface InformationalPageLayoutProps {
  title: string;
  metaTitle: string;
  metaDescription: string;
  badge?: string;
  heroHeadline?: React.ReactNode;
  heroDescription?: string;
  ctaPrimaryText?: string;
  ctaPrimaryLink?: string;
  ctaSecondaryText?: string;
  ctaSecondaryLink?: string;
  children: React.ReactNode;
}

export const InformationalPageLayout: React.FC<InformationalPageLayoutProps> = ({
  title,
  metaTitle,
  metaDescription,
  badge,
  heroHeadline,
  heroDescription,
  ctaPrimaryText = 'Open Your Photos',
  ctaPrimaryLink = '/',
  ctaSecondaryText,
  ctaSecondaryLink,
  children,
}) => {
  // Update document title and meta description dynamically
  useEffect(() => {
    document.title = metaTitle;
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.setAttribute('name', 'description');
      document.head.appendChild(descMeta);
    }
    descMeta.setAttribute('content', metaDescription);

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [metaTitle, metaDescription]);

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Main Page Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-10 flex flex-col gap-8 sm:gap-12">
        {/* Breadcrumb Back Link */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[2.2] group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Photos</span>
          </Link>
        </div>

        {/* Hero Section */}
        <section className="flex flex-col items-center text-center max-w-2xl mx-auto">
          {badge && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-3 shadow-2xs"
            >
              <span>{badge}</span>
            </motion.div>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]"
          >
            {heroHeadline || title}
          </motion.h1>

          {heroDescription && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-sm sm:text-base text-slate-600 mt-4 leading-relaxed font-normal"
            >
              {heroDescription}
            </motion.p>
          )}

          {(ctaPrimaryText || ctaSecondaryText) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-6 sm:mt-7 flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto"
            >
              {ctaPrimaryText && (
                <Link
                  to={ctaPrimaryLink}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>{ctaPrimaryText}</span>
                </Link>
              )}
              {ctaSecondaryText && ctaSecondaryLink && (
                <Link
                  to={ctaSecondaryLink}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm border border-slate-200/80 shadow-2xs transition-all flex items-center justify-center gap-1.5"
                >
                  <span>{ctaSecondaryText}</span>
                </Link>
              )}
            </motion.div>
          )}
        </section>

        {/* Content Body */}
        <div className="flex flex-col gap-10 sm:gap-12 text-slate-700">
          {children}
        </div>
      </main>

      {/* Shared Footer */}
      <Footer />
    </div>
  );
};
