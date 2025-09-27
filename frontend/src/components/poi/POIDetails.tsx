import React from 'react';
import { useTranslation } from 'react-i18next';
import { POI, POI_TYPE_CONFIG } from '../../types/poi';
import { useNotificationStore } from '../../store/notificationStore';

interface POIDetailsProps {
  poi: POI;
  compact?: boolean;
  showCallButton?: boolean;
}

export const POIDetails: React.FC<POIDetailsProps> = ({ 
  poi, 
  compact = false,
  showCallButton = true 
}) => {
  const { t } = useTranslation();
  const { addToast } = useNotificationStore();
  
  // Normalize POI type from backend (uppercase) to frontend config keys (lowercase)
  const poiTypeLower = poi.type.toLowerCase();
  const config = POI_TYPE_CONFIG[poiTypeLower as keyof typeof POI_TYPE_CONFIG];

  const handleCallClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (poi.callUrl) {
      window.location.href = poi.callUrl;
    }
  };

  const handleShareClick = async () => {
    try {
      const shareData = {
        title: `${poi.nom} - ${t('poi.pageTitle')}`,
        text: `${t('poi.discover')} ${poi.nom}, um ${t(config.labelKey).toLowerCase()} localizado em ${poi.adresse || `${poi.latitude.toFixed(4)}, ${poi.longitude.toFixed(4)}`}`,
        url: window.location.href
      };

      // Check if Web Share API is supported
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        addToast({
          type: 'success',
          title: t('poi.shareSuccess'),
          message: t('poi.shareMessage')
        });
      } else {
        // Fallback to clipboard
        const shareText = `${poi.nom} - ${t(config.labelKey)}\n📍 ${poi.adresse || `${poi.latitude.toFixed(6)}, ${poi.longitude.toFixed(6)}`}\n${poi.telephone ? `📞 ${poi.telephone}\n` : ''}${poi.horaires ? `🕒 ${poi.horaires}\n` : ''}\n${t('poi.pageDescription')}: ${window.location.href}`;
        
        await navigator.clipboard.writeText(shareText);
        addToast({
          type: 'success',
          title: t('poi.copiedToClipboard'),
          message: t('poi.copiedMessage')
        });
      }
    } catch (error) {
      console.error('Erreur lors du partage:', error);
      
      // Fallback final avec prompt
      const shareText = `${poi.nom} - ${t(config.labelKey)}\n📍 ${poi.adresse || `${poi.latitude.toFixed(6)}, ${poi.longitude.toFixed(6)}`}\n${poi.telephone ? `📞 ${poi.telephone}\n` : ''}${poi.horaires ? `🕒 ${poi.horaires}\n` : ''}\n${t('poi.pageDescription')}: ${window.location.href}`;
      
      // Create a temporary textarea to copy to clipboard
      const textarea = document.createElement('textarea');
      textarea.value = shareText;
      document.body.appendChild(textarea);
      textarea.select();
      
      try {
        document.execCommand('copy');
        addToast({
          type: 'success',
          title: t('poi.copiedToClipboard'),
          message: t('poi.copiedMessage')
        });
      } catch (fallbackError) {
        addToast({
          type: 'error',
          title: t('poi.shareError'),
          message: t('poi.shareErrorMessage')
        });
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  if (compact) {
    return (
      <div className="poi-details-compact group">
        <div className="flex items-start space-x-3">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
            style={{ backgroundColor: `${config.color}20` }}
          >
            <span className="text-sm">{config.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {poi.nom}
              </h4>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span 
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: `${config.color}15`,
                    color: config.color 
                  }}
                >
                  {t(config.labelKey)}
                </span>
              </div>
              {poi.telephone && showCallButton && (
                <a
                  href={poi.callUrl}
                  onClick={handleCallClick}
                  className="inline-flex items-center text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Appeler
                </a>
              )}
            </div>
            {poi.adresse && (
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                📍 {poi.adresse}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="poi-details poi-popup-enhanced">
      {/* Header */}
      <div className="poi-popup-header">
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white leading-tight mb-2">
                {poi.nom}
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-xl">{config.icon}</span>
                <span 
                  className="poi-type-badge bg-white bg-opacity-20 text-white border-white border-opacity-30"
                  style={{ color: 'white' }}
                >
                  {t(config.labelKey)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="poi-popup-body">
        {/* Location */}
        <div className="poi-info-item">
          <svg className="poi-info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div className="poi-info-content">
            <div className="poi-info-label">{t('poi.location')}</div>
            <div className="poi-info-value">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {poi.latitude.toFixed(6)}, {poi.longitude.toFixed(6)}
              </div>
              {poi.adresse && (
                <div className="text-sm font-medium">
                  {poi.adresse}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Phone */}
        {poi.telephone && (
          <div className="poi-info-item">
            <svg className="poi-info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <div className="poi-info-content">
              <div className="poi-info-label">{t('poi.phone')}</div>
              <div className="poi-info-value">
                <div className="text-sm font-medium">
                  {poi.formattedPhone || poi.telephone}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hours */}
        {poi.horaires && (
          <div className="poi-info-item">
            <svg className="poi-info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="poi-info-content">
              <div className="poi-info-label">{t('poi.hours', 'Horaires')}</div>
              <div className="poi-info-value">
                <div className="text-sm font-medium">
                  {poi.horaires}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="poi-popup-footer">
        {/* Call Button */}
        {poi.telephone && showCallButton && (
          <div className="mb-3">
            <a
              href={poi.callUrl}
              onClick={handleCallClick}
              className="poi-call-button inline-flex items-center justify-center text-white"
            >
              <svg className="w-4 h-4 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-white">{t('poi.call', 'Appeler')}</span>
            </a>
          </div>
        )}

        {/* Actions */}
        <div className="poi-actions">
          <button 
            className="poi-action-secondary"
            onClick={handleShareClick}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            {t('poi.share')}
          </button>
          <button 
            className="poi-action-primary"
            onClick={() => {
              const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${poi.latitude},${poi.longitude}`;
              window.open(mapsUrl, '_blank');
            }}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {t('poi.route')}
          </button>
        </div>

        {/* Last Updated */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {t('poi.lastUpdated', 'Mis à jour')}: {new Date(poi.updatedAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Compact POI card for lists
export const POICard: React.FC<POIDetailsProps> = ({ poi, showCallButton = true }) => {
  const { t } = useTranslation();
  const { addToast } = useNotificationStore();
  
  // Normalize POI type from backend (uppercase) to frontend config keys (lowercase)
  const poiTypeLower = poi.type.toLowerCase();
  const config = POI_TYPE_CONFIG[poiTypeLower as keyof typeof POI_TYPE_CONFIG];

  const handleCallClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (poi.callUrl) {
      window.location.href = poi.callUrl;
    }
  };

  const handleShareClick = async () => {
    try {
      const shareData = {
        title: `${poi.nom} - ${t('poi.pageTitle')}`,
        text: `${t('poi.discover')} ${poi.nom}, um ${t(config.labelKey).toLowerCase()} localizado em ${poi.adresse || `${poi.latitude.toFixed(4)}, ${poi.longitude.toFixed(4)}`}`,
        url: window.location.href
      };

      // Check if Web Share API is supported
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        addToast({
          type: 'success',
          title: t('poi.shareSuccess'),
          message: t('poi.shareMessage')
        });
      } else {
        // Fallback to clipboard
        const shareText = `${poi.nom} - ${t(config.labelKey)}\n📍 ${poi.adresse || `${poi.latitude.toFixed(6)}, ${poi.longitude.toFixed(6)}`}\n${poi.telephone ? `📞 ${poi.telephone}\n` : ''}${poi.horaires ? `🕒 ${poi.horaires}\n` : ''}\n${t('poi.pageDescription')}: ${window.location.href}`;
        
        await navigator.clipboard.writeText(shareText);
        addToast({
          type: 'success',
          title: t('poi.copiedToClipboard'),
          message: t('poi.copiedMessage')
        });
      }
    } catch (error) {
      console.error('Erreur lors du partage:', error);
      
      // Fallback final avec prompt
      const shareText = `${poi.nom} - ${t(config.labelKey)}\n📍 ${poi.adresse || `${poi.latitude.toFixed(6)}, ${poi.longitude.toFixed(6)}`}\n${poi.telephone ? `📞 ${poi.telephone}\n` : ''}${poi.horaires ? `🕒 ${poi.horaires}\n` : ''}\n${t('poi.pageDescription')}: ${window.location.href}`;
      
      // Create a temporary textarea to copy to clipboard
      const textarea = document.createElement('textarea');
      textarea.value = shareText;
      document.body.appendChild(textarea);
      textarea.select();
      
      try {
        document.execCommand('copy');
        addToast({
          type: 'success',
          title: t('poi.copiedToClipboard'),
          message: t('poi.copiedMessage')
        });
      } catch (fallbackError) {
        addToast({
          type: 'error',
          title: t('poi.shareError'),
          message: t('poi.shareErrorMessage')
        });
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  return (
    <div className="poi-card bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {poi.nom}
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm">{config.icon}</span>
            <span 
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: `${config.color}20`,
                color: config.color 
              }}
            >
              {t(config.labelKey)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {/* Location */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{poi.latitude.toFixed(4)}, {poi.longitude.toFixed(4)}</span>
        </div>

        {/* Address */}
        {poi.adresse && (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {poi.adresse}
          </div>
        )}

        {/* Phone */}
        {poi.telephone && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{poi.formattedPhone || poi.telephone}</span>
            </div>
            {showCallButton && (
              <a
                href={poi.callUrl}
                onClick={handleCallClick}
                className="inline-flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors duration-200"
              >
                {t('poi.call', 'Appeler')}
              </a>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2 mt-3">
          <button 
            onClick={handleShareClick}
            className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-medium rounded transition-colors duration-200"
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            {t('poi.share')}
          </button>
          <button 
            onClick={() => {
              const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${poi.latitude},${poi.longitude}`;
              window.open(mapsUrl, '_blank');
            }}
            className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors duration-200"
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {t('poi.route')}
          </button>
        </div>
      </div>
    </div>
  );
};
