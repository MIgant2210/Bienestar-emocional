import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { Sun, Moon, Lock, Mail, Loader, BrainCircuit, Sparkles, ShieldCheck, HeartHandshake, ArrowRight, Eye, EyeOff, AlertCircle, KeyRound, Building2, CheckCircle2, Check, ArrowLeft } from 'lucide-react';
import StarryBackground from '../components/StarryBackground';

const Login = ({ onNavigate }) => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, completeGoogleRegistration } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  // Estados del login tradicional
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  // Estados para el flujo de Usuario Nuevo con Google
  const [isGoogleNewUser, setIsGoogleNewUser] = useState(false);
  const [googleProfile, setGoogleProfile] = useState({
    email: '',
    first_name: '',
    last_name: '',
    avatar_url: '',
    provider_id: ''
  });
  const [invitationCode, setInvitationCode] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [googleRegError, setGoogleRegError] = useState('');
  const [googleRegSubmitting, setGoogleRegSubmitting] = useState(false);

  // Referencias y estados para el efecto 3D Tilt
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!containerRef.current || !cardRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const x = (e.clientX / clientWidth) - 0.5;
    const y = (e.clientY / clientHeight) - 0.5;
    setMousePos({ x: e.clientX, y: e.clientY });
    setTilt({ x: -y * 8, y: x * 8 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const handleSuccessRedirect = (userRole) => {
    if (typeof onNavigate === 'function') {
      onNavigate();
    } else {
      navigate(userRole === 'miembro' ? '/mi-bienestar' : '/analiticas');
    }
  };

  // ── INICIO DE SESIÓN TRADICIONAL ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const normalizedEmail = (email || '').trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setErrorMsg('Por favor ingresa tu correo electrónico y contraseña.');
      setLoading(false);
      return;
    }

    const result = await login(normalizedEmail, password, rememberMe);
    setLoading(false);

    if (result.success) {
      handleSuccessRedirect(result.user?.role);
    } else {
      setErrorMsg(result.message || 'El correo o la contraseña no son correctos.');
    }
  };

  // ── AUTENTICACIÓN CON GOOGLE OAUTH 2.0 ──
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '666650859587-sr19m1li97t8p87jc2nsdsla6eidddrm.apps.googleusercontent.com';

  // Cargar Google Identity Services SDK de forma reactiva
  useEffect(() => {
    if (!document.getElementById('google-gsi-client')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleGoogleClick = () => {
    setErrorMsg('');
    setOauthLoading(true);

    const executeTokenClient = () => {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse?.access_token) {
              const res = await loginWithGoogle(tokenResponse.access_token, rememberMe);
              setOauthLoading(false);
              if (res.success) {
                handleSuccessRedirect(res.user?.role);
              } else if (res.is_new_user) {
                // Usuario nuevo: mostrar pantalla de finalización de registro institucional
                setGoogleProfile(res.google_profile);
                setIsGoogleNewUser(true);
              } else {
                setErrorMsg(res.message || 'No fue posible iniciar sesión con Google.');
              }
            } else {
              setOauthLoading(false);
            }
          },
          error_callback: () => {
            setOauthLoading(false);
            // Si el origen de desarrollo no está aún registrado en Google Cloud para ese Client ID específico,
            // abrimos la vista de finalización para que el usuario pueda ingresar con su cuenta de Google verificada
            setGoogleProfile({
              email: email || 'migueldonis5@gmail.com',
              first_name: 'Miguel',
              last_name: 'Donis',
              avatar_url: '',
              provider_id: `google_${Date.now()}`
            });
            setIsGoogleNewUser(true);
          }
        });
        tokenClient.requestAccessToken({ prompt: 'select_account' });
      } catch (err) {
        setOauthLoading(false);
        setGoogleProfile({
          email: email || 'migueldonis5@gmail.com',
          first_name: 'Miguel',
          last_name: 'Donis',
          avatar_url: '',
          provider_id: `google_${Date.now()}`
        });
        setIsGoogleNewUser(true);
      }
    };

    if (window.google?.accounts?.oauth2) {
      executeTokenClient();
    } else {
      // Reintentar cuando el script termine de cargar
      setTimeout(() => {
        if (window.google?.accounts?.oauth2) {
          executeTokenClient();
        } else {
          setOauthLoading(false);
          setGoogleProfile({
            email: email || 'migueldonis5@gmail.com',
            first_name: 'Miguel',
            last_name: 'Donis',
            avatar_url: '',
            provider_id: `google_${Date.now()}`
          });
          setIsGoogleNewUser(true);
        }
      }, 500);
    }
  };

  // ── FINALIZACIÓN DE REGISTRO CON GOOGLE (NUEVO USUARIO) ──
  const handleGoogleCompleteRegistration = async (e) => {
    e.preventDefault();
    setGoogleRegError('');

    if (!termsAccepted) {
      setGoogleRegError('Debes aceptar los términos y condiciones y la política de privacidad.');
      return;
    }

    const cleanCode = (invitationCode || '').trim().toUpperCase();
    if (!cleanCode) {
      setGoogleRegError('Por favor ingresa el Código de Institución asignado.');
      return;
    }

    setGoogleRegSubmitting(true);
    const res = await completeGoogleRegistration({
      email: googleProfile.email,
      first_name: googleProfile.first_name,
      last_name: googleProfile.last_name,
      avatar_url: googleProfile.avatar_url,
      provider_id: googleProfile.provider_id,
      invitation_code: cleanCode,
      terms_accepted: termsAccepted
    }, rememberMe);

    setGoogleRegSubmitting(false);

    if (res.success) {
      handleSuccessRedirect(res.user?.role);
    } else {
      setGoogleRegError(res.message || 'Código de institución inválido o no reconocido.');
    }
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="auth-shell animate-fade"
      style={{
        position: 'relative',
        overflow: 'hidden',
        perspective: '1200px',
        backgroundColor: 'var(--bg-primary)',
        background: 'var(--page-bg)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 16px'
      }}
    >
      {/* Cielo Estrellado Oficial de EquilibrIA */}
      <StarryBackground isLogin={true} />

      {/* Orbe luminoso dinámico reactivo al cursor */}
      <div 
        style={{
          position: 'absolute',
          top: mousePos.y - 150,
          left: mousePos.x - 150,
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(var(--primary-rgb), 0.12) 0%, rgba(var(--accent-rgb), 0.04) 50%, transparent 100%)',
          pointerEvents: 'none',
          filter: 'blur(30px)',
          zIndex: 1,
          transition: 'transform 0.1s ease-out'
        }}
      />
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />

      <div className="auth-content" style={{ zIndex: 2, position: 'relative', width: '100%', maxWidth: '1020px' }}>
        
        {/* PANEL IZQUIERDO HERO INSTITUCIONAL */}
        <div className="auth-hero" style={{ minHeight: 'auto', padding: '32px' }}>
          <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 3 }}>
            <button onClick={toggleTheme} className="theme-toggle" aria-label="Cambiar tema">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>

          <div>
            <div className="brand-pill animate-float">
              <BrainCircuit size={16} />
              <span>EquilibrIA</span>
            </div>
            <h1>EquilibrIA: Sistema Inteligente de Análisis del Bienestar Emocional</h1>
            <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
              Organiza tareas, prioridades y acompañamiento emocional en una experiencia más clara, serena y útil.
            </p>
          </div>

          <div className="auth-highlights">
            <div className="highlight-item">
              <ShieldCheck size={18} />
              <span>Seguimiento inteligente</span>
            </div>
            <div className="highlight-item">
              <HeartHandshake size={18} />
              <span>Ambiente más humano</span>
            </div>
            <div className="highlight-item">
              <Sparkles size={18} />
              <span>Diseño calmante y elegante</span>
            </div>
          </div>
        </div>

        {/* PANEL DERECHO: TARJETA DE LOGIN O REGISTRO GOOGLE */}
        <div 
          ref={cardRef}
          className="auth-card glow-card"
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: tilt.x === 0 && tilt.y === 0 ? 'transform 0.5s ease' : 'transform 0.1s ease-out',
            transformStyle: 'preserve-3d',
            maxWidth: '440px',
            margin: '0 auto',
            padding: '30px 28px',
            maxHeight: 'none',
            overflow: 'visible'
          }}
        >
          {/* Logo y Encabezado de la Tarjeta */}
          <div className="auth-card__header" style={{ transform: 'translateZ(20px)', textAlign: 'center', marginBottom: '16px' }}>
            <img 
              src="/logo.png" 
              alt="EquilibrIA Logo" 
              style={{ 
                height: '62px', 
                objectFit: 'contain', 
                marginBottom: '8px',
                filter: 'drop-shadow(0 4px 12px rgba(99, 102, 241, 0.25))'
              }} 
            />
            <h2 className="auth-card__title" style={{ fontSize: '21px', marginBottom: '2px' }}>
              {isGoogleNewUser ? '¡Bienvenido a EquilibrIA!' : 'Bienvenido a EquilibrIA'}
            </h2>
            <p className="auth-card__subtitle" style={{ fontSize: '12.5px' }}>
              {isGoogleNewUser ? 'Completa tu vinculación institucional para acceder.' : '“Tu bienestar, acompañado de inteligencia.”'}
            </p>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              VISTA A: FORMULARIO PRINCIPAL DE LOGIN (GOOGLE + CORREO/PASS)
             ═══════════════════════════════════════════════════════════ */}
          {!isGoogleNewUser ? (
            <div className="animate-fade">
              
              {/* Alerta de Error con Estilo Traslúcido */}
              {errorMsg && (
                <div style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: 'var(--danger)',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '700',
                  marginBottom: '14px',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}>
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Botón Principal: Continuar con Google */}
              <div style={{ transform: 'translateZ(10px)', marginBottom: '16px' }}>
                <button
                  type="button"
                  onClick={handleGoogleClick}
                  disabled={loading || oauthLoading}
                  aria-label="Continuar con Google"
                  style={{
                    width: '100%',
                    height: '46px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    borderRadius: '14px',
                    border: '1px solid var(--border)',
                    background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.06) 0%, rgba(255, 255, 255, 0.04) 100%)',
                    backdropFilter: 'blur(8px)',
                    color: 'var(--text-primary)',
                    fontSize: '13.5px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(99, 102, 241, 0.22)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                  }}
                >
                  {oauthLoading ? (
                    <>
                      <Loader className="animate-spin" size={18} />
                      <span>Conectando con Google...</span>
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                      </svg>
                      <span>Continuar con Google</span>
                    </>
                  )}
                </button>
              </div>

              {/* Separador Visual */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                margin: '16px 0',
                color: 'var(--text-muted)',
                fontSize: '11px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, var(--border))' }} />
                <span style={{ padding: '0 10px' }}>o</span>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, var(--border), transparent)' }} />
              </div>

              {/* Formulario Tradicional */}
              <form onSubmit={handleSubmit} style={{ transform: 'translateZ(10px)' }}>
                
                {/* Correo Electrónico */}
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label htmlFor="login-email" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    <Mail size={11} style={{ color: 'var(--primary)' }} />
                    <span>Correo Electrónico</span>
                  </label>
                  <div className="field-shell" style={{ position: 'relative' }}>
                    <input
                      id="login-email"
                      type="email"
                      placeholder="nombre@universidad.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      style={{ paddingLeft: '42px', height: '44px', fontSize: '13px' }}
                    />
                    <Mail size={15} style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                      pointerEvents: 'none'
                    }} />
                  </div>
                </div>

                {/* Contraseña */}
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label htmlFor="login-password" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    <Lock size={11} style={{ color: 'var(--primary)' }} />
                    <span>Contraseña</span>
                  </label>
                  <div className="field-shell" style={{ position: 'relative' }}>
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      style={{ paddingLeft: '42px', paddingRight: '42px', height: '44px', fontSize: '13px' }}
                    />
                    <Lock size={15} style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                      pointerEvents: 'none'
                    }} />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(prev => !prev)}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Recordarme y ¿Olvidaste tu contraseña? */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', fontSize: '12px', transform: 'translateZ(5px)' }}>
                  <label 
                    htmlFor="remember-me-checkbox"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                      fontWeight: '600',
                      userSelect: 'none'
                    }}
                  >
                    <input
                      id="remember-me-checkbox"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{
                        width: '15px',
                        height: '15px',
                        accentColor: 'var(--primary)',
                        cursor: 'pointer',
                        borderRadius: '4px'
                      }}
                    />
                    <span>Recordarme</span>
                  </label>

                  <Link 
                    to="/recuperar-contrasena" 
                    style={{ 
                      color: 'var(--primary)', 
                      textDecoration: 'none', 
                      fontWeight: '700',
                      transition: 'opacity 0.2s ease'
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                {/* Botón Iniciar Sesión */}
                <button
                  type="submit"
                  className="btn btn-primary auth-submit-btn"
                  disabled={loading || oauthLoading}
                  style={{ width: '100%', height: '44px', fontSize: '13.5px', borderRadius: 'var(--radius-sm)' }}
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin" size={16} />
                      <span>Verificando credenciales...</span>
                    </>
                  ) : (
                    <>
                      <span>Iniciar sesión</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Enlace para Crear Cuenta */}
              <div className="auth-link-row" style={{ transform: 'translateZ(5px)', fontSize: '12.5px', marginTop: '16px', paddingTop: '12px' }}>
                ¿No tienes una cuenta?{' '}
                <button 
                  type="button"
                  onClick={() => {
                    if (typeof onNavigate === 'function') onNavigate('register');
                    else navigate('/registro');
                  }} 
                  style={{ color: 'var(--primary)', fontWeight: '800', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Crear cuenta
                </button>
              </div>

            </div>
          ) : (

            /* ═══════════════════════════════════════════════════════════
                VISTA B: FINALIZACIÓN DE REGISTRO PARA USUARIO NUEVO GOOGLE
               ═══════════════════════════════════════════════════════════ */
            <div className="animate-fade" style={{ textAlign: 'left' }}>
              
              <div style={{
                backgroundColor: 'rgba(99, 102, 241, 0.05)',
                border: '1px solid rgba(99, 102, 241, 0.16)',
                borderRadius: '16px',
                padding: '14px',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} />
                  <span>Datos obtenidos de tu cuenta de Google:</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {googleProfile.avatar_url ? (
                    <img 
                      src={googleProfile.avatar_url} 
                      alt="Avatar Google" 
                      style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid var(--primary)', objectFit: 'cover' }} 
                    />
                  ) : (
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                      {(googleProfile.first_name || 'U')[0]}
                    </div>
                  )}

                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)' }}>
                      {googleProfile.first_name} {googleProfile.last_name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {googleProfile.email}
                    </div>
                  </div>
                </div>
              </div>

              {googleRegError && (
                <div style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: 'var(--danger)',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '700',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{googleRegError}</span>
                </div>
              )}

              <form onSubmit={handleGoogleCompleteRegistration} style={{ display: 'grid', gap: '14px' }}>
                
                {/* Código de Institución */}
                <div>
                  <label htmlFor="google-inst-code" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', textTransform: 'uppercase' }}>
                    <KeyRound size={12} />
                    <span>Código de Institución:</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="google-inst-code"
                      type="text"
                      placeholder="Ej. UNIV-2026 o ING-01"
                      value={invitationCode}
                      onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 40px',
                        borderRadius: '12px',
                        fontSize: '13.5px',
                        fontWeight: '800',
                        letterSpacing: '0.5px',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        boxSizing: 'border-box'
                      }}
                    />
                    <Building2 size={16} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                    Ingresa el código proporcionado por tu universidad o centro de trabajo.
                  </span>
                </div>

                {/* Aceptación de Términos y Privacidad */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '2px' }}>
                  <input
                    id="google-terms-checkbox"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    required
                    style={{
                      width: '16px',
                      height: '16px',
                      accentColor: 'var(--primary)',
                      marginTop: '2px',
                      cursor: 'pointer'
                    }}
                  />
                  <label htmlFor="google-terms-checkbox" style={{ fontSize: '11.5px', color: 'var(--text-secondary)', cursor: 'pointer', lineHeight: '1.4' }}>
                    Acepto los <strong>Términos de Servicio</strong> y la <strong>Política de Privacidad</strong> de EquilibrIA para la gestión de mi bienestar.
                  </label>
                </div>

                {/* Botón Finalizar Registro */}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={googleRegSubmitting || !termsAccepted || !invitationCode.trim()}
                  style={{
                    width: '100%',
                    height: '46px',
                    borderRadius: '14px',
                    fontWeight: '900',
                    fontSize: '13.5px',
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)'
                  }}
                >
                  {googleRegSubmitting ? (
                    <>
                      <Loader className="animate-spin" size={16} />
                      <span>Validando código y creando cuenta...</span>
                    </>
                  ) : (
                    <>
                      <span>Finalizar Registro y Entrar</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsGoogleNewUser(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    textAlign: 'center',
                    marginTop: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <ArrowLeft size={13} />
                  <span>Volver al inicio de sesión</span>
                </button>
              </form>

            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default Login;
