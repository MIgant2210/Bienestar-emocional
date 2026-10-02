import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import CustomDatePicker from '../common/CustomDatePicker';
import { Cake, Sparkles, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '../../services/api';

/**
 * Modal Obligatorio para Registrar Fecha de Nacimiento
 * Se muestra a los usuarios existentes que ingresan al sistema y aún no
 * tienen registrada su fecha de nacimiento.
 */
const BirthDateRequiredModal = () => {
  const { user, updateUser } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Solo se muestra si el usuario está autenticado, su estado no es PENDIENTE y no tiene fecha de nacimiento
  const isPendingApproval = user?.status === 'PENDIENTE' || user?.status === 'PENDING';
  const shouldShow = user && !user.birth_date && !isPendingApproval;

  if (!shouldShow) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!birthDate) {
      setErrorMsg('Por favor selecciona tu fecha de nacimiento en el calendario.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.put('/auth/birth-date', { birth_date: birthDate });
      if (response.data?.user) {
        updateUser(response.data.user);
      } else {
        updateUser({ birth_date: birthDate });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al guardar la fecha de nacimiento. Por favor intenta de nuevo.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100000,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.25s ease-out'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: 'var(--bg-primary, #ffffff)',
          borderRadius: '24px',
          border: '1px solid var(--border, rgba(148, 163, 184, 0.25))',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 30px var(--tech-glow, rgba(99, 102, 241, 0.2))',
          padding: '28px',
          position: 'relative',
          overflow: 'visible'
        }}
      >
        {/* Cabecera Festiva con Icono de Torta y Destellos */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              backgroundColor: 'var(--primary-light, rgba(99, 102, 241, 0.15))',
              color: 'var(--primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
              boxShadow: '0 8px 20px var(--tech-glow, rgba(99, 102, 241, 0.25))',
              position: 'relative'
            }}
          >
            <Cake size={32} />
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: 'var(--accent, #f59e0b)',
                color: '#fff',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
              }}
            >
              <Sparkles size={12} />
            </span>
          </div>

          <h2 style={{
            fontSize: '22px',
            fontWeight: '800',
            color: 'var(--text-primary)',
            margin: '0 0 8px 0',
            lineHeight: 1.25
          }}>
            ¡Queremos celebrar contigo! 🎉
          </h2>
          <p style={{
            fontSize: '13.5px',
            color: 'var(--text-secondary, #64748b)',
            lineHeight: '1.5',
            margin: 0
          }}>
            Hola <strong>{user?.first_name || 'Compañero'}</strong>, para personalizar tu experiencia en EquilibrIA, activar automáticamente la temática de cumpleaños en tu día especial y sincronizar los eventos del calendario, por favor ingresa tu fecha de nacimiento:
          </p>
        </div>

        {/* Mensaje de Error si aplica */}
        {errorMsg && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '12px',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#ef4444',
            fontSize: '12.5px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Selector de Fecha */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              marginBottom: '8px'
            }}>
              Fecha de Nacimiento <span style={{ color: '#ef4444' }}>*</span>
            </label>

            <CustomDatePicker
              value={birthDate}
              onChange={setBirthDate}
              placeholder="Haz clic para seleccionar en el calendario"
              hasError={Boolean(errorMsg && !birthDate)}
            />
            <span style={{
              display: 'block',
              fontSize: '11px',
              color: 'var(--text-secondary)',
              marginTop: '6px'
            }}>
              💡 Usa el selector superior del calendario para elegir tu año de nacimiento rápidamente.
            </span>
          </div>

          {/* Garantía de Privacidad */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 12px',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-secondary, #f8fafc)',
            border: '1px solid var(--border, rgba(148, 163, 184, 0.15))',
            fontSize: '11.5px',
            color: 'var(--text-secondary)',
            marginBottom: '20px'
          }}>
            <ShieldCheck size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <span>Tus datos son privados y se usan exclusivamente para personalizar temáticas y reconocimientos.</span>
          </div>

          {/* Botón de Guardado Obligatorio */}
          <button
            type="submit"
            disabled={loading || !birthDate}
            style={{
              width: '100%',
              padding: '12px 18px',
              borderRadius: '14px',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '700',
              border: 'none',
              cursor: loading || !birthDate ? 'not-allowed' : 'pointer',
              opacity: loading || !birthDate ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px var(--tech-glow, rgba(99, 102, 241, 0.35))',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? (
              <span>Guardando fecha...</span>
            ) : (
              <>
                <span>Guardar y Continuar</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BirthDateRequiredModal;
