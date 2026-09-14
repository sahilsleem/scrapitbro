import React from 'react';
import { InformationalPageLayout } from '@/components/layout/InformationalPageLayout';
import { Mail, ShieldCheck, HelpCircle, Bug } from 'lucide-react';

export const Contact: React.FC = () => {
  return (
    <InformationalPageLayout
      title="Contact"
      metaTitle="Contact — ScrapItBro"
      metaDescription="Contact ScrapItBro for questions, feedback, bug reports, privacy inquiries, or support."
      badge="Get in Touch"
      heroHeadline={
        <>
          Contact <span className="text-indigo-600">ScrapItBro</span>
        </>
      }
      heroDescription="Have questions, feedback, bug reports, or privacy inquiries? We're here to help."
      ctaPrimaryText="Open Your Photos"
      ctaPrimaryLink="/"
    >
      <div className="flex flex-col gap-6 sm:gap-8">
        {/* Main Contact Card */}
        <section className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
              <Mail className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight">
                Direct Email Inquiries
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-normal">
                Reach out directly via email for any inquiries or support.
              </p>
            </div>
          </div>

          <div className="mt-2 p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Support &amp; Feedback Email
              </span>
              <a
                href="mailto:sahilsleem01@gmail.com"
                className="text-base sm:text-lg font-semibold text-indigo-600 hover:text-indigo-700 transition-colors underline decoration-indigo-300 underline-offset-4"
              >
                sahilsleem01@gmail.com
              </a>
            </div>

            <a
              href="mailto:sahilsleem01@gmail.com"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md hover:shadow-indigo-500/20 transition-all duration-180 self-start sm:self-auto cursor-pointer select-none"
            >
              <Mail className="w-4 h-4 stroke-[2]" />
              <span>Send Email</span>
            </a>
          </div>
        </section>

        {/* Inquiry Topics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Questions & Feedback */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
              <HelpCircle className="w-4.5 h-4.5 stroke-[2]" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Questions &amp; Suggestions
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Have ideas for new features or questions on how metadata stripping works? Send your thoughts anytime.
            </p>
          </div>

          {/* Bug Reports */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
              <Bug className="w-4.5 h-4.5 stroke-[2]" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Bug Reports &amp; Issues
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Encountered an unusual photo format or unexpected behavior? Let us know with details about your browser and file format.
            </p>
          </div>
        </div>

        {/* Local Privacy Reminder */}
        <section className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              Client-Side Privacy Notice
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              ScrapItBro processes photos 100% locally on your device. We do not operate remote photo-hosting servers or access your image files.
            </p>
          </div>
        </section>
      </div>
    </InformationalPageLayout>
  );
};
