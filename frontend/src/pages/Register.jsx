import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { 
  Sun, Moon, ArrowLeft, UserPlus, Mail, Lock, User, Building, 
  Loader, Eye, EyeOff, CheckCircle2, XCircle, ShieldCheck, 
  Sparkles, Check, AlertCircle, Send
} from 'lucide-react';
import api from '../services/api';
import StarryBackground from '../components/StarryBackground';

const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ' -]{2,50}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

const Register = ({ onNavigate }) => {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  // Campos del formulario
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [invitationCode, setInvitationCode] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Estados de validación de código de invitación
  const [invitationLoading, setInvitationLoading] = useState(false);
  const [invitationValid, setInvitationValid] = useState(null); // null, true, false
  const [resolvedInstitutionName, setResolvedInstitutionName] = useState('');
  const [resolvedDepartment, setResolvedDepartment] = useState('');

  // Estados de envío y feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [registeredSuccessData, setRegisteredSuccessData] = useState(null);

  // Validación de complejidad de contraseña en tiempo real
  const passChecks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)
  };

  const passValidCount = Object.values(passChecks).filter(Boolean).length;
  const isPasswordStrong = passValidCount === 5;
  const passwordsMatch = password.length > 0 && password === passwordConfirm;

  // Validación en tiempo real del código de invitación (debounce 500ms)
  useEffect(() => {
    const trimmed = invitationCode.trim().toUpperCase();
    if (!trimmed) {
      setInvitationValid(null);
      setResolvedInstitutionName('');
      setResolvedDepartment('');
      return;
    }

    if (trimmed.length < 4) {
      setInvitationValid(null);
      return;
    }

    const timer = setTimeout(async () => {
      setInvitationLoading(true);
      try {
        const res = await api.get(`/auth/invitation-info?code=${encodeURIComponent(trimmed)}`);
        if (res.data.valid) {
          setInvitationValid(true);
          setResolvedInstitutionName(res.data.institution_name);
          setResolvedDepartment(res.data.department || 'General');
        } else {
          setInvitationValid(false);
          setResolvedInstitutionName('');
        }
      } catch (err) {
        setInvitationValid(false);
        setResolvedInstitutionName('');
      } finally {
        setInvitationLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [invitationCode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // 1. Validaciones de Frontend
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedCode = invitationCode.trim().toUpperCase();

    if (!trimmedFirst || !NAME_REGEX.test(trimmedFirst)) {
      setErrorMsg('El nombre debe contener entre 2 y 50 caracteres (solo letras, tildes, guiones o apóstrofes).');
      return;
    }

    if (!trimmedLast || !NAME_REGEX.test(trimmedLast)) {
      setErrorMsg('El apellido debe contener entre 2 y 50 caracteres (solo letras, tildes, guiones o apóstrofes).');
      return;
    }

    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      setErrorMsg('Por favor ingresa un correo electrónico con formato válido.');
      return;
    }

    if (!isPasswordStrong) {
      setErrorMsg('La contraseña no cumple con los requisitos de seguridad (mínimo 8 caracteres, mayúscula, minúscula, número y símbolo).');
      return;
    }

    if (password !== passwordConfirm) {
      setErrorMsg('Las contraseñas ingresadas no coinciden.');
      return;
    }

    if (!trimmedCode) {
      setErrorMsg('Debes ingresar un código de invitación institucional válido.');
      return;
    }

    if (!termsAccepted) {
      setErrorMsg('Debes aceptar los Términos y Condiciones y la Política de Privacidad.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        first_name: trimmedFirst,
        last_name: trimmedLast,
        email: trimmedEmail,
        password: password,
        password_confirm: passwordConfirm,
        invitation_code: trimmedCode,
        terms_accepted: termsAccepted
      };

      const res = await api.post('/auth/register', payload);
      setLoading(false);

      if (res.status === 201) {
        setRegisteredSuccessData({
          email: trimmedEmail,
          institution: resolvedInstitutionName || 'Institución Asignada',
          message: res.data.message,
          token: res.data.verification_token
        });
      }
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Ocurrió un error al procesar el registro. Intenta de nuevo.';
      setErrorMsg(msg);
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
      
      {/* Cielo Estrellado con Destellos */}
      <StarryBackground isLogin={true} />

      {/* Botón Volver al Login */}
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

      {/* Selector de Tema */}
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

      <div style={{ width: '100%', maxWidth: '540px', zIndex: 5, padding: '36px' }} className="glass-card">
        
        {registeredSuccessData ? (
          /* Pantalla de Éxito y Verificación de Correo */
          <div style={{ textAlign: 'center' }} className="animate-fade">
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '68px',
              height: '68px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
              color: 'var(--success, #10b981)',
              boxShadow: '0 0 25px rgba(16, 185, 129, 0.25)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              marginBottom: '18px'
            }} className="animate-float">
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ fontSize: '23px', fontWeight: '900', letterSpacing: '-0.5px', marginBottom: '8px' }}>
              ¡Cuenta Creada Exitosamente!
            </h2>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: '1.6', marginBottom: '20px' }}>
              Tu registro se ha completado en estado <strong style={{ color: 'var(--primary)' }}>PENDIENTE</strong> para la organización:
            </p>

            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px',
              marginBottom: '22px',
              textAlign: 'left'
            }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '700' }}>
                Institución Vinculada
              </div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building size={16} style={{ color: 'var(--primary)' }} />
                <span>{registeredSuccessData.institution}</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                Correo: <strong>{registeredSuccessData.email}</strong>
              </div>
            </div>

            <div style={{
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              fontSize: '12.5px',
              color: 'var(--text-primary)',
              lineHeight: '1.5',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px'
            }}>
              <Mail size={16} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Paso siguiente:</strong> Por motivos de seguridad y privacidad en EquilibrIA, debes verificar tu correo electrónico antes de acceder.
              </div>
            </div>

            {/* Enlace simulado de activación directa para ambiente local/demo */}
            {registeredSuccessData.token && (
              <div style={{ marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={() => navigate(`/verificar-correo/${registeredSuccessData.token}`)}
                  className="btn btn-primary"
                  style={{ width: '100%', height: '46px', fontSize: '14px', borderRadius: 'var(--radius-sm)' }}
                >
                  <ShieldCheck size={16} />
                  <span>Verificar y Activar Cuenta Ahora</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="btn btn-secondary"
              style={{ width: '100%', height: '44px', fontSize: '13.5px', borderRadius: 'var(--radius-sm)' }}
            >
              Ir al Inicio de Sesión
            </button>
          </div>
        ) : (
          /* Formulario de Registro Estándar */
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '54px',
                height: '54px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--primary-light) 100%)',
                color: 'var(--accent)',
                boxShadow: 'var(--accent-tech-glow)',
                border: '1px solid var(--border-focus)',
                marginBottom: '14px'
              }} className="animate-float">
                <UserPlus size={26} />
              </div>
              <h2 style={{ fontSize: '23px', fontWeight: '900', letterSpacing: '-0.5px', marginBottom: '4px' }}>Registro de Cuenta</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500' }}>
                Únete a tu institución mediante tu código de invitación.
              </p>
            </div>

            {errorMsg && (
              <div style={{
                backgroundColor: 'var(--danger-light)',
                border: '1px solid var(--danger)',
                color: 'var(--danger)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12.5px',
                fontWeight: '600',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              
              {/* Nombre y Apellido */}
              <div style={{ display: 'flex', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Nombre</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Ej. Juan Carlos"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      style={{ paddingLeft: '38px', height: '42px', fontSize: '13.5px' }}
                    />
                    <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                </div>

                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Apellido</label>
                  <input
                    type="text"
                    placeholder="De León"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    style={{ height: '42px', fontSize: '13.5px' }}
                  />
                </div>
              </div>

              {/* Correo Electrónico */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Correo Institucional</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    placeholder="usuario@institucion.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ paddingLeft: '38px', height: '42px', fontSize: '13.5px' }}
                  />
                  <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              {/* Código de Invitación Institucional con Live Validation */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: '700', margin: 0 }}>Código de Invitación Institucional</label>
                  {invitationLoading && <span style={{ fontSize: '11px', color: 'var(--primary)' }}>Validando código...</span>}
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Ej. EQUILIBRIA-2026"
                    value={invitationCode}
                    onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                    required
                    style={{
                      paddingLeft: '38px',
                      paddingRight: '36px',
                      height: '42px',
                      fontSize: '13.5px',
                      fontWeight: '700',
                      letterSpacing: '0.5px',
                      borderColor: invitationValid === true ? 'var(--success, #10b981)' : invitationValid === false ? 'var(--danger, #ef4444)' : undefined
                    }}
                  />
                  <Building size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  {invitationValid === true && (
                    <CheckCircle2 size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--success, #10b981)' }} />
                  )}
                  {invitationValid === false && (
                    <XCircle size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--danger, #ef4444)' }} />
                  )}
                </div>

                {invitationValid === true && (
                  <div style={{
                    marginTop: '6px',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    fontSize: '11.5px',
                    color: 'var(--success, #10b981)',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Building size={13} />
                    <span>Institución: {resolvedInstitutionName} ({resolvedDepartment})</span>
                  </div>
                )}
                {invitationValid === false && (
                  <div style={{ marginTop: '4px', fontSize: '11.5px', color: 'var(--danger, #ef4444)', fontWeight: '600' }}>
                    Código inválido o no reconocido. Consulta con tu administrador.
                  </div>
                )}
              </div>

              {/* Contraseña */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres (A-Z, a-z, 0-9, !@#...)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ paddingLeft: '38px', paddingRight: '40px', height: '42px', fontSize: '13.5px' }}
                  />
                  <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Medidor de Fortaleza de Contraseña */}
                {password && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', gap: '4px', height: '4px', marginBottom: '6px' }}>
                      <div style={{ flex: 1, borderRadius: '2px', backgroundColor: passValidCount >= 2 ? (passValidCount >= 4 ? 'var(--success, #10b981)' : '#f59e0b') : '#ef4444' }} />
                      <div style={{ flex: 1, borderRadius: '2px', backgroundColor: passValidCount >= 4 ? (passValidCount === 5 ? 'var(--success, #10b981)' : '#f59e0b') : 'rgba(255,255,255,0.1)' }} />
                      <div style={{ flex: 1, borderRadius: '2px', backgroundColor: passValidCount === 5 ? 'var(--success, #10b981)' : 'rgba(255,255,255,0.1)' }} />
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: passChecks.length ? 'var(--success, #10b981)' : 'var(--text-muted)' }}>
                        <Check size={11} /> 8+ car.
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: passChecks.upper ? 'var(--success, #10b981)' : 'var(--text-muted)' }}>
                        <Check size={11} /> Mayús.
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: passChecks.lower ? 'var(--success, #10b981)' : 'var(--text-muted)' }}>
                        <Check size={11} /> Minús.
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: passChecks.number ? 'var(--success, #10b981)' : 'var(--text-muted)' }}>
                        <Check size={11} /> Número
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: passChecks.special ? 'var(--success, #10b981)' : 'var(--text-muted)' }}>
                        <Check size={11} /> Especial
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmar Contraseña */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: '700' }}>Confirmar Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPasswordConfirm ? 'text' : 'password'}
                    placeholder="Repite tu contraseña exactamente"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    required
                    style={{
                      paddingLeft: '38px',
                      paddingRight: '40px',
                      height: '42px',
                      fontSize: '13.5px',
                      borderColor: passwordConfirm && passwordsMatch ? 'var(--success, #10b981)' : passwordConfirm && !passwordsMatch ? 'var(--danger, #ef4444)' : undefined
                    }}
                  />
                  <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    {showPasswordConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordConfirm && !passwordsMatch && (
                  <div style={{ fontSize: '11.5px', color: 'var(--danger, #ef4444)', marginTop: '4px', fontWeight: '600' }}>
                    Las contraseñas no coinciden.
                  </div>
                )}
              </div>

              {/* Consentimiento Informado y Privacidad */}
              <div style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                marginBottom: '18px'
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  lineHeight: '1.45',
                  color: 'var(--text-secondary)',
                  margin: 0
                }}>
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    required
                    style={{ marginTop: '2px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                  />
                  <span>
                    He leído y acepto los <strong style={{ color: 'var(--text-primary)' }}>Términos y Condiciones</strong> y el <strong style={{ color: 'var(--text-primary)' }}>Aviso de Privacidad</strong> de EquilibrIA.
                  </span>
                </label>
              </div>

              {/* Botón de Envío */}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !isPasswordStrong || !passwordsMatch || !termsAccepted || invitationValid === false}
                style={{
                  width: '100%',
                  height: '46px',
                  fontSize: '14.5px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={18} />
                    <span>Creando cuenta protegida...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>Completar Registro</span>
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;
