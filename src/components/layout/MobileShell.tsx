import React, { useEffect, useRef } from 'react';
import { BottomTabBar } from './BottomTabBar';
import { useVaultStore } from '@/store/useVaultStore';
import { ingestImageFiles } from '@/lib/file-processing';
import { DarkroomConstellation } from '@/components/ui/DarkroomConstellation';
import { ScrapItBroLogo } from '@/components/ui/ScrapItBroLogo';
import { Plus, Image as ImageIcon, Settings as SettingsIcon } from 'lucide-react';
import { Link, useLocation, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

interface MobileShellProps {
  children: React.ReactNode;
}

export const MobileShell: React.FC<MobileShellProps> = ({ children }) => {
  const { initStore } = useVaultStore();
  const location = useLocation();
  const isDetail = location.pathname.startsWith('/photo/');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initStore();
  }, [initStore]);

  useEffect(() => {
    const handleShutter = () => {
      fileInputRef.current?.click();
    };
    window.addEventListener('vault:shutter', handleShutter);
    return () => window.removeEventListener('vault:shutter', handleShutter);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      ingestImageFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen vault-bg text-slate-900 flex flex-col items-center selection:bg-indigo-500/20 selection:text-indigo-700 relative">
      {/* Hidden File Input for Global Ingestion */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Subtle Ambient Background */}
      <DarkroomConstellation />

      {/* Main Responsive Application Shell */}
      <div className="w-full max-w-6xl min-h-screen flex flex-col relative z-10">
        {/* Top Header Navigation (hidden on photo detail pages to prevent double headers) */}
        {!isDetail && (
          <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 px-4 sm:px-8 py-3.5 transition-colors">
            <div className="flex items-center justify-between">
              {/* Logo & Brand Wordmark */}
              <Link to="/" className="flex items-center gap-2.5 group focus:outline-hidden">
                <ScrapItBroLogo size={32} showText={true} textSize="md" />
              </Link>

              {/* Desktop Navigation Links */}
              <div className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1 rounded-xl border border-slate-200/60">
                <NavLink
                  to="/"
                  onClick={(e) => {
                    if (location.pathname === '/') {
                      e.preventDefault();
                      window.dispatchEvent(new CustomEvent('vault:scroll-to-photos'));
                    }
                  }}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-white text-indigo-600 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`
                  }
                >
                  <ImageIcon className="w-3.5 h-3.5 stroke-[2]" />
                  <span>Photos</span>
                </NavLink>
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-white text-indigo-600 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`
                  }
                >
                  About
                </NavLink>
                <NavLink
                  to="/how-it-works"
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-white text-indigo-600 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`
                  }
                >
                  How It Works
                </NavLink>
                <NavLink
                  to="/security"
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-white text-indigo-600 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`
                  }
                >
                  Security
                </NavLink>
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-white text-indigo-600 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`
                  }
                >
                  <SettingsIcon className="w-3.5 h-3.5 stroke-[2]" />
                  <span>Settings</span>
                </NavLink>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Desktop Import Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Photos</span>
                </motion.button>

                {/* Mobile Settings Icon Link */}
                <Link
                  to="/settings"
                  className="md:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                  title="Settings"
                >
                  <SettingsIcon className="w-4 h-4 stroke-[2]" />
                </Link>
              </div>
            </div>
          </header>
        )}

        {/* Viewport Content */}
        <main className="flex-1 flex flex-col pb-24 md:pb-12 relative z-10 w-full">
          {children}
        </main>

        {/* Mobile Floating Bottom Dock (hidden on desktop and detail pages) */}
        {!isDetail && <BottomTabBar />}
      </div>
    </div>
  );
};
