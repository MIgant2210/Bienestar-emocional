import React, { useState, useEffect, useContext } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext';
import { CheckCircle2, XCircle, Loader, ArrowRight, Sun, Moon, ShieldCheck, MailCheck } from 'lucide-react';
import api from '../services/api';
import StarryBackground from '../components/StarryBackground';

const EmailVerification = () => {
  const { token: pathToken } = useParams();
  const [searchParams] = useSearchParams();
  const queryToken = searchParams.get('token');
  const token = pathToken || queryToken;

  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const doVerify = async () => {
      if (!token) {
        setLoading(false);
        setSuccess(false);
        setMessage('No se proporcionó ningún token de verificación en el enlace.');
        return;
      }

      try {
        const res = await api.post('/auth/verify-email', { token });
        setSuccess(true);
        setMessage(res.data.message || '¡Tu correo electrónico ha sido verificado exitosamente!');
        if (res.data.user?.email) {
          setUserEmail(res.data.user.email);
        }
      } catch (err) {
        setSuccess(false);
        setMessage(err.response?.data?.message || 'El enlace de verificación no es válido o ha expirado.');
      } finally {
        setLoading(false);
      }
    };

    doVerify();
  }, [token]);

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
      <StarryBackground isLogin={true} />

      {/* Botón de tema claro / oscuro */}
      <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 10 }}>
        <button onClick={toggleTheme} className="theme-toggle" style={{
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border)',
          backgroundColor: 'var(--bg-secondary)',
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>

      <div style={{ width: '100%', maxWidth: '480px', zIndex: 5, padding: '40px 32px', textAlign: 'center' }} className="glass-card">
        {loading ? (
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              marginBottom: '20px'
            }}>
              <Loader size={32} className="animate-spin" />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px' }}>Verificando Correo</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Validando enlace de seguridad y activando tu cuenta institucional...
            </p>
          </div>
        ) : success ? (
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--success, #10b981)',
              border: '2px solid rgba(16, 185, 129, 0.4)',
              marginBottom: '20px'
            }} className="animate-float">
              <MailCheck size={36} />
            </div>
            <h2 style={{ fontSize: '23px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '10px' }}>
              ¡Cuenta Verificada y Activa!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: '1.6', marginBottom: '24px' }}>
              {message}
            </p>
            {userEmail && (
              <div style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                fontSize: '13px',
                color: 'var(--primary)',
                fontWeight: '700',
                marginBottom: '24px'
              }}>
                {userEmail}
              </div>
            )}
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary"
              style={{
                width: '100%',
                height: '48px',
                fontSize: '14.5px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>Ir a Iniciar Sesión</span>
              <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: 'var(--danger, #ef4444)',
              border: '2px solid rgba(239, 68, 68, 0.4)',
              marginBottom: '20px'
            }}>
              <XCircle size={36} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--danger)', marginBottom: '10px' }}>
              Error de Verificación
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: '1.6', marginBottom: '24px' }}>
              {message}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="btn btn-secondary"
              style={{
                width: '100%',
                height: '46px',
                fontSize: '14px',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              Volver al Inicio de Sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
