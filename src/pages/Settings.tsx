import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useVaultStore } from '@/store/useVaultStore';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { PinModal, type PinModalMode } from '@/components/ui/PinModal';
import { motion } from 'framer-motion';
import { useSEO } from '@/lib/seo';
import {
  Shield,
  HardDrive,
  Sparkles,
  Smartphone,
  CheckCircle2,
  Lock,
  Trash2,
  ShieldCheck,
  KeyRound
} from 'lucide-react';

export const Settings: React.FC = () => {
  useSEO({
    title: 'Settings — ScrapItBro',
    description: 'Manage your local ScrapItBro preferences, storage, and security PIN.',
    noindex: true,
  });
  const {
    isPinConfigured,
    lockVault,
    refreshPinState,
    photos,
    storageUsedBytes
  } = useVaultStore();

  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinModalMode, setPinModalMode] = useState<PinModalMode>('setup');

  // Persistent Ambient Particles preference
  const [ambientParticles, setAmbientParticles] = useState<boolean>(() => {
    try {
      return localStorage.getItem('photovault:ambient_particles') !== 'false';
    } catch {
      return true;
    }
  });

  const toggleAmbientParticles = () => {
    const nextVal = !ambientParticles;
    setAmbientParticles(nextVal);
    try {
      localStorage.setItem('photovault:ambient_particles', String(nextVal));
      window.dispatchEvent(new CustomEvent('vault:particles-changed', { detail: nextVal }));
    } catch {}
  };

  const usedMBNum = storageUsedBytes / (1024 * 1024);

  return (
    <div className="flex flex-col p-4 sm:p-8 max-w-2xl mx-auto w-full space-y-6 sm:space-y-8">
      {/* PIN Security Modal */}
      <PinModal
        isOpen={pinModalOpen}
        mode={pinModalMode}
        onClose={() => setPinModalOpen(false)}
        onSuccess={() => {
          refreshPinState();
        }}
      />

      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
          Security, storage, and app preferences.
        </p>
      </div>

      {/* =========================================================================
          1. SECURITY SECTION
          ========================================================================= */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
          Security
        </span>
        <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col divide-y divide-slate-100">
          {/* Row 1: Real Local PIN Vault Lock */}
          {!isPinConfigured ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
              <div className="flex items-center gap-3 pr-2">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-500 flex-shrink-0">
                  <Shield className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900">
                    Vault Lock
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Protect your local vault with a PIN on this device
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ y: -1.5 }}
                whileTap={{ scale: 0.97, y: 0 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => {
                  setPinModalMode('setup');
                  setPinModalOpen(true);
                }}
                className="group px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs hover:shadow-md hover:shadow-indigo-500/20 border border-indigo-500/30 transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 self-start sm:self-auto"
              >
                <KeyRound className="w-3.5 h-3.5 stroke-[2] group-hover:translate-x-0.5 transition-transform duration-150" />
                <span>Set PIN</span>
              </motion.button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 pr-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 flex-shrink-0">
                    <ShieldCheck className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900">
                      Vault Lock
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      PIN protection is active on this device
                    </div>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold flex-shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Protected</span>
                </div>
              </div>

              {/* PIN Action Controls */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <motion.button
                  whileHover={{ y: -1.5 }}
                  whileTap={{ scale: 0.97, y: 0 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => {
                    lockVault();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 stroke-[2]" />
                  <span>Lock Vault Now</span>
                </motion.button>

                <motion.button
                  whileHover={{ y: -1.5 }}
                  whileTap={{ scale: 0.97, y: 0 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => {
                    setPinModalMode('change');
                    setPinModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer"
                >
                  Change PIN
                </motion.button>

                <motion.button
                  whileHover={{ y: -1.5 }}
                  whileTap={{ scale: 0.97, y: 0 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => {
                    setPinModalMode('disable');
                    setPinModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200/70 hover:border-rose-300 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer"
                >
                  Disable PIN
                </motion.button>
              </div>
            </div>
          )}

          {/* Row 2: Device Sandbox Status (Factual, truthful status) */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-3 pr-2">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 flex-shrink-0">
                <ShieldCheck className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-900">
                  Device Sandbox Protection
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Vault access is isolated within your device's browser profile
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Protected</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. STORAGE SECTION
          ========================================================================= */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
          Storage
        </span>
        <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col divide-y divide-slate-100">
          {/* Row 1: Stored Photos & Exact MB Size */}
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-3 pr-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 flex-shrink-0">
                <HardDrive className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-900">
                  Photos Stored Locally
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  <AnimatedCounter value={photos.length} /> {photos.length === 1 ? 'photo' : 'photos'} saved in local storage
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs sm:text-sm font-bold text-slate-900">
                <AnimatedCounter value={usedMBNum} decimals={1} suffix=" MB" />
              </span>
              <div className="text-[10px] text-slate-400 font-medium">Device Storage</div>
            </div>
          </div>

          {/* Row 2: Offline Sandbox Availability */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-3 pr-2">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 flex-shrink-0">
                <Smartphone className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-900">
                  Offline Availability
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Works offline without requiring an internet connection
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold flex-shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. APPEARANCE SECTION
          ========================================================================= */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
          Appearance
        </span>
        <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs flex flex-col">
          {/* Row 1: Genuine Persistent Ambient Background Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 pr-2">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
                <Sparkles className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-900">
                  Ambient Particle Motion
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Subtle background canvas particle motion
                </div>
              </div>
            </div>

            <button
              onClick={toggleAmbientParticles}
              className={`w-12 h-7 rounded-full transition-colors relative p-0.5 cursor-pointer flex-shrink-0 ${
                ambientParticles ? 'bg-indigo-600' : 'bg-slate-200'
              }`}
              aria-label="Toggle Ambient Particle Motion"
            >
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={`w-6 h-6 rounded-full bg-white shadow-xs ${
                  ambientParticles ? 'ml-auto' : 'mr-auto'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. PRIVACY SECTION (Factual, conservative, verifiable)
          ========================================================================= */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
          Privacy
        </span>
        <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col gap-3">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                Private by Design
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                ScrapItBro helps you inspect the hidden details in your photos and create cleaner copies before sharing them. All metadata extraction, inspection, and lossless cleaning happen entirely in your device's memory. Your photos are not sent to any external server.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          5. DANGER ZONE (Destructive actions)
          ========================================================================= */}
      {photos.length > 0 && (
        <div className="flex flex-col gap-2 pt-1">
          <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider px-1">
            Danger Zone
          </span>
          <div className="bg-rose-50/40 border border-rose-200/70 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs sm:text-sm font-bold text-rose-950">
                Delete All Photos
              </div>
              <div className="text-xs text-rose-700/90 mt-0.5 leading-snug">
                Permanently remove all photos from this browser vault. This action cannot be undone.
              </div>
            </div>

            <motion.button
              whileHover={{ y: -1.5 }}
              whileTap={{ scale: 0.97, y: 0 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              onClick={async () => {
                if (window.confirm('Delete all photos from your private vault? This action cannot be undone.')) {
                  const { clearAllPhotosFromDB } = await import('@/lib/db');
                  await clearAllPhotosFromDB();
                  window.location.reload();
                }
              }}
              className="group flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm shadow-2xs hover:shadow-md hover:shadow-rose-500/20 transition-all duration-200 self-start sm:self-auto flex-shrink-0 cursor-pointer"
            >
              <Trash2 className="w-4 h-4 stroke-[2] group-hover:translate-x-0.5 transition-transform duration-150" />
              <span>Delete All Photos</span>
            </motion.button>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. LEARN & LEGAL SECTION (The Canonical Reference Pattern)
          ========================================================================= */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
          Learn &amp; Legal
        </span>
        <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-xs flex flex-col divide-y divide-slate-100 text-xs font-medium text-slate-700">
          <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.99, x: 0 }} transition={{ duration: 0.15 }}>
            <Link
              to="/about"
              className="py-2.5 px-3 rounded-xl hover:text-indigo-600 hover:bg-indigo-50/50 flex items-center justify-between transition-all duration-180 group"
            >
              <span>About ScrapItBro</span>
              <span className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-180 text-sm">&rarr;</span>
            </Link>
          </motion.div>
          <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.99, x: 0 }} transition={{ duration: 0.15 }}>
            <Link
              to="/how-it-works"
              className="py-2.5 px-3 rounded-xl hover:text-indigo-600 hover:bg-indigo-50/50 flex items-center justify-between transition-all duration-180 group"
            >
              <span>How It Works</span>
              <span className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-180 text-sm">&rarr;</span>
            </Link>
          </motion.div>
          <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.99, x: 0 }} transition={{ duration: 0.15 }}>
            <Link
              to="/security"
              className="py-2.5 px-3 rounded-xl hover:text-indigo-600 hover:bg-indigo-50/50 flex items-center justify-between transition-all duration-180 group"
            >
              <span>Security &amp; Privacy Architecture</span>
              <span className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-180 text-sm">&rarr;</span>
            </Link>
          </motion.div>
          <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.99, x: 0 }} transition={{ duration: 0.15 }}>
            <Link
              to="/privacy"
              className="py-2.5 px-3 rounded-xl hover:text-indigo-600 hover:bg-indigo-50/50 flex items-center justify-between transition-all duration-180 group"
            >
              <span>Privacy Policy</span>
              <span className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-180 text-sm">&rarr;</span>
            </Link>
          </motion.div>
          <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.99, x: 0 }} transition={{ duration: 0.15 }}>
            <Link
              to="/terms"
              className="py-2.5 px-3 rounded-xl hover:text-indigo-600 hover:bg-indigo-50/50 flex items-center justify-between transition-all duration-180 group"
            >
              <span>Terms of Use</span>
              <span className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-180 text-sm">&rarr;</span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* =========================================================================
          7. ABOUT BRAND
          ========================================================================= */}
      <div className="text-center pt-2 pb-8 flex flex-col items-center gap-1">
        <p className="text-xs font-semibold text-slate-500">
          ScrapItBro · Version 0.1.0 (Stable)
        </p>
        <p className="text-[11px] text-slate-400">
          Scrap the details. Keep the photo.
        </p>
      </div>
    </div>
  );
};
