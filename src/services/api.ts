// Base API configuration and utilities
export const API_CONFIG = {
  GHL: {
    baseUrl: import.meta.env.VITE_GHL_BASE_URL || 'https://services.leadconnectorhq.com',
    apiKey: import.meta.env.VITE_GHL_API_KEY,
    locationId: import.meta.env.VITE_GHL_LOCATION_ID,
  },
  N8N: {
    baseUrl: import.meta.env.VITE_N8N_BASE_URL,
    apiKey: import.meta.env.VITE_N8N_API_KEY,
    webhookUrl: import.meta.env.VITE_N8N_WEBHOOK_URL,
  },
  VAPI: {
    baseUrl: import.meta.env.VITE_VAPI_BASE_URL || 'https://api.vapi.ai',
    apiKey: import.meta.env.VITE_VAPI_API_KEY,
    assistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID,
    phoneNumber: import.meta.env.VITE_VAPI_PHONE_NUMBER,
  },
  WHATSAPP: {
    accessToken: import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID,
    businessAccountId: import.meta.env.VITE_WHATSAPP_BUSINESS_ACCOUNT_ID,
    baseUrl: 'https://graph.facebook.com/v18.0',
  }
};

// Generic API client with error handling
export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string, defaultHeaders: Record<string, string> = {}) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = defaultHeaders;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API Error ${response.status}: ${errorData}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text() as unknown as T;
    } catch (error) {
      console.error(`API Request failed for ${url}:`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const searchParams = params ? `?${new URLSearchParams(params)}` : '';
    return this.request<T>(`${endpoint}${searchParams}`, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Error handling utility
export const handleApiError = (error: any, context: string) => {
  console.error(`${context} Error:`, error);
  
  if (error.message?.includes('401')) {
    throw new Error('No autorizado. Verifica tus credenciales de API.');
  }
  
  if (error.message?.includes('403')) {
    throw new Error('Acceso denegado. Verifica los permisos de tu API key.');
  }
  
  if (error.message?.includes('429')) {
    throw new Error('Límite de rate excedido. Intenta de nuevo en unos minutos.');
  }
  
  if (error.message?.includes('500')) {
    throw new Error('Error del servidor. Intenta de nuevo más tarde.');
  }
  
  throw new Error(`Error en ${context}: ${error.message || 'Error desconocido'}`);
};