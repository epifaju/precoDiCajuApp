/**
 * Composant pour la gestion de la synchronisation offline
 * Affiche le statut de sync et permet la synchronisation manuelle
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useOfflineSync } from '../../hooks/geolocation/useOfflineGeolocation';

export interface OfflineSyncProps {
  /** Variante d'affichage */
  variant?: 'compact' | 'detailed' | 'progress';
  /** Afficher les détails de synchronisation */
  showDetails?: boolean;
  /** Afficher la barre de progression */
  showProgress?: boolean;
  /** Classe CSS personnalisée */
  className?: string;
  /** Callback lors de la synchronisation */
  onSync?: (success: boolean) => void;
}

export interface SyncProgress {
  current: number;
  total: number;
  percentage: number;
  currentItem?: string;
  status: 'idle' | 'syncing' | 'success' | 'error';
}

export const OfflineSync: React.FC<OfflineSyncProps> = ({
  variant = 'compact',
  showDetails = false,
  showProgress = true,
  className = '',
  onSync
}) => {
  const { t } = useTranslation();
  const [syncState, syncActions] = useOfflineSync();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<SyncProgress>({
    current: 0,
    total: 0,
    percentage: 0,
    status: 'idle'
  });
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Simuler la progression de synchronisation
  useEffect(() => {
    if (isSyncing) {
      const interval = setInterval(() => {
        setSyncProgress(prev => {
          if (prev.current >= prev.total) {
            setIsSyncing(false);
            setLastSyncTime(new Date());
            setSyncError(null);
            onSync?.(true);
            return { ...prev, status: 'success' };
          }
          
          const newCurrent = prev.current + 1;
          const percentage = Math.round((newCurrent / prev.total) * 100);
          
          return {
            ...prev,
            current: newCurrent,
            percentage,
            status: 'syncing'
          };
        });
      }, 500);

      return () => clearInterval(interval);
    }
  }, [isSyncing, onSync]);

  const handleSyncNow = async () => {
    if (isSyncing || !syncState.isOnline) return;

    try {
      setIsSyncing(true);
      setSyncError(null);
      
      // Simuler le nombre d'éléments à synchroniser
      const totalItems = syncState.pendingSync || 1;
      setSyncProgress({
        current: 0,
        total: totalItems,
        percentage: 0,
        status: 'syncing'
      });

      // Lancer la synchronisation
      await syncActions.syncNow();
      
    } catch (error) {
      setIsSyncing(false);
      setSyncError(error instanceof Error ? error.message : 'Erreur inconnue');
      setSyncProgress(prev => ({ ...prev, status: 'error' }));
      onSync?.(false);
    }
  };

  const formatLastSync = (timestamp: number | null) => {
    if (!timestamp) return t('geolocation.offline.never');
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return t('geolocation.offline.justNow');
    if (diff < 3600000) return t('geolocation.offline.minutesAgo', { count: Math.floor(diff / 60000) });
    if (diff < 86400000) return t('geolocation.offline.hoursAgo', { count: Math.floor(diff / 3600000) });
    
    return date.toLocaleString();
  };

  const getSyncStatusColor = () => {
    if (syncProgress.status === 'error') return 'text-red-600';
    if (syncProgress.status === 'success') return 'text-green-600';
    if (isSyncing) return 'text-blue-600';
    if (!syncState.isOnline) return 'text-gray-400';
    return 'text-gray-600';
  };

  const getSyncStatusText = () => {
    if (syncProgress.status === 'error') return t('geolocation.offline.syncError');
    if (syncProgress.status === 'success') return t('geolocation.offline.syncSuccess');
    if (isSyncing) return t('geolocation.offline.syncing');
    if (!syncState.isOnline) return t('geolocation.offline.offline');
    if (syncState.pendingSync > 0) return t('geolocation.offline.pendingSync', { count: syncState.pendingSync });
    return t('geolocation.offline.upToDate');
  };

  // Rendu compact
  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className={`w-2 h-2 rounded-full ${
          isSyncing ? 'bg-blue-500 animate-pulse' :
          syncProgress.status === 'error' ? 'bg-red-500' :
          syncProgress.status === 'success' ? 'bg-green-500' :
          !syncState.isOnline ? 'bg-gray-400' : 'bg-green-500'
        }`} />
        
        <div className="flex-1">
          <p className={`text-sm font-medium ${getSyncStatusColor()}`}>
            {getSyncStatusText()}
          </p>
          {showDetails && (
            <p className="text-xs text-gray-500">
              {t('geolocation.offline.lastSync')}: {formatLastSync(syncState.lastSync)}
            </p>
          )}
        </div>
        
        <button
          onClick={handleSyncNow}
          disabled={isSyncing || !syncState.isOnline}
          className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSyncing ? t('geolocation.offline.syncing') : t('geolocation.offline.sync')}
        </button>
      </div>
    );
  }

  // Rendu avec progression
  if (variant === 'progress') {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">
            {t('geolocation.offline.synchronization')}
          </h3>
          <span className={`text-sm font-medium ${getSyncStatusColor()}`}>
            {getSyncStatusText()}
          </span>
        </div>

        {showProgress && isSyncing && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>{t('geolocation.offline.progress')}</span>
              <span>{syncProgress.current}/{syncProgress.total}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${syncProgress.percentage}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {t('geolocation.offline.lastSync')}: {formatLastSync(syncState.lastSync)}
          </div>
          
          <button
            onClick={handleSyncNow}
            disabled={isSyncing || !syncState.isOnline}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSyncing ? t('geolocation.offline.syncing') : t('geolocation.offline.sync')}
          </button>
        </div>

        {syncError && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            {syncError}
          </div>
        )}
      </div>
    );
  }

  // Rendu détaillé
  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          {t('geolocation.offline.synchronization')}
        </h3>
        <div className={`w-3 h-3 rounded-full ${
          isSyncing ? 'bg-blue-500 animate-pulse' :
          syncProgress.status === 'error' ? 'bg-red-500' :
          syncProgress.status === 'success' ? 'bg-green-500' :
          !syncState.isOnline ? 'bg-gray-400' : 'bg-green-500'
        }`} />
      </div>

      {/* Statut de synchronisation */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            {t('geolocation.offline.status')}
          </span>
          <span className={`text-sm font-medium ${getSyncStatusColor()}`}>
            {getSyncStatusText()}
          </span>
        </div>
        
        {showDetails && (
          <div className="mt-2 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>{t('geolocation.offline.lastSync')}:</span>
              <span>{formatLastSync(syncState.lastSync)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('geolocation.offline.pendingSync')}:</span>
              <span className={syncState.pendingSync > 0 ? 'text-orange-600' : 'text-green-600'}>
                {syncState.pendingSync}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Barre de progression */}
      {showProgress && isSyncing && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{t('geolocation.offline.progress')}</span>
            <span>{syncProgress.current}/{syncProgress.total} ({syncProgress.percentage}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${syncProgress.percentage}%` }}
            />
          </div>
          {syncProgress.currentItem && (
            <div className="mt-1 text-xs text-gray-500">
              {syncProgress.currentItem}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={handleSyncNow}
          disabled={isSyncing || !syncState.isOnline}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSyncing ? t('geolocation.offline.syncing') : t('geolocation.offline.sync')}
        </button>
      </div>

      {/* Messages d'état */}
      {syncError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {syncError}
        </div>
      )}

      {!syncState.isOnline && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
          {t('geolocation.offline.offlineWarning')}
        </div>
      )}

      {syncProgress.status === 'success' && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
          {t('geolocation.offline.syncSuccess')}
        </div>
      )}
    </div>
  );
};

export default OfflineSync;

