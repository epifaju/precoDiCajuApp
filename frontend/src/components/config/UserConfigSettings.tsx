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
  Sync,
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
          <span className="text-gray-600 dark:text-gray-400">Carregando configurações...</span>
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
            Erro ao carregar configurações
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Tentar novamente
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
      setSaveMessage({ type: 'success', text: result.message || 'Configurações salvas com sucesso!' });
    } else {
      setSaveMessage({ type: 'error', text: result.message || 'Erro ao salvar configurações' });
    }
    
    // Clear message after 3 seconds
    setTimeout(() => setSaveMessage(null), 3000);
  };

  // Handle reset to defaults
  const handleReset = async () => {
    if (window.confirm('Tem certeza que deseja redefinir todas as configurações para os valores padrão?')) {
      await resetToDefaults();
      setSaveMessage({ type: 'success', text: 'Configurações redefinidas para os valores padrão!' });
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Configurações
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie suas preferências e configurações da aplicação
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {hasChanges && (
            <span className="text-sm text-amber-600 dark:text-amber-400 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              Alterações não salvas
            </span>
          )}
          
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isSaving}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Redefinir
          </Button>
          
          <Button
            onClick={handleSave}
            loading={isSaving}
            disabled={!hasChanges}
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`p-4 rounded-lg border ${
          saveMessage.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
        }`}>
          <div className="flex items-center">
            {saveMessage.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            <span>{saveMessage.text}</span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {hasErrors && (
        <Card className="border-red-200 dark:border-red-800">
          <div className="p-4">
            <div className="flex items-center mb-2">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                Erros de validação
              </h3>
            </div>
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
              {Object.entries(formState.errors).map(([field, error]) => (
                <li key={field}>• {error}</li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Seções
              </h3>
              <nav className="space-y-2">
                {CONFIG_SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {getSectionIcon(section.id)}
                    <span>{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeSection === 'profile' && (
            <Card>
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Informações do Perfil
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Atualize suas informações pessoais
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nome Completo
                    </label>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => updateFormData({ fullName: e.target.value })}
                      placeholder="Digite seu nome completo"
                      error={formState.errors.fullName}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Telefone
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateFormData({ phone: e.target.value })}
                      placeholder="+245 XXX XXX XXX"
                      error={formState.errors.phone}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeSection === 'preferences' && (
            <Card>
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Settings className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Preferências Gerais
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Configure a aparência e comportamento da aplicação
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Globe className="h-4 w-4 inline mr-2" />
                      Idioma
                    </label>
                    <Select
                      value={formData.language}
                      onChange={(value) => updateFormData({ language: value as any })}
                      options={LANGUAGE_OPTIONS}
                      error={formState.errors.language}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Palette className="h-4 w-4 inline mr-2" />
                      Tema
                    </label>
                    <Select
                      value={formData.theme}
                      onChange={(value) => updateFormData({ theme: value as any })}
                      options={THEME_OPTIONS.map(option => ({
                        ...option,
                        icon: getThemeIcon(option.value)
                      }))}
                      error={formState.errors.theme}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Clock className="h-4 w-4 inline mr-2" />
                      Fuso Horário
                    </label>
                    <Select
                      value={formData.timezone}
                      onChange={(value) => updateFormData({ timezone: value })}
                      options={TIMEZONE_OPTIONS}
                      error={formState.errors.timezone}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {formData.offlineMode ? (
                          <WifiOff className="h-5 w-5 text-orange-500" />
                        ) : (
                          <Wifi className="h-5 w-5 text-green-500" />
                        )}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            Modo Offline
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Permitir uso sem conexão
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => updateFormData({ offlineMode: !formData.offlineMode })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          formData.offlineMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            formData.offlineMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Sync className="h-5 w-5 text-blue-500" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            Sincronização Automática
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Sincronizar dados automaticamente
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => updateFormData({ autoSync: !formData.autoSync })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          formData.autoSync ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            formData.autoSync ? 'translate-x-6' : 'translate-x-1'
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
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Bell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Notificações
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Configure como e quando receber notificações
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Notification Types */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      Tipos de Notificação
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: 'priceAlerts', icon: TrendingUp, label: 'Alertas de Preço', description: 'Variações de preço' },
                        { key: 'verificationNotifications', icon: Shield, label: 'Verificações', description: 'Status de verificação' },
                        { key: 'systemNotifications', icon: Settings, label: 'Sistema', description: 'Notificações importantes' },
                        { key: 'emailNotifications', icon: Mail, label: 'Email', description: 'Notificações por email' },
                        { key: 'pushNotifications', icon: Smartphone, label: 'Push', description: 'Notificações push' },
                      ].map(({ key, icon: Icon, label, description }) => (
                        <div key={key} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Icon className="h-5 w-5 text-blue-500" />
                            <div>
                              <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                                {label}
                              </h5>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {description}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => updateFormData({ [key]: !formData[key as keyof UserConfigFormData] })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              formData[key as keyof UserConfigFormData] ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                formData[key as keyof UserConfigFormData] ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Alert Settings */}
                  {formData.priceAlerts && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Configurações de Alerta
                      </h4>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Limiar de Alerta (%)
                        </label>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={formData.alertThreshold}
                          onChange={(e) => updateFormData({ alertThreshold: parseInt(e.target.value) || 10 })}
                          error={formState.errors.alertThreshold}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Frequência
                        </label>
                        <Select
                          value={formData.frequency}
                          onChange={(value) => updateFormData({ frequency: value as any })}
                          options={FREQUENCY_OPTIONS}
                          error={formState.errors.frequency}
                        />
                      </div>
                    </div>
                  )}

                  {/* Quiet Hours */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {formData.quietHours ? (
                          <VolumeX className="h-5 w-5 text-red-500" />
                        ) : (
                          <Volume2 className="h-5 w-5 text-green-500" />
                        )}
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            Horário Silencioso
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Desativar notificações em horários específicos
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => updateFormData({ quietHours: !formData.quietHours })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          formData.quietHours ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            formData.quietHours ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {formData.quietHours && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Início
                          </label>
                          <Input
                            type="time"
                            value={formData.quietStartTime}
                            onChange={(e) => updateFormData({ quietStartTime: e.target.value })}
                            error={formState.errors.quietStartTime}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Fim
                          </label>
                          <Input
                            type="time"
                            value={formData.quietEndTime}
                            onChange={(e) => updateFormData({ quietEndTime: e.target.value })}
                            error={formState.errors.quietEndTime}
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
