import React, { useContext, useMemo, useState, useEffect } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';

/**
 * Decoraciones Ambientales y Lluvia de Bienvenida de EquilibrIA
 * - Mucho más lentas, relajantes y zen (18s - 30s) para evitar cualquier estrés visual.
 * - Al entrar al sistema, al Dashboard o cambiar de temática, suelta una lluvia festiva/estacional suave (4.5s).
 * - En Modo Oscuro: La lluvia cae como bienvenida al entrar y luego se apaga, dejando solo las hermosas estrellas blancas.
 * - En Modo Claro: La lluvia da la bienvenida y luego se queda un fondo suave y tranquilo con partículas temáticas.
 */
const AmbientDecorations = () => {
  const themeCtx = useContext(ThemeContext);
  const activeTheme = themeCtx?.activeTheme || 'equilibria';
  const isDark = themeCtx?.theme === 'dark';

  // Control de lluvia de bienvenida inicial o al cambiar de temática
  const [isShowerBurst, setIsShowerBurst] = useState(true);

  useEffect(() => {
    setIsShowerBurst(true);
    const timer = setTimeout(() => {
      setIsShowerBurst(false);
    }, 5000); // 5 segundos de lluvia suave
    return () => clearTimeout(timer);
  }, [activeTheme]);

  // Si estamos en modo oscuro y la lluvia inicial ya terminó, dejamos solo las estrellas puras
  if (isDark && !isShowerBurst) {
    return null;
  }

  // Configuración de elementos según temática
  const themeParticlesConfig = useMemo(() => {
    switch (activeTheme) {
      case 'winter':
        return {
          type: 'snow',
          burstCount: 26,
          calmCount: 8,
          items: ['❄', '❅', '•', '·'],
          direction: 'down',
          color: 'rgba(224, 242, 254, 0.85)'
        };
      case 'spring':
        return {
          type: 'petals',
          burstCount: 24,
          calmCount: 8,
          items: ['🌸', '💮', '🍃'],
          direction: 'down',
          color: 'rgba(251, 207, 232, 0.8)'
        };
      case 'autumn':
        return {
          type: 'leaves',
          burstCount: 22,
          calmCount: 8,
          items: ['🍂', '🍁'],
          direction: 'down',
          color: 'rgba(251, 146, 60, 0.85)'
        };
      case 'summer':
        return {
          type: 'sunbeams',
          burstCount: 20,
          calmCount: 6,
          items: ['✨', '☀️', '💛'],
          direction: 'up',
          color: 'rgba(253, 224, 71, 0.7)'
        };
      case 'halloween':
        return {
          type: 'magic',
          burstCount: 22,
          calmCount: 8,
          items: ['✨', '🎃', '🦇', '🔮'],
          direction: 'up',
          color: 'rgba(249, 115, 22, 0.8)'
        };
      case 'birthday':
        return {
          type: 'confetti',
          burstCount: 26,
          calmCount: 8,
          items: ['🎉', '🎈', '⭐', '🎊'],
          direction: 'down',
          color: 'rgba(244, 114, 182, 0.85)'
        };
      case 'valentines':
        return {
          type: 'hearts',
          burstCount: 22,
          calmCount: 7,
          items: ['💗', '💖', '✨', '💕'],
          direction: 'up',
          color: 'rgba(251, 113, 133, 0.8)'
        };
      case 'environment':
        return {
          type: 'nature',
          burstCount: 22,
          calmCount: 8,
          items: ['🌱', '🌿', '🍃'],
          direction: 'up',
          color: 'rgba(52, 211, 153, 0.8)'
        };
      case 'graduation':
        return {
          type: 'triumph',
          burstCount: 24,
          calmCount: 8,
          items: ['⭐', '🎓', '✨', '📜'],
          direction: 'down',
          color: 'rgba(251, 191, 36, 0.85)'
        };
      case 'guatemala':
        return {
          type: 'patria',
          burstCount: 24,
          calmCount: 8,
          items: ['🇬🇹', '✨', '🕊️', '🌿'],
          direction: 'up',
          color: 'rgba(56, 189, 248, 0.85)'
        };
      case 'christmas':
        return {
          type: 'christmas',
          burstCount: 26,
          calmCount: 8,
          items: ['❄️', '⭐', '✨', '🔔'],
          direction: 'down',
          color: 'rgba(254, 202, 202, 0.85)'
        };
      case 'newyear':
        return {
          type: 'sparkles',
          burstCount: 24,
          calmCount: 8,
          items: ['✨', '⭐', '🥂', '🎆'],
          direction: 'up',
          color: 'rgba(253, 224, 71, 0.9)'
        };
      case 'anniversary':
        return {
          type: 'gala',
          burstCount: 24,
          calmCount: 8,
          items: ['👑', '⭐', '✨', '💜'],
          direction: 'up',
          color: 'rgba(192, 132, 252, 0.85)'
        };
      default:
        return null;
    }
  }, [activeTheme]);

  const count = isShowerBurst 
    ? (themeParticlesConfig?.burstCount || 20) 
    : (themeParticlesConfig?.calmCount || 8);

  // Generar partículas con tiempos lentos y descansados (18s a 30s)
  const particles = useMemo(() => {
    if (!themeParticlesConfig) return [];
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.round(((i * 4.3) + (i % 5) * 6.7) % 96) + 2,
      delay: isShowerBurst ? (i * 0.18).toFixed(2) : (i * 1.2).toFixed(2),
      // Mucho más lentos: entre 18s y 28s para generar una experiencia serena y antiestrés
      duration: (18 + (i % 6) * 2.2).toFixed(1),
      size: (11 + (i % 4) * 3.5),
      icon: themeParticlesConfig.items[i % themeParticlesConfig.items.length],
      opacity: isShowerBurst ? (0.6 + (i % 3) * 0.15).toFixed(2) : (0.35 + (i % 4) * 0.08).toFixed(2)
    }));
  }, [themeParticlesConfig, count, isShowerBurst]);

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
        overflow: 'hidden',
        transition: 'opacity 1s ease'
      }}
    >
      <style>{`
        /* Caída lenta y serena (Zen Float) */
        @keyframes ambientFallZen {
          0% {
            transform: translate3d(0, -50px, 0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: var(--p-opacity, 0.6);
          }
          85% {
            opacity: var(--p-opacity, 0.6);
          }
          100% {
            transform: translate3d(35px, 105vh, 0) rotate(220deg);
            opacity: 0;
          }
        }

        /* Elevación lenta y pacífica (Zen Rise) */
        @keyframes ambientRiseZen {
          0% {
            transform: translate3d(0, 105vh, 0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: var(--p-opacity, 0.6);
          }
          85% {
            opacity: var(--p-opacity, 0.6);
          }
          100% {
            transform: translate3d(-30px, -50px, 0) rotate(-220deg);
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
              ? `ambientFallZen ${p.duration}s infinite linear` 
              : `ambientRiseZen ${p.duration}s infinite linear`,
            animationDelay: `${p.delay}s`,
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.08))',
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
