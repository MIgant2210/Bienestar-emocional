import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { Sun, Moon, Lock, Mail, Loader, BrainCircuit, Sparkles, ShieldCheck, HeartHandshake, ArrowRight } from 'lucide-react';

const Login = ({ onNavigate }) => {
  const { login } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const shellRef = useRef(null);

  useEffect(() => {
    const handleMove = (event) => {
      if (!shellRef.current) return;
      const rect = shellRef.current.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      setPointer({ x, y });
    };

    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

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
      ref={shellRef}
      className="auth-shell animate-fade"
      style={{
        perspective: '1400px',
        transformStyle: 'preserve-3d',
        position: 'relative',
        overflow: 'hidden',
        background: theme === 'light'
          ? `radial-gradient(circle at ${pointer.x}% ${pointer.y}%, rgba(109, 99, 255, 0.16), transparent 34%), linear-gradient(135deg, #f8f5ff 0%, #eef4ff 100%)`
          : `radial-gradient(circle at ${pointer.x}% ${pointer.y}%, rgba(143, 135, 255, 0.2), transparent 34%), linear-gradient(135deg, #0f1222 0%, #181c34 100%)`
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '-20%',
          background: `radial-gradient(circle at ${pointer.x}% ${pointer.y}%, ${theme === 'light' ? 'rgba(255,122,92,0.16)' : 'rgba(255,158,122,0.16)'}, transparent 36%)`,
          pointerEvents: 'none',
          zIndex: 0,
          filter: 'blur(32px)',
          opacity: 0.9
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: '0',
          background: `linear-gradient(125deg, transparent 0%, ${theme === 'light' ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)'} 45%, transparent 100%)`,
          transform: `translate3d(${(pointer.x - 50) / 70}px, ${(pointer.y - 50) / 70}px, 0)`,
          pointerEvents: 'none',
          zIndex: 0,
          mixBlendMode: theme === 'light' ? 'screen' : 'soft-light'
        }}
      />
      <div className="auth-content">
      <div
        className="auth-hero"
        style={{
          transform: `rotateY(${(pointer.x - 50) / 85}deg) rotateX(${(50 - pointer.y) / 85}deg) scale(1.01)`,
          transition: 'transform 0.25s ease-out',
          boxShadow: `0 28px 80px rgba(18, 27, 54, 0.25), 0 0 0 1px rgba(255,255,255,0.08)`,
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 2 }}>
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Cambiar tema">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>

        <div>
          <div className="brand-pill">
            <BrainCircuit size={16} />
            <span>EquilibrIA</span>
          </div>
          <h1>EquilibrIA: Sistema Inteligente de Análisis del Bienestar Emocional</h1>
          <p>Organiza tareas, prioridades y acompañamiento emocional en una experiencia más clara, serena y útil.</p>
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
        className="auth-card"
        style={{
          transform: `translate3d(${(pointer.x - 50) / 45}px, ${(pointer.y - 50) / 45}px, 0) scale(1.01)`,
          transition: 'transform 0.25s ease-out',
          boxShadow: `0 24px 70px rgba(12, 18, 38, 0.18), 0 0 0 1px rgba(255,255,255,0.06)`
        }}
      >
        <div className="auth-card__header">
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
            animation: 'fadeIn 0.3s'
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={12} />
              <span>Correo Institucional</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                placeholder="nombre@universidad.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: '44px' }}
              />
              <Mail size={16} style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={12} />
              <span>Contraseña</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: '44px' }}
              />
              <Lock size={16} style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '12px', fontSize: '15px' }}
          >
            {loading ? <Loader className="animate-spin" size={20} /> : <><span>Acceder al Sistema</span><ArrowRight size={18} /></>}
          </button>
        </form>

        <div className="auth-link-row">
          ¿No tienes una cuenta aún?{' '}
          <button onClick={() => onNavigate('register')}>
            Regístrate aquí
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Login;
