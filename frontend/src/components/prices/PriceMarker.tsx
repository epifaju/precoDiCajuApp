import React from 'react';
import { useTranslation } from 'react-i18next';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { PriceDTO } from '../../types/api';

interface PriceMarkerProps {
  price: PriceDTO;
}

// Icônes personnalisées pour les marqueurs
const createCustomIcon = (isVerified: boolean, quality: string) => {
  const color = isVerified ? '#10B981' : '#F59E0B'; // Vert pour vérifié, jaune pour non vérifié
  
  // Taille de l'icône basée sur la qualité
  const size = quality.includes('W180') || quality.includes('W210') ? 25 : 20;
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${size * 0.4}px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
      ">
        ${quality.charAt(0)}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

export const PriceMarker: React.FC<PriceMarkerProps> = ({ price }) => {
  const { t } = useTranslation();
  
  if (!price.gpsLat || !price.gpsLng) {
    return null;
  }

  const icon = createCustomIcon(price.verified, price.quality);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-GW', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value).replace('FCFA', 'FCFA');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-GW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getQualityColor = (quality: string) => {
    if (quality.includes('W180') || quality.includes('W210')) return 'text-blue-600';
    if (quality.includes('W240') || quality.includes('W320')) return 'text-green-600';
    if (quality.includes('LP') || quality.includes('SP')) return 'text-purple-600';
    return 'text-gray-600';
  };

  return (
    <Marker
      position={[price.gpsLat, price.gpsLng]}
      icon={icon}
    >
      <Popup className="price-popup">
        <div className="min-w-64 p-2">
          {/* En-tête avec prix et statut */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-xl font-bold text-gray-900">
                {formatCurrency(price.priceFcfa)}
              </div>
              <div className="text-sm text-gray-600">
                {t('map.perKg', 'per kg')}
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              {price.verified && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-1">
                  ✓ {t('map.verified', 'Verified')}
                </span>
              )}
              <div className={`text-sm font-medium ${getQualityColor(price.quality)}`}>
                {price.qualityName}
              </div>
            </div>
          </div>

          {/* Informations de localisation */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center text-sm text-gray-700">
              <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span className="font-medium">{price.regionName}</span>
            </div>
            
            {price.sourceName && (
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>{price.sourceName}</span>
              </div>
            )}
            
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{t('map.recordedOn', 'Recorded on')} {formatDate(price.recordedDate)}</span>
            </div>
          </div>

          {/* Photo si disponible */}
          {price.photoUrl && (
            <div className="mb-3">
              <img 
                src={price.photoUrl} 
                alt={t('map.priceEvidence', 'Price evidence')}
                className="w-full h-24 object-cover rounded-md border border-gray-200"
              />
            </div>
          )}

          {/* Notes si disponibles */}
          {price.notes && (
            <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-700 dark:text-gray-300 italic">
              "{price.notes}"
            </div>
          )}

          {/* Informations GPS */}
          <div className="text-xs text-gray-500 border-t pt-2">
            <div>GPS: {price.gpsLat.toFixed(6)}, {price.gpsLng.toFixed(6)}</div>
            {price.createdBy && (
              <div>{t('map.submittedBy', 'Submitted by')}: {price.createdBy.fullName}</div>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};
