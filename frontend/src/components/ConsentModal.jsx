import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, Loader, Info, Lock } from 'lucide-react';
import api from '../services/api';

const CONSENT_DETAILS = {
  wellbeing_data: {
    title: 'Tratamiento de Datos de Bienestar Emocional',
    badge: 'Confidencialidad y Autocuidado',
    description: 'EquilibrIA utiliza tus registros de estado de ánimo y reflexiones con propósitos exclusivamente orientativos, estadísticos y preventivos dentro de tu entorno institucional.',
    points: [
      'Tus datos individuales nunca son compartidos con terceros sin tu autorización expresa.',
      'Los líderes y directivos solo reciben reportes agregados y anonimizados.',
      'EquilibrIA NO realiza diagnósticos médicos ni psicológicos clínicos.',
      'Puedes revocar este consentimiento en cualquier momento desde el módulo de Configuración.'
    ]
  },
  ai_analysis: {
    title: 'Uso de Inteligencia Artificial Preventiva (Gemini)',
    badge: 'Análisis Responsable y Ético',
    description: 'Permite que modelos de inteligencia artificial ética analicen el texto de tus reflexiones para identificar indicadores preventivos y sugerir recursos de autocuidado.',
    points: [
      'El modelo procesa únicamente el texto necesario para estimar tendencias.',
      'No se transmite información personal identificable sensible a entidades externas.',
      'Las sugerencias generadas son de carácter preventivo y educativo.',
      'Puedes gestionar o revocar el uso de IA desde tus opciones de Privacidad.'
    ]
  },
  voice_analysis: {
    title: 'Análisis y Dictado de Voz a Texto',
    badge: 'Procesamiento de Audio Seguro',
    description: 'Permite utilizar el micrófono de tu dispositivo para transcribir tus reflexiones mediante la Web Speech API del navegador de forma instantánea.',
    points: [
      'El audio no se almacena permanentemente en servidores externos.',
      'Solo se conserva la transcripción de texto una vez que decidas enviarla.',
      'Requiere acceso temporal al micrófono de tu dispositivo.',
      'Puedes revocar este permiso cuando lo desees.'
    ]
  }
};

const ConsentModal = ({ isOpen, consentType, onClose, onAccepted }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !consentType) return null;

  const info = CONSENT_DETAILS[consentType] || CONSENT_DETAILS.wellbeing_data;

  const handleAccept = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/wellbeing/consents', {
        consent_type: consentType,
        version: 'v1.0'
      });
      if (onAccepted) onAccepted(consentType);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar el consentimiento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px'
    }}>
      <div className="glass-card animate-fade" style={{
        maxWidth: '560px',
        width: '100%',
        backgroundColor: 'var(--bg-secondary)',
        border: '2px solid var(--primary)',
        borderRadius: '20px',
        padding: '28px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        position: 'relative'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            backgroundColor: 'var(--primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
            flexShrink: 0
          }}>
            <Lock size={24} />
          </div>
          <div>
            <span style={{
              fontSize: '11px',
              fontWeight: '800',
              textTransform: 'uppercase',
              color: 'var(--primary)',
              letterSpacing: '0.5px'
            }}>
              Consentimiento Informado • {info.badge}
            </span>
            <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-primary)', marginTop: '2px' }}>
              {info.title}
            </h3>
          </div>
        </div>

        {/* Descripción Principal */}
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '18px' }}>
          {info.description}
        </p>

        {/* Puntos Clave */}
        <div style={{
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid var(--border)',
          marginBottom: '20px',
          display: 'grid',
          gap: '10px'
        }}>
          <span style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Info size={14} style={{ color: 'var(--primary)' }} /> Principios de Seguridad y Privacidad:
          </span>
          {info.points.map((pt, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              <CheckCircle2 size={15} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '2px' }} />
              <span>{pt}</span>
            </div>
          ))}
        </div>

        {error && (
          <div style={{
            backgroundColor: 'var(--danger-light)',
            color: 'var(--danger)',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '12px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Acciones */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '700' }}
            disabled={loading}
          >
            Cancelar
          </button>
          
          <button
            type="button"
            onClick={handleAccept}
            className="btn btn-primary"
            style={{ padding: '10px 24px', borderRadius: '10px', fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}
            disabled={loading}
          >
            {loading ? (
              <Loader size={16} className="animate-spin" />
            ) : (
              <>
                <ShieldCheck size={16} />
                <span>Acepto y Continuar</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConsentModal;
