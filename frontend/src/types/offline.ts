// Types et interfaces pour la fonctionnalité PWA Offline
import { CreatePriceRequest } from './api';

// Statuts de synchronisation
export enum SyncStatus {
  PENDING = 'pending',
  SYNCING = 'syncing',
  SYNCED = 'synced',
  CONFLICT = 'conflict',
  ERROR = 'error',
  RETRY = 'retry'
}

// Types d'actions de synchronisation
export enum SyncAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete'
}

// Types d'entités
export enum SyncEntity {
  PRICE = 'price',
  USER = 'user',
  REGION = 'region',
  QUALITY = 'quality'
}

// Interface pour les données de prix stockées offline
export interface OfflinePriceData {
  id: string;
  data: CreatePriceRequest;
  status: SyncStatus;
  createdAt: string;
  syncedAt?: string;
  retryCount: number;
  lastError?: string;
  photoData?: string; // Base64 pour les photos offline
  photoFileName?: string;
}

// Interface pour la queue de synchronisation
export interface SyncQueueItem {
  id: string;
  action: SyncAction;
  entity: SyncEntity;
  entityId: string;
  data: any;
  priority: number;
  attempts: number;
  maxAttempts: number;
  nextRetry: string;
  createdAt: string;
  lastAttempt?: string;
  lastError?: string;
}

// Interface pour les métadonnées de synchronisation
export interface SyncMetadata {
  lastSync: string;
  pendingCount: number;
  conflictCount: number;
  errorCount: number;
  isOnline: boolean;
  lastOnlineCheck: string;
  totalOfflineActions: number;
  successfulSyncs: number;
}

// Interface pour la configuration du stockage offline
export interface OfflineConfig {
  maxRetryAttempts: number;
  retryDelayMs: number;
  maxRetryDelayMs: number;
  syncBatchSize: number;
  maxOfflineStorageDays: number;
  compressionEnabled: boolean;
}

// Interface pour les statistiques de stockage
export interface StorageStats {
  totalSize: number;
  priceCount: number;
  queueCount: number;
  oldestItem: string;
  newestItem: string;
  compressionRatio?: number;
}

// Interface pour les événements de synchronisation
export interface SyncEvent {
  type: 'sync_started' | 'sync_completed' | 'sync_failed' | 'conflict_detected';
  timestamp: string;
  details?: any;
  error?: string;
}

// Interface pour la résolution de conflits
export interface ConflictResolution {
  conflictId: string;
  localData: any;
  serverData: any;
  resolution: 'local' | 'server' | 'merge' | 'manual';
  resolvedAt: string;
  resolvedBy: string;
}

// Interface pour les données de référence offline
export interface OfflineReferenceData {
  regions: any[];
  qualities: any[];
  users: any[];
  lastUpdated: string;
  version: string;
}

// Interface pour les paramètres de stockage
export interface StorageParams {
  dbName: string;
  version: number;
  stores: {
    prices: string;
    syncQueue: string;
    metadata: string;
    conflicts: string;
    referenceData: string;
    events: string;
  };
}

// Interface pour les résultats d'opérations
export interface StorageResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// Interface pour les options de requête
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  filter?: Record<string, any>;
}

// Interface pour les callbacks de synchronisation
export interface SyncCallbacks {
  onSyncStart?: () => void;
  onSyncProgress?: (progress: number) => void;
  onSyncComplete?: (stats: SyncMetadata) => void;
  onSyncError?: (error: string) => void;
  onConflictDetected?: (conflict: ConflictResolution) => void;
}

// Interface pour la configuration de compression
export interface CompressionConfig {
  enabled: boolean;
  algorithm: 'gzip' | 'lz4' | 'none';
  threshold: number; // Taille minimum pour compression
  quality?: number; // Pour les images
}

// Interface pour les métriques de performance
export interface PerformanceMetrics {
  readTime: number;
  writeTime: number;
  syncTime: number;
  compressionTime?: number;
  decompressionTime?: number;
  cacheHitRate: number;
  errorRate: number;
}

// Types utilitaires
export type OfflineStorageKey = keyof OfflinePriceData;
export type SyncQueueKey = keyof SyncQueueItem;
export type StorageOperation = 'read' | 'write' | 'delete' | 'clear';

// Constantes de configuration par défaut
export const DEFAULT_OFFLINE_CONFIG: OfflineConfig = {
  maxRetryAttempts: 3,
  retryDelayMs: 1000,
  maxRetryDelayMs: 30000,
  syncBatchSize: 10,
  maxOfflineStorageDays: 30,
  compressionEnabled: true
};

export const DEFAULT_STORAGE_PARAMS: StorageParams = {
  dbName: 'PrecoCajuOffline',
  version: 1,
  stores: {
    prices: 'offline_prices',
    syncQueue: 'sync_queue',
    metadata: 'sync_metadata',
    conflicts: 'conflicts',
    referenceData: 'reference_data',
    events: 'sync_events'
  }
};

export const DEFAULT_COMPRESSION_CONFIG: CompressionConfig = {
  enabled: true,
  algorithm: 'gzip',
  threshold: 1024, // 1KB
  quality: 0.8
};
