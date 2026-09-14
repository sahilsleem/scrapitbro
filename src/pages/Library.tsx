import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useVaultStore } from '@/store/useVaultStore';
import { ingestImageFiles } from '@/lib/file-processing';
import { PhotoVaultLogo } from '@/components/ui/PhotoVaultLogo';
import type { VaultFilter } from '@/types';
import {
  Heart,
  Lock,
  UploadCloud,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  Plus
} from 'lucide-react';

const FILTER_TABS: { key: VaultFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'favorites', label: 'Favorites' },
  { key: 'film', label: 'Color' },
  { key: 'bw', label: 'B&W' },
];

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
  const dragCounter = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (activeFilter === 'film') {
      return (
        photo.filmStock?.toLowerCase().includes('portra') ||
        photo.filmStock?.toLowerCase().includes('cinestill') ||
        photo.filmStock?.toLowerCase().includes('color') ||
        photo.tags?.includes('film')
      );
    }
    if (activeFilter === 'bw') {
      return (
        photo.filmStock?.toLowerCase().includes('b&w') ||
        photo.filmStock?.toLowerCase().includes('hp5') ||
        photo.filmStock?.toLowerCase().includes('tri-x') ||
        photo.tags?.includes('monochrome')
      );
    }
    return true;
  });

  const activeIngestions = ingestionQueue.filter(
    (t) => t.status === 'pending' || t.status === 'hashing' || t.status === 'exif' || t.status === 'thumbnail' || t.status === 'saving'
  );
  const completedIngestions = ingestionQueue.filter((t) => t.status === 'completed');

  // Automatically dismiss ingestion progress card shortly after all photos finish importing
  useEffect(() => {
    if (ingestionQueue.length > 0 && activeIngestions.length === 0) {
      const timer = setTimeout(() => {
        clearCompletedTasks();
      }, 1200);
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
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-md shadow-indigo-500/20 transition-colors"
        >
          Unlock Vault
        </motion.button>
      </div>
    );
  }

  return (
    <div className="flex flex-col relative min-h-full px-4 sm:px-8 pt-5 pb-8">
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
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed inset-0 z-50 bg-indigo-950/75 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center pointer-events-none"
          >
            <div className="w-20 h-20 rounded-3xl bg-white/15 border border-white/30 flex items-center justify-center mb-4 text-white shadow-2xl animate-bounce">
              <UploadCloud className="w-10 h-10 stroke-[2]" />
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Drop photos to import
            </h3>
            <p className="text-sm text-indigo-200 mt-1 max-w-sm">
              Photos are saved directly to your encrypted local sandbox.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section: Title, Count, Filters, Import CTA */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Photos
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              {photos.length === 0
                ? 'Private photo gallery'
                : `${filteredPhotos.length} ${filteredPhotos.length === 1 ? 'photo' : 'photos'}`}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 450, damping: 20 }}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs sm:text-sm shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Import Photos</span>
          </motion.button>
        </div>

        {/* Filter Pills */}
        {photos.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'text-indigo-600 font-semibold bg-indigo-50 border border-indigo-100 shadow-2xs'
                      : 'text-slate-500 bg-white border border-slate-200/80 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Duplicate Alert Banner */}
      {duplicateAlerts.length > 0 && (
        <div className="mb-4 flex flex-col gap-2">
          {duplicateAlerts.map((alert) => (
            <motion.div
              key={alert.hash}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-900"
            >
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  <strong>Duplicate skipped:</strong> "{alert.filename}" is already in your vault.
                </span>
              </div>
              <button
                onClick={() => dismissDuplicateAlert(alert.hash)}
                className="p-1 text-amber-500 hover:text-amber-800"
                title="Dismiss"
              >
                <X className="w-4 h-4 stroke-[2]" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Streamlined Ingestion Progress */}
      <AnimatePresence>
        {ingestionQueue.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 'auto' }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0, marginBottom: 0, transition: { duration: 0.25 } }}
            className="mb-5 overflow-hidden"
          >
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {activeIngestions.length > 0 ? (
                    <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  )}
                  <span className="text-xs font-semibold text-slate-800">
                    {activeIngestions.length > 0
                      ? `Importing photos... ${completedIngestions.length} of ${ingestionQueue.length}`
                      : 'Import complete'}
                  </span>
                </div>
                <button
                  onClick={clearCompletedTasks}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Dismiss"
                >
                  <X className="w-4 h-4 stroke-[2]" />
                </button>
              </div>

              <div className="flex flex-col gap-2 max-h-28 overflow-y-auto pr-1">
                {ingestionQueue.map((item) => (
                  <div key={item.id} className="flex flex-col gap-1 text-[11px]">
                    <div className="flex justify-between text-slate-600">
                      <span className="truncate max-w-[220px]">{item.filename}</span>
                      <span className="text-indigo-600 font-medium">
                        {item.status === 'completed' && 'Saved'}
                        {item.status === 'duplicate' && 'Duplicate'}
                        {item.status === 'error' && 'Error'}
                        {item.status !== 'completed' && item.status !== 'duplicate' && item.status !== 'error' && 'Processing...'}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-200 ${
                          item.status === 'completed'
                            ? 'bg-emerald-500'
                            : item.status === 'duplicate'
                            ? 'bg-amber-500'
                            : item.status === 'error'
                            ? 'bg-rose-500'
                            : 'bg-indigo-600'
                        }`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Responsive Photo Grid */}
      {filteredPhotos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4.5">
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
                    className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-md transition-all ${
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
        /* Empty State / Welcome Hero */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="flex-1 py-16 sm:py-24 px-4 flex flex-col items-center justify-center text-center max-w-md mx-auto"
        >
          <div className="w-18 h-18 rounded-3xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center mb-5 text-indigo-600 shadow-2xs">
            <PhotoVaultLogo size={42} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2.5">
            Photos, but private.
          </h2>
          <p className="text-sm text-slate-600 mb-2 leading-relaxed">
            See what’s hidden inside your photos. Understand the information they contain. Keep the original untouched and create cleaner copies when you need them.
          </p>
          <p className="text-xs text-slate-400 mb-6 font-medium">
            Processed locally on this device · No cloud upload
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 450, damping: 20 }}
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Photos</span>
          </motion.button>
          <p className="text-xs text-slate-400 mt-4">
            or drop images anywhere on screen
          </p>
        </motion.div>
      )}
    </div>
  );
};
