import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext';
import { Mail, ArrowRight, Loader, CheckCircle2, AlertCircle, Sun, Moon, KeyRound, ArrowLeft, Send } from 'lucide-react';
import api from '../services/api';
import StarryBackground from '../components/StarryBackground';

const ForgotPassword = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const normalizedEmail = (email || '').trim().toLowerCase();
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setErrorMsg('Por favor ingresa un correo electrónico válido.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: normalizedEmail });
      setSubmitted(true);
      setMessage(res.data.message || 'Si la cuenta existe en EquilibrIA, recibirás un correo electrónico con instrucciones para restablecer tu contraseña en los próximos minutos.');
    } catch (err) {
      if (err.response?.status === 429) {
        setErrorMsg('Has superado el límite de solicitudes. Por favor espera unos minutos antes de volver a intentarlo.');
      } else {
        // Respuesta genérica de seguridad
        setSubmitted(true);
        setMessage('Si la cuenta existe en EquilibrIA, recibirás un correo electrónico con instrucciones para restablecer tu contraseña en los próximos minutos.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '40px 20px',
      position: 'relative',
      backgroundColor: 'var(--bg-primary)',
      background: 'var(--page-bg)',
      overflow: 'hidden'
    }} className="animate-fade">
      
      {/* Cielo Estrellado Oficial */}
      <StarryBackground isLogin={true} />

      {/* Botón Flotante para Modo Oscuro/Claro */}
      <button 
        onClick={toggleTheme}
        className="theme-toggle"
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          zIndex: 100,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)'
        }}
        title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="glass-card" style={{
        maxWidth: '460px',
        width: '100%',
        padding: '36px 30px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10,
        borderRadius: '24px',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border)',
        backgroundColor: 'var(--bg-card)'
      }}>
        
        {/* LOGO EQUILIBRIA */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <img 
            src="/logo.png" 
            alt="EquilibrIA Logo" 
            style={{ 
              height: '56px', 
              objectFit: 'contain', 
              filter: 'drop-shadow(0 4px 12px rgba(99, 102, 241, 0.25))' 
            }} 
          />
        </div>

        {!submitted ? (
          <div className="animate-fade">
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <KeyRound size={28} />
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '-0.5px', marginBottom: '6px', color: 'var(--text-primary)' }}>
              Recuperar Contraseña
            </h2>
            
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '22px' }}>
              Ingresa el correo electrónico asociado a tu cuenta en EquilibrIA para recibir un enlace seguro de restablecimiento.
            </p>

            {errorMsg && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: 'var(--danger)',
                padding: '10px 14px',
                borderRadius: '12px',
                fontSize: '12.5px',
                marginBottom: '16px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textAlign: 'left'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px', textAlign: 'left' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Correo Electrónico:
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    placeholder="nombre@universidad.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      borderRadius: '12px',
                      fontSize: '13.5px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      boxSizing: 'border-box'
                    }}
                  />
                  <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '12px',
                  fontWeight: '900',
                  fontSize: '13.5px',
                  marginTop: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)'
                }}
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={16} />
                    <span>Enviando enlace seguro...</span>
                  </>
                ) : (
                  <>
                    <span>Enviar Enlace de Recuperación</span>
                    <Send size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="animate-fade">
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'var(--success-light)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <CheckCircle2 size={32} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--success)', marginBottom: '8px' }}>
              Enlace Enviado
            </h3>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '18px' }}>
              {message}
            </p>

            <div style={{
              background: 'var(--primary-light)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '14px 16px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              marginBottom: '20px',
              textAlign: 'left',
              lineHeight: '1.5',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}>
              <Mail size={16} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Revisa tu bandeja de entrada:</strong> Si no visualizas el correo en unos momentos, comprueba tu carpeta de <em>Spam</em> o correo no deseado. El enlace es de un solo uso y es válido durante <strong>1 hora</strong>.
              </div>
            </div>

            <button
              type="button"
              onClick={() => { setSubmitted(false); setEmail(''); }}
              className="btn btn-secondary"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                fontSize: '12.5px',
                fontWeight: '700'
              }}
            >
              Probar con otro correo
            </button>
          </div>
        )}

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <Link
            to="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-secondary)',
              fontSize: '12.5px',
              fontWeight: '700',
              textDecoration: 'none',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <ArrowLeft size={14} />
            <span>Volver a Iniciar Sesión</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
