import React from 'react';
import { useOfflineMutation } from './useOfflineMutation';
import { useOfflineStorage } from './useOfflineStorage';
import { useServiceWorker } from './useServiceWorker';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import { queryKeys } from '../lib/queryClient';
import type { OfflinePrice, SyncQueueItem, QueueItemPriority } from '../types/offline';

const API_BASE_URL = import.meta.env['VITE_API_URL'] || 'http://localhost:8080';

// Types pour les mutations offline
interface CreatePriceData {
  regionCode: string;
  qualityGrade: string;
  priceFcfa: number;
  recordedDate: string;
  sourceName?: string;
  sourceType: 'market' | 'cooperative' | 'producer' | 'trader' | 'other';
  gpsLat?: number;
  gpsLng?: number;
  notes?: string;
  photoFile?: File;
}

interface UpdatePriceData {
  id: string;
  data: Partial<CreatePriceData>;
}

// Hook pour créer un prix en mode offline
export const useOfflineCreatePrice = () => {
  const { addOfflinePrice, addSyncQueueItem } = useOfflineStorage();
  const { triggerSync } = useServiceWorker();
  const { user } = useAuthStore();
  const { language } = useAppStore();

  return useOfflineMutation({
    mutationFn: async (data: CreatePriceData) => {
      // Créer un prix temporaire pour l'interface
      const tempPrice: OfflinePrice = {
        id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        regionCode: data.regionCode,
        qualityGrade: data.qualityGrade,
        priceFcfa: data.priceFcfa,
        recordedDate: data.recordedDate,
        sourceName: data.sourceName || '',
        sourceType: data.sourceType,
        gpsLat: data.gpsLat,
        gpsLng: data.gpsLng,
        notes: data.notes || '',
        photoFile: data.photoFile,
        status: 'pending',
        createdAt: new Date().toISOString(),
        createdBy: user?.id || 'anonymous',
        language,
      };

      // Sauvegarder en local
      await addOfflinePrice(tempPrice);

      // Ajouter à la queue de synchronisation
      const queueItem: SyncQueueItem = {
        id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        action: 'CREATE_PRICE',
        data: {
          ...data,
          tempId: tempPrice.id,
        },
        priority: 'HIGH' as QueueItemPriority,
        attempts: 0,
        maxAttempts: 3,
        status: 'pending',
        createdAt: new Date().toISOString(),
        lastAttemptAt: null,
        nextRetryAt: null,
        metadata: {
          userId: user?.id || 'anonymous',
          language,
          source: 'offline_form',
        },
      };

      await addSyncQueueItem(queueItem);

      // Déclencher la synchronisation si en ligne
      if (navigator.onLine) {
        triggerSync();
      }

      return tempPrice;
    },
    options: {
      onSuccess: (data) => {
        console.log('Prix créé en mode offline:', data);
      },
      onError: (error) => {
        console.error('Erreur lors de la création du prix offline:', error);
      },
    },
  });
};

// Hook pour mettre à jour un prix en mode offline
export const useOfflineUpdatePrice = () => {
  const { updateOfflinePriceStatus, addSyncQueueItem } = useOfflineStorage();
  const { triggerSync } = useServiceWorker();
  const { user } = useAuthStore();
  const { language } = useAppStore();

  return useOfflineMutation({
    mutationFn: async ({ id, data }: UpdatePriceData) => {
      // Ajouter à la queue de synchronisation
      const queueItem: SyncQueueItem = {
        id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        action: 'UPDATE_PRICE',
        data: {
          id,
          ...data,
        },
        priority: 'HIGH' as QueueItemPriority,
        attempts: 0,
        maxAttempts: 3,
        status: 'pending',
        createdAt: new Date().toISOString(),
        lastAttemptAt: null,
        nextRetryAt: null,
        metadata: {
          userId: user?.id || 'anonymous',
          language,
          source: 'offline_form',
        },
      };

      await addSyncQueueItem(queueItem);

      // Déclencher la synchronisation si en ligne
      if (navigator.onLine) {
        triggerSync();
      }

      return { id, data };
    },
    options: {
      onSuccess: (data) => {
        console.log('Prix mis à jour en mode offline:', data);
      },
      onError: (error) => {
        console.error('Erreur lors de la mise à jour du prix offline:', error);
      },
    },
  });
};

// Hook pour supprimer un prix en mode offline
export const useOfflineDeletePrice = () => {
  const { addSyncQueueItem } = useOfflineStorage();
  const { triggerSync } = useServiceWorker();
  const { user } = useAuthStore();
  const { language } = useAppStore();

  return useOfflineMutation({
    mutationFn: async (id: string) => {
      // Ajouter à la queue de synchronisation
      const queueItem: SyncQueueItem = {
        id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        action: 'DELETE_PRICE',
        data: { id },
        priority: 'HIGH' as QueueItemPriority,
        attempts: 0,
        maxAttempts: 3,
        status: 'pending',
        createdAt: new Date().toISOString(),
        lastAttemptAt: null,
        nextRetryAt: null,
        metadata: {
          userId: user?.id || 'anonymous',
          language,
          source: 'offline_form',
        },
      };

      await addSyncQueueItem(queueItem);

      // Déclencher la synchronisation si en ligne
      if (navigator.onLine) {
        triggerSync();
      }

      return id;
    },
    options: {
      onSuccess: (id) => {
        console.log('Prix supprimé en mode offline:', id);
      },
      onError: (error) => {
        console.error('Erreur lors de la suppression du prix offline:', error);
      },
    },
  });
};

// Hook pour vérifier un prix en mode offline
export const useOfflineVerifyPrice = () => {
  const { addSyncQueueItem } = useOfflineStorage();
  const { triggerSync } = useServiceWorker();
  const { user } = useAuthStore();
  const { language } = useAppStore();

  return useOfflineMutation({
    mutationFn: async (id: string) => {
      // Ajouter à la queue de synchronisation
      const queueItem: SyncQueueItem = {
        id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        action: 'VERIFY_PRICE',
        data: { id },
        priority: 'NORMAL' as QueueItemPriority,
        attempts: 0,
        maxAttempts: 3,
        status: 'pending',
        createdAt: new Date().toISOString(),
        lastAttemptAt: null,
        nextRetryAt: null,
        metadata: {
          userId: user?.id || 'anonymous',
          language,
          source: 'offline_form',
        },
      };

      await addSyncQueueItem(queueItem);

      // Déclencher la synchronisation si en ligne
      if (navigator.onLine) {
        triggerSync();
      }

      return id;
    },
    options: {
      onSuccess: (id) => {
        console.log('Prix vérifié en mode offline:', id);
      },
      onError: (error) => {
        console.error('Erreur lors de la vérification du prix offline:', error);
      },
    },
  });
};

// Hook pour uploader un fichier en mode offline
export const useOfflineFileUpload = () => {
  const { addSyncQueueItem } = useOfflineStorage();
  const { triggerSync } = useServiceWorker();
  const { user } = useAuthStore();
  const { language } = useAppStore();

  return useOfflineMutation({
    mutationFn: async (file: File) => {
      // Convertir le fichier en base64 pour le stockage local
      const base64File = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Ajouter à la queue de synchronisation
      const queueItem: SyncQueueItem = {
        id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        action: 'UPLOAD_FILE',
        data: {
          file: base64File,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        },
        priority: 'NORMAL' as QueueItemPriority,
        attempts: 0,
        maxAttempts: 3,
        status: 'pending',
        createdAt: new Date().toISOString(),
        lastAttemptAt: null,
        nextRetryAt: null,
        metadata: {
          userId: user?.id || 'anonymous',
          language,
          source: 'offline_form',
        },
      };

      await addSyncQueueItem(queueItem);

      // Déclencher la synchronisation si en ligne
      if (navigator.onLine) {
        triggerSync();
      }

      return { fileName: file.name, tempId: queueItem.id };
    },
    options: {
      onSuccess: (data) => {
        console.log('Fichier uploadé en mode offline:', data);
      },
      onError: (error) => {
        console.error('Erreur lors de l\'upload du fichier offline:', error);
      },
    },
  });
};

// Hook pour obtenir les prix offline
export const useOfflinePrices = () => {
  const { getOfflinePrices } = useOfflineStorage();
  const [prices, setPrices] = React.useState<OfflinePrice[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadPrices = async () => {
      try {
        const offlinePrices = await getOfflinePrices();
        setPrices(offlinePrices);
      } catch (error) {
        console.error('Erreur lors du chargement des prix offline:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPrices();
  }, []);

  return { prices, loading };
};

// Hook pour obtenir les éléments de la queue de synchronisation
export const useSyncQueue = () => {
  const { getSyncQueueItems } = useOfflineStorage();
  const [queueItems, setQueueItems] = React.useState<SyncQueueItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadQueueItems = async () => {
      try {
        const items = await getSyncQueueItems();
        setQueueItems(items);
      } catch (error) {
        console.error('Erreur lors du chargement de la queue de synchronisation:', error);
      } finally {
        setLoading(false);
      }
    };

    loadQueueItems();
  }, []);

  return { queueItems, loading };
};
