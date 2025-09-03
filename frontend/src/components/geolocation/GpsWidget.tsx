/**
 * Widget GPS Compact - Widget pour l'affichage rapide des informations GPS
 * Composant léger et réutilisable pour afficher les informations GPS essentielles
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useOfflineGeolocation } from '../../hooks/geolocation';

export interface GpsWidgetProps {
  /** Variante d'affichage */
  variant?: 'minimal' | 'compact' | 'detailed';
  /** Taille du widget */
  size?: 'small' | 'medium' | 'large';
  /** Afficher les coordonnées */
  showCoordinates?: boolean;
  /** Afficher la précision */
  showAccuracy?: boolean;
  /** Afficher l'adresse */
  showAddress?: boolean;
  /** Afficher le statut offline */
  showOfflineStatus?: boolean;
  /** Position du widget */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  /** Classe CSS personnalisée */
  className?: string;
  /** Callback lors du clic */
  onClick?: () => void;
  /** Callback lors des changements de position */
  onPositionChange?: (position: any) => void;
  /** Mise à jour automatique */
  autoUpdate?: boolean;
  /** Intervalle de mise à jour */
  updateInterval?: number;
}

export const GpsWidget: React.FC<GpsWidgetProps> = ({
  variant = 'compact',
  size = 'medium',
  showCoordinates = true,
  showAccuracy = true,
  showAddress = false,
  showOfflineStatus = true,
  position = 'top-right',
  className = '',
  onClick,
  onPositionChange,
  autoUpdate = true,
  updateInterval = 10000
}) => {
  const { t } = useTranslation();
  const [offlineState, offlineActions] = useOfflineGeolocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Mise à jour automatique
  useEffect(() => {
    if (!autoUpdate) return;

    const interval = setInterval(async () => {
      try {
        await offlineActions.getCurrentPosition();
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Erreur lors de la mise à jour du widget GPS:', error);
      }
    }, updateInterval);

    return () => clearInterval(interval);
  }, [autoUpdate, updateInterval, offlineActions]);

  // Notifier les changements de position
  useEffect(() => {
    if (offlineState.position && onPositionChange) {
      onPositionChange(offlineState.position);
    }
  }, [offlineState.position, onPositionChange]);

  const getStatusIcon = () => {
    if (offlineState.loading) return '🔄';
    if (offlineState.error) return '❌';
    if (offlineState.position) return '📍';
    return '❓';
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-orange-600';
      case 'invalid': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getQualityBg = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'bg-green-100';
      case 'good': return 'bg-blue-100';
      case 'fair': return 'bg-yellow-100';
      case 'poor': return 'bg-orange-100';
      case 'invalid': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small': return 'text-xs';
      case 'large': return 'text-base';
      default: return 'text-sm';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left': return 'top-4 left-4';
      case 'top-right': return 'top-4 right-4';
      case 'bottom-left': return 'bottom-4 left-4';
      case 'bottom-right': return 'bottom-4 right-4';
      case 'center': return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      default: return 'top-4 right-4';
    }
  };

  const formatCoordinates = (lat: number, lng: number) => {
    const precision = size === 'small' ? 3 : size === 'large' ? 6 : 4;
    return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`;
  };

  const formatAccuracy = (accuracy: number) => {
    if (accuracy < 1000) {
      return `${Math.round(accuracy)}m`;
    } else {
      return `${(accuracy / 1000).toFixed(1)}km`;
    }
  };

  const formatLastUpdate = () => {
    if (!lastUpdate) return '';
    const now = new Date();
    const diff = now.getTime() - lastUpdate.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
  };

  // Rendu minimal
  if (variant === 'minimal') {
    return (
      <div 
        className={`fixed ${getPositionClasses()} z-50 ${className}`}
        onClick={onClick}
      >
        <div className={`${getSizeClasses()} bg-white rounded-lg shadow-lg border p-2 cursor-pointer hover:shadow-xl transition-shadow`}>
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getStatusIcon()}</span>
            {offlineState.position && (
              <div className="flex items-center space-x-1">
                <span className={`px-1 py-0.5 rounded text-xs ${getQualityBg(offlineState.position.quality)} ${getQualityColor(offlineState.position.quality)}`}>
                  {Math.round(offlineState.position.accuracy)}m
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Rendu compact
  if (variant === 'compact') {
    return (
      <div 
        className={`fixed ${getPositionClasses()} z-50 ${className}`}
        onClick={onClick}
      >
        <div className={`${getSizeClasses()} bg-white rounded-lg shadow-lg border p-3 cursor-pointer hover:shadow-xl transition-shadow max-w-xs`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getStatusIcon()}</span>
              <div>
                <p className="font-medium text-gray-900">
                  {offlineState.position 
                    ? formatCoordinates(offlineState.position.coordinates.lat, offlineState.position.coordinates.lng)
                    : t('geolocation.status.loading')
                  }
                </p>
                {offlineState.position && showAccuracy && (
                  <p className={`text-xs ${getQualityColor(offlineState.position.quality)}`}>
                    {formatAccuracy(offlineState.position.accuracy)} - {t(`geolocation.quality.${offlineState.position.quality}`)}
                  </p>
                )}
              </div>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
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
              <div className="space-y-2 text-xs">
                {showOfflineStatus && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('geolocation.offline.online')}:</span>
                    <span className={offlineState.isOnline ? 'text-green-600' : 'text-red-600'}>
                      {offlineState.isOnline ? 'Oui' : 'Non'}
                    </span>
                  </div>
                )}
                
                {lastUpdate && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('geolocation.dashboard.lastUpdate')}:</span>
                    <span className="text-gray-600">{formatLastUpdate()}</span>
                  </div>
                )}
                
                {offlineState.position && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('geolocation.dashboard.lastUpdate')}:</span>
                    <span className="text-gray-600">
                      {new Date(offlineState.position.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Rendu détaillé
  return (
    <div 
      className={`fixed ${getPositionClasses()} z-50 ${className}`}
      onClick={onClick}
    >
      <div className={`${getSizeClasses()} bg-white rounded-lg shadow-lg border p-4 cursor-pointer hover:shadow-xl transition-shadow max-w-sm`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xl">{getStatusIcon()}</span>
            <div>
              <h3 className="font-medium text-gray-900">
                {t('geolocation.widget.title')}
              </h3>
              <p className="text-xs text-gray-500">
                {t('geolocation.widget.subtitle')}
              </p>
            </div>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-1 text-gray-400 hover:text-gray-600"
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

        {/* Informations principales */}
        <div className="space-y-2 mb-3">
          {showCoordinates && offlineState.position && (
            <div>
              <p className="text-xs text-gray-500">{t('geolocation.coordinates')}</p>
              <p className="font-mono text-sm text-gray-900">
                {formatCoordinates(offlineState.position.coordinates.lat, offlineState.position.coordinates.lng)}
              </p>
            </div>
          )}
          
          {showAccuracy && offlineState.position && (
            <div>
              <p className="text-xs text-gray-500">{t('geolocation.accuracy')}</p>
              <div className="flex items-center space-x-2">
                <p className="font-medium text-gray-900">
                  {formatAccuracy(offlineState.position.accuracy)}
                </p>
                <span className={`px-2 py-1 text-xs rounded-full ${getQualityBg(offlineState.position.quality)} ${getQualityColor(offlineState.position.quality)}`}>
                  {t(`geolocation.quality.${offlineState.position.quality}`)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Informations étendues */}
        {isExpanded && (
          <div className="pt-3 border-t border-gray-200">
            <div className="space-y-2 text-xs">
              {showOfflineStatus && (
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('geolocation.offline.connectivity')}:</span>
                  <span className={offlineState.isOnline ? 'text-green-600' : 'text-red-600'}>
                    {offlineState.isOnline ? t('geolocation.offline.online') : t('geolocation.offline.offline')}
                  </span>
                </div>
              )}
              
              {offlineState.position && (
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('geolocation.dashboard.lastUpdate')}:</span>
                  <span className="text-gray-600">
                    {new Date(offlineState.position.timestamp).toLocaleString()}
                  </span>
                </div>
              )}
              
              {lastUpdate && (
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('geolocation.widget.lastRefresh')}:</span>
                  <span className="text-gray-600">{formatLastUpdate()}</span>
                </div>
              )}
              
              {offlineState.cacheSize > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('geolocation.offline.cacheSize')}:</span>
                  <span className="text-gray-600">{offlineState.cacheSize}</span>
                </div>
              )}
            </div>
            
            {/* Actions rapides */}
            <div className="mt-3 flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  offlineActions.getCurrentPosition();
                }}
                disabled={offlineState.loading}
                className="flex-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {offlineState.loading ? t('geolocation.status.loading') : t('geolocation.getCurrentLocation')}
              </button>
              
              {!offlineState.isOnline && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    offlineActions.syncNow();
                  }}
                  className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                >
                  {t('geolocation.offline.sync')}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Indicateur de statut */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              offlineState.isOnline ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="text-xs text-gray-500">
              {offlineState.isOnline ? t('geolocation.offline.online') : t('geolocation.offline.offline')}
            </span>
          </div>
          
          {offlineState.loading && (
            <div className="flex items-center space-x-1">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
              <span className="text-xs text-gray-500">{t('geolocation.status.loading')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GpsWidget;

