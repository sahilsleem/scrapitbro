import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useVaultStore } from '@/store/useVaultStore';
import { ingestImageFiles } from '@/lib/file-processing';
import { ScrapItBroLogo } from '@/components/ui/ScrapItBroLogo';
import type { VaultFilter } from '@/types';
import {
  Heart,
  Lock,
  UploadCloud,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  Plus,
  Eye,
  ShieldCheck,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  ArrowDown
} from 'lucide-react';

const FILTER_TABS: { key: VaultFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'favorites', label: 'Favorites' },
];

const SHOWCASE_HIDE_PREF_KEY = 'photovault:hide_showcase';

function formatGridDate(dateString?: string): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

export function scrollToPhotosSection() {
  const el = document.getElementById('your-photos');
  if (el) {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({
      behavior: prefersReduced ? 'auto' : 'smooth',
      block: 'start',
    });
  }
}

export const Library: React.FC = () => {
  const navigate = useNavigate();
  const {
    photos,
    activeFilter,
    setFilter,
    toggleFavorite,
    isVaultLocked,
    toggleLock,
    ingestionQueue,
    clearCompletedTasks,
    duplicateAlerts,
    dismissDuplicateAlert
  } = useVaultStore();

  const [isDragging, setIsDragging] = useState(false);
  
  // Persistent user preference for showcase visibility (OPEN by default on fresh visits)
  const [isHideShowcasePreference, setIsHideShowcasePreference] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SHOWCASE_HIDE_PREF_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const dragCounter = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wasIngestingRef = useRef(false);

  const hasPhotos = photos.length > 0;
  const showFeatureShowcase = !isHideShowcasePreference;

  const handleHideShowcase = () => {
    setIsHideShowcasePreference(true);
    try {
      localStorage.setItem(SHOWCASE_HIDE_PREF_KEY, 'true');
    } catch {}
  };

  const handleShowShowcase = () => {
    setIsHideShowcasePreference(false);
    try {
      localStorage.removeItem(SHOWCASE_HIDE_PREF_KEY);
    } catch {}
  };

  // Listen for navigation events to smoothly scroll to photos
  useEffect(() => {
    const handleScrollReq = () => {
      scrollToPhotosSection();
    };
    window.addEventListener('vault:scroll-to-photos', handleScrollReq);

    if (window.location.hash === '#your-photos') {
      setTimeout(scrollToPhotosSection, 150);
    }

    return () => window.removeEventListener('vault:scroll-to-photos', handleScrollReq);
  }, []);

  // Drag and Drop global listeners
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current++;
      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current--;
      if (dragCounter.current <= 0) {
        setIsDragging(false);
        dragCounter.current = 0;
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        ingestImageFiles(Array.from(e.dataTransfer.files));
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
        const files = Array.from(e.clipboardData.files).filter((f) => f.type.startsWith('image/'));
        if (files.length > 0) {
          e.preventDefault();
          ingestImageFiles(files);
        }
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);
    window.addEventListener('paste', handlePaste);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
      window.removeEventListener('paste', handlePaste);
    };
  }, []);

  const handleManualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      ingestImageFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const filteredPhotos = photos.filter((photo) => {
    if (activeFilter === 'favorites') return photo.isFavorite;
    return true;
  });

  const activeIngestions = ingestionQueue.filter(
    (t) => t.status === 'pending' || t.status === 'hashing' || t.status === 'exif' || t.status === 'thumbnail' || t.status === 'saving'
  );
  const completedIngestions = ingestionQueue.filter((t) => t.status === 'completed');

  const totalProgress = ingestionQueue.length > 0
    ? Math.round(ingestionQueue.reduce((acc, item) => acc + (item.progress || 0), 0) / ingestionQueue.length)
    : 0;

  const isIngestionActive = activeIngestions.length > 0;
  const isIngestionComplete = ingestionQueue.length > 0 && !isIngestionActive;

  // Automatic Post-Import Smooth Scroll to "Your Photos"
  useEffect(() => {
    if (activeIngestions.length > 0) {
      wasIngestingRef.current = true;
    } else if (wasIngestingRef.current && completedIngestions.length > 0) {
      wasIngestingRef.current = false;
      // Newly imported photos are ready in state; scroll smoothly to the photo library
      const timer = setTimeout(() => {
        scrollToPhotosSection();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [activeIngestions.length, completedIngestions.length]);

  // Automatically dismiss ingestion progress card shortly after all photos finish importing
  useEffect(() => {
    if (ingestionQueue.length > 0 && activeIngestions.length === 0) {
      const timer = setTimeout(() => {
        clearCompletedTasks();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [ingestionQueue.length, activeIngestions.length, clearCompletedTasks]);

  // Vault Locked State
  if (isVaultLocked) {
    return (
      <div className="flex-1 min-h-[75vh] flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 22 }}
          className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center mb-5 text-indigo-600 shadow-xs"
        >
          <Lock className="w-8 h-8 stroke-[2]" />
        </motion.div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
          Your Vault is Locked
        </h2>
        <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
          Your photos are encrypted on this device. Unlock to view your gallery.
        </p>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 450, damping: 20 }}
          onClick={toggleLock}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-md shadow-indigo-500/20 transition-colors cursor-pointer"
        >
          Unlock Vault
        </motion.button>
      </div>
    );
  }

  return (
    <div className="flex flex-col relative min-h-full px-4 sm:px-8 pt-4 sm:pt-6 pb-12 max-w-6xl mx-auto w-full">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleManualUpload}
      />

      {/* Drag & Drop Visual Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-white/10 backdrop-blur-xl border-2 border-dashed border-indigo-400/80 flex flex-col items-center shadow-2xl shadow-indigo-950/40"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30 animate-bounce">
                <UploadCloud className="w-8 h-8 stroke-[2.2]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Drop photos to add to vault
              </h3>
              <p className="text-xs sm:text-sm text-indigo-200 mt-2 max-w-xs font-normal">
                Original quality preserved · 100% private & on-device
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Duplicate Alert Banner */}
      {duplicateAlerts.length > 0 && (
        <div className="mb-5 flex flex-col gap-2">
          {duplicateAlerts.map((alert) => (
            <motion.div
              key={alert.hash}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="p-3.5 bg-amber-50/90 border border-amber-200/80 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span className="truncate">
                  <strong className="font-semibold">Duplicate skipped:</strong> "{alert.filename}" is already in your vault.
                </span>
              </div>
              <button
                onClick={() => dismissDuplicateAlert(alert.hash)}
                className="p-1 text-amber-600/70 hover:text-amber-900 rounded-lg hover:bg-amber-100/50 transition-colors cursor-pointer flex-shrink-0"
                title="Dismiss"
              >
                <X className="w-4 h-4 stroke-[2]" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modern Consumer Import Progress Card */}
      <AnimatePresence>
        {ingestionQueue.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.25 } }}
            className="mb-6 overflow-hidden"
          >
            <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-sm shadow-indigo-950/5">
              {/* Header Status Row */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isIngestionActive
                      ? 'bg-indigo-50 border border-indigo-100 text-indigo-600'
                      : 'bg-emerald-50 border border-emerald-100 text-emerald-600'
                  }`}>
                    {isIngestionActive ? (
                      <Loader2 className="w-4 h-4 animate-spin stroke-[2.2]" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                      {isIngestionActive
                        ? `Adding ${ingestionQueue.length} ${ingestionQueue.length === 1 ? 'photo' : 'photos'} to your vault...`
                        : `All ${completedIngestions.length} ${completedIngestions.length === 1 ? 'photo' : 'photos'} added to your vault`}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-normal truncate">
                      {isIngestionActive
                        ? '100% on-device processing · Never uploaded to any server'
                        : 'Original quality preserved · Ready in your library'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                    {completedIngestions.length} / {ingestionQueue.length}
                  </span>
                  <button
                    onClick={clearCompletedTasks}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Dismiss"
                  >
                    <X className="w-4 h-4 stroke-[2]" />
                  </button>
                </div>
              </div>

              {/* Overall Progress Bar */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${totalProgress}%` }}
                  transition={{ ease: 'easeOut', duration: 0.3 }}
                  className={`h-full rounded-full ${
                    isIngestionComplete ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                  }`}
                />
              </div>

              {/* Photo Queue Items Strip */}
              <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
                {ingestionQueue.map((item) => {
                  const isDone = item.status === 'completed';
                  const isDup = item.status === 'duplicate';
                  const isErr = item.status === 'error';

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 p-2 rounded-xl bg-slate-50/80 border border-slate-100 text-xs hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Thumbnail or Fallback Icon */}
                        <div className="w-8 h-8 rounded-lg bg-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0 border border-slate-200">
                          {item.previewUrl ? (
                            <img
                              src={item.previewUrl}
                              alt={item.filename}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <span className="truncate font-medium text-slate-700 max-w-[180px] sm:max-w-xs">
                          {item.filename}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`text-[11px] font-medium ${
                            isDone
                              ? 'text-emerald-600'
                              : isDup
                              ? 'text-amber-600'
                              : isErr
                              ? 'text-rose-600'
                              : 'text-indigo-600'
                          }`}
                        >
                          {isDone && 'Ready'}
                          {isDup && 'Already in vault'}
                          {isErr && (item.error || 'Failed')}
                          {!isDone && !isDup && !isErr && (
                            item.status === 'hashing'
                              ? 'Reading bytes...'
                              : item.status === 'exif'
                              ? 'Extracting details...'
                              : item.status === 'thumbnail'
                              ? 'Creating preview...'
                              : item.status === 'saving'
                              ? 'Saving...'
                              : 'In queue...'
                          )}
                        </span>

                        {isDone && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 stroke-[2.2]" />
                        )}
                        {isDup && (
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500 stroke-[2.2]" />
                        )}
                        {!isDone && !isDup && !isErr && (
                          <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin stroke-[2.2]" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          HERO & FEATURE SHOWCASE SECTION (Concept #8 - "Feature Showcase")
          ========================================================================= */}
      {showFeatureShowcase ? (
        <section className="mb-8 sm:mb-12 flex flex-col items-center text-center">
          {/* Subtle Privacy Badge */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold mb-3 sm:mb-4 shadow-2xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Private & On-Device</span>
          </motion.div>

          {/* Primary Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15] max-w-2xl"
          >
            Photos,{' '}
            <span className="text-indigo-600">but private.</span>
          </motion.h1>

          {/* Short Human Explanation */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="text-sm sm:text-base text-slate-600 max-w-xl mt-3 sm:mt-4 leading-relaxed font-normal"
          >
            See what’s hidden inside your photos. Understand the information they contain. Keep your originals untouched and create cleaner copies when you need them.
          </motion.p>

          {/* Hero CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="mt-6 sm:mt-7 flex flex-col items-center gap-2.5 w-full sm:w-auto"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              {/* Primary Add Photos CTA */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm sm:text-base shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                <span>Add Photos</span>
              </motion.button>

              {/* Secondary Shortcut to Existing Library */}
              {hasPhotos && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  onClick={scrollToPhotosSection}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm sm:text-base border border-slate-200/80 shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>View Your Photos</span>
                  <ArrowDown className="w-4 h-4 text-indigo-600 stroke-[2.2]" />
                </motion.button>
              )}
            </div>

            <span className="text-[11px] text-slate-400 font-medium mt-0.5">
              Processed locally on this device · Originals are never modified
            </span>
          </motion.div>

          {/* 4 Core Capabilities Grid */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 mt-8 sm:mt-10 w-full max-w-3xl text-left"
          >
            {/* Card 1: Discover Hidden Information */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/80 text-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Eye className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                      Discover Hidden Information
                    </h3>
                    <p className="text-[11px] font-medium text-indigo-600">
                      See the details your photos carry.
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mt-2">
                  Camera information, timestamps, locations, lens details, and other embedded metadata.
                </p>
              </div>
            </div>

            {/* Card 2: Keep Your Original Safe */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/80 text-indigo-600 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                      Keep Your Original Safe
                    </h3>
                    <p className="text-[11px] font-medium text-indigo-600">
                      Your original photo stays untouched.
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mt-2">
                  ScrapItBro keeps your original file exactly as you added it — without resizing or recompressing it.
                </p>
              </div>
            </div>

            {/* Card 3: Clean & Export */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/80 text-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                      Clean & Export
                    </h3>
                    <p className="text-[11px] font-medium text-indigo-600">
                      Remove hidden metadata from a separate copy.
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mt-2">
                  Create a cleaner copy when you want to share a photo without supported metadata.
                </p>
              </div>
            </div>

            {/* Card 4: Your Privacy, Your Control */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/80 text-indigo-600 flex items-center justify-center flex-shrink-0">
                    <SlidersHorizontal className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                      Your Privacy, Your Control
                    </h3>
                    <p className="text-[11px] font-medium text-indigo-600">
                      Understand what your photos contain before you share them.
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mt-2">
                  Review the information inside your photos and decide what you want to keep or remove.
                </p>
              </div>
            </div>
          </motion.div>

          {/* "More than just a photo gallery" Moment */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.25 }}
            className="mt-6 w-full max-w-3xl bg-slate-50/90 border border-slate-200/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center text-indigo-600 shadow-2xs flex-shrink-0">
                <ImageIcon className="w-4 h-4 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-800">
                  More than just a photo gallery.
                </h4>
                <p className="text-[11px] text-slate-500">
                  Turn invisible photo metadata into clear knowledge and total personal control.
                </p>
              </div>
            </div>
            <button
              onClick={handleHideShowcase}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 self-end sm:self-center cursor-pointer"
            >
              <span>Hide showcase</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        </section>
      ) : (
        /* Compact Header when showcase is hidden by user preference */
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/80 backdrop-blur-sm border border-slate-200/70 rounded-2xl px-4 py-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100/80 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <ScrapItBroLogo size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">
                Photos, <span className="text-indigo-600">but private.</span>
              </p>
              <p className="text-[11px] text-slate-500">
                Originals untouched · Lossless metadata cleaning
              </p>
            </div>
          </div>
          <button
            onClick={handleShowShowcase}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 self-start sm:self-center cursor-pointer"
          >
            <span>Learn what ScrapItBro does</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* =========================================================================
          PHOTO LIBRARY SECTION (Your Photos, Count, Filters, Grid)
          ========================================================================= */}
      {hasPhotos ? (
        <section id="your-photos" className="flex flex-col gap-4 scroll-mt-20 sm:scroll-mt-24">
          {/* Library Subheader: Title, Count, Filters, Add Photos Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/60">
            <div className="flex items-baseline gap-2.5">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Your Photos
              </h2>
              <span className="text-xs sm:text-sm text-slate-500 font-medium">
                {filteredPhotos.length} {filteredPhotos.length === 1 ? 'photo' : 'photos'}
              </span>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2.5">
              {/* Filter Tabs (All / Favorites only) */}
              <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
                {FILTER_TABS.map((tab) => {
                  const isActive = activeFilter === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setFilter(tab.key)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-white text-indigo-600 font-semibold shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Add Photos Action */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Photos</span>
              </motion.button>
            </div>
          </div>

          {/* Main Responsive Photo Grid */}
          {filteredPhotos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4.5 mt-2">
              <AnimatePresence mode="popLayout">
                {filteredPhotos.map((photo, index) => {
                  const dateLabel = formatGridDate(photo.capturedAt || photo.createdAt);

                  return (
                    <motion.div
                      key={photo.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{
                        type: 'spring',
                        stiffness: 420,
                        damping: 26,
                        delay: Math.min(index * 0.02, 0.2),
                      }}
                      className="group relative aspect-square bg-slate-100 rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer border border-slate-200/60 shadow-2xs hover:shadow-md transition-all select-none"
                      onClick={() => navigate(`/photo/${encodeURIComponent(photo.id)}`)}
                    >
                      <img
                        src={photo.thumbnailUrl}
                        alt={photo.title || 'Vault photo'}
                        loading="lazy"
                        className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-300 ease-out"
                      />

                      {/* Favorite Heart Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(photo.id);
                        }}
                        className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                          photo.isFavorite
                            ? 'bg-white/95 text-rose-500 shadow-xs opacity-100'
                            : 'bg-black/30 text-white/90 opacity-0 group-hover:opacity-100 hover:scale-110 hover:text-rose-400'
                        }`}
                        title={photo.isFavorite ? 'Favorited' : 'Add to favorites'}
                      >
                        <Heart
                          className={`w-3.5 h-3.5 stroke-[2.2] ${
                            photo.isFavorite ? 'fill-rose-500 text-rose-500' : ''
                          }`}
                        />
                      </button>

                      {/* Subtle Date Tag */}
                      {dateLabel && (
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-black/40 backdrop-blur-md text-[10px] text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          {dateLabel}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            /* Empty Filter State (e.g. No favorites) */
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <p className="text-sm text-slate-500">No photos match the selected filter.</p>
              <button
                onClick={() => setFilter('all')}
                className="mt-2 text-xs text-indigo-600 font-semibold hover:underline cursor-pointer"
              >
                View all photos
              </button>
            </div>
          )}
        </section>
      ) : (
        /* Empty State Import Card */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="w-full max-w-md mx-auto mt-2 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center shadow-xs"
        >
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center mb-4 text-indigo-600 shadow-2xs">
            <ScrapItBroLogo size={32} />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mb-1.5">
            Your private photo library
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mb-5 leading-relaxed">
            Add your first photos to see what they contain and keep them under your control.
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 450, damping: 20 }}
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Photos</span>
          </motion.button>
          <p className="text-[11px] text-slate-400 mt-3 font-medium">
            or drag & drop images anywhere on screen
          </p>
        </motion.div>
      )}
    </div>
  );
};
