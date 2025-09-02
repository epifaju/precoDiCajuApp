// Hook pour les mutations offline avec synchronisation automatique
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import { useOfflineStorage } from './useOfflineStorage';
import { syncQueue, SyncPriority } from '../services/syncQueue';
import { syncManager } from '../services/syncManager';
import {
  SyncAction,
  SyncEntity,
  SyncStatus,
  StorageResult
} from '../types/offline';

// Interface pour les options de mutation offline
interface OfflineMutationOptions<TData, TVariables> {
  // Options React Query
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables) => void;
  
  // Options offline
  offlineEnabled?: boolean;
  priority?: SyncPriority;
  retryPolicy?: 'exponential' | 'linear' | 'fixed';
  maxRetries?: number;
  optimisticUpdate?: boolean;
  fallbackToOffline?: boolean;
  
  // Callbacks offline
  onOfflineSuccess?: (data: TData, variables: TVariables) => void;
  onOfflineError?: (error: Error, variables: TVariables) => void;
  onSyncComplete?: (data: TData, variables: TVariables) => void;
}

// Interface pour la configuration de la mutation
interface MutationConfig<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  entityType: SyncEntity;
  action: SyncAction;
  getEntityId: (variables: TVariables) => string;
  options?: OfflineMutationOptions<TData, TVariables>;
}

// Hook principal pour les mutations offline
export const useOfflineMutation = <TData = any, TVariables = any>(
  config: MutationConfig<TData, TVariables>
) => {
  const {
    mutationFn,
    entityType,
    action,
    getEntityId,
    options = {}
  } = config;

  const queryClient = useQueryClient();
  const { isOnline, saveOfflinePrice, updatePriceStatus } = useOfflineStorage();
  const isOfflineRef = useRef(false);

  // Mutation React Query standard
  const standardMutation = useMutation({
    mutationFn,
    onSuccess: options.onSuccess,
    onError: options.onError,
    onSettled: options.onSettled
  });

  // Mutation offline
  const offlineMutation = useMutation({
    mutationFn: async (variables: TVariables) => {
      // Sauvegarder en local
      const result = await handleOfflineMutation(variables);
      return result;
    },
    onSuccess: options.onOfflineSuccess || options.onSuccess,
    onError: options.onOfflineError || options.onError,
    onSettled: options.onSettled
  });

  // Gérer la mutation offline
  const handleOfflineMutation = useCallback(async (variables: TVariables): Promise<TData> => {
    const entityId = getEntityId(variables);
    
    try {
      // Ajouter à la queue de synchronisation
      const queueResult = await syncQueue.queuePriceAction(
        action,
        variables,
        {
          priority: options.priority || SyncPriority.HIGH,
          maxRetries: options.maxRetries || 3,
          retryPolicy: options.retryPolicy || 'exponential'
        }
      );

      if (!queueResult.success) {
        throw new Error(queueResult.error || 'Erreur lors de l\'ajout à la queue');
      }

      // Si c'est une création de prix, sauvegarder en local
      if (entityType === SyncEntity.PRICE && action === SyncAction.CREATE) {
        const offlineResult = await saveOfflinePrice({
          data: variables as any,
          status: SyncStatus.PENDING,
          retryCount: 0
        });

        if (!offlineResult.success) {
          throw new Error(offlineResult.error || 'Erreur lors de la sauvegarde offline');
        }

        // Retourner les données avec l'ID généré
        return {
          ...variables,
          id: offlineResult.data?.id,
          _offline: true,
          _syncStatus: SyncStatus.PENDING
        } as TData;
      }

      // Pour les autres types d'entités, retourner les données avec un flag offline
      return {
        ...variables,
        _offline: true,
        _syncStatus: SyncStatus.PENDING
      } as TData;

    } catch (error) {
      throw error instanceof Error ? error : new Error('Erreur inconnue');
    }
  }, [entityType, action, getEntityId, options, saveOfflinePrice]);

  // Mutation principale qui choisit entre online et offline
  const mutate = useCallback(async (variables: TVariables) => {
    isOfflineRef.current = !isOnline;

    if (isOnline && !options.offlineEnabled) {
      // Mode online - utiliser la mutation standard
      return standardMutation.mutateAsync(variables);
    } else if (isOnline && options.fallbackToOffline) {
      // Mode online avec fallback offline
      try {
        return await standardMutation.mutateAsync(variables);
      } catch (error) {
        console.warn('Mutation online échouée, basculement vers offline:', error);
        return offlineMutation.mutateAsync(variables);
      }
    } else {
      // Mode offline ou offline forcé
      return offlineMutation.mutateAsync(variables);
    }
  }, [isOnline, options, standardMutation, offlineMutation]);

  // Mutation avec optimistic update
  const mutateOptimistic = useCallback(async (variables: TVariables) => {
    if (!options.optimisticUpdate) {
      return mutate(variables);
    }

    // Optimistic update
    const optimisticData = {
      ...variables,
      _optimistic: true,
      _timestamp: new Date().toISOString()
    };

    // Mettre à jour le cache React Query
    queryClient.setQueryData(['prices'], (oldData: any) => {
      if (!oldData) return oldData;
      
      if (Array.isArray(oldData)) {
        return [...oldData, optimisticData];
      }
      
      return oldData;
    });

    try {
      const result = await mutate(variables);
      
      // Remplacer les données optimistes par les vraies données
      queryClient.setQueryData(['prices'], (oldData: any) => {
        if (!oldData) return oldData;
        
        if (Array.isArray(oldData)) {
          return oldData.map((item: any) => 
            item._optimistic && item._timestamp === optimisticData._timestamp
              ? result
              : item
          );
        }
        
        return oldData;
      });

      return result;
    } catch (error) {
      // Revenir aux données précédentes en cas d'erreur
      queryClient.invalidateQueries({ queryKey: ['prices'] });
      throw error;
    }
  }, [mutate, options.optimisticUpdate, queryClient]);

  // Synchroniser manuellement
  const sync = useCallback(async () => {
    if (!isOnline) {
      throw new Error('Pas de connexion internet');
    }

    try {
      const result = await syncManager.sync();
      
      if (result.success) {
        // Invalider les queries pour rafraîchir les données
        queryClient.invalidateQueries({ queryKey: ['prices'] });
        queryClient.invalidateQueries({ queryKey: ['prices', 'stats'] });
        
        // Appeler le callback de synchronisation
        options.onSyncComplete?.(result as any, {} as TVariables);
      }
      
      return result;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Erreur de synchronisation');
    }
  }, [isOnline, queryClient, options]);

  // Obtenir le statut de synchronisation
  const getSyncStatus = useCallback(async () => {
    return await syncManager.getSyncStatus();
  }, []);

  // Nettoyer la queue
  const cleanupQueue = useCallback(async () => {
    return await syncQueue.cleanupQueue();
  }, []);

  // Obtenir les statistiques de la queue
  const getQueueStats = useCallback(async () => {
    return await syncQueue.getQueueStats();
  }, []);

  // Déterminer quelle mutation utiliser
  const activeMutation = isOnline && !options.offlineEnabled 
    ? standardMutation 
    : offlineMutation;

  return {
    // État de la mutation
    mutate: mutateOptimistic,
    mutateAsync: mutate,
    isLoading: activeMutation.isLoading,
    isError: activeMutation.isError,
    isSuccess: activeMutation.isSuccess,
    error: activeMutation.error,
    data: activeMutation.data,
    reset: activeMutation.reset,

    // Fonctionnalités offline
    sync,
    getSyncStatus,
    cleanupQueue,
    getQueueStats,
    
    // État de la connectivité
    isOnline,
    isOffline: !isOnline,
    
    // Configuration
    entityType,
    action,
    options
  };
};

// Hook spécialisé pour les prix
export const useOfflinePriceMutation = () => {
  return useOfflineMutation({
    mutationFn: async (priceData: any) => {
      const response = await fetch('/api/v1/prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(priceData)
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      return response.json();
    },
    entityType: SyncEntity.PRICE,
    action: SyncAction.CREATE,
    getEntityId: (variables) => variables.id || `temp-${Date.now()}`,
    options: {
      offlineEnabled: true,
      priority: SyncPriority.HIGH,
      optimisticUpdate: true,
      fallbackToOffline: true,
      maxRetries: 3
    }
  });
};

// Hook spécialisé pour la mise à jour des prix
export const useOfflinePriceUpdateMutation = () => {
  return useOfflineMutation({
    mutationFn: async ({ id, ...priceData }: any) => {
      const response = await fetch(`/api/v1/prices/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(priceData)
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      return response.json();
    },
    entityType: SyncEntity.PRICE,
    action: SyncAction.UPDATE,
    getEntityId: (variables) => variables.id,
    options: {
      offlineEnabled: true,
      priority: SyncPriority.NORMAL,
      optimisticUpdate: true,
      fallbackToOffline: true,
      maxRetries: 3
    }
  });
};

// Hook spécialisé pour la suppression des prix
export const useOfflinePriceDeleteMutation = () => {
  return useOfflineMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/v1/prices/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok && response.status !== 404) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      return { id, deleted: true };
    },
    entityType: SyncEntity.PRICE,
    action: SyncAction.DELETE,
    getEntityId: (variables) => variables,
    options: {
      offlineEnabled: true,
      priority: SyncPriority.CRITICAL,
      optimisticUpdate: true,
      fallbackToOffline: true,
      maxRetries: 5
    }
  });
};

// Hook pour la gestion globale de la synchronisation
export const useOfflineSync = () => {
  const { isOnline } = useOfflineStorage();

  const startAutoSync = useCallback((intervalMs: number = 60000) => {
    syncManager.startAutoSync(intervalMs);
  }, []);

  const stopAutoSync = useCallback(() => {
    syncManager.stopAutoSync();
  }, []);

  const sync = useCallback(async () => {
    if (!isOnline) {
      throw new Error('Pas de connexion internet');
    }
    return await syncManager.sync();
  }, [isOnline]);

  const getSyncStatus = useCallback(async () => {
    return await syncManager.getSyncStatus();
  }, []);

  const setCallbacks = useCallback((callbacks: any) => {
    syncManager.setCallbacks(callbacks);
  }, []);

  return {
    isOnline,
    startAutoSync,
    stopAutoSync,
    sync,
    getSyncStatus,
    setCallbacks
  };
};
