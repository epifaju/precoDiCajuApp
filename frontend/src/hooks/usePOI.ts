import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/apiClient';
import { POI, POIStatistics, CreatePOIRequest, UpdatePOIRequest, POIFilters } from '../types/poi';

// Query keys
export const POI_QUERY_KEYS = {
  all: ['pois'] as const,
  lists: () => [...POI_QUERY_KEYS.all, 'list'] as const,
  list: (filters: POIFilters) => [...POI_QUERY_KEYS.lists(), filters] as const,
  details: () => [...POI_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...POI_QUERY_KEYS.details(), id] as const,
  stats: () => [...POI_QUERY_KEYS.all, 'stats'] as const,
  withPhone: () => [...POI_QUERY_KEYS.all, 'with-phone'] as const,
} as const;

/**
 * Hook to fetch POIs with filters
 */
export function usePOIs(filters: POIFilters = {}) {
  return useQuery<POI[], Error>({
    queryKey: POI_QUERY_KEYS.list(filters),
    queryFn: async (): Promise<POI[]> => {
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

      // Avec retry automatique pour les requêtes de liste
      return await apiClient.get<POI[]>(`/api/v1/poi?${params.toString()}`, { 
        timeout: 15000, // 15s pour les listes qui peuvent être plus lentes 
        retries: 2 // 2 tentatives en cas d'échec
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Ne pas faire de retry TanStack Query si l'erreur est déjà une erreur client (4xx)
      if (typeof error === 'object' && error !== null && 'isApiError' in error) {
        const apiError = error as any;
        if (apiError.status >= 400 && apiError.status < 500) {
          return false; // Pas de retry pour les erreurs client
        }
      }
      return failureCount < 3; // Max 3 tentatives au niveau TanStack Query
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Backoff exponentiel
  });
}

/**
 * Hook to fetch a single POI by ID
 */
export function usePOI(id: string) {
  return useQuery({
    queryKey: POI_QUERY_KEYS.detail(id),
    queryFn: async (): Promise<POI> => {
      return await apiClient.get<POI>(`/api/v1/poi/${id}`, {
        timeout: 10000, // 10s pour un seul POI
        retries: 1 // 1 retry pour les détails
      });
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      // Pas de retry pour les erreurs 404 (POI non trouvé)
      if (typeof error === 'object' && error !== null && 'isApiError' in error) {
        const apiError = error as any;
        if (apiError.status === 404) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
}

/**
 * Hook to fetch POI statistics
 */
export function usePOIStatistics() {
  return useQuery({
    queryKey: POI_QUERY_KEYS.stats(),
    queryFn: async (): Promise<POIStatistics> => {
      return await apiClient.get<POIStatistics>('/api/v1/poi/stats', {
        timeout: 10000,
        retries: 1
      });
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch POIs with phone numbers
 */
export function usePOIsWithPhone() {
  return useQuery({
    queryKey: POI_QUERY_KEYS.withPhone(),
    queryFn: async (): Promise<POI[]> => {
      return await apiClient.get<POI[]>('/api/v1/poi/with-phone', {
        timeout: 10000,
        retries: 1
      });
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to create a new POI (admin only)
 */
export function useCreatePOI() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePOIRequest): Promise<POI> => {
      return await apiClient.post<POI>('/api/v1/poi', data, {
        timeout: 15000,
        retries: 0 // Pas de retry pour la création
      });
    },
    onSuccess: () => {
      // Invalidate all POI queries to refresh the data
      queryClient.invalidateQueries({ queryKey: POI_QUERY_KEYS.all });
    },
  });
}

/**
 * Hook to update a POI (admin only)
 */
export function useUpdatePOI() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePOIRequest }): Promise<POI> => {
      return await apiClient.put<POI>(`/api/v1/poi/${id}`, data, {
        timeout: 15000,
        retries: 0 // Pas de retry pour la modification
      });
    },
    onSuccess: (updatedPOI) => {
      // Update the specific POI in cache
      queryClient.setQueryData(POI_QUERY_KEYS.detail(updatedPOI.id), updatedPOI);
      
      // Invalidate list queries to refresh
      queryClient.invalidateQueries({ queryKey: POI_QUERY_KEYS.lists() });
    },
  });
}

/**
 * Hook to delete a POI (admin only)
 */
export function useDeletePOI() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete<void>(`/api/v1/poi/${id}`, {
        timeout: 10000,
        retries: 0 // Pas de retry pour la suppression
      });
    },
    onSuccess: (_, deletedId) => {
      // Remove the POI from cache
      queryClient.removeQueries({ queryKey: POI_QUERY_KEYS.detail(deletedId) });
      
      // Invalidate all POI queries to refresh
      queryClient.invalidateQueries({ queryKey: POI_QUERY_KEYS.all });
    },
  });
}

/**
 * Hook to get POIs within map bounds
 */
export function usePOIsInBounds(bounds: {
  north: number;
  south: number;
  east: number;
  west: number;
}) {
  return usePOIs({
    minLat: bounds.south,
    maxLat: bounds.north,
    minLng: bounds.west,
    maxLng: bounds.east,
  });
}

/**
 * Hook to get POIs near a point
 */
export function usePOIsNearPoint(lat: number, lng: number, radius: number = 10000) {
  return usePOIs({ lat, lng, radius });
}

/**
 * Hook to search POIs by name
 */
export function usePOISearch(searchTerm: string) {
  return usePOIs({ search: searchTerm });
}

/**
 * Hook to get POIs by type
 */
export function usePOIsByType(type: POI['type']) {
  return usePOIs({ type });
}
