import { useState, useEffect, useCallback } from 'react';

export interface GeolocationPermissionState {
  permission: PermissionState | null;
  isSupported: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface GeolocationPermissionActions {
  requestPermission: () => Promise<PermissionState>;
  checkPermission: () => Promise<PermissionState>;
  resetPermission: () => void;
}

export const useGeolocationPermission = (): GeolocationPermissionState & GeolocationPermissionActions => {
  const [state, setState] = useState<GeolocationPermissionState>({
    permission: null,
    isSupported: 'permissions' in navigator,
    isLoading: false,
    error: null,
  });

  const checkPermission = useCallback(async (): Promise<PermissionState> => {
    if (!state.isSupported) {
      const error = 'Permissions API is not supported by this browser';
      setState(prev => ({ ...prev, error }));
      throw new Error(error);
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      
      setState(prev => ({
        ...prev,
        permission: permission.state,
        isLoading: false,
        error: null,
      }));

      return permission.state;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to check geolocation permission';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      throw new Error(errorMessage);
    }
  }, [state.isSupported]);

  const requestPermission = useCallback(async (): Promise<PermissionState> => {
    if (!state.isSupported) {
      const error = 'Permissions API is not supported by this browser';
      setState(prev => ({ ...prev, error }));
      throw new Error(error);
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // First check current permission
      const currentPermission = await checkPermission();
      
      // If already granted or denied, return current state
      if (currentPermission === 'granted' || currentPermission === 'denied') {
        return currentPermission;
      }

      // For 'prompt' state, we need to trigger a geolocation request
      // This will show the browser's permission dialog
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Permission request timed out'));
        }, 10000);

        navigator.geolocation.getCurrentPosition(
          () => {
            clearTimeout(timeout);
            // Permission was granted
            setState(prev => ({
              ...prev,
              permission: 'granted',
              isLoading: false,
              error: null,
            }));
            resolve('granted');
          },
          (error) => {
            clearTimeout(timeout);
            let permissionState: PermissionState = 'denied';
            
            if (error.code === error.PERMISSION_DENIED) {
              permissionState = 'denied';
            } else if (error.code === error.POSITION_UNAVAILABLE) {
              permissionState = 'denied';
            } else {
              permissionState = 'denied';
            }

            setState(prev => ({
              ...prev,
              permission: permissionState,
              isLoading: false,
              error: null,
            }));
            resolve(permissionState);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to request geolocation permission';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      throw new Error(errorMessage);
    }
  }, [state.isSupported, checkPermission]);

  const resetPermission = useCallback(() => {
    setState(prev => ({
      ...prev,
      permission: null,
      error: null,
      isLoading: false,
    }));
  }, []);

  // Check permission on mount
  useEffect(() => {
    if (state.isSupported) {
      checkPermission().catch(() => {
        // Ignore errors on initial check
      });
    }
  }, [state.isSupported, checkPermission]);

  // Listen for permission changes
  useEffect(() => {
    if (!state.isSupported) return;

    let permission: PermissionStatus | null = null;

    const setupPermissionListener = async () => {
      try {
        permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        
        const handlePermissionChange = () => {
          setState(prev => ({
            ...prev,
            permission: permission!.state,
          }));
        };

        permission.addEventListener('change', handlePermissionChange);

        return () => {
          if (permission) {
            permission.removeEventListener('change', handlePermissionChange);
          }
        };
      } catch (error) {
        console.warn('Could not set up permission listener:', error);
        return () => {};
      }
    };

    const cleanup = setupPermissionListener();
    
    return () => {
      cleanup.then(cleanupFn => cleanupFn());
    };
  }, [state.isSupported]);

  return {
    ...state,
    requestPermission,
    checkPermission,
    resetPermission,
  };
};

