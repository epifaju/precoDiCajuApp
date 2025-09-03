import { useState, useCallback, useMemo } from 'react';
import { useGeolocation, GeolocationOptions } from './useGeolocation';
import { useGeolocationPermission } from './useGeolocationPermission';
import { useGeolocationAccuracy, AccuracyOptions } from './useGeolocationAccuracy';
import { useGeocoding } from './useGeocoding';
import { GpsCoordinates } from '../types/api';

export interface GeolocationManagerState {
  // Geolocation state
  coordinates: GpsCoordinates | null;
  isLoading: boolean;
  error: string | null;
  isSupported: boolean;
  
  // Permission state
  permission: PermissionState | null;
  permissionLoading: boolean;
  permissionError: string | null;
  
  // Accuracy state
  accuracy: number | null;
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'invalid';
  isValid: boolean;
  isWithinBounds: boolean;
  
  // Geocoding state
  address: string | null;
  geocodingLoading: boolean;
  geocodingError: string | null;
}

export interface GeolocationManagerActions {
  // Core actions
  getCurrentPosition: () => Promise<GpsCoordinates>;
  refreshPosition: () => Promise<GpsCoordinates>;
  clearError: () => void;
  
  // Permission actions
  requestPermission: () => Promise<PermissionState>;
  checkPermission: () => Promise<PermissionState>;
  
  // Geocoding actions
  getAddress: (coordinates?: GpsCoordinates) => Promise<string>;
  clearGeocodingCache: () => void;
  
  // Utility actions
  validateCurrentPosition: () => boolean;
  getPositionWithAddress: () => Promise<{ coordinates: GpsCoordinates; address: string }>;
}

export interface GeolocationManagerOptions {
  geolocation?: GeolocationOptions;
  accuracy?: AccuracyOptions;
  autoGeocode?: boolean;
  requirePermission?: boolean;
}

export const useGeolocationManager = (
  options: GeolocationManagerOptions = {}
): GeolocationManagerState & GeolocationManagerActions => {
  const {
    geolocation: geoOptions = {},
    accuracy: accuracyOptions = {},
    autoGeocode = false,
    requirePermission = true,
  } = options;

  // Individual hooks
  const geolocation = useGeolocation(geoOptions);
  const permission = useGeolocationPermission();
  const accuracy = useGeolocationAccuracy(accuracyOptions);
  const geocoding = useGeocoding();

  // Combined state
  const state: GeolocationManagerState = useMemo(() => ({
    // Geolocation state
    coordinates: geolocation.coordinates,
    isLoading: geolocation.isLoading,
    error: geolocation.error?.message || null,
    isSupported: geolocation.isSupported,
    
    // Permission state
    permission: permission.permission,
    permissionLoading: permission.isLoading,
    permissionError: permission.error,
    
    // Accuracy state
    accuracy: geolocation.coordinates?.accuracy || null,
    quality: geolocation.coordinates ? accuracy.getQualityScore(geolocation.coordinates.accuracy || 0) : 'invalid',
    isValid: geolocation.coordinates ? accuracy.validatePosition(geolocation.coordinates).isValid : false,
    isWithinBounds: geolocation.coordinates ? accuracy.isWithinGuineaBissau(geolocation.coordinates) : false,
    
    // Geocoding state
    address: geocoding.result?.formatted || null,
    geocodingLoading: geocoding.isLoading,
    geocodingError: geocoding.error,
  }), [geolocation, permission, accuracy, geocoding]);

  // Core actions
  const getCurrentPosition = useCallback(async (): Promise<GpsCoordinates> => {
    // Check permission if required
    if (requirePermission && permission.permission !== 'granted') {
      await permission.requestPermission();
    }

    const coordinates = await geolocation.getCurrentPosition();
    
    // Auto-geocode if enabled
    if (autoGeocode && coordinates) {
      try {
        await geocoding.reverseGeocode(coordinates);
      } catch (error) {
        console.warn('Auto-geocoding failed:', error);
      }
    }

    return coordinates;
  }, [requirePermission, permission, geolocation, autoGeocode, geocoding]);

  const refreshPosition = useCallback(async (): Promise<GpsCoordinates> => {
    const coordinates = await geolocation.refreshPosition();
    
    // Auto-geocode if enabled
    if (autoGeocode && coordinates) {
      try {
        await geocoding.reverseGeocode(coordinates);
      } catch (error) {
        console.warn('Auto-geocoding failed:', error);
      }
    }

    return coordinates;
  }, [geolocation, autoGeocode, geocoding]);

  const clearError = useCallback(() => {
    geolocation.clearError();
  }, [geolocation]);

  // Permission actions
  const requestPermission = useCallback(async (): Promise<PermissionState> => {
    return permission.requestPermission();
  }, [permission]);

  const checkPermission = useCallback(async (): Promise<PermissionState> => {
    return permission.checkPermission();
  }, [permission]);

  // Geocoding actions
  const getAddress = useCallback(async (coordinates?: GpsCoordinates): Promise<string> => {
    const coords = coordinates || geolocation.coordinates;
    
    if (!coords) {
      throw new Error('No coordinates available for geocoding');
    }

    const result = await geocoding.reverseGeocode(coords);
    return result.formatted;
  }, [geolocation.coordinates, geocoding]);

  const clearGeocodingCache = useCallback(() => {
    geocoding.clearCache();
  }, [geocoding]);

  // Utility actions
  const validateCurrentPosition = useCallback((): boolean => {
    if (!geolocation.coordinates) return false;
    
    const validation = accuracy.validatePosition(geolocation.coordinates);
    return validation.isValid;
  }, [geolocation.coordinates, accuracy]);

  const getPositionWithAddress = useCallback(async (): Promise<{ coordinates: GpsCoordinates; address: string }> => {
    const coordinates = await getCurrentPosition();
    const address = await getAddress(coordinates);
    
    return { coordinates, address };
  }, [getCurrentPosition, getAddress]);

  return {
    ...state,
    getCurrentPosition,
    refreshPosition,
    clearError,
    requestPermission,
    checkPermission,
    getAddress,
    clearGeocodingCache,
    validateCurrentPosition,
    getPositionWithAddress,
  };
};

