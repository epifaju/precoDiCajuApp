import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exporterApiService } from '../services/exporterApi';
import { 
  Exportateur, 
  ExportateurFilters, 
  ExportateurCreateRequest, 
  ExportateurUpdateRequest,
  VerificationResult,
  ExportateurType,
  StatutType
} from '../types/exporter';
import { useNotificationStore } from '../store/notificationStore';

// Helper function to safely serialize objects for query keys
const safeSerializeFilters = (filters: ExportateurFilters | undefined): string => {
  if (!filters) return '';
  
  try {
    // Create a completely new object to avoid any potential circular references
    const cleanFilters: Record<string, string> = {};
    
    // Only process known filter properties to avoid any unexpected properties
    const allowedKeys: (keyof ExportateurFilters)[] = ['regionCode', 'type', 'statut', 'nom'];
    
    for (const key of allowedKeys) {
      const value = filters[key];
      if (value !== undefined && value !== null && value !== '') {
        cleanFilters[key] = String(value);
      }
    }
    
    // Create a deterministic string representation
    const sortedKeys = Object.keys(cleanFilters).sort();
    return sortedKeys.map(key => `${key}:${cleanFilters[key]}`).join('|');
  } catch (error) {
    // Fallback: return empty string if there's any issue
    console.warn('Error serializing filters:', error);
    return '';
  }
};

export interface UseExportersOptions {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
  filters?: ExportateurFilters;
}

/**
 * Hook principal pour la gestion des exportateurs
 */
export const useExporters = (options: UseExportersOptions = {}) => {
  const queryClient = useQueryClient();
  const { addToast } = useNotificationStore();
  
  const {
    page = 0,
    size = 20,
    sortBy = 'nom',
    sortDir = 'asc',
    filters
  } = options;

  // Query pour récupérer les exportateurs
  const {
    data: exportateursData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['exportateurs', page, size, sortBy, sortDir, safeSerializeFilters(filters)],
    queryFn: () => exporterApiService.getExportateurs(page, size, sortBy, sortDir, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 401/403 errors
      if (error?.status === 401 || error?.status === 403) {
        return false;
      }
      // Retry up to 3 times for network errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Mutation pour créer un exportateur
  const createMutation = useMutation({
    mutationFn: (data: ExportateurCreateRequest) => exporterApiService.createExportateur(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exportateurs'] });
      addToast({
        id: Date.now().toString(),
        type: 'success',
        title: 'Exportateur créé',
        message: 'L\'exportateur a été créé avec succès.'
      });
    },
    onError: (error: any) => {
      addToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Erreur',
        message: error.response?.data?.message || 'Erreur lors de la création de l\'exportateur.'
      });
    }
  });

  // Mutation pour mettre à jour un exportateur
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ExportateurUpdateRequest }) => 
      exporterApiService.updateExportateur(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exportateurs'] });
      addToast({
        id: Date.now().toString(),
        type: 'success',
        title: 'Exportateur mis à jour',
        message: 'L\'exportateur a été mis à jour avec succès.'
      });
    },
    onError: (error: any) => {
      addToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Erreur',
        message: error.response?.data?.message || 'Erreur lors de la mise à jour de l\'exportateur.'
      });
    }
  });

  // Mutation pour supprimer un exportateur
  const deleteMutation = useMutation({
    mutationFn: (id: string) => exporterApiService.deleteExportateur(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exportateurs'] });
      addToast({
        id: Date.now().toString(),
        type: 'success',
        title: 'Exportateur supprimé',
        message: 'L\'exportateur a été supprimé avec succès.'
      });
    },
    onError: (error: any) => {
      addToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Erreur',
        message: error.response?.data?.message || 'Erreur lors de la suppression de l\'exportateur.'
      });
    }
  });

  return {
    exportateurs: exportateursData?.content || [],
    totalElements: exportateursData?.totalElements || 0,
    totalPages: exportateursData?.totalPages || 0,
    currentPage: exportateursData?.number || 0,
    isLoading,
    error,
    refetch,
    createExportateur: createMutation.mutate,
    updateExportateur: updateMutation.mutate,
    deleteExportateur: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};

/**
 * Hook pour récupérer un exportateur spécifique
 */
export const useExporter = (id: string) => {
  const queryClient = useQueryClient();
  const { addToast } = useNotificationStore();

  const {
    data: exportateur,
    isLoading,
    error
  } = useQuery({
    queryKey: ['exportateur', id],
    queryFn: () => exporterApiService.getExportateurById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000
  });

  // Mutation pour mettre à jour
  const updateMutation = useMutation({
    mutationFn: (data: ExportateurUpdateRequest) => 
      exporterApiService.updateExportateur(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exportateur', id] });
      queryClient.invalidateQueries({ queryKey: ['exportateurs'] });
      addToast({
        id: Date.now().toString(),
        type: 'success',
        title: 'Exportateur mis à jour',
        message: 'L\'exportateur a été mis à jour avec succès.'
      });
    },
    onError: (error: any) => {
      addToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Erreur',
        message: error.response?.data?.message || 'Erreur lors de la mise à jour.'
      });
    }
  });

  return {
    exportateur,
    isLoading,
    error,
    updateExportateur: updateMutation.mutate,
    isUpdating: updateMutation.isPending
  };
};

/**
 * Hook pour la vérification QR
 */
export const useQRVerification = () => {
  const { addToast } = useNotificationStore();

  const verifyMutation = useMutation({
    mutationFn: (qrToken: string) => exporterApiService.verifyByQrToken(qrToken),
    onError: (error: any) => {
      addToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Erreur de vérification',
        message: error.response?.data?.message || 'Erreur lors de la vérification du QR code.'
      });
    }
  });

  return {
    verifyQR: verifyMutation.mutate,
    verificationResult: verifyMutation.data,
    isVerifying: verifyMutation.isPending,
    error: verifyMutation.error
  };
};

/**
 * Hook pour les statistiques des exportateurs
 */
export const useExporterStats = () => {
  const {
    data: statistics,
    isLoading,
    error
  } = useQuery({
    queryKey: ['exportateur-statistics'],
    queryFn: () => exporterApiService.getStatistics(),
    staleTime: 10 * 60 * 1000 // 10 minutes
  });

  return {
    statistics,
    isLoading,
    error
  };
};

/**
 * Hook pour les exportateurs expirant bientôt
 */
export const useExpiringExporters = (days: number = 30) => {
  const {
    data: expiringExporters,
    isLoading,
    error
  } = useQuery({
    queryKey: ['expiring-exporters', days],
    queryFn: () => exporterApiService.getExpiringSoon(days),
    staleTime: 30 * 60 * 1000 // 30 minutes
  });

  return {
    expiringExporters: expiringExporters || [],
    isLoading,
    error
  };
};
