import React, { useEffect } from 'react';
import { AlertTriangle, AlertCircle, HelpCircle, Trash2, X, Check } from 'lucide-react';

/**
 * ============================================================================
 * CONFIRM MODAL: MODAL DE CONFIRMACIÓN ELEGANTE DE EQUILIBRIA
 * ============================================================================
 * Reemplaza los diálogos nativos del navegador (window.confirm / window.alert)
 * con un diseño glassmórfico acorde a la identidad visual de la plataforma.
 */
export const ConfirmModal = ({
  isOpen = false,
  title = '¿Estás seguro?',
  message = 'Esta acción no se puede deshacer.',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger', // 'danger' | 'warning' | 'info' | 'primary'
  onConfirm = () => {},
  onCancel = () => {},
  loading = false
}) => {
  // Manejo de teclas ESC para cerrar y Enter para confirmar
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key === 'Enter' && !loading) {
        onConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onConfirm, onCancel]);

  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      icon: Trash2,
      color: '#ef4444',
      bgLight: 'rgba(239, 68, 68, 0.12)',
      borderLight: 'rgba(239, 68, 68, 0.25)',
      btnBg: '#ef4444',
      btnColor: '#ffffff',
      shadow: '0 8px 24px rgba(239, 68, 68, 0.28)'
    },
    warning: {
      icon: AlertTriangle,
      color: '#f59e0b',
      bgLight: 'rgba(245, 158, 11, 0.12)',
      borderLight: 'rgba(245, 158, 11, 0.25)',
      btnBg: '#f59e0b',
      btnColor: '#ffffff',
      shadow: '0 8px 24px rgba(245, 158, 11, 0.28)'
    },
    info: {
      icon: HelpCircle,
      color: 'var(--primary)',
      bgLight: 'var(--primary-light)',
      borderLight: 'rgba(109, 99, 255, 0.25)',
      btnBg: 'var(--primary)',
      btnColor: '#ffffff',
      shadow: '0 8px 24px rgba(109, 99, 255, 0.28)'
    },
    primary: {
      icon: Check,
      color: 'var(--primary)',
      bgLight: 'var(--primary-light)',
      borderLight: 'rgba(109, 99, 255, 0.25)',
      btnBg: 'var(--primary)',
      btnColor: '#ffffff',
      shadow: '0 8px 24px rgba(109, 99, 255, 0.28)'
    }
  };

  const currentType = typeConfig[type] || typeConfig.danger;
  const IconComponent = currentType.icon;

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 100000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg-primary, #ffffff)',
          border: '1.5px solid var(--border)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          maxWidth: '440px',
          width: '100%',
          padding: '26px',
          position: 'relative',
          animation: 'scaleUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Botón cerrar X */}
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cerrar modal"
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <X size={18} />
        </button>

        {/* Icono Principal */}
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            backgroundColor: currentType.bgLight,
            border: `1.5px solid ${currentType.borderLight}`,
            color: currentType.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}
        >
          <IconComponent size={26} />
        </div>

        {/* Título y Mensaje */}
        <h3
          style={{
            fontSize: '18px',
            fontWeight: '900',
            color: 'var(--text-primary)',
            margin: '0 0 8px 0',
            letterSpacing: '-0.3px'
          }}
        >
          {title}
        </h3>

        <p
          style={{
            fontSize: '13.5px',
            color: 'var(--text-secondary)',
            lineHeight: '1.5',
            margin: '0 0 24px 0',
            fontWeight: '500'
          }}
        >
          {message}
        </p>

        {/* Botones de Acción */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          {cancelText && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              style={{
                padding: '10px 18px',
                borderRadius: '12px',
                border: '1.5px solid var(--border)',
                backgroundColor: 'var(--bg-tertiary, #f1f5f9)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontWeight: '800',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = 'var(--border)';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = 'var(--bg-tertiary, #f1f5f9)';
              }}
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: '10px 22px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: currentType.btnBg,
              color: currentType.btnColor,
              fontSize: '13px',
              fontWeight: '900',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: currentType.shadow,
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {loading ? 'Procesando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
