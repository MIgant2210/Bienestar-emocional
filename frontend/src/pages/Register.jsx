import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { Sun, Moon, ArrowLeft, UserPlus, Mail, Lock, User, Building, Loader } from 'lucide-react';
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
    // Obtener lista de instituciones para los miembros
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
      padding: '40px 20px',
      background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-tertiary) 100%)'
    }} className="animate-fade">
      
      {/* Botones de navegación superior */}
      <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
        <button onClick={() => onNavigate('login')} className="theme-toggle" style={{ display: 'flex', gap: '6px' }}>
          <ArrowLeft size={18} />
          <span>Volver</span>
        </button>
      </div>

      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <button onClick={toggleTheme} className="theme-toggle">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>

      <div style={{ width: '100%', maxWidth: '480px' }} className="glass-card">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--accent-light)',
            color: 'var(--accent)',
            marginBottom: '12px'
          }}>
            <UserPlus size={28} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>Crear una cuenta</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Únete a la plataforma para registrar bienestar o administrar tu comunidad.
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
            marginBottom: '16px',
            textAlign: 'center'
          }}>{errorMsg}</div>
        )}

        {successMsg && (
          <div style={{
            backgroundColor: 'hsl(150, 100%, 95%)',
            border: '1px solid var(--success)',
            color: 'var(--success)',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            marginBottom: '16px',
            textAlign: 'center'
          }}>{successMsg}</div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* Tipo de Rol */}
          <div className="form-group">
            <label>Tipo de Cuenta</label>
            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
              <button
                type="button"
                className={`btn ${role === 'miembro' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setRole('miembro')}
                style={{ flex: 1, padding: '10px' }}
              >
                Miembro / Usuario
              </button>
              <button
                type="button"
                className={`btn ${role === 'admin_institucion' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setRole('admin_institucion')}
                style={{ flex: 1, padding: '10px' }}
              >
                Administrador
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Nombre</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Juan"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  style={{ paddingLeft: '36px' }}
                />
                <User size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
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
                placeholder="juan.perez@dominio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: '36px' }}
              />
              <Mail size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
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
                style={{ paddingLeft: '36px' }}
              />
              <Lock size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Formulario condicional según Rol */}
          {role === 'miembro' ? (
            <div className="form-group">
              <label>Selecciona tu Institución / Organización</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={selectedInstId}
                  onChange={(e) => setSelectedInstId(e.target.value)}
                  required
                  style={{ paddingLeft: '36px' }}
                >
                  {institutions.length === 0 ? (
                    <option value="">No hay instituciones disponibles</option>
                  ) : (
                    institutions.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name} ({inst.type})
                      </option>
                    ))
                  )}
                </select>
                <Building size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>
          ) : (
            <div style={{ border: '1px solid var(--border)', padding: '16px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', backgroundColor: 'var(--bg-primary)' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                Registrar Nueva Institución
              </h4>
              <div className="form-group">
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
                  <option value="educativa">Educativa (Universidad, Colegio)</option>
                  <option value="laboral">Laboral (Empresa, Oficina)</option>
                  <option value="comunitaria">Comunitaria (Asociación, ONG)</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '8px' }}
          >
            {loading ? <Loader className="animate-spin" size={18} /> : 'Registrarse'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
