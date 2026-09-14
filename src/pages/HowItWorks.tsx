import React from 'react';
import { Link } from 'react-router-dom';
import { InformationalPageLayout } from '@/components/layout/InformationalPageLayout';
import { Upload, Search, Sparkles, Download } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  return (
    <InformationalPageLayout
      title="How ScrapItBro Works"
      metaTitle="How ScrapItBro Works — Inspect, Understand, Scrap"
      metaDescription="See how ScrapItBro reads photo details, preserves your original and creates cleaner copies with supported metadata removed."
      badge="How It Works"
      heroHeadline={
        <>
          Inspect. Understand. <span className="text-indigo-600">Scrap.</span> Share.
        </>
      }
      heroDescription="A simple, transparent process to see what's embedded in your photos and create cleaner copies."
      ctaPrimaryText="Open Your Photos"
      ctaPrimaryLink="/"
    >
      {/* 4-Step Flow */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Step 1 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
              Step 01
            </span>
            <Upload className="w-5 h-5 text-slate-400" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-1">
            Add a Photo
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            Choose one or more photos from your device, or drag and drop them directly into the app.
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
              Step 02
            </span>
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-1">
            Inspect the Details
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            ScrapItBro reads the embedded information available in the image and presents camera, capture, location, and technical metadata in human-readable language.
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
              Step 03
            </span>
            <Sparkles className="w-5 h-5 text-slate-400" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-1">
            Choose What to Do
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            Keep your untouched original source master or create a separate clean copy with supported metadata removed.
          </p>
        </div>

        {/* Step 4 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
              Step 04
            </span>
            <Download className="w-5 h-5 text-slate-400" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-1">
            Export
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            Export and use the version you want to keep or share. Your original always stays intact.
          </p>
        </div>
      </section>

      {/* Section: Your original stays separate */}
      <section className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Your original stays separate
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
          ScrapItBro does not replace your original with the cleaned version. The original is preserved separately so you can always export the untouched source file at any time.
        </p>
      </section>

      {/* Section: What can be removed? */}
      <section className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          What can be removed?
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
          Cleaning removes supported metadata segments and chunks (such as EXIF, GPS location coordinates, XMP packets, IPTC headers, and embedded comments) from supported image formats including JPEG, PNG, and WebP.
        </p>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
          The exact fields removed depend on the file format and the metadata actually present in the image. Image dimensions, color profiles, and raw pixel streams remain preserved without intentional re-encoding where supported.
        </p>
      </section>

      {/* Section: Why does the clean copy have a different fingerprint? */}
      <section className="bg-indigo-50/50 border border-indigo-100 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Why does the clean copy have a different fingerprint?
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
          When metadata is removed, the bytes of the file change. Because a SHA-256 fingerprint is calculated directly from the file's binary data, the clean copy receives its own unique digital fingerprint. This is expected and normal.
        </p>
      </section>

      {/* Final CTA */}
      <section className="bg-indigo-600 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md shadow-indigo-500/20 text-center sm:text-left">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Ready to inspect a photo?
          </h2>
          <p className="text-xs sm:text-sm text-indigo-100 mt-1 font-normal">
            Add a photo to discover its hidden details.
          </p>
        </div>
        <Link
          to="/"
          className="px-6 py-3 rounded-xl bg-white text-indigo-600 hover:bg-indigo-50 font-bold text-xs sm:text-sm transition-all shadow-xs flex-shrink-0 cursor-pointer"
        >
          Open Your Photos
        </Link>
      </section>
    </InformationalPageLayout>
  );
};
