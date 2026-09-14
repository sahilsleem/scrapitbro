import React from 'react';
import { InformationalPageLayout } from '@/components/layout/InformationalPageLayout';
import { Link } from 'react-router-dom';

export const Privacy: React.FC = () => {
  return (
    <InformationalPageLayout
      title="Privacy Policy"
      metaTitle="Privacy Policy — ScrapItBro"
      metaDescription="Learn how ScrapItBro handles photos, metadata, browser storage and privacy."
      badge="Legal & Privacy"
      heroHeadline="Privacy Policy"
      heroDescription="Last updated: September 2026"
    >
      <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-10 shadow-xs flex flex-col gap-8 text-xs sm:text-sm leading-relaxed">
        
        {/* Intro */}
        <div>
          <p className="text-slate-600">
            ScrapItBro is designed to help you inspect photo metadata and create cleaner copies. This policy explains how the application handles information when you use it.
          </p>
        </div>

        {/* 1. Photos You Process */}
        <div className="flex flex-col gap-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            1. Photos You Process
          </h2>
          <p className="text-slate-600">
            ScrapItBro is designed to process photos locally in your browser. Photos selected for processing are handled by the application on your device and stored in the browser's local storage mechanisms (IndexedDB) used by the app.
          </p>
        </div>

        {/* 2. Photo Metadata */}
        <div className="flex flex-col gap-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            2. Photo Metadata
          </h2>
          <p className="text-slate-600">
            When you inspect a photo, ScrapItBro may read metadata embedded in the file, including information such as camera details, timestamps, image properties, and GPS information when those fields are actually present in the file.
          </p>
          <p className="text-slate-600">
            That information is used strictly to display the details to you within the application interface and to perform supported cleaning operations.
          </p>
        </div>

        {/* 3. Original Photos */}
        <div className="flex flex-col gap-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            3. Original Photos
          </h2>
          <p className="text-slate-600">
            ScrapItBro keeps the original uploaded file separate from any cleaned export. Cleaning a photo does not intentionally overwrite or modify the original master file stored by the application.
          </p>
        </div>

        {/* 4. Clean Copies */}
        <div className="flex flex-col gap-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            4. Clean Copies
          </h2>
          <p className="text-slate-600">
            Clean exports are separate files. Removing metadata changes the file structure, so a cleaned copy may have a different file size and SHA-256 fingerprint from the original.
          </p>
        </div>

        {/* 5. Local Processing */}
        <div className="flex flex-col gap-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            5. Local Processing
          </h2>
          <p className="text-slate-600">
            Photo inspection, metadata extraction, and supported metadata cleaning are performed locally in your browser memory and client-side web workers.
          </p>
        </div>

        {/* 6. Browser Storage */}
        <div className="flex flex-col gap-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            6. Browser Storage
          </h2>
          <p className="text-slate-600">
            The application uses local browser database storage (IndexedDB) to keep your photos available between sessions on your device. Clearing your browser data or site storage will remove locally stored photos and preferences. ScrapItBro does not provide cloud backup.
          </p>
        </div>

        {/* 7. Security */}
        <div className="flex flex-col gap-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            7. Security
          </h2>
          <p className="text-slate-600">
            ScrapItBro uses browser-based security mechanisms and local application controls to protect the vault experience. No security system should be described as completely invulnerable. Read more on our{' '}
            <Link to="/security" className="text-indigo-600 font-medium hover:underline">
              Security &amp; Privacy page
            </Link>.
          </p>
        </div>

        {/* 8. Analytics / Third Parties */}
        <div className="flex flex-col gap-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            8. Analytics &amp; Third Parties
          </h2>
          <p className="text-slate-600">
            ScrapItBro contains no third-party tracking scripts, advertising trackers, external analytics beacons, or remote photo upload endpoints. All photo inspection and cleaning operations are executed locally within your client session.
          </p>
        </div>

        {/* 9. Changes to This Policy */}
        <div className="flex flex-col gap-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            9. Changes to This Policy
          </h2>
          <p className="text-slate-600">
            We may update this policy as ScrapItBro changes. The date at the top of this page indicates when it was last updated.
          </p>
        </div>

        {/* 10. Contact */}
        <div className="flex flex-col gap-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            10. Contact
          </h2>
          <p className="text-slate-600">
            If you need to contact the maintainers regarding ScrapItBro, please use the contact and issue reporting methods published with the project repository.
          </p>
        </div>

      </div>
    </InformationalPageLayout>
  );
};
