// Service avancé de gestion de la queue de synchronisation
import { offlineStorage } from './offlineStorage';
import {
  SyncQueueItem,
  SyncAction,
  SyncEntity,
  StorageResult,
  SyncStatus
} from '../types/offline';

// Interface pour les priorités de synchronisation
export enum SyncPriority {
  CRITICAL = 1,    // Actions critiques (suppressions, mises à jour importantes)
  HIGH = 2,        // Actions importantes (créations de prix)
  NORMAL = 3,      // Actions normales (mises à jour mineures)
  LOW = 4          // Actions de faible priorité (synchronisation de données de référence)
}

// Interface pour les options de queue
export interface QueueOptions {
  priority?: SyncPriority;
  delay?: number; // Délai en millisecondes avant traitement
  retryPolicy?: 'exponential' | 'linear' | 'fixed';
  maxRetries?: number;
  entityTypes?: SyncEntity[];
}

// Interface pour les statistiques de queue
export interface QueueStats {
  totalItems: number;
  pendingItems: number;
  failedItems: number;
  completedItems: number;
  averageWaitTime: number;
  oldestItem?: SyncQueueItem;
  newestItem?: SyncQueueItem;
}

// Classe de gestion avancée de la queue de synchronisation
export class SyncQueueService {
  private processingQueue = false;
  private processingInterval: NodeJS.Timeout | null = null;

  // === AJOUT D'ÉLÉMENTS À LA QUEUE ===

  // Ajouter un prix à la queue de synchronisation
  async queuePriceAction(
    action: SyncAction,
    priceData: any,
    options: QueueOptions = {}
  ): Promise<StorageResult<SyncQueueItem>> {
    const priority = this.calculatePriority(action, options.priority);
    
    const queueItem: Omit<SyncQueueItem, 'id' | 'createdAt' | 'attempts' | 'nextRetry'> = {
      action,
      entity: SyncEntity.PRICE,
      entityId: priceData.id || this.generateTempId(),
      data: priceData,
      priority,
      maxAttempts: options.maxRetries || 3
    };

    const result = await offlineStorage.addToSyncQueue(queueItem);
    
    if (result.success && options.delay) {
      // Programmer le traitement avec délai
      setTimeout(() => {
        this.processQueue();
      }, options.delay);
    }

    return result;
  }

  // Ajouter une action de données de référence
  async queueReferenceAction(
    action: SyncAction,
    entity: SyncEntity,
    data: any,
    options: QueueOptions = {}
  ): Promise<StorageResult<SyncQueueItem>> {
    const priority = options.priority || SyncPriority.LOW;
    
    const queueItem: Omit<SyncQueueItem, 'id' | 'createdAt' | 'attempts' | 'nextRetry'> = {
      action,
      entity,
      entityId: data.id || this.generateTempId(),
      data,
      priority,
      maxAttempts: options.maxRetries || 2
    };

    return await offlineStorage.addToSyncQueue(queueItem);
  }

  // Ajouter une action personnalisée
  async queueCustomAction(
    action: SyncAction,
    entity: SyncEntity,
    entityId: string,
    data: any,
    options: QueueOptions = {}
  ): Promise<StorageResult<SyncQueueItem>> {
    const priority = options.priority || SyncPriority.NORMAL;
    
    const queueItem: Omit<SyncQueueItem, 'id' | 'createdAt' | 'attempts' | 'nextRetry'> = {
      action,
      entity,
      entityId,
      data,
      priority,
      maxAttempts: options.maxRetries || 3
    };

    return await offlineStorage.addToSyncQueue(queueItem);
  }

  // === GESTION DE LA QUEUE ===

  // Démarrer le traitement automatique de la queue
  startProcessing(intervalMs: number = 30000): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }

    this.processingInterval = setInterval(() => {
      if (navigator.onLine && !this.processingQueue) {
        this.processQueue();
      }
    }, intervalMs);
  }

  // Arrêter le traitement automatique
  stopProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  // Traiter la queue manuellement
  async processQueue(): Promise<{
    processed: number;
    successful: number;
    failed: number;
    errors: string[];
  }> {
    if (this.processingQueue) {
      return { processed: 0, successful: 0, failed: 0, errors: ['Queue déjà en cours de traitement'] };
    }

    this.processingQueue = true;
    let processed = 0;
    let successful = 0;
    let failed = 0;
    const errors: string[] = [];

    try {
      // Récupérer les éléments prêts pour traitement
      const readyItems = await this.getReadyItems();
      
      for (const item of readyItems) {
        try {
          const result = await this.processItem(item);
          processed++;
          
          if (result.success) {
            successful++;
            // Supprimer l'élément de la queue
            await offlineStorage.removeFromSyncQueue(item.id);
          } else {
            failed++;
            errors.push(result.error || 'Erreur inconnue');
            // Mettre à jour les tentatives
            await this.updateItemAttempts(item, result.error);
          }
        } catch (error) {
          processed++;
          failed++;
          const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
          errors.push(errorMessage);
          await this.updateItemAttempts(item, errorMessage);
        }
      }
    } finally {
      this.processingQueue = false;
    }

    return { processed, successful, failed, errors };
  }

  // === TRAITEMENT DES ÉLÉMENTS ===

  // Récupérer les éléments prêts pour traitement
  private async getReadyItems(): Promise<SyncQueueItem[]> {
    const result = await offlineStorage.getReadyForSync();
    
    if (!result.success || !result.data) {
      return [];
    }

    // Trier par priorité et date de création
    return result.data.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority; // Priorité croissante (1 = plus haute)
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }

  // Traiter un élément individuel
  private async processItem(item: SyncQueueItem): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      switch (item.action) {
        case SyncAction.CREATE:
          return await this.processCreate(item);
        case SyncAction.UPDATE:
          return await this.processUpdate(item);
        case SyncAction.DELETE:
          return await this.processDelete(item);
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

  // Traiter une création
  private async processCreate(item: SyncQueueItem): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const response = await fetch('/api/v1/prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(item.data)
      });

      if (response.ok) {
        const result = await response.json();
        
        // Mettre à jour le prix offline avec l'ID du serveur
        if (item.entity === SyncEntity.PRICE) {
          await offlineStorage.updatePriceStatus(item.entityId, SyncStatus.SYNCED);
        }

        return { success: true };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return { 
          success: false, 
          error: errorData.message || `Erreur HTTP ${response.status}` 
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur réseau'
      };
    }
  }

  // Traiter une mise à jour
  private async processUpdate(item: SyncQueueItem): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const response = await fetch(`/api/v1/prices/${item.entityId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(item.data)
      });

      if (response.ok) {
        return { success: true };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return { 
          success: false, 
          error: errorData.message || `Erreur HTTP ${response.status}` 
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur réseau'
      };
    }
  }

  // Traiter une suppression
  private async processDelete(item: SyncQueueItem): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const response = await fetch(`/api/v1/prices/${item.entityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
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
    const nextRetry = this.calculateNextRetry(newAttempts, item.maxAttempts);

    await offlineStorage.updateSyncQueueItem(item.id, {
      attempts: newAttempts,
      nextRetry,
      lastAttempt: new Date().toISOString(),
      lastError: error
    });
  }

  // Calculer le prochain délai de retry
  private calculateNextRetry(attempts: number, maxAttempts: number): string {
    if (attempts >= maxAttempts) {
      // Délai très long pour les éléments qui ont échoué définitivement
      return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 heures
    }

    // Backoff exponentiel avec jitter
    const baseDelay = 1000; // 1 seconde
    const maxDelay = 300000; // 5 minutes
    
    const delay = Math.min(
      baseDelay * Math.pow(2, attempts - 1),
      maxDelay
    );
    
    const jitter = Math.random() * 0.1 * delay; // 10% de jitter
    const finalDelay = delay + jitter;
    
    return new Date(Date.now() + finalDelay).toISOString();
  }

  // === STATISTIQUES ET MONITORING ===

  // Obtenir les statistiques de la queue
  async getQueueStats(): Promise<QueueStats> {
    const result = await offlineStorage.getSyncQueue();
    
    if (!result.success || !result.data) {
      return {
        totalItems: 0,
        pendingItems: 0,
        failedItems: 0,
        completedItems: 0,
        averageWaitTime: 0
      };
    }

    const items = result.data;
    const now = Date.now();
    
    const pendingItems = items.filter(item => item.attempts < item.maxAttempts);
    const failedItems = items.filter(item => item.attempts >= item.maxAttempts);
    
    const averageWaitTime = items.length > 0 
      ? items.reduce((sum, item) => sum + (now - new Date(item.createdAt).getTime()), 0) / items.length
      : 0;

    const sortedByDate = items.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return {
      totalItems: items.length,
      pendingItems: pendingItems.length,
      failedItems: failedItems.length,
      completedItems: 0, // Les éléments complétés sont supprimés de la queue
      averageWaitTime,
      oldestItem: sortedByDate[0],
      newestItem: sortedByDate[sortedByDate.length - 1]
    };
  }

  // Obtenir les éléments par statut
  async getItemsByStatus(status: 'pending' | 'failed' | 'all'): Promise<SyncQueueItem[]> {
    const result = await offlineStorage.getSyncQueue();
    
    if (!result.success || !result.data) {
      return [];
    }

    switch (status) {
      case 'pending':
        return result.data.filter(item => item.attempts < item.maxAttempts);
      case 'failed':
        return result.data.filter(item => item.attempts >= item.maxAttempts);
      default:
        return result.data;
    }
  }

  // === GESTION DES PRIORITÉS ===

  // Calculer la priorité basée sur l'action et les options
  private calculatePriority(action: SyncAction, customPriority?: SyncPriority): number {
    if (customPriority) {
      return customPriority;
    }

    switch (action) {
      case SyncAction.DELETE:
        return SyncPriority.CRITICAL;
      case SyncAction.CREATE:
        return SyncPriority.HIGH;
      case SyncAction.UPDATE:
        return SyncPriority.NORMAL;
      default:
        return SyncPriority.NORMAL;
    }
  }

  // Réorganiser la queue par priorité
  async reprioritizeQueue(): Promise<StorageResult<boolean>> {
    try {
      const result = await offlineStorage.getSyncQueue();
      
      if (!result.success || !result.data) {
        return { success: true, data: true, timestamp: new Date().toISOString() };
      }

      // Trier par priorité et date
      const sortedItems = result.data.sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });

      // Mettre à jour les éléments dans l'ordre de priorité
      for (let i = 0; i < sortedItems.length; i++) {
        const item = sortedItems[i];
        // Ici on pourrait ajouter un champ d'ordre si nécessaire
        // Pour l'instant, on se contente du tri par priorité et date
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

  // === NETTOYAGE ET MAINTENANCE ===

  // Nettoyer les anciens éléments
  async cleanupQueue(maxAgeDays: number = 7): Promise<StorageResult<boolean>> {
    try {
      const result = await offlineStorage.getSyncQueue();
      
      if (!result.success || !result.data) {
        return { success: true, data: true, timestamp: new Date().toISOString() };
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);
      
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

  // Vider complètement la queue
  async clearQueue(): Promise<StorageResult<boolean>> {
    try {
      const result = await offlineStorage.getSyncQueue();
      
      if (!result.success || !result.data) {
        return { success: true, data: true, timestamp: new Date().toISOString() };
      }

      for (const item of result.data) {
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

  // === UTILITAIRES ===

  // Générer un ID temporaire
  private generateTempId(): string {
    return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Récupérer le token d'authentification
  private getAuthToken(): string {
    return localStorage.getItem('auth_token') || '';
  }

  // Vérifier si la queue est en cours de traitement
  isProcessing(): boolean {
    return this.processingQueue;
  }

  // Obtenir le statut de la queue
  async getQueueStatus(): Promise<{
    isProcessing: boolean;
    totalItems: number;
    pendingItems: number;
    failedItems: number;
    nextProcessing?: string;
  }> {
    const stats = await this.getQueueStats();
    
    return {
      isProcessing: this.processingQueue,
      totalItems: stats.totalItems,
      pendingItems: stats.pendingItems,
      failedItems: stats.failedItems,
      nextProcessing: this.processingInterval ? 'Active' : undefined
    };
  }
}

// Instance singleton
export const syncQueue = new SyncQueueService();
