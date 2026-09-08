import axios from 'axios';

// Obtener la URL base y asegurarse de que termine en /api
let apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
if (!apiBaseUrl.endsWith('/api') && !apiBaseUrl.endsWith('/api/')) {
  apiBaseUrl = apiBaseUrl.replace(/\/+$/, '') + '/api';
}

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000,
});

// Interceptor de peticiones para inyectar el token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuestas para capturar errores de sesión expirada
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || (error.response.status === 403 && error.response.data?.message?.includes('Token')))) {
      // Sesión expirada o no autorizada -> Limpiar credenciales
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('remember_me');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      
      // Evitar bucles infinitos de redirección
      const publicPaths = ['/login', '/registro', '/register', '/verificar-correo', '/recuperar-contrasena', '/restablecer-contrasena', '/forgot-password', '/reset-password'];
      const isPublic = publicPaths.some(p => window.location.pathname.startsWith(p));
      if (!isPublic) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

