import { apiClient } from './apiClient';
import {
  UserConfigDTO,
  UserPreferencesDTO,
  NotificationPreferencesDTO,
  UpdateUserConfigRequest,
  UserPreferencesRequest,
  NotificationPreferencesRequest,
  ConfigSaveResult,
} from '../types/config';

/**
 * Service for managing user configuration
 */
export class UserConfigService {
  private static readonly BASE_URL = '/api/v1/users/me';

  /**
   * Get complete user configuration
   */
  static async getConfig(): Promise<UserConfigDTO> {
    try {
      const response = await apiClient.get<UserConfigDTO>(`${this.BASE_URL}/config`);
      return response;
    } catch (error) {
      console.error('Error fetching user configuration:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update complete user configuration
   */
  static async updateConfig(config: UpdateUserConfigRequest): Promise<UserConfigDTO> {
    try {
      const response = await apiClient.put<UserConfigDTO>(`${this.BASE_URL}/config`, config);
      return response;
    } catch (error) {
      console.error('Error updating user configuration:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get user preferences
   */
  static async getPreferences(): Promise<UserPreferencesDTO> {
    try {
      const response = await apiClient.get<UserPreferencesDTO>(`${this.BASE_URL}/preferences`);
      return response;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update user preferences
   */
  static async updatePreferences(preferences: UserPreferencesRequest): Promise<UserPreferencesDTO> {
    try {
      const response = await apiClient.put<UserPreferencesDTO>(`${this.BASE_URL}/preferences`, preferences);
      return response;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get notification preferences
   */
  static async getNotificationPreferences(): Promise<NotificationPreferencesDTO> {
    try {
      const response = await apiClient.get<NotificationPreferencesDTO>(`${this.BASE_URL}/notification-preferences`);
      return response;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update notification preferences
   */
  static async updateNotificationPreferences(
    preferences: NotificationPreferencesRequest
  ): Promise<NotificationPreferencesDTO> {
    try {
      const response = await apiClient.put<NotificationPreferencesDTO>(
        `${this.BASE_URL}/notification-preferences`,
        preferences
      );
      return response;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Save configuration with validation and error handling
   */
  static async saveConfig(config: UpdateUserConfigRequest): Promise<ConfigSaveResult> {
    try {
      const updatedConfig = await this.updateConfig(config);
      
      // If language changed in preferences, also update the user's preferredLanguage field
      if (config.preferences?.language) {
        try {
          await apiClient.put('/api/v1/users/me', {
            preferredLanguage: config.preferences.language,
            preferredRegions: config.preferences.preferredRegions || []
          });
        } catch (error) {
          console.warn('Failed to update user preferredLanguage:', error);
          // Don't fail the whole operation if this fails
        }
      }
      
      return {
        success: true,
        message: 'Configurações salvas com sucesso!',
        updatedConfig,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Erro ao salvar configurações',
        errors: error.errors || {},
      };
    }
  }

  /**
   * Save preferences with validation and error handling
   */
  static async savePreferences(preferences: UserPreferencesRequest): Promise<ConfigSaveResult> {
    try {
      const updatedPreferences = await this.updatePreferences(preferences);
      
      // If language changed, also update the user's preferredLanguage field
      if (preferences.language) {
        try {
          await apiClient.put('/api/v1/users/me', {
            preferredLanguage: preferences.language,
            preferredRegions: preferences.preferredRegions || []
          });
        } catch (error) {
          console.warn('Failed to update user preferredLanguage:', error);
          // Don't fail the whole operation if this fails
        }
      }
      
      return {
        success: true,
        message: 'Preferências salvas com sucesso!',
        updatedConfig: {
          preferences: updatedPreferences,
        } as UserConfigDTO,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Erro ao salvar preferências',
        errors: error.errors || {},
      };
    }
  }

  /**
   * Save notification preferences with validation and error handling
   */
  static async saveNotificationPreferences(
    preferences: NotificationPreferencesRequest
  ): Promise<ConfigSaveResult> {
    try {
      const updatedPreferences = await this.updateNotificationPreferences(preferences);
      return {
        success: true,
        message: 'Preferências de notificação salvas com sucesso!',
        updatedConfig: {
          notificationPreferences: updatedPreferences,
        } as UserConfigDTO,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Erro ao salvar preferências de notificação',
        errors: error.errors || {},
      };
    }
  }

  /**
   * Validate configuration data
   */
  static validateConfig(config: UpdateUserConfigRequest): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    // Validate full name
    if (config.fullName !== undefined) {
      if (!config.fullName || config.fullName.trim().length < 2) {
        errors.fullName = 'Nome deve ter pelo menos 2 caracteres';
      } else if (config.fullName.length > 100) {
        errors.fullName = 'Nome deve ter no máximo 100 caracteres';
      }
    }

    // Validate phone
    if (config.phone !== undefined && config.phone) {
      const phoneRegex = /^\+?[0-9]{8,15}$/;
      if (!phoneRegex.test(config.phone)) {
        errors.phone = 'Número de telefone inválido';
      }
    }

    // Validate preferences
    if (config.preferences) {
      const prefErrors = this.validatePreferences(config.preferences);
      Object.assign(errors, prefErrors);
    }

    // Validate notification preferences
    if (config.notificationPreferences) {
      const notifErrors = this.validateNotificationPreferences(config.notificationPreferences);
      Object.assign(errors, notifErrors);
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Validate user preferences
   */
  private static validatePreferences(preferences: UserPreferencesRequest): Record<string, string> {
    const errors: Record<string, string> = {};

    // Validate language
    if (preferences.language && !['pt', 'fr', 'en'].includes(preferences.language)) {
      errors.language = 'Idioma deve ser pt, fr ou en';
    }

    // Validate theme
    if (preferences.theme && !['light', 'dark', 'system'].includes(preferences.theme)) {
      errors.theme = 'Tema deve ser light, dark ou system';
    }

    // Validate timezone
    if (preferences.timezone && !/^[A-Za-z_/]+$/.test(preferences.timezone)) {
      errors.timezone = 'Fuso horário inválido';
    }

    return errors;
  }

  /**
   * Validate notification preferences
   */
  private static validateNotificationPreferences(
    preferences: NotificationPreferencesRequest
  ): Record<string, string> {
    const errors: Record<string, string> = {};

    // Validate alert threshold
    if (preferences.alertThreshold !== undefined) {
      if (preferences.alertThreshold < 1 || preferences.alertThreshold > 100) {
        errors.alertThreshold = 'Limiar de alerta deve estar entre 1% e 100%';
      }
    }

    // Validate frequency
    if (preferences.frequency && !['immediate', 'daily', 'weekly'].includes(preferences.frequency)) {
      errors.frequency = 'Frequência deve ser immediate, daily ou weekly';
    }

    // Validate time format
    if (preferences.quietStartTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(preferences.quietStartTime)) {
      errors.quietStartTime = 'Hora deve estar no formato HH:MM';
    }

    if (preferences.quietEndTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(preferences.quietEndTime)) {
      errors.quietEndTime = 'Hora deve estar no formato HH:MM';
    }

    return errors;
  }

  /**
   * Handle API errors
   */
  private static handleError(error: any): Error {
    if (error.isApiError) {
      // API error with structured data
      const message = error.data?.message || error.message || 'Erro da API';
      const errors = error.data?.details || error.data?.errors || {};
      
      const customError = new Error(message);
      (customError as any).status = error.status;
      (customError as any).errors = errors;
      return customError;
    } else if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      const message = data?.message || data?.error || `Erro do servidor (${status})`;
      const errors = data?.details || data?.errors || {};
      
      const customError = new Error(message);
      (customError as any).status = status;
      (customError as any).errors = errors;
      return customError;
    } else if (error.request) {
      // Network error
      return new Error('Erro de conexão. Verifique sua internet.');
    } else {
      // Other error
      return new Error(error.message || 'Erro desconhecido');
    }
  }

  /**
   * Reset configuration to defaults
   */
  static async resetToDefaults(): Promise<UserConfigDTO> {
    const defaultConfig: UpdateUserConfigRequest = {
      preferences: {
        language: 'pt',
        theme: 'system',
        preferredRegions: [],
        timezone: 'Africa/Bissau',
        offlineMode: false,
        autoSync: true,
      },
      notificationPreferences: {
        priceAlerts: true,
        verificationNotifications: true,
        systemNotifications: true,
        emailNotifications: false,
        pushNotifications: true,
        alertThreshold: 10,
        alertRegions: [],
        alertQualities: [],
        frequency: 'immediate',
        quietHours: false,
        quietStartTime: '22:00',
        quietEndTime: '08:00',
      },
    };

    return this.updateConfig(defaultConfig);
  }

  /**
   * Export configuration as JSON
   */
  static async exportConfig(): Promise<string> {
    const config = await this.getConfig();
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      config,
      metadata: {
        appVersion: process.env.VITE_APP_VERSION || '1.0.0',
        userAgent: navigator.userAgent,
        platform: navigator.platform,
      },
    };
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import configuration from JSON
   */
  static async importConfig(jsonData: string): Promise<UserConfigDTO> {
    try {
      const importData = JSON.parse(jsonData);
      
      if (!importData.config) {
        throw new Error('Dados de configuração inválidos');
      }

      // Validate the imported configuration
      const validation = this.validateConfig(importData.config);
      if (!validation.isValid) {
        throw new Error(`Configuração inválida: ${Object.values(validation.errors).join(', ')}`);
      }

      return this.updateConfig(importData.config);
    } catch (error) {
      throw new Error(`Erro ao importar configuração: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
}

// Export default instance
export const userConfigService = UserConfigService;

