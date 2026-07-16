import React, { useContext, useState } from 'react';
import { AuthContext, AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import MemberDashboard from './pages/MemberDashboard';
import AdminDashboard from './pages/AdminDashboard';
import './styles/global.css';

const NavigationHandler = () => {
  const { user, loading, token } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState('login'); // 'login' o 'register'

  if (loading && !user && !token) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-secondary)'
      }}>
        Cargando sesión...
      </div>
    );
  }

  // Si no está autenticado
  if (!user) {
    if (currentPage === 'register') {
      return <Register onNavigate={(page) => setCurrentPage(page || 'login')} />;
    }
    return <Login onNavigate={(page) => setCurrentPage(page || 'dashboard')} />;
  }

  // Si está autenticado, renderizar el panel correspondiente según el rol
  if (user.role === 'miembro') {
    return <MemberDashboard />;
  } else {
    // Para 'admin_institucion' y 'superadmin'
    return <AdminDashboard />;
  }
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationHandler />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
