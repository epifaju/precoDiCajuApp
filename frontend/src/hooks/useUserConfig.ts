import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { userConfigService } from '../services/userConfigService';
import {
  UserConfigDTO,
  UserConfigFormData,
  UpdateUserConfigRequest,
  ConfigFormState,
  ConfigSaveResult,
  DEFAULT_USER_CONFIG,
} from '../types/config';

/**
 * Custom hook for managing user configuration
 */
export function useUserConfig() {
  const { user, updateUser } = useAuthStore();
  
  // State
  const [config, setConfig] = useState<UserConfigDTO | null>(null);
  const [formData, setFormData] = useState<UserConfigFormData | null>(null);
  const [formState, setFormState] = useState<ConfigFormState>({
    isLoading: false,
    isDirty: false,
    errors: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load user configuration
   */
  const loadConfig = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const userConfig = await userConfigService.getConfig();
      setConfig(userConfig);
      
      // Convert to form data
      const formData: UserConfigFormData = {
        fullName: userConfig.fullName || '',
        phone: userConfig.phone || '',
        language: userConfig.preferences?.language || DEFAULT_USER_CONFIG.language!,
        theme: userConfig.preferences?.theme || DEFAULT_USER_CONFIG.theme!,
        preferredRegions: userConfig.preferences?.preferredRegions || DEFAULT_USER_CONFIG.preferredRegions!,
        timezone: userConfig.preferences?.timezone || DEFAULT_USER_CONFIG.timezone!,
        offlineMode: userConfig.preferences?.offlineMode || DEFAULT_USER_CONFIG.offlineMode!,
        autoSync: userConfig.preferences?.autoSync || DEFAULT_USER_CONFIG.autoSync!,
        priceAlerts: userConfig.notificationPreferences?.priceAlerts || DEFAULT_USER_CONFIG.priceAlerts!,
        verificationNotifications: userConfig.notificationPreferences?.verificationNotifications || DEFAULT_USER_CONFIG.verificationNotifications!,
        systemNotifications: userConfig.notificationPreferences?.systemNotifications || DEFAULT_USER_CONFIG.systemNotifications!,
        emailNotifications: userConfig.notificationPreferences?.emailNotifications || DEFAULT_USER_CONFIG.emailNotifications!,
        pushNotifications: userConfig.notificationPreferences?.pushNotifications || DEFAULT_USER_CONFIG.pushNotifications!,
        alertThreshold: userConfig.notificationPreferences?.alertThreshold || DEFAULT_USER_CONFIG.alertThreshold!,
        alertRegions: userConfig.notificationPreferences?.alertRegions || DEFAULT_USER_CONFIG.alertRegions!,
        alertQualities: userConfig.notificationPreferences?.alertQualities || DEFAULT_USER_CONFIG.alertQualities!,
        frequency: userConfig.notificationPreferences?.frequency || DEFAULT_USER_CONFIG.frequency!,
        quietHours: userConfig.notificationPreferences?.quietHours || DEFAULT_USER_CONFIG.quietHours!,
        quietStartTime: userConfig.notificationPreferences?.quietStartTime || DEFAULT_USER_CONFIG.quietStartTime!,
        quietEndTime: userConfig.notificationPreferences?.quietEndTime || DEFAULT_USER_CONFIG.quietEndTime!,
      };
      
      setFormData(formData);
    } catch (err) {
      console.error('Error loading user configuration:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar configurações');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Update form data
   */
  const updateFormData = useCallback((updates: Partial<UserConfigFormData>) => {
    setFormData(prev => {
      if (!prev) return null;
      
      const newFormData = { ...prev, ...updates };
      
      // Mark as dirty if data has changed
      setFormState(prevState => ({
        ...prevState,
        isDirty: JSON.stringify(newFormData) !== JSON.stringify(prev),
      }));
      
      return newFormData;
    });
  }, []);

  /**
   * Save configuration
   */
  const saveConfig = useCallback(async (): Promise<ConfigSaveResult> => {
    if (!formData) {
      return {
        success: false,
        message: 'Nenhum dado para salvar',
        errors: {},
      };
    }

    try {
      setFormState(prev => ({ ...prev, isLoading: true, errors: {} }));
      
      // Prepare update request
      const updateRequest: UpdateUserConfigRequest = {
        fullName: formData.fullName,
        phone: formData.phone,
        preferences: {
          language: formData.language,
          theme: formData.theme,
          preferredRegions: formData.preferredRegions,
          timezone: formData.timezone,
          offlineMode: formData.offlineMode,
          autoSync: formData.autoSync,
        },
        notificationPreferences: {
          priceAlerts: formData.priceAlerts,
          verificationNotifications: formData.verificationNotifications,
          systemNotifications: formData.systemNotifications,
          emailNotifications: formData.emailNotifications,
          pushNotifications: formData.pushNotifications,
          alertThreshold: formData.alertThreshold,
          alertRegions: formData.alertRegions,
          alertQualities: formData.alertQualities,
          frequency: formData.frequency,
          quietHours: formData.quietHours,
          quietStartTime: formData.quietStartTime,
          quietEndTime: formData.quietEndTime,
        },
      };

      // Validate configuration
      const validation = userConfigService.validateConfig(updateRequest);
      if (!validation.isValid) {
        setFormState(prev => ({
          ...prev,
          isLoading: false,
          errors: validation.errors,
        }));
        return {
          success: false,
          message: 'Dados inválidos',
          errors: validation.errors,
        };
      }

      // Save configuration
      const result = await userConfigService.saveConfig(updateRequest);
      
      if (result.success && result.updatedConfig) {
        setConfig(result.updatedConfig);
        setFormState(prev => ({
          ...prev,
          isLoading: false,
          isDirty: false,
          lastSaved: new Date().toISOString(),
        }));
        
        // Update user in auth store if basic info changed
        if (updateRequest.fullName || updateRequest.phone) {
          updateUser({
            fullName: result.updatedConfig.fullName,
            phone: result.updatedConfig.phone,
          });
        }
      } else {
        setFormState(prev => ({
          ...prev,
          isLoading: false,
          errors: result.errors || {},
        }));
      }
      
      return result;
    } catch (err) {
      console.error('Error saving configuration:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar configurações';
      setFormState(prev => ({
        ...prev,
        isLoading: false,
        errors: { general: errorMessage },
      }));
      
      return {
        success: false,
        message: errorMessage,
        errors: { general: errorMessage },
      };
    }
  }, [formData, updateUser]);

  /**
   * Save specific preferences
   */
  const savePreferences = useCallback(async (): Promise<ConfigSaveResult> => {
    if (!formData) {
      return {
        success: false,
        message: 'Nenhum dado para salvar',
        errors: {},
      };
    }

    try {
      setFormState(prev => ({ ...prev, isLoading: true, errors: {} }));
      
      const preferencesRequest = {
        language: formData.language,
        theme: formData.theme,
        preferredRegions: formData.preferredRegions,
        timezone: formData.timezone,
        offlineMode: formData.offlineMode,
        autoSync: formData.autoSync,
      };

      const result = await userConfigService.savePreferences(preferencesRequest);
      
      if (result.success) {
        setFormState(prev => ({
          ...prev,
          isLoading: false,
          isDirty: false,
          lastSaved: new Date().toISOString(),
        }));
      } else {
        setFormState(prev => ({
          ...prev,
          isLoading: false,
          errors: result.errors || {},
        }));
      }
      
      return result;
    } catch (err) {
      console.error('Error saving preferences:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar preferências';
      setFormState(prev => ({
        ...prev,
        isLoading: false,
        errors: { general: errorMessage },
      }));
      
      return {
        success: false,
        message: errorMessage,
        errors: { general: errorMessage },
      };
    }
  }, [formData]);

  /**
   * Save notification preferences
   */
  const saveNotificationPreferences = useCallback(async (): Promise<ConfigSaveResult> => {
    if (!formData) {
      return {
        success: false,
        message: 'Nenhum dado para salvar',
        errors: {},
      };
    }

    try {
      setFormState(prev => ({ ...prev, isLoading: true, errors: {} }));
      
      const notificationRequest = {
        priceAlerts: formData.priceAlerts,
        verificationNotifications: formData.verificationNotifications,
        systemNotifications: formData.systemNotifications,
        emailNotifications: formData.emailNotifications,
        pushNotifications: formData.pushNotifications,
        alertThreshold: formData.alertThreshold,
        alertRegions: formData.alertRegions,
        alertQualities: formData.alertQualities,
        frequency: formData.frequency,
        quietHours: formData.quietHours,
        quietStartTime: formData.quietStartTime,
        quietEndTime: formData.quietEndTime,
      };

      const result = await userConfigService.saveNotificationPreferences(notificationRequest);
      
      if (result.success) {
        setFormState(prev => ({
          ...prev,
          isLoading: false,
          isDirty: false,
          lastSaved: new Date().toISOString(),
        }));
      } else {
        setFormState(prev => ({
          ...prev,
          isLoading: false,
          errors: result.errors || {},
        }));
      }
      
      return result;
    } catch (err) {
      console.error('Error saving notification preferences:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar preferências de notificação';
      setFormState(prev => ({
        ...prev,
        isLoading: false,
        errors: { general: errorMessage },
      }));
      
      return {
        success: false,
        message: errorMessage,
        errors: { general: errorMessage },
      };
    }
  }, [formData]);

  /**
   * Reset to defaults
   */
  const resetToDefaults = useCallback(async (): Promise<void> => {
    try {
      setFormState(prev => ({ ...prev, isLoading: true }));
      
      const defaultConfig = await userConfigService.resetToDefaults();
      setConfig(defaultConfig);
      
      // Reload form data
      await loadConfig();
      
      setFormState(prev => ({
        ...prev,
        isLoading: false,
        isDirty: false,
        errors: {},
      }));
    } catch (err) {
      console.error('Error resetting to defaults:', err);
      setError(err instanceof Error ? err.message : 'Erro ao redefinir configurações');
      setFormState(prev => ({ ...prev, isLoading: false }));
    }
  }, [loadConfig]);

  /**
   * Clear errors
   */
  const clearErrors = useCallback(() => {
    setFormState(prev => ({ ...prev, errors: {} }));
    setError(null);
  }, []);

  /**
   * Load configuration on mount
   */
  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return {
    // Data
    config,
    formData,
    formState,
    isLoading,
    error,
    
    // Actions
    loadConfig,
    updateFormData,
    saveConfig,
    savePreferences,
    saveNotificationPreferences,
    resetToDefaults,
    clearErrors,
    
    // Computed
    hasChanges: formState.isDirty,
    isSaving: formState.isLoading,
    hasErrors: Object.keys(formState.errors).length > 0,
  };
}
