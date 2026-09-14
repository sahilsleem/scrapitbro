import type { StoredPhotoRecord, IngestionProgressItem } from '@/types';
import { savePhotoToDB, findPhotoByHash } from '@/lib/db';
import { useVaultStore } from '@/store/useVaultStore';
import exifr from 'exifr';

let workerInstance: Worker | null = null;

function getWorker(): Worker {
  if (!workerInstance) {
    workerInstance = new Worker(new URL('./ingestion.worker.ts', import.meta.url), {
      type: 'module',
    });
  }
  return workerInstance;
}

async function processOnMainThread(file: File): Promise<{
  sha256Hash: string;
  exif: any;
  thumbnailBlob: Blob;
  dimensions: { width: number; height: number };
  aspectRatio: number;
  capturedAt?: string;
}> {
  const buffer = await file.arrayBuffer();
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const sha256Hash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  let exifData: any = null;
  try {
    exifData = await exifr.parse(buffer, {
      tiff: true,
      xmp: true,
      gps: true,
      translateKeys: true,
      translateValues: true,
      reviveValues: true,
    });
  } catch (e) {
    console.warn('Main thread EXIF error:', e);
  }

  // Resolve ISO
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

  const expBias = exifData?.ExposureBiasValue ?? exifData?.ExposureCompensation;

  const exif = {
    cameraMake: exifData?.Make ? String(exifData.Make).trim() : undefined,
    cameraModel: exifData?.Model ? String(exifData.Model).trim() : undefined,
    lens: exifData?.LensModel || exifData?.Lens || undefined,
    focalLength: formattedFl,
    iso: resolvedIso,
    shutterSpeed: exifData?.ExposureTime,
    aperture: exifData?.FNumber,
    exposureCompensation: expBias,
    dateTimeOriginal: exifData?.DateTimeOriginal instanceof Date 
      ? exifData.DateTimeOriginal.toISOString() 
      : (exifData?.DateTimeOriginal ? String(exifData.DateTimeOriginal) : undefined),
    location: (exifData?.latitude !== undefined && exifData?.longitude !== undefined)
      ? { latitude: Number(exifData.latitude), longitude: Number(exifData.longitude) }
      : undefined,
    raw: exifData || undefined,
  };

  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
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

  const canvas = document.createElement('canvas');
  canvas.width = thumbWidth;
  canvas.height = thumbHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.drawImage(bitmap, 0, 0, thumbWidth, thumbHeight);
  bitmap.close();

  const thumbnailBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/webp', 0.85);
  });

  return {
    sha256Hash,
    exif,
    thumbnailBlob,
    dimensions: { width, height },
    aspectRatio,
    capturedAt: exif.dateTimeOriginal,
  };
}

export async function processSingleImage(
  file: File,
  taskId: string
): Promise<{ record?: StoredPhotoRecord; isDuplicate?: boolean; duplicateOf?: string }> {
  const store = useVaultStore.getState();
  const buffer = await file.arrayBuffer();

  return new Promise(async (resolve, reject) => {
    let handled = false;
    const hasWorkerSupport = typeof Worker !== 'undefined' && typeof OffscreenCanvas !== 'undefined';

    if (!hasWorkerSupport) {
      try {
        store.updateProgressItem(taskId, { status: 'hashing', progress: 30 });
        const result = await processOnMainThread(file);
        
        const existing = await findPhotoByHash(result.sha256Hash);
        if (existing) {
          store.updateProgressItem(taskId, { status: 'duplicate', progress: 100 });
          store.addDuplicateAlert({
            filename: file.name,
            hash: result.sha256Hash,
            existingTitle: existing.title,
            existingId: existing.id,
          });
          return resolve({ isDuplicate: true, duplicateOf: existing.id });
        }

        store.updateProgressItem(taskId, { status: 'saving', progress: 90 });
        const photoId = `pv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const title = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');

        const record: StoredPhotoRecord = {
          id: photoId,
          title: title.charAt(0).toUpperCase() + title.slice(1),
          filename: file.name,
          fileSizeBytes: file.size,
          mimeType: file.type || 'image/jpeg',
          createdAt: new Date().toISOString(),
          capturedAt: result.capturedAt,
          dimensions: result.dimensions,
          aspectRatio: result.aspectRatio,
          exif: result.exif,
          sha256Hash: result.sha256Hash,
          tags: ['imported'],
          isFavorite: false,
          isArchived: false,
          originalBlob: file,
          thumbnailBlob: result.thumbnailBlob,
          dateAdded: new Date().toISOString(),
        };

        await savePhotoToDB(record);
        store.addPhotoRecord(record);
        store.updateProgressItem(taskId, { status: 'completed', progress: 100, photoId });
        return resolve({ record });
      } catch (err: any) {
        store.updateProgressItem(taskId, { status: 'error', progress: 100, error: err.message });
        return reject(err);
      }
    }

    const worker = getWorker();

    const messageHandler = async (e: MessageEvent) => {
      const msg = e.data;
      if (msg.taskId !== taskId) return;

      if (msg.type === 'PROGRESS') {
        store.updateProgressItem(taskId, { status: msg.status, progress: msg.progress });
      } else if (msg.type === 'SUCCESS') {
        if (handled) return;
        handled = true;
        worker.removeEventListener('message', messageHandler);

        const { sha256Hash, exif, thumbnailBlob, dimensions, aspectRatio, capturedAt } = msg.payload;

        const existing = await findPhotoByHash(sha256Hash);
        if (existing) {
          store.updateProgressItem(taskId, { status: 'duplicate', progress: 100 });
          store.addDuplicateAlert({
            filename: file.name,
            hash: sha256Hash,
            existingTitle: existing.title,
            existingId: existing.id,
          });
          return resolve({ isDuplicate: true, duplicateOf: existing.id });
        }

        store.updateProgressItem(taskId, { status: 'saving', progress: 90 });

        const photoId = `pv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');

        const record: StoredPhotoRecord = {
          id: photoId,
          title: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
          filename: file.name,
          fileSizeBytes: file.size,
          mimeType: file.type || 'image/jpeg',
          createdAt: new Date().toISOString(),
          capturedAt: capturedAt,
          dimensions,
          aspectRatio,
          exif,
          sha256Hash,
          tags: ['darkroom-ingested'],
          isFavorite: false,
          isArchived: false,
          filmStock: exif.cameraMake ? `${exif.cameraMake} Emulsion` : 'Raw Negative',
          originalBlob: file,
          thumbnailBlob,
          dateAdded: new Date().toISOString(),
        };

        await savePhotoToDB(record);
        store.addPhotoRecord(record);
        store.updateProgressItem(taskId, { status: 'completed', progress: 100, photoId });

        resolve({ record });
      } else if (msg.type === 'ERROR') {
        if (handled) return;
        handled = true;
        worker.removeEventListener('message', messageHandler);
        store.updateProgressItem(taskId, { status: 'error', progress: 100, error: msg.error });
        reject(new Error(msg.error));
      }
    };

    worker.addEventListener('message', messageHandler);

    worker.postMessage(
      {
        type: 'PROCESS_PHOTO',
        taskId,
        filename: file.name,
        mimeType: file.type || 'image/jpeg',
        buffer,
      },
      [buffer]
    );
  });
}

export async function ingestImageFiles(files: File[]): Promise<void> {
  const store = useVaultStore.getState();
  const validFiles = files.filter((f) => f.type.startsWith('image/') || /\.(jpe?g|png|webp|avif|tiff|heic)$/i.test(f.name));

  if (validFiles.length === 0) return;

  const newTasks: IngestionProgressItem[] = validFiles.map((file) => {
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    let previewUrl: string | undefined;
    try {
      previewUrl = URL.createObjectURL(file);
    } catch {}
    return {
      id: taskId,
      filename: file.name,
      status: 'pending',
      progress: 0,
      previewUrl,
    };
  });

  store.enqueueIngestionTasks(newTasks);

  const concurrency = 2;
  let index = 0;

  const runNext = async (): Promise<void> => {
    if (index >= validFiles.length) return;
    const currentIndex = index++;
    const file = validFiles[currentIndex];
    const task = newTasks[currentIndex];

    try {
      await processSingleImage(file, task.id);
    } catch (err) {
      console.error(`Failed to ingest ${file.name}:`, err);
    }

    await runNext();
  };

  const pool = Array.from({ length: Math.min(concurrency, validFiles.length) }, () => runNext());
  await Promise.all(pool);
}

import { sanitizePhotoMetadata, type StrippingResult } from '@/lib/metadata-stripper';

export async function scrubPhotoMetadata(
  blob: Blob,
  originalFilename: string
): Promise<StrippingResult> {
  const result = await sanitizePhotoMetadata(blob, originalFilename);

  const downloadUrl = URL.createObjectURL(result.scrubbedBlob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = result.downloadFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);

  return result;
}

export function exportOriginalPhoto(blob: Blob, filename: string): void {
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
}

