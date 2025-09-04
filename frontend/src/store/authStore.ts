import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'ADMIN' | 'MODERATOR' | 'CONTRIBUTOR';
  reputationScore: number;
  preferredRegions: string[];
  preferredLanguage?: string;
  emailVerified: boolean;
  active: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  logoutReason: string | null;
}

interface AuthActions {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (email: string, password: string, fullName: string, phone?: string) => Promise<void>;
  logout: (reason?: string) => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => void;
  clearLogoutReason: () => void;
  forceLogout: (reason: string) => void;
}

type AuthStore = AuthState & AuthActions;

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      logoutReason: null,

      // Actions
      login: async (email: string, password: string, rememberMe = false) => {
        set({ isLoading: true, error: null, logoutReason: null });
        
        try {
          const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, rememberMe }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
            throw new Error(errorData.message || 'Login failed');
          }

          const data = await response.json();
          
          set({
            user: data.user,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            logoutReason: null,
          });

          // Update last login time and apply user's preferred language
          if (data.user) {
            set({
              user: {
                ...data.user,
                lastLoginAt: new Date().toISOString(),
              },
            });
            
            // Apply user's preferred language if available
            if (data.user.preferredLanguage) {
              // Import i18n dynamically to avoid circular dependency
              import('../i18n').then(({ default: i18n }) => {
                if (i18n.language !== data.user.preferredLanguage) {
                  i18n.changeLanguage(data.user.preferredLanguage);
                }
              });
            }
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed',
          });
          throw error;
        }
      },

      register: async (email: string, password: string, fullName: string, phone?: string) => {
        set({ isLoading: true, error: null, logoutReason: null });
        
        try {
          const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, fullName, phone }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
            throw new Error(errorData.message || 'Registration failed');
          }

          const data = await response.json();
          
          set({
            user: data.user,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            logoutReason: null,
          });
          
          // Apply user's preferred language if available
          if (data.user.preferredLanguage) {
            // Import i18n dynamically to avoid circular dependency
            import('../i18n').then(({ default: i18n }) => {
              if (i18n.language !== data.user.preferredLanguage) {
                i18n.changeLanguage(data.user.preferredLanguage);
              }
            });
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Registration failed',
          });
          throw error;
        }
      },

      logout: async (reason?: string) => {
        const { refreshToken } = get();
        
        set({ isLoading: true });
        
        try {
          // Call logout endpoint to invalidate tokens on server
          if (refreshToken) {
            await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refreshToken }),
            });
          }
        } catch (error) {
          console.error('Logout API call failed:', error);
          // Continue with local logout even if API call fails
        }

        // Clear all auth data
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          logoutReason: reason || 'user_logout',
        });

        // Clear any stored data
        localStorage.removeItem('precaju-auth-storage');
        sessionStorage.clear();

        // Clear any cached data
        if (window.location.hostname === 'localhost') {
          // Clear React Query cache in development
          const queryCache = (window as any).__REACT_QUERY_CACHE__;
          if (queryCache) {
            queryCache.clear();
          }
        }
      },

      forceLogout: (reason: string) => {
        // Immediate logout without API call (for security reasons)
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          logoutReason: reason,
        });

        localStorage.removeItem('precaju-auth-storage');
        sessionStorage.clear();
      },

      refreshAuth: async () => {
        const { refreshToken } = get();
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        try {
          const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });

          if (!response.ok) {
            throw new Error('Token refresh failed');
          }

          const data = await response.json();
          
          set({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            user: data.user,
            isAuthenticated: true,
            error: null,
          });
          
          // Apply user's preferred language if available
          if (data.user.preferredLanguage) {
            // Import i18n dynamically to avoid circular dependency
            import('../i18n').then(({ default: i18n }) => {
              if (i18n.language !== data.user.preferredLanguage) {
                i18n.changeLanguage(data.user.preferredLanguage);
              }
            });
          }
        } catch (error) {
          // If refresh fails, force logout user
          get().forceLogout('token_expired');
          throw error;
        }
      },

      clearError: () => set({ error: null }),

      clearLogoutReason: () => set({ logoutReason: null }),

      updateUser: (userData: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...userData } });
        }
      },
    }),
    {
      name: 'precaju-auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Auth interceptor hook for API calls
export const useAuthInterceptor = () => {
  const { accessToken, refreshAuth, forceLogout } = useAuthStore();

  const authFetch = async (url: string, options: RequestInit = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    let response = await fetch(url, { ...options, headers });

    // If token expired, try to refresh
    if (response.status === 401 && accessToken) {
      try {
        await refreshAuth();
        const newToken = useAuthStore.getState().accessToken;
        
        if (newToken) {
          headers.Authorization = `Bearer ${newToken}`;
          response = await fetch(url, { ...options, headers });
        }
      } catch (error) {
        // If refresh fails, force logout
        forceLogout('session_expired');
        throw new Error('Session expired. Please login again.');
      }
    }

    // If still unauthorized after refresh, logout
    if (response.status === 401) {
      forceLogout('unauthorized');
      throw new Error('Access denied. Please login again.');
    }

    return response;
  };

  return authFetch;
};

// Auto-logout on tab/window close (optional security feature)
export const setupAutoLogout = () => {
  const handleBeforeUnload = () => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      // Store a flag to indicate the user left without proper logout
      sessionStorage.setItem('precaju-session-ended', 'true');
    }
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      const { accessToken } = useAuthStore.getState();
      if (accessToken) {
        sessionStorage.setItem('precaju-session-ended', 'true');
      }
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Check if session was ended abruptly
  const sessionEnded = sessionStorage.getItem('precaju-session-ended');
  if (sessionEnded) {
    sessionStorage.removeItem('precaju-session-ended');
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      // Optionally show a message about session security
      console.log('Session security: Previous session ended abruptly');
    }
  }

  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};

