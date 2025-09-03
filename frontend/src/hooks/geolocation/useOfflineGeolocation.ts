/**
 * Hook pour la gestion de la géolocalisation en mode offline
 * Intègre le cache local et la synchronisation automatique
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { GeolocationPosition, GpsCoordinates, GeocodingAddress } from '../../types/api';
import { 
  offlineGPSManager, 
  offlineSyncManager, 
  offlineUtils,
  CachedPosition,
  CachedGeocoding,
  OfflineStatus
} from '../../utils/geolocation/offline';

export interface OfflineGeolocationState {
  // État de la géolocalisation
  position: GeolocationPosition | null;
  error: string | null;
  loading: boolean;
  
  // État offline
  isOnline: boolean;
  canWorkOffline: boolean;
  lastSync: number | null;
  pendingSync: number;
  cacheSize: number;
  
  // Données en cache
  cachedPositions: CachedPosition[];
  cachedGeocoding: CachedGeocoding[];
  
  // Statistiques
  stats: {
    totalPositions: number;
    totalGeocoding: number;
    syncQueue: number;
    cacheHitRate: number;
  };
}

export interface OfflineGeolocationActions {
  // Actions de géolocalisation
  getCurrentPosition: (options?: PositionOptions) => Promise<GeolocationPosition>;
  watchPosition: (callback: (position: GeolocationPosition) => void, options?: PositionOptions) => number;
  clearWatch: (watchId: number) => void;
  
  // Actions de cache
  cachePosition: (position: GeolocationPosition) => Promise<string>;
  getCachedPositions: (limit?: number) => Promise<CachedPosition[]>;
  clearCache: () => Promise<void>;
  
  // Actions de géocodage
  cacheGeocoding: (coordinates: GpsCoordinates, address: GeocodingAddress) => Promise<string>;
  getCachedGeocoding: (coordinates: GpsCoordinates) => Promise<GeocodingAddress | null>;
  
  // Actions de synchronisation
  syncNow: () => Promise<void>;
  getSyncStatus: () => OfflineStatus;
  
  // Actions utilitaires
  initialize: () => Promise<void>;
  cleanup: () => Promise<void>;
  getStats: () => Promise<any>;
}

export interface UseOfflineGeolocationOptions {
  // Options de géolocalisation
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  
  // Options de cache
  cachePositions?: boolean;
  cacheGeocoding?: boolean;
  maxCacheSize?: number;
  
  // Options de synchronisation
  autoSync?: boolean;
  syncInterval?: number;
  
  // Options de validation
  validateCoordinates?: boolean;
  minAccuracy?: number;
}

/**
 * Hook principal pour la géolocalisation offline
 */
export function useOfflineGeolocation(options: UseOfflineGeolocationOptions = {}): [
  OfflineGeolocationState,
  OfflineGeolocationActions
] {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 60000,
    cachePositions = true,
    cacheGeocoding = true,
    maxCacheSize = 1000,
    autoSync = true,
    syncInterval = 30000,
    validateCoordinates = true,
    minAccuracy = 100
  } = options;

  // État local
  const [state, setState] = useState<OfflineGeolocationState>({
    position: null,
    error: null,
    loading: false,
    isOnline: navigator.onLine,
    canWorkOffline: false,
    lastSync: null,
    pendingSync: 0,
    cacheSize: 0,
    cachedPositions: [],
    cachedGeocoding: [],
    stats: {
      totalPositions: 0,
      totalGeocoding: 0,
      syncQueue: 0,
      cacheHitRate: 0
    }
  });

  // Références
  const watchIdRef = useRef<number | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  /**
   * Met à jour l'état de connectivité
   */
  const updateConnectivityStatus = useCallback(async () => {
    const status = offlineSyncManager.getStatus();
    const stats = await offlineGPSManager.getCacheStats();
    
    setState(prev => ({
      ...prev,
      isOnline: status.isOnline,
      canWorkOffline: status.canWorkOffline,
      lastSync: status.lastSync,
      pendingSync: status.pendingSync,
      cacheSize: status.cacheSize,
      stats: {
        totalPositions: stats.positions,
        totalGeocoding: stats.geocoding,
        syncQueue: stats.syncQueue,
        cacheHitRate: prev.stats.cacheHitRate
      }
    }));
  }, []);

  /**
   * Valide une position GPS
   */
  const validatePosition = useCallback((position: GeolocationPosition): boolean => {
    if (!validateCoordinates) return true;
    
    // Vérifier la précision
    if (position.accuracy > minAccuracy) return false;
    
    // Vérifier les coordonnées
    const { lat, lng } = position.coordinates;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;
    
    // Vérifier l'âge des données
    const age = Date.now() - position.timestamp;
    if (age > maximumAge) return false;
    
    return true;
  }, [validateCoordinates, minAccuracy, maximumAge]);

  /**
   * Obtient la position actuelle
   */
  const getCurrentPosition = useCallback(async (options?: PositionOptions): Promise<GeolocationPosition> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const position: GeolocationPosition = {
              coordinates: {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
              },
              accuracy: pos.coords.accuracy,
              timestamp: pos.timestamp,
              isValid: true,
              quality: pos.coords.accuracy <= 10 ? 'excellent' : 
                      pos.coords.accuracy <= 50 ? 'good' : 
                      pos.coords.accuracy <= 100 ? 'fair' : 'poor'
            };
            resolve(position);
          },
          (error) => {
            reject(new Error(`Erreur de géolocalisation: ${error.message}`));
          },
          {
            enableHighAccuracy,
            timeout,
            maximumAge,
            ...options
          }
        );
      });

      // Valider la position
      if (!validatePosition(position)) {
        throw new Error('Position GPS invalide');
      }

      // Mettre en cache si activé
      if (cachePositions) {
        await cachePosition(position);
      }

      setState(prev => ({ ...prev, position, loading: false }));
      return position;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      throw error;
    }
  }, [enableHighAccuracy, timeout, maximumAge, validatePosition, cachePositions]);

  /**
   * Surveille la position
   */
  const watchPosition = useCallback((
    callback: (position: GeolocationPosition) => void,
    options?: PositionOptions
  ): number => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const position: GeolocationPosition = {
          coordinates: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          },
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
          isValid: true,
          quality: pos.coords.accuracy <= 10 ? 'excellent' : 
                  pos.coords.accuracy <= 50 ? 'good' : 
                  pos.coords.accuracy <= 100 ? 'fair' : 'poor'
        };

        if (validatePosition(position)) {
          callback(position);
          
          // Mettre en cache si activé
          if (cachePositions) {
            cachePosition(position);
          }
        }
      },
      (error) => {
        console.error('Erreur de surveillance GPS:', error);
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
        ...options
      }
    );

    watchIdRef.current = watchId;
    return watchId;
  }, [enableHighAccuracy, timeout, maximumAge, validatePosition, cachePositions]);

  /**
   * Arrête la surveillance
   */
  const clearWatch = useCallback((watchId: number) => {
    navigator.geolocation.clearWatch(watchId);
    if (watchIdRef.current === watchId) {
      watchIdRef.current = null;
    }
  }, []);

  /**
   * Met en cache une position
   */
  const cachePosition = useCallback(async (position: GeolocationPosition): Promise<string> => {
    try {
      const id = await offlineGPSManager.cachePosition(position);
      await updateConnectivityStatus();
      return id;
    } catch (error) {
      console.error('Erreur lors de la mise en cache:', error);
      throw error;
    }
  }, [updateConnectivityStatus]);

  /**
   * Récupère les positions en cache
   */
  const getCachedPositions = useCallback(async (limit = 100): Promise<CachedPosition[]> => {
    try {
      const positions = await offlineGPSManager.getCachedPositions(limit);
      setState(prev => ({ ...prev, cachedPositions: positions }));
      return positions;
    } catch (error) {
      console.error('Erreur lors de la récupération du cache:', error);
      return [];
    }
  }, []);

  /**
   * Met en cache un résultat de géocodage
   */
  const cacheGeocoding = useCallback(async (
    coordinates: GpsCoordinates, 
    address: GeocodingAddress
  ): Promise<string> => {
    try {
      const id = await offlineGPSManager.cacheGeocoding(coordinates, address);
      await updateConnectivityStatus();
      return id;
    } catch (error) {
      console.error('Erreur lors de la mise en cache du géocodage:', error);
      throw error;
    }
  }, [updateConnectivityStatus]);

  /**
   * Récupère un résultat de géocodage en cache
   */
  const getCachedGeocoding = useCallback(async (
    coordinates: GpsCoordinates
  ): Promise<GeocodingAddress | null> => {
    try {
      return await offlineGPSManager.getCachedGeocoding(coordinates);
    } catch (error) {
      console.error('Erreur lors de la récupération du géocodage en cache:', error);
      return null;
    }
  }, []);

  /**
   * Synchronise maintenant
   */
  const syncNow = useCallback(async (): Promise<void> => {
    try {
      // Implémentation de la synchronisation
      await updateConnectivityStatus();
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      throw error;
    }
  }, [updateConnectivityStatus]);

  /**
   * Obtient le statut de synchronisation
   */
  const getSyncStatus = useCallback((): OfflineStatus => {
    return offlineSyncManager.getStatus();
  }, []);

  /**
   * Initialise le système offline
   */
  const initialize = useCallback(async (): Promise<void> => {
    if (isInitializedRef.current) return;

    try {
      await offlineUtils.initialize();
      await updateConnectivityStatus();
      
      if (autoSync) {
        offlineSyncManager.startSync();
      }
      
      isInitializedRef.current = true;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation offline:', error);
      throw error;
    }
  }, [updateConnectivityStatus, autoSync]);

  /**
   * Nettoie le cache
   */
  const clearCache = useCallback(async (): Promise<void> => {
    try {
      await offlineUtils.cleanup();
      await updateConnectivityStatus();
    } catch (error) {
      console.error('Erreur lors du nettoyage du cache:', error);
      throw error;
    }
  }, [updateConnectivityStatus]);

  /**
   * Obtient les statistiques
   */
  const getStats = useCallback(async () => {
    try {
      return await offlineUtils.getStats();
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return null;
    }
  }, []);

  // Effets
  useEffect(() => {
    // Initialisation
    initialize();

    // Écouteurs d'événements
    const handleOnline = () => updateConnectivityStatus();
    const handleOffline = () => updateConnectivityStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Nettoyage
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
      
      offlineSyncManager.stopSync();
    };
  }, [initialize, updateConnectivityStatus]);

  // Actions
  const actions: OfflineGeolocationActions = {
    getCurrentPosition,
    watchPosition,
    clearWatch,
    cachePosition,
    getCachedPositions,
    clearCache,
    cacheGeocoding,
    getCachedGeocoding,
    syncNow,
    getSyncStatus,
    initialize,
    cleanup: clearCache,
    getStats
  };

  return [state, actions];
}

/**
 * Hook simplifié pour la géolocalisation offline
 */
export function useOfflineGPS(options: UseOfflineGeolocationOptions = {}) {
  const [state, actions] = useOfflineGeolocation(options);
  
  return {
    // État
    position: state.position,
    error: state.error,
    loading: state.loading,
    isOnline: state.isOnline,
    canWorkOffline: state.canWorkOffline,
    
    // Actions
    getCurrentPosition: actions.getCurrentPosition,
    watchPosition: actions.watchPosition,
    clearWatch: actions.clearWatch,
    syncNow: actions.syncNow,
    initialize: actions.initialize
  };
}

/**
 * Hook pour la gestion du cache offline
 */
export function useOfflineCache() {
  const [state, actions] = useOfflineGeolocation({ cachePositions: true, cacheGeocoding: true });
  
  return {
    // État
    cachedPositions: state.cachedPositions,
    cachedGeocoding: state.cachedGeocoding,
    cacheSize: state.cacheSize,
    stats: state.stats,
    
    // Actions
    getCachedPositions: actions.getCachedPositions,
    getCachedGeocoding: actions.getCachedGeocoding,
    cachePosition: actions.cachePosition,
    cacheGeocoding: actions.cacheGeocoding,
    clearCache: actions.clearCache,
    getStats: actions.getStats
  };
}

/**
 * Hook pour la synchronisation offline
 */
export function useOfflineSync() {
  const [state, actions] = useOfflineGeolocation({ autoSync: true });
  
  return {
    // État
    isOnline: state.isOnline,
    lastSync: state.lastSync,
    pendingSync: state.pendingSync,
    
    // Actions
    syncNow: actions.syncNow,
    getSyncStatus: actions.getSyncStatus
  };
}

