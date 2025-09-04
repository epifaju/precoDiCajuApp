import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserConfig } from '../../hooks/useUserConfig';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { 
  User, 
  Settings, 
  Bell, 
  Save, 
  RotateCcw, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  Globe,
  Palette,
  MapPin,
  Clock,
  Wifi,
  WifiOff,
  RefreshCw,
  Volume2,
  VolumeX,
  Shield,
  Mail,
  Smartphone,
  TrendingUp,
  Calendar,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { 
  CONFIG_SECTIONS, 
  LANGUAGE_OPTIONS, 
  THEME_OPTIONS, 
  FREQUENCY_OPTIONS, 
  TIMEZONE_OPTIONS,
  UserConfigFormData 
} from '../../types/config';

interface UserConfigSettingsProps {
  className?: string;
}

export const UserConfigSettings: React.FC<UserConfigSettingsProps> = ({ className }) => {
  const { t } = useTranslation();
  const {
    config,
    formData,
    formState,
    isLoading,
    error,
    updateFormData,
    saveConfig,
    savePreferences,
    saveNotificationPreferences,
    resetToDefaults,
    clearErrors,
    hasChanges,
    isSaving,
    hasErrors,
  } = useUserConfig();

  const [activeSection, setActiveSection] = useState('profile');
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Show loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="flex items-center space-x-3">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-gray-600 dark:text-gray-400">{t('config.actions.loading')}</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card className={className}>
        <div className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('config.messages.loadError')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            {t('common.tryAgain')}
          </Button>
        </div>
      </Card>
    );
  }

  if (!formData) {
    return null;
  }

  // Handle save
  const handleSave = async () => {
    clearErrors();
    setSaveMessage(null);
    
    const result = await saveConfig();
    
    if (result.success) {
      setSaveMessage({ type: 'success', text: result.message || t('config.messages.saveSuccess') });
    } else {
      setSaveMessage({ type: 'error', text: result.message || t('config.messages.saveError') });
    }
    
    // Clear message after 3 seconds
    setTimeout(() => setSaveMessage(null), 3000);
  };

  // Handle reset to defaults
  const handleReset = async () => {
    if (window.confirm(t('config.actions.resetConfirm'))) {
      await resetToDefaults();
      setSaveMessage({ type: 'success', text: t('config.messages.resetSuccess') });
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  // Get section icon
  const getSectionIcon = (sectionId: string) => {
    switch (sectionId) {
      case 'profile':
        return <User className="h-5 w-5" />;
      case 'preferences':
        return <Settings className="h-5 w-5" />;
      case 'notifications':
        return <Bell className="h-5 w-5" />;
      default:
        return <Settings className="h-5 w-5" />;
    }
  };

  // Get theme icon
  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'system':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {t('config.title')}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {t('config.subtitle')}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          {hasChanges && (
            <span className="text-xs sm:text-sm text-amber-600 dark:text-amber-400 flex items-center justify-center sm:justify-start py-2 px-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
              <span className="truncate">{t('config.actions.unsavedChanges')}</span>
            </span>
          )}
          
          <div className="flex gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isSaving}
              className="config-touch-button flex-1 sm:flex-none text-xs sm:text-sm"
            >
              <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{t('config.actions.reset')}</span>
              <span className="sm:hidden">Reset</span>
            </Button>
            
            <Button
              onClick={handleSave}
              loading={isSaving}
              disabled={!hasChanges}
              className="config-touch-button flex-1 sm:flex-none text-xs sm:text-sm"
            >
              <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{t('config.actions.save')}</span>
              <span className="sm:hidden">Save</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`p-3 sm:p-4 rounded-lg border ${
          saveMessage.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
        }`}>
          <div className="flex items-center">
            {saveMessage.type === 'success' ? (
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
            )}
            <span className="text-sm sm:text-base">{saveMessage.text}</span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {hasErrors && (
        <Card className="border-red-200 dark:border-red-800">
          <div className="p-3 sm:p-4">
            <div className="flex items-center mb-2">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 mr-2 flex-shrink-0" />
              <h3 className="text-xs sm:text-sm font-medium text-red-800 dark:text-red-400">
                {t('config.messages.validationErrors')}
              </h3>
            </div>
            <ul className="text-xs sm:text-sm text-red-700 dark:text-red-300 space-y-1">
              {Object.entries(formState.errors).map(([field, error]) => (
                <li key={field} className="break-words">• {error}</li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6">
        {/* Sidebar Navigation - Mobile: Horizontal scroll, Desktop: Vertical */}
        <div className="xl:col-span-1">
          <Card className="overflow-hidden">
            <div className="p-3 sm:p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
                {t('config.sections.title')}
              </h3>
              {/* Mobile: Horizontal scroll navigation */}
              <nav className="config-mobile-nav flex xl:flex-col space-x-2 xl:space-x-0 xl:space-y-2 overflow-x-auto xl:overflow-x-visible pb-2 xl:pb-0">
                {CONFIG_SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex-shrink-0 xl:w-full flex items-center space-x-2 xl:space-x-3 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                      activeSection === section.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {getSectionIcon(section.id)}
                    <span className="hidden sm:inline">{t(`config.sections.${section.id}`)}</span>
                    <span className="sm:hidden">{t(`config.sections.${section.id}`).split(' ')[0]}</span>
                  </button>
                ))}
              </nav>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="xl:col-span-3">
          {activeSection === 'profile' && (
            <Card>
              <div className="p-4 sm:p-6">
                <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                      {t('config.profile.title')}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {t('config.profile.subtitle')}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('config.profile.fullName')}
                    </label>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => updateFormData({ fullName: e.target.value })}
                      placeholder={t('config.profile.fullNamePlaceholder')}
                      error={formState.errors.fullName}
                      className="w-full config-mobile-input config-touch-input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('config.profile.phone')}
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateFormData({ phone: e.target.value })}
                      placeholder={t('config.profile.phonePlaceholder')}
                      error={formState.errors.phone}
                      className="w-full config-mobile-input config-touch-input"
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeSection === 'preferences' && (
            <Card>
              <div className="p-4 sm:p-6">
                <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0">
                    <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                      {t('config.preferences.title')}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {t('config.preferences.subtitle')}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Globe className="h-4 w-4 inline mr-2" />
                      {t('config.preferences.language')}
                    </label>
                    <Select
                      value={formData.language}
                      onChange={(e) => updateFormData({ language: e.target.value as any })}
                      options={LANGUAGE_OPTIONS}
                      error={formState.errors.language}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Palette className="h-4 w-4 inline mr-2" />
                      {t('config.preferences.theme')}
                    </label>
                    <Select
                      value={formData.theme}
                      onChange={(e) => updateFormData({ theme: e.target.value as any })}
                      options={THEME_OPTIONS}
                      error={formState.errors.theme}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Clock className="h-4 w-4 inline mr-2" />
                      {t('config.preferences.timezone')}
                    </label>
                    <Select
                      value={formData.timezone}
                      onChange={(e) => updateFormData({ timezone: e.target.value })}
                      options={TIMEZONE_OPTIONS}
                      error={formState.errors.timezone}
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        {formData.offlineMode ? (
                          <WifiOff className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 flex-shrink-0" />
                        ) : (
                          <Wifi className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                            {t('config.preferences.offlineMode')}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block">
                            {t('config.preferences.offlineModeDescription')}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => updateFormData({ offlineMode: !formData.offlineMode })}
                        className={`config-mobile-toggle config-touch-toggle relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                          formData.offlineMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                            formData.offlineMode ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                            {t('config.preferences.autoSync')}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block">
                            {t('config.preferences.autoSyncDescription')}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => updateFormData({ autoSync: !formData.autoSync })}
                        className={`config-mobile-toggle config-touch-toggle relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                          formData.autoSync ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                            formData.autoSync ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeSection === 'notifications' && (
            <Card>
              <div className="p-4 sm:p-6">
                <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex-shrink-0">
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                      {t('config.notifications.title')}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {t('config.notifications.subtitle')}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {/* Notification Types */}
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {t('config.notifications.types')}
                    </h4>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                      {[
                        { key: 'priceAlerts', icon: TrendingUp, label: t('config.notifications.priceAlerts'), description: t('config.notifications.priceAlertsDescription') },
                        { key: 'verificationNotifications', icon: Shield, label: t('config.notifications.verificationNotifications'), description: t('config.notifications.verificationNotificationsDescription') },
                        { key: 'systemNotifications', icon: Settings, label: t('config.notifications.systemNotifications'), description: t('config.notifications.systemNotificationsDescription') },
                        { key: 'emailNotifications', icon: Mail, label: t('config.notifications.emailNotifications'), description: t('config.notifications.emailNotificationsDescription') },
                        { key: 'pushNotifications', icon: Smartphone, label: t('config.notifications.pushNotifications'), description: t('config.notifications.pushNotificationsDescription') },
                      ].map(({ key, icon: Icon, label, description }) => (
                        <div key={key} className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <h5 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                                {label}
                              </h5>
                              <p className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block">
                                {description}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => updateFormData({ [key]: !formData[key as keyof UserConfigFormData] })}
                            className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                              formData[key as keyof UserConfigFormData] ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                          >
                            <span
                              className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                                formData[key as keyof UserConfigFormData] ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Alert Settings */}
                  {formData.priceAlerts && (
                    <div className="space-y-3 sm:space-y-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {t('config.notifications.alertSettings')}
                      </h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('config.notifications.alertThreshold')}
                          </label>
                          <Input
                            type="number"
                            min="1"
                            max="100"
                            value={formData.alertThreshold}
                            onChange={(e) => updateFormData({ alertThreshold: parseInt(e.target.value) || 10 })}
                            error={formState.errors.alertThreshold}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('config.notifications.frequency')}
                          </label>
                          <Select
                            value={formData.frequency}
                            onChange={(e) => updateFormData({ frequency: e.target.value as any })}
                            options={FREQUENCY_OPTIONS}
                            error={formState.errors.frequency}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quiet Hours */}
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        {formData.quietHours ? (
                          <VolumeX className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0" />
                        ) : (
                          <Volume2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                            {t('config.notifications.quietHours')}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block">
                            {t('config.notifications.quietHoursDescription')}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => updateFormData({ quietHours: !formData.quietHours })}
                        className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors flex-shrink-0 ${
                          formData.quietHours ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                            formData.quietHours ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {formData.quietHours && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('config.notifications.quietStartTime')}
                          </label>
                          <Input
                            type="time"
                            value={formData.quietStartTime}
                            onChange={(e) => updateFormData({ quietStartTime: e.target.value })}
                            error={formState.errors.quietStartTime}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('config.notifications.quietEndTime')}
                          </label>
                          <Input
                            type="time"
                            value={formData.quietEndTime}
                            onChange={(e) => updateFormData({ quietEndTime: e.target.value })}
                            error={formState.errors.quietEndTime}
                            className="w-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

