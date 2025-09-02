import { GpsCoordinates } from '../../types/api';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number; // 0-100
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'invalid';
}

export interface ValidationOptions {
  minAccuracy?: number;
  maxAge?: number;
  requireAccuracy?: boolean;
  strictBounds?: boolean;
  allowOffline?: boolean;
  customBounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

// Limites de la Guinée-Bissau (plus précises)
const GUINEA_BISSAU_BOUNDS = {
  north: 12.6860,
  south: 10.8640,
  east: -13.6330,
  west: -16.7170,
};

// Limites étendues pour validation moins stricte
const GUINEA_BISSAU_EXTENDED_BOUNDS = {
  north: 12.8,
  south: 10.7,
  east: -13.5,
  west: -16.8,
};

// Seuils de qualité
const QUALITY_THRESHOLDS = {
  excellent: { accuracy: 10, score: 90 },
  good: { accuracy: 50, score: 75 },
  fair: { accuracy: 100, score: 60 },
  poor: { accuracy: 500, score: 40 },
  invalid: { accuracy: Infinity, score: 0 },
};

/**
 * Valide les coordonnées GPS avec des critères avancés
 */
export function validateGpsCoordinates(
  coordinates: GpsCoordinates,
  options: ValidationOptions = {}
): ValidationResult {
  const {
    minAccuracy = 100,
    maxAge = 300000, // 5 minutes
    requireAccuracy = true,
    strictBounds = true,
    allowOffline = false,
    customBounds,
  } = options;

  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // Validation des coordonnées de base
  if (!coordinates || typeof coordinates.latitude !== 'number' || typeof coordinates.longitude !== 'number') {
    errors.push('Coordonnées GPS invalides');
    return { isValid: false, errors, warnings, score: 0, quality: 'invalid' };
  }

  const { latitude, longitude, accuracy, timestamp } = coordinates;

  // Validation de la latitude
  if (latitude < -90 || latitude > 90) {
    errors.push('Latitude invalide (doit être entre -90 et 90)');
    score -= 50;
  }

  // Validation de la longitude
  if (longitude < -180 || longitude > 180) {
    errors.push('Longitude invalide (doit être entre -180 et 180)');
    score -= 50;
  }

  // Validation de l'âge des données
  if (timestamp) {
    const age = Date.now() - timestamp;
    if (age > maxAge) {
      errors.push(`Données GPS trop anciennes (${Math.round(age / 1000)}s)`);
      score -= 30;
    } else if (age > maxAge / 2) {
      warnings.push(`Données GPS anciennes (${Math.round(age / 1000)}s)`);
      score -= 10;
    }
  }

  // Validation de la précision
  if (requireAccuracy && accuracy !== undefined) {
    if (accuracy > minAccuracy) {
      errors.push(`Précision insuffisante (${Math.round(accuracy)}m > ${minAccuracy}m)`);
      score -= 40;
    } else if (accuracy > minAccuracy / 2) {
      warnings.push(`Précision faible (${Math.round(accuracy)}m)`);
      score -= 15;
    }
  }

  // Validation des limites géographiques
  const bounds = customBounds || (strictBounds ? GUINEA_BISSAU_BOUNDS : GUINEA_BISSAU_EXTENDED_BOUNDS);
  
  if (latitude < bounds.south || latitude > bounds.north) {
    errors.push('Latitude hors des limites de la Guinée-Bissau');
    score -= 50;
  }

  if (longitude < bounds.west || longitude > bounds.east) {
    errors.push('Longitude hors des limites de la Guinée-Bissau');
    score -= 50;
  }

  // Validation de la cohérence des coordonnées
  if (isValidCoordinates(latitude, longitude)) {
    const distanceFromCenter = calculateDistanceFromCenter(latitude, longitude);
    if (distanceFromCenter > 200) { // Plus de 200km du centre
      warnings.push('Coordonnées éloignées du centre de la Guinée-Bissau');
      score -= 10;
    }
  }

  // Détermination de la qualité
  const quality = determineQuality(accuracy, score);

  // Validation finale
  const isValid = errors.length === 0 && score >= 50;

  return {
    isValid,
    errors,
    warnings,
    score: Math.max(0, Math.min(100, score)),
    quality,
  };
}

/**
 * Vérifie si les coordonnées sont valides
 */
export function isValidCoordinates(latitude: number, longitude: number): boolean {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    isFinite(latitude) &&
    isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/**
 * Vérifie si les coordonnées sont dans les limites de la Guinée-Bissau
 */
export function isWithinGuineaBissau(
  latitude: number,
  longitude: number,
  strict: boolean = true
): boolean {
  const bounds = strict ? GUINEA_BISSAU_BOUNDS : GUINEA_BISSAU_EXTENDED_BOUNDS;
  
  return (
    latitude >= bounds.south &&
    latitude <= bounds.north &&
    longitude >= bounds.west &&
    longitude <= bounds.east
  );
}

/**
 * Calcule la distance depuis le centre de la Guinée-Bissau
 */
export function calculateDistanceFromCenter(latitude: number, longitude: number): number {
  const centerLat = 11.8037;
  const centerLng = -15.1804;
  
  return calculateDistance(
    { latitude: centerLat, longitude: centerLng },
    { latitude, longitude }
  );
}

/**
 * Calcule la distance entre deux points en kilomètres
 */
export function calculateDistance(point1: GpsCoordinates, point2: GpsCoordinates): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRadians(point2.latitude - point1.latitude);
  const dLng = toRadians(point2.longitude - point1.longitude);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.latitude)) * Math.cos(toRadians(point2.latitude)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

/**
 * Convertit les degrés en radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Détermine la qualité basée sur la précision et le score
 */
function determineQuality(accuracy: number | undefined, score: number): 'excellent' | 'good' | 'fair' | 'poor' | 'invalid' {
  if (score < 50) return 'invalid';
  
  if (accuracy === undefined) {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    return 'poor';
  }

  if (accuracy <= QUALITY_THRESHOLDS.excellent.accuracy) return 'excellent';
  if (accuracy <= QUALITY_THRESHOLDS.good.accuracy) return 'good';
  if (accuracy <= QUALITY_THRESHOLDS.fair.accuracy) return 'fair';
  if (accuracy <= QUALITY_THRESHOLDS.poor.accuracy) return 'poor';
  
  return 'invalid';
}

/**
 * Valide un ensemble de coordonnées GPS
 */
export function validateGpsCoordinatesBatch(
  coordinates: GpsCoordinates[],
  options: ValidationOptions = {}
): ValidationResult[] {
  return coordinates.map(coord => validateGpsCoordinates(coord, options));
}

/**
 * Filtre les coordonnées valides
 */
export function filterValidCoordinates(
  coordinates: GpsCoordinates[],
  options: ValidationOptions = {}
): GpsCoordinates[] {
  return coordinates.filter(coord => {
    const result = validateGpsCoordinates(coord, options);
    return result.isValid;
  });
}

/**
 * Trouve les coordonnées les plus précises
 */
export function findMostAccurateCoordinates(
  coordinates: GpsCoordinates[],
  options: ValidationOptions = {}
): GpsCoordinates | null {
  const validCoords = filterValidCoordinates(coordinates, options);
  
  if (validCoords.length === 0) return null;
  
  return validCoords.reduce((best, current) => {
    const bestAccuracy = best.accuracy || Infinity;
    const currentAccuracy = current.accuracy || Infinity;
    
    return currentAccuracy < bestAccuracy ? current : best;
  });
}

/**
 * Calcule la moyenne des coordonnées (pour améliorer la précision)
 */
export function averageCoordinates(coordinates: GpsCoordinates[]): GpsCoordinates | null {
  if (coordinates.length === 0) return null;
  
  const validCoords = coordinates.filter(coord => isValidCoordinates(coord.latitude, coord.longitude));
  
  if (validCoords.length === 0) return null;
  
  const sumLat = validCoords.reduce((sum, coord) => sum + coord.latitude, 0);
  const sumLng = validCoords.reduce((sum, coord) => sum + coord.longitude, 0);
  const avgLat = sumLat / validCoords.length;
  const avgLng = sumLng / validCoords.length;
  
  // Calculer la précision moyenne pondérée
  const totalWeight = validCoords.reduce((sum, coord) => {
    const accuracy = coord.accuracy || 100;
    return sum + (1 / accuracy);
  }, 0);
  
  const weightedAccuracy = validCoords.reduce((sum, coord) => {
    const accuracy = coord.accuracy || 100;
    const weight = 1 / accuracy;
    return sum + (accuracy * weight);
  }, 0) / totalWeight;
  
  return {
    latitude: Number(avgLat.toFixed(6)),
    longitude: Number(avgLng.toFixed(6)),
    accuracy: Number(weightedAccuracy.toFixed(1)),
    timestamp: Date.now(),
  };
}

/**
 * Détecte les coordonnées aberrantes
 */
export function detectOutliers(coordinates: GpsCoordinates[]): GpsCoordinates[] {
  if (coordinates.length < 3) return [];
  
  const validCoords = coordinates.filter(coord => isValidCoordinates(coord.latitude, coord.longitude));
  
  if (validCoords.length < 3) return [];
  
  // Calculer la distance moyenne entre tous les points
  const distances: number[] = [];
  for (let i = 0; i < validCoords.length; i++) {
    for (let j = i + 1; j < validCoords.length; j++) {
      distances.push(calculateDistance(validCoords[i], validCoords[j]));
    }
  }
  
  const avgDistance = distances.reduce((sum, dist) => sum + dist, 0) / distances.length;
  const threshold = avgDistance * 2; // Seuil de 2x la distance moyenne
  
  // Identifier les points aberrants
  const outliers: GpsCoordinates[] = [];
  
  for (const coord of validCoords) {
    const distancesFromPoint = validCoords
      .filter(c => c !== coord)
      .map(c => calculateDistance(coord, c));
    
    const avgDistanceFromPoint = distancesFromPoint.reduce((sum, dist) => sum + dist, 0) / distancesFromPoint.length;
    
    if (avgDistanceFromPoint > threshold) {
      outliers.push(coord);
    }
  }
  
  return outliers;
}

/**
 * Améliore la précision en filtrant les coordonnées aberrantes
 */
export function improveAccuracy(coordinates: GpsCoordinates[]): GpsCoordinates[] {
  if (coordinates.length < 3) return coordinates;
  
  const outliers = detectOutliers(coordinates);
  const filteredCoords = coordinates.filter(coord => !outliers.includes(coord));
  
  return filteredCoords.length > 0 ? filteredCoords : coordinates;
}
