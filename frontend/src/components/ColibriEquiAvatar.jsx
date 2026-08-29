import React from 'react';

/**
 * ============================================================================
 * COLIBRÍ EQUI AVATAR (Official EquilibrIA Hummingbird Companion)
 * ============================================================================
 * Mascota Guía Oficial de Bienestar:
 * - Mantiene la identidad oficial del sistema EquilibrIA.
 * - Paleta: Morado (#6c5ce7), violeta (#a855f7), naranja vibrante (#f97316) y amarillo suave.
 * - Cinemática reactiva a respiración, estiramiento y celebración.
 */
export const ColibriEquiAvatar = ({
  pose = 'neutral',
  duration = 4,
  compact = false,
  className = '',
  style = {},
  animated = true
}) => {
  const p = (pose || 'neutral').toLowerCase();
  const isInhale = p === 'inhale' || p.includes('respira');
  const isExhale = p === 'exhale';
  const isCelebrate = p === 'celebrate';

  return (
    <div
      className={`colibri-equi-avatar-container ${className}`}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: compact ? '160px' : '210px',
        height: compact ? '200px' : '260px',
        userSelect: 'none',
        ...style
      }}
    >
      {/* Halo de luz ambiental reactivo */}
      <div
        style={{
          position: 'absolute',
          width: compact ? '140px' : '180px',
          height: compact ? '140px' : '180px',
          borderRadius: '50%',
          background: isCelebrate
            ? 'radial-gradient(circle, rgba(249, 115, 22, 0.45) 0%, rgba(168, 85, 247, 0.35) 50%, transparent 75%)'
            : isInhale
            ? 'radial-gradient(circle, rgba(56, 189, 248, 0.4) 0%, rgba(168, 85, 247, 0.25) 55%, transparent 75%)'
            : 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(249, 115, 22, 0.18) 55%, transparent 75%)',
          filter: 'blur(20px)',
          zIndex: 0,
          pointerEvents: 'none',
          transition: 'all 0.6s ease'
        }}
      />

      {/* SVG Ilustración Vectorial Pura del Colibrí Equi */}
      <svg
        viewBox="0 0 280 340"
        style={{
          width: '100%',
          height: '100%',
          overflow: 'visible',
          zIndex: 1,
          filter: 'drop-shadow(0 14px 28px rgba(108, 92, 231, 0.22))',
          transition: 'all 0.5s ease',
          transform: isCelebrate
            ? 'scale(1.08) translateY(-8px)'
            : isInhale
            ? 'translateY(-6px) scale(1.04)'
            : isExhale
            ? 'translateY(4px) scale(0.98)'
            : 'none'
        }}
      >
        <defs>
          {/* Gradientes del Colibrí */}
          <linearGradient id="equi-body-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="35%" stopColor="#9333ea" />
            <stop offset="85%" stopColor="#6b21a8" />
            <stop offset="100%" stopColor="#4c1d95" />
          </linearGradient>

          <linearGradient id="equi-wing-main" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="40%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>

          <linearGradient id="equi-wing-secondary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="60%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>

          <linearGradient id="equi-tail-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="60%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>

          <radialGradient id="equi-eye-grad" cx="40%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>
        </defs>

        <style>{`
          .equi-wing-anim {
            transform-origin: 130px 140px;
            animation: ${isCelebrate ? 'equiFlutterFast 0.6s infinite alternate' : 'equiFlutter 1.6s ease-in-out infinite alternate'};
          }
          @keyframes equiFlutter {
            0% { transform: rotate(0deg) scale(1); }
            100% { transform: rotate(-10deg) scale(1.04); }
          }
          @keyframes equiFlutterFast {
            0% { transform: rotate(-14deg) scale(0.96); }
            100% { transform: rotate(14deg) scale(1.08); }
          }
        `}</style>

        {/* Grupo del Colibrí Centrado */}
        <g id="colibri-equi-character" transform="translate(20, 20)">
          {/* Cola Estilizada Multicapa */}
          <g id="equi-tail">
            <path
              d="M 120 190 Q 95 240 80 270 Q 105 245 128 200 Z"
              fill="url(#equi-tail-grad)"
              opacity="0.9"
            />
            <path
              d="M 125 195 Q 115 250 105 285 Q 125 250 134 205 Z"
              fill="url(#equi-wing-secondary)"
              opacity="0.95"
            />
            <path
              d="M 132 198 Q 135 255 130 290 Q 142 245 140 205 Z"
              fill="url(#equi-wing-main)"
            />
          </g>

          {/* Ala Trasera */}
          <g id="equi-wing-back" className="equi-wing-anim">
            <path
              d="M 125 135 C 100 80, 50 50, 20 40 C 35 75, 75 115, 115 145 Z"
              fill="url(#equi-wing-secondary)"
              opacity="0.8"
            />
            <path
              d="M 120 140 C 95 95, 55 70, 30 65 C 50 95, 85 125, 115 150 Z"
              fill="url(#equi-tail-grad)"
              opacity="0.75"
            />
          </g>

          {/* Cuerpo Principal del Colibrí */}
          <g id="equi-body">
            {/* Pecho y Vientre Curvo */}
            <path
              d="M 155 110 C 180 135, 185 175, 155 200 C 135 210, 115 195, 115 175 C 115 145, 135 120, 155 110 Z"
              fill="url(#equi-body-grad)"
            />
            {/* Reflejo Naranja en el Pecho */}
            <path
              d="M 148 125 C 168 145, 172 175, 150 192 C 140 180, 142 150, 148 125 Z"
              fill="url(#equi-wing-secondary)"
              opacity="0.85"
            />
          </g>

          {/* Ala Frontal Dinámica */}
          <g id="equi-wing-front" className="equi-wing-anim">
            <path
              d="M 135 140 C 120 70, 75 30, 35 15 C 45 60, 85 110, 130 155 Z"
              fill="url(#equi-wing-main)"
            />
            <path
              d="M 130 148 C 115 90, 80 55, 50 45 C 65 80, 95 120, 125 160 Z"
              fill="url(#equi-wing-secondary)"
            />
            <path
              d="M 125 155 C 110 110, 85 85, 65 75 C 80 100, 105 130, 120 165 Z"
              fill="url(#equi-tail-grad)"
              opacity="0.9"
            />
          </g>

          {/* Cabeza y Pico */}
          <g id="equi-head">
            {/* Cabeza Redondeada */}
            <circle cx="165" cy="105" r="22" fill="url(#equi-body-grad)" />
            {/* Corona Violeta Brillante */}
            <path
              d="M 152 92 Q 165 78 178 92 Q 165 86 152 92 Z"
              fill="url(#equi-wing-secondary)"
            />
            {/* Ojo Expresivo */}
            <circle cx="170" cy="102" r="6.5" fill="url(#equi-eye-grad)" />
            <circle cx="172" cy="100" r="2" fill="#ffffff" />

            {/* Pico Fino y Elegante */}
            <path
              d="M 184 106 L 245 112 Q 210 116 182 114 Z"
              fill="#2e1065"
            />
            {/* Brillo en la punta del pico */}
            <circle cx="245" cy="112" r="1.8" fill="#fbcfe8" />
          </g>

          {/* Destellos y Partículas de Luz de Bienestar */}
          <g id="equi-sparkles">
            <circle cx="205" cy="80" r="2.5" fill="#fde047" opacity="0.9" />
            <circle cx="190" cy="50" r="3.5" fill="#f472b6" opacity="0.8" />
            <circle cx="65" cy="130" r="2.8" fill="#a855f7" opacity="0.75" />
            <circle cx="105" cy="270" r="3" fill="#fb923c" opacity="0.85" />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default ColibriEquiAvatar;
