import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { StoredPhotoRecord } from '@/types';

const DB_NAME = 'photovault_db';
const DB_VERSION = 1;

interface PhotoVaultDBSchema extends DBSchema {
  photos: {
    key: string;
    value: StoredPhotoRecord;
    indexes: {
      'by_hash': string;
      'by_created': string;
      'by_favorite': number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<PhotoVaultDBSchema>> | null = null;

export function getDB(): Promise<IDBPDatabase<PhotoVaultDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<PhotoVaultDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('photos')) {
          const photoStore = db.createObjectStore('photos', { keyPath: 'id' });
          photoStore.createIndex('by_hash', 'sha256Hash');
          photoStore.createIndex('by_created', 'createdAt');
          photoStore.createIndex('by_favorite', 'isFavorite');
        }
      },
    });
  }
  return dbPromise;
}

export async function initVaultDatabase(): Promise<boolean> {
  try {
    await getDB();
    return true;
  } catch (error) {
    console.error('[ScrapItBro DB] Initialization error:', error);
    return false;
  }
}

export async function savePhotoToDB(record: StoredPhotoRecord): Promise<void> {
  const db = await getDB();
  await db.put('photos', record);
}

export async function getAllPhotosFromDB(): Promise<StoredPhotoRecord[]> {
  const db = await getDB();
  return db.getAll('photos');
}

export async function getPhotoFromDB(id: string): Promise<StoredPhotoRecord | undefined> {
  const db = await getDB();
  return db.get('photos', id);
}

export async function deletePhotoFromDB(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('photos', id);
}

export async function findPhotoByHash(hash: string): Promise<StoredPhotoRecord | undefined> {
  const db = await getDB();
  return db.getFromIndex('photos', 'by_hash', hash);
}

export async function updatePhotoInDB(id: string, updates: Partial<StoredPhotoRecord>): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('photos', 'readwrite');
  const store = tx.objectStore('photos');
  const existing = await store.get(id);
  if (existing) {
    const updated = { ...existing, ...updates };
    await store.put(updated);
  }
  await tx.done;
}

export async function clearAllPhotosFromDB(): Promise<void> {
  const db = await getDB();
  await db.clear('photos');
}
