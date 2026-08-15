import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { Sun, Moon, ArrowLeft, UserPlus, Mail, Lock, User, Building, Loader, BrainCircuit } from 'lucide-react';
import api from '../services/api';
import CustomSelect from '../components/CustomSelect';
import StarryBackground from '../components/StarryBackground';

const Register = ({ onNavigate }) => {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('miembro'); // 'miembro' o 'admin_institucion'
  const [institutions, setInstitutions] = useState([]);
  const [selectedInstId, setSelectedInstId] = useState('');
  const [newInstName, setNewInstName] = useState('');
  const [newInstType, setNewInstType] = useState('educativa');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    // Cargar la lista de instituciones disponibles para colaboradores
    const fetchInsts = async () => {
      try {
        let instList = [];
        try {
          const res = await api.get('/institutions');
          if (Array.isArray(res.data)) instList = res.data;
        } catch (e) {
          const resAuth = await api.get('/auth/institutions');
          if (Array.isArray(resAuth.data)) instList = resAuth.data;
        }

        setInstitutions(instList);
        if (instList.length > 0) {
          setSelectedInstId(instList[0].id);
        }
      } catch (err) {
        console.error('Error al obtener instituciones:', err);
      }
    };
    fetchInsts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    
    const payload = {
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      role
    };

    if (role === 'miembro') {
      payload.institution_id = selectedInstId;
    } else {
      payload.institution_name = newInstName;
      payload.institution_type = newInstType;
    }

    const result = await register(payload);
    setLoading(false);
    
    if (result.success) {
      setSuccessMsg('Registro exitoso. Redirigiendo al inicio de sesión...');
      setTimeout(() => {
        if (typeof onNavigate === 'function') onNavigate('login');
        else navigate('/login');
      }, 1500);
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
      padding: '60px 24px',
      position: 'relative',
      backgroundColor: 'var(--bg-primary)',
      background: 'var(--page-bg)',
      overflow: 'hidden'
    }} className="animate-fade">
      
      {/* Cielo Estrellado con Destellos */}
      <StarryBackground isLogin={true} />

      {/* Botones de navegación superior */}
      <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 10 }}>
        <button 
          type="button"
          onClick={() => {
            if (typeof onNavigate === 'function') onNavigate('login');
            else navigate('/login');
          }} 
          style={{
            boxShadow: 'var(--shadow-sm)',
            border: '1.5px solid var(--primary)',
            backgroundColor: 'var(--bg-glass)',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 20px',
            borderRadius: 'var(--radius-full)',
            fontSize: '13.5px',
            fontWeight: '800',
            cursor: 'pointer',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            transition: 'all 0.25s ease'
          }}
          className="btn-glass-back"
        >
          <ArrowLeft size={18} style={{ color: 'var(--primary)' }} />
          <span>Volver al Login</span>
        </button>
      </div>

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

      <div style={{ width: '100%', maxWidth: '520px', zIndex: 5, padding: '36px' }} className="glass-card">
        
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--primary-light) 100%)',
            color: 'var(--accent)',
            boxShadow: 'var(--accent-tech-glow)',
            border: '1px solid var(--border-focus)',
            marginBottom: '16px'
          }} className="animate-float">
            <UserPlus size={28} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-0.5px', marginBottom: '6px' }}>Registro de Cuenta</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500' }}>
            Únete a tu institución para coordinar tareas y monitorear tu bienestar.
          </p>
        </div>

        {errorMsg && (
          <div style={{
            backgroundColor: 'var(--danger-light)',
            border: '1px solid var(--danger)',
            color: 'var(--danger)',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '20px',
            textAlign: 'center'
          }}>{errorMsg}</div>
        )}

        {successMsg && (
          <div style={{
            backgroundColor: 'var(--success-light)',
            border: '1px solid var(--success)',
            color: 'var(--success)',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '20px',
            textAlign: 'center'
          }}>{successMsg}</div>
        )}

        <form onSubmit={handleSubmit}>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Nombre</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Ej. Juan"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  style={{ paddingLeft: '40px' }}
                />
                <User size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label>Apellido</label>
              <input
                type="text"
                placeholder="Pérez"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Correo Electrónico</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                placeholder="juan@institucion.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: '40px' }}
              />
              <Mail size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={{ paddingLeft: '40px' }}
              />
              <Lock size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Selección de Institución con CustomSelect */}
          <div className="form-group">
            <label>Institución / Organización</label>
            <CustomSelect
              options={institutions.map(inst => ({
                value: inst.id,
                label: inst.name,
                sublabel: `Tipo: ${inst.type}`,
                icon: '🏢'
              }))}
              value={selectedInstId}
              onChange={(val) => setSelectedInstId(val)}
              placeholder="Seleccionar institución..."
              icon={Building}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '8px', fontSize: '15px' }}
          >
            {loading ? <Loader className="animate-spin" size={20} /> : 'Completar Registro'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
