import { create } from 'zustand';
import type { PhotoItem, StoredPhotoRecord, VaultFilter, VaultSortBy, IngestionProgressItem, DuplicateAlert } from '@/types';
import { getAllPhotosFromDB, deletePhotoFromDB, updatePhotoInDB } from '@/lib/db';
import { isPinConfigured, verifyPin } from '@/lib/pin-security';

interface VaultStore {
  photos: PhotoItem[];
  activeFilter: VaultFilter;
  sortBy: VaultSortBy;
  isPinConfigured: boolean;
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
  loadPhotosFromDB: () => Promise<void>;
  unlockWithPin: (pin: string) => Promise<boolean>;
  lockVault: () => void;
  refreshPinState: () => void;
  setFilter: (filter: VaultFilter) => void;
  setSortBy: (sortBy: VaultSortBy) => void;
  toggleFavorite: (id: string) => Promise<void>;
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

const SESSION_UNLOCKED_KEY = 'photovault:session_unlocked';
const VAULT_LOCKED_KEY = 'photovault:vault_locked';

function getInitialLockState(): { isPinSet: boolean; isLocked: boolean } {
  const isPinSet = isPinConfigured();
  if (!isPinSet) {
    return { isPinSet: false, isLocked: false };
  }
  try {
    const isExplicitlyLocked = localStorage.getItem(VAULT_LOCKED_KEY) === 'true';
    const isSessionUnlocked = sessionStorage.getItem(SESSION_UNLOCKED_KEY) === 'true';
    const isLocked = isExplicitlyLocked || !isSessionUnlocked;
    return { isPinSet: true, isLocked };
  } catch {
    return { isPinSet: true, isLocked: true };
  }
}

const initialLockInfo = getInitialLockState();

export const useVaultStore = create<VaultStore>((set, get) => ({
  photos: [],
  activeFilter: 'all',
  sortBy: 'date-desc',
  isPinConfigured: initialLockInfo.isPinSet,
  isVaultLocked: initialLockInfo.isLocked,
  viewMode: 'editorial',
  storageUsedBytes: 0,
  totalCapacityBytes: 10737418240, // 10 GB
  isInitialized: false,

  ingestionQueue: [],
  duplicateAlerts: [],

  initStore: async () => {
    if (get().isInitialized) return;
    try {
      // Sync lock state and pin configuration across multiple tabs
      window.addEventListener('storage', (e) => {
        if (e.key === VAULT_LOCKED_KEY) {
          if (e.newValue === 'true') {
            get().lockVault();
          }
        } else if (e.key === 'photovault:pin_auth') {
          get().refreshPinState();
        }
      });

      const { isPinSet, isLocked } = getInitialLockState();
      set({ isPinConfigured: isPinSet, isVaultLocked: isLocked });

      if (!isLocked) {
        await get().loadPhotosFromDB();
      } else {
        // Vault is locked: keep photos memory empty to prevent flash of content
        set({ isInitialized: true, photos: [] });
      }
    } catch (error) {
      console.error('[ScrapItBro Store] Failed to initialize store:', error);
      set({ isInitialized: true });
    }
  },

  loadPhotosFromDB: async () => {
    try {
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

  unlockWithPin: async (pin: string) => {
    const isValid = await verifyPin(pin);
    if (!isValid) return false;

    try {
      sessionStorage.setItem(SESSION_UNLOCKED_KEY, 'true');
      localStorage.removeItem(VAULT_LOCKED_KEY);
    } catch {}

    set({ isVaultLocked: false });
    await get().loadPhotosFromDB();
    return true;
  },

  lockVault: () => {
    try {
      sessionStorage.removeItem(SESSION_UNLOCKED_KEY);
      localStorage.setItem(VAULT_LOCKED_KEY, 'true');
    } catch {}

    // Revoke blob URLs and purge photos from memory
    const currentPhotos = get().photos;
    for (const p of currentPhotos) {
      if (p.thumbnailUrl && p.thumbnailUrl.startsWith('blob:')) URL.revokeObjectURL(p.thumbnailUrl);
      if (p.fullUrl && p.fullUrl.startsWith('blob:')) URL.revokeObjectURL(p.fullUrl);
    }

    set({
      photos: [],
      isVaultLocked: true,
    });
  },

  refreshPinState: () => {
    const isPinSet = isPinConfigured();
    if (!isPinSet) {
      try {
        sessionStorage.removeItem(SESSION_UNLOCKED_KEY);
        localStorage.removeItem(VAULT_LOCKED_KEY);
      } catch {}
      set({ isPinConfigured: false, isVaultLocked: false });
      if (get().photos.length === 0) {
        get().loadPhotosFromDB();
      }
    } else {
      set({ isPinConfigured: true });
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
