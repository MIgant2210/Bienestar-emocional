import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || sessionStorage.getItem('token') || null;
  });

  const [loading, setLoading] = useState(false);

  // Helper para persistir credenciales según "Recordarme"
  const persistSession = (authToken, authUser, rememberMe = true) => {
    if (rememberMe) {
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(authUser));
      localStorage.setItem('remember_me', 'true');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    } else {
      sessionStorage.setItem('token', authToken);
      sessionStorage.setItem('user', JSON.stringify(authUser));
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('remember_me');
    }
    setToken(authToken);
    setUser(authUser);
  };

  useEffect(() => {
    const verifySession = async () => {
      const currentToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (currentToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data) {
            const isRemembered = localStorage.getItem('remember_me') === 'true';
            persistSession(currentToken, res.data, isRemembered);
          } else {
            logout();
          }
        } catch {
          // Token expirado o inválido -> Limpiar sesión de forma segura
          logout();
        }
      } else {
        logout();
      }
    };

    verifySession();
  }, []);

  const login = async (email, password, rememberMe = false) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
        remember_me: rememberMe
      });
      const { token: authToken, user: authUser } = response.data;
      persistSession(authToken, authUser, rememberMe);
      return { success: true, user: authUser };
    } catch (error) {
      const message = error.response?.data?.message || 'Error de conexión con el servidor.';
      const status = error.response?.data?.status;
      return { success: false, message, status };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (credentialToken, rememberMe = true) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/google', {
        credential: credentialToken,
        remember_me: rememberMe
      });

      if (response.data?.is_new_user) {
        return {
          success: false,
          is_new_user: true,
          google_profile: response.data.google_profile,
          message: response.data.message
        };
      }

      const { token: authToken, user: authUser } = response.data;
      persistSession(authToken, authUser, rememberMe);
      return { success: true, user: authUser };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al autenticar con Google.';
      const status = error.response?.data?.status;
      return { success: false, message, status };
    } finally {
      setLoading(false);
    }
  };

  const completeGoogleRegistration = async (registrationData, rememberMe = true) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/google/complete-registration', {
        ...registrationData,
        remember_me: rememberMe
      });
      const { token: authToken, user: authUser } = response.data;
      persistSession(authToken, authUser, rememberMe);
      return { success: true, user: authUser };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al finalizar el registro institucional.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', userData);
      return { success: true, data: res.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al registrar el usuario.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (updatedUserData) => {
    setUser(prev => {
      const next = typeof updatedUserData === 'function' 
        ? updatedUserData(prev) 
        : { ...(prev || {}), ...updatedUserData };
      try {
        if (localStorage.getItem('user') || !sessionStorage.getItem('user')) {
          localStorage.setItem('user', JSON.stringify(next));
        } else {
          sessionStorage.setItem('user', JSON.stringify(next));
        }
      } catch (err) {
        console.warn('Error al persistir usuario en storage:', err);
      }
      return next;
    });
  };

  const loginUser = updateUser;

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('remember_me');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      loginWithGoogle,
      completeGoogleRegistration,
      register,
      logout,
      setUser,
      updateUser,
      loginUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
