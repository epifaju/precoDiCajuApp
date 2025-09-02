import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useOfflineStorage } from '../../hooks/useOfflineStorage';
import { useServiceWorker } from '../../hooks/useServiceWorker';
import { useOfflinePrices, useSyncQueue } from '../../hooks/useOfflineApi';
import { OfflineMutationsTest } from './OfflineMutationsTest';
import { OfflineStorageTest } from './OfflineStorageTest';
import { SyncQueueTest } from './SyncQueueTest';

export const OfflineIntegrationTest: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'storage' | 'mutations' | 'sync'>('overview');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'poor' | 'offline'>('good');

  const { getOfflinePrices, getSyncQueueItems, getSyncMetadata } = useOfflineStorage();
  const { syncStatus, lastSyncTime, triggerSync } = useServiceWorker();
  const { prices: offlinePrices, loading: pricesLoading } = useOfflinePrices();
  const { queueItems, loading: queueLoading } = useSyncQueue();

  // Surveiller le statut de connexion
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setConnectionQuality('good');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setConnectionQuality('offline');
    };

    // Test de la qualité de connexion
    const testConnectionQuality = async () => {
      if (navigator.onLine) {
        try {
          const start = Date.now();
          await fetch('/api/v1/health', { 
            method: 'HEAD',
            cache: 'no-cache',
            signal: AbortSignal.timeout(3000)
          });
          const duration = Date.now() - start;
          
          if (duration < 1000) {
            setConnectionQuality('good');
          } else {
            setConnectionQuality('poor');
          }
        } catch (error) {
          setConnectionQuality('poor');
        }
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    testConnectionQuality();
    const interval = setInterval(testConnectionQuality, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const getConnectionStatus = () => {
    if (!isOnline) return { status: 'offline', color: 'red', text: 'Hors ligne' };
    if (connectionQuality === 'poor') return { status: 'poor', color: 'orange', text: 'Connexion lente' };
    return { status: 'online', color: 'green', text: 'En ligne' };
  };

  const connectionStatus = getConnectionStatus();

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
    { id: 'storage', label: 'Stockage Local', icon: '💾' },
    { id: 'mutations', label: 'Mutations Offline', icon: '🔄' },
    { id: 'sync', label: 'Synchronisation', icon: '🔄' },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Statut de connexion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Statut de Connexion
            <Badge variant={connectionStatus.color === 'green' ? 'default' : connectionStatus.color === 'orange' ? 'secondary' : 'destructive'}>
              {connectionStatus.text}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {isOnline ? '🟢' : '🔴'}
              </div>
              <p className="text-sm text-gray-600">Connexion</p>
              <p className="text-xs text-gray-500">{isOnline ? 'En ligne' : 'Hors ligne'}</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {connectionQuality === 'good' ? '⚡' : connectionQuality === 'poor' ? '🐌' : '❌'}
              </div>
              <p className="text-sm text-gray-600">Qualité</p>
              <p className="text-xs text-gray-500">
                {connectionQuality === 'good' ? 'Bonne' : connectionQuality === 'poor' ? 'Lente' : 'Aucune'}
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {syncStatus === 'idle' ? '⏸️' : syncStatus === 'syncing' ? '🔄' : syncStatus === 'completed' ? '✅' : '❌'}
              </div>
              <p className="text-sm text-gray-600">Synchronisation</p>
              <p className="text-xs text-gray-500">{syncStatus}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques des données offline */}
      <Card>
        <CardHeader>
          <CardTitle>Données Offline</CardTitle>
          <CardDescription>
            Statistiques des données stockées localement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {pricesLoading ? '...' : offlinePrices.length}
              </div>
              <p className="text-sm text-gray-600">Prix Offline</p>
              <p className="text-xs text-gray-500">
                {offlinePrices.filter(p => p.status === 'pending').length} en attente
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {queueLoading ? '...' : queueItems.length}
              </div>
              <p className="text-sm text-gray-600">Queue Sync</p>
              <p className="text-xs text-gray-500">
                {queueItems.filter(q => q.status === 'pending').length} en attente
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {queueItems.filter(q => q.status === 'completed').length}
              </div>
              <p className="text-sm text-gray-600">Synchronisés</p>
              <p className="text-xs text-gray-500">Aujourd'hui</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {queueItems.filter(q => q.status === 'failed').length}
              </div>
              <p className="text-sm text-gray-600">Échecs</p>
              <p className="text-xs text-gray-500">À retry</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
          <CardDescription>
            Actions pour gérer les données offline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={triggerSync}
              disabled={syncStatus === 'syncing' || !isOnline}
              variant="default"
            >
              {syncStatus === 'syncing' ? 'Synchronisation...' : 'Déclencher Sync'}
            </Button>
            
            <Button
              onClick={() => setActiveTab('storage')}
              variant="outline"
            >
              Tester Stockage
            </Button>
            
            <Button
              onClick={() => setActiveTab('mutations')}
              variant="outline"
            >
              Tester Mutations
            </Button>
            
            <Button
              onClick={() => setActiveTab('sync')}
              variant="outline"
            >
              Tester Sync
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dernière synchronisation */}
      <Card>
        <CardHeader>
          <CardTitle>Dernière Synchronisation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <strong>Statut:</strong> {syncStatus}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Dernière sync:</strong> {lastSyncTime || 'Jamais'}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Prochaine sync:</strong> {isOnline ? 'Automatique' : 'Dès reconnexion'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'storage':
        return <OfflineStorageTest />;
      case 'mutations':
        return <OfflineMutationsTest />;
      case 'sync':
        return <SyncQueueTest />;
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test d'Intégration Offline</CardTitle>
          <CardDescription>
            Interface de test complète pour les fonctionnalités offline de l'application
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Navigation par onglets */}
          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab(tab.id as any)}
                className="flex items-center gap-2"
              >
                <span>{tab.icon}</span>
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Contenu de l'onglet actif */}
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};
