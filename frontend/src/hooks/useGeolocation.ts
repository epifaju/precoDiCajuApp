import { useState, useEffect, useCallback, useRef } from 'react';
import { GpsCoordinates } from '../types/api';

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watchPosition?: boolean;
}

export interface GeolocationState {
  coordinates: GpsCoordinates | null;
  error: GeolocationError | null;
  isLoading: boolean;
  isSupported: boolean;
  permission: PermissionState | null;
}

export interface GeolocationError {
  code: number;
  message: string;
  type: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'UNKNOWN';
}

export interface GeolocationActions {
  getCurrentPosition: () => Promise<GpsCoordinates>;
  watchPosition: () => number;
  clearWatch: (watchId: number) => void;
  clearError: () => void;
  refreshPosition: () => Promise<GpsCoordinates>;
}

const DEFAULT_OPTIONS: GeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 300000, // 5 minutes
  watchPosition: false,
};

const GEOLOCATION_ERROR_MESSAGES = {
  PERMISSION_DENIED: 'Location access denied by user',
  POSITION_UNAVAILABLE: 'Location information unavailable',
  TIMEOUT: 'Location request timed out',
  UNKNOWN: 'An unknown error occurred while retrieving location',
};

export const useGeolocation = (options: GeolocationOptions = {}): GeolocationState & GeolocationActions => {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    error: null,
    isLoading: false,
    isSupported: 'geolocation' in navigator,
    permission: null,
  });

  const optionsRef = useRef({ ...DEFAULT_OPTIONS, ...options });
  const watchIdRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Update options when they change
  useEffect(() => {
    optionsRef.current = { ...DEFAULT_OPTIONS, ...options };
  }, [options]);

  // Check geolocation support
  useEffect(() => {
    if (!state.isSupported) {
      setState(prev => ({
        ...prev,
        error: {
          code: -1,
          message: 'Geolocation is not supported by this browser',
          type: 'UNKNOWN',
        },
      }));
    }
  }, [state.isSupported]);

  // Check permission status
  useEffect(() => {
    const checkPermission = async () => {
      if ('permissions' in navigator) {
        try {
          const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
          setState(prev => ({ ...prev, permission: permission.state }));
          
          permission.onchange = () => {
            setState(prev => ({ ...prev, permission: permission.state }));
          };
        } catch (error) {
          console.warn('Could not check geolocation permission:', error);
        }
      }
    };

    if (state.isSupported) {
      checkPermission();
    }
  }, [state.isSupported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleGeolocationSuccess = useCallback((position: GeolocationPosition) => {
    const coordinates: GpsCoordinates = {
      latitude: Number(position.coords.latitude.toFixed(6)),
      longitude: Number(position.coords.longitude.toFixed(6)),
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
    };

    setState(prev => ({
      ...prev,
      coordinates,
      error: null,
      isLoading: false,
    }));

    return coordinates;
  }, []);

  const handleGeolocationError = useCallback((error: GeolocationPositionError) => {
    let errorType: GeolocationError['type'] = 'UNKNOWN';
    let message = GEOLOCATION_ERROR_MESSAGES.UNKNOWN;

    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorType = 'PERMISSION_DENIED';
        message = GEOLOCATION_ERROR_MESSAGES.PERMISSION_DENIED;
        break;
      case error.POSITION_UNAVAILABLE:
        errorType = 'POSITION_UNAVAILABLE';
        message = GEOLOCATION_ERROR_MESSAGES.POSITION_UNAVAILABLE;
        break;
      case error.TIMEOUT:
        errorType = 'TIMEOUT';
        message = GEOLOCATION_ERROR_MESSAGES.TIMEOUT;
        break;
    }

    const geolocationError: GeolocationError = {
      code: error.code,
      message,
      type: errorType,
    };

    setState(prev => ({
      ...prev,
      error: geolocationError,
      isLoading: false,
    }));

    throw geolocationError;
  }, []);

  const getCurrentPosition = useCallback((): Promise<GpsCoordinates> => {
    if (!state.isSupported) {
      const error: GeolocationError = {
        code: -1,
        message: 'Geolocation is not supported by this browser',
        type: 'UNKNOWN',
      };
      setState(prev => ({ ...prev, error, isLoading: false }));
      return Promise.reject(error);
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    return new Promise((resolve, reject) => {
      const { enableHighAccuracy, timeout, maximumAge } = optionsRef.current;

      navigator.geolocation.getCurrentPosition(
        (position) => {
          try {
            const coordinates = handleGeolocationSuccess(position);
            resolve(coordinates);
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          const geolocationError = handleGeolocationError(error);
          reject(geolocationError);
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
        }
      );
    });
  }, [state.isSupported, handleGeolocationSuccess, handleGeolocationError]);

  const watchPosition = useCallback((): number => {
    if (!state.isSupported) {
      const error: GeolocationError = {
        code: -1,
        message: 'Geolocation is not supported by this browser',
        type: 'UNKNOWN',
      };
      setState(prev => ({ ...prev, error }));
      return -1;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    const { enableHighAccuracy, timeout, maximumAge } = optionsRef.current;

    const watchId = navigator.geolocation.watchPosition(
      handleGeolocationSuccess,
      handleGeolocationError,
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    );

    watchIdRef.current = watchId;
    return watchId;
  }, [state.isSupported, handleGeolocationSuccess, handleGeolocationError]);

  const clearWatch = useCallback((watchId: number) => {
    navigator.geolocation.clearWatch(watchId);
    if (watchIdRef.current === watchId) {
      watchIdRef.current = null;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const refreshPosition = useCallback(async (): Promise<GpsCoordinates> => {
    // Clear any existing watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    // Get fresh position with no cache
    const freshOptions = {
      ...optionsRef.current,
      maximumAge: 0, // Force fresh position
    };

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    return new Promise((resolve, reject) => {
      const { enableHighAccuracy, timeout } = freshOptions;

      navigator.geolocation.getCurrentPosition(
        (position) => {
          try {
            const coordinates = handleGeolocationSuccess(position);
            resolve(coordinates);
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          const geolocationError = handleGeolocationError(error);
          reject(geolocationError);
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge: 0,
        }
      );
    });
  }, [handleGeolocationSuccess, handleGeolocationError]);

  return {
    ...state,
    getCurrentPosition,
    watchPosition,
    clearWatch,
    clearError,
    refreshPosition,
  };
};
