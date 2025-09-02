import { QueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 401/403 errors
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry mutations on client errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

// Query keys factory
export const queryKeys = {
  // Auth
  currentUser: ['user', 'current'] as const,
  
  // Regions
  regions: ['regions'] as const,
  region: (code: string) => ['regions', code] as const,
  
  // Quality grades
  qualities: ['qualities'] as const,
  quality: (code: string) => ['qualities', code] as const,
  
  // Prices
  prices: ['prices'] as const,
  pricesList: (filters: Record<string, any>) => ['prices', 'list', filters] as const,
  price: (id: string) => ['prices', id] as const,
  priceStats: (filters: Record<string, any>) => ['prices', 'stats', filters] as const,
  userPrices: (userId: string, filters: Record<string, any>) => ['prices', 'user', userId, filters] as const,
  unverifiedPrices: (filters: Record<string, any>) => ['prices', 'unverified', filters] as const,
  
  // Files
  fileInfo: ['files', 'info'] as const,
} as const;

// Error handler for React Query
export const queryErrorHandler = (error: any) => {
  // Handle authentication errors
  if (error?.status === 401) {
    const { logout } = useAuthStore.getState();
    logout();
    window.location.href = '/login';
    return;
  }
  
  // Log other errors
  console.error('Query error:', error);
  
  // Show toast notification
  if (typeof window !== 'undefined' && 'toast' in window) {
    // Assume toast library is available globally
    (window as any).toast?.error?.(
      error?.message || 'An unexpected error occurred'
    );
  }
};

// Set global error handler
queryClient.setMutationDefaults(['*'], {
  onError: queryErrorHandler,
});

queryClient.setQueryDefaults(['*'], {
  onError: queryErrorHandler,
});





