// IndexedDB service for Revenue Simulator offline storage
import { Simulation, OfflineSimulationData } from '../types/simulation';

const DB_NAME = 'PrecoCajuSimulations';
const DB_VERSION = 1;
const STORE_NAME = 'simulations';

class SimulationStorageService {
  private db: IDBDatabase | null = null;

  /**
   * Initialize IndexedDB connection
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create simulations store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('userId', 'userId', { unique: false });
          store.createIndex('status', 'status', { unique: false });
        }
      };
    });
  }

  /**
   * Save simulation to IndexedDB
   */
  async saveSimulation(simulation: Simulation): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    const offlineData: OfflineSimulationData = {
      id: simulation.id,
      data: simulation,
      status: 'pending',
      createdAt: new Date().toISOString(),
      retryCount: 0,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(offlineData);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to save simulation'));
    });
  }

  /**
   * Get all simulations from IndexedDB
   */
  async getAllSimulations(): Promise<Simulation[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const offlineData: OfflineSimulationData[] = request.result;
        const simulations = offlineData.map(item => item.data);
        // Sort by creation date (newest first)
        simulations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        resolve(simulations);
      };

      request.onerror = () => reject(new Error('Failed to get simulations'));
    });
  }

  /**
   * Get simulation by ID
   */
  async getSimulationById(id: string): Promise<Simulation | null> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        const offlineData: OfflineSimulationData | undefined = request.result;
        resolve(offlineData ? offlineData.data : null);
      };

      request.onerror = () => reject(new Error('Failed to get simulation'));
    });
  }

  /**
   * Delete simulation from IndexedDB
   */
  async deleteSimulation(id: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to delete simulation'));
    });
  }

  /**
   * Update simulation status (for sync purposes)
   */
  async updateSimulationStatus(id: string, status: 'pending' | 'synced' | 'error', error?: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const offlineData: OfflineSimulationData | undefined = getRequest.result;
        if (!offlineData) {
          reject(new Error('Simulation not found'));
          return;
        }

        offlineData.status = status;
        if (status === 'synced') {
          offlineData.syncedAt = new Date().toISOString();
        }
        if (error) {
          offlineData.lastError = error;
        }
        if (status === 'error') {
          offlineData.retryCount += 1;
        }

        const putRequest = store.put(offlineData);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(new Error('Failed to update simulation status'));
      };

      getRequest.onerror = () => reject(new Error('Failed to get simulation'));
    });
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    totalSimulations: number;
    pendingSync: number;
    synced: number;
    errors: number;
    totalSize: number;
  }> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const offlineData: OfflineSimulationData[] = request.result;
        
        const stats = {
          totalSimulations: offlineData.length,
          pendingSync: offlineData.filter(item => item.status === 'pending').length,
          synced: offlineData.filter(item => item.status === 'synced').length,
          errors: offlineData.filter(item => item.status === 'error').length,
          totalSize: JSON.stringify(offlineData).length,
        };

        resolve(stats);
      };

      request.onerror = () => reject(new Error('Failed to get storage stats'));
    });
  }

  /**
   * Clear all simulations (for testing/cleanup)
   */
  async clearAllSimulations(): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to clear simulations'));
    });
  }

  /**
   * Check if IndexedDB is supported
   */
  static isSupported(): boolean {
    return 'indexedDB' in window;
  }
}

// Export singleton instance
export const simulationStorageService = new SimulationStorageService();

