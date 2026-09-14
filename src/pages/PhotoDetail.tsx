import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useVaultStore } from '@/store/useVaultStore';
import { getPhotoFromDB } from '@/lib/db';
import { scrubPhotoMetadata, exportOriginalPhoto } from '@/lib/file-processing';
import type { StrippingResult } from '@/lib/metadata-stripper';
import { extractCompletePhotoMetadata } from '@/lib/metadata-formatter';
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
  Shield,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  ShieldCheck,
  Hash,
  MapPin,
  Camera,
  Clock,
  Image as ImageIcon,
  Cpu,
  Layers
} from 'lucide-react';

export const PhotoDetail: React.FC = () => {
  const { id: rawId } = useParams<{ id: string }>();
  const id = rawId ? decodeURIComponent(rawId) : '';
  const navigate = useNavigate();

  const { photos, toggleFavorite, deletePhoto, isInitialized } = useVaultStore();

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

  // Keyboard navigation (ArrowLeft, ArrowRight, Escape)
  useEffect(() => {
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
  }, [prevPhoto, nextPhoto, navigate]);

  useEffect(() => {
    let isMounted = true;
    let localCreatedFullUrl: string | null = null;
    let localCreatedThumbUrl: string | null = null;

    async function resolvePhoto() {
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
  }, [id, photos, isInitialized]);

  const currentPhoto = photos.find((p) => p.id === id) || localPhoto;

  if (isLoading) {
    return (
      <div className="flex-1 min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-7 h-7 text-indigo-600 animate-spin mb-3" />
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
          className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-xs hover:bg-indigo-700 transition-colors shadow-xs"
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
    <div className="flex-1 flex flex-col min-h-screen pb-20">
      {/* Top Header Controls */}
      <div className="px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-20">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
          <span>Photos</span>
        </button>

        {/* Previous / Next Navigation for Desktop */}
        <div className="flex items-center gap-2">
          {photos.length > 1 && (
            <div className="hidden sm:flex items-center gap-1 bg-slate-100/70 p-1 rounded-xl border border-slate-200/60">
              <button
                disabled={!prevPhoto}
                onClick={() => prevPhoto && navigate(`/photo/${encodeURIComponent(prevPhoto.id)}`)}
                className="p-1 rounded-lg text-slate-600 hover:text-slate-900 disabled:opacity-30 transition-colors"
                title="Previous Photo (←)"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2]" />
              </button>
              <span className="text-[11px] font-medium text-slate-500 px-1.5">
                {currentIndex + 1} of {photos.length}
              </span>
              <button
                disabled={!nextPhoto}
                onClick={() => nextPhoto && navigate(`/photo/${encodeURIComponent(nextPhoto.id)}`)}
                className="p-1 rounded-lg text-slate-600 hover:text-slate-900 disabled:opacity-30 transition-colors"
                title="Next Photo (→)"
              >
                <ChevronRight className="w-4 h-4 stroke-[2]" />
              </button>
            </div>
          )}

          {/* Favorite Toggle */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            onClick={() => toggleFavorite(currentPhoto.id)}
            className={`p-2 rounded-xl border transition-all ${
              currentPhoto.isFavorite
                ? 'bg-rose-50 border-rose-200 text-rose-500 shadow-2xs'
                : 'bg-white border-slate-200/80 text-slate-400 hover:text-rose-500'
            }`}
            title={currentPhoto.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={`w-4 h-4 stroke-[2.2] ${
                currentPhoto.isFavorite ? 'fill-rose-500 text-rose-500' : ''
              }`}
            />
          </motion.button>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            className="p-2 rounded-xl bg-white border border-slate-200/80 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all"
            title="Delete photo"
          >
            <Trash2 className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      </div>

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
      <div className="p-4 sm:p-8 max-w-4xl mx-auto w-full flex flex-col gap-8">
        {/* ========================================================================= */}
        {/* 1. PHOTO (THE HERO)                                                       */}
        {/* ========================================================================= */}
        <div className="flex flex-col gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="w-full relative rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 border border-slate-200/60 shadow-md flex items-center justify-center min-h-[320px] max-h-[72vh]"
          >
            <img
              src={displayImgSrc}
              alt={currentPhoto.title || 'Photo view'}
              onError={() => {
                if (!imgRenderError && currentPhoto.thumbnailUrl && displayImgSrc !== currentPhoto.thumbnailUrl) {
                  setImgRenderError(true);
                }
              }}
              className="w-full h-auto max-h-[72vh] object-contain mx-auto select-none"
            />
          </motion.div>

          {/* Clean Caption Bar */}
          <div className="flex items-center justify-between px-1 text-xs text-slate-500">
            <span className="font-medium truncate max-w-[280px] sm:max-w-md text-slate-800">
              {currentPhoto.title || currentPhoto.filename}
            </span>
            <span className="text-[11px] text-slate-400 font-medium font-mono">
              {formattedDims} • {formattedSize}
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. INFORMATION IN THIS PHOTO (100% OF EXTRACTED METADATA - NO RAW JSON)   */}
        {/* ========================================================================= */}
        <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Information in this photo
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Every detail discovered embedded inside this file when it was captured.
              </p>
            </div>
            <div className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              <span>{totalFieldsCount} {totalFieldsCount === 1 ? 'detail' : 'details'} found inside this photo</span>
            </div>
          </div>

          {/* Render All Dynamically Discovered Sections */}
          {sections.map((section, secIdx) => (
            <div key={section.id} className={`flex flex-col gap-4 ${secIdx > 0 ? 'pt-6 border-t border-slate-100' : ''}`}>
              <div className="flex items-center gap-2">
                {getSectionIcon(section.id)}
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {section.title}
                </h3>
                {section.description && (
                  <span className="hidden sm:inline text-[11px] text-slate-400 font-normal ml-2">
                    — {section.description}
                  </span>
                )}
              </div>

              {/* 2-Column Responsive Layout for Desktop / Stack on Mobile */}
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
            </div>
          ))}

          {sections.length === 0 && (
            <div className="py-6 text-xs text-slate-500 text-center">
              No embedded metadata found in this photo file.
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 3. LOCATION (FACTUAL & CALM)                                              */}
        {/* ========================================================================= */}
        <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              LOCATION
            </h3>
          </div>

          {hasGps && gpsCoords ? (
            <div className="bg-rose-50/60 border border-rose-200/80 rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                  Location information found
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-rose-700/80 uppercase">Latitude</span>
                  <span className="text-base font-bold text-slate-900 mt-0.5 font-mono">
                    {gpsCoords.latitude >= 0 ? `${gpsCoords.latitude.toFixed(4)}° N` : `${Math.abs(gpsCoords.latitude).toFixed(4)}° S`}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-rose-700/80 uppercase">Longitude</span>
                  <span className="text-base font-bold text-slate-900 mt-0.5 font-mono">
                    {gpsCoords.longitude >= 0 ? `${gpsCoords.longitude.toFixed(4)}° E` : `${Math.abs(gpsCoords.longitude).toFixed(4)}° W`}
                  </span>
                </div>

                {gpsCoords.altitude !== undefined && (
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-rose-700/80 uppercase">Altitude</span>
                    <span className="text-base font-bold text-slate-900 mt-0.5">
                      {Math.round(gpsCoords.altitude)} m
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-rose-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs text-slate-600 font-mono">
                  {gpsString}
                </span>

                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 font-medium text-xs transition-colors self-start sm:self-auto shadow-2xs"
                >
                  <span>View location on map →</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between py-2 text-xs">
              <span className="text-slate-700 font-medium">
                No location data detected
              </span>
              <span className="text-[11px] text-slate-400 font-medium bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                Clean (No GPS tag)
              </span>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 4. WHY THIS MATTERS (EDUCATIONAL & FACTUAL)                                */}
        {/* ========================================================================= */}
        <div className="bg-slate-50/80 border border-slate-200/70 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <Shield className="w-4 h-4 text-indigo-600" />
            <span>WHY THIS MATTERS</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Photos can contain more information than what you see in the picture. Depending on the device and app that created the file, a photo may contain details about when it was taken, what camera was used, how it was captured, and sometimes where it was taken.
          </p>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            PhotoVault lets you see that information before you decide what to share.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 5. REMOVE HIDDEN INFORMATION (PRIVACY & QUALITY-PRESERVED EXPORT)         */}
        {/* ========================================================================= */}
        <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              PRIVACY &amp; EXPORT
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Remove hidden information before sharing
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Your original photo stays untouched. Cleaning creates a separate copy with selected hidden metadata removed.
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Image dimensions and visual image data are preserved without intentional resizing or recompression on supported formats.
            </p>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Lossless metadata strip · Processed locally on this device</span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleExportOriginal}
                disabled={isExportingOriginal}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200/90 text-slate-700 hover:text-slate-900 hover:border-slate-300 font-medium text-xs sm:text-sm transition-colors shadow-2xs cursor-pointer"
                title="Download untouched bit-exact original file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isExportingOriginal ? 'Exporting...' : 'Export Original'}</span>
              </button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                onClick={handleScrubMetadata}
                disabled={isScrubbing}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs sm:text-sm shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isScrubbing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Cleaning &amp; exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>Clean &amp; Export Copy</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {scrubResult && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col gap-3 text-xs text-emerald-950"
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
                The original file remains untouched. This cleaned version is a separate copy downloaded as &quot;{scrubResult.downloadFilename}&quot;.
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
        </div>

        {/* ========================================================================= */}
        {/* 6. FILE INTEGRITY (SHA-256 DIGITAL FINGERPRINT)                           */}
        {/* ========================================================================= */}
        <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col gap-4">
          <div className="flex flex-col gap-1 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                FILE INTEGRITY
              </h3>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-800 mt-1">
              Every file has a unique digital fingerprint.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              PhotoVault uses SHA-256 to create a digital fingerprint for this exact file. If the file changes, its fingerprint changes too.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50/80 border border-slate-200/70 rounded-2xl p-4 sm:p-5 gap-3">
            <div className="flex flex-col gap-1 overflow-hidden min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                SHA-256 FINGERPRINT
              </span>
              <span className="font-mono text-xs sm:text-sm text-slate-800 break-all select-all font-medium leading-relaxed">
                {currentPhoto.sha256Hash || 'Calculating checksum...'}
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
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-indigo-50/50 border border-indigo-100/80 rounded-xl p-4 flex flex-col gap-1">
            <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider">
              Why is this useful?
            </span>
            <p className="text-xs text-indigo-950/80 leading-relaxed">
              Your original fingerprint gives you a way to verify that the exact file you uploaded or exported has not changed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
