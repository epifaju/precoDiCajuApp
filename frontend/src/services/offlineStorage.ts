// Service de stockage offline avec IndexedDB
import {
  OfflinePriceData,
  SyncQueueItem,
  SyncMetadata,
  ConflictResolution,
  OfflineReferenceData,
  SyncEvent,
  StorageResult,
  QueryOptions,
  StorageParams,
  OfflineConfig,
  SyncStatus,
  SyncAction,
  SyncEntity,
  DEFAULT_STORAGE_PARAMS,
  DEFAULT_OFFLINE_CONFIG
} from '../types/offline';

// Classe principale de gestion du stockage offline
export class OfflineStorageService {
  private db: IDBDatabase | null = null;
  private config: OfflineConfig;
  private params: StorageParams;
  private isInitialized = false;

  constructor(
    config: Partial<OfflineConfig> = {},
    params: Partial<StorageParams> = {}
  ) {
    this.config = { ...DEFAULT_OFFLINE_CONFIG, ...config };
    this.params = { ...DEFAULT_STORAGE_PARAMS, ...params };
  }

  // Initialisation de la base de données
  async initialize(): Promise<StorageResult<boolean>> {
    try {
      if (this.isInitialized && this.db) {
        return { success: true, data: true, timestamp: new Date().toISOString() };
      }

      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.params.dbName, this.params.version);

        request.onerror = () => {
          reject({
            success: false,
            error: `Failed to open database: ${request.error?.message}`,
            timestamp: new Date().toISOString()
          });
        };

        request.onsuccess = () => {
          this.db = request.result;
          this.isInitialized = true;
          resolve({
            success: true,
            data: true,
            timestamp: new Date().toISOString()
          });
        };

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          this.createStores(db);
        };
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Création des stores IndexedDB
  private createStores(db: IDBDatabase): void {
    // Store pour les prix offline
    if (!db.objectStoreNames.contains(this.params.stores.prices)) {
      const priceStore = db.createObjectStore(this.params.stores.prices, { keyPath: 'id' });
      priceStore.createIndex('status', 'status', { unique: false });
      priceStore.createIndex('createdAt', 'createdAt', { unique: false });
      priceStore.createIndex('syncedAt', 'syncedAt', { unique: false });
    }

    // Store pour la queue de synchronisation
    if (!db.objectStoreNames.contains(this.params.stores.syncQueue)) {
      const queueStore = db.createObjectStore(this.params.stores.syncQueue, { keyPath: 'id' });
      queueStore.createIndex('priority', 'priority', { unique: false });
      queueStore.createIndex('entity', 'entity', { unique: false });
      queueStore.createIndex('nextRetry', 'nextRetry', { unique: false });
      queueStore.createIndex('attempts', 'attempts', { unique: false });
    }

    // Store pour les métadonnées
    if (!db.objectStoreNames.contains(this.params.stores.metadata)) {
      db.createObjectStore(this.params.stores.metadata, { keyPath: 'id' });
    }

    // Store pour les conflits
    if (!db.objectStoreNames.contains(this.params.stores.conflicts)) {
      const conflictStore = db.createObjectStore(this.params.stores.conflicts, { keyPath: 'conflictId' });
      conflictStore.createIndex('resolvedAt', 'resolvedAt', { unique: false });
    }

    // Store pour les données de référence
    if (!db.objectStoreNames.contains(this.params.stores.referenceData)) {
      db.createObjectStore(this.params.stores.referenceData, { keyPath: 'type' });
    }

    // Store pour les événements
    if (!db.objectStoreNames.contains(this.params.stores.events)) {
      const eventStore = db.createObjectStore(this.params.stores.events, { keyPath: 'id', autoIncrement: true });
      eventStore.createIndex('timestamp', 'timestamp', { unique: false });
      eventStore.createIndex('type', 'type', { unique: false });
    }
  }

  // === GESTION DES PRIX OFFLINE ===

  // Sauvegarder un prix offline
  async saveOfflinePrice(priceData: Omit<OfflinePriceData, 'id' | 'createdAt' | 'retryCount'>): Promise<StorageResult<OfflinePriceData>> {
    try {
      await this.ensureInitialized();
      
      const offlinePrice: OfflinePriceData = {
        ...priceData,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        retryCount: 0
      };

      const result = await this.addToStore(this.params.stores.prices, offlinePrice);
      
      if (result.success) {
        // Ajouter à la queue de synchronisation
        await this.addToSyncQueue({
          action: SyncAction.CREATE,
          entity: SyncEntity.PRICE,
          entityId: offlinePrice.id,
          data: offlinePrice.data,
          priority: 1
        });
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Récupérer tous les prix offline
  async getOfflinePrices(options: QueryOptions = {}): Promise<StorageResult<OfflinePriceData[]>> {
    try {
      await this.ensureInitialized();
      return await this.getAllFromStore(this.params.stores.prices, options);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Récupérer les prix par statut
  async getOfflinePricesByStatus(status: SyncStatus): Promise<StorageResult<OfflinePriceData[]>> {
    try {
      await this.ensureInitialized();
      return await this.getByIndex(this.params.stores.prices, 'status', status);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Mettre à jour le statut d'un prix
  async updatePriceStatus(id: string, status: SyncStatus, error?: string): Promise<StorageResult<boolean>> {
    try {
      await this.ensureInitialized();
      
      const price = await this.getFromStore(this.params.stores.prices, id);
      if (!price.success || !price.data) {
        return { success: false, error: 'Price not found', timestamp: new Date().toISOString() };
      }

      const updatedPrice: OfflinePriceData = {
        ...price.data,
        status,
        syncedAt: status === SyncStatus.SYNCED ? new Date().toISOString() : undefined,
        lastError: error,
        retryCount: status === SyncStatus.ERROR ? price.data.retryCount + 1 : price.data.retryCount
      };

      return await this.updateInStore(this.params.stores.prices, id, updatedPrice);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Supprimer un prix offline
  async deleteOfflinePrice(id: string): Promise<StorageResult<boolean>> {
    try {
      await this.ensureInitialized();
      return await this.deleteFromStore(this.params.stores.prices, id);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // === GESTION DE LA QUEUE DE SYNCHRONISATION ===

  // Ajouter un élément à la queue
  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'attempts' | 'nextRetry'>): Promise<StorageResult<SyncQueueItem>> {
    try {
      await this.ensureInitialized();
      
      const queueItem: SyncQueueItem = {
        ...item,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        attempts: 0,
        nextRetry: new Date().toISOString(),
        maxAttempts: this.config.maxRetryAttempts
      };

      return await this.addToStore(this.params.stores.syncQueue, queueItem);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Récupérer la queue de synchronisation
  async getSyncQueue(options: QueryOptions = {}): Promise<StorageResult<SyncQueueItem[]>> {
    try {
      await this.ensureInitialized();
      return await this.getAllFromStore(this.params.stores.syncQueue, options);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Récupérer les éléments prêts pour la synchronisation
  async getReadyForSync(): Promise<StorageResult<SyncQueueItem[]>> {
    try {
      await this.ensureInitialized();
      
      const now = new Date().toISOString();
      const result = await this.getByIndexRange(
        this.params.stores.syncQueue,
        'nextRetry',
        IDBKeyRange.upperBound(now)
      );

      if (result.success && result.data) {
        // Filtrer par nombre de tentatives
        const readyItems = result.data.filter(item => item.attempts < item.maxAttempts);
        return { success: true, data: readyItems, timestamp: new Date().toISOString() };
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Mettre à jour un élément de la queue
  async updateSyncQueueItem(id: string, updates: Partial<SyncQueueItem>): Promise<StorageResult<boolean>> {
    try {
      await this.ensureInitialized();
      
      const item = await this.getFromStore(this.params.stores.syncQueue, id);
      if (!item.success || !item.data) {
        return { success: false, error: 'Queue item not found', timestamp: new Date().toISOString() };
      }

      const updatedItem = { ...item.data, ...updates };
      return await this.updateInStore(this.params.stores.syncQueue, id, updatedItem);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Supprimer un élément de la queue
  async removeFromSyncQueue(id: string): Promise<StorageResult<boolean>> {
    try {
      await this.ensureInitialized();
      return await this.deleteFromStore(this.params.stores.syncQueue, id);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // === GESTION DES MÉTADONNÉES ===

  // Mettre à jour les métadonnées de synchronisation
  async updateSyncMetadata(metadata: Partial<SyncMetadata>): Promise<StorageResult<boolean>> {
    try {
      await this.ensureInitialized();
      
      const existing = await this.getFromStore(this.params.stores.metadata, 'sync_metadata');
      const currentMetadata: SyncMetadata = existing.success && existing.data 
        ? existing.data 
        : {
            lastSync: '',
            pendingCount: 0,
            conflictCount: 0,
            errorCount: 0,
            isOnline: navigator.onLine,
            lastOnlineCheck: new Date().toISOString(),
            totalOfflineActions: 0,
            successfulSyncs: 0
          };

      const updatedMetadata = { ...currentMetadata, ...metadata };
      return await this.updateInStore(this.params.stores.metadata, 'sync_metadata', updatedMetadata);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Récupérer les métadonnées
  async getSyncMetadata(): Promise<StorageResult<SyncMetadata>> {
    try {
      await this.ensureInitialized();
      return await this.getFromStore(this.params.stores.metadata, 'sync_metadata');
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // === GESTION DES DONNÉES DE RÉFÉRENCE ===

  // Sauvegarder les données de référence
  async saveReferenceData(type: string, data: any[]): Promise<StorageResult<boolean>> {
    try {
      await this.ensureInitialized();
      
      const referenceData: OfflineReferenceData = {
        regions: type === 'regions' ? data : [],
        qualities: type === 'qualities' ? data : [],
        users: type === 'users' ? data : [],
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      };

      return await this.updateInStore(this.params.stores.referenceData, type, referenceData);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Récupérer les données de référence
  async getReferenceData(type: string): Promise<StorageResult<OfflineReferenceData>> {
    try {
      await this.ensureInitialized();
      return await this.getFromStore(this.params.stores.referenceData, type);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // === GESTION DES ÉVÉNEMENTS ===

  // Enregistrer un événement
  async logEvent(event: Omit<SyncEvent, 'timestamp'>): Promise<StorageResult<boolean>> {
    try {
      await this.ensureInitialized();
      
      const syncEvent: SyncEvent = {
        ...event,
        timestamp: new Date().toISOString()
      };

      return await this.addToStore(this.params.stores.events, syncEvent);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Récupérer les événements récents
  async getRecentEvents(limit = 50): Promise<StorageResult<SyncEvent[]>> {
    try {
      await this.ensureInitialized();
      
      const result = await this.getAllFromStore(this.params.stores.events, { 
        limit, 
        orderBy: 'timestamp', 
        orderDirection: 'desc' 
      });
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // === MÉTHODES UTILITAIRES ===

  // Vérifier que la base est initialisée
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized || !this.db) {
      await this.initialize();
    }
  }

  // Générer un ID unique
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Opérations génériques sur les stores
  private async addToStore<T>(storeName: string, data: T): Promise<StorageResult<T>> {
    return new Promise((resolve) => {
      if (!this.db) {
        resolve({ success: false, error: 'Database not initialized', timestamp: new Date().toISOString() });
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => {
        resolve({ success: true, data, timestamp: new Date().toISOString() });
      };

      request.onerror = () => {
        resolve({ 
          success: false, 
          error: `Failed to add to ${storeName}: ${request.error?.message}`, 
          timestamp: new Date().toISOString() 
        });
      };
    });
  }

  private async getFromStore<T>(storeName: string, key: string): Promise<StorageResult<T>> {
    return new Promise((resolve) => {
      if (!this.db) {
        resolve({ success: false, error: 'Database not initialized', timestamp: new Date().toISOString() });
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve({ success: true, data: request.result, timestamp: new Date().toISOString() });
      };

      request.onerror = () => {
        resolve({ 
          success: false, 
          error: `Failed to get from ${storeName}: ${request.error?.message}`, 
          timestamp: new Date().toISOString() 
        });
      };
    });
  }

  private async getAllFromStore<T>(storeName: string, options: QueryOptions = {}): Promise<StorageResult<T[]>> {
    return new Promise((resolve) => {
      if (!this.db) {
        resolve({ success: false, error: 'Database not initialized', timestamp: new Date().toISOString() });
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        let results = request.result || [];
        
        // Appliquer les options de requête
        if (options.filter) {
          results = results.filter(item => 
            Object.entries(options.filter!).every(([key, value]) => item[key] === value)
          );
        }

        if (options.orderBy) {
          results.sort((a, b) => {
            const aVal = a[options.orderBy!];
            const bVal = b[options.orderBy!];
            const direction = options.orderDirection === 'desc' ? -1 : 1;
            return aVal < bVal ? -1 * direction : aVal > bVal ? 1 * direction : 0;
          });
        }

        if (options.limit) {
          results = results.slice(0, options.limit);
        }

        resolve({ success: true, data: results, timestamp: new Date().toISOString() });
      };

      request.onerror = () => {
        resolve({ 
          success: false, 
          error: `Failed to get all from ${storeName}: ${request.error?.message}`, 
          timestamp: new Date().toISOString() 
        });
      };
    });
  }

  private async updateInStore<T>(storeName: string, key: string, data: T): Promise<StorageResult<boolean>> {
    return new Promise((resolve) => {
      if (!this.db) {
        resolve({ success: false, error: 'Database not initialized', timestamp: new Date().toISOString() });
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data, key);

      request.onsuccess = () => {
        resolve({ success: true, data: true, timestamp: new Date().toISOString() });
      };

      request.onerror = () => {
        resolve({ 
          success: false, 
          error: `Failed to update in ${storeName}: ${request.error?.message}`, 
          timestamp: new Date().toISOString() 
        });
      };
    });
  }

  private async deleteFromStore(storeName: string, key: string): Promise<StorageResult<boolean>> {
    return new Promise((resolve) => {
      if (!this.db) {
        resolve({ success: false, error: 'Database not initialized', timestamp: new Date().toISOString() });
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => {
        resolve({ success: true, data: true, timestamp: new Date().toISOString() });
      };

      request.onerror = () => {
        resolve({ 
          success: false, 
          error: `Failed to delete from ${storeName}: ${request.error?.message}`, 
          timestamp: new Date().toISOString() 
        });
      };
    });
  }

  private async getByIndex<T>(storeName: string, indexName: string, value: any): Promise<StorageResult<T[]>> {
    return new Promise((resolve) => {
      if (!this.db) {
        resolve({ success: false, error: 'Database not initialized', timestamp: new Date().toISOString() });
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => {
        resolve({ success: true, data: request.result || [], timestamp: new Date().toISOString() });
      };

      request.onerror = () => {
        resolve({ 
          success: false, 
          error: `Failed to get by index from ${storeName}: ${request.error?.message}`, 
          timestamp: new Date().toISOString() 
        });
      };
    });
  }

  private async getByIndexRange<T>(storeName: string, indexName: string, range: IDBKeyRange): Promise<StorageResult<T[]>> {
    return new Promise((resolve) => {
      if (!this.db) {
        resolve({ success: false, error: 'Database not initialized', timestamp: new Date().toISOString() });
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(range);

      request.onsuccess = () => {
        resolve({ success: true, data: request.result || [], timestamp: new Date().toISOString() });
      };

      request.onerror = () => {
        resolve({ 
          success: false, 
          error: `Failed to get by index range from ${storeName}: ${request.error?.message}`, 
          timestamp: new Date().toISOString() 
        });
      };
    });
  }

  // Nettoyage et maintenance
  async cleanup(): Promise<StorageResult<boolean>> {
    try {
      await this.ensureInitialized();
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.maxOfflineStorageDays);
      const cutoffISO = cutoffDate.toISOString();

      // Nettoyer les anciens événements
      const events = await this.getAllFromStore(this.params.stores.events);
      if (events.success && events.data) {
        const recentEvents = events.data.filter((event: any) => event.timestamp > cutoffISO);
        // Supprimer et recréer le store des événements
        // (Implémentation simplifiée - en production, utiliser une approche plus sophistiquée)
      }

      return { success: true, data: true, timestamp: new Date().toISOString() };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Fermer la connexion
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
  }
}

// Instance singleton
export const offlineStorage = new OfflineStorageService();
