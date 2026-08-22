import React, { useContext, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './contexts/AuthContext';
import { ThemeContext, ThemeProvider } from './contexts/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized403 from './pages/Unauthorized403';
import ProtectedRoute from './components/ProtectedRoute';
import StarryBackground from './components/StarryBackground';
import './styles/global.css';

// Lazy loading para división de código y arranque instantáneo
const EmailVerification = lazy(() => import('./pages/EmailVerification'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const MemberDashboard = lazy(() => import('./pages/MemberDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const MyWellbeing = lazy(() => import('./pages/MyWellbeing'));

const PageLoader = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
    gap: '12px',
    color: 'var(--text-secondary)',
    fontSize: '13px'
  }}>
    <div className="animate-spin" style={{
      width: '28px',
      height: '28px',
      border: '3px solid var(--border)',
      borderTopColor: 'var(--primary)',
      borderRadius: '50%'
    }} />
    <span>Cargando módulo...</span>
  </div>
);

const MainDashboardRouter = ({ defaultTab }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleGoHome = () => {
    navigate(user.role === 'miembro' ? '/mi-bienestar' : '/analiticas');
  };

  if (user.role === 'miembro') {
    return <MemberDashboard initialTab={defaultTab} onGoHome={handleGoHome} />;
  } else {
    return <AdminDashboard initialTab={defaultTab} onGoHome={handleGoHome} />;
  }
};

const RootRedirect = () => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'miembro' ? '/mi-bienestar' : '/analiticas'} replace />;
};

const NavigationHandler = () => {
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
        Cargando verificación de sesión...
      </div>
    );
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={!user ? <Login /> : <RootRedirect />} />
        <Route path="/registro" element={!user ? <Register /> : <RootRedirect />} />
        <Route path="/register" element={<Navigate to="/registro" replace />} />
        <Route path="/verificar-correo/:token" element={<EmailVerification />} />
        <Route path="/verificar-correo" element={<EmailVerification />} />
        <Route path="/restablecer-contrasena/:token" element={<ResetPassword />} />
        <Route path="/restablecer-contrasena" element={<ResetPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/recuperar-contrasena" element={<ForgotPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/403" element={<Unauthorized403 onGoHome={() => window.location.href = user ? (user.role === 'miembro' ? '/mi-bienestar' : '/analiticas') : '/login'} />} />

        {/* Módulos Oficiales Protegidos por URL y Matriz RBAC */}
        <Route path="/mi-bienestar" element={
          <ProtectedRoute module="wellbeing">
            <MainDashboardRouter defaultTab="bienestar" />
          </ProtectedRoute>
        } />
        <Route path="/configuracion" element={
          <ProtectedRoute module="settings">
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/analiticas" element={
          <ProtectedRoute module="analytics">
            <MainDashboardRouter defaultTab="analytics" />
          </ProtectedRoute>
        } />
        <Route path="/tareas" element={
          <ProtectedRoute module="tasks">
            <MainDashboardRouter defaultTab="tasks" />
          </ProtectedRoute>
        } />
        <Route path="/alertas" element={
          <ProtectedRoute module="alerts">
            <MainDashboardRouter defaultTab="alerts" />
          </ProtectedRoute>
        } />
        <Route path="/tests" element={
          <ProtectedRoute module="evaluations">
            <MainDashboardRouter defaultTab="evaluations" />
          </ProtectedRoute>
        } />
        <Route path="/agenda" element={
          <ProtectedRoute module="clinical_appointments">
            <MainDashboardRouter defaultTab="clinical_appointments" />
          </ProtectedRoute>
        } />
        <Route path="/usuarios" element={
          <ProtectedRoute module="members">
            <MainDashboardRouter defaultTab="members" />
          </ProtectedRoute>
        } />
        <Route path="/instituciones" element={
          <ProtectedRoute module="institutions">
            <MainDashboardRouter defaultTab="institutions" />
          </ProtectedRoute>
        } />
        <Route path="/mi-progreso" element={
          <ProtectedRoute module="progress">
            <MainDashboardRouter defaultTab="progress" />
          </ProtectedRoute>
        } />
        <Route path="/kudos" element={
          <ProtectedRoute module="kudos">
            <MainDashboardRouter defaultTab="kudos" />
          </ProtectedRoute>
        } />
        <Route path="/reportes" element={
          <ProtectedRoute module="reports">
            <MainDashboardRouter defaultTab="reports" />
          </ProtectedRoute>
        } />
        <Route path="/auditoria" element={
          <ProtectedRoute module="audit">
            <MainDashboardRouter defaultTab="audit" />
          </ProtectedRoute>
        } />
        <Route path="/sugerencias-ia" element={
          <ProtectedRoute module="ai_plans">
            <MainDashboardRouter defaultTab="ai_plans" />
          </ProtectedRoute>
        } />
        <Route path="/chatbot-ia" element={
          <ProtectedRoute module="chat_ia">
            <MainDashboardRouter defaultTab="chat_ia" />
          </ProtectedRoute>
        } />
        <Route path="/cultura" element={
          <ProtectedRoute module="culture">
            <MainDashboardRouter defaultTab="culture" />
          </ProtectedRoute>
        } />
        <Route path="/diccionario-cultural" element={<Navigate to="/cultura" replace />} />

        {/* Ruta comodín para redirigir URLs desconocidas */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </Suspense>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <StarryBackground />
          <NavigationHandler />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
