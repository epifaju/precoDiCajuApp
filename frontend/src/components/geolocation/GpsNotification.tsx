/**
 * Composant de Notification GPS - Notifications et alertes pour la géolocalisation
 * Affiche des notifications contextuelles pour les événements GPS
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useOfflineGeolocation } from '../../hooks/geolocation';

export interface GpsNotificationData {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: number;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
  persistent?: boolean;
}

export interface GpsNotificationProps {
  /** Données de notification */
  notification: GpsNotificationData;
  /** Callback pour fermer la notification */
  onClose: (id: string) => void;
  /** Position de la notification */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  /** Animation d'entrée */
  animation?: 'slide' | 'fade' | 'bounce';
  /** Classe CSS personnalisée */
  className?: string;
}

export const GpsNotification: React.FC<GpsNotificationProps> = ({
  notification,
  onClose,
  position = 'top-right',
  animation = 'slide',
  className = ''
}) => {
  const { t } = useTranslation();
  const [offlineState, offlineActions] = useOfflineGeolocation();
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Animation d'entrée
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Auto-fermeture si durée spécifiée
    if (notification.duration && !notification.persistent) {
      const timer = setTimeout(() => {
        handleClose();
      }, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification.duration, notification.persistent]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose(notification.id);
    }, 300);
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: '✅',
          iconColor: 'text-green-600',
          titleColor: 'text-green-800',
          messageColor: 'text-green-700'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: '⚠️',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800',
          messageColor: 'text-yellow-700'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: '❌',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          messageColor: 'text-red-700'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'ℹ️',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700'
        };
    }
  };

  const getPositionStyles = (position: string) => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  const getAnimationStyles = (animation: string, isVisible: boolean, isClosing: boolean) => {
    if (isClosing) {
      switch (animation) {
        case 'slide':
          return 'transform translate-x-full opacity-0';
        case 'fade':
          return 'opacity-0';
        case 'bounce':
          return 'transform scale-0 opacity-0';
        default:
          return 'transform translate-x-full opacity-0';
      }
    }

    if (isVisible) {
      switch (animation) {
        case 'slide':
          return 'transform translate-x-0 opacity-100';
        case 'fade':
          return 'opacity-100';
        case 'bounce':
          return 'transform scale-100 opacity-100';
        default:
          return 'transform translate-x-0 opacity-100';
      }
    }

    // État initial
    switch (animation) {
      case 'slide':
        return 'transform translate-x-full opacity-0';
      case 'fade':
        return 'opacity-0';
      case 'bounce':
        return 'transform scale-0 opacity-0';
      default:
        return 'transform translate-x-full opacity-0';
    }
  };

  const styles = getTypeStyles(notification.type);
  const positionStyles = getPositionStyles(position);
  const animationStyles = getAnimationStyles(animation, isVisible, isClosing);

  return (
    <div
      className={`fixed z-50 max-w-sm w-full transition-all duration-300 ease-in-out ${positionStyles} ${animationStyles} ${className}`}
    >
      <div className={`${styles.bg} ${styles.border} border rounded-lg shadow-lg p-4`}>
        <div className="flex items-start">
          <div className={`text-xl mr-3 ${styles.iconColor}`}>
            {styles.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-medium ${styles.titleColor} mb-1`}>
              {notification.title}
            </h4>
            <p className={`text-sm ${styles.messageColor} mb-3`}>
              {notification.message}
            </p>
            
            {/* Actions */}
            {notification.actions && notification.actions.length > 0 && (
              <div className="flex space-x-2">
                {notification.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`px-3 py-1 text-xs rounded ${
                      action.variant === 'primary'
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : action.variant === 'danger'
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button
            onClick={handleClose}
            className={`ml-2 ${styles.iconColor} hover:opacity-70`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export interface GpsNotificationManagerProps {
  /** Position des notifications */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  /** Animation d'entrée */
  animation?: 'slide' | 'fade' | 'bounce';
  /** Classe CSS personnalisée */
  className?: string;
}

export const GpsNotificationManager: React.FC<GpsNotificationManagerProps> = ({
  position = 'top-right',
  animation = 'slide',
  className = ''
}) => {
  const { t } = useTranslation();
  const [offlineState, offlineActions] = useOfflineGeolocation();
  const [notifications, setNotifications] = useState<GpsNotificationData[]>([]);

  // Écouter les événements GPS pour générer des notifications
  useEffect(() => {
    const handleGpsEvent = (event: CustomEvent) => {
      const { type, data } = event.detail;
      
      let notification: GpsNotificationData | null = null;

      switch (type) {
        case 'gps_accuracy_improved':
          notification = {
            id: `gps_accuracy_${Date.now()}`,
            type: 'success',
            title: t('geolocation.notifications.accuracyImproved.title'),
            message: t('geolocation.notifications.accuracyImproved.message', { accuracy: data.accuracy }),
            timestamp: Date.now(),
            duration: 5000
          };
          break;

        case 'gps_accuracy_degraded':
          notification = {
            id: `gps_accuracy_${Date.now()}`,
            type: 'warning',
            title: t('geolocation.notifications.accuracyDegraded.title'),
            message: t('geolocation.notifications.accuracyDegraded.message', { accuracy: data.accuracy }),
            timestamp: Date.now(),
            duration: 7000
          };
          break;

        case 'gps_permission_granted':
          notification = {
            id: `gps_permission_${Date.now()}`,
            type: 'success',
            title: t('geolocation.notifications.permissionGranted.title'),
            message: t('geolocation.notifications.permissionGranted.message'),
            timestamp: Date.now(),
            duration: 5000
          };
          break;

        case 'gps_permission_denied':
          notification = {
            id: `gps_permission_${Date.now()}`,
            type: 'error',
            title: t('geolocation.notifications.permissionDenied.title'),
            message: t('geolocation.notifications.permissionDenied.message'),
            timestamp: Date.now(),
            duration: 10000,
            actions: [
              {
                label: t('geolocation.notifications.permissionDenied.retry'),
                action: () => {
                  // Retry permission request
                  window.dispatchEvent(new CustomEvent('gps_request_permission'));
                },
                variant: 'primary'
              }
            ]
          };
          break;

        case 'gps_offline_mode':
          notification = {
            id: `gps_offline_${Date.now()}`,
            type: 'info',
            title: t('geolocation.notifications.offlineMode.title'),
            message: t('geolocation.notifications.offlineMode.message'),
            timestamp: Date.now(),
            duration: 8000
          };
          break;

        case 'gps_sync_completed':
          notification = {
            id: `gps_sync_${Date.now()}`,
            type: 'success',
            title: t('geolocation.notifications.syncCompleted.title'),
            message: t('geolocation.notifications.syncCompleted.message', { count: data.count }),
            timestamp: Date.now(),
            duration: 5000
          };
          break;

        case 'gps_sync_failed':
          notification = {
            id: `gps_sync_${Date.now()}`,
            type: 'error',
            title: t('geolocation.notifications.syncFailed.title'),
            message: t('geolocation.notifications.syncFailed.message'),
            timestamp: Date.now(),
            duration: 10000,
            actions: [
              {
                label: t('geolocation.notifications.syncFailed.retry'),
                action: () => {
                  // Retry sync
                  window.dispatchEvent(new CustomEvent('gps_retry_sync'));
                },
                variant: 'primary'
              }
            ]
          };
          break;

        case 'gps_validation_failed':
          notification = {
            id: `gps_validation_${Date.now()}`,
            type: 'warning',
            title: t('geolocation.notifications.validationFailed.title'),
            message: t('geolocation.notifications.validationFailed.message', { reason: data.reason }),
            timestamp: Date.now(),
            duration: 8000
          };
          break;
      }

      if (notification) {
        addNotification(notification);
      }
    };

    // Écouter les événements GPS
    window.addEventListener('gps_event', handleGpsEvent as EventListener);

    return () => {
      window.removeEventListener('gps_event', handleGpsEvent as EventListener);
    };
  }, [t]);

  const addNotification = (notification: GpsNotificationData) => {
    setNotifications(prev => [...prev, notification]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <div className={`fixed z-50 ${className}`}>
      {/* Bouton pour effacer toutes les notifications */}
      {notifications.length > 0 && (
        <div className={`${position.includes('top') ? 'top-16' : 'bottom-16'} ${position.includes('right') ? 'right-4' : position.includes('left') ? 'left-4' : 'left-1/2 transform -translate-x-1/2'}`}>
          <button
            onClick={clearAllNotifications}
            className="px-3 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-700"
          >
            {t('geolocation.notifications.clearAll')}
          </button>
        </div>
      )}

      {/* Notifications */}
      {notifications.map((notification) => (
        <GpsNotification
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
          position={position}
          animation={animation}
        />
      ))}
    </div>
  );
};

export default GpsNotification;
