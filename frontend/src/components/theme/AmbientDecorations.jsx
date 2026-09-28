import React, { useContext, useMemo, useState, useEffect } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';

/**
 * Lluvia Temática de Bienvenida de EquilibrIA
 * - Al entrar a la plataforma, recargar o cambiar de tema/modo:
 *   Despliega una hermosa lluvia de bienvenida con los elementos de la temática por toda la pantalla
 *   (incluyendo el centro) durante 4.5 segundos.
 * - Después de los 4.5 segundos, la lluvia se retira suavemente (desvaneciéndose al 0% de opacidad)
 *   TANTO en Modo Claro como en Modo Oscuro, dejando la vista de los módulos y opciones 100% limpia.
 */
const AmbientDecorations = () => {
  const themeCtx = useContext(ThemeContext);
  const activeTheme = themeCtx?.activeTheme || 'equilibria';
  const isDark = themeCtx?.theme === 'dark';

  // Control de lluvia de bienvenida inicial o al cambiar de temática o modo claro/oscuro
  const [isShowerBurst, setIsShowerBurst] = useState(true);

  useEffect(() => {
    setIsShowerBurst(true);
    const timer = setTimeout(() => {
      setIsShowerBurst(false);
    }, 4500); // 4.5 segundos de lluvia inicial de bienvenida
    return () => clearTimeout(timer);
  }, [activeTheme, isDark]);

  // Configuración de elementos según temática
  const themeParticlesConfig = useMemo(() => {
    switch (activeTheme) {
      case 'equilibria':
        return {
          type: 'sparkles',
          count: 36,
          items: ['✨', '✦', '✧', '⋆', '•'],
          direction: 'up',
          color: 'rgba(129, 140, 248, 0.9)'
        };
      case 'winter':
        return {
          type: 'snow',
          count: 38,
          items: ['❄️', '❅', '❆', '✨', '🤍', '·'],
          direction: 'down',
          color: 'rgba(186, 230, 253, 0.9)'
        };
      case 'spring':
        return {
          type: 'petals',
          count: 38,
          items: ['🌸', '💮', '🌷', '✨', '🍃', '🌺'],
          direction: 'down',
          color: 'rgba(244, 114, 182, 0.9)'
        };
      case 'autumn':
        return {
          type: 'leaves',
          count: 36,
          items: ['🍂', '🍁', '🌰', '✨', '🌾', '🧡'],
          direction: 'down',
          color: 'rgba(249, 115, 22, 0.9)'
        };
      case 'summer':
        return {
          type: 'sunbeams',
          count: 36,
          items: ['☀️', '✨', '🌴', '🌊', '💛', '🏖️'],
          direction: 'up',
          color: 'rgba(250, 204, 21, 0.85)'
        };
      case 'halloween':
        return {
          type: 'magic',
          count: 36,
          items: ['🎃', '🦇', '✨', '🔮', '🌙', '🕸️'],
          direction: 'up',
          color: 'rgba(251, 146, 60, 0.9)'
        };
      case 'birthday':
        return {
          type: 'confetti',
          count: 38,
          items: ['🎉', '🎈', '⭐', '🎊', '✨', '🍰'],
          direction: 'down',
          color: 'rgba(236, 72, 153, 0.9)'
        };
      case 'valentines':
        return {
          type: 'hearts',
          count: 36,
          items: ['💗', '💖', '💕', '✨', '🌸', '💘'],
          direction: 'up',
          color: 'rgba(244, 63, 94, 0.9)'
        };
      case 'environment':
        return {
          type: 'nature',
          count: 36,
          items: ['🌱', '🌿', '🍃', '🍀', '✨', '🪴'],
          direction: 'up',
          color: 'rgba(52, 211, 153, 0.9)'
        };
      case 'graduation':
        return {
          type: 'triumph',
          count: 36,
          items: ['🎓', '📜', '⭐', '✨', '🏆', '🥇'],
          direction: 'down',
          color: 'rgba(250, 204, 21, 0.9)'
        };
      case 'guatemala':
        return {
          type: 'patria',
          count: 36,
          items: ['🇬🇹', '🕊️', '🌿', '✨', '🪶', '🏔️'],
          direction: 'up',
          color: 'rgba(56, 189, 248, 0.9)'
        };
      case 'christmas':
        return {
          type: 'christmas',
          count: 38,
          items: ['🎄', '🔔', '⭐', '❄️', '✨', '🎁'],
          direction: 'down',
          color: 'rgba(239, 68, 68, 0.9)'
        };
      case 'newyear':
        return {
          type: 'sparkles',
          count: 38,
          items: ['✨', '🥂', '🎆', '⭐', '🍾', '🎇'],
          direction: 'up',
          color: 'rgba(253, 224, 71, 0.95)'
        };
      case 'anniversary':
        return {
          type: 'gala',
          count: 36,
          items: ['👑', '💎', '⭐', '✨', '💜', '⚜️'],
          direction: 'up',
          color: 'rgba(192, 132, 252, 0.95)'
        };
      default:
        return {
          type: 'sparkles',
          count: 36,
          items: ['✨', '✦', '✧', '⋆', '•'],
          direction: 'up',
          color: 'rgba(129, 140, 248, 0.9)'
        };
    }
  }, [activeTheme]);

  const count = themeParticlesConfig?.count || 36;

  // Generar partículas de bienvenida distribuidas armónicamente por toda la pantalla (incluyendo el centro)
  const particles = useMemo(() => {
    if (!themeParticlesConfig) return [];
    return Array.from({ length: count }, (_, i) => {
      // Repartidas uniformemente en todo el ancho (3% al 97%)
      const leftPosition = Math.round(((i * 7.7) + (i % 5) * 6.3) % 94) + 3;

      return {
        id: i,
        left: leftPosition,
        delay: (i * 0.11).toFixed(2),
        duration: (14 + (i % 5) * 1.8).toFixed(1),
        size: (12 + (i % 4) * 3.2),
        icon: themeParticlesConfig.items[i % themeParticlesConfig.items.length],
        opacity: (0.65 + (i % 3) * 0.12).toFixed(2)
      };
    });
  }, [themeParticlesConfig, count]);

  if (!themeParticlesConfig || particles.length === 0) {
    return null;
  }

  // La lluvia inicial está presente durante los primeros 4.5s y luego se desvanece por completo
  // tanto en modo claro como en modo oscuro
  const isVisible = isShowerBurst;

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
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 1.2s ease'
      }}
    >
      <style>{`
        /* Caída inicial festiva y serena (Zen Float) */
        @keyframes ambientFallZen {
          0% {
            transform: translate3d(0, -50px, 0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: var(--p-opacity, 0.65);
          }
          85% {
            opacity: var(--p-opacity, 0.65);
          }
          100% {
            transform: translate3d(20px, 105vh, 0) rotate(180deg);
            opacity: 0;
          }
        }

        /* Elevación inicial pacífica (Zen Rise) */
        @keyframes ambientRiseZen {
          0% {
            transform: translate3d(0, 105vh, 0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: var(--p-opacity, 0.65);
          }
          85% {
            opacity: var(--p-opacity, 0.65);
          }
          100% {
            transform: translate3d(-20px, -50px, 0) rotate(-180deg);
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
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.12))',
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
