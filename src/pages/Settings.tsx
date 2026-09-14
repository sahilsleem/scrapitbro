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
  KeyRound,
  Trash2,
  Info
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { isVaultLocked, toggleLock, photos, storageUsedBytes, totalCapacityBytes } = useVaultStore();
  const [biometrics, setBiometrics] = useState(true);
  const [ambientParticles, setAmbientParticles] = useState(true);

  const usedMBNum = storageUsedBytes / (1024 * 1024);
  const totalGBNum = totalCapacityBytes / (1024 * 1024 * 1024);
  const percentUsed = (storageUsedBytes / totalCapacityBytes) * 100;

  return (
    <div className="flex flex-col p-4 sm:p-8 max-w-2xl mx-auto w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
          Security, storage, and app preferences
        </p>
      </div>

      {/* 1. Security Section */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
          Security
        </span>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-4">
          {/* Lock / Unlock Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                <Shield className="w-4 h-4 stroke-[2]" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-semibold text-slate-900">Lock Vault</div>
                <div className="text-[11px] text-slate-500">Require unlock to view photos</div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleLock}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                isVaultLocked
                  ? 'bg-rose-50 text-rose-600 border border-rose-200'
                  : 'bg-indigo-600 text-white shadow-xs hover:bg-indigo-700'
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

          {/* Biometrics / Passkey */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-center text-slate-600 flex-shrink-0">
                <KeyRound className="w-4 h-4 stroke-[2]" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-semibold text-slate-900">Passkey / Biometric Unlock</div>
                <div className="text-[11px] text-slate-500">Fast authentication with device biometrics</div>
              </div>
            </div>
            <button
              onClick={() => setBiometrics(!biometrics)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                biometrics ? 'bg-indigo-600' : 'bg-slate-200'
              }`}
            >
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={`w-5 h-5 rounded-full bg-white shadow-xs ${
                  biometrics ? 'ml-auto' : 'mr-auto'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Storage Section */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
          Storage
        </span>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                <HardDrive className="w-4 h-4 stroke-[2]" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-semibold text-slate-900">Storage Used</div>
                <div className="text-[11px] text-slate-500">
                  <AnimatedCounter value={photos.length} /> {photos.length === 1 ? 'photo' : 'photos'} saved locally
                </div>
              </div>
            </div>
            <span className="text-xs font-medium text-slate-600">
              <AnimatedCounter value={usedMBNum} decimals={1} suffix=" MB" />
            </span>
          </div>

          {/* Storage Bar */}
          <div className="flex flex-col gap-1.5 pt-0.5">
            <div className="flex justify-between text-xs text-slate-500">
              <span>{usedMBNum.toFixed(1)} MB used</span>
              <span>{totalGBNum.toFixed(0)} GB quota</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <motion.div
                className="h-full bg-indigo-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(percentUsed, 3)}%` }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              />
            </div>
          </div>

          {/* PWA Badge */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/70 rounded-xl p-3">
            <Smartphone className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-900">Offline Availability</span>
              <span className="text-[11px] text-slate-500">
                Available offline without internet
              </span>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />
          </div>
        </div>
      </div>

      {/* 3. Appearance */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
          Appearance
        </span>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
                <Sparkles className="w-4 h-4 stroke-[2]" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-semibold text-slate-900">Ambient Animation</div>
                <div className="text-[11px] text-slate-500">Subtle background particle motion</div>
              </div>
            </div>
            <button
              onClick={() => setAmbientParticles(!ambientParticles)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                ambientParticles ? 'bg-indigo-600' : 'bg-slate-200'
              }`}
            >
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className={`w-5 h-5 rounded-full bg-white shadow-xs ${
                  ambientParticles ? 'ml-auto' : 'mr-auto'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Privacy & About */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
          Privacy
        </span>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0 mt-0.5">
              <Info className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-semibold text-slate-900">How PhotoVault stores your photos</h2>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                PhotoVault runs 100% on your device. Your photos and encryption keys remain in your browser sandbox. No backend servers, no analytics, and no accounts.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Danger Zone */}
      {photos.length > 0 && (
        <div className="flex flex-col gap-2 pt-2">
          <span className="text-xs font-semibold text-rose-500 uppercase tracking-wider px-1">
            Danger Zone
          </span>
          <div className="bg-rose-50/40 border border-rose-200/70 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs sm:text-sm font-semibold text-rose-900">Delete All Photos</div>
              <div className="text-[11px] text-rose-600">Permanently remove all photos from this browser</div>
            </div>
            <button
              onClick={async () => {
                if (window.confirm('Delete all photos from your private vault? This action cannot be undone.')) {
                  const { clearAllPhotosFromDB } = await import('@/lib/db');
                  await clearAllPhotosFromDB();
                  window.location.reload();
                }
              }}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs transition-colors shadow-2xs self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
              <span>Delete All Photos</span>
            </button>
          </div>
        </div>
      )}

      {/* App Version Stamp */}
      <div className="text-center pt-2 pb-6">
        <p className="text-xs text-slate-400 font-medium">
          PhotoVault • Version 2.1
        </p>
      </div>
    </div>
  );
};
