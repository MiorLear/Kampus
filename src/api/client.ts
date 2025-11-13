import axios, { AxiosInstance, AxiosError } from 'axios';
import { auth } from '../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Cliente HTTP configurado para comunicarse con el backend
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos para operaciones pesadas
});

/**
 * Interceptor de requests: Agrega el token de autenticación
 */
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      if (user) {
        try {
          const token = await user.getIdToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (tokenError) {
          console.warn('Error getting auth token, proceeding without token:', tokenError);
          // Continue without token if there's an error getting it
        }
      }
    } catch (error) {
      console.error('Error in auth interceptor:', error);
      // Continue with the request even if there's an error
    }
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Interceptor de responses: Manejo centralizado de errores
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // El servidor respondió con un código de error
      const status = error.response.status;
      const data = error.response.data as any;

      switch (status) {
        case 401:
          // Token inválido o expirado
          console.error('Unauthorized: Token expired or invalid');
          // Opcional: Redirigir a login
          // window.location.href = '/auth';
          break;
        case 403:
          console.error('Forbidden: Insufficient permissions');
          break;
        case 404:
          console.error('Not Found:', data?.message || 'Resource not found');
          break;
        case 500:
          console.error('Server Error:', data?.message || 'Internal server error');
          break;
        default:
          console.error('API Error:', data?.message || error.message);
      }
    } else if (error.request) {
      // Request fue enviado pero no hubo respuesta
      console.error('Network Error: No response from server');
      console.error('Request details:', {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        timeout: error.config?.timeout,
      });
      // Check if it's a CORS error
      if (error.message.includes('CORS') || error.code === 'ERR_NETWORK') {
        console.error('Possible CORS issue. Check:', {
          backendUrl: API_BASE_URL,
          frontendUrl: window.location.origin,
        });
      }
    } else {
      // Error al configurar el request
      console.error('Request Error:', error.message);
    }

    return Promise.reject(error);
  }
);


