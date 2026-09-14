import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ScrapItBroLogo } from '@/components/ui/ScrapItBroLogo';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  const navigate = useNavigate();

  const handleAddPhotos = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.location.pathname === '/') {
      window.dispatchEvent(new CustomEvent('vault:shutter'));
    } else {
      navigate('/');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('vault:shutter'));
      }, 150);
    }
  };

  const handlePhotosClick = (e: React.MouseEvent) => {
    if (window.location.pathname === '/') {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('vault:scroll-to-photos'));
    }
  };

  return (
    <footer className="w-full mt-16 sm:mt-24 border-t border-slate-200/80 bg-white/70 backdrop-blur-md relative z-10 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-14 flex flex-col gap-10">
        
        {/* Main Footer Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-10">
          
          {/* Brand & Mission Column (Desktop span 5) */}
          <div className="md:col-span-5 flex flex-col gap-3.5">
            <Link to="/" className="flex items-center gap-2.5 group w-fit focus:outline-hidden">
              <ScrapItBroLogo size={28} showText={true} textSize="sm" />
            </Link>
            
            <p className="text-xs font-semibold text-indigo-600 tracking-tight">
              Scrap the details. Keep the photo.
            </p>
            
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm font-normal">
              ScrapItBro helps you see the hidden details in your photos and create cleaner copies before you share them. Your original photo stays untouched.
            </p>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-semibold w-fit mt-1 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 stroke-[2]" />
              <span>100% Private &amp; On-Device</span>
            </div>
          </div>

          {/* Navigation Link Groups (Desktop span 7) */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Group 1: Product */}
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Product
              </span>
              <ul className="flex flex-col gap-2 text-xs font-medium text-slate-600">
                <li>
                  <Link
                    to="/"
                    onClick={handlePhotosClick}
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Photos
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleAddPhotos}
                    className="hover:text-indigo-600 transition-colors text-left cursor-pointer"
                  >
                    Add Photos
                  </button>
                </li>
                <li>
                  <Link
                    to="/settings"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Settings
                  </Link>
                </li>
              </ul>
            </div>

            {/* Group 2: Learn */}
            <div className="flex flex-col gap-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Learn
              </span>
              <ul className="flex flex-col gap-2 text-xs font-medium text-slate-600">
                <li>
                  <Link
                    to="/about"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    About ScrapItBro
                  </Link>
                </li>
                <li>
                  <Link
                    to="/how-it-works"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    to="/security"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Security
                  </Link>
                </li>
              </ul>
            </div>

            {/* Group 3: Privacy & Legal */}
            <div className="flex flex-col gap-3 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Privacy &amp; Legal
              </span>
              <ul className="flex flex-col gap-2 text-xs font-medium text-slate-600">
                <li>
                  <Link
                    to="/privacy"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Terms of Use
                  </Link>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Bottom Sub-Row & Copyright */}
        <div className="pt-6 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span>&copy; 2026 ScrapItBro</span>
            <span>&middot;</span>
            <span>Designed for simple, private photo cleanup.</span>
          </div>

          <p className="text-center sm:text-right text-slate-500 font-medium">
            Photo processing happens locally in your browser.
          </p>
        </div>

      </div>
    </footer>
  );
};
