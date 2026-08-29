import React, { useState } from 'react';
import { Sparkles, Play, RotateCcw } from 'lucide-react';
import AngieAvatar from './AngieAvatar';
import KennyAvatar from './KennyAvatar';

/**
 * ============================================================================
 * WELLNESS GUIDE STAGE: CENTRO DE RECURSOS DE EQUILIBRIA (3D MASTER)
 * ============================================================================
 */
export const WellnessGuideStage = ({
  initialGuide = 'angie', // 'angie' | 'kenny'
  title = 'Relajación y Bienestar Activo',
  subtitle = 'Acomódate en una postura relajada y presiona Iniciar para comenzar juntos.',
  onStart = null,
  onGuideChange = null,
  compact = false,
  className = '',
  style = {}
}) => {
  const [activeGuide, setActiveGuide] = useState(initialGuide);
  const [isStarting, setIsStarting] = useState(false);

  const guides = [
    { id: 'angie', name: 'Angie', imgSrc: '/avatars/angie_bust.png', titleName: 'Angie' },
    { id: 'kenny', name: 'Kenny', imgSrc: '/avatars/kenny_bust.png', titleName: 'Kenny' }
  ];

  const currentGuideData = guides.find(g => g.id === activeGuide) || guides[0];

  const handleSelectGuide = (guideId) => {
    setActiveGuide(guideId);
    if (onGuideChange) onGuideChange(guideId);
  };

  const handleStartClick = () => {
    setIsStarting(true);
    if (onStart) onStart(activeGuide);
    setTimeout(() => setIsStarting(false), 600);
  };

  return (
    <div
      className={`wellness-guide-card-module ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: compact ? '440px' : '580px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        userSelect: 'none',
        ...style
      }}
    >
      {/* 1. SELECTOR SUPERIOR INTERACTIVO (TABS CON FOTO 3D) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '16px'
        }}
      >
        <span
          style={{
            fontSize: '12px',
            fontWeight: '800',
            color: 'var(--text-secondary, #64748b)',
            letterSpacing: '0.2px'
          }}
        >
          Guía de Bienestar:
        </span>

        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-tertiary, #f1f5f9)',
            padding: '3px',
            borderRadius: '14px',
            border: '1px solid var(--border, #e2e8f0)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}
        >
          {guides.map((g) => {
            const isSelected = activeGuide === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => handleSelectGuide(g.id)}
                style={{
                  padding: '5px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? '#7e22ce' : 'transparent',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary, #475569)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: isSelected ? '0 4px 10px rgba(126, 34, 206, 0.25)' : 'none',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  transition: 'all 0.2s ease'
                }}
              >
                <img src={g.imgSrc} alt={g.name} style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }} />
                <span>{g.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. TARJETA CENTRAL CON ESCENARIO 3D */}
      <div
        className="wellness-stage-card"
        style={{
          position: 'relative',
          width: '100%',
          minHeight: compact ? '270px' : '340px',
          borderRadius: '28px',
          background: 'linear-gradient(155deg, #faf5ff 0%, #f3e8ff 45%, #eef2ff 100%)',
          border: '1.5px solid rgba(192, 132, 252, 0.45)',
          boxShadow: '0 20px 45px -12px rgba(126, 34, 206, 0.14)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: '24px 20px 14px',
          overflow: 'hidden',
          transition: 'all 0.4s ease'
        }}
      >
        <div style={{ position: 'absolute', top: '16px', right: '20px', opacity: 0.6 }}>
          <Sparkles size={16} color="#c084fc" />
        </div>
        <div style={{ position: 'absolute', bottom: '24px', left: '20px', opacity: 0.45 }}>
          <Sparkles size={14} color="#f472b6" />
        </div>

        {/* Plataforma 3D Circular */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            width: '200px',
            height: '44px',
            borderRadius: '50%',
            background: 'linear-gradient(180deg, #e9d5ff 0%, #d8b4fe 40%, #c084fc 100%)',
            boxShadow: '0 12px 28px rgba(126, 34, 206, 0.25), inset 0 2px 4px rgba(255, 255, 255, 0.8)',
            border: '1.5px solid rgba(255, 255, 255, 0.7)',
            zIndex: 1
          }}
        />

        {/* 3. RENDERIZADO DEL GUÍA 3D SOBRE LA PLATAFORMA */}
        <div
          className="guide-character-wrapper"
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            width: '100%',
            minHeight: '280px',
            marginBottom: '6px'
          }}
        >
          {activeGuide === 'angie' && <AngieAvatar compact={compact} />}
          {activeGuide === 'kenny' && <KennyAvatar compact={compact} />}
        </div>
      </div>

      {/* 4. BADGE INFORMATIVO Y MENSAJE DE POSTURA */}
      <div
        style={{
          marginTop: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: '460px'
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '12px',
            backgroundColor: 'rgba(139, 92, 246, 0.08)',
            color: '#7e22ce',
            fontSize: '11.5px',
            fontWeight: '800',
            marginBottom: '6px'
          }}
        >
          <Sparkles size={13} />
          <span>Guía {currentGuideData.titleName} lista para acompañarte</span>
        </div>

        <p
          style={{
            fontSize: '13.5px',
            fontWeight: '600',
            color: 'var(--text-secondary, #475569)',
            margin: '0 0 14px 0',
            lineHeight: '1.4'
          }}
        >
          {subtitle}
        </p>

        {onStart && (
          <button
            type="button"
            onClick={handleStartClick}
            disabled={isStarting}
            style={{
              padding: '10px 24px',
              borderRadius: '14px',
              border: 'none',
              backgroundColor: '#7e22ce',
              color: '#ffffff',
              fontSize: '13.5px',
              fontWeight: '900',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 6px 18px rgba(126, 34, 206, 0.35)',
              transform: isStarting ? 'scale(0.97)' : 'scale(1)',
              transition: 'all 0.2s ease'
            }}
          >
            <Play size={15} fill="#ffffff" />
            <span>Iniciar Práctica Guiada</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default WellnessGuideStage;
