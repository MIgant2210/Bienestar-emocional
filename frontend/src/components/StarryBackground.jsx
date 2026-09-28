import React, { useMemo, useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

/**
 * Catálogo de Constelaciones Celestiales para Modo Oscuro
 * Se ubican en las esquinas y orillas de la pantalla para no interferir con formularios ni tarjetas.
 */
const CELESTIAL_CONSTELLATIONS = [
  {
    id: 'colibri',
    name: '✦ Constelación Colibrí (Equi)',
    position: { top: '8%', right: '6%' },
    width: '240px',
    height: '180px',
    viewBox: '0 0 240 180',
    nodes: [
      [28, 70],   // Pico
      [72, 65],   // Cabeza
      [84, 54],   // Ojo
      [98, 85],   // Pecho
      [128, 20],  // Ala Sup
      [180, 14],  // Punta Ala
      [136, 65],  // Ala Media
      [120, 115], // Vientre
      [178, 144], // Cola 1
      [215, 156]  // Cola 2
    ],
    lines: [
      [[28, 70], [72, 65]],
      [[72, 65], [84, 54]],
      [[72, 65], [98, 85]],
      [[98, 85], [136, 65]],
      [[136, 65], [128, 20]],
      [[128, 20], [180, 14]],
      [[98, 85], [120, 115]],
      [[120, 115], [178, 144]],
      [[178, 144], [215, 156]]
    ]
  },
  {
    id: 'orion',
    name: '✦ Constelación de Orión',
    position: { top: '9%', left: '5%' },
    width: '210px',
    height: '230px',
    viewBox: '0 0 210 230',
    nodes: [
      [105, 18],  // Corona / Cabeza
      [45, 46],   // Betelgeuse (Hombro Izq)
      [160, 42],  // Bellatrix (Hombro Der)
      [82, 115],  // Alnitak (Cinturón)
      [105, 110], // Alnilam (Cinturón)
      [128, 105], // Mintaka (Cinturón)
      [105, 142], // Nebulosa de la Espada
      [52, 195],  // Saiph (Pie Izq)
      [162, 190]  // Rigel (Pie Der)
    ],
    lines: [
      [[105, 18], [45, 46]],
      [[105, 18], [160, 42]],
      [[45, 46], [82, 115]],
      [[160, 42], [128, 105]],
      [[82, 115], [105, 110]],
      [[105, 110], [128, 105]],
      [[105, 110], [105, 142]],
      [[82, 115], [52, 195]],
      [[128, 105], [162, 190]],
      [[52, 195], [162, 190]]
    ]
  },
  {
    id: 'casiopea',
    name: '✦ Constelación de Casiopea',
    position: { top: '11%', right: '7%' },
    width: '250px',
    height: '140px',
    viewBox: '0 0 250 140',
    nodes: [
      [25, 110], // Segin
      [75, 45],  // Ruchbah
      [130, 85], // Gamma Cas
      [185, 35], // Schedar
      [232, 85]  // Caph
    ],
    lines: [
      [[25, 110], [75, 45]],
      [[75, 45], [130, 85]],
      [[130, 85], [185, 35]],
      [[185, 35], [232, 85]]
    ]
  },
  {
    id: 'crux',
    name: '✦ Constelación Cruz del Sur',
    position: { bottom: '11%', left: '6%' },
    width: '180px',
    height: '210px',
    viewBox: '0 0 180 210',
    nodes: [
      [90, 24],   // Gacrux
      [90, 184],  // Acrux
      [32, 104],  // Mimosa
      [148, 96],  // Delta Crucis
      [122, 130]  // Epsilon
    ],
    lines: [
      [[90, 24], [90, 184]],
      [[32, 104], [148, 96]],
      [[90, 184], [122, 130]],
      [[122, 130], [148, 96]]
    ]
  },
  {
    id: 'fenix',
    name: '✦ Constelación de la Resiliencia (Fénix)',
    position: { bottom: '10%', right: '6%' },
    width: '260px',
    height: '180px',
    viewBox: '0 0 260 180',
    nodes: [
      [130, 22],  // Cabeza
      [130, 74],  // Corazón
      [82, 54],   // Ala Izq
      [18, 34],   // Punta Ala Izq
      [178, 54],  // Ala Der
      [242, 34],  // Punta Ala Der
      [130, 132], // Centro Cola
      [88, 164],  // Cola Izq
      [172, 164]  // Cola Der
    ],
    lines: [
      [[130, 22], [130, 74]],
      [[130, 74], [82, 54]],
      [[82, 54], [18, 34]],
      [[130, 74], [178, 54]],
      [[178, 54], [242, 34]],
      [[130, 74], [130, 132]],
      [[130, 132], [88, 164]],
      [[130, 132], [172, 164]]
    ]
  }
];

/**
 * Cielo Estrellado Global de EquilibrIA con Constelaciones Mágicas
 * - En Modo Claro: Destellos elegantes en las orillas con los colores de la temática activa.
 * - En Modo Oscuro: Cielo de estrellas blancas brillantes con halo celestial y
 *   constelaciones que se dibujan e iluminan periódicamente en el cielo nocturno.
 */
const StarryBackground = ({ count = 130 }) => {
  const themeCtx = useContext(ThemeContext);
  const activeSwatches = themeCtx?.activeThemeData?.swatches;
  const isDark = themeCtx?.theme === 'dark';

  const [constellationIndex, setConstellationIndex] = useState(0);

  // Ciclo periódico de constelaciones en Modo Oscuro (cada 13 segundos)
  useEffect(() => {
    if (!isDark) return;
    const interval = setInterval(() => {
      setConstellationIndex((prev) => (prev + 1) % CELESTIAL_CONSTELLATIONS.length);
    }, 13000);
    return () => clearInterval(interval);
  }, [isDark]);

  const defaultColors = [
    '#6366f1', // Indigo Primary
    '#8b5cf6', // Violet Accent
    '#ec4899', // Rose Pink
    '#10b981', // Emerald Mint
    '#f59e0b', // Golden Amber
    '#3b82f6'  // Sky Blue
  ];

  const palette = (activeSwatches && activeSwatches.length > 0) ? activeSwatches : defaultColors;

  // Generar destellos y estrellas distribuidas de forma armónica por toda la pantalla
  const stars = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const top = Math.random() * 98 + 1;
      const left = Math.random() * 98 + 1;

      // Variedad de tamaños: estrellas sutiles (1.5 - 2.8px) y destellos en cruz (3.8 - 5px)
      const size = Math.random() * 2.2 + 1.6;
      const isSparkle = i % 4 === 0; // 1 de cada 4 es un destello en cruz
      const color = palette[i % palette.length];

      return {
        id: i,
        top: `${top.toFixed(1)}%`,
        left: `${left.toFixed(1)}%`,
        size: isSparkle ? Math.max(size + 1.6, 4.2) : size,
        duration: `${(Math.random() * 2.5 + 2.5).toFixed(1)}s`,
        delay: `${(Math.random() * 4).toFixed(1)}s`,
        opacity: (Math.random() * 0.45 + 0.45).toFixed(2),
        isSparkle,
        color
      };
    });
  }, [count, palette]);

  const currentConstellation = CELESTIAL_CONSTELLATIONS[constellationIndex];

  return (
    <div className="starry-sky-container" aria-hidden="true">
      <style>{`
        /* Animación suave de ciclo de constelación en Modo Oscuro */
        @keyframes constellationAppearance {
          0% {
            opacity: 0;
            transform: translateY(8px) scale(0.96);
          }
          10% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          68% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          82% {
            opacity: 0;
            transform: translateY(-6px) scale(0.98);
          }
          100% {
            opacity: 0;
            transform: translateY(-6px) scale(0.98);
          }
        }

        /* Trazo de líneas de constelación dibujándose progresivamente */
        @keyframes drawCelestialLine {
          0% {
            stroke-dashoffset: 200;
            opacity: 0;
          }
          20% {
            opacity: 0.85;
          }
          100% {
            stroke-dashoffset: 0;
            opacity: 0.65;
          }
        }

        /* Pulsación radiante de los nodos estelares de la constelación */
        @keyframes constellationStarPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.85;
          }
          50% {
            transform: scale(1.4);
            opacity: 1;
          }
        }
      `}</style>

      {/* Capa de Estrellas Base (Blancas en Modo Oscuro, Coloridas en Modo Claro) */}
      {stars.map((star) => (
        <div
          key={star.id}
          className={`star-node ${star.isSparkle ? 'star-sparkle' : ''}`}
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDuration: star.duration,
            animationDelay: star.delay,
            '--base-opacity': star.opacity,
            '--star-color': star.color
          }}
        />
      ))}

      {/* Capa de Constelaciones Mágicas en Modo Oscuro (Login y Sistema) */}
      {isDark && currentConstellation && (
        <div
          key={`constellation-${currentConstellation.id}-${constellationIndex}`}
          className="constellation-wrapper"
          style={{
            position: 'absolute',
            ...currentConstellation.position,
            width: currentConstellation.width,
            height: currentConstellation.height,
            pointerEvents: 'none',
            zIndex: 2,
            animation: 'constellationAppearance 13s ease-in-out infinite',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <svg
            width="100%"
            height="100%"
            viewBox={currentConstellation.viewBox}
            style={{ overflow: 'visible', filter: 'drop-shadow(0 0 8px rgba(165, 180, 252, 0.7))' }}
          >
            {/* Líneas tenues que conectan las estrellas */}
            {currentConstellation.lines.map(([p1, p2], idx) => (
              <line
                key={`line-${idx}`}
                x1={p1[0]}
                y1={p1[1]}
                x2={p2[0]}
                y2={p2[1]}
                stroke="rgba(224, 231, 255, 0.65)"
                strokeWidth="1.5"
                strokeDasharray="200"
                style={{
                  animation: 'drawCelestialLine 1.8s ease-out forwards',
                  animationDelay: `${idx * 0.1}s`,
                  strokeLinecap: 'round'
                }}
              />
            ))}

            {/* Estrellas nodo brillantes */}
            {currentConstellation.nodes.map(([x, y], idx) => (
              <g key={`node-${idx}`} transform={`translate(${x}, ${y})`}>
                <circle
                  r="3.4"
                  fill="#ffffff"
                  style={{
                    filter: 'drop-shadow(0 0 6px #ffffff) drop-shadow(0 0 12px rgba(199, 210, 254, 0.9))',
                    animation: `constellationStarPulse ${2.5 + (idx % 3) * 0.5}s infinite ease-in-out`,
                    animationDelay: `${idx * 0.15}s`
                  }}
                />
                {idx % 2 === 0 && (
                  <circle
                    r="7.5"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.35)"
                    strokeWidth="0.8"
                    strokeDasharray="3 2"
                  />
                )}
              </g>
            ))}
          </svg>

          {/* Etiqueta mística con el nombre de la constelación */}
          <div
            style={{
              marginTop: '4px',
              padding: '3px 10px',
              borderRadius: '12px',
              background: 'rgba(15, 23, 42, 0.55)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(165, 180, 252, 0.25)',
              boxShadow: '0 0 12px rgba(99, 102, 241, 0.25)'
            }}
          >
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: '600',
                letterSpacing: '1.2px',
                color: '#e0e7ff',
                textTransform: 'uppercase',
                textShadow: '0 0 8px rgba(165, 180, 252, 0.8)'
              }}
            >
              {currentConstellation.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StarryBackground;
