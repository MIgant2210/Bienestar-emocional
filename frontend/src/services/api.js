import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 8000,
});

// Interceptor de peticiones para inyectar el token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
      
      // Evitar bucles infinitos de redirección
      const publicPaths = ['/login', '/registro', '/register', '/verificar-correo'];
      const isPublic = publicPaths.some(p => window.location.pathname.startsWith(p));
      if (!isPublic) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
