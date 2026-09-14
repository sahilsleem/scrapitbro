import React, { useState, useEffect, useRef } from 'react';
import { useVaultStore } from '@/store/useVaultStore';
import { ingestImageFiles } from '@/lib/file-processing';
import { DarkroomConstellation } from '@/components/ui/DarkroomConstellation';
import { ScrapItBroLogo } from '@/components/ui/ScrapItBroLogo';
import {
  Image as ImageIcon,
  Settings as SettingsIcon,
  Menu,
  X,
  Mail
} from 'lucide-react';
import { Link, useLocation, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { tabPillTransition } from '@/lib/motion';

interface MobileShellProps {
  children: React.ReactNode;
}

export const MobileShell: React.FC<MobileShellProps> = ({ children }) => {
  const { initStore } = useVaultStore();
  const location = useLocation();
  const isDetail = location.pathname.startsWith('/photo/');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  // Close mobile menu whenever location changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Handle ESC key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  // Immediately close mobile menu when user scrolls vertically in any direction
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleScroll = () => {
      setIsMenuOpen(false);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMenuOpen]);

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
        {/* Top Header Floating Glass Box Navigation (hidden on photo detail pages to prevent double headers) */}
        {!isDetail && (
          <div className="relative z-30 w-full pt-3 sm:pt-4 px-3.5 sm:px-6 md:px-8">
            <motion.header
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full vault-glass-panel rounded-2xl sm:rounded-3xl px-4 sm:px-6 py-2.5 sm:py-3 transition-colors"
            >
              <div className="flex items-center justify-between">
                {/* Logo & Brand Wordmark */}
                <Link to="/" className="flex items-center gap-2.5 group focus:outline-hidden">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  >
                    <ScrapItBroLogo size={28} showText={true} textSize="md" />
                  </motion.div>
                </Link>

                {/* Header Right: Desktop Navigation Links & Mobile Hamburger */}
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Desktop Navigation Links */}
                  <nav className="hidden md:flex items-center gap-1 bg-slate-100/50 backdrop-blur-xs p-1 rounded-xl border border-slate-200/50 relative shadow-2xs" aria-label="Main Navigation">
                    <NavLink
                      to="/"
                      onClick={(e) => {
                        if (location.pathname === '/') {
                          e.preventDefault();
                          window.dispatchEvent(new CustomEvent('vault:scroll-to-photos'));
                        }
                      }}
                      className={({ isActive }) =>
                        `relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors group select-none ${
                          isActive
                            ? 'text-indigo-600 font-semibold'
                            : 'text-slate-600 hover:text-indigo-600'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <motion.div
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.97, y: 0 }}
                          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                          className="flex items-center gap-1.5"
                        >
                          {isActive && (
                            <motion.div
                              layoutId="activeNavPill"
                              className="absolute inset-0 bg-white/85 backdrop-blur-xs rounded-lg shadow-xs"
                              transition={tabPillTransition}
                            />
                          )}
                          <span className="relative z-10 flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5 stroke-[2] group-hover:translate-x-0.5 transition-transform duration-150" />
                            <span>Photos</span>
                          </span>
                        </motion.div>
                      )}
                    </NavLink>
                    <NavLink
                      to="/about"
                      className={({ isActive }) =>
                        `relative px-3 py-1.5 rounded-lg text-xs font-medium transition-colors group select-none ${
                          isActive
                            ? 'text-indigo-600 font-semibold'
                            : 'text-slate-600 hover:text-indigo-600'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <motion.div
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.97, y: 0 }}
                          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="activeNavPill"
                              className="absolute inset-0 bg-white rounded-lg shadow-xs"
                              transition={tabPillTransition}
                            />
                          )}
                          <span className="relative z-10">About</span>
                        </motion.div>
                      )}
                    </NavLink>
                    <NavLink
                      to="/how-it-works"
                      className={({ isActive }) =>
                        `relative px-3 py-1.5 rounded-lg text-xs font-medium transition-colors group select-none ${
                          isActive
                            ? 'text-indigo-600 font-semibold'
                            : 'text-slate-600 hover:text-indigo-600'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <motion.div
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.97, y: 0 }}
                          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="activeNavPill"
                              className="absolute inset-0 bg-white rounded-lg shadow-xs"
                              transition={tabPillTransition}
                            />
                          )}
                          <span className="relative z-10">How It Works</span>
                        </motion.div>
                      )}
                    </NavLink>
                    <NavLink
                      to="/security"
                      className={({ isActive }) =>
                        `relative px-3 py-1.5 rounded-lg text-xs font-medium transition-colors group select-none ${
                          isActive
                            ? 'text-indigo-600 font-semibold'
                            : 'text-slate-600 hover:text-indigo-600'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <motion.div
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.97, y: 0 }}
                          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="activeNavPill"
                              className="absolute inset-0 bg-white rounded-lg shadow-xs"
                              transition={tabPillTransition}
                            />
                          )}
                          <span className="relative z-10">Security</span>
                        </motion.div>
                      )}
                    </NavLink>
                    <NavLink
                      to="/settings"
                      className={({ isActive }) =>
                        `relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors group select-none ${
                          isActive
                            ? 'text-indigo-600 font-semibold'
                            : 'text-slate-600 hover:text-indigo-600'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <motion.div
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.97, y: 0 }}
                          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                          className="flex items-center gap-1.5"
                        >
                          {isActive && (
                            <motion.div
                              layoutId="activeNavPill"
                              className="absolute inset-0 bg-white rounded-lg shadow-xs"
                              transition={tabPillTransition}
                            />
                          )}
                          <span className="relative z-10 flex items-center gap-1.5">
                            <SettingsIcon className="w-3.5 h-3.5 stroke-[2] group-hover:translate-x-0.5 transition-transform duration-150" />
                            <span>Settings</span>
                          </span>
                        </motion.div>
                      )}
                    </NavLink>
                  </nav>

                  {/* Mobile Hamburger Button */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                    className="md:hidden p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/70 active:bg-indigo-100/60 transition-colors focus:outline-hidden cursor-pointer"
                    aria-label="Toggle navigation menu"
                    aria-expanded={isMenuOpen}
                  >
                    {isMenuOpen ? (
                      <X className="w-5 h-5 stroke-[2.2]" />
                    ) : (
                      <Menu className="w-5 h-5 stroke-[2.2]" />
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.header>

            {/* Floating Popover Menu (anchored relative to header) */}
            <AnimatePresence>
              {isMenuOpen && (
                <>
                  {/* Subtle transparent click-away overlay */}
                  <div
                    onClick={() => setIsMenuOpen(false)}
                    className="fixed inset-0 z-40 bg-transparent cursor-default"
                  />

                  {/* Floating Menu Popover Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -6 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute top-[calc(100%+8px)] right-3.5 sm:right-6 md:right-8 z-50 w-[min(260px,calc(100vw-28px))] vault-glass-popover rounded-2xl p-2.5 flex flex-col gap-2"
                  >
                    {/* PRODUCT GROUP */}
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 pb-0.5">
                        Product
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.99, x: 0 }} transition={{ duration: 0.15 }}>
                          <Link
                            to="/"
                            onClick={() => {
                              setIsMenuOpen(false);
                              if (location.pathname === '/') {
                                window.dispatchEvent(new CustomEvent('vault:scroll-to-photos'));
                              }
                            }}
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 transition-colors group"
                          >
                            <ImageIcon className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all stroke-[2]" />
                            <span>Photos</span>
                          </Link>
                        </motion.div>
                        <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.99, x: 0 }} transition={{ duration: 0.15 }}>
                          <Link
                            to="/settings"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 transition-colors group"
                          >
                            <SettingsIcon className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all stroke-[2]" />
                            <span>Settings</span>
                          </Link>
                        </motion.div>
                      </div>
                    </div>

                    <div className="h-px bg-slate-100/60" />

                    {/* CONTACT GROUP */}
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 pb-0.5">
                        Contact
                      </span>
                      <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.99, x: 0 }} transition={{ duration: 0.15 }}>
                        <Link
                          to="/contact"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 transition-colors group"
                        >
                          <Mail className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all stroke-[2]" />
                          <span>Contact</span>
                        </Link>
                      </motion.div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Viewport Content */}
        <main className="flex-1 flex flex-col relative z-10 w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
