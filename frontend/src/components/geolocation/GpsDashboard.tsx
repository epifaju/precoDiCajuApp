/**
 * Dashboard GPS - Vue d'ensemble complète de la géolocalisation
 * Affiche toutes les informations GPS en temps réel avec une interface moderne
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  useOfflineGeolocation, 
  useGpsAccuracy, 
  useGeocoding 
} from '../../hooks/geolocation';
import { GeolocationStatus } from './GeolocationStatus';
import { GpsAccuracyDisplay } from './GpsAccuracyDisplay';
import { OfflineStatus } from './OfflineStatus';
import { OfflineCache } from './OfflineCache';
import { OfflineSync } from './OfflineSync';

export interface GpsDashboardProps {
  /** Variante d'affichage */
  variant?: 'full' | 'compact' | 'minimal';
  /** Afficher les sections spécifiques */
  showSections?: {
    status?: boolean;
    accuracy?: boolean;
    offline?: boolean;
    cache?: boolean;
    sync?: boolean;
  };
  /** Classe CSS personnalisée */
  className?: string;
  /** Callback lors des changements */
  onLocationChange?: (position: any) => void;
  /** Mode de mise à jour automatique */
  autoUpdate?: boolean;
  /** Intervalle de mise à jour en ms */
  updateInterval?: number;
}

export const GpsDashboard: React.FC<GpsDashboardProps> = ({
  variant = 'full',
  showSections = {
    status: true,
    accuracy: true,
    offline: true,
    cache: false,
    sync: true
  },
  className = '',
  onLocationChange,
  autoUpdate = true,
  updateInterval = 5000
}) => {
  const { t } = useTranslation();
  const [offlineState, offlineActions] = useOfflineGeolocation();
  const [gpsState, gpsActions] = useGpsAccuracy();
  const [geocodingState, geocodingActions] = useGeocoding();
  const [activeTab, setActiveTab] = useState<'overview' | 'accuracy' | 'offline' | 'settings'>('overview');
  const [isExpanded, setIsExpanded] = useState(false);

  // Mise à jour automatique
  useEffect(() => {
    if (!autoUpdate) return;

    const interval = setInterval(async () => {
      try {
        await offlineActions.getCurrentPosition();
        await gpsActions.validatePosition();
        if (offlineState.position) {
          await geocodingActions.reverseGeocode(offlineState.position.coordinates);
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour automatique:', error);
      }
    }, updateInterval);

    return () => clearInterval(interval);
  }, [autoUpdate, updateInterval, offlineActions, gpsActions, geocodingActions, offlineState.position]);

  // Notifier les changements de position
  useEffect(() => {
    if (offlineState.position && onLocationChange) {
      onLocationChange(offlineState.position);
    }
  }, [offlineState.position, onLocationChange]);

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

  const getStatusIcon = () => {
    if (offlineState.loading) return '🔄';
    if (offlineState.error) return '❌';
    if (offlineState.position) return '📍';
    return '❓';
  };

  // Rendu minimal
  if (variant === 'minimal') {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getStatusIcon()}</span>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {offlineState.position 
                  ? `${offlineState.position.coordinates.lat.toFixed(4)}, ${offlineState.position.coordinates.lng.toFixed(4)}`
                  : t('geolocation.status.loading')
                }
              </p>
              <p className="text-xs text-gray-500">
                {offlineState.position 
                  ? `${Math.round(offlineState.position.accuracy)}m - ${t(`geolocation.quality.${offlineState.position.quality}`)}`
                  : offlineState.error || t('geolocation.status.unknown')
                }
              </p>
            </div>
          </div>
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

        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">{t('geolocation.offline.online')}:</span>
                <span className={`ml-1 ${offlineState.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                  {offlineState.isOnline ? 'Oui' : 'Non'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">{t('geolocation.offline.cacheSize')}:</span>
                <span className="ml-1">{offlineState.cacheSize}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Rendu compact
  if (variant === 'compact') {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {t('geolocation.dashboard.title')}
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getStatusIcon()}</span>
            {offlineState.position && (
              <span className={`px-2 py-1 text-xs rounded-full ${getQualityColor(offlineState.position.quality)}`}>
                {t(`geolocation.quality.${offlineState.position.quality}`)}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">{t('geolocation.coordinates')}</p>
            <p className="text-sm font-medium">
              {offlineState.position 
                ? `${offlineState.position.coordinates.lat.toFixed(6)}, ${offlineState.position.coordinates.lng.toFixed(6)}`
                : '-'
              }
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('geolocation.accuracy')}</p>
            <p className="text-sm font-medium">
              {offlineState.position 
                ? `${Math.round(offlineState.position.accuracy)}m`
                : '-'
              }
            </p>
          </div>
        </div>

        {showSections.offline && (
          <div className="mb-4">
            <OfflineStatus variant="compact" showActions={false} />
          </div>
        )}

        {showSections.sync && (
          <div>
            <OfflineSync variant="compact" showDetails={false} />
          </div>
        )}
      </div>
    );
  }

  // Rendu complet
  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* En-tête */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getStatusIcon()}</span>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {t('geolocation.dashboard.title')}
              </h2>
              <p className="text-sm text-gray-500">
                {t('geolocation.dashboard.subtitle')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {offlineState.position && (
              <span className={`px-3 py-1 text-sm rounded-full ${getQualityColor(offlineState.position.quality)}`}>
                {t(`geolocation.quality.${offlineState.position.quality}`)}
              </span>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            >
              <svg 
                className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-4">
          {['overview', 'accuracy', 'offline', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t(`geolocation.dashboard.tabs.${tab}`)}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Statut principal */}
            {showSections.status && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {t('geolocation.dashboard.sections.status')}
                </h3>
                <GeolocationStatus variant="detailed" />
              </div>
            )}

            {/* Informations de position */}
            {offlineState.position && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    {t('geolocation.coordinates')}
                  </h4>
                  <p className="text-sm text-gray-900">
                    Lat: {offlineState.position.coordinates.lat.toFixed(6)}
                  </p>
                  <p className="text-sm text-gray-900">
                    Lng: {offlineState.position.coordinates.lng.toFixed(6)}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    {t('geolocation.accuracy')}
                  </h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round(offlineState.position.accuracy)}m
                  </p>
                  <p className="text-xs text-gray-500">
                    {t('geolocation.dashboard.accuracyDescription')}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    {t('geolocation.dashboard.lastUpdate')}
                  </h4>
                  <p className="text-sm text-gray-900">
                    {new Date(offlineState.position.timestamp).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.round((Date.now() - offlineState.position.timestamp) / 1000)}s ago
                  </p>
                </div>
              </div>
            )}

            {/* Adresse géocodée */}
            {geocodingState.address && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-700 mb-2">
                  {t('geolocation.address')}
                </h4>
                <p className="text-sm text-blue-900">
                  {geocodingState.address.formatted}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'accuracy' && showSections.accuracy && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('geolocation.dashboard.sections.accuracy')}
            </h3>
            <GpsAccuracyDisplay variant="detailed" />
          </div>
        )}

        {activeTab === 'offline' && (
          <div className="space-y-6">
            {showSections.offline && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {t('geolocation.dashboard.sections.offline')}
                </h3>
                <OfflineStatus variant="detailed" showStats={true} />
              </div>
            )}

            {showSections.cache && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {t('geolocation.dashboard.sections.cache')}
                </h3>
                <OfflineCache variant="list" maxItems={10} />
              </div>
            )}

            {showSections.sync && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {t('geolocation.dashboard.sections.sync')}
                </h3>
                <OfflineSync variant="detailed" showProgress={true} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('geolocation.dashboard.sections.settings')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  {t('geolocation.dashboard.settings.update')}
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={autoUpdate}
                      onChange={(e) => {/* Gérer le changement */}}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600">
                      {t('geolocation.dashboard.settings.autoUpdate')}
                    </span>
                  </label>
                  <div className="text-xs text-gray-500">
                    {t('geolocation.dashboard.settings.updateInterval')}: {updateInterval / 1000}s
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  {t('geolocation.dashboard.settings.display')}
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showSections.accuracy}
                      onChange={(e) => {/* Gérer le changement */}}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600">
                      {t('geolocation.dashboard.settings.showAccuracy')}
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={showSections.offline}
                      onChange={(e) => {/* Gérer le changement */}}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-600">
                      {t('geolocation.dashboard.settings.showOffline')}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GpsDashboard;
