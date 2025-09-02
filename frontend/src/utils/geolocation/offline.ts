/**
 * Utilitaires pour le support GPS en mode offline
 * Gestion du cache local, synchronisation et données offline
 */

import { GeolocationPosition, GeocodingAddress, GpsCoordinates } from '../../types/api';

// Configuration du cache
const CACHE_CONFIG = {
  DB_NAME: 'PrecoDiCajuGPS',
  DB_VERSION: 1,
  STORES: {
    POSITIONS: 'gps_positions',
    GEOCODING: 'geocoding_cache',
    SYNC_QUEUE: 'sync_queue'
  },
  CACHE_DURATION: {
    POSITIONS: 24 * 60 * 60 * 1000, // 24 heures
    GEOCODING: 7 * 24 * 60 * 60 * 1000, // 7 jours
    SYNC_QUEUE: 30 * 24 * 60 * 60 * 1000 // 30 jours
  }
};

// Types pour le cache
export interface CachedPosition extends GeolocationPosition {
  id: string;
  cachedAt: number;
  synced: boolean;
  accuracy: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'invalid';
}

export interface CachedGeocoding {
  id: string;
  coordinates: GpsCoordinates;
  address: GeocodingAddress;
  cachedAt: number;
  synced: boolean;
}

export interface SyncQueueItem {
  id: string;
  type: 'position' | 'geocoding';
  data: CachedPosition | CachedGeocoding;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export interface OfflineStatus {
  isOnline: boolean;
  lastSync: number | null;
  pendingSync: number;
  cacheSize: number;
  canWorkOffline: boolean;
}

/**
 * Gestionnaire de base de données IndexedDB pour le cache GPS
 */
class OfflineGPSManager {
  private db: IDBDatabase | null = null;
  private isInitialized = false;

  /**
   * Initialise la base de données IndexedDB
   */
  async initialize(): Promise<void> {
    if (this.isInitialized && this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(CACHE_CONFIG.DB_NAME, CACHE_CONFIG.DB_VERSION);

      request.onerror = () => {
        reject(new Error('Impossible d\'ouvrir la base de données IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Store pour les positions GPS
        if (!db.objectStoreNames.contains(CACHE_CONFIG.STORES.POSITIONS)) {
          const positionStore = db.createObjectStore(CACHE_CONFIG.STORES.POSITIONS, { keyPath: 'id' });
          positionStore.createIndex('timestamp', 'timestamp', { unique: false });
          positionStore.createIndex('cachedAt', 'cachedAt', { unique: false });
          positionStore.createIndex('synced', 'synced', { unique: false });
        }

        // Store pour le cache de géocodage
        if (!db.objectStoreNames.contains(CACHE_CONFIG.STORES.GEOCODING)) {
          const geocodingStore = db.createObjectStore(CACHE_CONFIG.STORES.GEOCODING, { keyPath: 'id' });
          geocodingStore.createIndex('coordinates', 'coordinates', { unique: false });
          geocodingStore.createIndex('cachedAt', 'cachedAt', { unique: false });
          geocodingStore.createIndex('synced', 'synced', { unique: false });
        }

        // Store pour la queue de synchronisation
        if (!db.objectStoreNames.contains(CACHE_CONFIG.STORES.SYNC_QUEUE)) {
          const syncStore = db.createObjectStore(CACHE_CONFIG.STORES.SYNC_QUEUE, { keyPath: 'id' });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('type', 'type', { unique: false });
          syncStore.createIndex('retryCount', 'retryCount', { unique: false });
        }
      };
    });
  }

  /**
   * Vérifie si IndexedDB est supporté
   */
  isSupported(): boolean {
    return typeof indexedDB !== 'undefined';
  }

  /**
   * Stocke une position GPS dans le cache
   */
  async cachePosition(position: GeolocationPosition): Promise<string> {
    if (!this.db) {
      throw new Error('Base de données non initialisée');
    }

    const id = `pos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const cachedPosition: CachedPosition = {
      ...position,
      id,
      cachedAt: Date.now(),
      synced: false
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CACHE_CONFIG.STORES.POSITIONS], 'readwrite');
      const store = transaction.objectStore(CACHE_CONFIG.STORES.POSITIONS);
      const request = store.add(cachedPosition);

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(new Error('Erreur lors du stockage de la position'));
    });
  }

  /**
   * Récupère les positions GPS du cache
   */
  async getCachedPositions(limit = 100): Promise<CachedPosition[]> {
    if (!this.db) {
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CACHE_CONFIG.STORES.POSITIONS], 'readonly');
      const store = transaction.objectStore(CACHE_CONFIG.STORES.POSITIONS);
      const index = store.index('cachedAt');
      const request = index.openCursor(null, 'prev');

      const positions: CachedPosition[] = [];
      let count = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && count < limit) {
          positions.push(cursor.value);
          count++;
          cursor.continue();
        } else {
          resolve(positions);
        }
      };

      request.onerror = () => reject(new Error('Erreur lors de la récupération des positions'));
    });
  }

  /**
   * Stocke un résultat de géocodage dans le cache
   */
  async cacheGeocoding(coordinates: GpsCoordinates, address: GeocodingAddress): Promise<string> {
    if (!this.db) {
      throw new Error('Base de données non initialisée');
    }

    const id = `geo_${coordinates.lat}_${coordinates.lng}_${Date.now()}`;
    const cachedGeocoding: CachedGeocoding = {
      id,
      coordinates,
      address,
      cachedAt: Date.now(),
      synced: false
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CACHE_CONFIG.STORES.GEOCODING], 'readwrite');
      const store = transaction.objectStore(CACHE_CONFIG.STORES.GEOCODING);
      const request = store.add(cachedGeocoding);

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(new Error('Erreur lors du stockage du géocodage'));
    });
  }

  /**
   * Récupère un résultat de géocodage du cache
   */
  async getCachedGeocoding(coordinates: GpsCoordinates, tolerance = 0.001): Promise<GeocodingAddress | null> {
    if (!this.db) {
      return null;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CACHE_CONFIG.STORES.GEOCODING], 'readonly');
      const store = transaction.objectStore(CACHE_CONFIG.STORES.GEOCODING);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result as CachedGeocoding[];
        
        // Chercher une correspondance dans la tolérance
        const match = results.find(item => {
          const latDiff = Math.abs(item.coordinates.lat - coordinates.lat);
          const lngDiff = Math.abs(item.coordinates.lng - coordinates.lng);
          return latDiff <= tolerance && lngDiff <= tolerance;
        });

        resolve(match ? match.address : null);
      };

      request.onerror = () => reject(new Error('Erreur lors de la récupération du géocodage'));
    });
  }

  /**
   * Ajoute un élément à la queue de synchronisation
   */
  async addToSyncQueue(item: Omit<SyncQueueItem, 'id'>): Promise<string> {
    if (!this.db) {
      throw new Error('Base de données non initialisée');
    }

    const id = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const syncItem: SyncQueueItem = {
      ...item,
      id
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CACHE_CONFIG.STORES.SYNC_QUEUE], 'readwrite');
      const store = transaction.objectStore(CACHE_CONFIG.STORES.SYNC_QUEUE);
      const request = store.add(syncItem);

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(new Error('Erreur lors de l\'ajout à la queue de sync'));
    });
  }

  /**
   * Récupère les éléments de la queue de synchronisation
   */
  async getSyncQueue(): Promise<SyncQueueItem[]> {
    if (!this.db) {
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CACHE_CONFIG.STORES.SYNC_QUEUE], 'readonly');
      const store = transaction.objectStore(CACHE_CONFIG.STORES.SYNC_QUEUE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Erreur lors de la récupération de la queue de sync'));
    });
  }

  /**
   * Supprime un élément de la queue de synchronisation
   */
  async removeFromSyncQueue(id: string): Promise<void> {
    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CACHE_CONFIG.STORES.SYNC_QUEUE], 'readwrite');
      const store = transaction.objectStore(CACHE_CONFIG.STORES.SYNC_QUEUE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Erreur lors de la suppression de la queue de sync'));
    });
  }

  /**
   * Nettoie le cache des données expirées
   */
  async cleanExpiredCache(): Promise<void> {
    if (!this.db) {
      return;
    }

    const now = Date.now();
    const stores = [CACHE_CONFIG.STORES.POSITIONS, CACHE_CONFIG.STORES.GEOCODING];

    for (const storeName of stores) {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const index = store.index('cachedAt');
      const request = index.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const item = cursor.value;
          const cacheDuration = storeName === CACHE_CONFIG.STORES.POSITIONS 
            ? CACHE_CONFIG.CACHE_DURATION.POSITIONS 
            : CACHE_CONFIG.CACHE_DURATION.GEOCODING;
          
          if (now - item.cachedAt > cacheDuration) {
            cursor.delete();
          }
          cursor.continue();
        }
      };
    }
  }

  /**
   * Obtient les statistiques du cache
   */
  async getCacheStats(): Promise<{
    positions: number;
    geocoding: number;
    syncQueue: number;
    totalSize: number;
  }> {
    if (!this.db) {
      return { positions: 0, geocoding: 0, syncQueue: 0, totalSize: 0 };
    }

    const [positions, geocoding, syncQueue] = await Promise.all([
      this.getCachedPositions(1000),
      this.getCachedGeocoding({ lat: 0, lng: 0 }, 180), // Récupère tout
      this.getSyncQueue()
    ]);

    return {
      positions: positions.length,
      geocoding: geocoding ? 1 : 0, // Approximation
      syncQueue: syncQueue.length,
      totalSize: positions.length + (geocoding ? 1 : 0) + syncQueue.length
    };
  }

  /**
   * Ferme la connexion à la base de données
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
  }
}

// Instance singleton
export const offlineGPSManager = new OfflineGPSManager();

/**
 * Gestionnaire de synchronisation offline/online
 */
export class OfflineSyncManager {
  private isOnline = navigator.onLine;
  private syncInProgress = false;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.setupEventListeners();
  }

  /**
   * Configure les écouteurs d'événements pour la connectivité
   */
  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.startSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.stopSync();
    });
  }

  /**
   * Démarre la synchronisation automatique
   */
  startSync(): void {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;
    this.syncInterval = setInterval(() => {
      this.performSync();
    }, 30000); // Sync toutes les 30 secondes

    // Sync immédiat
    this.performSync();
  }

  /**
   * Arrête la synchronisation automatique
   */
  stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.syncInProgress = false;
  }

  /**
   * Effectue la synchronisation des données
   */
  private async performSync(): Promise<void> {
    if (!this.isOnline || this.syncInProgress) {
      return;
    }

    try {
      const queue = await offlineGPSManager.getSyncQueue();
      
      for (const item of queue) {
        if (item.retryCount >= item.maxRetries) {
          await offlineGPSManager.removeFromSyncQueue(item.id);
          continue;
        }

        try {
          // Ici, vous pouvez implémenter la logique de synchronisation
          // avec votre API backend
          await this.syncItem(item);
          await offlineGPSManager.removeFromSyncQueue(item.id);
        } catch (error) {
          console.error('Erreur de synchronisation:', error);
          // Incrémenter le compteur de retry
          item.retryCount++;
          // Mettre à jour l'item dans la queue
        }
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
    }
  }

  /**
   * Synchronise un élément spécifique
   */
  private async syncItem(item: SyncQueueItem): Promise<void> {
    // Implémentation de la synchronisation avec l'API
    // Cette méthode sera étendue selon vos besoins
    console.log('Synchronisation de l\'élément:', item);
  }

  /**
   * Obtient le statut de la synchronisation
   */
  getStatus(): OfflineStatus {
    return {
      isOnline: this.isOnline,
      lastSync: null, // À implémenter
      pendingSync: 0, // À implémenter
      cacheSize: 0, // À implémenter
      canWorkOffline: offlineGPSManager.isSupported()
    };
  }
}

// Instance singleton
export const offlineSyncManager = new OfflineSyncManager();

/**
 * Utilitaires pour la gestion offline
 */
export const offlineUtils = {
  /**
   * Vérifie si l'application peut fonctionner en mode offline
   */
  canWorkOffline(): boolean {
    return offlineGPSManager.isSupported() && 'serviceWorker' in navigator;
  },

  /**
   * Obtient le statut de connectivité
   */
  getConnectivityStatus(): OfflineStatus {
    return offlineSyncManager.getStatus();
  },

  /**
   * Initialise le système offline
   */
  async initialize(): Promise<void> {
    await offlineGPSManager.initialize();
    offlineSyncManager.startSync();
  },

  /**
   * Nettoie le cache
   */
  async cleanup(): Promise<void> {
    await offlineGPSManager.cleanExpiredCache();
  },

  /**
   * Obtient les statistiques du cache
   */
  async getStats(): Promise<{
    positions: number;
    geocoding: number;
    syncQueue: number;
    totalSize: number;
  }> {
    return await offlineGPSManager.getCacheStats();
  }
};
