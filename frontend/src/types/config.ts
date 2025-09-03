// User Configuration Types
// These types match the backend DTOs for user configuration

export interface UserConfigDTO {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  reputationScore: number;
  emailVerified: boolean;
  active: boolean;
  createdAt: string;
  lastLoginAt?: string;
  
  // User Preferences
  preferences: UserPreferencesDTO;
  
  // Notification Settings
  notificationPreferences: NotificationPreferencesDTO;
  
  // Push Subscription Status
  pushNotificationsEnabled: boolean;
  pushSubscriptionStatus: 'subscribed' | 'not_subscribed' | 'error';
}

export interface UserPreferencesDTO {
  language: Language;
  theme: Theme;
  preferredRegions: string[];
  timezone: string;
  offlineMode: boolean;
  autoSync: boolean;
  customSettings?: Record<string, any>;
}

export interface NotificationPreferencesDTO {
  priceAlerts: boolean;
  verificationNotifications: boolean;
  systemNotifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  alertThreshold: number; // Percentage threshold for price alerts
  alertRegions?: string[];
  alertQualities?: string[];
  frequency: NotificationFrequency;
  quietHours: boolean;
  quietStartTime?: string; // HH:MM format
  quietEndTime?: string; // HH:MM format
}

// Request types for updating configurations
export interface UpdateUserConfigRequest {
  fullName?: string;
  phone?: string;
  preferences?: UserPreferencesRequest;
  notificationPreferences?: NotificationPreferencesRequest;
}

export interface UserPreferencesRequest {
  language?: Language;
  theme?: Theme;
  preferredRegions?: string[];
  timezone?: string;
  offlineMode?: boolean;
  autoSync?: boolean;
  customSettings?: Record<string, any>;
}

export interface NotificationPreferencesRequest {
  priceAlerts?: boolean;
  verificationNotifications?: boolean;
  systemNotifications?: boolean;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  alertThreshold?: number;
  alertRegions?: string[];
  alertQualities?: string[];
  frequency?: NotificationFrequency;
  quietHours?: boolean;
  quietStartTime?: string;
  quietEndTime?: string;
}

// Enums and union types
export type Language = 'pt' | 'fr' | 'en';
export type Theme = 'light' | 'dark' | 'system';
export type NotificationFrequency = 'immediate' | 'daily' | 'weekly';
export type UserRole = 'ADMIN' | 'MODERATOR' | 'CONTRIBUTOR';

// Configuration form state types
export interface ConfigFormState {
  isLoading: boolean;
  isDirty: boolean;
  errors: Record<string, string>;
  lastSaved?: string;
}

export interface UserConfigFormData {
  // Basic profile
  fullName: string;
  phone: string;
  
  // Preferences
  language: Language;
  theme: Theme;
  preferredRegions: string[];
  timezone: string;
  offlineMode: boolean;
  autoSync: boolean;
  
  // Notifications
  priceAlerts: boolean;
  verificationNotifications: boolean;
  systemNotifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  alertThreshold: number;
  alertRegions: string[];
  alertQualities: string[];
  frequency: NotificationFrequency;
  quietHours: boolean;
  quietStartTime: string;
  quietEndTime: string;
}

// Configuration sections for UI organization
export interface ConfigSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  fields: ConfigField[];
}

export interface ConfigField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'multiselect' | 'checkbox' | 'number' | 'time' | 'switch';
  label: string;
  description?: string;
  placeholder?: string;
  options?: ConfigOption[];
  validation?: ConfigValidation;
  dependsOn?: string; // Field ID that this field depends on
  showWhen?: (formData: UserConfigFormData) => boolean;
}

export interface ConfigOption {
  value: string;
  label: string;
  description?: string;
}

export interface ConfigValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  custom?: (value: any) => string | null;
}

// Configuration validation result
export interface ConfigValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings?: Record<string, string>;
}

// Configuration save result
export interface ConfigSaveResult {
  success: boolean;
  message?: string;
  errors?: Record<string, string>;
  updatedConfig?: UserConfigDTO;
}

// Configuration change tracking
export interface ConfigChange {
  field: string;
  oldValue: any;
  newValue: any;
  timestamp: number;
}

// Configuration backup/restore
export interface ConfigBackup {
  id: string;
  name: string;
  config: UserConfigDTO;
  createdAt: string;
  version: string;
}

// Configuration import/export
export interface ConfigExport {
  version: string;
  exportedAt: string;
  config: UserConfigDTO;
  metadata: {
    appVersion: string;
    userAgent: string;
    platform: string;
  };
}

// Configuration migration
export interface ConfigMigration {
  fromVersion: string;
  toVersion: string;
  migrate: (oldConfig: any) => UserConfigDTO;
}

// Default configuration values
export const DEFAULT_USER_CONFIG: Partial<UserConfigFormData> = {
  language: 'pt',
  theme: 'system',
  preferredRegions: [],
  timezone: 'Africa/Bissau',
  offlineMode: false,
  autoSync: true,
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
};

// Available options for configuration fields
export const LANGUAGE_OPTIONS: ConfigOption[] = [
  { value: 'pt', label: 'Português', description: 'Português (Guiné-Bissau)' },
  { value: 'fr', label: 'Français', description: 'Français' },
  { value: 'en', label: 'English', description: 'English' },
];

export const THEME_OPTIONS: ConfigOption[] = [
  { value: 'light', label: 'Claro', description: 'Tema claro' },
  { value: 'dark', label: 'Escuro', description: 'Tema escuro' },
  { value: 'system', label: 'Sistema', description: 'Seguir configuração do sistema' },
];

export const FREQUENCY_OPTIONS: ConfigOption[] = [
  { value: 'immediate', label: 'Imediato', description: 'Receber notificações imediatamente' },
  { value: 'daily', label: 'Diário', description: 'Resumo diário de notificações' },
  { value: 'weekly', label: 'Semanal', description: 'Resumo semanal de notificações' },
];

export const TIMEZONE_OPTIONS: ConfigOption[] = [
  { value: 'Africa/Bissau', label: 'Guiné-Bissau (GMT+0)', description: 'Horário de Guiné-Bissau' },
  { value: 'Africa/Dakar', label: 'Senegal (GMT+0)', description: 'Horário de Senegal' },
  { value: 'Africa/Conakry', label: 'Guiné (GMT+0)', description: 'Horário de Guiné' },
  { value: 'Europe/Lisbon', label: 'Portugal (GMT+0/+1)', description: 'Horário de Portugal' },
  { value: 'Europe/Paris', label: 'França (GMT+1/+2)', description: 'Horário de França' },
  { value: 'UTC', label: 'UTC (GMT+0)', description: 'Tempo Universal Coordenado' },
];

// Configuration sections definition
export const CONFIG_SECTIONS: ConfigSection[] = [
  {
    id: 'profile',
    title: 'Perfil',
    description: 'Informações básicas do seu perfil',
    icon: 'User',
    fields: [
      {
        id: 'fullName',
        type: 'text',
        label: 'Nome completo',
        placeholder: 'Digite seu nome completo',
        validation: { required: true, minLength: 2, maxLength: 100 },
      },
      {
        id: 'phone',
        type: 'tel',
        label: 'Telefone',
        placeholder: '+245 XXX XXX XXX',
        validation: { pattern: '^\\+?[0-9]{8,15}$' },
      },
    ],
  },
  {
    id: 'preferences',
    title: 'Preferências',
    description: 'Configurações gerais da aplicação',
    icon: 'Settings',
    fields: [
      {
        id: 'language',
        type: 'select',
        label: 'Idioma',
        description: 'Idioma da interface',
        options: LANGUAGE_OPTIONS,
        validation: { required: true },
      },
      {
        id: 'theme',
        type: 'select',
        label: 'Tema',
        description: 'Aparência da interface',
        options: THEME_OPTIONS,
        validation: { required: true },
      },
      {
        id: 'preferredRegions',
        type: 'multiselect',
        label: 'Regiões preferidas',
        description: 'Regiões que você acompanha',
        validation: {},
      },
      {
        id: 'timezone',
        type: 'select',
        label: 'Fuso horário',
        description: 'Seu fuso horário local',
        options: TIMEZONE_OPTIONS,
        validation: { required: true },
      },
      {
        id: 'offlineMode',
        type: 'switch',
        label: 'Modo offline',
        description: 'Permitir uso sem conexão à internet',
      },
      {
        id: 'autoSync',
        type: 'switch',
        label: 'Sincronização automática',
        description: 'Sincronizar dados automaticamente',
      },
    ],
  },
  {
    id: 'notifications',
    title: 'Notificações',
    description: 'Configurações de notificações e alertas',
    icon: 'Bell',
    fields: [
      {
        id: 'priceAlerts',
        type: 'switch',
        label: 'Alertas de preço',
        description: 'Receber notificações sobre variações de preço',
      },
      {
        id: 'verificationNotifications',
        type: 'switch',
        label: 'Notificações de verificação',
        description: 'Receber notificações sobre verificação de preços',
      },
      {
        id: 'systemNotifications',
        type: 'switch',
        label: 'Notificações do sistema',
        description: 'Receber notificações importantes do sistema',
      },
      {
        id: 'emailNotifications',
        type: 'switch',
        label: 'Notificações por email',
        description: 'Receber notificações por email',
      },
      {
        id: 'pushNotifications',
        type: 'switch',
        label: 'Notificações push',
        description: 'Receber notificações push no dispositivo',
      },
      {
        id: 'alertThreshold',
        type: 'number',
        label: 'Limiar de alerta (%)',
        description: 'Percentual mínimo de variação para gerar alerta',
        validation: { min: 1, max: 100 },
        showWhen: (formData) => formData.priceAlerts,
      },
      {
        id: 'alertRegions',
        type: 'multiselect',
        label: 'Regiões para alertas',
        description: 'Regiões específicas para receber alertas',
        showWhen: (formData) => formData.priceAlerts,
      },
      {
        id: 'alertQualities',
        type: 'multiselect',
        label: 'Qualidades para alertas',
        description: 'Qualidades específicas para receber alertas',
        showWhen: (formData) => formData.priceAlerts,
      },
      {
        id: 'frequency',
        type: 'select',
        label: 'Frequência',
        description: 'Frequência de envio de notificações',
        options: FREQUENCY_OPTIONS,
        validation: { required: true },
      },
      {
        id: 'quietHours',
        type: 'switch',
        label: 'Horário silencioso',
        description: 'Desativar notificações em horários específicos',
      },
      {
        id: 'quietStartTime',
        type: 'time',
        label: 'Início do horário silencioso',
        description: 'Hora de início para não receber notificações',
        showWhen: (formData) => formData.quietHours,
      },
      {
        id: 'quietEndTime',
        type: 'time',
        label: 'Fim do horário silencioso',
        description: 'Hora de fim para não receber notificações',
        showWhen: (formData) => formData.quietHours,
      },
    ],
  },
];
