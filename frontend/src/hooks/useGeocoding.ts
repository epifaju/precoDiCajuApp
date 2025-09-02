import { useState, useCallback, useRef } from 'react';
import { GpsCoordinates } from '../types/api';

export interface GeocodingResult {
  address: string;
  components: {
    country?: string;
    region?: string;
    city?: string;
    village?: string;
    road?: string;
    postcode?: string;
  };
  formatted: string;
  confidence: number;
}

export interface GeocodingState {
  result: GeocodingResult | null;
  isLoading: boolean;
  error: string | null;
  cache: Map<string, GeocodingResult>;
}

export interface GeocodingActions {
  reverseGeocode: (coordinates: GpsCoordinates) => Promise<GeocodingResult>;
  clearCache: () => void;
  getCachedResult: (coordinates: GpsCoordinates) => GeocodingResult | null;
}

// Cache key generator for coordinates
const getCacheKey = (coordinates: GpsCoordinates): string => {
  // Round to 4 decimal places for cache key (about 11m precision)
  const lat = Math.round(coordinates.latitude * 10000) / 10000;
  const lng = Math.round(coordinates.longitude * 10000) / 10000;
  return `${lat},${lng}`;
};

export const useGeocoding = (): GeocodingState & GeocodingActions => {
  const [state, setState] = useState<GeocodingState>({
    result: null,
    isLoading: false,
    error: null,
    cache: new Map(),
  });

  const cacheRef = useRef<Map<string, GeocodingResult>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    setState(prev => ({ ...prev, cache: new Map() }));
  }, []);

  const getCachedResult = useCallback((coordinates: GpsCoordinates): GeocodingResult | null => {
    const cacheKey = getCacheKey(coordinates);
    return cacheRef.current.get(cacheKey) || null;
  }, []);

  const reverseGeocode = useCallback(async (coordinates: GpsCoordinates): Promise<GeocodingResult> => {
    const cacheKey = getCacheKey(coordinates);
    
    // Check cache first
    const cachedResult = cacheRef.current.get(cacheKey);
    if (cachedResult) {
      setState(prev => ({ ...prev, result: cachedResult, error: null }));
      return cachedResult;
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Use OpenStreetMap Nominatim API (free, no API key required)
      const { latitude, longitude } = coordinates;
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
      
      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
        headers: {
          'User-Agent': 'PrecoDiCaju/1.0 (Geolocation App)',
        },
      });

      if (!response.ok) {
        throw new Error(`Geocoding request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data || data.error) {
        throw new Error(data.error || 'No geocoding data received');
      }

      // Parse the response
      const result: GeocodingResult = {
        address: data.display_name || 'Unknown location',
        components: {
          country: data.address?.country,
          region: data.address?.state || data.address?.region,
          city: data.address?.city || data.address?.town || data.address?.village,
          village: data.address?.village || data.address?.hamlet,
          road: data.address?.road,
          postcode: data.address?.postcode,
        },
        formatted: data.display_name || 'Unknown location',
        confidence: parseFloat(data.importance || '0.5'),
      };

      // Cache the result
      cacheRef.current.set(cacheKey, result);

      setState(prev => ({
        ...prev,
        result,
        isLoading: false,
        error: null,
        cache: new Map(cacheRef.current),
      }));

      return result;
    } catch (error) {
      let errorMessage = 'Failed to get address information';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Geocoding request was cancelled';
        } else {
          errorMessage = error.message;
        }
      }

      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));

      throw new Error(errorMessage);
    }
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Return cleanup function
  return {
    ...state,
    reverseGeocode,
    clearCache,
    getCachedResult,
    cleanup,
  };
};
