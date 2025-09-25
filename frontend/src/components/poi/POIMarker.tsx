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
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
      ">
        ${icon}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
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
          maxWidth={300}
          minWidth={250}
          className="poi-popup"
          closeButton={true}
          autoClose={false}
          keepInView={true}
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
        background-color: ${getClusterColor()};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        color: white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        cursor: pointer;
      ">
        ${pois.length}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });

  return (
    <Marker
      position={position}
      icon={clusterIcon}
      eventHandlers={{
        click: handleClusterClick,
      }}
    >
      <Popup maxWidth={400} minWidth={300}>
        <div className="poi-cluster-popup">
          <h3 className="font-semibold text-lg mb-3">
            {pois.length} POI{pois.length > 1 ? 's' : ''} trouvé{pois.length > 1 ? 's' : ''}
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
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
