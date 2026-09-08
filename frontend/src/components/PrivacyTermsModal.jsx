import React, { useState } from 'react';
import { ShieldCheck, Lock, CheckCircle2, X, FileText, Sparkles } from 'lucide-react';

const PrivacyTermsModal = ({ isOpen, onClose, initialTab = 'privacy' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(10, 10, 20, 0.82)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px'
    }}>
      <div className="animate-fade" style={{
        maxWidth: '650px',
        width: '100%',
        backgroundColor: 'var(--bg-secondary, #1d1828)',
        background: 'linear-gradient(145deg, var(--bg-secondary, #1d1828) 0%, var(--bg-tertiary, #2d2437) 100%)',
        border: '2px solid var(--primary)',
        borderRadius: '24px',
        padding: '28px',
        boxShadow: '0 25px 60px -10px rgba(0, 0, 0, 0.65), 0 0 24px rgba(var(--primary-rgb), 0.25)',
        position: 'relative',
        color: 'var(--text-primary)',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* Header con Boton de Cierre */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              backgroundColor: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              flexShrink: 0
            }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <span style={{
                fontSize: '11px',
                fontWeight: '800',
                textTransform: 'uppercase',
                color: 'var(--primary)',
                letterSpacing: '0.5px'
              }}>
                Gobernanza y Marco Legal • EquilibrIA
              </span>
              <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-primary)', margin: '2px 0 0 0' }}>
                Políticas de Privacidad y Términos
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Selector de Pestanas */}
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '4px',
          backgroundColor: 'var(--bg-primary, #17121f)',
          borderRadius: '12px',
          marginBottom: '18px',
          border: '1px solid var(--border)'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: activeTab === 'privacy' ? '800' : '600',
              backgroundColor: activeTab === 'privacy' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'privacy' ? '#ffffff' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Lock size={14} />
            <span>Política de Privacidad</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: activeTab === 'terms' ? '800' : '600',
              backgroundColor: activeTab === 'terms' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'terms' ? '#ffffff' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <FileText size={14} />
            <span>Términos del Servicio</span>
          </button>
        </div>

        {/* Cuerpo con Scroll Suave */}
        <div style={{
          overflowY: 'auto',
          paddingRight: '6px',
          display: 'grid',
          gap: '14px',
          fontSize: '13px',
          lineHeight: '1.6',
          color: 'var(--text-secondary)'
        }}>
          {activeTab === 'privacy' ? (
            <>
              <div style={{
                backgroundColor: 'rgba(var(--primary-rgb), 0.1)',
                border: '1px solid var(--primary)',
                borderRadius: '14px',
                padding: '14px 16px',
                color: 'var(--text-primary)'
              }}>
                <strong style={{ color: 'var(--primary)' }}>Principio Fundamental de Confidencialidad:</strong> Tus datos individuales de salud emocional, reflexiones personales y puntuaciones son estrictamente confidenciales.
              </div>

              <div style={{
                backgroundColor: 'var(--bg-primary, #17121f)',
                borderRadius: '14px',
                padding: '16px',
                border: '1px solid var(--border)',
                display: 'grid',
                gap: '10px'
              }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={16} style={{ color: 'var(--success)' }} />
                  Gobernanza de Datos y Protección RBAC:
                </h4>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-primary)' }}>
                  <CheckCircle2 size={15} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '3px' }} />
                  <span><strong>Anonimización Obligatoria:</strong> Los líderes y directivos institucionales únicamente reciben reportes agregados y estadísticos, nunca textos ni nombres individuales.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-primary)' }}>
                  <CheckCircle2 size={15} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '3px' }} />
                  <span><strong>No es Diagnóstico Clínico:</strong> EquilibrIA ofrece orientación preventiva y educativa, no reemplaza la atención psiquiátrica o psicológica individualizada.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-primary)' }}>
                  <CheckCircle2 size={15} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '3px' }} />
                  <span><strong>Derecho al Olvido y Revocación:</strong> Puedes gestionar o revocar tus consentimientos legales de tratamiento de datos e IA en cualquier momento desde tu panel de Configuración.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-primary)' }}>
                  <CheckCircle2 size={15} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '3px' }} />
                  <span><strong>Tratamiento de Voz:</strong> El dictado por voz se procesa de forma temporal y local en tu navegador. El audio no se almacena permanentemente.</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{
                backgroundColor: 'var(--bg-primary, #17121f)',
                borderRadius: '14px',
                padding: '16px',
                border: '1px solid var(--border)',
                display: 'grid',
                gap: '10px'
              }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} style={{ color: 'var(--accent)' }} />
                  Condiciones Generales de Uso:
                </h4>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-primary)' }}>
                  <CheckCircle2 size={15} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '3px' }} />
                  <span><strong>Vinculación Institucional:</strong> El acceso a la plataforma requiere un código de institución legítimo asignado por tu universidad o centro laboral.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-primary)' }}>
                  <CheckCircle2 size={15} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '3px' }} />
                  <span><strong>Uso Ético y Respetuoso:</strong> Queda prohibido el uso indebido de las herramientas de asistencia por IA, dictado o gamificación institucional.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-primary)' }}>
                  <CheckCircle2 size={15} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '3px' }} />
                  <span><strong>Seguridad de Cuenta:</strong> Cada usuario es responsable de mantener la confidencialidad de su contraseña y credenciales vinculadas.</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '18px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary"
            style={{
              padding: '9px 24px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: '800'
            }}
          >
            Entendido y Aceptar
          </button>
        </div>

      </div>
    </div>
  );
};

export default PrivacyTermsModal;
