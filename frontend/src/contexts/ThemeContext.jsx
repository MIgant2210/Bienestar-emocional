import React, { createContext, useState, useEffect } from 'react';

export const PALETTES = [
  { id: 'indigo', name: 'Indigo Neón', icon: '🟣', primary: '#6366f1', hover: '#4f46e5', accent: '#8b5cf6', light: 'rgba(99, 102, 241, 0.15)' },
  { id: 'emerald', name: 'Esmeralda Mente', icon: '🟢', primary: '#10b981', hover: '#059669', accent: '#14b8a6', light: 'rgba(16, 185, 129, 0.15)' },
  { id: 'ocean', name: 'Azul Océano', icon: '🔵', primary: '#0284c7', hover: '#0369a1', accent: '#2563eb', light: 'rgba(2, 132, 199, 0.15)' },
  { id: 'sunset', name: 'Atardecer Dorado', icon: '🟠', primary: '#f59e0b', hover: '#d97706', accent: '#ea580c', light: 'rgba(245, 158, 11, 0.15)' },
  { id: 'cyberpunk', name: 'Rosa Ciberpunk', icon: '💖', primary: '#ec4899', hover: '#db2777', accent: '#d946ef', light: 'rgba(236, 72, 153, 0.15)' }
];

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  const [colorPalette, setColorPalette] = useState(() => {
    return localStorage.getItem('colorPalette') || 'indigo';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const selected = PALETTES.find(p => p.id === colorPalette) || PALETTES[0];
    document.documentElement.setAttribute('data-palette', colorPalette);
    localStorage.setItem('colorPalette', colorPalette);

    // Inyectar variables CSS dinámicas en la raíz del documento
    const root = document.documentElement;
    root.style.setProperty('--primary', selected.primary);
    root.style.setProperty('--primary-hover', selected.hover);
    root.style.setProperty('--accent', selected.accent);
    root.style.setProperty('--primary-light', selected.light);
    root.style.setProperty('--tech-glow', `0 0 20px ${selected.light}`);
    root.style.setProperty('--accent-tech-glow', `0 0 20px ${selected.light}`);
  }, [colorPalette]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const changePalette = (paletteId) => {
    setColorPalette(paletteId);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colorPalette, changePalette, PALETTES }}>
      {children}
    </ThemeContext.Provider>
  );
};
