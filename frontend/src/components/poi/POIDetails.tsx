import React from 'react';
import { useTranslation } from 'react-i18next';
import { POI, POI_TYPE_CONFIG } from '../../types/poi';

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
  // Normalize POI type from backend (uppercase) to frontend config keys (lowercase)
  const poiTypeLower = poi.type.toLowerCase();
  const config = POI_TYPE_CONFIG[poiTypeLower as keyof typeof POI_TYPE_CONFIG];

  const handleCallClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (poi.callUrl) {
      window.location.href = poi.callUrl;
    }
  };

  if (compact) {
    return (
      <div className="poi-details-compact border-b border-gray-100 dark:border-gray-700 pb-2 mb-2 last:border-b-0 last:pb-0 last:mb-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {poi.nom}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {config.icon}
              </span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {config.label}
            </div>
            {poi.telephone && showCallButton && (
              <a
                href={poi.callUrl}
                onClick={handleCallClick}
                className="inline-flex items-center text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-1"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {poi.formattedPhone || poi.telephone}
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="poi-details">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
            {poi.nom}
          </h3>
          <div className="flex items-center space-x-1 ml-2">
            <span className="text-lg">{config.icon}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span 
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
            style={{ 
              backgroundColor: `${config.color}20`,
              color: config.color 
            }}
          >
            {config.label}
          </span>
        </div>
      </div>

      {/* Location */}
      <div className="mb-3">
        <div className="flex items-start space-x-2">
          <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {poi.latitude.toFixed(6)}, {poi.longitude.toFixed(6)}
            </div>
            {poi.adresse && (
              <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                {poi.adresse}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Phone */}
      {poi.telephone && (
        <div className="mb-3">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {poi.formattedPhone || poi.telephone}
            </span>
          </div>
          {showCallButton && (
            <a
              href={poi.callUrl}
              onClick={handleCallClick}
              className="inline-flex items-center mt-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {t('poi.call', 'Appeler')}
            </a>
          )}
        </div>
      )}

      {/* Hours */}
      {poi.horaires && (
        <div className="mb-3">
          <div className="flex items-start space-x-2">
            <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('poi.hours', 'Horaires')}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {poi.horaires}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {t('poi.lastUpdated', 'Mis à jour')}: {new Date(poi.updatedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

// Compact POI card for lists
export const POICard: React.FC<POIDetailsProps> = ({ poi, showCallButton = true }) => {
  const { t } = useTranslation();
  // Normalize POI type from backend (uppercase) to frontend config keys (lowercase)
  const poiTypeLower = poi.type.toLowerCase();
  const config = POI_TYPE_CONFIG[poiTypeLower as keyof typeof POI_TYPE_CONFIG];

  const handleCallClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (poi.callUrl) {
      window.location.href = poi.callUrl;
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
              {config.label}
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
      </div>
    </div>
  );
};
