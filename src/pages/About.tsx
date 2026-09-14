import React from 'react';
import { Link } from 'react-router-dom';
import { InformationalPageLayout } from '@/components/layout/InformationalPageLayout';
import {
  Eye,
  ShieldCheck,
  Sparkles,
  SlidersHorizontal,
  Mail
} from 'lucide-react';

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
      heroDescription="ScrapItBro is a private, photo-first tool for understanding the hidden information inside your photos. It lets you inspect the metadata attached to an image and create a cleaner copy when you want to share a photo without supported metadata."
      ctaPrimaryText="Open Your Photos"
      ctaPrimaryLink="/"
      ctaSecondaryText="How It Works"
      ctaSecondaryLink="/how-it-works"
    >
      {/* Section: What is ScrapItBro? */}
      <section className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xs flex flex-col gap-2.5 sm:gap-4">
        <h2 className="text-base sm:text-2xl font-bold text-slate-900 tracking-tight">
          What is ScrapItBro?
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
          ScrapItBro is a private, photo-first tool for understanding the hidden information inside your photos. It lets you inspect the metadata attached to an image and create a cleaner copy when you want to share a photo without supported metadata.
        </p>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
          Open a photo, see the details it carries, decide what you want to keep, and export a cleaned copy. Your original photo remains separate and untouched.
        </p>
      </section>

      {/* Section: Core Explanations (4-card grid) */}
      <section className="flex flex-col gap-3 sm:gap-5">
        <div className="flex flex-col gap-0.5 sm:gap-1">
          <span className="text-[10px] sm:text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
            Key Capabilities
          </span>
          <h2 className="text-base sm:text-2xl font-bold text-slate-900 tracking-tight">
            What ScrapItBro does
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Card 1: Discover Hidden Information */}
          <div className="bg-white border border-slate-200/80 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xs flex flex-col gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
              <Eye className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                1. Discover Hidden Information
              </h3>
              <p className="text-[10px] sm:text-[11px] font-medium text-indigo-600 mt-0.5">
                See the details your photos carry.
              </p>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed font-normal">
              Photos can contain camera information, capture dates, lens details, location data, dimensions, and other embedded metadata. ScrapItBro makes these details easy to understand.
            </p>
          </div>

          {/* Card 2: Keep Your Original Safe */}
          <div className="bg-white border border-slate-200/80 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xs flex flex-col gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                2. Keep Your Original Safe
              </h3>
              <p className="text-[10px] sm:text-[11px] font-medium text-indigo-600 mt-0.5">
                Your original photo stays untouched.
              </p>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed font-normal">
              When a photo is added, ScrapItBro keeps the original file untouched. The original remains available exactly as it was added.
            </p>
          </div>

          {/* Card 3: Clean & Export */}
          <div className="bg-white border border-slate-200/80 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xs flex flex-col gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                3. Clean &amp; Export
              </h3>
              <p className="text-[10px] sm:text-[11px] font-medium text-indigo-600 mt-0.5">
                Remove hidden metadata from a separate copy.
              </p>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed font-normal">
              Create a separate cleaned copy with supported metadata removed when you want to share a photo more privately. The original remains untouched.
            </p>
          </div>

          {/* Card 4: Your Privacy, Your Control */}
          <div className="bg-white border border-slate-200/80 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xs flex flex-col gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
              <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                4. Your Privacy, Your Control
              </h3>
              <p className="text-[10px] sm:text-[11px] font-medium text-indigo-600 mt-0.5">
                Understand what your photos contain before you share them.
              </p>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed font-normal">
              Review the information inside your photos and decide what you want to keep or remove before sharing.
            </p>
          </div>
        </div>
      </section>

      {/* Section: How ScrapItBro Works (Simple Flow) */}
      <section className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xs flex flex-col gap-3.5 sm:gap-6">
        <div className="flex flex-col gap-0.5 sm:gap-1">
          <span className="text-[10px] sm:text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
            Process
          </span>
          <h2 className="text-base sm:text-2xl font-bold text-slate-900 tracking-tight">
            How ScrapItBro Works
          </h2>
        </div>

        {/* Step Flow Pills / Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50/80 border border-slate-200/60 flex flex-col gap-1.5 sm:gap-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] sm:text-xs flex items-center justify-center flex-shrink-0">
                1
              </span>
              <h4 className="text-xs font-bold text-slate-900">Add a photo</h4>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed font-normal">
              Select or drop any image directly in your browser.
            </p>
          </div>

          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50/80 border border-slate-200/60 flex flex-col gap-1.5 sm:gap-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] sm:text-xs flex items-center justify-center flex-shrink-0">
                2
              </span>
              <h4 className="text-xs font-bold text-slate-900">Inspect its information</h4>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed font-normal">
              See embedded EXIF, GPS, camera details, and dimensions.
            </p>
          </div>

          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50/80 border border-slate-200/60 flex flex-col gap-1.5 sm:gap-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] sm:text-xs flex items-center justify-center flex-shrink-0">
                3
              </span>
              <h4 className="text-xs font-bold text-slate-900">Decide what to keep</h4>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed font-normal">
              Review details and choose how you want to handle the file.
            </p>
          </div>

          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50/80 border border-slate-200/60 flex flex-col gap-1.5 sm:gap-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] sm:text-xs flex items-center justify-center flex-shrink-0">
                4
              </span>
              <h4 className="text-xs font-bold text-slate-900">Export original or clean copy</h4>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed font-normal">
              Download the untouched master or a metadata-free clean copy.
            </p>
          </div>
        </div>
      </section>

      {/* Section: Designed to keep your photos close */}
      <section className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xs flex flex-col gap-2.5 sm:gap-4">
        <h2 className="text-base sm:text-2xl font-bold text-slate-900 tracking-tight">
          Designed to keep your photos close
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
          ScrapItBro is engineered entirely around local browser processing. Photo inspection, metadata extraction, and lossless cleaning are performed on-device inside your browser sandbox rather than sending your photos to an external server.
        </p>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
          Your photos stay inside your device's browser memory and local storage at all times.
        </p>
      </section>

      {/* Section: Original vs Clean Copy */}
      <section className="bg-slate-50/90 border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xs flex flex-col gap-3 sm:gap-4">
        <h2 className="text-base sm:text-2xl font-bold text-slate-900 tracking-tight">
          Original vs Clean Copy
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-0.5">
          <div className="bg-white border border-slate-200/70 rounded-xl p-3 sm:p-4 flex flex-col gap-1 sm:gap-1.5">
            <span className="text-[11px] sm:text-xs font-bold text-slate-900 uppercase tracking-wider">
              Original File
            </span>
            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed font-normal">
              The exact original file you added remains preserved separately with all its original bytes, structure, and metadata intact.
            </p>
          </div>
          <div className="bg-white border border-indigo-100 rounded-xl p-3 sm:p-4 flex flex-col gap-1 sm:gap-1.5">
            <span className="text-[11px] sm:text-xs font-bold text-indigo-950 uppercase tracking-wider">
              Clean Copy
            </span>
            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed font-normal">
              A separate exported copy has supported metadata removed. Removing metadata changes the file bytes, so the clean copy receives its own distinct digital fingerprint.
            </p>
          </div>
        </div>
      </section>

      {/* Section: Contact / Support */}
      <section className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 sm:gap-5">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0 mt-0.5">
            <Mail className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
          </div>
          <div className="flex flex-col gap-0.5 sm:gap-1">
            <h3 className="text-sm sm:text-lg font-bold text-slate-900 tracking-tight">
              Have a question?
            </h3>
            <p className="text-[11px] sm:text-sm text-slate-500 font-normal">
              Have feedback, found an issue, or just want to get in touch?
            </p>
          </div>
        </div>

        <a
          href="mailto:sahilsleem01@gmail.com"
          className="w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer"
        >
          <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
          <span>Contact ScrapItBro</span>
        </a>
      </section>

      {/* Final CTA */}
      <section className="bg-indigo-600 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 shadow-md shadow-indigo-500/20 text-center sm:text-left">
        <div>
          <h2 className="text-base sm:text-2xl font-bold tracking-tight text-white">
            See what your photos are carrying.
          </h2>
          <p className="text-[11px] sm:text-sm text-indigo-100 mt-1 font-normal">
            Inspect your photos locally and create clean copies with confidence.
          </p>
        </div>
        <Link
          to="/"
          className="w-full sm:w-auto px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-white text-indigo-600 hover:bg-indigo-50 font-bold text-xs sm:text-sm transition-all shadow-xs flex-shrink-0 cursor-pointer text-center"
        >
          Open ScrapItBro
        </Link>
      </section>
    </InformationalPageLayout>
  );
};
