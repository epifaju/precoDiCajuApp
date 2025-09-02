/**
 * Composant pour afficher l'état offline de la géolocalisation
 * Montre le statut de connectivité, le cache et la synchronisation
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  useOfflineGeolocation, 
  useOfflineCache, 
  useOfflineSync 
} from '../../hooks/geolocation/useOfflineGeolocation';

export interface OfflineStatusProps {
  /** Variante d'affichage */
  variant?: 'compact' | 'detailed' | 'minimal';
  /** Afficher les statistiques détaillées */
  showStats?: boolean;
  /** Afficher les actions de synchronisation */
  showActions?: boolean;
  /** Classe CSS personnalisée */
  className?: string;
  /** Callback lors du changement de statut */
  onStatusChange?: (isOnline: boolean) => void;
}

export const OfflineStatus: React.FC<OfflineStatusProps> = ({
  variant = 'compact',
  showStats = false,
  showActions = true,
  className = '',
  onStatusChange
}) => {
  const { t } = useTranslation();
  const [offlineState, offlineActions] = useOfflineGeolocation();
  const [cacheState, cacheActions] = useOfflineCache();
  const [syncState, syncActions] = useOfflineSync();
  const [isExpanded, setIsExpanded] = useState(false);

  // Notifier les changements de statut
  useEffect(() => {
    onStatusChange?.(offlineState.isOnline);
  }, [offlineState.isOnline, onStatusChange]);

  // Initialiser le système offline
  useEffect(() => {
    offlineActions.initialize();
  }, [offlineActions]);

  // Récupérer les statistiques
  useEffect(() => {
    if (showStats) {
      cacheActions.getStats();
    }
  }, [showStats, cacheActions]);

  const handleSyncNow = async () => {
    try {
      await syncActions.syncNow();
    } catch (error) {
      console.error('Erreur de synchronisation:', error);
    }
  };

  const handleClearCache = async () => {
    try {
      await cacheActions.clearCache();
    } catch (error) {
      console.error('Erreur de nettoyage du cache:', error);
    }
  };

  // Rendu minimal
  if (variant === 'minimal') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className={`w-2 h-2 rounded-full ${
          offlineState.isOnline ? 'bg-green-500' : 'bg-red-500'
        }`} />
        <span className="text-sm text-gray-600">
          {offlineState.isOnline ? t('geolocation.offline.online') : t('geolocation.offline.offline')}
        </span>
      </div>
    );
  }

  // Rendu compact
  if (variant === 'compact') {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              offlineState.isOnline ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {offlineState.isOnline ? t('geolocation.offline.online') : t('geolocation.offline.offline')}
              </p>
              <p className="text-xs text-gray-500">
                {offlineState.canWorkOffline 
                  ? t('geolocation.offline.canWorkOffline')
                  : t('geolocation.offline.cannotWorkOffline')
                }
              </p>
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center space-x-2">
              {!offlineState.isOnline && (
                <button
                  onClick={handleSyncNow}
                  disabled={offlineState.loading}
                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {t('geolocation.offline.sync')}
                </button>
              )}
              
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <svg 
                  className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">{t('geolocation.offline.cacheSize')}:</span>
                <span className="ml-1 font-medium">{cacheState.cacheSize}</span>
              </div>
              <div>
                <span className="text-gray-500">{t('geolocation.offline.pendingSync')}:</span>
                <span className="ml-1 font-medium">{syncState.pendingSync}</span>
              </div>
            </div>
            
            {showActions && (
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={handleClearCache}
                  className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  {t('geolocation.offline.clearCache')}
                </button>
              </div>
            )}
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
          {t('geolocation.offline.title')}
        </h3>
        <div className={`w-3 h-3 rounded-full ${
          offlineState.isOnline ? 'bg-green-500' : 'bg-red-500'
        }`} />
      </div>

      {/* Statut de connectivité */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            {t('geolocation.offline.connectivity')}
          </span>
          <span className={`text-sm font-medium ${
            offlineState.isOnline ? 'text-green-600' : 'text-red-600'
          }`}>
            {offlineState.isOnline ? t('geolocation.offline.online') : t('geolocation.offline.offline')}
          </span>
        </div>
        
        <div className="mt-1 text-xs text-gray-500">
          {offlineState.canWorkOffline 
            ? t('geolocation.offline.canWorkOffline')
            : t('geolocation.offline.cannotWorkOffline')
          }
        </div>
      </div>

      {/* Statistiques du cache */}
      {showStats && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            {t('geolocation.offline.cacheStats')}
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">{t('geolocation.offline.totalPositions')}:</span>
              <span className="ml-1 font-medium">{cacheState.stats.totalPositions}</span>
            </div>
            <div>
              <span className="text-gray-500">{t('geolocation.offline.totalGeocoding')}:</span>
              <span className="ml-1 font-medium">{cacheState.stats.totalGeocoding}</span>
            </div>
            <div>
              <span className="text-gray-500">{t('geolocation.offline.syncQueue')}:</span>
              <span className="ml-1 font-medium">{cacheState.stats.syncQueue}</span>
            </div>
            <div>
              <span className="text-gray-500">{t('geolocation.offline.cacheHitRate')}:</span>
              <span className="ml-1 font-medium">{Math.round(cacheState.stats.cacheHitRate * 100)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Synchronisation */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          {t('geolocation.offline.synchronization')}
        </h4>
        <div className="text-sm text-gray-600">
          <div className="flex justify-between">
            <span>{t('geolocation.offline.lastSync')}:</span>
            <span>
              {syncState.lastSync 
                ? new Date(syncState.lastSync).toLocaleString()
                : t('geolocation.offline.never')
              }
            </span>
          </div>
          <div className="flex justify-between">
            <span>{t('geolocation.offline.pendingSync')}:</span>
            <span className={syncState.pendingSync > 0 ? 'text-orange-600' : 'text-green-600'}>
              {syncState.pendingSync}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex space-x-2">
          <button
            onClick={handleSyncNow}
            disabled={offlineState.loading || !offlineState.isOnline}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {offlineState.loading ? t('geolocation.offline.syncing') : t('geolocation.offline.sync')}
          </button>
          
          <button
            onClick={handleClearCache}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            {t('geolocation.offline.clearCache')}
          </button>
        </div>
      )}

      {/* Messages d'état */}
      {offlineState.error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {offlineState.error}
        </div>
      )}

      {!offlineState.isOnline && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
          {t('geolocation.offline.offlineWarning')}
        </div>
      )}
    </div>
  );
};

export default OfflineStatus;
