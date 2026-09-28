import React, { createContext, useState, useEffect, useMemo } from 'react';
import { THEMES, getThemeById } from '../themes/themeConfig';

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

  // Tipo de personalización: 'theme' (Temáticas completas) o 'palette' (Paletas tradicionales)
  const [customizationType, setCustomizationType] = useState(() => {
    return localStorage.getItem('customizationType') || 'theme';
  });

  // Temática visual seleccionada (14 disponibles)
  const [activeTheme, setActiveTheme] = useState(() => {
    return localStorage.getItem('activeTheme') || 'equilibria';
  });

  // Paleta de color seleccionada (5 tradicionales)
  const [colorPalette, setColorPalette] = useState(() => {
    return localStorage.getItem('colorPalette') || 'indigo';
  });

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

  const changeTheme = (themeId) => {
    setActiveTheme(themeId);
    setCustomizationType('theme');
  };

  const changePalette = (paletteId) => {
    setColorPalette(paletteId);
    setCustomizationType('palette');
  };

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
      PALETTES,
      THEMES
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
