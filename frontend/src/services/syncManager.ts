// Gestionnaire principal de synchronisation offline
import { offlineStorage } from './offlineStorage';
import {
  SyncQueueItem,
  SyncMetadata,
  SyncStatus,
  SyncAction,
  SyncEntity,
  StorageResult,
  SyncCallbacks,
  OfflineConfig,
  DEFAULT_OFFLINE_CONFIG
} from '../types/offline';

// Interface pour les résultats de synchronisation
interface SyncResult {
  success: boolean;
  syncedCount: number;
  errorCount: number;
  conflicts: number;
  errors: string[];
  duration: number;
}

// Interface pour les options de synchronisation
interface SyncOptions {
  batchSize?: number;
  retryFailed?: boolean;
  forceSync?: boolean;
  entityTypes?: SyncEntity[];
  priority?: number;
}

// Classe principale de gestion de la synchronisation
export class SyncManager {
  private config: OfflineConfig;
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private callbacks: SyncCallbacks = {};
  private abortController: AbortController | null = null;

  constructor(config: Partial<OfflineConfig> = {}) {
    this.config = { ...DEFAULT_OFFLINE_CONFIG, ...config };
  }

  // === GESTION DE LA SYNCHRONISATION ===

  // Démarrer la synchronisation automatique
  startAutoSync(intervalMs: number = 60000): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      if (navigator.onLine && !this.isSyncing) {
        await this.sync();
      }
    }, intervalMs);
  }

  // Arrêter la synchronisation automatique
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Synchronisation manuelle
  async sync(options: SyncOptions = {}): Promise<SyncResult> {
    if (this.isSyncing) {
      throw new Error('Synchronisation déjà en cours');
    }

    if (!navigator.onLine) {
      throw new Error('Pas de connexion internet');
    }

    this.isSyncing = true;
    this.abortController = new AbortController();
    const startTime = Date.now();

    try {
      this.callbacks.onSyncStart?.();

      // Récupérer les éléments prêts pour la synchronisation
      const readyItems = await this.getReadyItems(options);
      
      if (readyItems.length === 0) {
        return {
          success: true,
          syncedCount: 0,
          errorCount: 0,
          conflicts: 0,
          errors: [],
          duration: Date.now() - startTime
        };
      }

      // Synchroniser par batch
      const batchSize = options.batchSize || this.config.syncBatchSize;
      const batches = this.chunkArray(readyItems, batchSize);
      
      let syncedCount = 0;
      let errorCount = 0;
      let conflicts = 0;
      const errors: string[] = [];

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const progress = ((i + 1) / batches.length) * 100;
        
        this.callbacks.onSyncProgress?.(progress);

        const batchResult = await this.syncBatch(batch);
        
        syncedCount += batchResult.syncedCount;
        errorCount += batchResult.errorCount;
        conflicts += batchResult.conflicts;
        errors.push(...batchResult.errors);

        // Vérifier si la synchronisation a été annulée
        if (this.abortController?.signal.aborted) {
          break;
        }

        // Délai entre les batches pour éviter de surcharger le serveur
        if (i < batches.length - 1) {
          await this.delay(1000);
        }
      }

      // Mettre à jour les métadonnées
      await this.updateSyncMetadata({
        lastSync: new Date().toISOString(),
        pendingCount: Math.max(0, await this.getPendingCount() - syncedCount),
        successfulSyncs: (await this.getSuccessfulSyncs()) + syncedCount,
        isOnline: navigator.onLine
      });

      const result: SyncResult = {
        success: errorCount === 0,
        syncedCount,
        errorCount,
        conflicts,
        errors,
        duration: Date.now() - startTime
      };

      this.callbacks.onSyncComplete?.(await this.getSyncMetadata());
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      this.callbacks.onSyncError?.(errorMessage);
      
      return {
        success: false,
        syncedCount: 0,
        errorCount: 1,
        conflicts: 0,
        errors: [errorMessage],
        duration: Date.now() - startTime
      };
    } finally {
      this.isSyncing = false;
      this.abortController = null;
    }
  }

  // Annuler la synchronisation en cours
  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  // === GESTION DES ÉLÉMENTS DE LA QUEUE ===

  // Récupérer les éléments prêts pour la synchronisation
  private async getReadyItems(options: SyncOptions): Promise<SyncQueueItem[]> {
    const result = await offlineStorage.getReadyForSync();
    
    if (!result.success || !result.data) {
      return [];
    }

    let items = result.data;

    // Filtrer par types d'entités
    if (options.entityTypes && options.entityTypes.length > 0) {
      items = items.filter(item => options.entityTypes!.includes(item.entity));
    }

    // Filtrer par priorité
    if (options.priority !== undefined) {
      items = items.filter(item => item.priority >= options.priority!);
    }

    // Trier par priorité et date de création
    return items.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority; // Priorité décroissante
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }

  // Synchroniser un batch d'éléments
  private async syncBatch(items: SyncQueueItem[]): Promise<{
    syncedCount: number;
    errorCount: number;
    conflicts: number;
    errors: string[];
  }> {
    let syncedCount = 0;
    let errorCount = 0;
    let conflicts = 0;
    const errors: string[] = [];

    for (const item of items) {
      try {
        const result = await this.syncItem(item);
        
        if (result.success) {
          syncedCount++;
          // Supprimer l'élément de la queue
          await offlineStorage.removeFromSyncQueue(item.id);
        } else if (result.conflict) {
          conflicts++;
          // Marquer comme conflit
          await offlineStorage.updateSyncQueueItem(item.id, {
            lastError: 'Conflit détecté',
            lastAttempt: new Date().toISOString()
          });
        } else {
          errorCount++;
          errors.push(result.error || 'Erreur inconnue');
          // Mettre à jour les tentatives
          await this.updateItemAttempts(item);
        }
      } catch (error) {
        errorCount++;
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        errors.push(errorMessage);
        await this.updateItemAttempts(item, errorMessage);
      }
    }

    return { syncedCount, errorCount, conflicts, errors };
  }

  // Synchroniser un élément individuel
  private async syncItem(item: SyncQueueItem): Promise<{
    success: boolean;
    conflict?: boolean;
    error?: string;
  }> {
    try {
      switch (item.action) {
        case SyncAction.CREATE:
          return await this.syncCreate(item);
        case SyncAction.UPDATE:
          return await this.syncUpdate(item);
        case SyncAction.DELETE:
          return await this.syncDelete(item);
        default:
          return { success: false, error: `Action non supportée: ${item.action}` };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  // Synchroniser une création
  private async syncCreate(item: SyncQueueItem): Promise<{
    success: boolean;
    conflict?: boolean;
    error?: string;
  }> {
    try {
      const response = await fetch('/api/v1/prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(item.data),
        signal: this.abortController?.signal
      });

      if (response.ok) {
        const result = await response.json();
        
        // Mettre à jour le prix offline avec l'ID du serveur
        if (item.entity === SyncEntity.PRICE) {
          await offlineStorage.updatePriceStatus(item.entityId, SyncStatus.SYNCED);
        }

        return { success: true };
      } else if (response.status === 409) {
        // Conflit détecté
        return { success: false, conflict: true, error: 'Conflit de données' };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return { 
          success: false, 
          error: errorData.message || `Erreur HTTP ${response.status}` 
        };
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error; // Re-throw pour gérer l'annulation
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur réseau'
      };
    }
  }

  // Synchroniser une mise à jour
  private async syncUpdate(item: SyncQueueItem): Promise<{
    success: boolean;
    conflict?: boolean;
    error?: string;
  }> {
    try {
      const response = await fetch(`/api/v1/prices/${item.entityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(item.data),
        signal: this.abortController?.signal
      });

      if (response.ok) {
        return { success: true };
      } else if (response.status === 409) {
        return { success: false, conflict: true, error: 'Conflit de données' };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return { 
          success: false, 
          error: errorData.message || `Erreur HTTP ${response.status}` 
        };
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur réseau'
      };
    }
  }

  // Synchroniser une suppression
  private async syncDelete(item: SyncQueueItem): Promise<{
    success: boolean;
    conflict?: boolean;
    error?: string;
  }> {
    try {
      const response = await fetch(`/api/v1/prices/${item.entityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        signal: this.abortController?.signal
      });

      if (response.ok || response.status === 404) {
        return { success: true };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return { 
          success: false, 
          error: errorData.message || `Erreur HTTP ${response.status}` 
        };
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur réseau'
      };
    }
  }

  // === GESTION DES TENTATIVES ===

  // Mettre à jour les tentatives d'un élément
  private async updateItemAttempts(item: SyncQueueItem, error?: string): Promise<void> {
    const newAttempts = item.attempts + 1;
    const nextRetry = this.calculateNextRetry(newAttempts);

    await offlineStorage.updateSyncQueueItem(item.id, {
      attempts: newAttempts,
      nextRetry,
      lastAttempt: new Date().toISOString(),
      lastError: error
    });
  }

  // Calculer le prochain délai de retry
  private calculateNextRetry(attempts: number): string {
    const baseDelay = this.config.retryDelayMs;
    const maxDelay = this.config.maxRetryDelayMs;
    
    // Backoff exponentiel avec jitter
    const delay = Math.min(
      baseDelay * Math.pow(2, attempts - 1),
      maxDelay
    );
    
    const jitter = Math.random() * 0.1 * delay; // 10% de jitter
    const finalDelay = delay + jitter;
    
    return new Date(Date.now() + finalDelay).toISOString();
  }

  // === GESTION DES MÉTADONNÉES ===

  // Mettre à jour les métadonnées de synchronisation
  private async updateSyncMetadata(updates: Partial<SyncMetadata>): Promise<void> {
    await offlineStorage.updateSyncMetadata(updates);
  }

  // Récupérer les métadonnées de synchronisation
  private async getSyncMetadata(): Promise<SyncMetadata> {
    const result = await offlineStorage.getSyncMetadata();
    return result.success && result.data ? result.data : {
      lastSync: '',
      pendingCount: 0,
      conflictCount: 0,
      errorCount: 0,
      isOnline: navigator.onLine,
      lastOnlineCheck: new Date().toISOString(),
      totalOfflineActions: 0,
      successfulSyncs: 0
    };
  }

  // Récupérer le nombre d'éléments en attente
  private async getPendingCount(): Promise<number> {
    const result = await offlineStorage.getSyncQueue();
    if (result.success && result.data) {
      return result.data.filter(item => item.attempts < item.maxAttempts).length;
    }
    return 0;
  }

  // Récupérer le nombre de synchronisations réussies
  private async getSuccessfulSyncs(): Promise<number> {
    const metadata = await this.getSyncMetadata();
    return metadata.successfulSyncs;
  }

  // === GESTION DES CALLBACKS ===

  // Définir les callbacks
  setCallbacks(callbacks: SyncCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // === UTILITAIRES ===

  // Diviser un tableau en chunks
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // Délai
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Récupérer le token d'authentification
  private getAuthToken(): string {
    // Récupérer le token depuis le localStorage ou le store d'auth
    return localStorage.getItem('auth_token') || '';
  }

  // === ÉTAT DE LA SYNCHRONISATION ===

  // Vérifier si la synchronisation est en cours
  isSyncInProgress(): boolean {
    return this.isSyncing;
  }

  // Obtenir le statut de la synchronisation
  async getSyncStatus(): Promise<{
    isOnline: boolean;
    isSyncing: boolean;
    pendingCount: number;
    lastSync: string;
    nextAutoSync?: string;
  }> {
    const metadata = await this.getSyncMetadata();
    
    return {
      isOnline: navigator.onLine,
      isSyncing: this.isSyncing,
      pendingCount: metadata.pendingCount,
      lastSync: metadata.lastSync,
      nextAutoSync: this.syncInterval ? 'Active' : undefined
    };
  }

  // Nettoyer les anciens éléments de la queue
  async cleanupQueue(): Promise<StorageResult<boolean>> {
    try {
      const result = await offlineStorage.getSyncQueue();
      
      if (!result.success || !result.data) {
        return { success: true, data: true, timestamp: new Date().toISOString() };
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.maxOfflineStorageDays);
      
      const itemsToRemove = result.data.filter(item => 
        new Date(item.createdAt) < cutoffDate && 
        item.attempts >= item.maxAttempts
      );

      for (const item of itemsToRemove) {
        await offlineStorage.removeFromSyncQueue(item.id);
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
}

// Instance singleton
export const syncManager = new SyncManager();
