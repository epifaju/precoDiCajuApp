import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './PriceMap.css';
import { PriceDTO } from '../../types/api';
import { PriceMarker } from './PriceMarker';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';

// Fix pour les icônes Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface PriceMapProps {
  prices: PriceDTO[];
  isLoading?: boolean;
  className?: string;
}

// Composant pour centrer la carte sur la Guinée-Bissau
const MapCenter: React.FC = () => {
  const map = useMap();
  
  useEffect(() => {
    // Centrer sur la Guinée-Bissau
    map.setView([11.8037, -15.1804], 8);
  }, [map]);
  
  return null;
};

// Composant pour gérer le clustering des marqueurs
const ClusteredMarkers: React.FC<{ prices: PriceDTO[] }> = ({ prices }) => {
  const { t } = useTranslation();
  
  // Filtrer les prix avec coordonnées GPS
  const pricesWithGPS = useMemo(() => 
    prices.filter(price => price.gpsLat && price.gpsLng), 
    [prices]
  );

  if (pricesWithGPS.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800 z-10">
        <div className="text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-2">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {t('map.noGpsData', 'No GPS data available for the selected prices')}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            {t('map.addGps', 'Add GPS coordinates when submitting prices to see them on the map')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {pricesWithGPS.map((price) => (
        <PriceMarker key={price.id} price={price} />
      ))}
    </>
  );
};

export const PriceMap: React.FC<PriceMapProps> = ({ 
  prices, 
  isLoading = false, 
  className 
}) => {
  const { t } = useTranslation();
  const [mapKey, setMapKey] = useState(0);

  // Recharger la carte quand les données changent
  useEffect(() => {
    setMapKey(prev => prev + 1);
  }, [prices]);

  // Calculer les limites de la carte basées sur les prix
  const mapBounds = useMemo(() => {
    const pricesWithGPS = prices.filter(price => price.gpsLat && price.gpsLng);
    
    if (pricesWithGPS.length === 0) {
      // Limites par défaut pour la Guinée-Bissau
      return {
        north: 12.5,
        south: 10.8,
        east: -13.6,
        west: -16.8
      };
    }

    const lats = pricesWithGPS.map(p => p.gpsLat!);
    const lngs = pricesWithGPS.map(p => p.gpsLng!);
    
    return {
      north: Math.max(...lats) + 0.1,
      south: Math.min(...lats) - 0.1,
      east: Math.max(...lngs) + 0.1,
      west: Math.min(...lngs) - 0.1
    };
  }, [prices]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{t('map.loading', 'Loading Map...')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t('map.title', 'Price Map')}</CardTitle>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              {t('map.verified', 'Verified')}
            </span>
            <span className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              {t('map.unverified', 'Unverified')}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <MapContainer
              key={mapKey}
              center={[11.8037, -15.1804]}
              zoom={8}
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}
              scrollWheelZoom={true}
              doubleClickZoom={true}
              attributionControl={true}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              <MapCenter />
              <ClusteredMarkers prices={prices} />
            </MapContainer>
          </div>
          
          {/* Statistiques de la carte */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {prices.filter(p => p.gpsLat && p.gpsLng).length}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {t('map.pricesWithGps', 'Prices with GPS')}
              </div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {prices.filter(p => p.verified && p.gpsLat && p.gpsLng).length}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {t('map.verifiedPrices', 'Verified Prices')}
              </div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(prices.filter(p => p.gpsLat && p.gpsLng).map(p => p.region)).size}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {t('map.regionsCovered', 'Regions Covered')}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
