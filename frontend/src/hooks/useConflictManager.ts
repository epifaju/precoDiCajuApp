import { useState, useEffect, useCallback } from 'react';
import { conflictManager } from '../services/conflictManager';
import type { 
  Conflict, 
  ConflictResolution, 
  ConflictResolutionStrategy, 
  ConflictDetectionResult 
} from '../services/conflictManager';

export interface UseConflictManagerReturn {
  // État des conflits
  pendingConflicts: Conflict[];
  resolutionHistory: ConflictResolution[];
  statistics: {
    total: number;
    pending: number;
    resolved: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
  };
  
  // Actions
  detectConflicts: (
    localData: any,
    remoteData: any,
    action: string
  ) => Promise<ConflictDetectionResult>;
  resolveConflictsAutomatically: (
    conflicts: Conflict[],
    strategy: ConflictResolutionStrategy
  ) => Promise<ConflictResolution[]>;
  resolveConflictManually: (
    conflictId: string,
    resolution: 'local' | 'remote' | 'merge' | 'skip',
    details?: string
  ) => Promise<void>;
  refreshConflicts: () => Promise<void>;
  cleanupOldConflicts: (olderThanDays?: number) => Promise<void>;
  
  // État de chargement
  isLoading: boolean;
  error: string | null;
}

export function useConflictManager(): UseConflictManagerReturn {
  const [pendingConflicts, setPendingConflicts] = useState<Conflict[]>([]);
  const [resolutionHistory, setResolutionHistory] = useState<ConflictResolution[]>([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    byType: {} as Record<string, number>,
    bySeverity: {} as Record<string, number>
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les conflits au montage du composant
  useEffect(() => {
    loadConflicts();
  }, []);

  const loadConflicts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [conflicts, history, stats] = await Promise.all([
        conflictManager.getPendingConflicts(),
        conflictManager.getResolutionHistory(),
        conflictManager.getConflictStatistics()
      ]);
      
      setPendingConflicts(conflicts);
      setResolutionHistory(history);
      setStatistics(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des conflits');
      console.error('Erreur lors du chargement des conflits:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const detectConflicts = useCallback(async (
    localData: any,
    remoteData: any,
    action: string
  ): Promise<ConflictDetectionResult> => {
    try {
      setError(null);
      const result = await conflictManager.detectConflicts(localData, remoteData, action as any);
      
      // Recharger les conflits si de nouveaux conflits ont été détectés
      if (result.hasConflicts) {
        await loadConflicts();
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la détection des conflits';
      setError(errorMessage);
      console.error('Erreur lors de la détection des conflits:', err);
      
      return {
        hasConflicts: false,
        conflicts: [],
        resolutionSuggestions: []
      };
    }
  }, [loadConflicts]);

  const resolveConflictsAutomatically = useCallback(async (
    conflicts: Conflict[],
    strategy: ConflictResolutionStrategy
  ): Promise<ConflictResolution[]> => {
    try {
      setError(null);
      const resolutions = await conflictManager.resolveConflictsAutomatically(conflicts, strategy);
      
      // Recharger les conflits après résolution
      await loadConflicts();
      
      return resolutions;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la résolution automatique';
      setError(errorMessage);
      console.error('Erreur lors de la résolution automatique:', err);
      return [];
    }
  }, [loadConflicts]);

  const resolveConflictManually = useCallback(async (
    conflictId: string,
    resolution: 'local' | 'remote' | 'merge' | 'skip',
    details?: string
  ): Promise<void> => {
    try {
      setError(null);
      
      // Créer une résolution manuelle
      const manualResolution: ConflictResolution = {
        conflictId,
        strategy: {
          id: 'manual',
          name: 'Résolution manuelle',
          description: 'Résolution effectuée par l\'utilisateur',
          automatic: false,
          priority: 0
        },
        resolvedAt: new Date(),
        resolvedBy: 'user',
        resolution,
        details
      };
      
      // Marquer le conflit comme résolu
      await conflictManager['markConflictAsResolved'](conflictId, manualResolution);
      
      // Recharger les conflits
      await loadConflicts();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la résolution manuelle';
      setError(errorMessage);
      console.error('Erreur lors de la résolution manuelle:', err);
      throw err;
    }
  }, [loadConflicts]);

  const refreshConflicts = useCallback(async () => {
    await loadConflicts();
  }, [loadConflicts]);

  const cleanupOldConflicts = useCallback(async (olderThanDays: number = 30) => {
    try {
      setError(null);
      await conflictManager.cleanupResolvedConflicts(olderThanDays);
      await loadConflicts();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du nettoyage';
      setError(errorMessage);
      console.error('Erreur lors du nettoyage des conflits:', err);
    }
  }, [loadConflicts]);

  return {
    pendingConflicts,
    resolutionHistory,
    statistics,
    detectConflicts,
    resolveConflictsAutomatically,
    resolveConflictManually,
    refreshConflicts,
    cleanupOldConflicts,
    isLoading,
    error
  };
}
