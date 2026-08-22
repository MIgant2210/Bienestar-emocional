import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, Zap, Award } from 'lucide-react';

/**
 * Mascota Oficial de EquilibrIA: Colibrí Morado Inteligente
 * Ilustración SVG en capas con profundidad volumétrica 3D, sombreados suaves y múltiples capas de animación reactiva.
 */
const ColibriMascot = ({ 
  mood = 'welcome', // 'welcome' | 'thinking' | 'happy' | 'almost_done' | 'celebrate'
  customMessage = '',
  progressPercent = 0,
  compact = false
}) => {
  const [bounce, setBounce] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Gatillar reacción y sutil animación cada vez que cambia el estado o el progreso
  useEffect(() => {
    setBounce(true);
    const t = setTimeout(() => setBounce(false), 700);
    return () => clearTimeout(t);
  }, [mood, progressPercent]);

  // Mensaje motivacional contextual según estado
  const getDefaultMessage = () => {
    if (customMessage) return customMessage;
    switch (mood) {
      case 'welcome':
        return '¡Hola! Te acompañaré en esta evaluación. Tómate tu tiempo y responde con sinceridad. 🌿';
      case 'happy':
        return '¡Excelente reflexión! Cada respuesta suma a tu bienestar y autoconocimiento. ✨';
      case 'thinking':
        return 'Respira profundo y escucha lo que sientes. No hay respuestas incorrectas. 💜';
      case 'almost_done':
        return '¡Casi terminamos! Estás a un solo paso de completar tu test. 🚀';
      case 'celebrate':
        return '¡Lo lograste! Has ganado +50 XP y sumado a tu bienestar. ¡Gran trabajo! 🎉';
      default:
        return 'Avanzando paso a paso con calma...';
    }
  };

  return (
    <div 
      className={`colibri-companion-container ${bounce ? 'colibri-bounce' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: compact ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        padding: compact ? '10px 16px' : '22px 18px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '24px',
        border: '1.5px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
        position: 'relative',
        transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        backdropFilter: 'blur(16px)',
        zIndex: 5,
        cursor: 'default',
        overflow: 'hidden'
      }}
    >
      {/* HALO DE LUZ Y RESPLANDOR REACTIVO VIBRANTE */}
      <div 
        style={{
          position: 'absolute',
          width: '130px',
          height: '130px',
          borderRadius: '50%',
          background: mood === 'celebrate' 
            ? 'radial-gradient(circle, rgba(16, 185, 129, 0.35) 0%, rgba(139, 92, 246, 0.15) 50%, transparent 70%)'
            : mood === 'happy'
            ? 'radial-gradient(circle, rgba(255, 122, 0, 0.32) 0%, rgba(253, 224, 71, 0.15) 50%, transparent 70%)'
            : 'radial-gradient(circle, rgba(139, 92, 246, 0.35) 0%, rgba(192, 132, 252, 0.15) 50%, transparent 70%)',
          filter: 'blur(20px)',
          zIndex: 0,
          pointerEvents: 'none',
          animation: 'colibriPulseGlow 3s infinite alternate ease-in-out'
        }}
      />

      {/* ILUSTRACIÓN SVG COLIBRÍ MORADO 3D CON MÚLTIPLES ANIMACIONES */}
      <div 
        className={`colibri-flight-body ${isHovered ? 'colibri-flight-hovered' : ''}`}
        style={{
          position: 'relative',
          width: compact ? '70px' : '120px',
          height: compact ? '70px' : '120px',
          zIndex: 1,
          animation: mood === 'celebrate' 
            ? 'colibriFlyJoy 1.2s infinite ease-in-out' 
            : 'colibriFloatAdvanced 3.6s infinite ease-in-out'
        }}
      >
        <svg 
          viewBox="0 0 200 200" 
          width="100%" 
          height="100%" 
          style={{ overflow: 'visible', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.18))' }}
        >
          <defs>
            {/* Gradientes Volumétricos 3D */}
            <linearGradient id="colibriBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d8b4fe" />
              <stop offset="35%" stopColor="#a855f7" />
              <stop offset="70%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#3b0764" />
            </linearGradient>

            <linearGradient id="colibriBellyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="45%" stopColor="#ff7a00" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>

            <linearGradient id="colibriWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="40%" stopColor="#9333ea" />
              <stop offset="85%" stopColor="#6b21a8" />
              <stop offset="100%" stopColor="#4c1d95" />
            </linearGradient>

            <linearGradient id="colibriBeakGrad" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            {/* Sombra suave interna */}
            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* COLA DEL COLIBRÍ CON BALANCEO NATURAL */}
          <g className="colibri-tail" style={{ transformOrigin: '70px 140px' }}>
            <path d="M 68 135 C 48 162, 28 178, 16 188 C 36 178, 58 162, 72 145 Z" fill="#6b21a8" opacity="0.9" />
            <path d="M 72 138 C 56 168, 42 186, 32 196 C 48 182, 68 164, 76 145 Z" fill="#a855f7" />
            <path d="M 76 140 C 68 170, 60 190, 52 202 C 64 184, 75 166, 80 145 Z" fill="#ff7a00" opacity="0.9" />
          </g>

          {/* ALA TRASERA (Aleteo sincronizado) */}
          <g className="colibri-wing-back" style={{ transformOrigin: '95px 85px' }}>
            <path 
              d="M 95 85 C 108 30, 138 10, 165 5 C 148 32, 122 68, 98 90 Z" 
              fill="url(#colibriWingGrad)" 
              opacity="0.75"
            />
          </g>

          {/* CUERPO PRINCIPAL CON RESPIRACIÓN Y VOLUMEN 3D */}
          <g className="colibri-body-group" style={{ transformOrigin: '110px 100px' }}>
            {/* Lomo y Cabeza */}
            <path 
              d="M 80 140 C 65 110, 70 70, 95 55 C 115 45, 140 50, 145 70 C 150 90, 140 125, 105 142 C 95 146, 85 145, 80 140 Z" 
              fill="url(#colibriBodyGrad)"
            />

            {/* Pecho Brillante e Irisdiscente (Colores de EquilibrIA) */}
            <path 
              d="M 105 72 C 125 70, 142 85, 138 108 C 132 130, 110 138, 98 135 C 112 125, 125 110, 122 92 C 120 80, 112 75, 105 72 Z" 
              fill="url(#colibriBellyGrad)"
            />

            {/* Cuello con destello turquesa/esmeralda suave */}
            <ellipse cx="126" cy="74" rx="8" ry="12" fill="#38bdf8" opacity="0.65" transform="rotate(-20 126 74)" />
          </g>

          {/* PICO LARGO Y ELEGANTE */}
          <path 
            d="M 142 66 L 196 62 Q 198 63 195 65 L 140 71 Z" 
            fill="url(#colibriBeakGrad)"
          />

          {/* OJO AMIGABLE CON PARPADEO Y BRILLO */}
          <g className="colibri-eye" style={{ transformOrigin: '130px 62px' }}>
            <circle cx="130" cy="62" r="5.5" fill="#0f172a" />
            <circle cx="132" cy="60" r="2" fill="#ffffff" />
            {mood === 'happy' || mood === 'celebrate' ? (
              <path d="M 124 61 Q 130 56 136 61" stroke="#ff7a00" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            ) : null}
          </g>

          {/* ALA DELANTERA (Aleteo Rápido y Suave 3D) */}
          <g className="colibri-wing-front" style={{ transformOrigin: '105px 82px' }}>
            <path 
              d="M 105 82 C 122 20, 158 0, 188 -5 C 170 28, 136 68, 108 92 Z" 
              fill="url(#colibriWingGrad)"
            />
            {/* Plumas de detalle interior con reflejo irisdiscente */}
            <path 
              d="M 112 78 C 126 32, 152 16, 175 10 C 160 35, 134 65, 114 85 Z" 
              fill="#e9d5ff" 
              opacity="0.65"
            />
          </g>

          {/* PARTÍCULAS / DESTELLOS FLOTANTES EN ÓRBITA */}
          <g className="colibri-sparkles-group">
            <circle cx="172" cy="38" r="3" fill="#fde047" opacity="0.9" className="sparkle-1" />
            <circle cx="42" cy="78" r="2.5" fill="#ff7a00" opacity="0.85" className="sparkle-2" />
            <circle cx="155" cy="135" r="3.5" fill="#c084fc" opacity="0.9" className="sparkle-3" />
            <circle cx="70" cy="30" r="2" fill="#38bdf8" opacity="0.8" className="sparkle-4" />
          </g>
        </svg>
      </div>

      {/* BURBUJA DE DIÁLOGO / MENSAJE MOTIVACIONAL */}
      <div 
        style={{
          width: compact ? 'auto' : '100%',
          textAlign: compact ? 'left' : 'center',
          zIndex: 2
        }}
      >
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          fontSize: '11px',
          fontWeight: '900',
          padding: '4px 12px',
          borderRadius: '12px',
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          <Sparkles size={12} />
          <span>Equi • Tu Guía Emocional</span>
        </div>

        <p style={{
          fontSize: compact ? '12px' : '13px',
          color: 'var(--text-primary)',
          lineHeight: '1.5',
          margin: 0,
          fontWeight: '600'
        }}>
          {getDefaultMessage()}
        </p>

        {progressPercent > 0 && !compact && (
          <div style={{ marginTop: '12px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '11px',
              fontWeight: '800',
              color: 'var(--text-muted)',
              marginBottom: '5px'
            }}>
              <span>Progreso de la Evaluación</span>
              <span>{progressPercent}%</span>
            </div>
            <div style={{
              width: '100%',
              height: '7px',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '6px',
              overflow: 'hidden',
              border: '1px solid var(--border)'
            }}>
              <div style={{
                width: `${progressPercent}%`,
                height: '100%',
                backgroundColor: 'var(--primary)',
                transition: 'width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }} />
            </div>
          </div>
        )}
      </div>

      {/* ESTILOS CSS INLINE PARA ANIMACIONES ENRIQUECIDAS DEL COLIBRÍ */}
      <style>{`
        @keyframes colibriFloatAdvanced {
          0% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          25% { transform: translateY(-7px) translateX(2px) rotate(2deg); }
          50% { transform: translateY(-12px) translateX(0px) rotate(-1deg); }
          75% { transform: translateY(-5px) translateX(-2px) rotate(1.5deg); }
          100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
        }

        @keyframes colibriFlyJoy {
          0% { transform: translateY(0px) rotate(-4deg) scale(1); }
          30% { transform: translateY(-16px) rotate(5deg) scale(1.08); }
          60% { transform: translateY(-6px) rotate(-2deg) scale(1.04); }
          100% { transform: translateY(0px) rotate(-4deg) scale(1); }
        }

        @keyframes colibriFlapFront {
          0% { transform: rotate(0deg) scaleY(1); }
          50% { transform: rotate(-38deg) scaleY(0.65) skewX(-10deg); }
          100% { transform: rotate(0deg) scaleY(1); }
        }

        @keyframes colibriFlapBack {
          0% { transform: rotate(0deg) scaleY(1); }
          50% { transform: rotate(34deg) scaleY(0.65) skewX(10deg); }
          100% { transform: rotate(0deg) scaleY(1); }
        }

        @keyframes colibriTailAnim {
          0% { transform: rotate(0deg); }
          50% { transform: rotate(-6deg); }
          100% { transform: rotate(0deg); }
        }

        @keyframes colibriBodyBreathe {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }

        @keyframes colibriBlinkAnim {
          0%, 88%, 100% { transform: scaleY(1); }
          93% { transform: scaleY(0.1); }
        }

        @keyframes colibriPulseGlow {
          0% { transform: scale(0.9); opacity: 0.7; }
          100% { transform: scale(1.2); opacity: 1; }
        }

        @keyframes sparkleFloat1 {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.8; }
          50% { transform: translateY(-10px) translateX(4px) scale(1.2); opacity: 1; }
        }

        @keyframes sparkleFloat2 {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.7; }
          50% { transform: translateY(8px) translateX(-5px) scale(1.3); opacity: 1; }
        }

        .colibri-wing-front {
          animation: colibriFlapFront 0.18s infinite ease-in-out;
        }

        .colibri-wing-back {
          animation: colibriFlapBack 0.18s infinite ease-in-out;
        }

        .colibri-tail {
          animation: colibriTailAnim 1.8s infinite ease-in-out;
        }

        .colibri-body-group {
          animation: colibriBodyBreathe 2.4s infinite ease-in-out;
        }

        .colibri-eye {
          animation: colibriBlinkAnim 3.8s infinite;
        }

        .colibri-bounce {
          transform: scale(1.04);
        }

        .sparkle-1 { animation: sparkleFloat1 2.2s infinite ease-in-out; }
        .sparkle-2 { animation: sparkleFloat2 2.8s infinite ease-in-out; }
        .sparkle-3 { animation: sparkleFloat1 3.2s infinite ease-in-out 0.5s; }
        .sparkle-4 { animation: sparkleFloat2 2.5s infinite ease-in-out 1s; }
      `}</style>
    </div>
  );
};

export default ColibriMascot;
