import React, { useContext, useMemo } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';

/**
 * Decoraciones Ambientales Dinámicas y Reactivas por Temática
 * Capa estética ligera, no invasiva y de alto rendimiento (pointer-events: none).
 * Acompaña al StarryBackground según la festividad o estación activa.
 */
const AmbientDecorations = () => {
  const themeCtx = useContext(ThemeContext);
  const activeTheme = themeCtx?.activeTheme || 'equilibria';

  // Configuración de partículas según la temática
  const themeParticlesConfig = useMemo(() => {
    switch (activeTheme) {
      case 'winter':
        return {
          type: 'snow',
          count: 18,
          items: ['❄', '❅', '•', '·'],
          direction: 'down',
          color: 'rgba(224, 242, 254, 0.85)'
        };
      case 'spring':
        return {
          type: 'petals',
          count: 14,
          items: ['🌸', '💮', '🍃'],
          direction: 'down',
          color: 'rgba(251, 207, 232, 0.8)'
        };
      case 'autumn':
        return {
          type: 'leaves',
          count: 14,
          items: ['🍂', '🍁'],
          direction: 'down',
          color: 'rgba(251, 146, 60, 0.85)'
        };
      case 'summer':
        return {
          type: 'sunbeams',
          count: 10,
          items: ['✨', '☀️', '💛'],
          direction: 'up',
          color: 'rgba(253, 224, 71, 0.7)'
        };
      case 'halloween':
        return {
          type: 'magic',
          count: 14,
          items: ['✨', '🎃', '🦇', '🔮'],
          direction: 'up',
          color: 'rgba(249, 115, 22, 0.8)'
        };
      case 'birthday':
        return {
          type: 'confetti',
          count: 18,
          items: ['🎉', '🎈', '⭐', '🎊'],
          direction: 'down',
          color: 'rgba(244, 114, 182, 0.85)'
        };
      case 'valentines':
        return {
          type: 'hearts',
          count: 14,
          items: ['💗', '💖', '✨', '💕'],
          direction: 'up',
          color: 'rgba(251, 113, 133, 0.8)'
        };
      case 'environment':
        return {
          type: 'nature',
          count: 14,
          items: ['🌱', '🌿', '🍃'],
          direction: 'up',
          color: 'rgba(52, 211, 153, 0.8)'
        };
      case 'graduation':
        return {
          type: 'triumph',
          count: 14,
          items: ['⭐', '🎓', '✨', '📜'],
          direction: 'down',
          color: 'rgba(251, 191, 36, 0.85)'
        };
      case 'guatemala':
        return {
          type: 'patria',
          count: 14,
          items: ['🇬🇹', '✨', '🕊️', '🌿'],
          direction: 'up',
          color: 'rgba(56, 189, 248, 0.85)'
        };
      case 'christmas':
        return {
          type: 'christmas',
          count: 18,
          items: ['❄️', '⭐', '✨', '🔔'],
          direction: 'down',
          color: 'rgba(254, 202, 202, 0.85)'
        };
      case 'newyear':
        return {
          type: 'sparkles',
          count: 16,
          items: ['✨', '⭐', '🥂', '🎆'],
          direction: 'up',
          color: 'rgba(253, 224, 71, 0.9)'
        };
      case 'anniversary':
        return {
          type: 'gala',
          count: 16,
          items: ['👑', '⭐', '✨', '💜'],
          direction: 'up',
          color: 'rgba(192, 132, 252, 0.85)'
        };
      default:
        // 'equilibria' mantiene solo el cielo estrellado existente
        return null;
    }
  }, [activeTheme]);

  // Generar posiciones estables de partículas
  const particles = useMemo(() => {
    if (!themeParticlesConfig) return [];
    return Array.from({ length: themeParticlesConfig.count }, (_, i) => ({
      id: i,
      left: Math.round(((i * 5.8) + (i % 3) * 7.2) % 96) + 2,
      delay: (i * 0.45).toFixed(2),
      duration: (7 + (i % 6) * 1.8).toFixed(1),
      size: (12 + (i % 4) * 4),
      icon: themeParticlesConfig.items[i % themeParticlesConfig.items.length],
      opacity: (0.45 + (i % 5) * 0.1).toFixed(2)
    }));
  }, [themeParticlesConfig]);

  if (!themeParticlesConfig || particles.length === 0) {
    return null;
  }

  const isDown = themeParticlesConfig.direction === 'down';

  return (
    <div 
      className="ambient-thematic-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 1,
        overflow: 'hidden'
      }}
    >
      <style>{`
        @keyframes ambientFallSlow {
          0% {
            transform: translate3d(0, -40px, 0) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: var(--p-opacity, 0.7);
          }
          85% {
            opacity: var(--p-opacity, 0.7);
          }
          100% {
            transform: translate3d(40px, 105vh, 0) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes ambientRiseSlow {
          0% {
            transform: translate3d(0, 105vh, 0) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: var(--p-opacity, 0.7);
          }
          85% {
            opacity: var(--p-opacity, 0.7);
          }
          100% {
            transform: translate3d(-30px, -40px, 0) rotate(-360deg);
            opacity: 0;
          }
        }
      `}</style>

      {particles.map(p => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            opacity: p.opacity,
            '--p-opacity': p.opacity,
            color: themeParticlesConfig.color,
            animation: isDown 
              ? `ambientFallSlow ${p.duration}s infinite linear` 
              : `ambientRiseSlow ${p.duration}s infinite linear`,
            animationDelay: `${p.delay}s`,
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.12))',
            willChange: 'transform, opacity',
            userSelect: 'none'
          }}
        >
          {p.icon}
        </span>
      ))}
    </div>
  );
};

export default AmbientDecorations;
