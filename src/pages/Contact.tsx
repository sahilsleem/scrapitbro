import React from 'react';
import { InformationalPageLayout } from '@/components/layout/InformationalPageLayout';
import { ShieldCheck, HelpCircle, Bug } from 'lucide-react';

export const Contact: React.FC = () => {
  return (
    <InformationalPageLayout
      title="Contact"
      metaTitle="Contact — ScrapItBro"
      metaDescription="Have a question, found an issue, or just want to get in touch? You can contact the ScrapItBro team for feedback, privacy-related questions, bug reports, or anything else you'd like to share."
      badge="Get in Touch"
      heroHeadline="Contact"
      heroDescription="Have a question, found an issue, or just want to get in touch? You can contact the ScrapItBro team for feedback, privacy-related questions, bug reports, or anything else you'd like to share."
      ctaPrimaryText="Contact ScrapItBro"
      ctaPrimaryLink="mailto:sahilsleem01@gmail.com"
      ctaSecondaryText="Open Your Photos"
      ctaSecondaryLink="/"
    >
      <div className="flex flex-col gap-6 sm:gap-8">
        {/* Inquiry Topics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Questions & Feedback */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
              <HelpCircle className="w-4.5 h-4.5 stroke-[2]" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Questions &amp; Feedback
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Have ideas for new features, suggestions on user experience, or questions about how metadata inspection works? We'd love to hear from you.
            </p>
          </div>

          {/* Bug Reports */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
              <Bug className="w-4.5 h-4.5 stroke-[2]" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Bug Reports &amp; Technical Issues
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Encountered an unsupported file, unexpected error, or performance issue? Reach out with details about your device and browser.
            </p>
          </div>
        </div>

        {/* Local Privacy Guarantee */}
        <section className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              On-Device Privacy First
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              ScrapItBro is designed for complete on-device processing. We do not store or process your images on external servers, and inquiries sent via email contain only the message content you choose to share.
            </p>
          </div>
        </section>
      </div>
    </InformationalPageLayout>
  );
};

