import { create } from 'zustand';
import type { PhotoItem, StoredPhotoRecord, VaultFilter, VaultSortBy, IngestionProgressItem, DuplicateAlert } from '@/types';
import { getAllPhotosFromDB, deletePhotoFromDB, updatePhotoInDB } from '@/lib/db';

interface VaultStore {
  photos: PhotoItem[];
  activeFilter: VaultFilter;
  sortBy: VaultSortBy;
  isVaultLocked: boolean;
  viewMode: 'editorial' | 'contact-sheet' | 'film-strip';
  storageUsedBytes: number;
  totalCapacityBytes: number;
  isInitialized: boolean;

  // Ingestion queue & alerts
  ingestionQueue: IngestionProgressItem[];
  duplicateAlerts: DuplicateAlert[];

  // Actions
  initStore: () => Promise<void>;
  setFilter: (filter: VaultFilter) => void;
  setSortBy: (sortBy: VaultSortBy) => void;
  toggleFavorite: (id: string) => Promise<void>;
  toggleLock: () => void;
  setViewMode: (mode: 'editorial' | 'contact-sheet' | 'film-strip') => void;
  addPhotoRecord: (record: StoredPhotoRecord) => void;
  deletePhoto: (id: string) => Promise<void>;
  
  // Ingestion queue helpers
  enqueueIngestionTasks: (tasks: IngestionProgressItem[]) => void;
  updateProgressItem: (id: string, update: Partial<IngestionProgressItem>) => void;
  removeProgressItem: (id: string) => void;
  clearCompletedTasks: () => void;
  addDuplicateAlert: (alert: DuplicateAlert) => void;
  dismissDuplicateAlert: (hash: string) => void;
}

// Convert stored record to in-memory PhotoItem with object URLs
function recordToPhotoItem(record: StoredPhotoRecord): PhotoItem {
  const thumbnailUrl = URL.createObjectURL(record.thumbnailBlob);
  const fullUrl = record.originalBlob ? URL.createObjectURL(record.originalBlob) : thumbnailUrl;

  return {
    id: record.id,
    title: record.title,
    filename: record.filename,
    fileSizeBytes: record.fileSizeBytes,
    mimeType: record.mimeType,
    createdAt: record.createdAt,
    capturedAt: record.capturedAt,
    thumbnailUrl,
    fullUrl,
    dimensions: record.dimensions,
    aspectRatio: record.aspectRatio,
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
}

const VAULT_LOCKED_KEY = 'photovault:vault_locked';

export const useVaultStore = create<VaultStore>((set, get) => ({
  photos: [],
  activeFilter: 'all',
  sortBy: 'date-desc',
  isVaultLocked: (() => {
    try {
      return localStorage.getItem(VAULT_LOCKED_KEY) === 'true';
    } catch {
      return false;
    }
  })(),
  viewMode: 'editorial',
  storageUsedBytes: 0,
  totalCapacityBytes: 10737418240, // 10 GB
  isInitialized: false,

  ingestionQueue: [],
  duplicateAlerts: [],

  initStore: async () => {
    if (get().isInitialized) return;
    try {
      // Sync lock state across multiple tabs
      window.addEventListener('storage', (e) => {
        if (e.key === VAULT_LOCKED_KEY) {
          set({ isVaultLocked: e.newValue === 'true' });
        }
      });

      const records = await getAllPhotosFromDB();
      const items = records.map(recordToPhotoItem);
      
      const totalBytes = records.reduce((acc, r) => acc + (r.fileSizeBytes || 0), 0);

      set({
        photos: items,
        storageUsedBytes: totalBytes,
        isInitialized: true,
      });
    } catch (error) {
      console.error('[ScrapItBro Store] Failed to load photos from DB:', error);
      set({ isInitialized: true });
    }
  },

  setFilter: (filter) => set({ activeFilter: filter }),
  setSortBy: (sortBy) => set({ sortBy }),

  toggleFavorite: async (id) => {
    const photo = get().photos.find((p) => p.id === id);
    if (!photo) return;
    const newFav = !photo.isFavorite;

    set((state) => ({
      photos: state.photos.map((p) => (p.id === id ? { ...p, isFavorite: newFav } : p)),
    }));

    await updatePhotoInDB(id, { isFavorite: newFav });
  },

  toggleLock: () =>
    set((state) => {
      const nextLocked = !state.isVaultLocked;
      try {
        if (nextLocked) {
          localStorage.setItem(VAULT_LOCKED_KEY, 'true');
        } else {
          localStorage.removeItem(VAULT_LOCKED_KEY);
        }
      } catch {}
      return { isVaultLocked: nextLocked };
    }),
  setViewMode: (viewMode) => set({ viewMode }),

  addPhotoRecord: (record) => {
    const item = recordToPhotoItem(record);
    set((state) => ({
      photos: [item, ...state.photos],
      storageUsedBytes: state.storageUsedBytes + record.fileSizeBytes,
    }));
  },

  deletePhoto: async (id) => {
    const photo = get().photos.find((p) => p.id === id);
    if (photo) {
      if (photo.thumbnailUrl.startsWith('blob:')) URL.revokeObjectURL(photo.thumbnailUrl);
      if (photo.fullUrl?.startsWith('blob:')) URL.revokeObjectURL(photo.fullUrl);
    }

    set((state) => ({
      photos: state.photos.filter((p) => p.id !== id),
      storageUsedBytes: Math.max(0, state.storageUsedBytes - (photo?.fileSizeBytes || 0)),
    }));

    await deletePhotoFromDB(id);
  },

  enqueueIngestionTasks: (tasks) =>
    set((state) => ({
      ingestionQueue: [...state.ingestionQueue, ...tasks],
    })),

  updateProgressItem: (id, update) =>
    set((state) => ({
      ingestionQueue: state.ingestionQueue.map((item) =>
        item.id === id ? { ...item, ...update } : item
      ),
    })),

  removeProgressItem: (id) =>
    set((state) => {
      const task = state.ingestionQueue.find((t) => t.id === id);
      if (task?.previewUrl && task.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(task.previewUrl);
      }
      return {
        ingestionQueue: state.ingestionQueue.filter((item) => item.id !== id),
      };
    }),

  clearCompletedTasks: () =>
    set((state) => {
      const remaining: IngestionProgressItem[] = [];
      for (const item of state.ingestionQueue) {
        if (
          item.status === 'pending' ||
          item.status === 'hashing' ||
          item.status === 'exif' ||
          item.status === 'thumbnail' ||
          item.status === 'saving'
        ) {
          remaining.push(item);
        } else {
          if (item.previewUrl && item.previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(item.previewUrl);
          }
        }
      }
      return { ingestionQueue: remaining };
    }),

  addDuplicateAlert: (alert) =>
    set((state) => ({
      duplicateAlerts: [...state.duplicateAlerts.filter((a) => a.hash !== alert.hash), alert],
    })),

  dismissDuplicateAlert: (hash) =>
    set((state) => ({
      duplicateAlerts: state.duplicateAlerts.filter((a) => a.hash !== hash),
    })),
}));
