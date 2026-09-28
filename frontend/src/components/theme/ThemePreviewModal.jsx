import React, { useState, useEffect, useRef, useContext } from 'react';
import { X, Check, Sparkles, Sun, Moon } from 'lucide-react';
import ColibriMascot from '../ColibriMascot';
import { ThemeContext } from '../../contexts/ThemeContext';

/**
 * Modal de Vista Previa Interactiva de Temáticas Visuales
 * 100% Adaptable en Modo Claro y Modo Oscuro con alta definición cromática.
 * Desplaza automáticamente la vista hacia arriba y simula el entorno real de EquilibrIA.
 */
const ThemePreviewModal = ({ theme, isOpen, onClose, onApply, isCurrentActive }) => {
  const themeCtx = useContext(ThemeContext);
  const [previewMode, setPreviewMode] = useState(themeCtx?.theme || 'light');
  const cardRef = useRef(null);

  // Sincronizar el modo inicial según el tema del sistema
  useEffect(() => {
    if (themeCtx?.theme) {
      setPreviewMode(themeCtx.theme);
    }
  }, [themeCtx?.theme, isOpen]);

  // Al abrir, desplazarse suavemente al inicio del modal
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        cardRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    }
  }, [isOpen, theme]);

  if (!isOpen || !theme) return null;

  const isDark = previewMode === 'dark';
  const currentTokens = theme.tokens?.[previewMode] || theme.tokens?.light;

  return (
    <div 
      className="theme-preview-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div 
        ref={cardRef}
        className="theme-preview-card"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: isDark ? '#0f172a' : '#ffffff',
          color: isDark ? '#f8fafc' : '#0f172a',
          borderRadius: '24px',
          border: `1.5px solid ${isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.1)'}`,
          boxShadow: isDark 
            ? '0 25px 65px -12px rgba(0, 0, 0, 0.8), 0 0 35px rgba(99, 102, 241, 0.18)' 
            : '0 25px 65px -12px rgba(0, 0, 0, 0.25)',
          padding: '28px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '38px', lineHeight: 1 }}>{theme.icon}</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '900', color: isDark ? '#f8fafc' : '#0f172a', margin: 0 }}>
                  {theme.name}
                </h2>
                {isCurrentActive && (
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    backgroundColor: currentTokens.badgeBg,
                    color: currentTokens.badgeText,
                    padding: '3px 8px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Check size={12} /> Activa
                  </span>
                )}
              </div>
              <p style={{ fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b', margin: '4px 0 0 0' }}>
                {theme.tagline}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{
              padding: '8px',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
              color: isDark ? '#f8fafc' : '#0f172a',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
            }}
            title="Cerrar vista previa"
          >
            <X size={18} />
          </button>
        </div>

        {/* Selector de modo para la vista previa */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 16px',
          backgroundColor: isDark ? '#1e293b' : '#f8fafc',
          borderRadius: '14px',
          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`
        }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: isDark ? '#cbd5e1' : '#475569' }}>
            Simular vista en modo:
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setPreviewMode('light')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '800',
                border: !isDark ? `1.5px solid ${currentTokens.primary}` : '1px solid rgba(255,255,255,0.1)',
                backgroundColor: !isDark ? '#ffffff' : 'transparent',
                color: !isDark ? currentTokens.primary : '#94a3b8',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Sun size={14} /> Modo Claro
            </button>
            <button
              onClick={() => setPreviewMode('dark')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '800',
                border: isDark ? `1.5px solid ${currentTokens.primary}` : '1px solid rgba(0,0,0,0.1)',
                backgroundColor: isDark ? '#0f172a' : 'transparent',
                color: isDark ? currentTokens.primary : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Moon size={14} /> Modo Oscuro
            </button>
          </div>
        </div>

        {/* Escenario de Simulación Interactiva */}
        <div 
          style={{
            background: currentTokens.pageBg,
            borderRadius: '20px',
            padding: '24px',
            border: `1.5px solid ${currentTokens.cardBorder || 'rgba(0,0,0,0.1)'}`,
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '18px',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.06)'
          }}
        >
          {/* Tarjeta de muestra simulada */}
          <div style={{
            backgroundColor: isDark ? 'rgba(24, 28, 48, 0.94)' : 'rgba(255, 255, 255, 0.94)',
            borderRadius: '16px',
            padding: '16px 20px',
            border: `1px solid ${currentTokens.cardBorder}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
          }}>
            <div>
              <span style={{
                fontSize: '10.5px',
                fontWeight: '900',
                padding: '3px 10px',
                borderRadius: '8px',
                backgroundColor: currentTokens.badgeBg,
                color: currentTokens.badgeText,
                textTransform: 'uppercase',
                letterSpacing: '0.4px'
              }}>
                {theme.category?.toUpperCase() || 'TEMÁTICA'}
              </span>
              <h4 style={{
                fontSize: '14.5px',
                fontWeight: '800',
                color: isDark ? '#f8fafc' : '#1e293b',
                margin: '6px 0 2px 0'
              }}>
                Espacio de Bienestar Integral
              </h4>
              <p style={{
                fontSize: '12px',
                color: isDark ? '#94a3b8' : '#64748b',
                margin: 0
              }}>
                Armonía visual adaptada a tu ritmo y metas formativas.
              </p>
            </div>

            <button style={{
              backgroundColor: currentTokens.primary,
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 18px',
              fontSize: '12px',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: currentTokens.techGlow,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Sparkles size={14} /> Explorar
            </button>
          </div>

          {/* Demostración de la Mascota Equi con la temática */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '10px 0'
          }}>
            <ColibriMascot 
              themeId={theme.id}
              compact={false}
              customMessage={`¡Hola! Me transformo para acompañarte en la temática ${theme.name}.`}
            />
          </div>
        </div>

        {/* Muestrario de Colores (Swatches) */}
        <div>
          <label style={{ fontSize: '11px', fontWeight: '800', color: isDark ? '#cbd5e1' : '#64748b', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
            Paleta Armónica de Colores de la Temática:
          </label>
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            padding: '12px 16px',
            borderRadius: '14px',
            backgroundColor: isDark ? '#1e293b' : '#f8fafc',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'}`,
            flexWrap: 'wrap'
          }}>
            {theme.swatches.map((color, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div 
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    backgroundColor: color,
                    border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.12)'
                  }} 
                  title={color}
                />
                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: isDark ? '#cbd5e1' : '#475569', fontWeight: '700' }}>
                  {color}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Acciones del Modal */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
          paddingTop: '14px',
          borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`
        }}>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: '800',
              backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
              color: isDark ? '#f8fafc' : '#0f172a',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`
            }}
          >
            Cerrar
          </button>
          <button
            onClick={() => {
              onApply(theme.id);
              onClose();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="btn btn-primary"
            style={{
              padding: '10px 24px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: currentTokens.primary,
              boxShadow: currentTokens.techGlow
            }}
          >
            <Sparkles size={16} />
            <span>{isCurrentActive ? 'Temática Actual Aplicada' : 'Aplicar esta Temática'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemePreviewModal;
