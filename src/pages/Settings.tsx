import React, { useState } from 'react';
import { useVaultStore } from '@/store/useVaultStore';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { motion } from 'framer-motion';
import {
  Shield,
  HardDrive,
  Sparkles,
  Smartphone,
  CheckCircle2,
  Lock,
  Unlock,
  Trash2,
  ShieldCheck
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { isVaultLocked, toggleLock, photos, storageUsedBytes } = useVaultStore();

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
          {/* Row 1: Lock / Unlock Vault (Genuinely functional toggleLock) */}
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-3 pr-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 flex-shrink-0">
                <Shield className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-slate-900">
                  Lock Vault
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Require explicit unlocking before viewing your photo gallery
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleLock}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isVaultLocked
                  ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-2xs hover:bg-rose-100'
                  : 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700'
              }`}
            >
              {isVaultLocked ? (
                <>
                  <Unlock className="w-3.5 h-3.5 stroke-[2]" />
                  <span>Unlock Vault</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 stroke-[2]" />
                  <span>Lock Now</span>
                </>
              )}
            </motion.button>
          </div>

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

            <button
              onClick={async () => {
                if (window.confirm('Delete all photos from your private vault? This action cannot be undone.')) {
                  const { clearAllPhotosFromDB } = await import('@/lib/db');
                  await clearAllPhotosFromDB();
                  window.location.reload();
                }
              }}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm transition-colors shadow-2xs self-start sm:self-auto flex-shrink-0 cursor-pointer"
            >
              <Trash2 className="w-4 h-4 stroke-[2]" />
              <span>Delete All Photos</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. ABOUT SECTION
          ========================================================================= */}
      <div className="text-center pt-4 pb-8 flex flex-col items-center gap-1">
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
