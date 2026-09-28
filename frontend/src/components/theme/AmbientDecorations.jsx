import React, { useContext, useMemo, useState, useEffect } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';

/**
 * Decoraciones Ambientales y Lluvia Temática de EquilibrIA
 * - Al entrar, recargar o cambiar de tema/modo:
 *   Despliega una lluvia inicial festiva por TODA la pantalla (incluyendo el centro) durante 4.5 segundos.
 * - Después de los 4.5 segundos:
 *   - En Modo Oscuro: Se desvanece por completo para dejar el cielo nocturno con estrellas puras y constelaciones.
 *   - En Modo Claro: El centro se limpia al 100%, pero en las ORILLAS (márgenes laterales) siguen flotando
 *     los emojis de la temática como destellos sutiles, fusionándose con las estrellas de fondo.
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
          items: ['✨', '✦', '✧', '⋆', '•'],
          direction: 'up',
          color: 'rgba(129, 140, 248, 0.9)'
        };
      case 'winter':
        return {
          type: 'snow',
          items: ['❄️', '❅', '❆', '✨', '🤍', '·'],
          direction: 'down',
          color: 'rgba(186, 230, 253, 0.9)'
        };
      case 'spring':
        return {
          type: 'petals',
          items: ['🌸', '💮', '🌷', '✨', '🍃', '🌺'],
          direction: 'down',
          color: 'rgba(244, 114, 182, 0.9)'
        };
      case 'autumn':
        return {
          type: 'leaves',
          items: ['🍂', '🍁', '🌰', '✨', '🌾', '🧡'],
          direction: 'down',
          color: 'rgba(249, 115, 22, 0.9)'
        };
      case 'summer':
        return {
          type: 'sunbeams',
          items: ['☀️', '✨', '🌴', '🌊', '💛', '🏖️'],
          direction: 'up',
          color: 'rgba(250, 204, 21, 0.85)'
        };
      case 'halloween':
        return {
          type: 'magic',
          items: ['🎃', '🦇', '✨', '🔮', '🌙', '🕸️'],
          direction: 'up',
          color: 'rgba(251, 146, 60, 0.9)'
        };
      case 'birthday':
        return {
          type: 'confetti',
          items: ['🎉', '🎈', '⭐', '🎊', '✨', '🍰'],
          direction: 'down',
          color: 'rgba(236, 72, 153, 0.9)'
        };
      case 'valentines':
        return {
          type: 'hearts',
          items: ['💗', '💖', '💕', '✨', '🌸', '💘'],
          direction: 'up',
          color: 'rgba(244, 63, 94, 0.9)'
        };
      case 'environment':
        return {
          type: 'nature',
          items: ['🌱', '🌿', '🍃', '🍀', '✨', '🪴'],
          direction: 'up',
          color: 'rgba(52, 211, 153, 0.9)'
        };
      case 'graduation':
        return {
          type: 'triumph',
          items: ['🎓', '📜', '⭐', '✨', '🏆', '🥇'],
          direction: 'down',
          color: 'rgba(250, 204, 21, 0.9)'
        };
      case 'guatemala':
        return {
          type: 'patria',
          items: ['🇬🇹', '🕊️', '🌿', '✨', '🪶', '🏔️'],
          direction: 'up',
          color: 'rgba(56, 189, 248, 0.9)'
        };
      case 'christmas':
        return {
          type: 'christmas',
          items: ['🎄', '🔔', '⭐', '❄️', '✨', '🎁'],
          direction: 'down',
          color: 'rgba(239, 68, 68, 0.9)'
        };
      case 'newyear':
        return {
          type: 'sparkles',
          items: ['✨', '🥂', '🎆', '⭐', '🍾', '🎇'],
          direction: 'up',
          color: 'rgba(253, 224, 71, 0.95)'
        };
      case 'anniversary':
        return {
          type: 'gala',
          items: ['👑', '💎', '⭐', '✨', '💜', '⚜️'],
          direction: 'up',
          color: 'rgba(192, 132, 252, 0.95)'
        };
      default:
        return {
          type: 'sparkles',
          items: ['✨', '✦', '✧', '⋆', '•'],
          direction: 'up',
          color: 'rgba(129, 140, 248, 0.9)'
        };
    }
  }, [activeTheme]);

  const count = isShowerBurst ? 36 : 18;

  // Generar partículas: durante la lluvia inicial en toda la pantalla; luego solo en las orillas
  const particles = useMemo(() => {
    if (!themeParticlesConfig) return [];
    return Array.from({ length: count }, (_, i) => {
      let leftPosition;

      if (isShowerBurst) {
        // Lluvia inicial: distribuida armónicamente por toda la pantalla (3% al 97%)
        leftPosition = Math.round(((i * 7.7) + (i % 5) * 6.3) % 94) + 3;
      } else {
        // En modo continuo (Modo Claro): 50% en orilla izquierda (1.5% a 11.5%), 50% en orilla derecha (88.5% a 98.5%)
        const isLeftFlank = i % 2 === 0;
        leftPosition = isLeftFlank
          ? Math.round(((i * 2.9) % 10) + 1.5)
          : Math.round(((i * 2.9) % 10) + 88.5);
      }

      return {
        id: i,
        left: leftPosition,
        delay: isShowerBurst ? (i * 0.11).toFixed(2) : (i * 0.9).toFixed(2),
        duration: isShowerBurst ? (14 + (i % 5) * 1.8).toFixed(1) : (18 + (i % 5) * 2.2).toFixed(1),
        size: isShowerBurst ? (12 + (i % 4) * 3.2) : (11 + (i % 4) * 2.8),
        icon: themeParticlesConfig.items[i % themeParticlesConfig.items.length],
        // En las orillas tienen opacidad suave tipo destello para mezclarse con las estrellas
        opacity: isShowerBurst 
          ? (0.65 + (i % 3) * 0.12).toFixed(2) 
          : (0.38 + (i % 3) * 0.08).toFixed(2)
      };
    });
  }, [themeParticlesConfig, count, isShowerBurst]);

  if (!themeParticlesConfig || particles.length === 0) {
    return null;
  }

  // En Modo Oscuro, tras los 4.5s iniciales se oculta para dejar las estrellas puras y constelaciones.
  // En Modo Claro, permanece visible (en los lados con destellos y emojis de la temática).
  const isVisible = isShowerBurst || !isDark;

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
        /* Caída lenta y serena (Zen Float) */
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

        /* Elevación pacífica (Zen Rise) */
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
          key={`${p.id}-${isShowerBurst ? 'burst' : 'flank'}`}
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
