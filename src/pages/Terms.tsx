import React from 'react';
import { InformationalPageLayout } from '@/components/layout/InformationalPageLayout';

export const Terms: React.FC = () => {
  return (
    <InformationalPageLayout
      title="Terms of Use"
      metaTitle="Terms of Use — ScrapItBro"
      metaDescription="Read the terms for using ScrapItBro."
      badge="Legal"
      heroHeadline="Terms of Use"
      heroDescription="Last updated: September 2026"
    >
      <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-xs flex flex-col gap-8 text-xs sm:text-sm leading-relaxed">
        
        {/* 1. Using ScrapItBro */}
        <div className="flex flex-col gap-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            1. Using ScrapItBro
          </h2>
          <p className="text-slate-600">
            ScrapItBro is provided as a photo inspection and cleaning utility. You are responsible for the photos and files you choose to process.
          </p>
        </div>

        {/* 2. Your Files */}
        <div className="flex flex-col gap-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            2. Your Files
          </h2>
          <p className="text-slate-600">
            You should only process photos and files that you have the right to use.
          </p>
        </div>

        {/* 3. No Guarantee */}
        <div className="flex flex-col gap-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            3. No Guarantee
          </h2>
          <p className="text-slate-600">
            While ScrapItBro is designed to process files carefully, software and browser-based processing can encounter unsupported files, unusual metadata structures, browser limitations, or unexpected errors. Keep your original files backed up when they are important.
          </p>
        </div>

        {/* 4. Clean Exports */}
        <div className="flex flex-col gap-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            4. Clean Exports
          </h2>
          <p className="text-slate-600">
            Cleaning removes supported metadata from supported formats. A cleaned copy may differ in file size, metadata content, and digital file fingerprint from the original file.
          </p>
        </div>

        {/* 5. Availability */}
        <div className="flex flex-col gap-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            5. Availability
          </h2>
          <p className="text-slate-600">
            Features may change, be improved, or become unavailable as the project develops.
          </p>
        </div>

        {/* 6. Security */}
        <div className="flex flex-col gap-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            6. Security
          </h2>
          <p className="text-slate-600">
            ScrapItBro uses browser-based security mechanisms and client-side isolation, but no software can guarantee absolute security.
          </p>
        </div>

        {/* 7. Acceptable Use */}
        <div className="flex flex-col gap-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            7. Acceptable Use
          </h2>
          <p className="text-slate-600">
            Do not use the application for unlawful activity or to process files you do not have permission to use.
          </p>
        </div>

        {/* 8. Changes */}
        <div className="flex flex-col gap-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            8. Changes to These Terms
          </h2>
          <p className="text-slate-600">
            These terms may be updated as the project evolves. Continued use of the application constitutes acceptance of updated terms.
          </p>
        </div>

        {/* 9. Contact */}
        <div className="flex flex-col gap-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            9. Contact
          </h2>
          <p className="text-slate-600">
            For inquiries regarding these terms, please use the contact information published with the project repository.
          </p>
        </div>

      </div>
    </InformationalPageLayout>
  );
};
