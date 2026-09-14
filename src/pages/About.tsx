import React from 'react';
import { Link } from 'react-router-dom';
import { InformationalPageLayout } from '@/components/layout/InformationalPageLayout';
import { Eye, ShieldCheck, Sparkles, SlidersHorizontal } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <InformationalPageLayout
      title="About ScrapItBro"
      metaTitle="About ScrapItBro — Scrap the details. Keep the photo."
      metaDescription="Learn why ScrapItBro was built to help you inspect photo metadata and create cleaner copies while keeping your original photo separate."
      badge="About ScrapItBro"
      heroHeadline={
        <>
          Your photos can contain <span className="text-indigo-600">more information</span> than you can see.
        </>
      }
      heroDescription="ScrapItBro was built to make that information easier to understand — and easier to remove when you don't want to share it."
      ctaPrimaryText="Open Your Photos"
      ctaPrimaryLink="/"
      ctaSecondaryText="How It Works"
      ctaSecondaryLink="/how-it-works"
    >
      {/* Section: What is ScrapItBro? */}
      <section className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          What is ScrapItBro?
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
          ScrapItBro is a browser-based photo privacy tool for inspecting the information stored alongside your images and creating cleaner copies when needed.
        </p>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
          Open a photo, see the details it carries, decide what you want to keep, and export a cleaned copy. Your original photo remains separate and untouched.
        </p>
      </section>

      {/* Section: Why ScrapItBro exists */}
      <section className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Why ScrapItBro exists
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
          Photos are more than pixels. Depending on how an image was created and saved, it can carry information such as camera settings, timestamps, software details, dimensions, and sometimes location data when available.
        </p>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
          Most people never see this information. ScrapItBro puts it in front of you in a way that's easy to understand, so you can make an informed choice before sharing a photo.
        </p>
      </section>

      {/* Section: What ScrapItBro does (4-card grid) */}
      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
            Core Capabilities
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            What ScrapItBro does
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
              <Eye className="w-5 h-5 stroke-[2]" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              1. See the Details
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Inspect the metadata your photo actually contains, from capture timestamps to camera exposure and location tags.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[2]" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              2. Keep the Original
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Your original uploaded file remains separate and untouched. ScrapItBro never overwrites or alters your master files.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
              <Sparkles className="w-5 h-5 stroke-[2]" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              3. Scrap the Hidden Details
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Create a separate cleaner copy with supported metadata removed, while preserving image pixels and dimensions.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
              <SlidersHorizontal className="w-5 h-5 stroke-[2]" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              4. Decide for Yourself
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Understand what you're sharing before you send the photo. Choose whether to export the original or a clean copy.
            </p>
          </div>
        </div>
      </section>

      {/* Section: Designed to keep your photos close */}
      <section className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Designed to keep your photos close
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
          ScrapItBro is designed around local browser processing. Photo inspection, metadata extraction, and supported cleaning are performed in your browser rather than requiring your photos to be uploaded to a remote photo-processing service.
        </p>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
          Your photos stay inside your device's browser memory and local sandbox.
        </p>
      </section>

      {/* Section: Original vs Clean Copy */}
      <section className="bg-slate-50/90 border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Original vs Clean Copy
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
          <div className="bg-white border border-slate-200/70 rounded-xl p-4 flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Original File
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              The exact original file you added remains preserved separately with all its original bytes, structure, and metadata intact.
            </p>
          </div>
          <div className="bg-white border border-indigo-100 rounded-xl p-4 flex flex-col gap-1.5">
            <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
              Clean Copy
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              A separate exported copy has supported metadata removed. Removing metadata changes the file bytes, so the clean copy receives its own distinct digital fingerprint.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-indigo-600 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md shadow-indigo-500/20 text-center sm:text-left">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            See what your photos are carrying.
          </h2>
          <p className="text-xs sm:text-sm text-indigo-100 mt-1 font-normal">
            Inspect your photos locally and create clean copies with confidence.
          </p>
        </div>
        <Link
          to="/"
          className="px-6 py-3 rounded-xl bg-white text-indigo-600 hover:bg-indigo-50 font-bold text-xs sm:text-sm transition-all shadow-xs flex-shrink-0 cursor-pointer"
        >
          Open ScrapItBro
        </Link>
      </section>
    </InformationalPageLayout>
  );
};
