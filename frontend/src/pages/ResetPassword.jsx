import React, { useState, useEffect, useContext } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext';
import { Lock, CheckCircle2, AlertTriangle, Eye, EyeOff, Loader, ArrowRight, Sun, Moon, ShieldCheck, KeyRound } from 'lucide-react';
import api from '../services/api';
import StarryBackground from '../components/StarryBackground';

const ResetPassword = () => {
  const { token: pathToken } = useParams();
  const [searchParams] = useSearchParams();
  const queryToken = searchParams.get('token');
  const token = pathToken || queryToken;

  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const [tokenChecking, setTokenChecking] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Validar token con el backend al cargar
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenChecking(false);
        setTokenValid(false);
        setTokenError('No se proporcionó ningún token de restablecimiento en el enlace.');
        return;
      }

      try {
        const res = await api.get(`/auth/reset-password-info?token=${token}`);
        if (res.data && res.data.valid) {
          setTokenValid(true);
          setUserInfo(res.data);
        } else {
          setTokenValid(false);
          setTokenError(res.data.message || 'El enlace de restablecimiento no es válido o ha expirado.');
        }
      } catch (err) {
        setTokenValid(false);
        setTokenError(err.response?.data?.message || 'El enlace de restablecimiento no es válido o ha expirado.');
      } finally {
        setTokenChecking(false);
      }
    };

    verifyToken();
  }, [token]);

  // Validaciones de complejidad en vivo
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(newPassword);
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
  const isFormValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial && passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!passwordsMatch) {
      setSubmitError('Las contraseñas no coinciden.');
      return;
    }

    if (!isFormValid) {
      setSubmitError('La contraseña no cumple con todos los requisitos de seguridad.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/auth/reset-password-confirm', {
        token,
        new_password: newPassword,
        confirm_password: confirmPassword
      });

      setSubmitSuccess(true);
      setSuccessMessage(res.data.message || '¡Tu contraseña ha sido actualizada exitosamente!');
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Error al restablecer la contraseña. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
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
        maxWidth: '480px',
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
              height: '56px', 
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 12px rgba(255, 122, 0, 0.25))' 
            }} 
          />
        </div>

        {/* ESTADO 1: VERIFICANDO TOKEN */}
        {tokenChecking && (
          <div style={{ padding: '30px 0' }}>
            <Loader className="animate-spin" size={36} style={{ color: 'var(--primary)', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '6px' }}>Validando enlace de seguridad...</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Por favor espera un momento.</p>
          </div>
        )}

        {/* ESTADO 2: TOKEN INVÁLIDO O EXPIRADO */}
        {!tokenChecking && !tokenValid && (
          <div className="animate-fade">
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--danger-light)',
              color: 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px'
            }}>
              <AlertTriangle size={32} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--danger)', marginBottom: '8px' }}>
              Enlace Inválido o Expirado
            </h3>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '24px' }}>
              {tokenError}
            </p>

            <Link
              to="/login"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', borderRadius: '12px', fontWeight: '800', textDecoration: 'none', display: 'inline-block' }}
            >
              Ir a Iniciar Sesión
            </Link>
          </div>
        )}

        {/* ESTADO 3: ÉXITO EN RESTABLECIMIENTO */}
        {!tokenChecking && submitSuccess && (
          <div className="animate-fade">
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--success-light)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px'
            }}>
              <CheckCircle2 size={34} />
            </div>

            <h3 style={{ fontSize: '19px', fontWeight: '900', color: 'var(--success)', marginBottom: '8px' }}>
              ¡Contraseña Restablecida!
            </h3>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '24px' }}>
              {successMessage}
            </p>

            <Link
              to="/login"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', borderRadius: '12px', fontWeight: '800', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <span>Iniciar Sesión Ahora</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {/* ESTADO 4: FORMULARIO DE RESTABLECIMIENTO */}
        {!tokenChecking && tokenValid && !submitSuccess && (
          <div className="animate-fade" style={{ textAlign: 'left' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '-0.5px' }}>
                Restablecer Contraseña
              </h2>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Hola <strong>{userInfo?.first_name} {userInfo?.last_name}</strong> ({userInfo?.email}). Crea una nueva contraseña segura para tu cuenta.
              </p>
            </div>

            {submitError && (
              <div style={{
                backgroundColor: 'var(--danger-light)',
                border: '1px solid var(--danger)',
                color: 'var(--danger)',
                padding: '12px 14px',
                borderRadius: '12px',
                fontSize: '12.5px',
                marginBottom: '16px',
                fontWeight: '700'
              }}>
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
              {/* Nueva Contraseña */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  NUEVA CONTRASEÑA:
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres, mayúscula, número y símbolo"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '12px 42px 12px 14px', borderRadius: '12px', fontSize: '13px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  CONFIRMAR NUEVA CONTRASEÑA:
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repite tu nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '12px 42px 12px 14px', borderRadius: '12px', fontSize: '13px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Checklist de Complejidad */}
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '11.5px', display: 'grid', gap: '5px' }}>
                <span style={{ fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '2px', display: 'block' }}>Requisitos de seguridad:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: hasMinLength ? 'var(--success)' : 'var(--text-muted)' }}>
                  <span>{hasMinLength ? '✓' : '•'} Mínimo 8 caracteres</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: hasUpper ? 'var(--success)' : 'var(--text-muted)' }}>
                  <span>{hasUpper ? '✓' : '•'} Al menos una mayúscula (A-Z)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: hasLower ? 'var(--success)' : 'var(--text-muted)' }}>
                  <span>{hasLower ? '✓' : '•'} Al menos una minúscula (a-z)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: hasNumber ? 'var(--success)' : 'var(--text-muted)' }}>
                  <span>{hasNumber ? '✓' : '•'} Al menos un número (0-9)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: hasSpecial ? 'var(--success)' : 'var(--text-muted)' }}>
                  <span>{hasSpecial ? '✓' : '•'} Al menos un carácter especial (!@#$%^&*...)</span>
                </div>
                {confirmPassword && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: passwordsMatch ? 'var(--success)' : 'var(--danger)', marginTop: '2px', fontWeight: '800' }}>
                    <span>{passwordsMatch ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || !isFormValid}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', fontWeight: '900', fontSize: '13.5px', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {submitting ? <Loader className="animate-spin" size={16} /> : <KeyRound size={16} />}
                <span>{submitting ? 'Actualizando...' : 'Guardar Nueva Contraseña'}</span>
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default ResetPassword;
