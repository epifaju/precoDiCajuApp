import { useState, useCallback, useRef, useEffect } from 'react';
import { GpsCoordinates } from '../types/api';
import { 
  validateGpsCoordinates, 
  ValidationResult, 
  ValidationOptions,
  averageCoordinates,
  detectOutliers,
  improveAccuracy as improveAccuracyUtil
} from '../utils/geolocation/validation';
import { 
  reverseGeocode, 
  GeocodingResult, 
  GeocodingOptions 
} from '../utils/geolocation/geocoding';
import { 
  evaluateGpsQuality, 
  improveAccuracy, 
  AccuracyImprovement, 
  AccuracyOptions,
  detectMovement,
  calculateSpeed,
  calculateBearing,
  validatePositionConsistency
} from '../utils/geolocation/accuracy';

export interface GpsAccuracyState {
  coordinates: GpsCoordinates | null;
  validation: ValidationResult | null;
  geocoding: GeocodingResult | null;
  improvement: AccuracyImprovement | null;
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'invalid';
  score: number;
  isMoving: boolean;
  speed: number | null;
  bearing: number | null;
  isConsistent: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface GpsAccuracyActions {
  validateCoordinates: (coordinates: GpsCoordinates) => ValidationResult;
  improveAccuracy: (coordinates: GpsCoordinates[]) => AccuracyImprovement | null;
  getGeocoding: (coordinates: GpsCoordinates) => Promise<GeocodingResult>;
  clearError: () => void;
  reset: () => void;
}

export interface GpsAccuracyOptions {
  validation?: ValidationOptions;
  geocoding?: GeocodingOptions;
  accuracy?: AccuracyOptions;
  autoValidate?: boolean;
  autoGeocode?: boolean;
  autoImprove?: boolean;
  enableMovementDetection?: boolean;
  enableConsistencyCheck?: boolean;
}

export const useGpsAccuracy = (options: GpsAccuracyOptions = {}): GpsAccuracyState & GpsAccuracyActions => {
  const {
    validation: validationOptions = {},
    geocoding: geocodingOptions = {},
    accuracy: accuracyOptions = {},
    autoValidate = true,
    autoGeocode = false,
    autoImprove = false,
    enableMovementDetection = true,
    enableConsistencyCheck = true,
  } = options;

  const [state, setState] = useState<GpsAccuracyState>({
    coordinates: null,
    validation: null,
    geocoding: null,
    improvement: null,
    quality: 'invalid',
    score: 0,
    isMoving: false,
    speed: null,
    bearing: null,
    isConsistent: true,
    isLoading: false,
    error: null,
  });

  const coordinatesHistoryRef = useRef<GpsCoordinates[]>([]);
  const lastPositionRef = useRef<GpsCoordinates | null>(null);

  // Valider les coordonnées
  const validateCoordinates = useCallback((coordinates: GpsCoordinates): ValidationResult => {
    const validation = validateGpsCoordinates(coordinates, validationOptions);
    
    setState(prev => ({
      ...prev,
      validation,
      quality: validation.quality,
      score: validation.score,
    }));

    return validation;
  }, [validationOptions]);

  // Améliorer la précision
  const improveAccuracyAction = useCallback((coordinates: GpsCoordinates[]): AccuracyImprovement | null => {
    if (coordinates.length < 2) return null;

    const improvement = improveAccuracy(coordinates, accuracyOptions);
    
    if (improvement) {
      setState(prev => ({
        ...prev,
        improvement,
        coordinates: improvement.improved,
      }));
    }

    return improvement;
  }, [accuracyOptions]);

  // Obtenir le géocodage
  const getGeocoding = useCallback(async (coordinates: GpsCoordinates): Promise<GeocodingResult> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const geocoding = await reverseGeocode(coordinates, geocodingOptions);
      
      setState(prev => ({
        ...prev,
        geocoding,
        isLoading: false,
      }));

      return geocoding;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de géocodage';
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));

      throw error;
    }
  }, [geocodingOptions]);

  // Effacer les erreurs
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Réinitialiser l'état
  const reset = useCallback(() => {
    setState({
      coordinates: null,
      validation: null,
      geocoding: null,
      improvement: null,
      quality: 'invalid',
      score: 0,
      isMoving: false,
      speed: null,
      bearing: null,
      isConsistent: true,
      isLoading: false,
      error: null,
    });
    coordinatesHistoryRef.current = [];
    lastPositionRef.current = null;
  }, []);

  // Traiter une nouvelle position
  const processNewPosition = useCallback(async (coordinates: GpsCoordinates) => {
    // Ajouter à l'historique
    coordinatesHistoryRef.current.push(coordinates);
    
    // Garder seulement les 10 dernières positions
    if (coordinatesHistoryRef.current.length > 10) {
      coordinatesHistoryRef.current = coordinatesHistoryRef.current.slice(-10);
    }

    // Validation automatique
    if (autoValidate) {
      validateCoordinates(coordinates);
    }

    // Géocodage automatique
    if (autoGeocode) {
      try {
        await getGeocoding(coordinates);
      } catch (error) {
        console.warn('Géocodage automatique échoué:', error);
      }
    }

    // Amélioration automatique de la précision
    if (autoImprove && coordinatesHistoryRef.current.length >= 2) {
      improveAccuracyAction(coordinatesHistoryRef.current);
    }

    // Détection de mouvement
    if (enableMovementDetection && coordinatesHistoryRef.current.length >= 2) {
      const isMoving = detectMovement(coordinatesHistoryRef.current);
      setState(prev => ({ ...prev, isMoving }));
    }

    // Calcul de la vitesse et de la direction
    if (lastPositionRef.current) {
      const speed = calculateSpeed(lastPositionRef.current, coordinates);
      const bearing = calculateBearing(lastPositionRef.current, coordinates);
      
      setState(prev => ({
        ...prev,
        speed,
        bearing,
      }));
    }

    // Vérification de cohérence
    if (enableConsistencyCheck && coordinatesHistoryRef.current.length >= 2) {
      const consistency = validatePositionConsistency(coordinatesHistoryRef.current);
      setState(prev => ({
        ...prev,
        isConsistent: consistency.isConsistent,
      }));
    }

    // Mettre à jour la position actuelle
    setState(prev => ({
      ...prev,
      coordinates,
    }));

    lastPositionRef.current = coordinates;
  }, [
    autoValidate,
    autoGeocode,
    autoImprove,
    enableMovementDetection,
    enableConsistencyCheck,
    validateCoordinates,
    getGeocoding,
    improveAccuracyAction,
  ]);

  // Exposer la fonction de traitement pour utilisation externe
  const processPosition = useCallback((coordinates: GpsCoordinates) => {
    processNewPosition(coordinates);
  }, [processNewPosition]);

  // Nettoyage à la destruction du composant
  useEffect(() => {
    return () => {
      coordinatesHistoryRef.current = [];
      lastPositionRef.current = null;
    };
  }, []);

  return {
    ...state,
    validateCoordinates,
    improveAccuracy: improveAccuracyAction,
    getGeocoding,
    clearError,
    reset,
    processPosition,
  };
};

// Hook spécialisé pour la validation uniquement
export const useGpsValidation = (options: ValidationOptions = {}) => {
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  const validate = useCallback((coordinates: GpsCoordinates) => {
    const result = validateGpsCoordinates(coordinates, options);
    setValidation(result);
    return result;
  }, [options]);

  const clearValidation = useCallback(() => {
    setValidation(null);
  }, []);

  return {
    validation,
    validate,
    clearValidation,
  };
};

// Hook spécialisé pour l'amélioration de précision
export const useGpsImprovement = (options: AccuracyOptions = {}) => {
  const [improvement, setImprovement] = useState<AccuracyImprovement | null>(null);
  const [coordinates, setCoordinates] = useState<GpsCoordinates[]>([]);

  const addCoordinates = useCallback((newCoordinates: GpsCoordinates) => {
    setCoordinates(prev => [...prev, newCoordinates].slice(-10)); // Garder 10 dernières
  }, []);

  const improve = useCallback(() => {
    if (coordinates.length < 2) return null;

    const result = improveAccuracy(coordinates, options);
    setImprovement(result);
    return result;
  }, [coordinates, options]);

  const clearImprovement = useCallback(() => {
    setImprovement(null);
    setCoordinates([]);
  }, []);

  return {
    improvement,
    coordinates,
    addCoordinates,
    improve,
    clearImprovement,
  };
};

// Hook spécialisé pour le géocodage
export const useGpsGeocoding = (options: GeocodingOptions = {}) => {
  const [geocoding, setGeocoding] = useState<GeocodingResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geocode = useCallback(async (coordinates: GpsCoordinates) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await reverseGeocode(coordinates, options);
      setGeocoding(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de géocodage';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const clearGeocoding = useCallback(() => {
    setGeocoding(null);
    setError(null);
  }, []);

  return {
    geocoding,
    isLoading,
    error,
    geocode,
    clearGeocoding,
  };
};

