// Hook de gestion du stockage offline
import { useState, useEffect, useCallback, useRef } from 'react';
import { offlineStorage } from '../services/offlineStorage';
import {
  OfflinePriceData,
  SyncQueueItem,
  SyncMetadata,
  SyncStatus,
  SyncAction,
  SyncEntity,
  StorageResult,
  QueryOptions,
  OfflineConfig,
  DEFAULT_OFFLINE_CONFIG
} from '../types/offline';

// Interface pour l'état du hook
interface OfflineStorageState {
  isInitialized: boolean;
  isOnline: boolean;
  pendingCount: number;
  errorCount: number;
  lastSync: string;
  isLoading: boolean;
  error: string | null;
}

// Interface pour les actions du hook
interface OfflineStorageActions {
  // Gestion des prix offline
  saveOfflinePrice: (priceData: Omit<OfflinePriceData, 'id' | 'createdAt' | 'retryCount'>) => Promise<StorageResult<OfflinePriceData>>;
  getOfflinePrices: (options?: QueryOptions) => Promise<StorageResult<OfflinePriceData[]>>;
  getOfflinePricesByStatus: (status: SyncStatus) => Promise<StorageResult<OfflinePriceData[]>>;
  updatePriceStatus: (id: string, status: SyncStatus, error?: string) => Promise<StorageResult<boolean>>;
  deleteOfflinePrice: (id: string) => Promise<StorageResult<boolean>>;
  
  // Gestion de la queue de synchronisation
  addToSyncQueue: (item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'attempts' | 'nextRetry'>) => Promise<StorageResult<SyncQueueItem>>;
  getSyncQueue: (options?: QueryOptions) => Promise<StorageResult<SyncQueueItem[]>>;
  getReadyForSync: () => Promise<StorageResult<SyncQueueItem[]>>;
  updateSyncQueueItem: (id: string, updates: Partial<SyncQueueItem>) => Promise<StorageResult<boolean>>;
  removeFromSyncQueue: (id: string) => Promise<StorageResult<boolean>>;
  
  // Gestion des métadonnées
  updateSyncMetadata: (metadata: Partial<SyncMetadata>) => Promise<StorageResult<boolean>>;
  getSyncMetadata: () => Promise<StorageResult<SyncMetadata>>;
  
  // Utilitaires
  refreshState: () => Promise<void>;
  cleanup: () => Promise<StorageResult<boolean>>;
  initialize: () => Promise<StorageResult<boolean>>;
}

// Hook principal
export const useOfflineStorage = (config?: Partial<OfflineConfig>) => {
  const [state, setState] = useState<OfflineStorageState>({
    isInitialized: false,
    isOnline: navigator.onLine,
    pendingCount: 0,
    errorCount: 0,
    lastSync: '',
    isLoading: false,
    error: null
  });

  const configRef = useRef<OfflineConfig>({ ...DEFAULT_OFFLINE_CONFIG, ...config });
  const isInitializingRef = useRef(false);

  // Initialisation du service
  const initialize = useCallback(async (): Promise<StorageResult<boolean>> => {
    if (isInitializingRef.current) {
      return { success: false, error: 'Already initializing', timestamp: new Date().toISOString() };
    }

    isInitializingRef.current = true;
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await offlineStorage.initialize();
      
      if (result.success) {
        setState(prev => ({ ...prev, isInitialized: true, isLoading: false }));
        await refreshState();
      } else {
        setState(prev => ({ ...prev, error: result.error || 'Initialization failed', isLoading: false }));
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      return { success: false, error: errorMessage, timestamp: new Date().toISOString() };
    } finally {
      isInitializingRef.current = false;
    }
  }, []);

  // Actualiser l'état
  const refreshState = useCallback(async (): Promise<void> => {
    try {
      const [metadataResult, queueResult] = await Promise.all([
        offlineStorage.getSyncMetadata(),
        offlineStorage.getSyncQueue()
      ]);

      if (metadataResult.success && metadataResult.data) {
        const metadata = metadataResult.data;
        setState(prev => ({
          ...prev,
          isOnline: navigator.onLine,
          pendingCount: metadata.pendingCount,
          errorCount: metadata.errorCount,
          lastSync: metadata.lastSync
        }));
      }

      if (queueResult.success && queueResult.data) {
        const pendingItems = queueResult.data.filter(item => 
          item.attempts < item.maxAttempts
        );
        setState(prev => ({
          ...prev,
          pendingCount: pendingItems.length
        }));
      }
    } catch (error) {
      console.error('Failed to refresh offline storage state:', error);
    }
  }, []);

  // Gestion des prix offline
  const saveOfflinePrice = useCallback(async (
    priceData: Omit<OfflinePriceData, 'id' | 'createdAt' | 'retryCount'>
  ): Promise<StorageResult<OfflinePriceData>> => {
    try {
      const result = await offlineStorage.saveOfflinePrice(priceData);
      
      if (result.success) {
        await refreshState();
        // Log de l'événement
        await offlineStorage.logEvent({
          type: 'sync_started',
          details: { action: 'save_offline_price', priceId: result.data?.id }
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
  }, [refreshState]);

  const getOfflinePrices = useCallback(async (options?: QueryOptions): Promise<StorageResult<OfflinePriceData[]>> => {
    try {
      return await offlineStorage.getOfflinePrices(options);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }, []);

  const getOfflinePricesByStatus = useCallback(async (status: SyncStatus): Promise<StorageResult<OfflinePriceData[]>> => {
    try {
      return await offlineStorage.getOfflinePricesByStatus(status);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }, []);

  const updatePriceStatus = useCallback(async (
    id: string, 
    status: SyncStatus, 
    error?: string
  ): Promise<StorageResult<boolean>> => {
    try {
      const result = await offlineStorage.updatePriceStatus(id, status, error);
      
      if (result.success) {
        await refreshState();
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }, [refreshState]);

  const deleteOfflinePrice = useCallback(async (id: string): Promise<StorageResult<boolean>> => {
    try {
      const result = await offlineStorage.deleteOfflinePrice(id);
      
      if (result.success) {
        await refreshState();
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }, [refreshState]);

  // Gestion de la queue de synchronisation
  const addToSyncQueue = useCallback(async (
    item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'attempts' | 'nextRetry'>
  ): Promise<StorageResult<SyncQueueItem>> => {
    try {
      const result = await offlineStorage.addToSyncQueue(item);
      
      if (result.success) {
        await refreshState();
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }, [refreshState]);

  const getSyncQueue = useCallback(async (options?: QueryOptions): Promise<StorageResult<SyncQueueItem[]>> => {
    try {
      return await offlineStorage.getSyncQueue(options);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }, []);

  const getReadyForSync = useCallback(async (): Promise<StorageResult<SyncQueueItem[]>> => {
    try {
      return await offlineStorage.getReadyForSync();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }, []);

  const updateSyncQueueItem = useCallback(async (
    id: string, 
    updates: Partial<SyncQueueItem>
  ): Promise<StorageResult<boolean>> => {
    try {
      const result = await offlineStorage.updateSyncQueueItem(id, updates);
      
      if (result.success) {
        await refreshState();
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }, [refreshState]);

  const removeFromSyncQueue = useCallback(async (id: string): Promise<StorageResult<boolean>> => {
    try {
      const result = await offlineStorage.removeFromSyncQueue(id);
      
      if (result.success) {
        await refreshState();
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }, [refreshState]);

  // Gestion des métadonnées
  const updateSyncMetadata = useCallback(async (
    metadata: Partial<SyncMetadata>
  ): Promise<StorageResult<boolean>> => {
    try {
      const result = await offlineStorage.updateSyncMetadata(metadata);
      
      if (result.success) {
        await refreshState();
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }, [refreshState]);

  const getSyncMetadata = useCallback(async (): Promise<StorageResult<SyncMetadata>> => {
    try {
      return await offlineStorage.getSyncMetadata();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }, []);

  // Utilitaires
  const cleanup = useCallback(async (): Promise<StorageResult<boolean>> => {
    try {
      const result = await offlineStorage.cleanup();
      
      if (result.success) {
        await refreshState();
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }, [refreshState]);

  // Effets
  useEffect(() => {
    // Initialisation automatique
    if (!state.isInitialized && !isInitializingRef.current) {
      initialize();
    }

    // Gestion des événements de connectivité
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      refreshState();
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [initialize, refreshState, state.isInitialized]);

  // Actualisation périodique de l'état
  useEffect(() => {
    if (!state.isInitialized) return;

    const interval = setInterval(() => {
      refreshState();
    }, 30000); // Toutes les 30 secondes

    return () => clearInterval(interval);
  }, [state.isInitialized, refreshState]);

  // Actions exposées
  const actions: OfflineStorageActions = {
    saveOfflinePrice,
    getOfflinePrices,
    getOfflinePricesByStatus,
    updatePriceStatus,
    deleteOfflinePrice,
    addToSyncQueue,
    getSyncQueue,
    getReadyForSync,
    updateSyncQueueItem,
    removeFromSyncQueue,
    updateSyncMetadata,
    getSyncMetadata,
    refreshState,
    cleanup,
    initialize
  };

  return {
    ...state,
    ...actions
  };
};

// Hook spécialisé pour les prix offline
export const useOfflinePrices = () => {
  const {
    saveOfflinePrice,
    getOfflinePrices,
    getOfflinePricesByStatus,
    updatePriceStatus,
    deleteOfflinePrice,
    pendingCount,
    errorCount,
    isOnline
  } = useOfflineStorage();

  return {
    saveOfflinePrice,
    getOfflinePrices,
    getOfflinePricesByStatus,
    updatePriceStatus,
    deleteOfflinePrice,
    pendingCount,
    errorCount,
    isOnline
  };
};

// Hook spécialisé pour la queue de synchronisation
export const useSyncQueue = () => {
  const {
    addToSyncQueue,
    getSyncQueue,
    getReadyForSync,
    updateSyncQueueItem,
    removeFromSyncQueue,
    pendingCount,
    isOnline
  } = useOfflineStorage();

  return {
    addToSyncQueue,
    getSyncQueue,
    getReadyForSync,
    updateSyncQueueItem,
    removeFromSyncQueue,
    pendingCount,
    isOnline
  };
};

// Hook pour les métadonnées de synchronisation
export const useSyncMetadata = () => {
  const {
    updateSyncMetadata,
    getSyncMetadata,
    lastSync,
    pendingCount,
    errorCount,
    isOnline
  } = useOfflineStorage();

  return {
    updateSyncMetadata,
    getSyncMetadata,
    lastSync,
    pendingCount,
    errorCount,
    isOnline
  };
};
