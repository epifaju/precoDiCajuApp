/**
 * Composant pour la gestion du cache offline
 * Affiche et gère les données GPS en cache
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useOfflineCache } from '../../hooks/geolocation/useOfflineGeolocation';
import { CachedPosition, CachedGeocoding } from '../../utils/geolocation/offline';

export interface OfflineCacheProps {
  /** Variante d'affichage */
  variant?: 'list' | 'grid' | 'table';
  /** Nombre maximum d'éléments à afficher */
  maxItems?: number;
  /** Afficher les actions de gestion */
  showActions?: boolean;
  /** Classe CSS personnalisée */
  className?: string;
  /** Callback lors de la sélection d'un élément */
  onItemSelect?: (item: CachedPosition | CachedGeocoding) => void;
}

export const OfflineCache: React.FC<OfflineCacheProps> = ({
  variant = 'list',
  maxItems = 50,
  showActions = true,
  className = '',
  onItemSelect
}) => {
  const { t } = useTranslation();
  const [cacheState, cacheActions] = useOfflineCache();
  const [selectedTab, setSelectedTab] = useState<'positions' | 'geocoding'>('positions');
  const [isLoading, setIsLoading] = useState(false);

  // Charger les données du cache
  useEffect(() => {
    const loadCacheData = async () => {
      setIsLoading(true);
      try {
        await cacheActions.getCachedPositions(maxItems);
        // Charger aussi les données de géocodage si nécessaire
      } catch (error) {
        console.error('Erreur lors du chargement du cache:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCacheData();
  }, [cacheActions, maxItems]);

  const handleClearCache = async () => {
    if (window.confirm(t('geolocation.offline.confirmClearCache'))) {
      try {
        await cacheActions.clearCache();
      } catch (error) {
        console.error('Erreur lors du nettoyage du cache:', error);
      }
    }
  };

  const handleItemClick = (item: CachedPosition | CachedGeocoding) => {
    onItemSelect?.(item);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-orange-600 bg-orange-100';
      case 'invalid': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Rendu des positions en cache
  const renderPositions = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">{t('geolocation.offline.loading')}</span>
        </div>
      );
    }

    if (cacheState.cachedPositions.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="mt-2">{t('geolocation.offline.noCachedPositions')}</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {cacheState.cachedPositions.slice(0, maxItems).map((position) => (
          <div
            key={position.id}
            onClick={() => handleItemClick(position)}
            className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
              variant === 'grid' ? 'grid grid-cols-2 gap-2' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">
                    {formatCoordinates(position.coordinates.lat, position.coordinates.lng)}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getQualityColor(position.quality)}`}>
                    {t(`geolocation.quality.${position.quality}`)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {t('geolocation.offline.accuracy')}: {Math.round(position.accuracy)}m
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">
                  {formatDate(position.cachedAt)}
                </div>
                <div className="flex items-center space-x-1 mt-1">
                  {position.synced ? (
                    <span className="text-green-500 text-xs">✓</span>
                  ) : (
                    <span className="text-orange-500 text-xs">⏳</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Rendu des données de géocodage en cache
  const renderGeocoding = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">{t('geolocation.offline.loading')}</span>
        </div>
      );
    }

    if (cacheState.cachedGeocoding.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="mt-2">{t('geolocation.offline.noCachedGeocoding')}</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {cacheState.cachedGeocoding.slice(0, maxItems).map((geocoding) => (
          <div
            key={geocoding.id}
            onClick={() => handleItemClick(geocoding)}
            className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {geocoding.address.formatted}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatCoordinates(geocoding.coordinates.lat, geocoding.coordinates.lng)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">
                  {formatDate(geocoding.cachedAt)}
                </div>
                <div className="flex items-center space-x-1 mt-1">
                  {geocoding.synced ? (
                    <span className="text-green-500 text-xs">✓</span>
                  ) : (
                    <span className="text-orange-500 text-xs">⏳</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* En-tête */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            {t('geolocation.offline.cacheTitle')}
          </h3>
          {showActions && (
            <button
              onClick={handleClearCache}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
            >
              {t('geolocation.offline.clearCache')}
            </button>
          )}
        </div>
        
        {/* Statistiques */}
        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
          <span>
            {t('geolocation.offline.totalPositions')}: {cacheState.stats.totalPositions}
          </span>
          <span>
            {t('geolocation.offline.totalGeocoding')}: {cacheState.stats.totalGeocoding}
          </span>
          <span>
            {t('geolocation.offline.cacheSize')}: {cacheState.cacheSize}
          </span>
        </div>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-4">
          <button
            onClick={() => setSelectedTab('positions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'positions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('geolocation.offline.positions')}
          </button>
          <button
            onClick={() => setSelectedTab('geocoding')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'geocoding'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('geolocation.offline.geocoding')}
          </button>
        </nav>
      </div>

      {/* Contenu */}
      <div className="p-4">
        {selectedTab === 'positions' ? renderPositions() : renderGeocoding()}
      </div>
    </div>
  );
};

export default OfflineCache;

