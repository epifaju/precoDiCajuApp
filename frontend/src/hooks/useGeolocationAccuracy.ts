import { useState, useCallback, useMemo } from 'react';
import { GpsCoordinates } from '../types/api';

export interface AccuracyOptions {
  minAccuracy?: number; // Minimum accuracy in meters
  maxAge?: number; // Maximum age of position in milliseconds
  validateCoordinates?: boolean; // Whether to validate coordinates are within Guinea-Bissau bounds
}

export interface AccuracyState {
  isValid: boolean;
  accuracy: number | null;
  age: number | null;
  distanceFromLast: number | null;
  isWithinBounds: boolean;
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'invalid';
}

export interface AccuracyActions {
  validatePosition: (position: GpsCoordinates, lastPosition?: GpsCoordinates | null) => AccuracyState;
  calculateDistance: (pos1: GpsCoordinates, pos2: GpsCoordinates) => number;
  isWithinGuineaBissau: (coordinates: GpsCoordinates) => boolean;
  getQualityScore: (accuracy: number) => 'excellent' | 'good' | 'fair' | 'poor' | 'invalid';
}

// Guinea-Bissau approximate bounds
const GUINEA_BISSAU_BOUNDS = {
  north: 12.5,
  south: 10.8,
  east: -13.6,
  west: -16.8,
};

const DEFAULT_OPTIONS: Required<AccuracyOptions> = {
  minAccuracy: 100, // 100 meters
  maxAge: 300000, // 5 minutes
  validateCoordinates: true,
};

export const useGeolocationAccuracy = (options: AccuracyOptions = {}): AccuracyActions => {
  const [lastPosition, setLastPosition] = useState<GpsCoordinates | null>(null);
  
  const opts = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [options]);

  const calculateDistance = useCallback((pos1: GpsCoordinates, pos2: GpsCoordinates): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (pos1.latitude * Math.PI) / 180;
    const φ2 = (pos2.latitude * Math.PI) / 180;
    const Δφ = ((pos2.latitude - pos1.latitude) * Math.PI) / 180;
    const Δλ = ((pos2.longitude - pos1.longitude) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }, []);

  const isWithinGuineaBissau = useCallback((coordinates: GpsCoordinates): boolean => {
    const { latitude, longitude } = coordinates;
    
    return (
      latitude >= GUINEA_BISSAU_BOUNDS.south &&
      latitude <= GUINEA_BISSAU_BOUNDS.north &&
      longitude >= GUINEA_BISSAU_BOUNDS.west &&
      longitude <= GUINEA_BISSAU_BOUNDS.east
    );
  }, []);

  const getQualityScore = useCallback((accuracy: number): 'excellent' | 'good' | 'fair' | 'poor' | 'invalid' => {
    if (accuracy <= 10) return 'excellent';
    if (accuracy <= 50) return 'good';
    if (accuracy <= 100) return 'fair';
    if (accuracy <= 500) return 'poor';
    return 'invalid';
  }, []);

  const validatePosition = useCallback((
    position: GpsCoordinates, 
    lastPos?: GpsCoordinates | null
  ): AccuracyState => {
    const now = Date.now();
    const age = position.timestamp ? now - position.timestamp : null;
    const accuracy = position.accuracy || null;
    
    // Calculate distance from last position
    const distanceFromLast = lastPos ? calculateDistance(position, lastPos) : null;
    
    // Check if within Guinea-Bissau bounds
    const isWithinBounds = opts.validateCoordinates ? isWithinGuineaBissau(position) : true;
    
    // Determine quality
    const quality = accuracy ? getQualityScore(accuracy) : 'invalid';
    
    // Validate position
    const isValid = (
      accuracy !== null &&
      accuracy <= opts.minAccuracy &&
      (age === null || age <= opts.maxAge) &&
      isWithinBounds &&
      quality !== 'invalid'
    );

    // Update last position if valid
    if (isValid) {
      setLastPosition(position);
    }

    return {
      isValid,
      accuracy,
      age,
      distanceFromLast,
      isWithinBounds,
      quality,
    };
  }, [opts, calculateDistance, isWithinGuineaBissau, getQualityScore]);

  return {
    validatePosition,
    calculateDistance,
    isWithinGuineaBissau,
    getQualityScore,
  };
};
