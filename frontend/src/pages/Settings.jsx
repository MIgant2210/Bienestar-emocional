import React, { useState, useEffect, useContext } from 'react';
import { 
  Settings as SettingsIcon, User, Palette, Bell, Shield, Lock, 
  Check, Save, Moon, Sun, ShieldAlert, ShieldCheck, KeyRound, 
  LogOut, Laptop, CheckCircle2, AlertCircle, Loader, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import api from '../services/api';
import ConsentModal from '../components/ConsentModal';

const Settings = () => {
  const navigate = useNavigate();
  const { user, loginUser, logout } = useContext(AuthContext);
  const { theme, toggleTheme, colorPalette, changePalette, PALETTES } = useContext(ThemeContext);

  const [activeTab, setActiveTab] = useState('account'); // 'account', 'appearance', 'notifications', 'privacy', 'security'

  // Estados de Mi Cuenta
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountMsg, setAccountMsg] = useState({ type: '', text: '' });

  // Estados de Notificaciones
  const [notifPrefs, setNotifPrefs] = useState({
    bienestar: true,
    tests: true,
    citas: true,
    tareas: true,
    gamificacion: true,
    kudos: true,
    sistema: true,
    seguridad: true
  });
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifMsg, setNotifMsg] = useState({ type: '', text: '' });

  // Estados de Privacidad & Consentimientos
  const [consents, setConsents] = useState([]);
  const [consentsLoading, setConsentsLoading] = useState(false);
  const [activeConsentToAccept, setActiveConsentToAccept] = useState(null);

  // Estados de Seguridad
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityMsg, setSecurityMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
    }
  }, [user]);

  // Cargar Preferencias de Notificaciones y Consentimientos
  useEffect(() => {
    const fetchSettingsData = async () => {
      try {
        const [prefsRes, consentsRes] = await Promise.all([
          api.get('/notifications/preferences'),
          api.get('/wellbeing/consents')
        ]);
        if (prefsRes.data) setNotifPrefs(prefsRes.data);
        if (consentsRes.data) setConsents(consentsRes.data);
      } catch (err) {
        console.error('Error cargando configuraciones:', err);
      }
    };
    fetchSettingsData();
  }, []);

  // Guardar Datos Personales
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setAccountLoading(true);
    setAccountMsg({ type: '', text: '' });
    try {
      const res = await api.put('/auth/profile', {
        first_name: firstName,
        last_name: lastName
      });
      // Actualizar localStorage y contexto
      const updatedUser = { ...user, first_name: firstName, last_name: lastName };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setAccountMsg({ type: 'success', text: 'Datos de perfil actualizados exitosamente.' });
    } catch (err) {
      setAccountMsg({ type: 'danger', text: err.response?.data?.message || 'Error al guardar perfil.' });
    } finally {
      setAccountLoading(false);
    }
  };

  // Guardar Preferencias de Notificaciones
  const handleToggleNotif = async (categoryKey) => {
    if (categoryKey === 'seguridad') return; // Seguridad no se desactiva
    const updated = { ...notifPrefs, [categoryKey]: !notifPrefs[categoryKey] };
    setNotifPrefs(updated);
    try {
      await api.put('/notifications/preferences', updated);
      setNotifMsg({ type: 'success', text: 'Preferencias de notificaciones actualizadas.' });
      setTimeout(() => setNotifMsg({ type: '', text: '' }), 3000);
    } catch (err) {
      setNotifMsg({ type: 'danger', text: 'Error al actualizar preferencias.' });
    }
  };

  // Revocar Consentimiento
  const handleRevokeConsent = async (consentType) => {
    if (!window.confirm('¿Estás seguro de que deseas revocar este consentimiento? Algunas funcionalidades automáticas se pausarán.')) return;
    try {
      await api.post('/wellbeing/consents/revoke', { consent_type: consentType });
      const res = await api.get('/wellbeing/consents');
      setConsents(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Error al revocar consentimiento.');
    }
  };

  // Cambiar Contraseña
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setSecurityMsg({ type: 'danger', text: 'La nueva contraseña y su confirmación no coinciden.' });
      return;
    }
    if (newPassword.length < 6) {
      setSecurityMsg({ type: 'danger', text: 'La nueva contraseña debe tener al menos 6 caracteres.' });
      return;
    }

    setSecurityLoading(true);
    setSecurityMsg({ type: '', text: '' });
    try {
      await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      setSecurityMsg({ type: 'success', text: 'Contraseña modificada exitosamente.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setSecurityMsg({ type: 'danger', text: err.response?.data?.message || 'Error al cambiar contraseña.' });
    } finally {
      setSecurityLoading(false);
    }
  };

  const CONSENT_TITLES = {
    wellbeing_data: 'Tratamiento de Datos de Bienestar Emocional',
    ai_analysis: 'Uso de Inteligencia Artificial Preventiva (Gemini)',
    voice_analysis: 'Análisis y Dictado de Voz a Texto'
  };

  return (
    <div className="animate-fade" style={{ maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '24px 16px', display: 'grid', gap: '20px' }}>
      
      <ConsentModal
        isOpen={!!activeConsentToAccept}
        consentType={activeConsentToAccept}
        onClose={() => setActiveConsentToAccept(null)}
        onAccepted={async () => {
          const res = await api.get('/wellbeing/consents');
          setConsents(res.data);
        }}
      />

      {/* Header */}
      <div className="glass-card" style={{
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px',
        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--primary-light) 100%)',
        border: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            backgroundColor: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)'
          }}>
            <SettingsIcon size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '-0.5px' }}>Configuración del Sistema</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Administra tu perfil, apariencia visual, notificaciones, privacidad y seguridad.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary"
          style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: '700' }}
        >
          Volver al Dashboard
        </button>
      </div>

      {/* Layout de Pestañas */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '20px', alignItems: 'start' }}>
        
        {/* Menú Lateral */}
        <div className="glass-card" style={{ padding: '12px', display: 'grid', gap: '6px' }}>
          {[
            { id: 'account', label: 'Mi Cuenta', icon: User },
            { id: 'appearance', label: 'Apariencia', icon: Palette },
            { id: 'notifications', label: 'Notificaciones', icon: Bell },
            { id: 'privacy', label: 'Privacidad y Consentimientos', icon: Shield },
            { id: 'security', label: 'Seguridad y Acceso', icon: Lock }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  fontSize: '12.5px',
                  fontWeight: isActive ? '800' : '600',
                  backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  border: isActive ? '1px solid var(--primary)' : '1px solid transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Panel de Contenido */}
        <div className="glass-card" style={{ padding: '24px' }}>
          
          {/* ======================================================== */}
          {/* PESTAÑA 1: MI CUENTA                                    */}
          {/* ======================================================== */}
          {activeTab === 'account' && (
            <div className="animate-fade" style={{ display: 'grid', gap: '18px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Información Personal
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Actualiza tus datos permitidos. Las modificaciones de rol e institución son gestionadas por los administradores.
                </p>
              </div>

              {accountMsg.text && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  backgroundColor: accountMsg.type === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
                  color: accountMsg.type === 'success' ? 'var(--success)' : 'var(--danger)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {accountMsg.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                  <span>{accountMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} style={{ display: 'grid', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)' }}>NOMBRE:</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)' }}>APELLIDO:</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)' }}>CORREO ELECTRÓNICO (SOLO LECTURA):</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    style={{ backgroundColor: 'var(--bg-primary)', opacity: 0.7, cursor: 'not-allowed' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)' }}>ROL INSTITUCIONAL:</label>
                    <div style={{ padding: '10px 12px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12.5px', fontWeight: '700', color: 'var(--primary)' }}>
                      {user?.role?.toUpperCase()}
                    </div>
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)' }}>DEPARTAMENTO:</label>
                    <div style={{ padding: '10px 12px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12.5px', fontWeight: '700' }}>
                      {user?.department || 'General'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={accountLoading}
                    style={{ padding: '10px 24px', borderRadius: '10px', fontSize: '12.5px', fontWeight: '800' }}
                  >
                    {accountLoading ? <Loader className="animate-spin" size={15} /> : <><Save size={15} /><span>Guardar Cambios</span></>}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* PESTAÑA 2: APARIENCIA                                   */}
          {/* ======================================================== */}
          {activeTab === 'appearance' && (
            <div className="animate-fade" style={{ display: 'grid', gap: '22px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Personalización Visual de EquilibrIA
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Ajusta el modo claro/oscuro y selecciona tu paleta de colores preferida en tiempo real.
                </p>
              </div>

              {/* Modo Claro / Oscuro */}
              <div style={{
                padding: '16px 20px',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                    Tema de la Interfaz: {theme === 'light' ? 'Modo Claro ☀️' : 'Modo Oscuro 🌙'}
                  </h4>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px', margin: 0 }}>
                    Alterna entre modo luminoso u oscuro para cuidar tu visión.
                  </p>
                </div>

                <button
                  onClick={toggleTheme}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', fontWeight: '800', fontSize: '12px' }}
                >
                  {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
                  <span>Cambiar a {theme === 'light' ? 'Oscuro' : 'Claro'}</span>
                </button>
              </div>

              {/* Selector de Paletas */}
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '12px' }}>
                  PALETAS DE COLORES DISPONIBLES:
                </label>

                <div className="grid grid-3" style={{ gap: '12px' }}>
                  {PALETTES.map(p => {
                    const isSelected = colorPalette === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => changePalette(p.id)}
                        style={{
                          padding: '16px',
                          borderRadius: '12px',
                          backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-primary)',
                          border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '12px',
                          transition: 'all 0.2s ease',
                          boxShadow: isSelected ? 'var(--tech-glow)' : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)' }}>
                            {p.icon} {p.name}
                          </span>
                          {isSelected && <Check size={16} style={{ color: 'var(--primary)' }} />}
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: p.primary, border: '2px solid var(--border)' }} title="Primario" />
                          <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: p.accent, border: '2px solid var(--border)' }} title="Acento" />
                          <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: p.hover, border: '2px solid var(--border)' }} title="Hover" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PESTAÑA 3: NOTIFICACIONES                               */}
          {/* ======================================================== */}
          {activeTab === 'notifications' && (
            <div className="animate-fade" style={{ display: 'grid', gap: '18px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Preferencias de Notificaciones
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Selecciona qué categorías de notificaciones deseas recibir. Las notificaciones críticas de seguridad no se pueden desactivar.
                </p>
              </div>

              {notifMsg.text && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  backgroundColor: notifMsg.type === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
                  color: notifMsg.type === 'success' ? 'var(--success)' : 'var(--danger)'
                }}>
                  {notifMsg.text}
                </div>
              )}

              <div style={{ display: 'grid', gap: '10px' }}>
                {[
                  { key: 'bienestar', label: 'Bienestar y Orientación', desc: 'Avisos sobre nuevos recursos de bienestar y actualizaciones de tu espacio personal.' },
                  { key: 'tests', label: 'Tests y Evaluaciones', desc: 'Notificaciones sobre cuestionarios institucionales asignados o programados.' },
                  { key: 'citas', label: 'Citas y Acompañamiento 1 a 1', desc: 'Recordatorios de sesiones aprobadas y cambios en la agenda.' },
                  { key: 'tareas', label: 'Tareas Institucionales', desc: 'Asignaciones de actividades y revisiones de tareas.' },
                  { key: 'gamificacion', label: 'Gamificación y Logros', desc: 'Puntos XP obtenidos, nuevas medallas desbloqueadas y rachas activas.' },
                  { key: 'kudos', label: 'Kudos y Muro de Gratitud', desc: 'Reconocimientos y mensajes enviados por tus compañeros.' },
                  { key: 'sistema', label: 'Avisos Generales del Sistema', desc: 'Novedades y comunicados de la plataforma.' },
                  { key: 'seguridad', label: 'Alertas Críticas de Seguridad', desc: 'Inicios de sesión y cambios de contraseña (Siempre activo).', locked: true }
                ].map(item => {
                  const isChecked = notifPrefs[item.key] !== false;
                  return (
                    <div
                      key={item.key}
                      style={{
                        padding: '14px 18px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <div>
                        <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                          {item.label}
                        </h4>
                        <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px', margin: 0 }}>
                          {item.desc}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleNotif(item.key)}
                        disabled={item.locked}
                        style={{
                          width: '46px',
                          height: '24px',
                          borderRadius: '12px',
                          backgroundColor: isChecked ? 'var(--primary)' : 'var(--border)',
                          position: 'relative',
                          border: 'none',
                          cursor: item.locked ? 'not-allowed' : 'pointer',
                          transition: 'background-color 0.2s ease',
                          opacity: item.locked ? 0.7 : 1
                        }}
                      >
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          backgroundColor: '#fff',
                          position: 'absolute',
                          top: '3px',
                          left: isChecked ? '25px' : '3px',
                          transition: 'left 0.2s ease'
                        }} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PESTAÑA 4: PRIVACIDAD Y CONSENTIMIENTOS                  */}
          {/* ======================================================== */}
          {activeTab === 'privacy' && (
            <div className="animate-fade" style={{ display: 'grid', gap: '18px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Privacidad y Consentimiento Informado
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  En EquilibrIA protegemos tu información emocional. Puedes revisar, aceptar o revocar tus consentimientos legales en cualquier momento.
                </p>
              </div>

              <div style={{
                backgroundColor: 'var(--primary-light)',
                border: '1px solid var(--primary)',
                padding: '14px 18px',
                borderRadius: '12px',
                fontSize: '12px',
                color: 'var(--text-primary)',
                lineHeight: '1.5'
              }}>
                <strong>Garantía de Confidencialidad:</strong> Los directivos y líderes de departamento nunca tienen acceso a tus registros individuales ni textos nominales. La agregación de métricas se realiza directamente en el servidor.
              </div>

              <div style={{ display: 'grid', gap: '12px' }}>
                {consents.map(c => {
                  const isAccepted = c.status === 'accepted';
                  return (
                    <div
                      key={c.consent_type}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '14px',
                        flexWrap: 'wrap'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                            {CONSENT_TITLES[c.consent_type] || c.consent_type}
                          </h4>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: '800',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            backgroundColor: isAccepted ? 'var(--success-light)' : 'var(--danger-light)',
                            color: isAccepted ? 'var(--success)' : 'var(--danger)'
                          }}>
                            {isAccepted ? 'ACTIVO' : 'REVOCADO / NO ACEPTADO'}
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Versión: {c.version || 'v1.0'} • {c.accepted_at ? `Aceptado el: ${new Date(c.accepted_at).toLocaleDateString()}` : 'Pendiente de aceptación'}
                        </span>
                      </div>

                      <div>
                        {isAccepted ? (
                          <button
                            type="button"
                            onClick={() => handleRevokeConsent(c.consent_type)}
                            className="btn"
                            style={{
                              backgroundColor: 'transparent',
                              border: '1px solid var(--danger)',
                              color: 'var(--danger)',
                              padding: '6px 14px',
                              borderRadius: '8px',
                              fontSize: '11.5px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            Revocar Consentimiento
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setActiveConsentToAccept(c.consent_type)}
                            className="btn btn-primary"
                            style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '11.5px', fontWeight: '800' }}
                          >
                            Aceptar Consentimiento
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* PESTAÑA 5: SEGURIDAD Y ACCESO                           */}
          {/* ======================================================== */}
          {activeTab === 'security' && (
            <div className="animate-fade" style={{ display: 'grid', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Seguridad de la Cuenta
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Modifica tu contraseña de acceso y revisa el estado de tu sesión activa protegida por JWT.
                </p>
              </div>

              {securityMsg.text && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  backgroundColor: securityMsg.type === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
                  color: securityMsg.type === 'success' ? 'var(--success)' : 'var(--danger)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {securityMsg.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                  <span>{securityMsg.text}</span>
                </div>
              )}

              {/* Formulario de Cambio de Contraseña */}
              <form onSubmit={handleChangePassword} style={{ display: 'grid', gap: '14px', maxWidth: '480px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)' }}>CONTRASEÑA ACTUAL:</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)' }}>NUEVA CONTRASEÑA (MÍNIMO 6 CARACTERES):</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)' }}>CONFIRMAR NUEVA CONTRASEÑA:</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={securityLoading}
                    style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '12.5px', fontWeight: '800' }}
                  >
                    {securityLoading ? <Loader className="animate-spin" size={15} /> : <><KeyRound size={15} /><span>Actualizar Contraseña</span></>}
                  </button>
                </div>
              </form>

              {/* Sesión Activa */}
              <div style={{
                marginTop: '10px',
                padding: '16px',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Laptop size={20} style={{ color: 'var(--primary)' }} />
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                      Sesión Actual en Navegador
                    </h4>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Autenticación activa mediante JSON Web Token seguro (24 horas de validez)
                    </span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="btn"
                  style={{
                    backgroundColor: 'var(--danger-light)',
                    color: 'var(--danger)',
                    border: '1px solid var(--danger)',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '800'
                  }}
                >
                  <LogOut size={14} />
                  <span>Cerrar Sesión</span>
                </button>
              </div>

            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default Settings;
