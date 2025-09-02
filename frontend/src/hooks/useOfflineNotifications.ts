import { useState, useEffect, useCallback } from 'react';
import { useConnectionStatus } from './useConnectionStatus';
import { useServiceWorker } from './useServiceWorker';
import { useSyncQueue } from './useOfflineApi';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  persistent?: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'default' | 'secondary' | 'destructive';
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

export interface NotificationActions {
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  showConnectionAlert: () => void;
  showSyncAlert: () => void;
  showOfflineModeAlert: () => void;
}

const NOTIFICATION_STORAGE_KEY = 'precaju-offline-notifications';
const MAX_NOTIFICATIONS = 50;
const AUTO_REMOVE_DELAY = 5000; // 5 secondes

export const useOfflineNotifications = (): NotificationState & NotificationActions => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { isOnline, quality } = useConnectionStatus();
  const { syncStatus, lastSyncTime } = useServiceWorker();
  const { queueItems } = useSyncQueue();

  // Charger les notifications depuis le localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const notificationsWithDates = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
        setNotifications(notificationsWithDates);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    }
  }, []);

  // Sauvegarder les notifications dans le localStorage
  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des notifications:', error);
    }
  }, [notifications]);

  // Calculer le nombre de notifications non lues
  const unreadCount = notifications.filter(n => !n.read).length;

  // Ajouter une notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      // Limiter le nombre de notifications
      return updated.slice(0, MAX_NOTIFICATIONS);
    });

    // Supprimer automatiquement les notifications non persistantes
    if (!notification.persistent) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, AUTO_REMOVE_DELAY);
    }
  }, []);

  // Marquer une notification comme lue
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  // Marquer toutes les notifications comme lues
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  }, []);

  // Supprimer une notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Supprimer toutes les notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Notifications prédéfinies
  const showConnectionAlert = useCallback(() => {
    if (!isOnline) {
      addNotification({
        type: 'warning',
        title: 'Connexion perdue',
        message: 'Vous êtes maintenant en mode offline. Vos données seront synchronisées dès la reconnexion.',
        persistent: true,
      });
    } else if (quality === 'poor') {
      addNotification({
        type: 'warning',
        title: 'Connexion lente',
        message: 'Votre connexion est lente. Les données seront sauvegardées en mode offline.',
        persistent: false,
      });
    }
  }, [isOnline, quality, addNotification]);

  const showSyncAlert = useCallback(() => {
    if (syncStatus === 'completed') {
      addNotification({
        type: 'success',
        title: 'Synchronisation terminée',
        message: 'Toutes vos données ont été synchronisées avec succès.',
        persistent: false,
      });
    } else if (syncStatus === 'failed') {
      addNotification({
        type: 'error',
        title: 'Échec de synchronisation',
        message: 'Certaines données n\'ont pas pu être synchronisées. Réessayez plus tard.',
        persistent: true,
        actions: [
          {
            label: 'Réessayer',
            action: () => {
              // Déclencher une nouvelle synchronisation
              window.dispatchEvent(new CustomEvent('trigger-sync'));
            },
            variant: 'default',
          },
        ],
      });
    }
  }, [syncStatus, addNotification]);

  const showOfflineModeAlert = useCallback(() => {
    addNotification({
      type: 'info',
      title: 'Mode offline activé',
      message: 'Vous pouvez continuer à utiliser l\'application. Vos données seront synchronisées dès la reconnexion.',
      persistent: true,
    });
  }, [addNotification]);

  // Surveiller les changements de statut de connexion
  useEffect(() => {
    showConnectionAlert();
  }, [isOnline, quality, showConnectionAlert]);

  // Surveiller les changements de statut de synchronisation
  useEffect(() => {
    showSyncAlert();
  }, [syncStatus, showSyncAlert]);

  // Surveiller les changements dans la queue de synchronisation
  useEffect(() => {
    if (queueItems.length > 0 && !isOnline) {
      const pendingCount = queueItems.filter(item => item.status === 'pending').length;
      if (pendingCount > 0) {
        addNotification({
          type: 'info',
          title: 'Données en attente',
          message: `${pendingCount} élément(s) en attente de synchronisation.`,
          persistent: true,
        });
      }
    }
  }, [queueItems.length, isOnline, addNotification]);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    showConnectionAlert,
    showSyncAlert,
    showOfflineModeAlert,
  };
};
