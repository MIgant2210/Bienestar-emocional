import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { Sun, Moon, Lock, Mail, Loader, BrainCircuit, Sparkles, ShieldCheck, HeartHandshake, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Login = ({ onNavigate }) => {
  const { login } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Referencias y estados para el efecto de movimiento del mouse (Antigravity Style)
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!containerRef.current || !cardRef.current) return;
    
    // Obtener dimensiones del viewport
    const { clientWidth, clientHeight } = containerRef.current;
    
    // Posición del mouse normalizada de -0.5 a 0.5
    const x = (e.clientX / clientWidth) - 0.5;
    const y = (e.clientY / clientHeight) - 0.5;
    
    setMousePos({ x: e.clientX, y: e.clientY });
    
    // Calcular inclinación 3D para la tarjeta (máximo 8 grados)
    const tiltX = -y * 12;
    const tiltY = x * 12;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    // Restablecer inclinación cuando el cursor sale
    setTilt({ x: 0, y: 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      onNavigate();
    } else {
      setErrorMsg(result.message);
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
        backgroundColor: 'var(--bg-primary)', // Usar el color beige cálido de variables.css
        background: 'var(--page-bg)' // El gradiente warm beige establecido
      }}
    >
      {/* Orbe luminoso dinámico que sigue al mouse */}
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

      {/* MODIFICADO: Envoltorio en 'auth-content' para establecer el tamaño de pantalla y evitar que se vea muy grande */}
      <div className="auth-content" style={{ zIndex: 2, position: 'relative' }}>
        
        <div className="auth-hero">
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
            <p style={{ fontSize: '14.5px', lineHeight: '1.6' }}>
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

        <div 
          ref={cardRef}
          className="auth-card glow-card"
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: tilt.x === 0 && tilt.y === 0 ? 'transform 0.5s ease' : 'transform 0.1s ease-out',
            transformStyle: 'preserve-3d',
            maxWidth: '430px', // Evitar que la tarjeta de login sea gigante
            margin: '0 auto',
            padding: '36px'
          }}
        >
          <div className="auth-card__header" style={{ transform: 'translateZ(20px)' }}>
            <div className="auth-card__eyebrow animate-float">
              <BrainCircuit size={26} />
            </div>
            <h2 className="auth-card__title">Inicia sesión</h2>
            <p className="auth-card__subtitle">Accede a tu espacio de bienestar y organización.</p>
          </div>

          {errorMsg && (
            <div style={{
              backgroundColor: 'var(--danger-light)',
              border: '1px solid var(--danger)',
              color: 'var(--danger)',
              padding: '14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '24px',
              textAlign: 'center',
              animation: 'fadeIn 0.3s',
              transform: 'translateZ(15px)'
            }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ transform: 'translateZ(10px)' }}>
            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                <Mail size={11} />
                <span>Correo Institucional</span>
              </label>
              <div className="field-shell" style={{ position: 'relative' }}>
                <input
                  type="email"
                  placeholder="nombre@universidad.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  style={{ paddingLeft: '44px', height: '48px', fontSize: '13.5px' }}
                />
                <Mail size={15} style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '22px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                <Lock size={11} />
                <span>Contraseña</span>
              </label>
              <div className="field-shell" style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  style={{ paddingLeft: '44px', paddingRight: '44px', height: '48px', fontSize: '13.5px' }}
                />
                <Lock size={15} style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
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

            <button
              type="submit"
              className="btn btn-primary auth-submit-btn"
              disabled={loading}
              style={{ width: '100%', height: '48px', fontSize: '14px', borderRadius: 'var(--radius-sm)' }}
            >
              {loading ? <Loader className="animate-spin" size={18} /> : <><span>Acceder al Sistema</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="auth-link-row" style={{ transform: 'translateZ(5px)', fontSize: '13px', marginTop: '20px', paddingTop: '16px' }}>
            ¿No tienes una cuenta aún?{' '}
            <button onClick={() => onNavigate('register')} style={{ color: 'var(--primary)', fontWeight: '800' }}>
              Regístrate aquí
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
