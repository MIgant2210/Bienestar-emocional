import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturo un error:', error, errorInfo);
    if (error?.message?.includes('removeChild') || error?.message?.includes('Node')) {
      const lastReload = sessionStorage.getItem('last_auto_dom_reload');
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem('last_auto_dom_reload', now.toString());
        window.location.reload();
      }
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/mi-bienestar';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            backgroundColor: 'var(--bg-secondary, #ffffff)',
            padding: '32px 24px',
            borderRadius: '24px',
            border: '1.5px solid var(--border, #e2e8f0)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--danger, #ef4444)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertCircle size={28} />
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary, #0f172a)', margin: 0 }}>
              Cargando tu bienestar...
            </h2>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary, #64748b)', lineHeight: '1.5', margin: 0 }}>
              Se produjo un desajuste temporal al sincronizar la vista. Puedes recargar para continuar de forma segura.
            </p>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px', width: '100%' }}>
              <button
                type="button"
                onClick={this.handleReload}
                className="btn btn-primary"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 18px',
                  borderRadius: '14px',
                  fontWeight: '800',
                  fontSize: '13px'
                }}
              >
                <RefreshCw size={15} />
                <span>Recargar</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="btn btn-secondary"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 18px',
                  borderRadius: '14px',
                  fontWeight: '700',
                  fontSize: '13px'
                }}
              >
                <Home size={15} />
                <span>Ir al inicio</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
