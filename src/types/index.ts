export interface ExifMetadata {
  cameraMake?: string;
  cameraModel?: string;
  lens?: string;
  focalLength?: string;
  iso?: number;
  shutterSpeed?: string;
  aperture?: string;
  exposureCompensation?: string;
  dateTimeOriginal?: string;
  orientation?: number;
  location?: {
    latitude: number;
    longitude: number;
    altitude?: number;
    placeName?: string;
  };
  raw?: Record<string, unknown>;
}

export interface PhotoItem {
  id: string;
  title: string;
  filename: string;
  fileSizeBytes: number;
  mimeType: string;
  createdAt: string;
  capturedAt?: string;
  thumbnailUrl: string;
  fullUrl?: string;
  dimensions: {
    width: number;
    height: number;
  };
  aspectRatio: number;
  exif?: ExifMetadata;
  sha256Hash: string;
  tags: string[];
  isFavorite: boolean;
  isArchived: boolean;
  filmStock?: string;
  originalBlob?: Blob;
  thumbnailBlob?: Blob;
  dateAdded?: string;
}

export interface StoredPhotoRecord {
  id: string;
  title: string;
  filename: string;
  fileSizeBytes: number;
  mimeType: string;
  createdAt: string;
  capturedAt?: string;
  dimensions: {
    width: number;
    height: number;
  };
  aspectRatio: number;
  exif?: ExifMetadata;
  sha256Hash: string;
  tags: string[];
  isFavorite: boolean;
  isArchived: boolean;
  filmStock?: string;
  originalBlob: Blob;
  thumbnailBlob: Blob;
  dateAdded: string;
}

export interface IngestionProgressItem {
  id: string;
  filename: string;
  status: 'pending' | 'hashing' | 'exif' | 'thumbnail' | 'saving' | 'completed' | 'duplicate' | 'error';
  progress: number;
  error?: string;
  photoId?: string;
  previewUrl?: string;
}

export interface DuplicateAlert {
  filename: string;
  hash: string;
  existingTitle: string;
  existingId: string;
}

export type VaultFilter = 'all' | 'favorites' | 'film' | 'bw';
export type VaultSortBy = 'date-desc' | 'date-asc' | 'size-desc' | 'title-asc';

export interface VaultStats {
  totalCount: number;
  totalSizeBytes: number;
  encryptedItemCount: number;
  lastSyncAt?: string;
  isEncrypted: boolean;
}
