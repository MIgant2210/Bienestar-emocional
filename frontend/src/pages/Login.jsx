import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { Sun, Moon, Lock, Mail, Loader } from 'lucide-react';

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
      onNavigate(); // Recargar estado de navegación en App.jsx
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px',
      background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-tertiary) 100%)'
    }} className="animate-fade">
      
      {/* Botón flotante de Modo Oscuro */}
      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <button onClick={toggleTheme} className="theme-toggle">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>

      <div style={{ width: '100%', maxWidth: '420px' }} className="glass-card">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            marginBottom: '16px'
          }}>
            <Lock size={28} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>Bienvenido de nuevo</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Plataforma Inteligente de Bienestar Emocional
          </p>
        </div>

        {errorMsg && (
          <div style={{
            backgroundColor: 'hsl(350, 100%, 96%)',
            border: '1px solid var(--danger)',
            color: 'var(--danger)',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Correo Electrónico</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                placeholder="ejemplo@bienestar.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: '40px' }}
              />
              <Mail size={16} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
            </div>
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: '40px' }}
              />
              <Lock size={16} style={{
                position: 'absolute',
                left: '14px',
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
            style={{ width: '100%', marginTop: '8px' }}
          >
            {loading ? <Loader className="animate-spin" size={18} /> : 'Iniciar Sesión'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          ¿No tienes una cuenta aún?{' '}
          <button
            onClick={() => onNavigate('register')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Registrarse aquí
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
