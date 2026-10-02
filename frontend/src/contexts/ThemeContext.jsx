import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { THEMES, getThemeById } from '../themes/themeConfig';
import { resolveAutomatedTheme, THEME_CALENDAR_SCHEDULE } from '../utils/themeSchedule';

export const PALETTES = [
  { id: 'indigo', name: 'Indigo Neón', primary: '#6366f1', hover: '#4f46e5', accent: '#8b5cf6', light: 'rgba(99, 102, 241, 0.15)' },
  { id: 'emerald', name: 'Esmeralda Mente', primary: '#10b981', hover: '#059669', accent: '#14b8a6', light: 'rgba(16, 185, 129, 0.15)' },
  { id: 'ocean', name: 'Azul Océano', primary: '#0284c7', hover: '#0369a1', accent: '#2563eb', light: 'rgba(2, 132, 199, 0.15)' },
  { id: 'sunset', name: 'Atardecer Dorado', primary: '#f59e0b', hover: '#d97706', accent: '#ea580c', light: 'rgba(245, 158, 11, 0.15)' },
  { id: 'cyberpunk', name: 'Rosa Ciberpunk', primary: '#ec4899', hover: '#db2777', accent: '#d946ef', light: 'rgba(236, 72, 153, 0.15)' }
];

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Modo de color (Claro / Oscuro)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  // Modo de asignación de temáticas: 'auto' (calendario/cumpleaños) o 'manual'
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('themeMode') || 'auto';
  });

  // Tipo de personalización: 'theme' (Temáticas completas) o 'palette' (Paletas tradicionales)
  const [customizationType, setCustomizationType] = useState(() => {
    return localStorage.getItem('customizationType') || 'theme';
  });

  // Usuario en sesión para cálculo de cumpleaños y fechas especiales
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user') || sessionStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Escuchar cambios de sesión/perfil para mantener el cumpleaños actualizado
  useEffect(() => {
    const handleSyncUser = () => {
      try {
        const saved = localStorage.getItem('user') || sessionStorage.getItem('user');
        const parsed = saved ? JSON.parse(saved) : null;
        setCurrentUser(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(parsed)) {
            return parsed;
          }
          return prev;
        });
      } catch {
        setCurrentUser(null);
      }
    };

    window.addEventListener('storage', handleSyncUser);
    const interval = setInterval(handleSyncUser, 2000);
    return () => {
      window.removeEventListener('storage', handleSyncUser);
      clearInterval(interval);
    };
  }, []);

  // Temática automática calculada según el calendario actual y el cumpleaños del usuario
  const autoResolvedTheme = useMemo(() => {
    return resolveAutomatedTheme(currentUser, new Date());
  }, [currentUser]);

  // Temática visual seleccionada (14 disponibles)
  const [activeTheme, setActiveTheme] = useState(() => {
    const saved = localStorage.getItem('activeTheme');
    const savedMode = localStorage.getItem('themeMode') || 'auto';
    if (savedMode === 'auto') {
      const initialAuto = resolveAutomatedTheme(currentUser, new Date());
      return initialAuto.themeId;
    }
    return saved || 'equilibria';
  });

  // Paleta de color seleccionada (5 tradicionales)
  const [colorPalette, setColorPalette] = useState(() => {
    return localStorage.getItem('colorPalette') || 'indigo';
  });

  // Sincronización automática de temática según calendario y cumpleaños
  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);

    // Si hoy es el cumpleaños del usuario, ¡activar tematica de cumpleaños con maxima prioridad!
    if (autoResolvedTheme.isBirthday) {
      setActiveTheme('birthday');
      setCustomizationType('theme');
      return;
    }

    // Si el modo es automático, actualizar cuando cambie el día o calendario
    if (themeMode === 'auto') {
      setActiveTheme(autoResolvedTheme.themeId);
      setCustomizationType('theme');
    }
  }, [themeMode, autoResolvedTheme]);

  // Objeto completo de la temática activa
  const activeThemeData = useMemo(() => {
    return getThemeById(activeTheme);
  }, [activeTheme]);

  // Sincronizar data-theme (light / dark)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Aplicar estilos según tipo de personalización
  useEffect(() => {
    const root = document.documentElement;
    localStorage.setItem('customizationType', customizationType);
    localStorage.setItem('activeTheme', activeTheme);
    localStorage.setItem('colorPalette', colorPalette);

    if (customizationType === 'theme') {
      const currentThemeObj = getThemeById(activeTheme);
      const tokens = currentThemeObj.tokens[theme] || currentThemeObj.tokens.light;

      root.setAttribute('data-visual-theme', activeTheme);
      root.setAttribute('data-theme-category', currentThemeObj.category || 'official');
      root.setAttribute('data-palette', 'custom-theme');

      root.style.setProperty('--primary', tokens.primary);
      root.style.setProperty('--primary-hover', tokens.primaryHover);
      root.style.setProperty('--accent', tokens.accent);
      root.style.setProperty('--primary-light', tokens.primaryLight);
      root.style.setProperty('--tech-glow', tokens.techGlow);
      root.style.setProperty('--accent-tech-glow', tokens.techGlow);
      root.style.setProperty('--page-bg', tokens.pageBg);
      root.style.setProperty('--theme-card-border', tokens.cardBorder);
      root.style.setProperty('--theme-badge-bg', tokens.badgeBg);
      root.style.setProperty('--theme-badge-text', tokens.badgeText);
    } else {
      // Modo tradicional de Paletas
      const selectedPalette = PALETTES.find(p => p.id === colorPalette) || PALETTES[0];

      root.setAttribute('data-visual-theme', 'palette');
      root.removeAttribute('data-theme-category');
      root.setAttribute('data-palette', colorPalette);

      root.style.setProperty('--primary', selectedPalette.primary);
      root.style.setProperty('--primary-hover', selectedPalette.hover);
      root.style.setProperty('--accent', selectedPalette.accent);
      root.style.setProperty('--primary-light', selectedPalette.light);
      root.style.setProperty('--tech-glow', `0 0 20px ${selectedPalette.light}`);
      root.style.setProperty('--accent-tech-glow', `0 0 20px ${selectedPalette.light}`);

      const defaultPageBg = theme === 'dark' 
        ? 'linear-gradient(135deg, #0f1222 0%, #181c34 100%)'
        : 'linear-gradient(135deg, #fcf7ef 0%, #f8ebd6 100%)';
      root.style.setProperty('--page-bg', defaultPageBg);
      root.style.removeProperty('--theme-card-border');
      root.style.removeProperty('--theme-badge-bg');
      root.style.removeProperty('--theme-badge-text');
    }
  }, [theme, customizationType, activeTheme, colorPalette]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const changeTheme = (themeId, isManual = true) => {
    setActiveTheme(themeId);
    setCustomizationType('theme');
    if (isManual) {
      setThemeMode('manual');
      localStorage.setItem('themeMode', 'manual');
    }
  };

  const changePalette = (paletteId) => {
    setColorPalette(paletteId);
    setCustomizationType('palette');
    setThemeMode('manual');
    localStorage.setItem('themeMode', 'manual');
  };

  const enableAutoTheme = () => {
    setThemeMode('auto');
    localStorage.setItem('themeMode', 'auto');
    setActiveTheme(autoResolvedTheme.themeId);
    setCustomizationType('theme');
  };

  const syncUser = useCallback((userObj) => {
    setCurrentUser(userObj);
  }, []);

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      activeTheme, 
      changeTheme, 
      activeThemeData,
      colorPalette, 
      changePalette, 
      customizationType, 
      setCustomizationType,
      themeMode,
      setThemeMode,
      enableAutoTheme,
      autoResolvedTheme,
      syncUser,
      THEME_CALENDAR_SCHEDULE,
      PALETTES,
      THEMES
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
