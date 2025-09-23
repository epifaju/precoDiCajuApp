import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env['VITE_API_URL'] || 'http://localhost:8080';

// Enhanced types for better error handling
interface ApiErrorData {
  message?: string;
  status?: number;
  statusText?: string;
  details?: any;
  timestamp?: string;
  path?: string;
  errors?: Record<string, string[]>; // For validation errors
}

export interface ApiError extends Error {
  status: number;
  statusText: string;
  data: ApiErrorData;
  url: string;
  isApiError: true;
  requestId?: string;
}

// Response wrapper type to handle backend structure
interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: string;
  timestamp?: string;
}

// Logger utility for debugging
const logger = {
  error: (message: string, data?: any) => {
    console.error(`🔴 [API Error] ${message}`, data);
  },
  warn: (message: string, data?: any) => {
    console.warn(`🟡 [API Warning] ${message}`, data);
  },
  info: (message: string, data?: any) => {
    console.info(`🔵 [API Info] ${message}`, data);
  },
  debug: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.debug(`🔍 [API Debug] ${message}`, data);
    }
  }
};

// Enhanced utility function to handle API responses
const handleApiResponse = async <T>(response: Response): Promise<T> => {
  const startTime = Date.now();
  const responseTime = () => Date.now() - startTime;
  
  // Log request info
  logger.debug(`Response received`, {
    url: response.url,
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries())
  });

  if (!response.ok) {
    let errorData: ApiErrorData = {
      status: response.status,
      statusText: response.statusText,
      path: response.url,
      timestamp: new Date().toISOString()
    };
    
    const contentType = response.headers.get('content-type');
    
    try {
      if (contentType?.includes('application/json')) {
        const jsonError = await response.json();
        errorData = { ...errorData, ...jsonError };
      } else {
        // For non-JSON responses (HTML error pages, plain text, etc.)
        const textError = await response.text();
        errorData.message = textError || response.statusText || 'Unknown error';
        logger.warn(`Non-JSON error response`, { contentType, textError });
      }
    } catch (parseError) {
      logger.error(`Failed to parse error response`, {
        parseError: parseError instanceof Error ? parseError.message : parseError,
        contentType,
        status: response.status
      });
      
      errorData.message = response.statusText || `HTTP ${response.status} Error`;
    }

    // Enhanced error message based on status code
    const statusMessages: Record<number, string> = {
      400: 'Requête invalide - Vérifiez les données envoyées',
      401: 'Non autorisé - Veuillez vous reconnecter',
      403: 'Accès interdit - Permissions insuffisantes',
      404: 'Ressource non trouvée',
      408: 'Délai d\'attente dépassé',
      409: 'Conflit - La ressource existe déjà',
      422: 'Données invalides',
      429: 'Trop de requêtes - Veuillez patienter',
      500: 'Erreur serveur interne',
      502: 'Passerelle défaillante',
      503: 'Service temporairement indisponible',
      504: 'Délai d\'attente de la passerelle'
    };

    const defaultMessage = errorData.message || statusMessages[response.status] || `Erreur HTTP ${response.status}`;
    
    const error = new Error(defaultMessage) as ApiError;
    error.status = response.status;
    error.statusText = response.statusText;
    error.data = errorData;
    error.url = response.url;
    error.isApiError = true;
    error.requestId = response.headers.get('x-request-id') || undefined;
    
    // Log the complete error for debugging
    logger.error(`API request failed`, {
      url: response.url,
      status: response.status,
      statusText: response.statusText,
      errorData,
      responseTime: responseTime(),
      requestId: error.requestId
    });
    
    throw error;
  }

  // Handle successful responses
  try {
    const contentType = response.headers.get('content-type');
    
    if (!contentType?.includes('application/json')) {
      logger.warn(`Expected JSON response but got ${contentType}`, {
        url: response.url,
        contentType
      });
      
      // Try to parse as text if not JSON
      const text = await response.text();
      return text as unknown as T;
    }

    const jsonData = await response.json();
    
    logger.debug(`Successful API response`, {
      url: response.url,
      responseTime: responseTime(),
      dataKeys: typeof jsonData === 'object' ? Object.keys(jsonData) : 'primitive'
    });

    // Handle backend response structure - check if it's wrapped in a "data" property
    if (jsonData && typeof jsonData === 'object' && 'data' in jsonData) {
      return (jsonData as ApiResponse<T>).data;
    }
    
    return jsonData;
  } catch (parseError) {
    logger.error(`Failed to parse successful response as JSON`, {
      parseError: parseError instanceof Error ? parseError.message : parseError,
      url: response.url,
      responseTime: responseTime()
    });
    
    const error = new Error('Réponse du serveur invalide (JSON mal formé)') as ApiError;
    error.status = 502; // Bad Gateway - server returned invalid response
    error.statusText = 'Invalid JSON Response';
    error.data = {
      message: 'La réponse du serveur n\'est pas un JSON valide',
      status: 502,
      statusText: 'Invalid JSON Response',
      details: parseError instanceof Error ? parseError.message : parseError
    };
    error.url = response.url;
    error.isApiError = true;
    
    throw error;
  }
};

// API Client class
export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): HeadersInit {
    const token = useAuthStore.getState().accessToken;
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async get<T>(endpoint: string, options: { timeout?: number; retries?: number } = {}): Promise<T> {
    const { timeout = 10000, retries = 0 } = options; // Default 10s timeout, 0 retries
    const startTime = Date.now();
    
    logger.info(`Starting GET request`, {
      endpoint,
      timeout,
      retries,
      timestamp: new Date().toISOString()
    });
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        logger.warn(`Request timeout triggered after ${timeout}ms`, { endpoint, attempt });
        controller.abort();
      }, timeout);

      const attemptStartTime = Date.now();

      try {
        logger.debug(`Attempt ${attempt + 1}/${retries + 1}`, {
          endpoint,
          attempt,
          timeoutMs: timeout
        });

        const response = await fetch(`${this.baseURL}${endpoint}`, {
          method: 'GET',
          headers: this.getAuthHeaders(),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        
        const attemptTime = Date.now() - attemptStartTime;
        logger.debug(`Request completed`, {
          endpoint,
          attempt: attempt + 1,
          attemptTime,
          totalTime: Date.now() - startTime,
          status: response.status
        });

        return handleApiResponse<T>(response);
      } catch (error: any) {
        clearTimeout(timeoutId);
        const attemptTime = Date.now() - attemptStartTime;
        
        // Enhanced error logging
        logger.error(`Request attempt ${attempt + 1} failed`, {
          endpoint,
          attempt: attempt + 1,
          maxRetries: retries + 1,
          attemptTime,
          totalTime: Date.now() - startTime,
          errorName: error?.name,
          errorMessage: error?.message,
          isApiError: error?.isApiError,
          status: error?.status
        });
        
        if (error?.name === 'AbortError') {
          const timeoutError = new Error(`Délai d'attente dépassé après ${timeout}ms pour ${endpoint}`) as ApiError;
          timeoutError.status = 408;
          timeoutError.statusText = 'Request Timeout';
          timeoutError.data = {
            message: `Délai d'attente dépassé après ${timeout}ms`,
            status: 408,
            statusText: 'Request Timeout',
            details: { timeout, attempt: attempt + 1, totalTime: Date.now() - startTime }
          };
          timeoutError.url = `${this.baseURL}${endpoint}`;
          timeoutError.isApiError = true;
          
          if (attempt < retries) {
            const backoffMs = Math.min(1000 * Math.pow(2, attempt), 5000);
            logger.warn(`Timeout - retrying in ${backoffMs}ms`, {
              endpoint,
              attempt: attempt + 1,
              maxRetries: retries + 1,
              backoffMs
            });
            await new Promise(resolve => setTimeout(resolve, backoffMs));
            continue;
          }
          throw timeoutError;
        }
        
        // For API errors (4xx, 5xx), don't retry unless it's a server error (5xx)
        if (error?.isApiError) {
          // Enhanced retry logic for specific status codes
          const isRetryableStatus = 
            error.status >= 500 || // Server errors
            error.status === 429 || // Too many requests
            error.status === 503 || // Service unavailable
            error.status === 502 || // Bad gateway
            error.status === 504;   // Gateway timeout
            
          const shouldRetry = isRetryableStatus && attempt < retries;
          if (shouldRetry) {
            // Exponential backoff with jitter for better load distribution
            const baseBackoff = Math.min(1000 * Math.pow(2, attempt), 5000);
            const jitter = Math.random() * 1000; // Add up to 1s jitter
            const backoffMs = Math.floor(baseBackoff + jitter);
            
            logger.warn(`Server error (${error.status}) - retrying in ${backoffMs}ms`, {
              endpoint,
              status: error.status,
              statusText: error.statusText,
              attempt: attempt + 1,
              maxRetries: retries + 1,
              backoffMs,
              errorMessage: error.data?.message
            });
            await new Promise(resolve => setTimeout(resolve, backoffMs));
            continue;
          }
          throw error;
        }
        
        // For network errors, retry if we have attempts left
        if (attempt < retries && (error?.name === 'TypeError' || error?.message?.includes('fetch'))) {
          const backoffMs = Math.min(1000 * Math.pow(2, attempt), 5000);
          logger.warn(`Network error - retrying in ${backoffMs}ms`, {
            endpoint,
            errorName: error?.name,
            errorMessage: error?.message,
            attempt: attempt + 1,
            maxRetries: retries + 1,
            backoffMs
          });
          await new Promise(resolve => setTimeout(resolve, backoffMs));
          continue;
        }
        
        throw error;
      }
    }
    
    // This should never be reached due to the throw statements above
    const unexpectedError = new Error('Erreur inattendue dans le client API') as ApiError;
    unexpectedError.status = 500;
    unexpectedError.statusText = 'Internal Client Error';
    unexpectedError.data = {
      message: 'Erreur inattendue dans le client API',
      status: 500,
      statusText: 'Internal Client Error'
    };
    unexpectedError.url = `${this.baseURL}${endpoint}`;
    unexpectedError.isApiError = true;
    
    logger.error(`Unexpected error - this should not happen`, {
      endpoint,
      totalTime: Date.now() - startTime
    });
    
    throw unexpectedError;
  }

  private async makeRequest<T>(
    method: 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    options: { timeout?: number; retries?: number } = {}
  ): Promise<T> {
    const { timeout = 10000, retries = 0 } = options;
    const startTime = Date.now();
    
    logger.info(`Starting ${method} request`, {
      endpoint,
      timeout,
      retries,
      hasBody: !!data,
      timestamp: new Date().toISOString()
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      logger.warn(`${method} request timeout after ${timeout}ms`, { endpoint });
      controller.abort();
    }, timeout);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method,
        headers: this.getAuthHeaders(),
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      logger.debug(`${method} request completed`, {
        endpoint,
        status: response.status,
        responseTime: Date.now() - startTime
      });

      return handleApiResponse<T>(response);
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      logger.error(`${method} request failed`, {
        endpoint,
        responseTime: Date.now() - startTime,
        errorName: error?.name,
        errorMessage: error?.message,
        isApiError: error?.isApiError,
        status: error?.status
      });

      if (error?.name === 'AbortError') {
        const timeoutError = new Error(`Délai d'attente dépassé après ${timeout}ms pour ${method} ${endpoint}`) as ApiError;
        timeoutError.status = 408;
        timeoutError.statusText = 'Request Timeout';
        timeoutError.data = {
          message: `Délai d'attente dépassé après ${timeout}ms`,
          status: 408,
          statusText: 'Request Timeout',
          details: { timeout, method, responseTime: Date.now() - startTime }
        };
        timeoutError.url = `${this.baseURL}${endpoint}`;
        timeoutError.isApiError = true;
        throw timeoutError;
      }

      throw error;
    }
  }

  async post<T>(endpoint: string, data?: any, options?: { timeout?: number; retries?: number }): Promise<T> {
    return this.makeRequest<T>('POST', endpoint, data, options);
  }

  async put<T>(endpoint: string, data?: any, options?: { timeout?: number; retries?: number }): Promise<T> {
    return this.makeRequest<T>('PUT', endpoint, data, options);
  }

  async delete<T>(endpoint: string, options?: { timeout?: number; retries?: number }): Promise<T> {
    return this.makeRequest<T>('DELETE', endpoint, undefined, options);
  }
}

// Export a default instance
export const apiClient = new ApiClient();
