import { POI, POIStatistics } from '../types/poi';

const DB_NAME = 'PrecoCajuPOI';
const DB_VERSION = 1;
const STORE_NAME = 'pois';
const STATS_STORE_NAME = 'poi_stats';

class POIOfflineStorage {
  private db: IDBDatabase | null = null;
  private isInitializing = false;

  get isInitialized(): boolean {
    return this.db !== null;
  }

  async init(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.isInitializing) {
      // Wait for ongoing initialization
      while (this.isInitializing && !this.isInitialized) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }

    this.isInitializing = true;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open POI IndexedDB:', request.error);
        this.isInitializing = false;
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitializing = false;
        console.log('POI IndexedDB opened successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create POIs store
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const poiStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          poiStore.createIndex('type', 'type', { unique: false });
          poiStore.createIndex('active', 'active', { unique: false });
          poiStore.createIndex('latitude', 'latitude', { unique: false });
          poiStore.createIndex('longitude', 'longitude', { unique: false });
          poiStore.createIndex('nom', 'nom', { unique: false });
          poiStore.createIndex('telephone', 'telephone', { unique: false });
          poiStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // Create stats store
        if (!db.objectStoreNames.contains(STATS_STORE_NAME)) {
          db.createObjectStore(STATS_STORE_NAME, { keyPath: 'id' });
        }

        console.log('POI IndexedDB schema created/updated');
      };
    });
  }

  async storePOIs(pois: POI[]): Promise<void> {
    if (!this.db) {
      throw new Error('POI IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      // Clear existing POIs first
      const clearRequest = store.clear();

      clearRequest.onsuccess = () => {
        let completed = 0;
        let hasError = false;

        if (pois.length === 0) {
          resolve();
          return;
        }

        pois.forEach(poi => {
          const request = store.add({
            ...poi,
            lastSync: new Date().toISOString(),
          });

          request.onsuccess = () => {
            completed++;
            if (completed === pois.length && !hasError) {
              resolve();
            }
          };

          request.onerror = () => {
            if (!hasError) {
              hasError = true;
              console.error('Failed to store POI:', poi.id, request.error);
              reject(request.error);
            }
          };
        });
      };

      clearRequest.onerror = () => {
        console.error('Failed to clear POI store:', clearRequest.error);
        reject(clearRequest.error);
      };
    });
  }

  async getPOIs(): Promise<POI[]> {
    if (!this.db) {
      throw new Error('POI IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const pois = request.result.map(poi => {
          // Remove the lastSync field that we added during storage
          const { lastSync, ...cleanPOI } = poi;
          return cleanPOI;
        });
        resolve(pois);
      };

      request.onerror = () => {
        console.error('Failed to get POIs from IndexedDB:', request.error);
        reject(request.error);
      };
    });
  }

  async getPOIsByType(type: POI['type']): Promise<POI[]> {
    if (!this.db) {
      throw new Error('POI IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('type');
      const request = index.getAll(type);

      request.onsuccess = () => {
        const pois = request.result.map(poi => {
          const { lastSync, ...cleanPOI } = poi;
          return cleanPOI;
        });
        resolve(pois);
      };

      request.onerror = () => {
        console.error('Failed to get POIs by type from IndexedDB:', request.error);
        reject(request.error);
      };
    });
  }

  async searchPOIs(searchTerm: string): Promise<POI[]> {
    if (!this.db) {
      throw new Error('POI IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const pois = request.result
          .filter(poi => 
            poi.nom.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map(poi => {
            const { lastSync, ...cleanPOI } = poi;
            return cleanPOI;
          });
        resolve(pois);
      };

      request.onerror = () => {
        console.error('Failed to search POIs in IndexedDB:', request.error);
        reject(request.error);
      };
    });
  }

  async getPOIsInBounds(bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }): Promise<POI[]> {
    if (!this.db) {
      throw new Error('POI IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const pois = request.result
          .filter(poi => 
            poi.latitude >= bounds.south &&
            poi.latitude <= bounds.north &&
            poi.longitude >= bounds.west &&
            poi.longitude <= bounds.east
          )
          .map(poi => {
            const { lastSync, ...cleanPOI } = poi;
            return cleanPOI;
          });
        resolve(pois);
      };

      request.onerror = () => {
        console.error('Failed to get POIs in bounds from IndexedDB:', request.error);
        reject(request.error);
      };
    });
  }

  async getPOIsWithPhone(): Promise<POI[]> {
    if (!this.db) {
      throw new Error('POI IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const pois = request.result
          .filter(poi => poi.telephone && poi.telephone.trim() !== '')
          .map(poi => {
            const { lastSync, ...cleanPOI } = poi;
            return cleanPOI;
          });
        resolve(pois);
      };

      request.onerror = () => {
        console.error('Failed to get POIs with phone from IndexedDB:', request.error);
        reject(request.error);
      };
    });
  }

  async storeStatistics(stats: POIStatistics): Promise<void> {
    if (!this.db) {
      throw new Error('POI IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STATS_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STATS_STORE_NAME);

      const request = store.put({
        id: 'latest',
        ...stats,
        lastSync: new Date().toISOString(),
      });

      request.onsuccess = () => resolve();
      request.onerror = () => {
        console.error('Failed to store POI statistics:', request.error);
        reject(request.error);
      };
    });
  }

  async getStatistics(): Promise<POIStatistics | null> {
    if (!this.db) {
      throw new Error('POI IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STATS_STORE_NAME], 'readonly');
      const store = transaction.objectStore(STATS_STORE_NAME);
      const request = store.get('latest');

      request.onsuccess = () => {
        if (request.result) {
          const { id, lastSync, ...stats } = request.result;
          resolve(stats);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error('Failed to get POI statistics from IndexedDB:', request.error);
        reject(request.error);
      };
    });
  }

  async getLastSyncTime(): Promise<Date | null> {
    if (!this.db) {
      throw new Error('POI IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        if (request.result.length > 0) {
          // Get the lastSync time from the first POI (they should all have the same sync time)
          const lastSync = request.result[0].lastSync;
          resolve(lastSync ? new Date(lastSync) : null);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error('Failed to get last sync time from IndexedDB:', request.error);
        reject(request.error);
      };
    });
  }

  async clear(): Promise<void> {
    if (!this.db) {
      throw new Error('POI IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME, STATS_STORE_NAME], 'readwrite');
      
      const poiStore = transaction.objectStore(STORE_NAME);
      const statsStore = transaction.objectStore(STATS_STORE_NAME);

      const clearPOIs = poiStore.clear();
      const clearStats = statsStore.clear();

      let completed = 0;
      const checkComplete = () => {
        completed++;
        if (completed === 2) {
          resolve();
        }
      };

      clearPOIs.onsuccess = checkComplete;
      clearPOIs.onerror = () => reject(clearPOIs.error);

      clearStats.onsuccess = checkComplete;
      clearStats.onerror = () => reject(clearStats.error);
    });
  }

  async isDataAvailable(): Promise<boolean> {
    if (!this.isInitialized) {
      return false;
    }

    try {
      const pois = await this.getPOIs();
      return pois.length > 0;
    } catch (error) {
      console.error('Failed to check if POI data is available:', error);
      return false;
    }
  }

  async getDataSize(): Promise<{ pois: number; stats: boolean }> {
    if (!this.isInitialized) {
      return { pois: 0, stats: false };
    }

    try {
      const pois = await this.getPOIs();
      const stats = await this.getStatistics();
      return {
        pois: pois.length,
        stats: stats !== null,
      };
    } catch (error) {
      console.error('Failed to get POI data size:', error);
      return { pois: 0, stats: false };
    }
  }
}

// Export singleton instance
export const poiOfflineStorage = new POIOfflineStorage();
