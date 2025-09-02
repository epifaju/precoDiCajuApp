import { useEffect, useState } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isSecure: boolean;
  error: string | null;
  registration: ServiceWorkerRegistration | null;
  syncStatus: 'idle' | 'syncing' | 'completed' | 'failed';
  lastSyncTime: string | null;
}

export const useServiceWorker = () => {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isSecure: false,
    error: null,
    registration: null,
    syncStatus: 'idle',
    lastSyncTime: null,
  });

  useEffect(() => {
    const checkAndRegisterSW = async () => {
      try {
        // Check if Service Workers are supported
        if (!('serviceWorker' in navigator)) {
          setState(prev => ({
            ...prev,
            isSupported: false,
            error: 'Service Workers not supported in this browser'
          }));
          return;
        }

        // Check if we're in a secure context
        const isSecure = window.isSecureContext;
        setState(prev => ({ ...prev, isSupported: true, isSecure }));

        if (!isSecure) {
          setState(prev => ({
            ...prev,
            error: 'Service Worker registration requires a secure context (HTTPS or localhost)'
          }));
          return;
        }

        // Check if SW is already registered
        const existingRegistration = await navigator.serviceWorker.getRegistration();
        if (existingRegistration) {
          setState(prev => ({
            ...prev,
            isRegistered: true,
            registration: existingRegistration
          }));
          return;
        }

        // Register Service Worker
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none'
        });

        setState(prev => ({
          ...prev,
          isRegistered: true,
          registration
        }));

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available
                console.log('New content is available; please refresh.');
              }
            });
          }
        });

        // Handle controller change
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('Service Worker controller changed');
        });

        // Handle messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          const { type, timestamp, error } = event.data;
          
          switch (type) {
            case 'SYNC_STARTED':
              setState(prev => ({ ...prev, syncStatus: 'syncing' }));
              break;
            case 'SYNC_COMPLETED':
              setState(prev => ({ 
                ...prev, 
                syncStatus: 'completed',
                lastSyncTime: timestamp
              }));
              break;
            case 'SYNC_FAILED':
              setState(prev => ({ 
                ...prev, 
                syncStatus: 'failed',
                error: error || 'Sync failed'
              }));
              break;
          }
        });

      } catch (error) {
        console.error('Service Worker registration failed:', error);
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        }));
      }
    };

    // Only register when the component mounts and the page is fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkAndRegisterSW);
    } else {
      checkAndRegisterSW();
    }

    // Cleanup
    return () => {
      document.removeEventListener('DOMContentLoaded', checkAndRegisterSW);
    };
  }, []);

  const unregister = async () => {
    try {
      if (state.registration) {
        await state.registration.unregister();
        setState(prev => ({
          ...prev,
          isRegistered: false,
          registration: null
        }));
      }
    } catch (error) {
      console.error('Failed to unregister Service Worker:', error);
    }
  };

  const update = async () => {
    try {
      if (state.registration) {
        await state.registration.update();
      }
    } catch (error) {
      console.error('Failed to update Service Worker:', error);
    }
  };

  const triggerSync = async () => {
    try {
      if (state.registration && 'sync' in window.ServiceWorkerRegistration.prototype) {
        await state.registration.sync.register('precaju-sync-queue');
        setState(prev => ({ ...prev, syncStatus: 'syncing' }));
      } else {
        console.warn('Background Sync not supported');
      }
    } catch (error) {
      console.error('Failed to trigger sync:', error);
      setState(prev => ({ ...prev, syncStatus: 'failed', error: 'Failed to trigger sync' }));
    }
  };

  return {
    ...state,
    unregister,
    update,
    triggerSync
  };
};

