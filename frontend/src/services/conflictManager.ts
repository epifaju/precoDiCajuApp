import { offlineStorage } from './offlineStorage';
import type { Conflict, OfflinePrice, SyncQueueItem, QueueItemAction } from '../types/offline';

export interface ConflictResolutionStrategy {
  id: string;
  name: string;
  description: string;
  automatic: boolean;
  priority: number;
}

export interface ConflictResolution {
  conflictId: string;
  strategy: ConflictResolutionStrategy;
  resolvedAt: Date;
  resolvedBy: 'system' | 'user';
  resolution: 'local' | 'remote' | 'merge' | 'skip';
  details?: string;
}

export interface ConflictDetectionResult {
  hasConflicts: boolean;
  conflicts: Conflict[];
  resolutionSuggestions: ConflictResolutionStrategy[];
}

class ConflictManager {
  private readonly conflictStrategies: ConflictResolutionStrategy[] = [
    {
      id: 'last_modified',
      name: 'Dernière modification',
      description: 'Utiliser la version la plus récente',
      automatic: true,
      priority: 1
    },
    {
      id: 'user_preference',
      name: 'Préférence utilisateur',
      description: 'Demander à l\'utilisateur de choisir',
      automatic: false,
      priority: 2
    },
    {
      id: 'local_priority',
      name: 'Priorité locale',
      description: 'Toujours utiliser la version locale',
      automatic: true,
      priority: 3
    },
    {
      id: 'remote_priority',
      name: 'Priorité serveur',
      description: 'Toujours utiliser la version serveur',
      automatic: true,
      priority: 4
    },
    {
      id: 'merge_data',
      name: 'Fusion des données',
      description: 'Fusionner les champs non conflictuels',
      automatic: false,
      priority: 5
    }
  ];

  /**
   * Détecte les conflits entre les données locales et distantes
   */
  async detectConflicts(
    localData: OfflinePrice,
    remoteData: any,
    action: QueueItemAction
  ): Promise<ConflictDetectionResult> {
    const conflicts: Conflict[] = [];
    const resolutionSuggestions: ConflictResolutionStrategy[] = [];

    // Vérifier les conflits de base
    if (localData.updatedAt && remoteData.updatedAt) {
      const localTime = new Date(localData.updatedAt).getTime();
      const remoteTime = new Date(remoteData.updatedAt).getTime();
      
      if (Math.abs(localTime - remoteTime) > 1000) { // Plus d'1 seconde de différence
        conflicts.push({
          id: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'data_conflict',
          severity: 'medium',
          description: 'Les données ont été modifiées localement et sur le serveur',
          localData: localData,
          remoteData: remoteData,
          detectedAt: new Date(),
          action: action,
          status: 'pending'
        });
      }
    }

    // Vérifier les conflits de suppression
    if (action === 'delete' && remoteData && !remoteData.deleted) {
      conflicts.push({
        id: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'deletion_conflict',
        severity: 'high',
        description: 'Tentative de suppression d\'un élément modifié sur le serveur',
        localData: localData,
        remoteData: remoteData,
        detectedAt: new Date(),
        action: action,
        status: 'pending'
      });
    }

    // Vérifier les conflits de création
    if (action === 'create' && remoteData && remoteData.id) {
      conflicts.push({
        id: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'creation_conflict',
        severity: 'low',
        description: 'L\'élément existe déjà sur le serveur',
        localData: localData,
        remoteData: remoteData,
        detectedAt: new Date(),
        action: action,
        status: 'pending'
      });
    }

    // Proposer des stratégies de résolution
    if (conflicts.length > 0) {
      resolutionSuggestions.push(...this.getResolutionStrategies(conflicts));
    }

    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
      resolutionSuggestions
    };
  }

  /**
   * Résout automatiquement les conflits selon les stratégies configurées
   */
  async resolveConflictsAutomatically(
    conflicts: Conflict[],
    strategy: ConflictResolutionStrategy
  ): Promise<ConflictResolution[]> {
    const resolutions: ConflictResolution[] = [];

    for (const conflict of conflicts) {
      if (strategy.automatic) {
        const resolution = await this.applyResolutionStrategy(conflict, strategy);
        resolutions.push(resolution);
        
        // Marquer le conflit comme résolu
        await this.markConflictAsResolved(conflict.id, resolution);
      }
    }

    return resolutions;
  }

  /**
   * Applique une stratégie de résolution à un conflit
   */
  private async applyResolutionStrategy(
    conflict: Conflict,
    strategy: ConflictResolutionStrategy
  ): Promise<ConflictResolution> {
    let resolution: 'local' | 'remote' | 'merge' | 'skip' = 'skip';
    let details = '';

    switch (strategy.id) {
      case 'last_modified':
        if (conflict.localData.updatedAt && conflict.remoteData.updatedAt) {
          const localTime = new Date(conflict.localData.updatedAt).getTime();
          const remoteTime = new Date(conflict.remoteData.updatedAt).getTime();
          resolution = localTime > remoteTime ? 'local' : 'remote';
          details = `Utilisation de la version la plus récente (${resolution})`;
        }
        break;

      case 'local_priority':
        resolution = 'local';
        details = 'Priorité donnée à la version locale';
        break;

      case 'remote_priority':
        resolution = 'remote';
        details = 'Priorité donnée à la version serveur';
        break;

      case 'merge_data':
        resolution = 'merge';
        details = 'Fusion des données non conflictuelles';
        break;

      default:
        resolution = 'skip';
        details = 'Résolution manuelle requise';
    }

    return {
      conflictId: conflict.id,
      strategy,
      resolvedAt: new Date(),
      resolvedBy: 'system',
      resolution,
      details
    };
  }

  /**
   * Obtient les stratégies de résolution appropriées pour un type de conflit
   */
  private getResolutionStrategies(conflicts: Conflict[]): ConflictResolutionStrategy[] {
    const strategies: ConflictResolutionStrategy[] = [];

    for (const conflict of conflicts) {
      switch (conflict.type) {
        case 'data_conflict':
          strategies.push(
            this.conflictStrategies.find(s => s.id === 'last_modified')!,
            this.conflictStrategies.find(s => s.id === 'user_preference')!,
            this.conflictStrategies.find(s => s.id === 'merge_data')!
          );
          break;

        case 'deletion_conflict':
          strategies.push(
            this.conflictStrategies.find(s => s.id === 'user_preference')!,
            this.conflictStrategies.find(s => s.id === 'remote_priority')!
          );
          break;

        case 'creation_conflict':
          strategies.push(
            this.conflictStrategies.find(s => s.id === 'local_priority')!,
            this.conflictStrategies.find(s => s.id === 'remote_priority')!
          );
          break;
      }
    }

    // Supprimer les doublons et trier par priorité
    return strategies
      .filter((strategy, index, self) => 
        index === self.findIndex(s => s.id === strategy.id)
      )
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * Marque un conflit comme résolu
   */
  private async markConflictAsResolved(
    conflictId: string,
    resolution: ConflictResolution
  ): Promise<void> {
    try {
      const conflict = await offlineStorage.get<Conflict>('conflicts', conflictId);
      if (conflict) {
        conflict.status = 'resolved';
        conflict.resolvedAt = resolution.resolvedAt;
        conflict.resolution = resolution;
        await offlineStorage.put('conflicts', conflict);
      }
    } catch (error) {
      console.error('Erreur lors de la résolution du conflit:', error);
    }
  }

  /**
   * Obtient tous les conflits en attente
   */
  async getPendingConflicts(): Promise<Conflict[]> {
    try {
      const allConflicts = await offlineStorage.getAll<Conflict>('conflicts');
      return allConflicts.filter(conflict => conflict.status === 'pending');
    } catch (error) {
      console.error('Erreur lors de la récupération des conflits:', error);
      return [];
    }
  }

  /**
   * Obtient l'historique des résolutions
   */
  async getResolutionHistory(): Promise<ConflictResolution[]> {
    try {
      const resolvedConflicts = await offlineStorage.getAll<Conflict>('conflicts');
      return resolvedConflicts
        .filter(conflict => conflict.status === 'resolved' && conflict.resolution)
        .map(conflict => conflict.resolution!);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      return [];
    }
  }

  /**
   * Supprime les anciens conflits résolus
   */
  async cleanupResolvedConflicts(olderThanDays: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const allConflicts = await offlineStorage.getAll<Conflict>('conflicts');
      const conflictsToDelete = allConflicts.filter(conflict => 
        conflict.status === 'resolved' && 
        conflict.resolvedAt && 
        new Date(conflict.resolvedAt) < cutoffDate
      );

      for (const conflict of conflictsToDelete) {
        await offlineStorage.delete('conflicts', conflict.id);
      }

      console.log(`Nettoyage terminé: ${conflictsToDelete.length} conflits supprimés`);
    } catch (error) {
      console.error('Erreur lors du nettoyage des conflits:', error);
    }
  }

  /**
   * Obtient les statistiques des conflits
   */
  async getConflictStatistics(): Promise<{
    total: number;
    pending: number;
    resolved: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
  }> {
    try {
      const allConflicts = await offlineStorage.getAll<Conflict>('conflicts');
      
      const stats = {
        total: allConflicts.length,
        pending: allConflicts.filter(c => c.status === 'pending').length,
        resolved: allConflicts.filter(c => c.status === 'resolved').length,
        byType: {} as Record<string, number>,
        bySeverity: {} as Record<string, number>
      };

      // Compter par type
      for (const conflict of allConflicts) {
        stats.byType[conflict.type] = (stats.byType[conflict.type] || 0) + 1;
        stats.bySeverity[conflict.severity] = (stats.bySeverity[conflict.severity] || 0) + 1;
      }

      return stats;
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      return {
        total: 0,
        pending: 0,
        resolved: 0,
        byType: {},
        bySeverity: {}
      };
    }
  }
}

export const conflictManager = new ConflictManager();
