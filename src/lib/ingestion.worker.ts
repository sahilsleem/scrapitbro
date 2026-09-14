/// <reference lib="webworker" />
import exifr from 'exifr';

declare const self: DedicatedWorkerGlobalScope;

interface ProcessPhotoMessage {
  type: 'PROCESS_PHOTO';
  taskId: string;
  filename: string;
  mimeType: string;
  buffer: ArrayBuffer;
}

self.onmessage = async (e: MessageEvent<ProcessPhotoMessage>) => {
  const { type, taskId, mimeType, buffer } = e.data;

  if (type !== 'PROCESS_PHOTO') return;

  try {
    // Stage 1: Compute SHA-256 Hash
    self.postMessage({ type: 'PROGRESS', taskId, status: 'hashing', progress: 20 });
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const sha256Hash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    // Stage 2: Parse EXIF with exifr
    self.postMessage({ type: 'PROGRESS', taskId, status: 'exif', progress: 45 });
    let exifData: Record<string, any> | null = null;
    try {
      exifData = await exifr.parse(buffer, {
        tiff: true,
        xmp: true,
        gps: true,
        translateKeys: true,
        translateValues: true,
        reviveValues: true,
      });
    } catch (exifErr) {
      console.warn('[Worker] EXIF parse warning:', exifErr);
    }

    // Resolve ISO properly from all possible tag variants
    let resolvedIso: number | undefined;
    const rawIso = exifData?.ISO ?? exifData?.ISOSpeedRatings ?? exifData?.PhotographicSensitivity;
    if (rawIso !== undefined && rawIso !== null) {
      const val = Array.isArray(rawIso) ? rawIso[0] : rawIso;
      const num = typeof val === 'number' ? val : parseInt(String(val), 10);
      if (!isNaN(num)) resolvedIso = num;
    }

    // Resolve Focal Length
    const rawFl = exifData?.FocalLength;
    const rawFl35 = exifData?.FocalLengthIn35mmFormat ?? exifData?.FocalLengthIn35mmFilm;
    let formattedFl: string | undefined;
    if (rawFl !== undefined || rawFl35 !== undefined) {
      const flNum = typeof rawFl === 'number' ? rawFl : (typeof rawFl === 'string' ? parseFloat(rawFl) : undefined);
      const fl35Num = typeof rawFl35 === 'number' ? rawFl35 : (typeof rawFl35 === 'string' ? parseFloat(rawFl35) : undefined);
      if (fl35Num && flNum && Math.round(flNum) !== Math.round(fl35Num)) {
        const primary = Number.isInteger(flNum) ? `${flNum}mm` : `${flNum.toFixed(1)}mm`;
        formattedFl = `${primary} (${Math.round(fl35Num)}mm eq.)`;
      } else if (fl35Num) {
        formattedFl = `${Math.round(fl35Num)}mm`;
      } else if (flNum) {
        formattedFl = Number.isInteger(flNum) ? `${flNum}mm` : `${flNum.toFixed(1)}mm`;
      }
    }

    // Resolve Exposure Bias / Compensation
    const expBias = exifData?.ExposureBiasValue ?? exifData?.ExposureCompensation;

    // Format structured EXIF and retain raw object for inspection
    const exif = {
      cameraMake: exifData?.Make ? String(exifData.Make).trim() : undefined,
      cameraModel: exifData?.Model ? String(exifData.Model).trim() : undefined,
      lens: exifData?.LensModel || exifData?.Lens || exifData?.LensMake || undefined,
      focalLength: formattedFl,
      iso: resolvedIso,
      shutterSpeed: exifData?.ExposureTime !== undefined ? exifData.ExposureTime : undefined,
      aperture: exifData?.FNumber !== undefined ? exifData.FNumber : undefined,
      exposureCompensation: expBias !== undefined ? expBias : undefined,
      dateTimeOriginal: exifData?.DateTimeOriginal instanceof Date 
        ? exifData.DateTimeOriginal.toISOString() 
        : (exifData?.DateTimeOriginal || exifData?.CreateDate ? String(exifData.DateTimeOriginal || exifData.CreateDate) : undefined),
      orientation: exifData?.Orientation ? Number(exifData.Orientation) : 1,
      location: (exifData?.latitude !== undefined && exifData?.longitude !== undefined)
        ? {
            latitude: Number(exifData.latitude),
            longitude: Number(exifData.longitude),
            altitude: exifData.altitude ? Number(exifData.altitude) : undefined,
          }
        : undefined,
      raw: exifData || undefined,
    };

    // Stage 3: Generate Thumbnail (max ~400px longest edge)
    self.postMessage({ type: 'PROGRESS', taskId, status: 'thumbnail', progress: 70 });
    
    const blob = new Blob([buffer], { type: mimeType });
    const bitmap = await createImageBitmap(blob, { imageOrientation: 'from-image' });

    const maxEdge = 400;
    const width = bitmap.width;
    const height = bitmap.height;
    const aspectRatio = width / height;

    let thumbWidth = width;
    let thumbHeight = height;

    if (width > height) {
      if (width > maxEdge) {
        thumbWidth = maxEdge;
        thumbHeight = Math.round(maxEdge / aspectRatio);
      }
    } else {
      if (height > maxEdge) {
        thumbHeight = maxEdge;
        thumbWidth = Math.round(maxEdge * aspectRatio);
      }
    }

    const canvas = new OffscreenCanvas(thumbWidth, thumbHeight);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get OffscreenCanvas 2D context');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, thumbWidth, thumbHeight);
    bitmap.close();

    let thumbnailBlob: Blob;
    try {
      thumbnailBlob = await canvas.convertToBlob({ type: 'image/webp', quality: 0.85 });
    } catch {
      thumbnailBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.85 });
    }

    self.postMessage({
      type: 'SUCCESS',
      taskId,
      payload: {
        sha256Hash,
        exif,
        thumbnailBlob,
        dimensions: { width, height },
        aspectRatio,
        capturedAt: exif.dateTimeOriginal,
      },
    });
  } catch (err: any) {
    console.error('[Worker] Ingestion error:', err);
    self.postMessage({
      type: 'ERROR',
      taskId,
      error: err?.message || 'Failed to process negative',
    });
  }
};
