import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthInterceptor } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import { queryKeys } from '../lib/queryClient';
import type { Price, PriceStats } from '../store/appStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Utility function to handle API responses
const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    let errorData = {};
    try {
      errorData = await response.json();
    } catch (e) {
      // Si la réponse n'est pas du JSON, créer un message d'erreur basique
      errorData = { 
        message: `Erreur HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
        statusText: response.statusText
      };
    }
    
    const error = new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    (error as any).status = response.status;
    (error as any).data = errorData;
    (error as any).statusText = response.statusText;
    
    // Log détaillé de l'erreur pour le débogage
    console.error('API Error Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      errorData: errorData
    });
    
    throw error;
  }
  return response.json();
};

// Generic API hook for admin operations
export const useApi = () => {
  const authFetch = useAuthInterceptor();
  
  return {
    get: async <T>(url: string): Promise<T> => {
      const response = await authFetch(`${API_BASE_URL}${url}`);
      return handleApiResponse(response);
    },
    
    post: async <T>(url: string, data?: any): Promise<T> => {
      const response = await authFetch(`${API_BASE_URL}${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });
      return handleApiResponse(response);
    },
    
    put: async <T>(url: string, data?: any): Promise<T> => {
      const response = await authFetch(`${API_BASE_URL}${url}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });
      return handleApiResponse(response);
    },
    
    delete: async (url: string): Promise<void> => {
      const response = await authFetch(`${API_BASE_URL}${url}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete: ${response.status}`);
      }
    },
  };
};

// Regions API
export const useRegions = () => {
  return useQuery({
    queryKey: queryKeys.regions,
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/regions`);
      return handleApiResponse(response);
    },
    staleTime: 30 * 60 * 1000, // 30 minutes (regions don't change often)
  });
};

export const useRegion = (code: string) => {
  return useQuery({
    queryKey: queryKeys.region(code),
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/regions/${code}`);
      return handleApiResponse(response);
    },
    enabled: !!code,
  });
};

// Quality grades API
export const useQualityGrades = () => {
  return useQuery({
    queryKey: queryKeys.qualities,
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/qualities`);
      return handleApiResponse(response);
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useQualityGrade = (code: string) => {
  return useQuery({
    queryKey: queryKeys.quality(code),
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/qualities/${code}`);
      return handleApiResponse(response);
    },
    enabled: !!code,
  });
};

// Prices API
interface PriceFilters {
  region?: string;
  quality?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export const usePrices = (filters: PriceFilters = {}) => {
  const { language } = useAppStore();
  
  return useQuery({
    queryKey: queryKeys.pricesList({ ...filters, language }),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
      
      const response = await fetch(`${API_BASE_URL}/api/v1/prices?${params}`, {
        headers: {
          'Accept-Language': language,
        },
      });
      
      return handleApiResponse(response);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (prices change more frequently)
  });
};

export const usePrice = (id: string) => {
  const { language } = useAppStore();
  
  return useQuery({
    queryKey: queryKeys.price(id),
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/prices/${id}`, {
        headers: {
          'Accept-Language': language,
        },
      });
      return handleApiResponse(response);
    },
    enabled: !!id,
  });
};

export const usePriceStats = (filters: { region?: string; quality?: string; days?: number } = {}) => {
  const { language } = useAppStore();
  
  return useQuery({
    queryKey: queryKeys.priceStats({ ...filters, language }),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
      
      const response = await fetch(`${API_BASE_URL}/api/v1/prices/stats?${params}`, {
        headers: {
          'Accept-Language': language,
        },
      });
      
      return handleApiResponse(response);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Price mutations
interface CreatePriceData {
  regionCode: string;
  qualityGrade: string;
  priceFcfa: number;
  recordedDate: string;
  sourceName?: string;
  sourceType?: string;
  gpsLat?: number;
  gpsLng?: number;
  notes?: string;
  photoFile?: File;
}

export const useCreatePrice = () => {
  const authFetch = useAuthInterceptor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreatePriceData) => {
      const formData = new FormData();
      
      // Add all fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, value.toString());
          }
        }
      });
      
      const response = await authFetch(`${API_BASE_URL}/api/v1/prices`, {
        method: 'POST',
        body: formData,
      });
      
      return handleApiResponse(response);
    },
    onSuccess: () => {
      // Invalidate and refetch prices
      queryClient.invalidateQueries({ queryKey: queryKeys.prices });
      queryClient.invalidateQueries({ queryKey: ['prices', 'stats'] });
    },
  });
};

export const useUpdatePrice = () => {
  const authFetch = useAuthInterceptor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreatePriceData> }) => {
      const formData = new FormData();
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, value.toString());
          }
        }
      });
      
      const response = await authFetch(`${API_BASE_URL}/api/v1/prices/${id}`, {
        method: 'PUT',
        body: formData,
      });
      
      return handleApiResponse(response);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prices });
      queryClient.invalidateQueries({ queryKey: queryKeys.price(variables.id) });
      queryClient.invalidateQueries({ queryKey: ['prices', 'stats'] });
    },
  });
};

export const useDeletePrice = () => {
  const authFetch = useAuthInterceptor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await authFetch(`${API_BASE_URL}/api/v1/prices/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete price: ${response.status}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prices });
      queryClient.invalidateQueries({ queryKey: ['prices', 'stats'] });
    },
  });
};

export const useVerifyPrice = () => {
  const authFetch = useAuthInterceptor();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await authFetch(`${API_BASE_URL}/api/v1/prices/${id}/verify`, {
        method: 'POST',
      });
      
      return handleApiResponse(response);
    },
    onSuccess: (data, priceId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prices });
      queryClient.invalidateQueries({ queryKey: queryKeys.price(priceId) });
      queryClient.invalidateQueries({ queryKey: ['prices', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['prices', 'unverified'] });
    },
  });
};

// User prices
export const useUserPrices = (userId: string, filters: PriceFilters = {}) => {
  const authFetch = useAuthInterceptor();
  const { language } = useAppStore();
  
  return useQuery({
    queryKey: queryKeys.userPrices(userId, { ...filters, language }),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
      
      const response = await authFetch(`${API_BASE_URL}/api/v1/prices/user/${userId}?${params}`, {
        headers: {
          'Accept-Language': language,
        },
      });
      
      return handleApiResponse(response);
    },
    enabled: !!userId,
  });
};

// Unverified prices (for moderators)
export const useUnverifiedPrices = (filters: PriceFilters = {}) => {
  const authFetch = useAuthInterceptor();
  const { language } = useAppStore();
  
  return useQuery({
    queryKey: queryKeys.unverifiedPrices({ ...filters, language }),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
      
      const response = await authFetch(`${API_BASE_URL}/api/v1/prices/unverified?${params}`, {
        headers: {
          'Accept-Language': language,
        },
      });
      
      return handleApiResponse(response);
    },
  });
};

// File upload
export const useFileUpload = () => {
  const authFetch = useAuthInterceptor();
  
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await authFetch(`${API_BASE_URL}/api/v1/files/upload`, {
        method: 'POST',
        body: formData,
      });
      
      return handleApiResponse(response);
    },
  });
};

// File info
export const useFileInfo = () => {
  return useQuery({
    queryKey: queryKeys.fileInfo,
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/files/info`);
      return handleApiResponse(response);
    },
    staleTime: 60 * 60 * 1000, // 1 hour (file info doesn't change)
  });
};

