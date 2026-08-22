import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext';
import { Mail, ArrowRight, Loader, CheckCircle2, AlertCircle, Sun, Moon, KeyRound, ArrowLeft } from 'lucide-react';
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
      setMessage(res.data.message || 'Si la cuenta puede realizar una recuperación, la solicitud ha sido registrada en el sistema.');
    } catch (err) {
      // Incluso en caso de error no crítico, mantener mensaje genérico de seguridad
      setSubmitted(true);
      setMessage('Si la cuenta puede realizar una recuperación, la solicitud ha sido registrada en el sistema.');
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
          border: '1px solid var(--border)'
        }}
        title="Cambiar tema"
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
        border: '1px solid var(--border)'
      }}>
        
        {/* LOGO */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <img 
            src="/logo.png" 
            alt="EquilibrIA Logo" 
            style={{ 
              height: '54px', 
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 12px rgba(255, 122, 0, 0.25))' 
            }} 
          />
        </div>

        {!submitted ? (
          <div className="animate-fade">
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <KeyRound size={28} />
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '-0.5px', marginBottom: '6px' }}>
              Recuperar Contraseña
            </h2>
            
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '22px' }}>
              Ingresa el correo electrónico asociado a tu cuenta institucional para solicitar la recuperación de tu acceso.
            </p>

            {errorMsg && (
              <div style={{
                backgroundColor: 'var(--danger-light)',
                border: '1px solid var(--danger)',
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
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px', textAlign: 'left' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  CORREO ELECTRÓNICO:
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    placeholder="ejemplo@universidad.edu.gt"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '12px', fontSize: '13.5px' }}
                  />
                  <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', padding: '13px', borderRadius: '12px', fontWeight: '900', fontSize: '13.5px', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {loading ? <Loader className="animate-spin" size={16} /> : <><span>Solicitar Recuperación</span><ArrowRight size={16} /></>}
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
              Solicitud Registrada
            </h3>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
              {message}
            </p>

            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginBottom: '20px',
              textAlign: 'left'
            }}>
              💡 <strong>Nota:</strong> Comunícate con el Administrador de tu institución para que genere tu enlace de restablecimiento seguro en el panel.
            </div>
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
              textDecoration: 'none'
            }}
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
