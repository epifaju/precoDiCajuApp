import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { useAuthStore } from '../store/authStore';

interface NotificationSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface NotificationPreferences {
  prix_variations?: boolean;
  seuil_perso?: number;
}

interface UseNotificationsReturn {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  requestPermission: () => Promise<NotificationPermission>;
  permission: NotificationPermission;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [vapidPublicKey, setVapidPublicKey] = useState<string>('');

  const { get, post } = useApi();
  const { user } = useAuthStore();

  // Check browser support and current state
  useEffect(() => {
    const checkSupport = () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
      setIsSupported(supported);
      
      if (supported) {
        setPermission(Notification.permission);
        checkSubscriptionStatus();
        loadVapidKey();
      }
    };

    checkSupport();
  }, []);

  // Check if user is already subscribed
  const checkSubscriptionStatus = useCallback(async () => {
    if (!isSupported || !user) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      // Check if user has push subscription in their profile
      const userHasSubscription = user.pushSubscription && user.abonnementNotifications;
      
      setIsSubscribed(!!(subscription && userHasSubscription));
    } catch (err) {
      console.error('Error checking subscription status:', err);
      setError('Erreur lors de la vérification de l\'abonnement');
    }
  }, [isSupported, user]);

  // Load VAPID public key from backend
  const loadVapidKey = useCallback(async () => {
    try {
      const response = await get<{ publicKey: string }>('/api/v1/notifications/vapid-key');
      setVapidPublicKey(response.publicKey);
    } catch (err) {
      console.error('Error loading VAPID key:', err);
      setError('Erreur lors du chargement de la clé VAPID');
    }
  }, [get]);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      throw new Error('Notifications non supportées par ce navigateur');
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      return permission;
    } catch (err) {
      console.error('Error requesting permission:', err);
      throw new Error('Erreur lors de la demande de permission');
    }
  }, [isSupported]);

  // Convert VAPID key to Uint8Array
  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !user) {
      setError('Notifications non supportées ou utilisateur non connecté');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Request permission first
      const permission = await requestPermission();
      if (permission !== 'granted') {
        setError('Permission de notification refusée');
        return false;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw-notifications.js');
      await navigator.serviceWorker.ready;

      // Subscribe to push manager
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      // Send subscription to backend
      const subscriptionData: NotificationSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
        }
      };

      const preferences: NotificationPreferences = {
        prix_variations: true,
        seuil_perso: null
      };

      await post('/api/v1/notifications/subscribe', {
        pushSubscription: JSON.stringify(subscriptionData),
        prixVariations: preferences.prix_variations,
        seuilPersonnalise: preferences.seuil_perso
      });

      setIsSubscribed(true);
      return true;

    } catch (err) {
      console.error('Error subscribing to notifications:', err);
      setError('Erreur lors de l\'abonnement aux notifications');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, user, vapidPublicKey, requestPermission, post]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !user) {
      setError('Notifications non supportées ou utilisateur non connecté');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Unsubscribe from push manager
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
      }

      // Notify backend
      await post('/api/v1/notifications/unsubscribe', {});

      setIsSubscribed(false);
      return true;

    } catch (err) {
      console.error('Error unsubscribing from notifications:', err);
      setError('Erreur lors du désabonnement');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, user, post]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    requestPermission,
    permission
  };
};

