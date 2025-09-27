export interface POI {
  id: string;
  nom: string;
  type: POIType;
  latitude: number;
  longitude: number;
  telephone?: string;
  adresse?: string;
  horaires?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  
  // Computed fields
  formattedPhone?: string;
  callUrl?: string;
  displayType?: string;
  markerColor?: string;
  markerIcon?: string;
}

export type POIType = 'acheteur' | 'cooperative' | 'entrepot';

export interface POIStatistics {
  totalCount: number;
  acheteurCount: number;
  cooperativeCount: number;
  entrepotCount: number;
}

export interface CreatePOIRequest {
  nom: string;
  type: POIType;
  latitude: number;
  longitude: number;
  telephone?: string;
  adresse?: string;
  horaires?: string;
}

export interface UpdatePOIRequest {
  nom?: string;
  type?: POIType;
  latitude?: number;
  longitude?: number;
  telephone?: string;
  adresse?: string;
  horaires?: string;
  active?: boolean;
}

export interface POIFilters {
  type?: POIType;
  search?: string;
  minLat?: number;
  maxLat?: number;
  minLng?: number;
  maxLng?: number;
  lat?: number;
  lng?: number;
  radius?: number;
}

export interface POIMapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// POI Type configurations
export const POI_TYPE_CONFIG = {
  acheteur: {
    labelKey: 'poi.types.acheteur',
    color: '#22c55e',
    icon: '🟢',
    descriptionKey: 'poi.typeDescriptions.acheteur'
  },
  cooperative: {
    labelKey: 'poi.types.cooperative',
    color: '#3b82f6',
    icon: '🔵',
    descriptionKey: 'poi.typeDescriptions.cooperative'
  },
  entrepot: {
    labelKey: 'poi.types.entrepot',
    color: '#f97316',
    icon: '🟠',
    descriptionKey: 'poi.typeDescriptions.entrepot'
  }
} as const;

// Guinea-Bissau bounds for validation
export const GUINEA_BISSAU_BOUNDS: POIMapBounds = {
  north: 12.7,
  south: 10.7,
  east: -13.6,
  west: -16.8
};
