// Composant de test pour le stockage offline
import React, { useState, useEffect } from 'react';
import { useOfflineStorage } from '../../hooks/useOfflineStorage';
import { SyncStatus, SyncAction, SyncEntity } from '../../types/offline';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';

export const OfflineStorageTest: React.FC = () => {
  const {
    isInitialized,
    isOnline,
    pendingCount,
    errorCount,
    lastSync,
    isLoading,
    error,
    saveOfflinePrice,
    getOfflinePrices,
    getOfflinePricesByStatus,
    updatePriceStatus,
    addToSyncQueue,
    getSyncQueue,
    refreshState,
    cleanup
  } = useOfflineStorage();

  const [testResults, setTestResults] = useState<string[]>([]);
  const [offlinePrices, setOfflinePrices] = useState<any[]>([]);
  const [syncQueue, setSyncQueue] = useState<any[]>([]);

  // Ajouter un résultat de test
  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Test de sauvegarde d'un prix offline
  const testSaveOfflinePrice = async () => {
    try {
      addTestResult('Test: Sauvegarde d\'un prix offline...');
      
      const testPrice = {
        data: {
          regionCode: 'BIS',
          qualityGrade: 'W180',
          priceFcfa: 1500,
          recordedDate: new Date().toISOString().split('T')[0],
          sourceName: 'Test Market',
          sourceType: 'market',
          gpsLat: 11.8636,
          gpsLng: -15.5977,
          notes: 'Test price for offline storage'
        },
        status: SyncStatus.PENDING,
        retryCount: 0
      };

      const result = await saveOfflinePrice(testPrice);
      
      if (result.success) {
        addTestResult(`✅ Prix sauvegardé avec succès (ID: ${result.data?.id})`);
        await loadOfflinePrices();
      } else {
        addTestResult(`❌ Erreur: ${result.error}`);
      }
    } catch (error) {
      addTestResult(`❌ Exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Test d'ajout à la queue de synchronisation
  const testAddToSyncQueue = async () => {
    try {
      addTestResult('Test: Ajout à la queue de synchronisation...');
      
      const queueItem = {
        action: SyncAction.CREATE,
        entity: SyncEntity.PRICE,
        entityId: `test-${Date.now()}`,
        data: { test: 'data' },
        priority: 1
      };

      const result = await addToSyncQueue(queueItem);
      
      if (result.success) {
        addTestResult(`✅ Élément ajouté à la queue (ID: ${result.data?.id})`);
        await loadSyncQueue();
      } else {
        addTestResult(`❌ Erreur: ${result.error}`);
      }
    } catch (error) {
      addTestResult(`❌ Exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Charger les prix offline
  const loadOfflinePrices = async () => {
    try {
      const result = await getOfflinePrices();
      if (result.success) {
        setOfflinePrices(result.data || []);
        addTestResult(`📊 ${result.data?.length || 0} prix offline chargés`);
      }
    } catch (error) {
      addTestResult(`❌ Erreur chargement prix: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Charger la queue de synchronisation
  const loadSyncQueue = async () => {
    try {
      const result = await getSyncQueue();
      if (result.success) {
        setSyncQueue(result.data || []);
        addTestResult(`🔄 ${result.data?.length || 0} éléments dans la queue`);
      }
    } catch (error) {
      addTestResult(`❌ Erreur chargement queue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Test de mise à jour du statut
  const testUpdateStatus = async () => {
    if (offlinePrices.length === 0) {
      addTestResult('❌ Aucun prix à mettre à jour');
      return;
    }

    try {
      const firstPrice = offlinePrices[0];
      addTestResult(`Test: Mise à jour du statut du prix ${firstPrice.id}...`);
      
      const result = await updatePriceStatus(firstPrice.id, SyncStatus.SYNCING);
      
      if (result.success) {
        addTestResult('✅ Statut mis à jour avec succès');
        await loadOfflinePrices();
      } else {
        addTestResult(`❌ Erreur: ${result.error}`);
      }
    } catch (error) {
      addTestResult(`❌ Exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Test de nettoyage
  const testCleanup = async () => {
    try {
      addTestResult('Test: Nettoyage du stockage...');
      
      const result = await cleanup();
      
      if (result.success) {
        addTestResult('✅ Nettoyage terminé');
        await loadOfflinePrices();
        await loadSyncQueue();
      } else {
        addTestResult(`❌ Erreur: ${result.error}`);
      }
    } catch (error) {
      addTestResult(`❌ Exception: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Test complet
  const runFullTest = async () => {
    setTestResults([]);
    addTestResult('🚀 Début des tests de stockage offline...');
    
    await testSaveOfflinePrice();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testAddToSyncQueue();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testUpdateStatus();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    addTestResult('✅ Tests terminés');
  };

  // Charger les données au montage
  useEffect(() => {
    if (isInitialized) {
      loadOfflinePrices();
      loadSyncQueue();
    }
  }, [isInitialized]);

  // Actualiser l'état
  useEffect(() => {
    refreshState();
  }, [refreshState]);

  if (!isInitialized) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Test Stockage Offline</CardTitle>
          <CardDescription>Initialisation en cours...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Initialisation du stockage offline...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statut du stockage */}
      <Card>
        <CardHeader>
          <CardTitle>Statut du Stockage Offline</CardTitle>
          <CardDescription>Informations sur l'état du stockage local</CardDescription>
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
                {isInitialized ? '✅' : '❌'}
              </div>
              <div className="text-sm text-gray-600">Initialisé</div>
            </div>
          </div>
          
          {lastSync && (
            <div className="mt-4 text-sm text-gray-600">
              Dernière synchronisation: {new Date(lastSync).toLocaleString()}
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-md">
              <div className="text-red-800 font-medium">Erreur:</div>
              <div className="text-red-700">{error}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Tests de Stockage</CardTitle>
          <CardDescription>Tests des fonctionnalités de stockage offline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button onClick={testSaveOfflinePrice} disabled={isLoading}>
              Test Sauvegarde Prix
            </Button>
            <Button onClick={testAddToSyncQueue} disabled={isLoading}>
              Test Queue Sync
            </Button>
            <Button onClick={testUpdateStatus} disabled={isLoading}>
              Test Mise à Jour
            </Button>
            <Button onClick={testCleanup} disabled={isLoading}>
              Test Nettoyage
            </Button>
            <Button onClick={runFullTest} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              Test Complet
            </Button>
            <Button onClick={refreshState} disabled={isLoading} variant="outline">
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

      {/* Données stockées */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Prix offline */}
        <Card>
          <CardHeader>
            <CardTitle>Prix Offline ({offlinePrices.length})</CardTitle>
            <CardDescription>Prix stockés localement</CardDescription>
          </CardHeader>
          <CardContent>
            {offlinePrices.length === 0 ? (
              <div className="text-gray-500 italic">Aucun prix offline</div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {offlinePrices.map((price) => (
                  <div key={price.id} className="p-3 border rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{price.data.regionCode} - {price.data.qualityGrade}</div>
                        <div className="text-sm text-gray-600">{price.data.priceFcfa} FCFA</div>
                        <div className="text-xs text-gray-500">
                          {new Date(price.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        price.status === SyncStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                        price.status === SyncStatus.SYNCING ? 'bg-blue-100 text-blue-800' :
                        price.status === SyncStatus.SYNCED ? 'bg-green-100 text-green-800' :
                        price.status === SyncStatus.ERROR ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {price.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Queue de synchronisation */}
        <Card>
          <CardHeader>
            <CardTitle>Queue de Sync ({syncQueue.length})</CardTitle>
            <CardDescription>Actions en attente de synchronisation</CardDescription>
          </CardHeader>
          <CardContent>
            {syncQueue.length === 0 ? (
              <div className="text-gray-500 italic">Queue vide</div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {syncQueue.map((item) => (
                  <div key={item.id} className="p-3 border rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{item.action} {item.entity}</div>
                        <div className="text-sm text-gray-600">ID: {item.entityId}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(item.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          Tentatives: {item.attempts}/{item.maxAttempts}
                        </div>
                        <div className="text-xs text-gray-500">
                          Priorité: {item.priority}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
