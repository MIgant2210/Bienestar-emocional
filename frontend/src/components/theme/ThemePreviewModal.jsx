import React, { useState } from 'react';
import { X, Check, Sparkles, Sun, Moon, Shield, Award, Heart } from 'lucide-react';
import ColibriMascot from '../ColibriMascot';

/**
 * Modal de Vista Previa Interactiva de Temáticas Visuales
 * Permite a los usuarios inspeccionar el diseño, los colores y la mascota Equi
 * en modo claro u oscuro antes de aplicar los cambios en todo el sistema.
 */
const ThemePreviewModal = ({ theme, isOpen, onClose, onApply, isCurrentActive }) => {
  const [previewMode, setPreviewMode] = useState('light');

  if (!isOpen || !theme) return null;

  const currentTokens = theme.tokens?.[previewMode] || theme.tokens?.light;

  return (
    <div 
      className="theme-preview-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div 
        className="theme-preview-card"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '92vh',
          overflowY: 'auto',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '24px',
          border: '1.5px solid var(--border)',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.3)',
          padding: '28px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '22px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '36px', lineHeight: 1 }}>{theme.icon}</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>
                  {theme.name}
                </h2>
                {isCurrentActive && (
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
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
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                {theme.tagline}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '8px', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '14px',
          border: '1px solid var(--border)'
        }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>
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
                border: previewMode === 'light' ? `1.5px solid ${currentTokens.primary}` : '1px solid var(--border)',
                backgroundColor: previewMode === 'light' ? 'rgba(255,255,255,0.95)' : 'transparent',
                color: previewMode === 'light' ? currentTokens.primary : 'var(--text-secondary)',
                cursor: 'pointer'
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
                border: previewMode === 'dark' ? `1.5px solid ${currentTokens.primary}` : '1px solid var(--border)',
                backgroundColor: previewMode === 'dark' ? '#18181b' : 'transparent',
                color: previewMode === 'dark' ? currentTokens.primary : 'var(--text-secondary)',
                cursor: 'pointer'
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
            backgroundColor: previewMode === 'dark' ? 'rgba(24, 28, 48, 0.92)' : 'rgba(255, 255, 255, 0.92)',
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
                color: previewMode === 'dark' ? '#f8fafc' : '#1e293b',
                margin: '6px 0 2px 0'
              }}>
                Espacio de Bienestar Integral
              </h4>
              <p style={{
                fontSize: '12px',
                color: previewMode === 'dark' ? '#94a3b8' : '#64748b',
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
          <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
            Paleta Armónica de Colores de la Temática:
          </label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {theme.swatches.map((color, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div 
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    backgroundColor: color,
                    border: '2px solid var(--border)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }} 
                  title={color}
                />
                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-secondary)', fontWeight: '700' }}>
                  {color}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Acciones del Modal */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '13px', fontWeight: '800' }}
          >
            Cerrar
          </button>
          <button
            onClick={() => {
              onApply(theme.id);
              onClose();
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
