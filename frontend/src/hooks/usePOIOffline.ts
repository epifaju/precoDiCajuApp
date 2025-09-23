import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { POI, POIStatistics, POIFilters } from '../types/poi';
import { poiOfflineStorage } from '../services/poiOfflineStorage';
import { useConnectionStatus } from './useConnectionStatus';
import { apiClient } from '../services/apiClient';

// Offline query keys
export const POI_OFFLINE_QUERY_KEYS = {
  all: ['pois-offline'] as const,
  list: (filters: POIFilters) => [...POI_OFFLINE_QUERY_KEYS.all, 'list', filters] as const,
  stats: () => [...POI_OFFLINE_QUERY_KEYS.all, 'stats'] as const,
  sync: () => [...POI_OFFLINE_QUERY_KEYS.all, 'sync'] as const,
} as const;

/**
 * Hook to manage POI offline storage and synchronization
 */
export function usePOIOfflineSync() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { isOnline } = useConnectionStatus();

  // Initialize offline storage
  const initializeOfflineStorage = useCallback(async () => {
    try {
      console.log('Initializing POI offline storage...');
      await poiOfflineStorage.init();
      setIsInitialized(true);
      setSyncError(null); // Clear any previous errors
      
      // Get last sync time
      const lastSync = await poiOfflineStorage.getLastSyncTime();
      setLastSyncTime(lastSync);
      console.log('POI offline storage initialized successfully');
    } catch (error) {
      console.error('Failed to initialize POI offline storage:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize offline storage';
      setSyncError(errorMessage);
      setIsInitialized(false);
    }
  }, []);

  // Sync POI data from server
  const syncPOIs = useCallback(async (retryCount = 0) => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    setSyncError(null);

    const maxRetries = 3;
    const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff, max 10s

    try {
      console.log(`Starting POI sync... (attempt ${retryCount + 1}/${maxRetries + 1})`);

      // Test backend connectivity with multiple health checks and timeout
      let backendAvailable = false;
      const healthChecks = [
        '/api/v1/poi/health',
        '/api/v1/regions', // Simple endpoint that should always work
        '/actuator/health'
      ];

      for (const endpoint of healthChecks) {
        try {
          await apiClient.get(endpoint, { timeout: 5000 }); // 5s timeout per check
          backendAvailable = true;
          console.log(`✅ Backend connectivity confirmed via ${endpoint}`);
          break;
        } catch (error) {
          console.warn(`⚠️ Health check failed for ${endpoint}:`, error?.message || 'Unknown error');
        }
      }

      if (!backendAvailable) {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        throw new Error(`Backend service unavailable. Please check if the server is running on ${baseUrl}`);
      }

      // Fetch POIs from server with timeout and retry logic
      console.log('🔵 [API Info] Fetching POI data from server...');
      
      console.log('🔵 [API Info] Starting GET request to /api/v1/poi');
      const poisResponse = await apiClient.get('/api/v1/poi', { timeout: 10000, retries: 1 }).catch(err => {
        // Enhanced error logging for debugging
        console.error('❌ Failed to fetch POIs from /api/v1/poi:', {
          message: err?.message,
          status: err?.status,
          statusText: err?.statusText,
          url: err?.url,
          data: err?.data,
          isApiError: err?.isApiError
        });
        
        // Provide more specific error message based on status code
        let errorMessage = 'Unknown error';
        if (err?.status) {
          const statusErrorMap = {
            500: 'Internal server error - Database or backend issue',
            503: 'Service temporarily unavailable',
            502: 'Bad gateway - Backend not responding',
            404: 'POI endpoint not found',
            403: 'Access forbidden',
            401: 'Authentication required'
          };
          errorMessage = statusErrorMap[err.status] || `HTTP ${err.status}: ${err.statusText}`;
        } else if (err?.message) {
          errorMessage = err.message;
        }
        
        throw new Error(`POI endpoint /api/v1/poi not accessible: ${errorMessage}`);
      });
      
      console.log('🔵 [API Info] Starting GET request to /api/v1/poi/stats');
      const statsResponse = await apiClient.get('/api/v1/poi/stats', { timeout: 10000, retries: 1 }).catch(err => {
        // Enhanced error logging for debugging
        console.error('❌ Failed to fetch POI stats from /api/v1/poi/stats:', {
          message: err?.message,
          status: err?.status,
          statusText: err?.statusText,
          url: err?.url,
          data: err?.data,
          isApiError: err?.isApiError
        });
        
        // Provide more specific error message
        let errorMessage = 'Unknown error';
        if (err?.status) {
          const statusErrorMap = {
            500: 'Internal server error - Database or backend issue',
            503: 'Service temporarily unavailable',
            502: 'Bad gateway - Backend not responding',
            404: 'POI statistics endpoint not found',
            403: 'Access forbidden',
            401: 'Authentication required'
          };
          errorMessage = statusErrorMap[err.status] || `HTTP ${err.status}: ${err.statusText}`;
        } else if (err?.message) {
          errorMessage = err.message;
        }
        
        throw new Error(`POI statistics endpoint /api/v1/poi/stats not accessible: ${errorMessage}`);
      });

      const pois: POI[] = Array.isArray(poisResponse) ? poisResponse : poisResponse.data;
      const stats: POIStatistics = statsResponse;

      console.log(`✅ Successfully fetched ${Array.isArray(pois) ? pois.length : 'unknown'} POIs from /api/v1/poi`);
      console.log(`✅ Successfully fetched POI statistics from /api/v1/poi/stats`);

      // Validate data structure
      if (!Array.isArray(pois)) {
        throw new Error(`Invalid POI data format received from /api/v1/poi (expected array, got ${typeof pois})`);
      }

      if (!stats || typeof stats !== 'object') {
        throw new Error(`Invalid statistics data format received from /api/v1/poi/stats (expected object, got ${typeof stats})`);
      }

      console.log(`✅ Validated ${pois.length} POIs and statistics data`);

      // Store in offline storage with error handling
      try {
        await Promise.all([
          poiOfflineStorage.storePOIs(pois),
          poiOfflineStorage.storeStatistics(stats),
        ]);
      } catch (storageError) {
        console.error('Offline storage failed:', storageError);
        throw new Error('Failed to store POI data locally. Please check browser storage permissions.');
      }

      setLastSyncTime(new Date());
      console.log(`✅ POI sync completed successfully: ${pois.length} POIs stored`);

      // Invalidate offline queries to refresh UI
      queryClient.invalidateQueries({ queryKey: POI_OFFLINE_QUERY_KEYS.all });

    } catch (error) {
      console.error(`❌ POI sync failed (attempt ${retryCount + 1}):`, error);
      
      // Determine if we should retry
      const isRetryableError = 
        error.message.includes('Backend service unavailable') ||
        error.message.includes('timeout') ||
        error.message.includes('fetch') ||
        error.message.includes('network') ||
        (error.status >= 500 && error.status < 600); // Server errors
      
      if (isRetryableError && retryCount < maxRetries) {
        console.log(`🔄 Retrying in ${retryDelay}ms...`);
        setTimeout(() => {
          syncPOIs(retryCount + 1);
        }, retryDelay);
        return; // Don't set error state yet, we're retrying
      }
      
      // Generate user-friendly error message
      let userFriendlyMessage = 'Failed to sync POI data. ';
      
      if (error.message.includes('Backend service unavailable')) {
        userFriendlyMessage += 'Server appears to be offline. Please check your internet connection and try again later.';
      } else if (error.message.includes('POI endpoint not accessible')) {
        userFriendlyMessage += 'POI service is temporarily unavailable. Please try again later.';
      } else if (error.message.includes('storage')) {
        userFriendlyMessage += 'Local storage error. Please check browser permissions.';
      } else if (error.message.includes('Invalid')) {
        userFriendlyMessage += 'Server returned invalid data format.';
      } else if (error.message.includes('timeout')) {
        userFriendlyMessage += 'Connection timeout. Please check your internet connection.';
      } else {
        userFriendlyMessage += 'Unknown error occurred. Please check your internet connection.';
      }
      
      if (retryCount >= maxRetries) {
        userFriendlyMessage += ` (Failed after ${maxRetries + 1} attempts)`;
      }
      
      setSyncError(userFriendlyMessage);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, queryClient]);

  // Auto-sync when coming online with debounce
  useEffect(() => {
    if (!isOnline || !isInitialized || isSyncing) return;
    
    const shouldSync = () => {
      if (!lastSyncTime) return true;
      
      // Sync if last sync was more than 1 hour ago
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return lastSyncTime < oneHourAgo;
    };

    if (shouldSync()) {
      // Debounce auto-sync to avoid rapid successive calls
      const timeoutId = setTimeout(() => {
        syncPOIs(0); // Start with retry count 0
      }, 2000); // Wait 2 seconds before auto-sync
      
      return () => clearTimeout(timeoutId);
    }
  }, [isOnline, isInitialized, lastSyncTime, syncPOIs, isSyncing]);

  // Initialize on mount
  useEffect(() => {
    if (!isInitialized) {
      initializeOfflineStorage();
    }
  }, [isInitialized, initializeOfflineStorage]);

  // Initialize immediately if storage is not initialized
  useEffect(() => {
    if (!poiOfflineStorage.isInitialized && !isInitialized) {
      initializeOfflineStorage();
    }
  }, [initializeOfflineStorage, isInitialized]);

  return {
    isInitialized,
    lastSyncTime,
    isSyncing,
    syncError,
    syncPOIs: () => syncPOIs(0), // Always start with retry count 0 for manual sync
    clearError: () => setSyncError(null),
  };
}

/**
 * Hook to get POIs from offline storage with fallback to online
 */
export function usePOIsOffline(filters: POIFilters = {}) {
  const { isOnline } = useConnectionStatus();
  const { isInitialized } = usePOIOfflineSync();

  return useQuery({
    queryKey: POI_OFFLINE_QUERY_KEYS.list(filters),
    queryFn: async (): Promise<POI[]> => {
      if (!isInitialized) {
        // Return empty array instead of throwing error
        console.warn('Offline storage not initialized, returning empty POI array');
        return [];
      }

      // If online, try to get fresh data first
      if (isOnline) {
        try {
          const params = new URLSearchParams();
          if (filters.type) params.append('type', filters.type);
          if (filters.search) params.append('search', filters.search);
          if (filters.minLat !== undefined) params.append('minLat', filters.minLat.toString());
          if (filters.maxLat !== undefined) params.append('maxLat', filters.maxLat.toString());
          if (filters.minLng !== undefined) params.append('minLng', filters.minLng.toString());
          if (filters.maxLng !== undefined) params.append('maxLng', filters.maxLng.toString());
          if (filters.lat !== undefined) params.append('lat', filters.lat.toString());
          if (filters.lng !== undefined) params.append('lng', filters.lng.toString());
          if (filters.radius !== undefined) params.append('radius', filters.radius.toString());

          const response = await apiClient.get(`/api/v1/poi?${params.toString()}`);
          return Array.isArray(response) ? response : response.data || [];
        } catch (error) {
          console.warn('Failed to fetch POIs online, falling back to offline data:', error);
        }
      }

      // Fallback to offline data with error handling
      try {
        let pois: POI[];

        if (filters.search) {
          pois = await poiOfflineStorage.searchPOIs(filters.search);
        } else if (filters.type) {
          pois = await poiOfflineStorage.getPOIsByType(filters.type);
        } else if (filters.minLat !== undefined && filters.maxLat !== undefined && 
                   filters.minLng !== undefined && filters.maxLng !== undefined) {
          pois = await poiOfflineStorage.getPOIsInBounds({
            north: filters.maxLat,
            south: filters.minLat,
            east: filters.maxLng,
            west: filters.minLng,
          });
        } else {
          pois = await poiOfflineStorage.getPOIs();
        }

        // Apply additional client-side filtering
        if (filters.type && !filters.search) {
          pois = pois.filter(poi => poi.type === filters.type);
        }

        return pois || [];
      } catch (error) {
        console.warn('Failed to get offline POI data, returning empty array:', error);
        return [];
      }
    },
    enabled: isInitialized,
    staleTime: isOnline ? 2 * 60 * 1000 : Infinity, // 2 minutes online, never stale offline
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry if offline storage is not initialized
      if (error.message.includes('not initialized')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Hook to get POI statistics from offline storage
 */
export function usePOIStatisticsOffline() {
  const { isOnline } = useConnectionStatus();
  const { isInitialized } = usePOIOfflineSync();

  return useQuery({
    queryKey: POI_OFFLINE_QUERY_KEYS.stats(),
    queryFn: async (): Promise<POIStatistics> => {
      if (!isInitialized) {
        // Return default stats structure instead of null
        return {
          totalCount: 0,
          acheteurCount: 0,
          cooperativeCount: 0,
          entrepotCount: 0
        };
      }

      // If online, try to get fresh data first
      if (isOnline) {
        try {
          const response = await apiClient.get('/api/v1/poi/stats');
          return response;
        } catch (error) {
          console.warn('Failed to fetch POI stats online, falling back to offline data:', error);
        }
      }

      // Fallback to offline data
      try {
        const stats = await poiOfflineStorage.getStatistics();
        // Return default structure if no stats available
        return stats || {
          total: 0,
          buyers: 0,
          cooperatives: 0,
          warehouses: 0,
          lastUpdated: new Date().toISOString()
        };
      } catch (error) {
        console.warn('Failed to get offline POI statistics:', error);
        // Return default structure on error
        return {
          totalCount: 0,
          acheteurCount: 0,
          cooperativeCount: 0,
          entrepotCount: 0
        };
      }
    },
    enabled: isInitialized,
    staleTime: isOnline ? 10 * 60 * 1000 : Infinity, // 10 minutes online, never stale offline
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: false, // Don't retry failed queries to avoid loops
  });
}

/**
 * Hook to check if POI data is available offline
 */
export function usePOIDataAvailability() {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [dataSize, setDataSize] = useState<{ pois: number; stats: boolean } | null>(null);
  const { isInitialized } = usePOIOfflineSync();

  useEffect(() => {
    const checkAvailability = async () => {
      // Wait for offline storage to be initialized
      if (!isInitialized) {
        setIsAvailable(false);
        setDataSize({ pois: 0, stats: false });
        return;
      }

      try {
        const available = await poiOfflineStorage.isDataAvailable();
        const size = await poiOfflineStorage.getDataSize();
        setIsAvailable(available);
        setDataSize(size);
      } catch (error) {
        console.error('Failed to check POI data availability:', error);
        setIsAvailable(false);
        setDataSize({ pois: 0, stats: false });
      }
    };

    checkAvailability();
  }, [isInitialized]); // Re-run when initialization status changes

  return {
    isAvailable,
    dataSize,
    isLoading: isAvailable === null,
  };
}

/**
 * Hook to preload POI data for offline use
 */
export function usePOIPreload() {
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [preloadError, setPreloadError] = useState<string | null>(null);

  const preloadPOIs = useCallback(async () => {
    setIsPreloading(true);
    setPreloadProgress(0);
    setPreloadError(null);

    try {
      console.log('Starting POI preload...');

      // Initialize offline storage
      await poiOfflineStorage.init();
      setPreloadProgress(25);

      // Fetch all POIs
      const poisResponse = await apiClient.get('/api/v1/poi');
      setPreloadProgress(50);

      // Fetch statistics
      const statsResponse = await apiClient.get('/api/v1/poi/stats');
      setPreloadProgress(75);

      // Store in offline storage
      await Promise.all([
        poiOfflineStorage.storePOIs(Array.isArray(poisResponse) ? poisResponse : poisResponse.data),
        poiOfflineStorage.storeStatistics(statsResponse),
      ]);

      setPreloadProgress(100);
      const poisArray = Array.isArray(poisResponse) ? poisResponse : poisResponse.data;
      console.log(`POI preload completed: ${poisArray.length} POIs stored`);

    } catch (error) {
      console.error('POI preload failed:', error);
      setPreloadError('Failed to preload POI data');
    } finally {
      setIsPreloading(false);
    }
  }, []);

  return {
    isPreloading,
    preloadProgress,
    preloadError,
    preloadPOIs,
    clearError: () => setPreloadError(null),
  };
}
