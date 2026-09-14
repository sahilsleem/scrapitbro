import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useVaultStore } from '@/store/useVaultStore';
import { getPhotoFromDB } from '@/lib/db';
import { scrubPhotoMetadata, exportOriginalPhoto } from '@/lib/file-processing';
import type { StrippingResult } from '@/lib/metadata-stripper';
import { extractCompletePhotoMetadata } from '@/lib/metadata-formatter';
import { PinUnlockScreen } from '@/components/ui/PinUnlockScreen';
import type { PhotoItem } from '@/types';
import {
  formatGpsCoordinates,
  getGpsMapUrl
} from '@/lib/exif';
import {
  ArrowLeft,
  Heart,
  Trash2,
  ExternalLink,
  Download,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Hash,
  MapPin,
  Camera,
  Clock,
  Image as ImageIcon,
  Cpu,
  Layers,
  Sparkles,
  Shield
} from 'lucide-react';

export const PhotoDetail: React.FC = () => {
  const { id: rawId } = useParams<{ id: string }>();
  const id = rawId ? decodeURIComponent(rawId) : '';
  const navigate = useNavigate();

  const { photos, toggleFavorite, deletePhoto, isInitialized, isVaultLocked } = useVaultStore();

  const storePhoto = photos.find((p) => p.id === id);
  const [localPhoto, setLocalPhoto] = useState<PhotoItem | null>(storePhoto || null);
  const [isLoading, setIsLoading] = useState<boolean>(!storePhoto);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [imgRenderError, setImgRenderError] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedCleanHash, setCopiedCleanHash] = useState(false);

  const [isScrubbing, setIsScrubbing] = useState(false);
  const [isExportingOriginal, setIsExportingOriginal] = useState(false);
  const [scrubNotice, setScrubNotice] = useState<string | null>(null);
  const [scrubResult, setScrubResult] = useState<StrippingResult | null>(null);

  // Determine current photo index and next/prev navigation
  const currentIndex = photos.findIndex((p) => p.id === id);
  const prevPhoto = currentIndex > 0 ? photos[currentIndex - 1] : null;
  const nextPhoto = currentIndex >= 0 && currentIndex < photos.length - 1 ? photos[currentIndex + 1] : null;

  // Guarantee viewport always starts at the top for every photo
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [id]);

  // Set scrollRestoration to manual while viewing PhotoDetail
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      const prevRestoration = window.history.scrollRestoration;
      window.history.scrollRestoration = 'manual';
      return () => {
        window.history.scrollRestoration = prevRestoration;
      };
    }
  }, []);

  // Keyboard navigation (ArrowLeft, ArrowRight, Escape)
  useEffect(() => {
    if (isVaultLocked) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && prevPhoto) {
        navigate(`/photo/${encodeURIComponent(prevPhoto.id)}`);
      } else if (e.key === 'ArrowRight' && nextPhoto) {
        navigate(`/photo/${encodeURIComponent(nextPhoto.id)}`);
      } else if (e.key === 'Escape') {
        navigate('/');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevPhoto, nextPhoto, navigate, isVaultLocked]);

  useEffect(() => {
    if (isVaultLocked) return;
    let isMounted = true;
    let localCreatedFullUrl: string | null = null;
    let localCreatedThumbUrl: string | null = null;

    async function resolvePhoto() {
      if (isVaultLocked) {
        setIsLoading(false);
        return;
      }

      if (!id) {
        if (isMounted) {
          setLoadError('No photo ID specified in route.');
          setIsLoading(false);
        }
        return;
      }

      const inStore = photos.find((p) => p.id === id);
      if (inStore) {
        if (isMounted) {
          setLocalPhoto(inStore);
          setIsLoading(false);
        }
        return;
      }

      try {
        const record = await getPhotoFromDB(id);
        if (!record) {
          if (isMounted) {
            setLoadError(`Photo "${id}" not found in storage.`);
            setIsLoading(false);
          }
          return;
        }

        localCreatedThumbUrl = URL.createObjectURL(record.thumbnailBlob);
        localCreatedFullUrl = record.originalBlob ? URL.createObjectURL(record.originalBlob) : localCreatedThumbUrl;

        const resolvedItem: PhotoItem = {
          id: record.id,
          title: record.title,
          filename: record.filename,
          fileSizeBytes: record.fileSizeBytes,
          mimeType: record.mimeType,
          createdAt: record.createdAt,
          capturedAt: record.capturedAt,
          thumbnailUrl: localCreatedThumbUrl,
          fullUrl: localCreatedFullUrl,
          dimensions: record.dimensions || { width: 0, height: 0 },
          aspectRatio: record.aspectRatio || 1.5,
          exif: record.exif,
          sha256Hash: record.sha256Hash,
          tags: record.tags || [],
          isFavorite: Boolean(record.isFavorite),
          isArchived: Boolean(record.isArchived),
          filmStock: record.filmStock,
          originalBlob: record.originalBlob,
          thumbnailBlob: record.thumbnailBlob,
          dateAdded: record.dateAdded,
        };

        if (isMounted) {
          setLocalPhoto(resolvedItem);
          setIsLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setLoadError(`Error loading photo: ${err.message}`);
          setIsLoading(false);
        }
      }
    }

    resolvePhoto();

    return () => {
      isMounted = false;
      if (localCreatedFullUrl && localCreatedFullUrl.startsWith('blob:')) {
        URL.revokeObjectURL(localCreatedFullUrl);
      }
      if (localCreatedThumbUrl && localCreatedThumbUrl.startsWith('blob:')) {
        URL.revokeObjectURL(localCreatedThumbUrl);
      }
    };
  }, [id, photos, isInitialized, isVaultLocked]);

  // Vault Locked State
  if (isVaultLocked) {
    return (
      <div className="flex flex-col relative min-h-full px-4 sm:px-8 pt-4 sm:pt-6 pb-0 max-w-6xl mx-auto w-full">
        <PinUnlockScreen />
      </div>
    );
  }

  const currentPhoto = photos.find((p) => p.id === id) || localPhoto;

  if (isLoading) {
    return (
      <div className="flex-1 min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
        <p className="text-xs font-medium text-slate-600">
          Loading photo...
        </p>
      </div>
    );
  }

  if (loadError || !currentPhoto) {
    return (
      <div className="flex-1 min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-4 text-rose-500 shadow-xs">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1.5">
          Photo not found
        </h2>
        <p className="text-xs text-slate-500 max-w-xs mb-6">
          {loadError || 'This photo may have been deleted or moved.'}
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-xs hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
        >
          Return to Library
        </button>
      </div>
    );
  }

  const handleDelete = async () => {
    if (window.confirm('Delete this photo from your private vault?')) {
      await deletePhoto(currentPhoto.id);
      navigate('/');
    }
  };

  const handleExportOriginal = () => {
    if (!currentPhoto.originalBlob && !currentPhoto.fullUrl) {
      alert('Original photo blob not available for download');
      return;
    }
    try {
      setIsExportingOriginal(true);
      if (currentPhoto.originalBlob) {
        exportOriginalPhoto(currentPhoto.originalBlob, currentPhoto.filename);
      } else if (currentPhoto.fullUrl) {
        const a = document.createElement('a');
        a.href = currentPhoto.fullUrl;
        a.download = currentPhoto.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      setScrubNotice(`Exported untouched original "${currentPhoto.filename}"`);
      setTimeout(() => setScrubNotice(null), 4000);
    } catch (err: any) {
      alert(`Original export failed: ${err.message}`);
    } finally {
      setTimeout(() => setIsExportingOriginal(false), 500);
    }
  };

  const handleScrubMetadata = async () => {
    if (!currentPhoto.originalBlob && !currentPhoto.fullUrl) {
      alert('Original photo blob not available for export');
      return;
    }

    try {
      setIsScrubbing(true);
      let blob = currentPhoto.originalBlob;
      if (!blob && currentPhoto.fullUrl) {
        const res = await fetch(currentPhoto.fullUrl);
        blob = await res.blob();
      }

      if (!blob) throw new Error('Could not read photo data');

      const result = await scrubPhotoMetadata(blob, currentPhoto.filename);
      setScrubResult(result);
      setScrubNotice(`Cleaned copy saved as "${result.downloadFilename}"`);
      setTimeout(() => setScrubNotice(null), 5000);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setIsScrubbing(false);
    }
  };

  const handleCopyHash = () => {
    if (currentPhoto.sha256Hash) {
      navigator.clipboard.writeText(currentPhoto.sha256Hash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2500);
    }
  };

  const handleCopyCleanHash = () => {
    if (scrubResult?.scrubbedHash) {
      navigator.clipboard.writeText(scrubResult.scrubbedHash);
      setCopiedCleanHash(true);
      setTimeout(() => setCopiedCleanHash(false), 2500);
    }
  };

  // Location / GPS details
  const hasGps = Boolean(currentPhoto.exif?.location?.latitude && currentPhoto.exif?.location?.longitude);
  const gpsCoords = currentPhoto.exif?.location;
  const gpsString = hasGps
    ? formatGpsCoordinates(gpsCoords!.latitude, gpsCoords!.longitude)
    : '';
  const mapUrl = hasGps
    ? getGpsMapUrl(gpsCoords!.latitude, gpsCoords!.longitude)
    : '';

  const displayImgSrc = !imgRenderError
    ? currentPhoto.fullUrl || currentPhoto.thumbnailUrl
    : currentPhoto.thumbnailUrl;

  const formattedSize = currentPhoto.fileSizeBytes
    ? `${(currentPhoto.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB`
    : '';

  const formattedFormat = currentPhoto.mimeType
    ? currentPhoto.mimeType.replace(/^image\//, '').toUpperCase()
    : 'IMAGE';

  const formattedDims = currentPhoto.dimensions?.width && currentPhoto.dimensions?.height
    ? `${currentPhoto.dimensions.width} × ${currentPhoto.dimensions.height}`
    : '';

  // Extract 100% of real metadata across all categories (zero whitelisting, zero raw JSON)
  const { sections, totalFieldsCount } = extractCompletePhotoMetadata(currentPhoto);

  const getSectionIcon = (id: string) => {
    switch (id) {
      case 'camera':
        return <Camera className="w-4 h-4 text-indigo-600" />;
      case 'capture':
        return <Clock className="w-4 h-4 text-indigo-600" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-indigo-600" />;
      case 'location':
        return <MapPin className="w-4 h-4 text-indigo-600" />;
      case 'technical':
        return <Cpu className="w-4 h-4 text-indigo-600" />;
      default:
        return <Layers className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen pb-24">
      {/* Top Header Controls */}
      <header className="px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-20 transition-colors">
        <motion.div whileHover={{ x: -2 }} whileTap={{ scale: 0.98, x: 0 }} transition={{ duration: 0.15 }}>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-slate-700 hover:text-indigo-600 text-xs sm:text-sm font-semibold transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.2] group-hover:-translate-x-1 transition-transform duration-150" />
            <span>Photos</span>
          </Link>
        </motion.div>

        {/* Previous / Next Navigation for Desktop & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {photos.length > 1 && (
            <div className="hidden sm:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 shadow-2xs">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                transition={{ duration: 0.15 }}
                disabled={!prevPhoto}
                onClick={() => prevPhoto && navigate(`/photo/${encodeURIComponent(prevPhoto.id)}`)}
                className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-white disabled:opacity-30 transition-colors cursor-pointer group"
                title="Previous Photo (←)"
                aria-label="Previous Photo"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2] group-hover:-translate-x-0.5 transition-transform duration-150" />
              </motion.button>
              <span className="text-[11px] font-medium text-slate-500 px-1.5">
                {currentIndex + 1} of {photos.length}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                transition={{ duration: 0.15 }}
                disabled={!nextPhoto}
                onClick={() => nextPhoto && navigate(`/photo/${encodeURIComponent(nextPhoto.id)}`)}
                className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-white disabled:opacity-30 transition-colors cursor-pointer group"
                title="Next Photo (→)"
                aria-label="Next Photo"
              >
                <ChevronRight className="w-4 h-4 stroke-[2] group-hover:translate-x-0.5 transition-transform duration-150" />
              </motion.button>
            </div>
          )}

          {/* Favorite Toggle with Burst Animation */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.15 }}
            onClick={() => toggleFavorite(currentPhoto.id)}
            className={`relative p-2 rounded-xl border transition-all cursor-pointer ${
              currentPhoto.isFavorite
                ? 'bg-rose-50 border-rose-200 text-rose-500 shadow-xs'
                : 'bg-white border-slate-200/80 text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:shadow-2xs'
            }`}
            title={currentPhoto.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={currentPhoto.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {currentPhoto.isFavorite && (
              <span className="absolute inset-0 rounded-xl bg-rose-400/30 animate-heart-ripple pointer-events-none" />
            )}
            <Heart
              className={`w-4 h-4 stroke-[2.2] transition-colors ${
                currentPhoto.isFavorite ? 'fill-rose-500 text-rose-500' : ''
              }`}
            />
          </motion.button>

          {/* Delete Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.15 }}
            onClick={handleDelete}
            className="p-2 rounded-xl border border-slate-200/80 bg-white hover:bg-rose-50 hover:border-rose-200/80 text-slate-400 hover:text-rose-600 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
            title="Delete photo"
            aria-label="Delete photo"
          >
            <Trash2 className="w-4 h-4 stroke-[2]" />
          </motion.button>
        </div>
      </header>

      {/* Scrub Feedback Notice */}
      <AnimatePresence>
        {scrubNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-4 sm:mx-8 mt-4 p-4 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center gap-3 text-xs font-medium text-emerald-800 shadow-2xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{scrubNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Body */}
      <div className="p-4 sm:p-8 max-w-4xl mx-auto w-full flex flex-col gap-6 sm:gap-8">
        
        {/* ========================================================================= */}
        {/* 1. PHOTO-FIRST HERO: SMOOTH EXPAND INTO DETAIL VIEW                       */}
        {/* ========================================================================= */}
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-3"
        >
          <div className="w-full relative rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950/95 border border-slate-200/80 shadow-md flex items-center justify-center min-h-[300px] max-h-[72vh]">
            <img
              src={displayImgSrc}
              alt={currentPhoto.title || 'Selected photo'}
              onError={() => {
                if (!imgRenderError && currentPhoto.thumbnailUrl && displayImgSrc !== currentPhoto.thumbnailUrl) {
                  setImgRenderError(true);
                }
              }}
              className="w-full h-auto max-h-[72vh] object-contain mx-auto select-none"
            />
          </div>

          {/* Photo Summary Caption */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 px-1">
            <span className="font-semibold text-xs sm:text-sm text-slate-800 truncate max-w-md">
              {currentPhoto.title || currentPhoto.filename}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              {formattedSize && <span>{formattedSize}</span>}
              {formattedFormat && (
                <>
                  <span>·</span>
                  <span>{formattedFormat}</span>
                </>
              )}
              {formattedDims && (
                <>
                  <span>·</span>
                  <span className="font-mono">{formattedDims}</span>
                </>
              )}
            </div>
          </div>
        </motion.section>

        {/* ========================================================================= */}
        {/* 2. CORE VALUE MOMENT: METADATA REVEAL (REVEALING WHAT WAS HIDDEN)        */}
        {/* ========================================================================= */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.44, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
            <div>
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                Photo Intelligence
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                Information in this photo
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Embedded details discovered inside this photo file.
              </p>
            </div>
            
            {/* Dynamic Details Found Badge with One-time Trust Reveal */}
            <div className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold shadow-2xs">
              <Shield className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
              <span>
                {totalFieldsCount > 0
                  ? `${totalFieldsCount} ${totalFieldsCount === 1 ? 'detail' : 'details'} found inside this photo`
                  : "Your photo doesn't contain readable embedded metadata."}
              </span>
            </div>
          </div>

          {/* Dynamic 2-Column Metadata Sections with Clean Progressive Stagger */}
          {sections.map((section, secIdx) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.12 + secIdx * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className={`flex flex-col gap-4 ${secIdx > 0 ? 'pt-6 border-t border-slate-100' : ''}`}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100/70 flex items-center justify-center flex-shrink-0">
                  {getSectionIcon(section.id)}
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                  {section.title}
                </h3>
                {section.description && (
                  <span className="hidden sm:inline text-[11px] text-slate-400 font-normal ml-1">
                    — {section.description}
                  </span>
                )}
              </div>

              {/* 2-Column Grid on Desktop, Stacked on Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                {section.items.map((item) => (
                  <div key={item.id} className="flex flex-col py-1.5 border-b border-slate-100/70 sm:border-b-0">
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {item.label}
                    </span>
                    <span className="text-sm sm:text-base font-semibold text-slate-900 mt-0.5 leading-snug break-words">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {sections.length === 0 && (
            <div className="py-8 text-xs text-slate-500 text-center">
              No embedded metadata found in this photo file.
            </div>
          )}
        </motion.section>

        {/* ========================================================================= */}
        {/* 3. LOCATION SECTION (FACTUAL & CALM)                                       */}
        {/* ========================================================================= */}
        <section className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100/70 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-indigo-600" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                LOCATION
              </h3>
            </div>
          </div>

          {hasGps && gpsCoords ? (
            <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                  Location details embedded in photo
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-indigo-900/70 uppercase">Latitude</span>
                  <span className="text-base font-bold text-slate-900 mt-0.5 font-mono">
                    {gpsCoords.latitude >= 0 ? `${gpsCoords.latitude.toFixed(4)}° N` : `${Math.abs(gpsCoords.latitude).toFixed(4)}° S`}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-indigo-900/70 uppercase">Longitude</span>
                  <span className="text-base font-bold text-slate-900 mt-0.5 font-mono">
                    {gpsCoords.longitude >= 0 ? `${gpsCoords.longitude.toFixed(4)}° E` : `${Math.abs(gpsCoords.longitude).toFixed(4)}° W`}
                  </span>
                </div>

                {gpsCoords.altitude !== undefined && (
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-indigo-900/70 uppercase">Altitude</span>
                    <span className="text-base font-bold text-slate-900 mt-0.5">
                      {Math.round(gpsCoords.altitude)} m
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs text-slate-600 font-mono">
                  {gpsString}
                </span>

                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-medium text-xs transition-colors self-start sm:self-auto shadow-2xs cursor-pointer"
                >
                  <span>View location on map →</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                Some photos contain location information that can reveal where they were taken.
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between py-2 text-xs">
              <span className="text-slate-600 font-medium">
                No location information found in this photo.
              </span>
              <span className="text-[11px] text-slate-400 font-medium bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg">
                No GPS Tag
              </span>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* 4. WHY THIS MATTERS (EDUCATIONAL & FACTUAL)                                */}
        {/* ========================================================================= */}
        <section className="bg-slate-50/90 border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <Shield className="w-4 h-4 text-indigo-600" />
            <span>WHY THIS MATTERS</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Photos can carry more information than what you see in the image itself. Camera details, timestamps, locations, and other metadata can travel with the file when you share it.
          </p>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            Knowing what's there gives you more control over what you share.
          </p>
        </section>

        {/* ========================================================================= */}
        {/* 5. PRIVACY ACTION & EXPORT (ORIGINAL VS CLEAN COPY)                       */}
        {/* ========================================================================= */}
        <section className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
              Privacy Actions
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Export Original or Clean Copy
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Choose between exporting your untouched source master or creating a new copy with supported metadata removed.
            </p>
          </div>

          {/* Visual Comparison: Original vs Clean Copy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card A: Original File */}
            <div className="border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between gap-4 bg-slate-50/50">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    ORIGINAL
                  </span>
                  <span className="text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                    Source Master
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-800 mt-1">
                  Your original file stays untouched.
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Export the exact original file you added — preserved bit-for-bit with all original data.
                </p>
              </div>

              <motion.button
                whileHover={{ y: -1.5 }}
                whileTap={{ scale: 0.97, y: 0 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                onClick={handleExportOriginal}
                disabled={isExportingOriginal}
                className="group w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200/90 hover:border-indigo-200 hover:bg-slate-50 text-slate-800 hover:text-indigo-600 font-semibold text-xs sm:text-sm transition-all duration-200 shadow-2xs hover:shadow-xs cursor-pointer select-none"
                title="Export the exact original file"
              >
                <Download className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 group-hover:translate-y-[-1px] transition-all" />
                <span>{isExportingOriginal ? 'Exporting...' : 'Export Original'}</span>
              </motion.button>
            </div>

            {/* Card B: Clean Copy */}
            <div className="border border-indigo-100 rounded-2xl p-5 flex flex-col justify-between gap-4 bg-indigo-50/40">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                    CLEAN COPY
                  </span>
                  <span className="text-[10px] font-semibold text-indigo-700 bg-white border border-indigo-200 px-2 py-0.5 rounded-md">
                    Lossless Strip
                  </span>
                </div>
                <p className="text-xs font-semibold text-indigo-950 mt-1">
                  Create a separate sanitized copy.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your image dimensions and pixel data are preserved without intentional recompression where supported.
                </p>
              </div>

              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97, y: 0 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                onClick={handleScrubMetadata}
                disabled={isScrubbing}
                className="group w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-xs hover:shadow-md hover:shadow-indigo-500/20 border border-indigo-500/30 disabled:opacity-50 transition-all duration-200 cursor-pointer select-none"
              >
                {isScrubbing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Cleaning &amp; Exporting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 stroke-[2.2] group-hover:translate-x-0.5 transition-transform duration-150" />
                    <span>Clean &amp; Export Copy</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Clean Copy Verification Details */}
          {scrubResult && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col gap-3 text-xs text-emerald-950"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="font-bold text-sm text-emerald-950">
                    Clean Copy Created
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                  {scrubResult.isLossless ? 'Lossless Binary Strip' : 'Preserved Resolution'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-emerald-800/70">Original Size</span>
                  <span className="font-semibold text-emerald-950 mt-0.5">
                    {(scrubResult.originalSizeBytes / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-emerald-800/70">Clean Copy Size</span>
                  <span className="font-semibold text-emerald-950 mt-0.5">
                    {(scrubResult.scrubbedSizeBytes / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-emerald-800/70">Dimensions</span>
                  <span className="font-semibold text-emerald-950 mt-0.5">
                    {scrubResult.dimensions.width} × {scrubResult.dimensions.height}
                  </span>
                </div>
              </div>

              <p className="text-emerald-900/90 leading-relaxed">
                The original file remains untouched. This cleaned version is a separate copy downloaded as "{scrubResult.downloadFilename}".
              </p>

              <div className="pt-2 border-t border-emerald-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-emerald-800">
                <div className="flex items-center gap-2">
                  <span className="font-mono">Clean Digital Fingerprint: {scrubResult.scrubbedHash.slice(0, 16)}...</span>
                  <button
                    onClick={handleCopyCleanHash}
                    className="px-2 py-0.5 text-emerald-700 hover:text-emerald-900 font-medium inline-flex items-center gap-1 bg-white/80 rounded-md border border-emerald-200 cursor-pointer"
                    title="Copy clean SHA-256 fingerprint"
                  >
                    {copiedCleanHash ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCleanHash ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* 6. FILE INTEGRITY (HUMAN-READABLE SHA-256)                                 */}
        {/* ========================================================================= */}
        <section className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-4">
          <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100/70 flex items-center justify-center flex-shrink-0">
                <Hash className="w-4 h-4 text-indigo-600" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                FILE INTEGRITY
              </h3>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 mt-1">
              Every file has a unique digital fingerprint.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              ScrapItBro uses SHA-256 to create a fingerprint for this exact file. If the file changes, its fingerprint will normally change too.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50/80 border border-slate-200/70 rounded-2xl p-4 sm:p-5 gap-3">
            <div className="flex flex-col gap-1 overflow-hidden min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                ORIGINAL SHA-256 FINGERPRINT
              </span>
              <span className="font-mono text-xs sm:text-sm text-slate-800 break-all select-all font-medium leading-relaxed">
                {currentPhoto.sha256Hash || 'Calculating fingerprint...'}
              </span>
            </div>

            <button
              onClick={handleCopyHash}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200/80 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 text-xs font-semibold shadow-2xs transition-colors self-start sm:self-center flex-shrink-0 cursor-pointer"
              title="Copy SHA-256 fingerprint"
            >
              {copiedHash ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Fingerprint</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-indigo-50/50 border border-indigo-100/80 rounded-xl p-4 flex flex-col gap-1">
            <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider">
              Why is this useful?
            </span>
            <p className="text-xs text-indigo-950/80 leading-relaxed">
              It gives you a way to compare files using their SHA-256 fingerprints.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
};
