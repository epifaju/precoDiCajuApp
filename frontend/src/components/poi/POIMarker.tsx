import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { POI, POI_TYPE_CONFIG } from '../../types/poi';
import { POIDetails } from './POIDetails';

// Create custom icons for different POI types
const createCustomIcon = (color: string, icon: string) => {
  return L.divIcon({
    className: 'custom-poi-marker',
    html: `
      <div style="
        background: linear-gradient(135deg, ${color}, ${color}dd);
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1);
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
      ">
        ${icon}
        <div style="
          position: absolute;
          top: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        "></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

// Icon cache to avoid recreating icons
const iconCache = new Map<string, L.DivIcon>();

const getPOIIcon = (poi: POI): L.DivIcon => {
  const cacheKey = `${poi.type}-${poi.markerColor}`;
  
  if (!iconCache.has(cacheKey)) {
    // Normalize POI type from backend (uppercase) to frontend config keys (lowercase)
    const poiTypeLower = poi.type.toLowerCase();
    const config = POI_TYPE_CONFIG[poiTypeLower as keyof typeof POI_TYPE_CONFIG];
    const icon = createCustomIcon(
      poi.markerColor || config.color,
      poi.markerIcon || config.icon
    );
    iconCache.set(cacheKey, icon);
  }
  
  return iconCache.get(cacheKey)!;
};

interface POIMarkerProps {
  poi: POI;
  onPOIClick?: (poi: POI) => void;
  showPopup?: boolean;
}

export const POIMarker: React.FC<POIMarkerProps> = ({ 
  poi, 
  onPOIClick,
  showPopup = true 
}) => {
  const handleMarkerClick = () => {
    if (onPOIClick) {
      onPOIClick(poi);
    }
  };

  const markerIcon = getPOIIcon(poi);

  return (
    <Marker
      position={[poi.latitude, poi.longitude]}
      icon={markerIcon}
      eventHandlers={{
        click: handleMarkerClick,
      }}
    >
      {showPopup && (
        <Popup
          maxWidth={350}
          minWidth={280}
          className="poi-popup"
          closeButton={true}
          autoClose={true}
          keepInView={true}
          offset={[0, -10]}
        >
          <POIDetails poi={poi} />
        </Popup>
      )}
    </Marker>
  );
};

// Cluster marker for multiple POIs at the same location
interface POIClusterMarkerProps {
  pois: POI[];
  position: [number, number];
  onClusterClick?: (pois: POI[]) => void;
}

export const POIClusterMarker: React.FC<POIClusterMarkerProps> = ({ 
  pois, 
  position,
  onClusterClick 
}) => {
  const handleClusterClick = () => {
    if (onClusterClick) {
      onClusterClick(pois);
    }
  };

  // Determine cluster color based on POI types
  const getClusterColor = () => {
    const types = new Set(pois.map(p => p.type));
    if (types.size > 1) {
      return '#6366f1'; // Mixed colors - purple
    }
    // Normalize POI type from backend (uppercase) to frontend config keys (lowercase)
    const type = pois[0].type.toLowerCase();
    return POI_TYPE_CONFIG[type as keyof typeof POI_TYPE_CONFIG].color;
  };

  const clusterIcon = L.divIcon({
    className: 'custom-cluster-marker',
    html: `
      <div style="
        background: linear-gradient(135deg, ${getClusterColor()}, ${getClusterColor()}cc);
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 4px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: bold;
        color: white;
        box-shadow: 0 6px 20px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.1);
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
      ">
        ${pois.length}
        <div style="
          position: absolute;
          top: -3px;
          right: -3px;
          width: 10px;
          height: 10px;
          background: #f59e0b;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        "></div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });

  return (
    <Marker
      position={position}
      icon={clusterIcon}
      eventHandlers={{
        click: handleClusterClick,
      }}
    >
      <Popup maxWidth={450} minWidth={350} className="poi-popup">
        <div className="poi-cluster-popup bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg">
            <h3 className="font-bold text-lg mb-1">
              {pois.length} POI{pois.length > 1 ? 's' : ''} trouvé{pois.length > 1 ? 's' : ''}
            </h3>
            <p className="text-sm opacity-90">Sélectionnez un point d'intérêt</p>
          </div>
          <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
            {pois.map((poi) => (
              <POIDetails key={poi.id} poi={poi} compact={true} />
            ))}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

// Legend component for POI types
export const POILegend: React.FC = () => {
  return (
    <div className="poi-legend bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="font-semibold text-sm mb-3 text-gray-900 dark:text-white">
        Types de POI
      </h3>
      <div className="space-y-2">
        {Object.entries(POI_TYPE_CONFIG).map(([type, config]) => (
          <div key={type} className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded-full border border-white shadow-sm"
              style={{ backgroundColor: config.color }}
            />
            <span className="text-xs text-gray-700 dark:text-gray-300">
              {config.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
