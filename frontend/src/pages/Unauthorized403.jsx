import React, { useContext } from 'react';
import { ShieldAlert, ArrowLeft, Lock, Home } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Unauthorized403 = ({ onGoHome }) => {
  const { user } = useContext(AuthContext);

  const handleReturn = () => {
    if (typeof onGoHome === 'function') {
      onGoHome();
    } else {
      window.location.href = '/';
    }
  };

  const getRoleTitle = (r) => {
    const rolesMap = {
      superadmin: 'Super Administrador',
      admin_institucion: 'Administrador Institucional',
      profesional_apoyo: 'Profesional de Apoyo',
      lider_depto: 'Líder de Departamento',
      miembro: 'Miembro / Colaborador'
    };
    return rolesMap[r] || r || 'Usuario';
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      position: 'relative',
      zIndex: 2
    }}>
      <div className="glass-card animate-fade" style={{
        maxWidth: '540px',
        width: '100%',
        padding: '36px 32px',
        textAlign: 'center',
        border: '2px solid var(--danger)',
        boxShadow: '0 20px 50px rgba(239, 68, 68, 0.18)',
        borderRadius: '28px'
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: 'var(--danger-light)',
          color: 'var(--danger)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
          boxShadow: '0 8px 24px rgba(239, 68, 68, 0.25)'
        }}>
          <ShieldAlert size={36} />
        </div>

        <span style={{
          fontSize: '11px',
          fontWeight: '900',
          letterSpacing: '1px',
          padding: '4px 12px',
          borderRadius: '20px',
          backgroundColor: 'var(--danger-light)',
          color: 'var(--danger)',
          textTransform: 'uppercase',
          display: 'inline-block',
          marginBottom: '12px'
        }}>
          Error 403 • Acceso No Autorizado
        </span>

        <h1 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '12px' }}>
          Módulo Restringido por Política RBAC
        </h1>

        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>
          No cuentas con los permisos de seguridad requeridos para consultar este módulo o recurso. Esta acción ha sido registrada en la bitácora de auditoría por motivos de confidencialidad institucional.
        </p>

        {user && (
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            padding: '12px 16px',
            borderRadius: '14px',
            border: '1px solid var(--border)',
            fontSize: '12px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ color: 'var(--text-muted)' }}>Tu Rol Actual:</span>
            <span style={{ fontWeight: '900', color: 'var(--primary)' }}>
              🔒 {getRoleTitle(user.role)}
            </span>
          </div>
        )}

        <button
          onClick={handleReturn}
          className="btn btn-primary"
          style={{
            width: '100%',
            padding: '12px 24px',
            borderRadius: '14px',
            fontSize: '13.5px',
            fontWeight: '900',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Home size={16} />
          <span>Volver a Mi Panel Principal</span>
        </button>
      </div>
    </div>
  );
};

export default Unauthorized403;
