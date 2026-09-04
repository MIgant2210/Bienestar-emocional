import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, Check, Filter, Sparkles, Calendar, ClipboardList, 
  Trophy, Heart, Shield, CheckCheck, ArrowRight, ExternalLink, X 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CATEGORY_CONFIG = {
  all: { label: 'Todas', icon: Filter, color: 'var(--primary)' },
  bienestar: { label: 'Bienestar', icon: Sparkles, color: 'var(--accent)' },
  tests: { label: 'Tests', icon: Calendar, color: 'var(--primary)' },
  citas: { label: 'Citas', icon: Calendar, color: 'var(--success)' },
  tareas: { label: 'Tareas', icon: ClipboardList, color: '#f59e0b' },
  gamificacion: { label: 'Gamificación', icon: Trophy, color: '#eab308' },
  kudos: { label: 'Kudos', icon: Heart, color: '#ec4899' },
  sistema: { label: 'Sistema', icon: Shield, color: 'var(--text-secondary)' },
  seguridad: { label: 'Seguridad', icon: Shield, color: 'var(--danger)' }
};

const NotificationCenter = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const popoverRef = useRef(null);

  const fetchNotifications = async (cat = activeCategory) => {
    try {
      const url = cat === 'all' ? '/notifications' : `/notifications?category=${cat}`;
      const res = await api.get(url);
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch (err) {
      console.error('Error cargando notificaciones:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications(activeCategory);
    }
  }, [isOpen, activeCategory]);

  // Cerrar al hacer clic fuera del popover
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        const bellTrigger = e.target.closest('button[title*="Notificaciones"]');
        if (!bellTrigger && typeof onClose === 'function') {
          onClose();
        }
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  const handleMarkAsRead = async (notifId, linkUrl) => {
    try {
      await api.put(`/notifications/${notifId}/read`);
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      if (linkUrl) {
        if (typeof onClose === 'function') onClose();
        navigate(linkUrl);
      }
    } catch (err) {
      console.error('Error al marcar notificación:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error al marcar todas como leídas:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={popoverRef}
      className="notification-popover animate-fade"
      style={{
        position: 'absolute',
        top: '55px',
        right: '0',
        width: '420px',
        maxWidth: '92vw',
        backgroundColor: 'var(--bg-secondary)',
        border: '1.5px solid var(--border)',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
        zIndex: 99999,
        padding: '18px',
        maxHeight: '560px',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '12px',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={18} style={{ color: 'var(--primary)' }} />
          <h4 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>
            Centro de Notificaciones
          </h4>
          {unreadCount > 0 && (
            <span style={{
              backgroundColor: 'var(--danger)',
              color: '#fff',
              fontSize: '10px',
              fontWeight: '900',
              padding: '2px 7px',
              borderRadius: '12px'
            }}>
              {unreadCount} nuevas
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '11px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <CheckCheck size={14} />
              <span>Marcar leídas</span>
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Cerrar notificaciones"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Filtro por Categorías con soporte flexible y sin recortes */}
      <div style={{
        display: 'flex',
        gap: '6px',
        flexWrap: 'wrap',
        maxHeight: '74px',
        overflowY: 'auto',
        paddingBottom: '6px',
        marginBottom: '10px'
      }}>
        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
          const Icon = config.icon;
          const isActive = activeCategory === key;
          return (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 9px',
                borderRadius: '14px',
                fontSize: '10.5px',
                fontWeight: isActive ? '900' : '600',
                border: isActive ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                backgroundColor: isActive ? 'var(--primary-light)' : 'var(--bg-primary)',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={11} style={{ color: isActive ? 'var(--primary)' : config.color }} />
              <span>{config.label}</span>
            </button>
          );
        })}
      </div>

      {/* Lista de Notificaciones */}
      <div style={{ overflowY: 'auto', flex: 1, display: 'grid', gap: '8px', paddingRight: '4px', maxHeight: '360px' }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
            <Bell size={32} style={{ opacity: 0.3, margin: '0 auto 8px' }} />
            <p style={{ fontSize: '12px', fontWeight: '600' }}>No hay notificaciones en esta categoría.</p>
          </div>
        ) : (
          notifications.map(notif => {
            const catInfo = CATEGORY_CONFIG[notif.category] || CATEGORY_CONFIG.bienestar;
            const Icon = catInfo.icon;
            
            return (
              <div
                key={notif.id}
                onClick={() => handleMarkAsRead(notif.id, notif.link_url)}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  backgroundColor: notif.is_read ? 'var(--bg-primary)' : 'var(--primary-light)',
                  border: notif.is_read ? '1px solid var(--border)' : '1.5px solid var(--primary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
                title={notif.link_url ? 'Haz clic para ir al módulo' : ''}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: catInfo.color
                    }}>
                      <Icon size={12} />
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', color: catInfo.color }}>
                      {catInfo.label}
                    </span>
                  </div>
                  
                  <span style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>
                    {new Date(notif.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <h5 style={{
                  fontSize: '12px',
                  fontWeight: notif.is_read ? '700' : '900',
                  color: 'var(--text-primary)',
                  marginBottom: '3px'
                }}>
                  {notif.title}
                </h5>

                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
                  {notif.message}
                </p>

                {notif.link_url && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '10.5px',
                    fontWeight: '800',
                    color: 'var(--primary)',
                    marginTop: '8px'
                  }}>
                    <span>Ir al módulo</span>
                    <ArrowRight size={11} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid var(--border)',
        paddingTop: '10px',
        marginTop: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '11px'
      }}>
        <span style={{ color: 'var(--text-muted)' }}>Privacidad protegida</span>
        <button
          onClick={() => { onClose(); navigate('/configuracion'); }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
            fontSize: '11px',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <span>Configurar preferencias</span>
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};

export default NotificationCenter;
