import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env['VITE_API_URL'] || 'http://localhost:8080';

// Types pour une meilleure gestion des erreurs
interface ApiErrorData {
  message?: string;
  status?: number;
  statusText?: string;
  details?: any;
  timestamp?: string;
}

interface ApiError extends Error {
  status: number;
  statusText: string;
  data: ApiErrorData;
  url: string;
  isApiError: true;
}

// Utility function to handle API responses
const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorData: ApiErrorData = {};
    
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        message: response.statusText || 'Unknown error',
        status: response.status,
        statusText: response.statusText
      };
    }

    const error = new Error(errorData.message || response.statusText || 'API Error') as ApiError;
    error.status = response.status;
    error.statusText = response.statusText;
    error.data = errorData;
    error.url = response.url;
    error.isApiError = true;
    
    throw error;
  }

  return response.json();
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

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return handleApiResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return handleApiResponse<T>(response);
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return handleApiResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    return handleApiResponse<T>(response);
  }
}

// Export a default instance
export const apiClient = new ApiClient();
