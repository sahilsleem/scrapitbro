import React from 'react';
import { Link } from 'react-router-dom';
import { ScrapItBroLogo } from '@/components/ui/ScrapItBroLogo';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-6 sm:mt-16 border-t border-slate-200/80 bg-white/70 backdrop-blur-md relative z-10 transition-colors">
      <div className="max-w-6xl mx-auto px-3.5 sm:px-8 pt-4 sm:pt-8 pb-3 sm:pb-5 flex flex-col gap-3.5 sm:gap-6">
        
        {/* Main 2-Half Grid on Mobile & Desktop */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-3.5 sm:gap-8 md:gap-10">
          
          {/* LEFT SIDE: Brand, Tagline, Short Description, Badge (50% on mobile, 6 cols on desktop) */}
          <div className="col-span-1 md:col-span-6 flex flex-col gap-1.5 sm:gap-2.5">
            <Link to="/" className="flex items-center gap-1.5 group w-fit focus:outline-hidden">
              <ScrapItBroLogo size={20} showText={true} textSize="sm" />
            </Link>
            
            <p className="text-[11px] sm:text-xs font-semibold text-indigo-600 tracking-tight leading-tight">
              Scrap the details.<br className="sm:hidden" /> Keep the photo.
            </p>
            
            <p className="text-[10px] sm:text-xs text-slate-500 leading-snug font-normal max-w-sm">
              ScrapItBro helps you see hidden photo details and create clean copies before sharing. Originals stay untouched.
            </p>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-[9px] sm:text-[11px] font-semibold w-fit shadow-2xs mt-0.5">
              <ShieldCheck className="w-3 h-3 stroke-[2.2]" />
              <span>100% Private &amp; On-Device</span>
            </div>
          </div>

          {/* RIGHT SIDE: Navigation Links (50% on mobile, 6 cols on desktop) */}
          <div className="col-span-1 md:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 md:gap-8 text-[10px] sm:text-xs">
            
            {/* Group 1: Learn / Info */}
            <div className="flex flex-col gap-1 sm:gap-2">
              <span className="text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Learn
              </span>
              <ul className="flex flex-col gap-0.5 sm:gap-1.5 font-medium text-slate-600">
                <li>
                  <Link
                    to="/about"
                    className="inline-block hover:text-indigo-600 hover:translate-x-1 transition-all duration-180"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to="/how-it-works"
                    className="inline-block hover:text-indigo-600 hover:translate-x-1 transition-all duration-180"
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    to="/security"
                    className="inline-block hover:text-indigo-600 hover:translate-x-1 transition-all duration-180"
                  >
                    Security
                  </Link>
                </li>
              </ul>
            </div>

            {/* Group 2: Privacy & Legal */}
            <div className="flex flex-col gap-1 sm:gap-2">
              <span className="text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Privacy &amp; Legal
              </span>
              <ul className="flex flex-col gap-0.5 sm:gap-1.5 font-medium text-slate-600">
                <li>
                  <Link
                    to="/privacy"
                    className="inline-block hover:text-indigo-600 hover:translate-x-1 transition-all duration-180"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="inline-block hover:text-indigo-600 hover:translate-x-1 transition-all duration-180"
                  >
                    Terms
                  </Link>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Compact Bottom Copyright Row */}
        <div className="pt-2 sm:pt-4 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-1 text-[9px] sm:text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 text-center sm:text-left">
            <span>&copy; 2026 ScrapItBro</span>
            <span>&middot;</span>
            <span>Simple, private photo cleanup.</span>
          </div>

          <p className="text-center sm:text-right text-slate-500 font-medium">
            Photo processing happens locally in your browser.
          </p>
        </div>

      </div>
    </footer>
  );
};
