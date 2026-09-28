import React, { useContext, useMemo, useState, useEffect } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';

/**
 * Decoraciones Ambientales y Lluvia Temática de EquilibrIA
 * - En Modo Claro: Lluvia inicial abundante (4.5s) y luego flotación continua y serena de destellos/elementos temáticos.
 * - En Modo Oscuro: Lluvia inicial temática (4.5s) al entrar o cambiar de tema/modo, que luego se desvanece suavemente
 *   para dejar el cielo de estrellas blancas puras y constelaciones.
 * - Distribución perimetral: Las partículas se concentran en las orillas y márgenes laterales (izq/der)
 *   para no estorbar los módulos centrales ni la lectura.
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
    }, 4500); // 4.5 segundos de lluvia suave
    return () => clearTimeout(timer);
  }, [activeTheme, isDark]);

  // Configuración de elementos según temática
  const themeParticlesConfig = useMemo(() => {
    switch (activeTheme) {
      case 'equilibria':
        return {
          type: 'sparkles',
          burstCount: 36,
          calmCount: 20,
          items: ['✨', '✦', '✧', '⋆', '•'],
          direction: 'up',
          color: 'rgba(129, 140, 248, 0.9)'
        };
      case 'winter':
        return {
          type: 'snow',
          burstCount: 38,
          calmCount: 22,
          items: ['❄️', '❅', '❆', '✨', '🤍', '·'],
          direction: 'down',
          color: 'rgba(186, 230, 253, 0.9)'
        };
      case 'spring':
        return {
          type: 'petals',
          burstCount: 38,
          calmCount: 22,
          items: ['🌸', '💮', '🌷', '✨', '🍃', '🌺'],
          direction: 'down',
          color: 'rgba(244, 114, 182, 0.9)'
        };
      case 'autumn':
        return {
          type: 'leaves',
          burstCount: 36,
          calmCount: 20,
          items: ['🍂', '🍁', '🌰', '✨', '🌾', '🧡'],
          direction: 'down',
          color: 'rgba(249, 115, 22, 0.9)'
        };
      case 'summer':
        return {
          type: 'sunbeams',
          burstCount: 36,
          calmCount: 20,
          items: ['☀️', '✨', '🌴', '🌊', '💛', '🏖️'],
          direction: 'up',
          color: 'rgba(250, 204, 21, 0.85)'
        };
      case 'halloween':
        return {
          type: 'magic',
          burstCount: 36,
          calmCount: 20,
          items: ['🎃', '🦇', '✨', '🔮', '🌙', '🕸️'],
          direction: 'up',
          color: 'rgba(251, 146, 60, 0.9)'
        };
      case 'birthday':
        return {
          type: 'confetti',
          burstCount: 38,
          calmCount: 22,
          items: ['🎉', '🎈', '⭐', '🎊', '✨', '🍰'],
          direction: 'down',
          color: 'rgba(236, 72, 153, 0.9)'
        };
      case 'valentines':
        return {
          type: 'hearts',
          burstCount: 36,
          calmCount: 20,
          items: ['💗', '💖', '💕', '✨', '🌸', '💘'],
          direction: 'up',
          color: 'rgba(244, 63, 94, 0.9)'
        };
      case 'environment':
        return {
          type: 'nature',
          burstCount: 36,
          calmCount: 20,
          items: ['🌱', '🌿', '🍃', '🍀', '✨', '🪴'],
          direction: 'up',
          color: 'rgba(52, 211, 153, 0.9)'
        };
      case 'graduation':
        return {
          type: 'triumph',
          burstCount: 36,
          calmCount: 20,
          items: ['🎓', '📜', '⭐', '✨', '🏆', '🥇'],
          direction: 'down',
          color: 'rgba(250, 204, 21, 0.9)'
        };
      case 'guatemala':
        return {
          type: 'patria',
          burstCount: 36,
          calmCount: 20,
          items: ['🇬🇹', '🕊️', '🌿', '✨', '🪶', '🏔️'],
          direction: 'up',
          color: 'rgba(56, 189, 248, 0.9)'
        };
      case 'christmas':
        return {
          type: 'christmas',
          burstCount: 38,
          calmCount: 22,
          items: ['🎄', '🔔', '⭐', '❄️', '✨', '🎁'],
          direction: 'down',
          color: 'rgba(239, 68, 68, 0.9)'
        };
      case 'newyear':
        return {
          type: 'sparkles',
          burstCount: 38,
          calmCount: 22,
          items: ['✨', '🥂', '🎆', '⭐', '🍾', '🎇'],
          direction: 'up',
          color: 'rgba(253, 224, 71, 0.95)'
        };
      case 'anniversary':
        return {
          type: 'gala',
          burstCount: 36,
          calmCount: 20,
          items: ['👑', '💎', '⭐', '✨', '💜', '⚜️'],
          direction: 'up',
          color: 'rgba(192, 132, 252, 0.95)'
        };
      default:
        return {
          type: 'sparkles',
          burstCount: 36,
          calmCount: 20,
          items: ['✨', '✦', '✧', '⋆', '•'],
          direction: 'up',
          color: 'rgba(129, 140, 248, 0.9)'
        };
    }
  }, [activeTheme]);

  const count = isShowerBurst 
    ? (themeParticlesConfig?.burstCount || 36) 
    : (themeParticlesConfig?.calmCount || 20);

  // Generar partículas ubicadas en las orillas (laterales 1-17% y 83-99%) para NO estorbar los módulos del centro
  const particles = useMemo(() => {
    if (!themeParticlesConfig) return [];
    return Array.from({ length: count }, (_, i) => {
      // 50% en el lateral izquierdo, 50% en el lateral derecho
      const isLeftFlank = i % 2 === 0;
      const flankPosition = isLeftFlank
        ? Math.round(((i * 3.7) % 15) + 1.5) // Entre 1.5% y 16.5% de ancho (orilla izquierda)
        : Math.round(((i * 3.7) % 15) + 83.5); // Entre 83.5% y 98.5% de ancho (orilla derecha)

      return {
        id: i,
        left: flankPosition,
        delay: isShowerBurst ? (i * 0.12).toFixed(2) : (i * 0.8).toFixed(2),
        duration: (17 + (i % 6) * 1.8).toFixed(1),
        size: (11 + (i % 4) * 3.2),
        icon: themeParticlesConfig.items[i % themeParticlesConfig.items.length],
        opacity: isShowerBurst ? (0.65 + (i % 3) * 0.12).toFixed(2) : (0.42 + (i % 4) * 0.08).toFixed(2)
      };
    });
  }, [themeParticlesConfig, count, isShowerBurst]);

  if (!themeParticlesConfig || particles.length === 0) {
    return null;
  }

  // En modo oscuro y sin lluvia de bienvenida, se oculta suavemente
  const isVisible = !(isDark && !isShowerBurst);

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
        /* Caída lenta y serena en las orillas (Zen Float) */
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
            transform: translate3d(20px, 105vh, 0) rotate(180deg);
            opacity: 0;
          }
        }

        /* Elevación lenta y pacífica en las orillas (Zen Rise) */
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
