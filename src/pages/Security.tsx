import React from 'react';
import { InformationalPageLayout } from '@/components/layout/InformationalPageLayout';
import { Link } from 'react-router-dom';
import { ShieldCheck, HardDrive, Lock, FileCode, Hash, Database, AlertCircle } from 'lucide-react';

export const Security: React.FC = () => {
  return (
    <InformationalPageLayout
      title="Security & Privacy"
      metaTitle="Security & Privacy — ScrapItBro"
      metaDescription="Learn how ScrapItBro handles local photo processing, vault protection, metadata cleaning and file integrity."
      badge="Technical Transparency"
      heroHeadline={
        <>
          Security &amp; <span className="text-indigo-600">Privacy</span>
        </>
      }
      heroDescription="ScrapItBro is designed to keep photo processing close to your device."
      ctaPrimaryText="Open ScrapItBro"
      ctaPrimaryLink="/"
      ctaSecondaryText="Read Privacy Policy"
      ctaSecondaryLink="/privacy"
    >
      <div className="flex flex-col gap-8">
        
        {/* Section 1: Local Processing */}
        <section className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[2]" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              1. Local Processing
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            All photo inspection, metadata parsing, and cleaning happen locally in your browser using client-side JavaScript and dedicated Web Workers. Your photo files are never uploaded to any remote photo-processing server.
          </p>
        </section>

        {/* Section 2: Original File Preservation */}
        <section className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
              <HardDrive className="w-5 h-5 stroke-[2]" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              2. Original File Preservation
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            The original uploaded file is stored separately from generated previews and clean copies. Viewing, analyzing, or cleaning a photo does not overwrite or modify the original source file. You can always export the untouched original master file.
          </p>
        </section>

        {/* Section 3: Vault Lock */}
        <section className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
              <Lock className="w-5 h-5 stroke-[2]" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              3. Vault Lock
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            ScrapItBro provides an optional device-local PIN lock powered by Web Crypto PBKDF2 key derivation. When enabled, photo views, previews, and detail routes remain guarded in this browser profile until your PIN is verified. Sensitive photo materials are not loaded into memory while locked, and lock state synchronizes across open tabs.
          </p>
        </section>

        {/* Section 4: Metadata Cleaning */}
        <section className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
              <FileCode className="w-5 h-5 stroke-[2]" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              4. Metadata Cleaning
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            For supported formats (JPEG, PNG, and WebP), ScrapItBro performs binary-level stripping of metadata chunks and segments (EXIF, GPS, XMP, IPTC) without recompressing the underlying image pixels or changing resolution. Because the file structure is altered, the resulting cleaned copy has a separate download file and unique hash.
          </p>
        </section>

        {/* Section 5: SHA-256 Fingerprints */}
        <section className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
              <Hash className="w-5 h-5 stroke-[2]" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              5. SHA-256 Fingerprints
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            Every file can have a SHA-256 fingerprint — a compact digital fingerprint derived from its exact byte sequence. It helps you verify whether two files have the exact same bytes. Changing or removing metadata alters the file bytes, so a cleaned copy naturally receives a different fingerprint.
          </p>
        </section>

        {/* Section 6: Browser Storage */}
        <section className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
              <Database className="w-5 h-5 stroke-[2]" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              6. Browser Storage
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            ScrapItBro uses browser database storage (IndexedDB) to keep your library available locally between visits. Because this storage is managed by your browser, clearing your site data or cache will erase the local vault on that browser.
          </p>
        </section>

        {/* Section 7: Limitations */}
        <section className="bg-slate-50/90 border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 flex-shrink-0">
              <AlertCircle className="w-5 h-5 stroke-[2]" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              7. Security Boundaries &amp; Limitations
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            ScrapItBro operates within standard client-side browser security boundaries. Local browser storage is subject to device access and browser profile permissions. Unusual or proprietary raw image formats may not be supported for lossless cleaning. Always keep master backups of critical files.
          </p>
        </section>

        {/* Final CTA */}
        <section className="bg-indigo-600 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md shadow-indigo-500/20 text-center sm:text-left">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Explore your photo library
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100 mt-1 font-normal">
              Review and clean your photos with transparent local processing.
            </p>
          </div>
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-white text-indigo-600 hover:bg-indigo-50 font-bold text-xs sm:text-sm transition-all shadow-xs flex-shrink-0 cursor-pointer"
          >
            Open ScrapItBro
          </Link>
        </section>

      </div>
    </InformationalPageLayout>
  );
};
