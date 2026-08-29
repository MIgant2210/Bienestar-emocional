import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, Send, CheckCircle2, Lock } from 'lucide-react';

const ResourceReflectionWidget = ({ data, initialAnswers = {}, onSaveAnswers, onComplete }) => {
  const prompt = data?.prompt || '¿Qué aprendizaje o ajuste de bienestar te deja esta lectura?';
  const placeholder = data?.placeholder || 'Escribe tu reflexión con total privacidad y tranquilidad...';
  
  const [reflectionText, setReflectionText] = useState(initialAnswers?.reflection_text || '');
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialAnswers?.reflection_text) {
      setReflectionText(initialAnswers.reflection_text);
    }
  }, [initialAnswers]);

  const handleSave = async () => {
    if (!reflectionText.trim()) return;
    setSaving(true);
    try {
      if (onSaveAnswers) {
        await onSaveAnswers({ reflection_text: reflectionText });
      }
      setIsSaved(true);
      if (onComplete) {
        onComplete();
      }
      setTimeout(() => setIsSaved(false), 3000);
    } catch (e) {
      console.error('Error saving reflection:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-primary)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '20px',
      margin: '16px 0',
      display: 'grid',
      gap: '12px'
    }} role="region" aria-label="Espacio de reflexión guiada confidencial">
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} style={{ color: 'var(--accent)' }} />
          <h4 style={{ fontSize: '14.5px', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>
            Pregunta de Reflexión Guiada
          </h4>
        </div>
        <span style={{
          fontSize: '11px',
          color: 'var(--success)',
          backgroundColor: 'var(--success-light)',
          padding: '3px 8px',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontWeight: '800'
        }}>
          <Lock size={12} /> 100% Confidencial y Privada
        </span>
      </div>

      <div style={{
        fontSize: '13px',
        fontWeight: '700',
        color: 'var(--text-primary)',
        backgroundColor: 'var(--bg-secondary)',
        padding: '12px 14px',
        borderRadius: '10px',
        borderLeft: '4px solid var(--primary)'
      }}>
        {prompt}
      </div>

      <textarea
        rows={4}
        value={reflectionText}
        onChange={(e) => setReflectionText(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '13px',
          borderRadius: '10px',
          border: '1px solid var(--border)',
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          resize: 'vertical',
          boxSizing: 'border-box'
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          {reflectionText.length} caracteres
        </span>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !reflectionText.trim()}
          className="btn btn-primary"
          style={{ padding: '8px 18px', borderRadius: '10px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          {isSaved ? <CheckCircle2 size={14} /> : <Send size={14} />}
          <span>{isSaved ? '¡Reflexión Guardada!' : (saving ? 'Guardando...' : 'Guardar Reflexión (+XP)')}</span>
        </button>
      </div>

    </div>
  );
};

export default ResourceReflectionWidget;
