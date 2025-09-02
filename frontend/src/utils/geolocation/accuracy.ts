import { GpsCoordinates } from '../../types/api';

export interface AccuracyMetrics {
  horizontalAccuracy: number;
  verticalAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
  source: 'gps' | 'network' | 'passive' | 'unknown';
  satellites?: number;
  hdop?: number; // Horizontal Dilution of Precision
  vdop?: number; // Vertical Dilution of Precision
}

export interface AccuracyImprovement {
  original: GpsCoordinates;
  improved: GpsCoordinates;
  improvement: number; // Pourcentage d'amélioration
  method: 'averaging' | 'filtering' | 'weighted' | 'kalman';
  confidence: number; // 0-1
}

export interface AccuracyOptions {
  minSatellites?: number;
  maxHdop?: number;
  maxVdop?: number;
  minAccuracy?: number;
  maxAge?: number;
  enableFiltering?: boolean;
  enableAveraging?: boolean;
  enableKalman?: boolean;
}

// Configuration par défaut
const DEFAULT_OPTIONS: Required<AccuracyOptions> = {
  minSatellites: 4,
  maxHdop: 5.0,
  maxVdop: 5.0,
  minAccuracy: 100,
  maxAge: 300000, // 5 minutes
  enableFiltering: true,
  enableAveraging: true,
  enableKalman: false,
};

/**
 * Évalue la qualité d'une position GPS
 */
export function evaluateGpsQuality(
  coordinates: GpsCoordinates,
  metrics?: AccuracyMetrics,
  options: AccuracyOptions = {}
): {
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'invalid';
  score: number;
  factors: string[];
} {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const factors: string[] = [];
  let score = 100;

  // Vérifier l'âge des données
  if (coordinates.timestamp) {
    const age = Date.now() - coordinates.timestamp;
    if (age > opts.maxAge) {
      factors.push('Données trop anciennes');
      score -= 40;
    } else if (age > opts.maxAge / 2) {
      factors.push('Données anciennes');
      score -= 20;
    }
  }

  // Vérifier la précision horizontale
  if (coordinates.accuracy !== undefined) {
    if (coordinates.accuracy > opts.minAccuracy) {
      factors.push('Précision insuffisante');
      score -= 50;
    } else if (coordinates.accuracy > opts.minAccuracy / 2) {
      factors.push('Précision faible');
      score -= 25;
    }
  }

  // Vérifier les métriques avancées si disponibles
  if (metrics) {
    // Vérifier le nombre de satellites
    if (metrics.satellites !== undefined) {
      if (metrics.satellites < opts.minSatellites) {
        factors.push('Nombre de satellites insuffisant');
        score -= 30;
      } else if (metrics.satellites < opts.minSatellites + 2) {
        factors.push('Nombre de satellites faible');
        score -= 15;
      }
    }

    // Vérifier le HDOP
    if (metrics.hdop !== undefined) {
      if (metrics.hdop > opts.maxHdop) {
        factors.push('HDOP élevé');
        score -= 25;
      } else if (metrics.hdop > opts.maxHdop / 2) {
        factors.push('HDOP modéré');
        score -= 10;
      }
    }

    // Vérifier le VDOP
    if (metrics.vdop !== undefined) {
      if (metrics.vdop > opts.maxVdop) {
        factors.push('VDOP élevé');
        score -= 20;
      } else if (metrics.vdop > opts.maxVdop / 2) {
        factors.push('VDOP modéré');
        score -= 8;
      }
    }

    // Vérifier la source
    if (metrics.source === 'network') {
      factors.push('Source réseau (moins précis)');
      score -= 20;
    } else if (metrics.source === 'passive') {
      factors.push('Source passive (moins précis)');
      score -= 30;
    }
  }

  // Déterminer la qualité
  let quality: 'excellent' | 'good' | 'fair' | 'poor' | 'invalid';
  if (score >= 90) quality = 'excellent';
  else if (score >= 75) quality = 'good';
  else if (score >= 60) quality = 'fair';
  else if (score >= 40) quality = 'poor';
  else quality = 'invalid';

  return { quality, score: Math.max(0, score), factors };
}

/**
 * Améliore la précision en moyennant plusieurs positions
 */
export function improveAccuracyByAveraging(
  coordinates: GpsCoordinates[],
  options: AccuracyOptions = {}
): AccuracyImprovement | null {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  if (coordinates.length < 2) return null;

  // Filtrer les coordonnées valides
  const validCoords = coordinates.filter(coord => 
    coord.accuracy !== undefined && 
    coord.accuracy <= opts.minAccuracy * 2
  );

  if (validCoords.length < 2) return null;

  // Calculer la moyenne pondérée par la précision
  let totalWeight = 0;
  let weightedLat = 0;
  let weightedLng = 0;
  let totalAccuracy = 0;

  for (const coord of validCoords) {
    const weight = 1 / (coord.accuracy || 100);
    totalWeight += weight;
    weightedLat += coord.latitude * weight;
    weightedLng += coord.longitude * weight;
    totalAccuracy += coord.accuracy || 100;
  }

  const improvedLat = weightedLat / totalWeight;
  const improvedLng = weightedLng / totalWeight;
  const improvedAccuracy = totalAccuracy / validCoords.length * 0.8; // Amélioration de 20%

  const original = coordinates[0];
  const improved: GpsCoordinates = {
    latitude: Number(improvedLat.toFixed(6)),
    longitude: Number(improvedLng.toFixed(6)),
    accuracy: Number(improvedAccuracy.toFixed(1)),
    timestamp: Date.now(),
  };

  const improvement = ((original.accuracy || 100) - improvedAccuracy) / (original.accuracy || 100) * 100;

  return {
    original,
    improved,
    improvement: Math.max(0, improvement),
    method: 'averaging',
    confidence: Math.min(1, validCoords.length / 5), // Plus de points = plus de confiance
  };
}

/**
 * Filtre les coordonnées aberrantes
 */
export function filterOutliers(
  coordinates: GpsCoordinates[],
  options: AccuracyOptions = {}
): GpsCoordinates[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  if (coordinates.length < 3) return coordinates;

  // Calculer la distance moyenne entre tous les points
  const distances: number[] = [];
  for (let i = 0; i < coordinates.length; i++) {
    for (let j = i + 1; j < coordinates.length; j++) {
      distances.push(calculateDistance(coordinates[i], coordinates[j]));
    }
  }

  const avgDistance = distances.reduce((sum, dist) => sum + dist, 0) / distances.length;
  const stdDev = Math.sqrt(
    distances.reduce((sum, dist) => sum + Math.pow(dist - avgDistance, 2), 0) / distances.length
  );

  const threshold = avgDistance + 2 * stdDev; // Seuil à 2 écarts-types

  // Filtrer les points aberrants
  return coordinates.filter(coord => {
    const distancesFromPoint = coordinates
      .filter(c => c !== coord)
      .map(c => calculateDistance(coord, c));

    const avgDistanceFromPoint = distancesFromPoint.reduce((sum, dist) => sum + dist, 0) / distancesFromPoint.length;
    
    return avgDistanceFromPoint <= threshold;
  });
}

/**
 * Applique un filtre de Kalman simple pour améliorer la précision
 */
export function applyKalmanFilter(
  coordinates: GpsCoordinates[],
  options: AccuracyOptions = {}
): GpsCoordinates[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  if (coordinates.length < 2) return coordinates;

  const filtered: GpsCoordinates[] = [coordinates[0]];

  for (let i = 1; i < coordinates.length; i++) {
    const current = coordinates[i];
    const previous = filtered[i - 1];

    // Paramètres du filtre de Kalman
    const processNoise = 0.1; // Bruit du processus
    const measurementNoise = current.accuracy || 100; // Bruit de mesure

    // Prédiction
    const predictedLat = previous.latitude;
    const predictedLng = previous.longitude;
    const predictedAccuracy = previous.accuracy || 100 + processNoise;

    // Mise à jour
    const kalmanGain = predictedAccuracy / (predictedAccuracy + measurementNoise);
    
    const filteredLat = predictedLat + kalmanGain * (current.latitude - predictedLat);
    const filteredLng = predictedLng + kalmanGain * (current.longitude - predictedLng);
    const filteredAccuracy = (1 - kalmanGain) * predictedAccuracy;

    filtered.push({
      latitude: Number(filteredLat.toFixed(6)),
      longitude: Number(filteredLng.toFixed(6)),
      accuracy: Number(filteredAccuracy.toFixed(1)),
      timestamp: current.timestamp,
    });
  }

  return filtered;
}

/**
 * Améliore la précision en combinant plusieurs méthodes
 */
export function improveAccuracy(
  coordinates: GpsCoordinates[],
  options: AccuracyOptions = {}
): AccuracyImprovement | null {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  if (coordinates.length < 2) return null;

  let processedCoords = coordinates;

  // Étape 1: Filtrer les aberrants
  if (opts.enableFiltering) {
    processedCoords = filterOutliers(processedCoords, opts);
  }

  // Étape 2: Appliquer le filtre de Kalman
  if (opts.enableKalman && processedCoords.length >= 2) {
    processedCoords = applyKalmanFilter(processedCoords, opts);
  }

  // Étape 3: Moyennage
  if (opts.enableAveraging && processedCoords.length >= 2) {
    const averagingResult = improveAccuracyByAveraging(processedCoords, opts);
    if (averagingResult) {
      return averagingResult;
    }
  }

  // Si aucune amélioration n'est possible, retourner la meilleure position
  const bestPosition = processedCoords.reduce((best, current) => {
    const bestAccuracy = best.accuracy || Infinity;
    const currentAccuracy = current.accuracy || Infinity;
    return currentAccuracy < bestAccuracy ? current : best;
  });

  return {
    original: coordinates[0],
    improved: bestPosition,
    improvement: 0,
    method: 'filtering',
    confidence: 0.5,
  };
}

/**
 * Calcule la distance entre deux points en mètres
 */
function calculateDistance(point1: GpsCoordinates, point2: GpsCoordinates): number {
  const R = 6371e3; // Rayon de la Terre en mètres
  const φ1 = (point1.latitude * Math.PI) / 180;
  const φ2 = (point2.latitude * Math.PI) / 180;
  const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Calcule la vitesse entre deux positions
 */
export function calculateSpeed(
  position1: GpsCoordinates,
  position2: GpsCoordinates
): number | null {
  if (!position1.timestamp || !position2.timestamp) return null;

  const distance = calculateDistance(position1, position2);
  const timeDiff = (position2.timestamp - position1.timestamp) / 1000; // en secondes

  if (timeDiff <= 0) return null;

  return distance / timeDiff; // m/s
}

/**
 * Détecte si l'utilisateur est en mouvement
 */
export function detectMovement(
  coordinates: GpsCoordinates[],
  threshold: number = 1.0 // m/s
): boolean {
  if (coordinates.length < 2) return false;

  const speeds = [];
  for (let i = 1; i < coordinates.length; i++) {
    const speed = calculateSpeed(coordinates[i - 1], coordinates[i]);
    if (speed !== null) {
      speeds.push(speed);
    }
  }

  if (speeds.length === 0) return false;

  const avgSpeed = speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length;
  return avgSpeed > threshold;
}

/**
 * Calcule la direction de mouvement
 */
export function calculateBearing(
  position1: GpsCoordinates,
  position2: GpsCoordinates
): number | null {
  const φ1 = (position1.latitude * Math.PI) / 180;
  const φ2 = (position2.latitude * Math.PI) / 180;
  const Δλ = ((position2.longitude - position1.longitude) * Math.PI) / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  const bearing = Math.atan2(y, x) * (180 / Math.PI);
  return (bearing + 360) % 360; // Normaliser entre 0 et 360
}

/**
 * Valide la cohérence d'une série de positions
 */
export function validatePositionConsistency(
  coordinates: GpsCoordinates[],
  maxSpeed: number = 50 // m/s (180 km/h)
): {
  isConsistent: boolean;
  inconsistencies: string[];
  maxDetectedSpeed: number;
} {
  const inconsistencies: string[] = [];
  let maxDetectedSpeed = 0;

  for (let i = 1; i < coordinates.length; i++) {
    const speed = calculateSpeed(coordinates[i - 1], coordinates[i]);
    
    if (speed !== null) {
      maxDetectedSpeed = Math.max(maxDetectedSpeed, speed);
      
      if (speed > maxSpeed) {
        inconsistencies.push(
          `Vitesse excessive détectée: ${(speed * 3.6).toFixed(1)} km/h entre les positions ${i - 1} et ${i}`
        );
      }
    }
  }

  return {
    isConsistent: inconsistencies.length === 0,
    inconsistencies,
    maxDetectedSpeed,
  };
}
