/**
 * Composant de Configuration GPS - Paramètres avancés pour la géolocalisation
 * Interface pour configurer les paramètres GPS, la précision, et les préférences
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useOfflineGeolocation } from '../../hooks/geolocation';

export interface GpsSettings {
  // Paramètres de géolocalisation
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
  
  // Paramètres de cache
  cachePositions: boolean;
  cacheGeocoding: boolean;
  maxCacheSize: number;
  cacheExpiration: number;
  
  // Paramètres de synchronisation
  autoSync: boolean;
  syncInterval: number;
  maxRetries: number;
  
  // Paramètres de validation
  validateCoordinates: boolean;
  minAccuracy: number;
  maxAccuracy: number;
  
  // Paramètres d'affichage
  showCoordinates: boolean;
  showAccuracy: boolean;
  showAddress: boolean;
  showOfflineStatus: boolean;
  
  // Paramètres de notification
  enableNotifications: boolean;
  notifyOnLocationChange: boolean;
  notifyOnOfflineMode: boolean;
}

export interface GpsSettingsProps {
  /** Paramètres actuels */
  settings?: Partial<GpsSettings>;
  /** Callback lors des changements de paramètres */
  onSettingsChange?: (settings: GpsSettings) => void;
  /** Afficher les sections spécifiques */
  showSections?: {
    geolocation?: boolean;
    cache?: boolean;
    sync?: boolean;
    validation?: boolean;
    display?: boolean;
    notifications?: boolean;
  };
  /** Variante d'affichage */
  variant?: 'full' | 'compact' | 'minimal';
  /** Classe CSS personnalisée */
  className?: string;
}

const defaultSettings: GpsSettings = {
  // Paramètres de géolocalisation
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 60000,
  
  // Paramètres de cache
  cachePositions: true,
  cacheGeocoding: true,
  maxCacheSize: 1000,
  cacheExpiration: 24 * 60 * 60 * 1000, // 24 heures
  
  // Paramètres de synchronisation
  autoSync: true,
  syncInterval: 30000,
  maxRetries: 3,
  
  // Paramètres de validation
  validateCoordinates: true,
  minAccuracy: 10,
  maxAccuracy: 1000,
  
  // Paramètres d'affichage
  showCoordinates: true,
  showAccuracy: true,
  showAddress: true,
  showOfflineStatus: true,
  
  // Paramètres de notification
  enableNotifications: true,
  notifyOnLocationChange: false,
  notifyOnOfflineMode: true,
};

export const GpsSettings: React.FC<GpsSettingsProps> = ({
  settings = {},
  onSettingsChange,
  showSections = {
    geolocation: true,
    cache: true,
    sync: true,
    validation: true,
    display: true,
    notifications: true,
  },
  variant = 'full',
  className = ''
}) => {
  const { t } = useTranslation();
  const [offlineState, offlineActions] = useOfflineGeolocation();
  const [currentSettings, setCurrentSettings] = useState<GpsSettings>({
    ...defaultSettings,
    ...settings
  });
  const [activeTab, setActiveTab] = useState<'geolocation' | 'cache' | 'sync' | 'validation' | 'display' | 'notifications'>('geolocation');
  const [hasChanges, setHasChanges] = useState(false);

  // Détecter les changements
  useEffect(() => {
    const hasChanges = JSON.stringify(currentSettings) !== JSON.stringify({
      ...defaultSettings,
      ...settings
    });
    setHasChanges(hasChanges);
  }, [currentSettings, settings]);

  const handleSettingChange = (key: keyof GpsSettings, value: any) => {
    const newSettings = { ...currentSettings, [key]: value };
    setCurrentSettings(newSettings);
    
    if (onSettingsChange) {
      onSettingsChange(newSettings);
    }
  };

  const handleReset = () => {
    setCurrentSettings(defaultSettings);
    if (onSettingsChange) {
      onSettingsChange(defaultSettings);
    }
  };

  const handleSave = () => {
    // Ici, vous pourriez sauvegarder les paramètres dans le localStorage ou une API
    localStorage.setItem('gps-settings', JSON.stringify(currentSettings));
    setHasChanges(false);
  };

  const handleClearCache = async () => {
    if (window.confirm(t('geolocation.settings.confirmClearCache'))) {
      try {
        await offlineActions.clearCache();
      } catch (error) {
        console.error('Erreur lors du nettoyage du cache:', error);
      }
    }
  };

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${ms / 1000}s`;
    if (ms < 3600000) return `${ms / 60000}min`;
    return `${ms / 3600000}h`;
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  // Rendu minimal
  if (variant === 'minimal') {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-900">
            {t('geolocation.settings.title')}
          </h3>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {t('geolocation.settings.save')}
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">{t('geolocation.settings.highAccuracy')}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={currentSettings.enableHighAccuracy}
                onChange={(e) => handleSettingChange('enableHighAccuracy', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">{t('geolocation.settings.autoSync')}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={currentSettings.autoSync}
                onChange={(e) => handleSettingChange('autoSync', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    );
  }

  // Rendu compact
  if (variant === 'compact') {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {t('geolocation.settings.title')}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={handleReset}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              {t('geolocation.settings.reset')}
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {t('geolocation.settings.save')}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{t('geolocation.settings.highAccuracy')}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentSettings.enableHighAccuracy}
                  onChange={(e) => handleSettingChange('enableHighAccuracy', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{t('geolocation.settings.cachePositions')}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentSettings.cachePositions}
                  onChange={(e) => handleSettingChange('cachePositions', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{t('geolocation.settings.autoSync')}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentSettings.autoSync}
                  onChange={(e) => handleSettingChange('autoSync', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{t('geolocation.settings.validateCoordinates')}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentSettings.validateCoordinates}
                  onChange={(e) => handleSettingChange('validateCoordinates', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Rendu complet
  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* En-tête */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {t('geolocation.settings.title')}
            </h2>
            <p className="text-sm text-gray-500">
              {t('geolocation.settings.subtitle')}
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              {t('geolocation.settings.reset')}
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {t('geolocation.settings.save')}
            </button>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-4">
          {Object.entries(showSections).map(([key, show]) => {
            if (!show) return null;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t(`geolocation.settings.tabs.${key}`)}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenu */}
      <div className="p-6">
        {activeTab === 'geolocation' && showSections.geolocation && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">
              {t('geolocation.settings.sections.geolocation')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {t('geolocation.settings.highAccuracy')}
                    </label>
                    <p className="text-xs text-gray-500">
                      {t('geolocation.settings.highAccuracyDescription')}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentSettings.enableHighAccuracy}
                      onChange={(e) => handleSettingChange('enableHighAccuracy', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('geolocation.settings.timeout')}
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="5000"
                      max="30000"
                      step="1000"
                      value={currentSettings.timeout}
                      onChange={(e) => handleSettingChange('timeout', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 w-16">
                      {formatTime(currentSettings.timeout)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('geolocation.settings.maximumAge')}
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="10000"
                      max="300000"
                      step="10000"
                      value={currentSettings.maximumAge}
                      onChange={(e) => handleSettingChange('maximumAge', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 w-16">
                      {formatTime(currentSettings.maximumAge)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cache' && showSections.cache && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {t('geolocation.settings.sections.cache')}
              </h3>
              <button
                onClick={handleClearCache}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                {t('geolocation.settings.clearCache')}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {t('geolocation.settings.cachePositions')}
                    </label>
                    <p className="text-xs text-gray-500">
                      {t('geolocation.settings.cachePositionsDescription')}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentSettings.cachePositions}
                      onChange={(e) => handleSettingChange('cachePositions', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {t('geolocation.settings.cacheGeocoding')}
                    </label>
                    <p className="text-xs text-gray-500">
                      {t('geolocation.settings.cacheGeocodingDescription')}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentSettings.cacheGeocoding}
                      onChange={(e) => handleSettingChange('cacheGeocoding', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('geolocation.settings.maxCacheSize')}
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="100"
                      max="10000"
                      step="100"
                      value={currentSettings.maxCacheSize}
                      onChange={(e) => handleSettingChange('maxCacheSize', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 w-20">
                      {currentSettings.maxCacheSize}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('geolocation.settings.cacheExpiration')}
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="3600000"
                      max="604800000"
                      step="3600000"
                      value={currentSettings.cacheExpiration}
                      onChange={(e) => handleSettingChange('cacheExpiration', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 w-16">
                      {formatTime(currentSettings.cacheExpiration)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sync' && showSections.sync && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">
              {t('geolocation.settings.sections.sync')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {t('geolocation.settings.autoSync')}
                    </label>
                    <p className="text-xs text-gray-500">
                      {t('geolocation.settings.autoSyncDescription')}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentSettings.autoSync}
                      onChange={(e) => handleSettingChange('autoSync', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('geolocation.settings.syncInterval')}
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="10000"
                      max="300000"
                      step="10000"
                      value={currentSettings.syncInterval}
                      onChange={(e) => handleSettingChange('syncInterval', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 w-16">
                      {formatTime(currentSettings.syncInterval)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('geolocation.settings.maxRetries')}
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={currentSettings.maxRetries}
                      onChange={(e) => handleSettingChange('maxRetries', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 w-8">
                      {currentSettings.maxRetries}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'validation' && showSections.validation && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">
              {t('geolocation.settings.sections.validation')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {t('geolocation.settings.validateCoordinates')}
                    </label>
                    <p className="text-xs text-gray-500">
                      {t('geolocation.settings.validateCoordinatesDescription')}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentSettings.validateCoordinates}
                      onChange={(e) => handleSettingChange('validateCoordinates', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('geolocation.settings.minAccuracy')}
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      step="1"
                      value={currentSettings.minAccuracy}
                      onChange={(e) => handleSettingChange('minAccuracy', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 w-12">
                      {currentSettings.minAccuracy}m
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('geolocation.settings.maxAccuracy')}
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="100"
                      max="5000"
                      step="100"
                      value={currentSettings.maxAccuracy}
                      onChange={(e) => handleSettingChange('maxAccuracy', parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-600 w-16">
                      {currentSettings.maxAccuracy}m
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'display' && showSections.display && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">
              {t('geolocation.settings.sections.display')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {t('geolocation.settings.showCoordinates')}
                    </label>
                    <p className="text-xs text-gray-500">
                      {t('geolocation.settings.showCoordinatesDescription')}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentSettings.showCoordinates}
                      onChange={(e) => handleSettingChange('showCoordinates', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {t('geolocation.settings.showAccuracy')}
                    </label>
                    <p className="text-xs text-gray-500">
                      {t('geolocation.settings.showAccuracyDescription')}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentSettings.showAccuracy}
                      onChange={(e) => handleSettingChange('showAccuracy', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {t('geolocation.settings.showAddress')}
                    </label>
                    <p className="text-xs text-gray-500">
                      {t('geolocation.settings.showAddressDescription')}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentSettings.showAddress}
                      onChange={(e) => handleSettingChange('showAddress', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {t('geolocation.settings.showOfflineStatus')}
                    </label>
                    <p className="text-xs text-gray-500">
                      {t('geolocation.settings.showOfflineStatusDescription')}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentSettings.showOfflineStatus}
                      onChange={(e) => handleSettingChange('showOfflineStatus', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && showSections.notifications && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">
              {t('geolocation.settings.sections.notifications')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {t('geolocation.settings.enableNotifications')}
                    </label>
                    <p className="text-xs text-gray-500">
                      {t('geolocation.settings.enableNotificationsDescription')}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentSettings.enableNotifications}
                      onChange={(e) => handleSettingChange('enableNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {t('geolocation.settings.notifyOnLocationChange')}
                    </label>
                    <p className="text-xs text-gray-500">
                      {t('geolocation.settings.notifyOnLocationChangeDescription')}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentSettings.notifyOnLocationChange}
                      onChange={(e) => handleSettingChange('notifyOnLocationChange', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {t('geolocation.settings.notifyOnOfflineMode')}
                    </label>
                    <p className="text-xs text-gray-500">
                      {t('geolocation.settings.notifyOnOfflineModeDescription')}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentSettings.notifyOnOfflineMode}
                      onChange={(e) => handleSettingChange('notifyOnOfflineMode', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GpsSettings;
