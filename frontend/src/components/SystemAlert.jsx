import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const SystemAlert = ({ alert, onClose }) => {
  useEffect(() => {
    if (alert?.show) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [alert, onClose]);

  if (!alert || !alert.show) return null;

  const typeStyles = {
    success: {
      borderColor: 'var(--success)',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--success)',
      icon: CheckCircle2,
      shadow: '0 8px 24px rgba(22, 163, 74, 0.2)'
    },
    danger: {
      borderColor: 'var(--danger)',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--danger)',
      icon: XCircle,
      shadow: '0 8px 24px rgba(220, 38, 38, 0.2)'
    },
    warning: {
      borderColor: 'var(--warning)',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--warning)',
      icon: AlertTriangle,
      shadow: '0 8px 24px rgba(234, 179, 8, 0.2)'
    },
    info: {
      borderColor: 'var(--primary)',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--primary)',
      icon: Info,
      shadow: '0 8px 24px rgba(37, 99, 235, 0.2)'
    }
  };

  const currentStyle = typeStyles[alert.type] || typeStyles.info;
  const IconComponent = currentStyle.icon;

  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      right: '24px',
      zIndex: 99999,
      minWidth: '320px',
      maxWidth: '420px',
      backgroundColor: currentStyle.backgroundColor,
      border: `2px solid ${currentStyle.borderColor}`,
      borderRadius: '18px',
      boxShadow: currentStyle.shadow,
      padding: '14px 18px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      animation: 'fadeIn 0.25s ease'
    }}>
      <div style={{
        padding: '6px',
        borderRadius: '50%',
        backgroundColor: `${currentStyle.borderColor}15`,
        color: currentStyle.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <IconComponent size={20} />
      </div>

      <div style={{ flex: 1 }}>
        {alert.title && (
          <h4 style={{ fontSize: '13.5px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '2px' }}>
            {alert.title}
          </h4>
        )}
        <p style={{ fontSize: '12.5px', color: 'var(--text-primary)', lineHeight: '1.4', margin: 0, fontWeight: '600' }}>
          {alert.message}
        </p>
      </div>

      <button
        onClick={onClose}
        style={{
          border: 'none',
          background: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '2px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'color 0.15s ease'
        }}
        title="Cerrar notificación"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default SystemAlert;
