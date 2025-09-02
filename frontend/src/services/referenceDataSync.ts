// Service de synchronisation des données de référence
import { offlineStorage } from './offlineStorage';
import { syncQueue, SyncPriority } from './syncQueue';
import {
  OfflineReferenceData,
  StorageResult,
  SyncEntity
} from '../types/offline';

// Interface pour les données de référence
interface ReferenceData {
  regions: any[];
  qualities: any[];
  users: any[];
  lastUpdated: string;
  version: string;
}

// Interface pour les options de synchronisation
interface SyncOptions {
  forceSync?: boolean;
  maxAge?: number; // Âge maximum en millisecondes
  priority?: SyncPriority;
}

// Classe de gestion de la synchronisation des données de référence
export class ReferenceDataSyncService {
  private syncInProgress = false;
  private lastSyncTime: string | null = null;
  private syncInterval: NodeJS.Timeout | null = null;

  // === SYNCHRONISATION DES DONNÉES DE RÉFÉRENCE ===

  // Synchroniser toutes les données de référence
  async syncAllReferenceData(options: SyncOptions = {}): Promise<StorageResult<ReferenceData>> {
    if (this.syncInProgress) {
      return {
        success: false,
        error: 'Synchronisation déjà en cours',
        timestamp: new Date().toISOString()
      };
    }

    this.syncInProgress = true;

    try {
      const results = await Promise.allSettled([
        this.syncRegions(options),
        this.syncQualities(options),
        this.syncUsers(options)
      ]);

      const regions = results[0].status === 'fulfilled' ? results[0].value : [];
      const qualities = results[1].status === 'fulfilled' ? results[1].value : [];
      const users = results[2].status === 'fulfilled' ? results[2].value : [];

      const referenceData: ReferenceData = {
        regions,
        qualities,
        users,
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      };

      // Sauvegarder les données de référence
      await this.saveReferenceData(referenceData);

      this.lastSyncTime = referenceData.lastUpdated;

      return {
        success: true,
        data: referenceData,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        timestamp: new Date().toISOString()
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  // Synchroniser les régions
  async syncRegions(options: SyncOptions = {}): Promise<any[]> {
    try {
      // Vérifier si on a besoin de synchroniser
      if (!options.forceSync && !this.shouldSync('regions', options.maxAge)) {
        const cached = await this.getCachedRegions();
        if (cached.length > 0) {
          return cached;
        }
      }

      const response = await fetch('/api/v1/regions', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      const regions = await response.json();
      
      // Sauvegarder en local
      await offlineStorage.saveReferenceData('regions', regions);
      
      return regions;
    } catch (error) {
      console.error('Erreur lors de la synchronisation des régions:', error);
      
      // Retourner les données en cache en cas d'erreur
      return await this.getCachedRegions();
    }
  }

  // Synchroniser les qualités
  async syncQualities(options: SyncOptions = {}): Promise<any[]> {
    try {
      // Vérifier si on a besoin de synchroniser
      if (!options.forceSync && !this.shouldSync('qualities', options.maxAge)) {
        const cached = await this.getCachedQualities();
        if (cached.length > 0) {
          return cached;
        }
      }

      const response = await fetch('/api/v1/qualities', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      const qualities = await response.json();
      
      // Sauvegarder en local
      await offlineStorage.saveReferenceData('qualities', qualities);
      
      return qualities;
    } catch (error) {
      console.error('Erreur lors de la synchronisation des qualités:', error);
      
      // Retourner les données en cache en cas d'erreur
      return await this.getCachedQualities();
    }
  }

  // Synchroniser les utilisateurs
  async syncUsers(options: SyncOptions = {}): Promise<any[]> {
    try {
      // Vérifier si on a besoin de synchroniser
      if (!options.forceSync && !this.shouldSync('users', options.maxAge)) {
        const cached = await this.getCachedUsers();
        if (cached.length > 0) {
          return cached;
        }
      }

      const response = await fetch('/api/v1/users', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      const users = await response.json();
      
      // Sauvegarder en local
      await offlineStorage.saveReferenceData('users', users);
      
      return users;
    } catch (error) {
      console.error('Erreur lors de la synchronisation des utilisateurs:', error);
      
      // Retourner les données en cache en cas d'erreur
      return await this.getCachedUsers();
    }
  }

  // === RÉCUPÉRATION DES DONNÉES EN CACHE ===

  // Récupérer les régions en cache
  async getCachedRegions(): Promise<any[]> {
    try {
      const result = await offlineStorage.getReferenceData('regions');
      return result.success && result.data ? result.data.regions : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des régions en cache:', error);
      return [];
    }
  }

  // Récupérer les qualités en cache
  async getCachedQualities(): Promise<any[]> {
    try {
      const result = await offlineStorage.getReferenceData('qualities');
      return result.success && result.data ? result.data.qualities : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des qualités en cache:', error);
      return [];
    }
  }

  // Récupérer les utilisateurs en cache
  async getCachedUsers(): Promise<any[]> {
    try {
      const result = await offlineStorage.getReferenceData('users');
      return result.success && result.data ? result.data.users : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs en cache:', error);
      return [];
    }
  }

  // Récupérer toutes les données de référence en cache
  async getCachedReferenceData(): Promise<ReferenceData> {
    try {
      const [regions, qualities, users] = await Promise.all([
        this.getCachedRegions(),
        this.getCachedQualities(),
        this.getCachedUsers()
      ]);

      return {
        regions,
        qualities,
        users,
        lastUpdated: this.lastSyncTime || new Date().toISOString(),
        version: '1.0'
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des données de référence:', error);
      return {
        regions: [],
        qualities: [],
        users: [],
        lastUpdated: new Date().toISOString(),
        version: '1.0'
      };
    }
  }

  // === GESTION DE LA SYNCHRONISATION AUTOMATIQUE ===

  // Démarrer la synchronisation automatique
  startAutoSync(intervalMs: number = 300000): void { // 5 minutes par défaut
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      if (navigator.onLine && !this.syncInProgress) {
        await this.syncAllReferenceData();
      }
    }, intervalMs);
  }

  // Arrêter la synchronisation automatique
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // === GESTION DES DONNÉES ===

  // Sauvegarder les données de référence
  private async saveReferenceData(data: ReferenceData): Promise<void> {
    try {
      await offlineStorage.saveReferenceData('regions', data.regions);
      await offlineStorage.saveReferenceData('qualities', data.qualities);
      await offlineStorage.saveReferenceData('users', data.users);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données de référence:', error);
    }
  }

  // Vérifier si on doit synchroniser
  private async shouldSync(dataType: string, maxAge?: number): Promise<boolean> {
    try {
      const result = await offlineStorage.getReferenceData(dataType);
      
      if (!result.success || !result.data) {
        return true; // Pas de données en cache, synchroniser
      }

      const lastUpdated = new Date(result.data.lastUpdated);
      const now = new Date();
      const age = now.getTime() - lastUpdated.getTime();
      const maxAgeMs = maxAge || 300000; // 5 minutes par défaut

      return age > maxAgeMs;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'âge des données:', error);
      return true; // En cas d'erreur, synchroniser
    }
  }

  // === GESTION DES CONFLITS ===

  // Résoudre les conflits de données de référence
  async resolveConflicts(conflictData: any): Promise<StorageResult<boolean>> {
    try {
      // Pour les données de référence, on privilégie généralement les données du serveur
      // car elles sont plus à jour et plus fiables
      
      const serverData = conflictData.serverData;
      const localData = conflictData.localData;

      // Comparer les versions ou timestamps
      const serverVersion = serverData.version || serverData.lastUpdated;
      const localVersion = localData.version || localData.lastUpdated;

      if (new Date(serverVersion) > new Date(localVersion)) {
        // Les données du serveur sont plus récentes
        await this.saveReferenceData(serverData);
        return { success: true, data: true, timestamp: new Date().toISOString() };
      } else {
        // Les données locales sont plus récentes ou égales
        // On peut choisir de garder les données locales ou de forcer la synchronisation
        return { success: true, data: true, timestamp: new Date().toISOString() };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        timestamp: new Date().toISOString()
      };
    }
  }

  // === NETTOYAGE ET MAINTENANCE ===

  // Nettoyer les anciennes données de référence
  async cleanupReferenceData(maxAgeDays: number = 30): Promise<StorageResult<boolean>> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

      // Vérifier l'âge des données de référence
      const referenceData = await this.getCachedReferenceData();
      const lastUpdated = new Date(referenceData.lastUpdated);

      if (lastUpdated < cutoffDate) {
        // Les données sont trop anciennes, les supprimer
        await offlineStorage.saveReferenceData('regions', []);
        await offlineStorage.saveReferenceData('qualities', []);
        await offlineStorage.saveReferenceData('users', []);
        
        return { success: true, data: true, timestamp: new Date().toISOString() };
      }

      return { success: true, data: false, timestamp: new Date().toISOString() };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Vérifier l'intégrité des données de référence
  async validateReferenceData(): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const data = await this.getCachedReferenceData();

      // Vérifier les régions
      if (!Array.isArray(data.regions)) {
        errors.push('Les régions ne sont pas un tableau valide');
      } else if (data.regions.length === 0) {
        warnings.push('Aucune région trouvée');
      } else {
        // Vérifier la structure des régions
        data.regions.forEach((region, index) => {
          if (!region.code || !region.namePt) {
            errors.push(`Région ${index} invalide: code ou nom manquant`);
          }
        });
      }

      // Vérifier les qualités
      if (!Array.isArray(data.qualities)) {
        errors.push('Les qualités ne sont pas un tableau valide');
      } else if (data.qualities.length === 0) {
        warnings.push('Aucune qualité trouvée');
      } else {
        // Vérifier la structure des qualités
        data.qualities.forEach((quality, index) => {
          if (!quality.code || !quality.namePt) {
            errors.push(`Qualité ${index} invalide: code ou nom manquant`);
          }
        });
      }

      // Vérifier les utilisateurs
      if (!Array.isArray(data.users)) {
        errors.push('Les utilisateurs ne sont pas un tableau valide');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    } catch (error) {
      errors.push(`Erreur lors de la validation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      return {
        isValid: false,
        errors,
        warnings
      };
    }
  }

  // === UTILITAIRES ===

  // Récupérer le token d'authentification
  private getAuthToken(): string {
    return localStorage.getItem('auth_token') || '';
  }

  // Obtenir le statut de la synchronisation
  getSyncStatus(): {
    isOnline: boolean;
    isSyncing: boolean;
    lastSyncTime: string | null;
    autoSyncActive: boolean;
  } {
    return {
      isOnline: navigator.onLine,
      isSyncing: this.syncInProgress,
      lastSyncTime: this.lastSyncTime,
      autoSyncActive: this.syncInterval !== null
    };
  }

  // Forcer la synchronisation
  async forceSync(): Promise<StorageResult<ReferenceData>> {
    return await this.syncAllReferenceData({ forceSync: true });
  }

  // Synchroniser en arrière-plan
  async backgroundSync(): Promise<void> {
    if (navigator.onLine && !this.syncInProgress) {
      try {
        await this.syncAllReferenceData();
      } catch (error) {
        console.error('Erreur lors de la synchronisation en arrière-plan:', error);
      }
    }
  }
}

// Instance singleton
export const referenceDataSync = new ReferenceDataSyncService();
