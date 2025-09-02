// Composant de test pour la queue de synchronisation
import React, { useState, useEffect } from 'react';
import { useOfflineStorage } from '../../hooks/useOfflineStorage';
import { useOfflineSync } from '../../hooks/useOfflineMutation';
import { syncQueue, SyncPriority } from '../../services/syncQueue';
import { syncManager } from '../../services/syncManager';
import { referenceDataSync } from '../../services/referenceDataSync';
import { SyncAction, SyncEntity } from '../../types/offline';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';

export const SyncQueueTest: React.FC = () => {
  const { isOnline, pendingCount, errorCount, lastSync } = useOfflineStorage();
  const { sync, getSyncStatus, startAutoSync, stopAutoSync } = useOfflineSync();
  
  const [testResults, setTestResults] = useState<string[]>([]);
  const [queueStats, setQueueStats] = useState<any>(null);
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Ajouter un résultat de test
  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Charger les statistiques de la queue
  const loadQueueStats = async () => {
    try {
      const stats = await syncQueue.getQueueStats();
      setQueueStats(stats);
      addTestResult(`📊 Statistiques chargées: ${stats.totalItems} éléments`);
    } catch (error) {
      addTestResult(`❌ Erreur chargement stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Charger le statut de synchronisation
  const loadSyncStatus = async () => {
    try {
      const status = await getSyncStatus();
      setSyncStatus(status);
      addTestResult(`🔄 Statut sync chargé: ${status.pendingCount} en attente`);
    } catch (error) {
      addTestResult(`❌ Erreur statut sync: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Test d'ajout d'éléments à la queue
  const testAddToQueue = async () => {
    try {
      addTestResult('Test: Ajout d\'éléments à la queue...');
      
      // Ajouter plusieurs éléments avec différentes priorités
      const items = [
        {
          action: SyncAction.CREATE,
          entity: SyncEntity.PRICE,
          data: { regionCode: 'BIS', qualityGrade: 'W180', priceFcfa: 1500 },
          priority: SyncPriority.HIGH
        },
        {
          action: SyncAction.UPDATE,
          entity: SyncEntity.PRICE,
          data: { id: 'test-1', priceFcfa: 1600 },
          priority: SyncPriority.NORMAL
        },
        {
          action: SyncAction.DELETE,
          entity: SyncEntity.PRICE,
          data: { id: 'test-2' },
          priority: SyncPriority.CRITICAL
        }
      ];

      for (const item of items) {
        const result = await syncQueue.queuePriceAction(
          item.action,
          item.data,
          { priority: item.priority }
        );
        
        if (result.success) {
          addTestResult(`✅ ${item.action} ajouté (priorité: ${item.priority})`);
        } else {
          addTestResult(`❌ Erreur ${item.action}: ${result.error}`);
        }
      }

      await loadQueueStats();
    } catch (error) {
      addTestResult(`❌ Exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Test de traitement de la queue
  const testProcessQueue = async () => {
    try {
      addTestResult('Test: Traitement de la queue...');
      
      const result = await syncQueue.processQueue();
      
      addTestResult(`📊 Traitement terminé: ${result.processed} traités, ${result.successful} réussis, ${result.failed} échoués`);
      
      if (result.errors.length > 0) {
        result.errors.forEach(error => {
          addTestResult(`⚠️ Erreur: ${error}`);
        });
      }

      await loadQueueStats();
    } catch (error) {
      addTestResult(`❌ Exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Test de synchronisation manuelle
  const testManualSync = async () => {
    try {
      addTestResult('Test: Synchronisation manuelle...');
      setIsLoading(true);
      
      const result = await sync();
      
      addTestResult(`🔄 Sync terminée: ${result.syncedCount} synchronisés, ${result.errorCount} erreurs`);
      
      if (result.errors.length > 0) {
        result.errors.forEach(error => {
          addTestResult(`⚠️ Erreur sync: ${error}`);
        });
      }

      await loadSyncStatus();
    } catch (error) {
      addTestResult(`❌ Exception sync: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Test de synchronisation des données de référence
  const testReferenceDataSync = async () => {
    try {
      addTestResult('Test: Sync données de référence...');
      
      const result = await referenceDataSync.syncAllReferenceData({ forceSync: true });
      
      if (result.success) {
        addTestResult(`✅ Données de référence synchronisées: ${result.data?.regions.length} régions, ${result.data?.qualities.length} qualités`);
      } else {
        addTestResult(`❌ Erreur sync référence: ${result.error}`);
      }
    } catch (error) {
      addTestResult(`❌ Exception sync référence: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Test de nettoyage de la queue
  const testCleanupQueue = async () => {
    try {
      addTestResult('Test: Nettoyage de la queue...');
      
      const result = await syncQueue.cleanupQueue(0); // Nettoyer tout
      
      if (result.success) {
        addTestResult('✅ Queue nettoyée');
      } else {
        addTestResult(`❌ Erreur nettoyage: ${result.error}`);
      }

      await loadQueueStats();
    } catch (error) {
      addTestResult(`❌ Exception nettoyage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Test de validation des données de référence
  const testValidateReferenceData = async () => {
    try {
      addTestResult('Test: Validation données de référence...');
      
      const result = await referenceDataSync.validateReferenceData();
      
      if (result.isValid) {
        addTestResult('✅ Données de référence valides');
      } else {
        addTestResult(`❌ Données invalides: ${result.errors.join(', ')}`);
      }

      if (result.warnings.length > 0) {
        result.warnings.forEach(warning => {
          addTestResult(`⚠️ Avertissement: ${warning}`);
        });
      }
    } catch (error) {
      addTestResult(`❌ Exception validation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Test complet
  const runFullTest = async () => {
    setTestResults([]);
    addTestResult('🚀 Début des tests de queue de synchronisation...');
    
    await testAddToQueue();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testProcessQueue();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testReferenceDataSync();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testValidateReferenceData();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    addTestResult('✅ Tests terminés');
  };

  // Démarrer/arrêter la synchronisation automatique
  const toggleAutoSync = () => {
    if (syncStatus?.nextAutoSync) {
      stopAutoSync();
      addTestResult('⏹️ Synchronisation automatique arrêtée');
    } else {
      startAutoSync(30000); // 30 secondes
      addTestResult('▶️ Synchronisation automatique démarrée (30s)');
    }
    loadSyncStatus();
  };

  // Charger les données au montage
  useEffect(() => {
    loadQueueStats();
    loadSyncStatus();
  }, []);

  // Actualiser périodiquement
  useEffect(() => {
    const interval = setInterval(() => {
      loadQueueStats();
      loadSyncStatus();
    }, 10000); // Toutes les 10 secondes

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Statut de la synchronisation */}
      <Card>
        <CardHeader>
          <CardTitle>Statut de la Synchronisation</CardTitle>
          <CardDescription>État actuel de la queue et de la synchronisation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                {isOnline ? '🟢' : '🔴'}
              </div>
              <div className="text-sm text-gray-600">
                {isOnline ? 'En ligne' : 'Hors ligne'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{pendingCount}</div>
              <div className="text-sm text-gray-600">En attente</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              <div className="text-sm text-gray-600">Erreurs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {syncStatus?.isSyncing ? '🔄' : '⏸️'}
              </div>
              <div className="text-sm text-gray-600">
                {syncStatus?.isSyncing ? 'Sync en cours' : 'Sync arrêtée'}
              </div>
            </div>
          </div>
          
          {lastSync && (
            <div className="mt-4 text-sm text-gray-600">
              Dernière synchronisation: {new Date(lastSync).toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistiques de la queue */}
      {queueStats && (
        <Card>
          <CardHeader>
            <CardTitle>Statistiques de la Queue</CardTitle>
            <CardDescription>Détails sur les éléments en attente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{queueStats.totalItems}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{queueStats.pendingItems}</div>
                <div className="text-sm text-gray-600">En attente</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{queueStats.failedItems}</div>
                <div className="text-sm text-gray-600">Échoués</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{queueStats.completedItems}</div>
                <div className="text-sm text-gray-600">Complétés</div>
              </div>
            </div>
            
            {queueStats.averageWaitTime > 0 && (
              <div className="mt-4 text-sm text-gray-600">
                Temps d'attente moyen: {Math.round(queueStats.averageWaitTime / 1000)}s
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Tests de Queue de Synchronisation</CardTitle>
          <CardDescription>Tests des fonctionnalités de synchronisation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button onClick={testAddToQueue} disabled={isLoading}>
              Test Ajout Queue
            </Button>
            <Button onClick={testProcessQueue} disabled={isLoading}>
              Test Traitement
            </Button>
            <Button onClick={testManualSync} disabled={isLoading}>
              Test Sync Manuelle
            </Button>
            <Button onClick={testReferenceDataSync} disabled={isLoading}>
              Test Sync Référence
            </Button>
            <Button onClick={testValidateReferenceData} disabled={isLoading}>
              Test Validation
            </Button>
            <Button onClick={testCleanupQueue} disabled={isLoading}>
              Test Nettoyage
            </Button>
            <Button onClick={runFullTest} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              Test Complet
            </Button>
            <Button onClick={toggleAutoSync} disabled={isLoading} variant="outline">
              {syncStatus?.nextAutoSync ? 'Arrêter Auto Sync' : 'Démarrer Auto Sync'}
            </Button>
            <Button onClick={() => { loadQueueStats(); loadSyncStatus(); }} disabled={isLoading} variant="outline">
              Actualiser
            </Button>
          </div>

          {/* Résultats des tests */}
          <div className="bg-gray-100 p-4 rounded-md max-h-64 overflow-y-auto">
            <h4 className="font-medium mb-2">Résultats des tests:</h4>
            {testResults.length === 0 ? (
              <div className="text-gray-500 italic">Aucun test exécuté</div>
            ) : (
              <div className="space-y-1">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
