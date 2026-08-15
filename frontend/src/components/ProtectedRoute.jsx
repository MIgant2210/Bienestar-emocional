import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import Unauthorized403 from '../pages/Unauthorized403';

// Matriz Oficial de Permisos RBAC Frontend
const MODULE_ACCESS_MATRIX = {
  analytics: ['superadmin', 'admin_institucion', 'profesional_apoyo', 'lider_depto'],
  tasks: ['superadmin', 'admin_institucion', 'profesional_apoyo', 'lider_depto', 'miembro'],
  alerts: ['superadmin', 'admin_institucion', 'profesional_apoyo'],
  evaluations: ['superadmin', 'admin_institucion', 'profesional_apoyo', 'lider_depto', 'miembro'],
  clinical_appointments: ['superadmin', 'admin_institucion', 'profesional_apoyo', 'miembro'],
  members: ['superadmin', 'admin_institucion', 'lider_depto'],
  institutions: ['superadmin', 'admin_institucion'],
  progress: ['superadmin', 'admin_institucion', 'profesional_apoyo', 'lider_depto', 'miembro'],
  kudos: ['superadmin', 'admin_institucion', 'profesional_apoyo', 'lider_depto', 'miembro'],
  reports: ['superadmin', 'admin_institucion', 'profesional_apoyo'],
  audit: ['superadmin', 'admin_institucion'],
  ai_plans: ['superadmin', 'admin_institucion', 'profesional_apoyo', 'lider_depto'],
  chat_ia: ['superadmin', 'admin_institucion', 'profesional_apoyo', 'lider_depto', 'miembro'],
  wellbeing: ['superadmin', 'admin_institucion', 'profesional_apoyo', 'lider_depto', 'miembro'],
  settings: ['superadmin', 'admin_institucion', 'profesional_apoyo', 'lider_depto', 'miembro']
};

export const hasModuleAccess = (role, moduleKey) => {
  if (!role || !moduleKey) return false;
  const allowed = MODULE_ACCESS_MATRIX[moduleKey] || [];
  return allowed.includes(role);
};

const ProtectedRoute = ({ module, children, onGoHome }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-secondary)'
      }}>
        Cargando verificación de seguridad RBAC...
      </div>
    );
  }

  if (!user) {
    window.location.href = '/login';
    return null;
  }

  if (module && !hasModuleAccess(user.role, module)) {
    return <Unauthorized403 onGoHome={onGoHome} />;
  }

  return children;
};

export default ProtectedRoute;
