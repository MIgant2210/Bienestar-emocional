import React, { useContext, useMemo, useState, useEffect } from 'react';
import { ThemeContext } from '../../contexts/ThemeContext';

/**
 * Decoraciones Ambientales y Lluvia Temática de EquilibrIA
 * - Cascada de Bienvenida Inicial:
 *   Las partículas recorren la pantalla completa desde arriba hasta abajo (o viceversa)
 *   completando su viaje en 8.5s - 9.0s y desvaneciéndose al cruzar el borde inferior.
 * - Modo Claro:
 *   Al terminar la cascada inicial, el centro queda 100% limpio y despejado; en las orillas
 *   laterales continúan flotando suavemente los emojis de la temática mezclados con destellos.
 * - Modo Oscuro:
 *   Al terminar la cascada inicial, se desvanece por completo dando paso al cielo nocturno puro
 *   y a las constelaciones mágicas aleatorias.
 */
const AmbientDecorations = () => {
  const themeCtx = useContext(ThemeContext);
  const activeTheme = themeCtx?.activeTheme || 'equilibria';
  const isDark = themeCtx?.theme === 'dark';

  // Control de lluvia de bienvenida inicial (dura 8.8s para completar todo el recorrido visual)
  const [isShowerBurst, setIsShowerBurst] = useState(true);

  useEffect(() => {
    setIsShowerBurst(true);
    const timer = setTimeout(() => {
      setIsShowerBurst(false);
    }, 8800); // 8.8 segundos para que todas las partículas lleguen abajo y completen su recorrido
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

  // 1. Partículas de Cascada Inicial (por toda la pantalla, completando su trayectoria)
  const burstParticles = useMemo(() => {
    if (!themeParticlesConfig) return [];
    return Array.from({ length: 36 }, (_, i) => {
      const left = Math.round(((i * 7.7) + (i % 5) * 6.3) % 94) + 3;
      return {
        id: `burst-${i}`,
        left,
        delay: (i * 0.05).toFixed(2), // 0s a 1.8s
        duration: (6.5 + (i % 5) * 0.25).toFixed(2), // 6.5s a 7.5s: completan la caída a tiempo
        size: (12 + (i % 4) * 3.2),
        icon: themeParticlesConfig.items[i % themeParticlesConfig.items.length],
        opacity: (0.65 + (i % 3) * 0.12).toFixed(2)
      };
    });
  }, [themeParticlesConfig]);

  // 2. Partículas Continuas de Orillas para Modo Claro (solo en los márgenes laterales)
  const flankParticles = useMemo(() => {
    if (!themeParticlesConfig || isDark) return [];
    return Array.from({ length: 18 }, (_, i) => {
      const isLeft = i % 2 === 0;
      const left = isLeft
        ? Math.round(((i * 2.9) % 10) + 1.5) // 1.5% a 11.5%
        : Math.round(((i * 2.9) % 10) + 88.5); // 88.5% a 98.5%

      return {
        id: `flank-${i}`,
        left,
        delay: (i * 0.8).toFixed(2),
        duration: (17 + (i % 5) * 1.8).toFixed(1), // Lentas y zen
        size: (11 + (i % 4) * 2.6),
        icon: themeParticlesConfig.items[i % themeParticlesConfig.items.length],
        opacity: (0.38 + (i % 3) * 0.08).toFixed(2) // Sutiles como destellos
      };
    });
  }, [themeParticlesConfig, isDark]);

  if (!themeParticlesConfig) {
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
        /* Recorrido completo de cascada inicial: desde arriba (-70px) hasta salir por abajo (100vh + 80px) */
        @keyframes ambientWaterfallFall {
          0% {
            transform: translate3d(0, -70px, 0) rotate(0deg);
            opacity: 0;
          }
          8% {
            opacity: var(--p-opacity, 0.7);
          }
          75% {
            opacity: var(--p-opacity, 0.7);
          }
          92% {
            opacity: 0.25;
          }
          100% {
            transform: translate3d(25px, calc(100vh + 80px), 0) rotate(210deg);
            opacity: 0;
          }
        }

        /* Recorrido completo de ascenso inicial: desde abajo (100vh + 70px) hasta salir por arriba (-80px) */
        @keyframes ambientWaterfallRise {
          0% {
            transform: translate3d(0, calc(100vh + 70px), 0) rotate(0deg);
            opacity: 0;
          }
          8% {
            opacity: var(--p-opacity, 0.7);
          }
          75% {
            opacity: var(--p-opacity, 0.7);
          }
          92% {
            opacity: 0.25;
          }
          100% {
            transform: translate3d(-25px, -80px, 0) rotate(-210deg);
            opacity: 0;
          }
        }

        /* Flotación continua relajante en las orillas (Modo Claro) */
        @keyframes ambientFlankFall {
          0% {
            transform: translate3d(0, -50px, 0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: var(--p-opacity, 0.45);
          }
          85% {
            opacity: var(--p-opacity, 0.45);
          }
          100% {
            transform: translate3d(18px, 105vh, 0) rotate(180deg);
            opacity: 0;
          }
        }

        @keyframes ambientFlankRise {
          0% {
            transform: translate3d(0, 105vh, 0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: var(--p-opacity, 0.45);
          }
          85% {
            opacity: var(--p-opacity, 0.45);
          }
          100% {
            transform: translate3d(-18px, -50px, 0) rotate(-180deg);
            opacity: 0;
          }
        }

        /* Responsividad Total: Sin obstaculizar textos ni módulos en ninguna pantalla */
        .ambient-burst-layer,
        .ambient-flanks-layer {
          pointer-events: none !important;
          user-select: none !important;
        }

        .ambient-burst-layer span,
        .ambient-flanks-layer span {
          pointer-events: none !important;
          user-select: none !important;
        }

        @media (max-width: 1024px) {
          .ambient-burst-layer span {
            font-size: calc(var(--p-size, 16px) * 0.85) !important;
          }
          .ambient-flanks-layer {
            opacity: 0.75 !important;
          }
          .ambient-flanks-layer span {
            font-size: calc(var(--p-size, 14px) * 0.85) !important;
          }
        }

        @media (max-width: 768px) {
          /* En teléfonos móviles: las partículas de la cascada son más sutiles y pequeñas */
          .ambient-burst-layer span {
            font-size: calc(var(--p-size, 16px) * 0.68) !important;
            opacity: calc(var(--p-opacity, 0.7) * 0.75) !important;
          }
          /* En modo claro en móviles: atenuar los emojis laterales para lectura impecable */
          .ambient-flanks-layer {
            opacity: 0.32 !important;
          }
          .ambient-flanks-layer span {
            font-size: calc(var(--p-size, 14px) * 0.7) !important;
          }
        }
      `}</style>

      {/* Capa 1: Cascada de Bienvenida Inicial (recorre toda la pantalla y sale por el borde) */}
      {isShowerBurst && (
        <div
          className="ambient-burst-layer"
          style={{
            position: 'absolute',
            inset: 0,
            transition: 'opacity 1.5s ease',
            opacity: isShowerBurst ? 1 : 0,
            pointerEvents: 'none'
          }}
        >
          {burstParticles.map(p => (
            <span
              key={p.id}
              style={{
                position: 'absolute',
                left: `${p.left}%`,
                fontSize: `${p.size}px`,
                opacity: p.opacity,
                '--p-opacity': p.opacity,
                '--p-size': `${p.size}px`,
                color: themeParticlesConfig.color,
                animation: isDown 
                  ? `ambientWaterfallFall ${p.duration}s ease-in forwards` 
                  : `ambientWaterfallRise ${p.duration}s ease-in forwards`,
                animationDelay: `${p.delay}s`,
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.12))',
                willChange: 'transform, opacity',
                userSelect: 'none',
                pointerEvents: 'none'
              }}
            >
              {p.icon}
            </span>
          ))}
        </div>
      )}

      {/* Capa 2: Destellos y Emojis Continuos en las Orillas (Exclusivo Modo Claro) */}
      {!isDark && (
        <div
          className="ambient-flanks-layer"
          style={{
            position: 'absolute',
            inset: 0,
            transition: 'opacity 1.5s ease',
            pointerEvents: 'none'
          }}
        >
          {flankParticles.map(p => (
            <span
              key={p.id}
              style={{
                position: 'absolute',
                left: `${p.left}%`,
                fontSize: `${p.size}px`,
                opacity: p.opacity,
                '--p-opacity': p.opacity,
                '--p-size': `${p.size}px`,
                color: themeParticlesConfig.color,
                animation: isDown 
                  ? `ambientFlankFall ${p.duration}s infinite linear` 
                  : `ambientFlankRise ${p.duration}s infinite linear`,
                animationDelay: `${p.delay}s`,
                filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.08))',
                willChange: 'transform, opacity',
                userSelect: 'none',
                pointerEvents: 'none'
              }}
            >
              {p.icon}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default AmbientDecorations;
