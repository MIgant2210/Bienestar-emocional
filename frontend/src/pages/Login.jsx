import React, { useState, useContext } from 'react';
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
    <div className="auth-shell animate-fade">
      <div className="auth-hero">
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

      <div className="auth-card">
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
  );
};

export default Login;
