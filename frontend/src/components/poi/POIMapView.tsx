import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { POI, POIType, POIMapBounds, GUINEA_BISSAU_BOUNDS } from '../../types/poi';
import { POIMarker, POIClusterMarker, POILegend } from './POIMarker';
import { POIDetails } from './POIDetails';

// Fix for default markers in react-leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface POIMapViewProps {
  className?: string;
  height?: string;
  pois?: POI[];
  isLoading?: boolean;
  error?: Error | null;
  selectedTypes?: POIType[];
  searchTerm?: string;
  onPOIClick?: (poi: POI) => void;
  onMapBoundsChange?: (bounds: POIMapBounds) => void;
  showLegend?: boolean;
  showControls?: boolean;
}

// Component to handle map events
const MapEvents: React.FC<{
  onBoundsChange: (bounds: POIMapBounds) => void;
}> = ({ onBoundsChange }) => {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      onBoundsChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    },
    zoomend: () => {
      const bounds = map.getBounds();
      onBoundsChange({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    },
  });

  return null;
};

export const POIMapView: React.FC<POIMapViewProps> = ({
  className = '',
  height = '500px',
  pois = [],
  isLoading = false,
  error = null,
  selectedTypes = [],
  searchTerm = '',
  onPOIClick,
  onMapBoundsChange,
  showLegend = true,
  showControls = true,
}) => {
  const { t } = useTranslation();
  const [mapBounds, setMapBounds] = useState<POIMapBounds>(GUINEA_BISSAU_BOUNDS);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);

  // Use the POIs passed as props (already filtered by parent component)
  const filteredPOIs = pois;

  // Group nearby POIs for clustering
  const clusteredPOIs = useMemo(() => {
    const clusters: { [key: string]: POI[] } = {};
    const CLUSTER_DISTANCE = 0.001; // ~100m in degrees

    filteredPOIs.forEach(poi => {
      const clusterKey = `${Math.round(poi.latitude / CLUSTER_DISTANCE)}_${Math.round(poi.longitude / CLUSTER_DISTANCE)}`;
      
      if (!clusters[clusterKey]) {
        clusters[clusterKey] = [];
      }
      clusters[clusterKey].push(poi);
    });

    return clusters;
  }, [filteredPOIs]);

  // Handle POI click
  const handlePOIClick = (poi: POI) => {
    setSelectedPOI(poi);
    if (onPOIClick) {
      onPOIClick(poi);
    }
  };

  // Handle cluster click
  const handleClusterClick = (clusterPOIs: POI[]) => {
    // For now, just show the first POI in the cluster
    if (clusterPOIs.length > 0) {
      handlePOIClick(clusterPOIs[0]);
    }
  };

  // Handle map bounds change
  const handleBoundsChange = (bounds: POIMapBounds) => {
    setMapBounds(bounds);
    if (onMapBoundsChange) {
      onMapBoundsChange(bounds);
    }
  };

  // Center of Guinea-Bissau
  const center: [number, number] = [11.8, -15.2];

  if (error) {
    return (
      <div className={`poi-map-error ${className}`} style={{ height }}>
        <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Erreur de chargement de la carte
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Impossible de charger les points d'intérêt. Veuillez réessayer.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`poi-map-container ${className}`}>
      {/* Map */}
      <div className="relative" style={{ height }}>
        <MapContainer
          center={center}
          zoom={8}
          style={{ height: '100%', width: '100%' }}
          zoomControl={showControls}
          attributionControl={true}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          dragging={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Map Events Handler */}
          <MapEvents onBoundsChange={handleBoundsChange} />
          
          {/* POI Markers */}
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-[1000]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Chargement des POI...</p>
              </div>
            </div>
          ) : (
            Object.entries(clusteredPOIs).map(([clusterKey, clusterPOIs]) => {
              if (clusterPOIs.length === 1) {
                // Single POI
                return (
                  <POIMarker
                    key={clusterPOIs[0].id}
                    poi={clusterPOIs[0]}
                    onPOIClick={handlePOIClick}
                  />
                );
              } else {
                // Multiple POIs - show cluster
                const avgLat = clusterPOIs.reduce((sum, poi) => sum + poi.latitude, 0) / clusterPOIs.length;
                const avgLng = clusterPOIs.reduce((sum, poi) => sum + poi.longitude, 0) / clusterPOIs.length;
                
                return (
                  <POIClusterMarker
                    key={clusterKey}
                    pois={clusterPOIs}
                    position={[avgLat, avgLng]}
                    onClusterClick={handleClusterClick}
                  />
                );
              }
            })
          )}
        </MapContainer>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Chargement des POI...
              </span>
            </div>
          </div>
        )}

        {/* Statistics Overlay */}
        {!isLoading && (
          <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-700">
            <div className="text-sm">
              <div className="font-medium text-gray-900 dark:text-white mb-1">
                {filteredPOIs.length} POI{filteredPOIs.length > 1 ? 's' : ''}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {selectedTypes.length > 0 && selectedTypes.length < 3 && (
                  <span>Filtré par type</span>
                )}
                {searchTerm && (
                  <span>Recherche: "{searchTerm}"</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        {showLegend && (
          <div className="absolute bottom-4 left-4">
            <POILegend />
          </div>
        )}
      </div>

      {/* Selected POI Details Panel */}
      {selectedPOI && (
        <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('poi.details')}
            </h3>
            <button
              onClick={() => setSelectedPOI(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <POIDetails poi={selectedPOI} />
        </div>
      )}
    </div>
  );
};
