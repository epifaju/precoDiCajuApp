import { useState, useEffect, useCallback } from 'react';

export interface ConnectionStatus {
  isOnline: boolean;
  quality: 'good' | 'poor' | 'offline';
  lastChecked: Date | null;
  latency: number | null;
  error: string | null;
}

export interface ConnectionStatusActions {
  testConnection: () => Promise<void>;
  forceOffline: () => void;
  forceOnline: () => void;
  reset: () => void;
}

const CONNECTION_TEST_INTERVAL = 30000; // 30 secondes
const CONNECTION_TIMEOUT = 5000; // 5 secondes
const GOOD_LATENCY_THRESHOLD = 1000; // 1 seconde

export const useConnectionStatus = (): ConnectionStatus & ConnectionStatusActions => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [quality, setQuality] = useState<'good' | 'poor' | 'offline'>('good');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [forcedStatus, setForcedStatus] = useState<'online' | 'offline' | null>(null);

  // Test de la qualité de connexion
  const testConnection = useCallback(async () => {
    if (forcedStatus === 'offline') {
      setQuality('offline');
      setError(null);
      setLastChecked(new Date());
      return;
    }

    try {
      setError(null);
      const start = Date.now();
      
      // Test avec un endpoint de santé
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONNECTION_TIMEOUT);
      
      const response = await fetch('/actuator/health', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      const duration = Date.now() - start;
      
      setLatency(duration);
      setLastChecked(new Date());
      
      if (response.ok) {
        if (duration < GOOD_LATENCY_THRESHOLD) {
          setQuality('good');
        } else {
          setQuality('poor');
        }
        setIsOnline(true);
      } else {
        setQuality('poor');
        setError(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setQuality('offline');
      setIsOnline(false);
      setLastChecked(new Date());
    }
  }, [forcedStatus]);

  // Forcer le mode offline (pour les tests)
  const forceOffline = useCallback(() => {
    setForcedStatus('offline');
    setIsOnline(false);
    setQuality('offline');
    setError('Mode offline forcé');
  }, []);

  // Forcer le mode online (pour les tests)
  const forceOnline = useCallback(() => {
    setForcedStatus('online');
    setIsOnline(true);
    setQuality('good');
    setError(null);
  }, []);

  // Réinitialiser le statut forcé
  const reset = useCallback(() => {
    setForcedStatus(null);
    testConnection();
  }, [testConnection]);

  // Surveiller les événements de connexion du navigateur
  useEffect(() => {
    const handleOnline = () => {
      if (forcedStatus === null) {
        setIsOnline(true);
        testConnection();
      }
    };

    const handleOffline = () => {
      if (forcedStatus === null) {
        setIsOnline(false);
        setQuality('offline');
        setError('Connexion perdue');
        setLastChecked(new Date());
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [forcedStatus, testConnection]);

  // Test périodique de la connexion
  useEffect(() => {
    // Test initial
    testConnection();

    // Test périodique
    const interval = setInterval(testConnection, CONNECTION_TEST_INTERVAL);

    return () => clearInterval(interval);
  }, [testConnection]);

  // Mettre à jour la qualité basée sur le statut online/offline
  useEffect(() => {
    if (!isOnline && quality !== 'offline') {
      setQuality('offline');
    }
  }, [isOnline, quality]);

  return {
    isOnline,
    quality,
    lastChecked,
    latency,
    error,
    testConnection,
    forceOffline,
    forceOnline,
    reset,
  };
};
