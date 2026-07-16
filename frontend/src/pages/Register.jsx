import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { Sun, Moon, ArrowLeft, UserPlus, Mail, Lock, User, Building, Loader, BrainCircuit } from 'lucide-react';
import api from '../services/api';

const Register = ({ onNavigate }) => {
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
    const fetchInstitutions = async () => {
      try {
        const response = await api.get('/auth/institutions');
        setInstitutions(response.data);
        if (response.data.length > 0) {
          setSelectedInstId(response.data[0].id);
        }
      } catch (err) {
        console.error('Error al cargar instituciones:', err);
      }
    };
    fetchInstitutions();
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
        onNavigate('login');
      }, 2000);
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
      background: theme === 'light' 
        ? 'radial-gradient(circle at 10% 20%, rgb(240, 245, 255) 0%, rgb(220, 230, 250) 90%)'
        : 'radial-gradient(circle at 10% 20%, rgb(5, 8, 22) 0%, rgb(15, 20, 45) 90%)',
      overflow: 'hidden'
    }} className="animate-fade">
      
      {/* Luces de fondo difuminadas */}
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)',
        top: '-120px',
        left: '-120px',
        filter: 'blur(60px)',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
        bottom: '-100px',
        right: '-100px',
        filter: 'blur(60px)',
        zIndex: 0
      }} />

      {/* Botones de navegación superior */}
      <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 10 }}>
        <button onClick={() => onNavigate('login')} className="theme-toggle" style={{
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border)',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: 'var(--radius-full)',
          fontSize: '13px',
          fontWeight: '700'
        }}>
          <ArrowLeft size={16} />
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
            Únete a la plataforma para coordinar tareas y monitorear bienestar.
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
          
          {/* Selector de Rol */}
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label style={{ textAlign: 'center' }}>Selecciona tu Perfil</label>
            <div style={{
              display: 'flex',
              backgroundColor: 'var(--bg-tertiary)',
              padding: '4px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              marginTop: '6px'
            }}>
              <button
                type="button"
                className={`tab-btn ${role === 'miembro' ? 'active' : ''}`}
                onClick={() => setRole('miembro')}
                style={{ padding: '10px', fontSize: '13px', borderRadius: '6px' }}
              >
                Miembro / Estudiante
              </button>
              <button
                type="button"
                className={`tab-btn ${role === 'admin_institucion' ? 'active' : ''}`}
                onClick={() => setRole('admin_institucion')}
                style={{ padding: '10px', fontSize: '13px', borderRadius: '6px' }}
              >
                Administrador
              </button>
            </div>
          </div>

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

          {/* Formulario condicional según Rol */}
          {role === 'miembro' ? (
            <div className="form-group">
              <label>Institución / Organización</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={selectedInstId}
                  onChange={(e) => setSelectedInstId(e.target.value)}
                  required
                  style={{ paddingLeft: '40px' }}
                >
                  {institutions.length === 0 ? (
                    <option value="">No hay instituciones registradas</option>
                  ) : (
                    institutions.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name} ({inst.type})
                      </option>
                    ))
                  )}
                </select>
                <Building size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>
          ) : (
            <div style={{ 
              border: '1px solid var(--border)', 
              padding: '20px', 
              borderRadius: 'var(--radius-sm)', 
              marginBottom: '24px', 
              backgroundColor: 'var(--bg-tertiary)' 
            }}>
              <h4 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '14px', textTransform: 'uppercase', color: 'var(--text-primary)', display: 'flex', gap: '6px', alignItems: 'center' }}>
                <Building size={14} />
                <span>Nueva Institución</span>
              </h4>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Nombre de la Organización</label>
                <input
                  type="text"
                  placeholder="Ej. Universidad del Valle"
                  value={newInstName}
                  onChange={(e) => setNewInstName(e.target.value)}
                  required={role === 'admin_institucion'}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Tipo de Institución</label>
                <select
                  value={newInstType}
                  onChange={(e) => setNewInstType(e.target.value)}
                >
                  <option value="educativa">Educativa (Colegio, Universidad)</option>
                  <option value="laboral">Laboral (Empresa, Oficina)</option>
                  <option value="comunitaria">Comunitaria (Organización Social)</option>
                </select>
              </div>
            </div>
          )}

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
