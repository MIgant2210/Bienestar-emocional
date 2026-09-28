import React, { useMemo, useContext, useState, useEffect } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

/**
 * Catálogo de Constelaciones Celestiales y Signos Zodiacales para Modo Oscuro
 * Con posiciones optimizadas en los márgenes exteriores (11% superior / 12% inferior)
 * para que se aprecien en su totalidad sin cortarse ni tapar los módulos del centro.
 */
const CELESTIAL_CONSTELLATIONS = [
  {
    id: 'libra',
    name: '⚖️ Constelación de Libra • La Balanza del Equilibrio',
    isSpecial: true, // ¡Resaltada con fulgor dorado especial!
    position: { top: '11%', right: '2%' },
    width: '230px',
    height: '175px',
    viewBox: '0 0 260 200',
    nodes: [
      [130, 22],  // Fulcro superior
      [130, 80],  // Eje central de apoyo
      [55, 60],   // Brazo izquierdo (Zubenelgenubi)
      [205, 60],  // Brazo derecho (Zubeneschamali)
      [35, 135],  // Plato izquierdo - Extremo 1
      [75, 135],  // Plato izquierdo - Extremo 2
      [55, 155],  // Base plato izquierdo (Brachium)
      [185, 135], // Plato derecho - Extremo 1
      [225, 135], // Plato derecho - Extremo 2
      [205, 155], // Base plato derecho (Zubenelhakrabi)
      [130, 172]  // Base del pedestal
    ],
    lines: [
      [[130, 22], [130, 80]],
      [[130, 80], [130, 172]],
      [[55, 60], [130, 80]],
      [[130, 80], [205, 60]],
      [[55, 60], [35, 135]],
      [[55, 60], [75, 135]],
      [[35, 135], [55, 155]],
      [[75, 135], [55, 155]],
      [[205, 60], [185, 135]],
      [[205, 60], [225, 135]],
      [[185, 135], [205, 155]],
      [[225, 135], [205, 155]]
    ]
  },
  {
    id: 'colibri',
    name: '✦ Constelación Colibrí (Equi)',
    position: { top: '11%', left: '2%' },
    width: '220px',
    height: '165px',
    viewBox: '0 0 240 180',
    nodes: [
      [28, 70], [72, 65], [84, 54], [98, 85], [128, 20],
      [180, 14], [136, 65], [120, 115], [178, 144], [215, 156]
    ],
    lines: [
      [[28, 70], [72, 65]], [[72, 65], [84, 54]], [[72, 65], [98, 85]],
      [[98, 85], [136, 65]], [[136, 65], [128, 20]], [[128, 20], [180, 14]],
      [[98, 85], [120, 115]], [[120, 115], [178, 144]], [[178, 144], [215, 156]]
    ]
  },
  {
    id: 'aries',
    name: '♈ Constelación de Aries (El Carnero)',
    position: { bottom: '12%', left: '2%' },
    width: '200px',
    height: '130px',
    viewBox: '0 0 220 140',
    nodes: [
      [180, 40], [120, 60], [70, 90], [35, 115]
    ],
    lines: [
      [[180, 40], [120, 60]],
      [[120, 60], [70, 90]],
      [[70, 90], [35, 115]]
    ]
  },
  {
    id: 'tauro',
    name: '♉ Constelación de Tauro (El Toro Celestial)',
    position: { top: '11%', right: '2%' },
    width: '220px',
    height: '170px',
    viewBox: '0 0 240 190',
    nodes: [
      [195, 35], [215, 125], [125, 95], [105, 120], [75, 145], [45, 65]
    ],
    lines: [
      [[195, 35], [125, 95]],
      [[215, 125], [105, 120]],
      [[125, 95], [105, 120]],
      [[105, 120], [75, 145]],
      [[125, 95], [45, 65]]
    ]
  },
  {
    id: 'geminis',
    name: '♊ Constelación de Géminis (Los Gemelos)',
    position: { top: '11%', left: '2%' },
    width: '200px',
    height: '210px',
    viewBox: '0 0 220 230',
    nodes: [
      [65, 30], [145, 35], [60, 105], [140, 110], [50, 195], [150, 190]
    ],
    lines: [
      [[65, 30], [145, 35]],
      [[65, 30], [60, 105]],
      [[60, 105], [50, 195]],
      [[145, 35], [140, 110]],
      [[140, 110], [150, 190]],
      [[60, 105], [140, 110]]
    ]
  },
  {
    id: 'cancer',
    name: '♋ Constelación de Cáncer',
    position: { bottom: '12%', right: '2%' },
    width: '180px',
    height: '180px',
    viewBox: '0 0 190 190',
    nodes: [
      [95, 25], [95, 75], [100, 115], [45, 160], [145, 160]
    ],
    lines: [
      [[95, 25], [95, 75]], [[95, 75], [100, 115]],
      [[100, 115], [45, 160]], [[100, 115], [145, 160]]
    ]
  },
  {
    id: 'leo',
    name: '♌ Constelación de Leo (El León)',
    position: { top: '11%', right: '2%' },
    width: '230px',
    height: '155px',
    viewBox: '0 0 250 170',
    nodes: [
      [45, 45], [75, 40], [105, 70], [65, 135], [175, 80], [235, 105], [175, 140]
    ],
    lines: [
      [[45, 45], [75, 40]], [[75, 40], [105, 70]], [[105, 70], [65, 135]],
      [[105, 70], [175, 80]], [[175, 80], [235, 105]], [[235, 105], [175, 140]],
      [[175, 140], [65, 135]]
    ]
  },
  {
    id: 'virgo',
    name: '♍ Constelación de Virgo (La Sabiduría)',
    position: { bottom: '12%', left: '2%' },
    width: '220px',
    height: '190px',
    viewBox: '0 0 240 210',
    nodes: [
      [45, 65], [90, 95], [160, 50], [160, 125], [115, 180]
    ],
    lines: [
      [[45, 65], [90, 95]], [[90, 95], [160, 50]], [[90, 95], [160, 125]],
      [[160, 125], [115, 180]], [[90, 95], [115, 180]]
    ]
  },
  {
    id: 'escorpio',
    name: '♏ Constelación de Escorpio (Antares)',
    position: { top: '11%', left: '2%' },
    width: '200px',
    height: '230px',
    viewBox: '0 0 220 250',
    nodes: [
      [45, 35], [45, 65], [85, 95], [105, 140], [130, 185], [175, 210], [165, 235]
    ],
    lines: [
      [[45, 35], [45, 65]], [[45, 65], [85, 95]], [[85, 95], [105, 140]],
      [[105, 140], [130, 185]], [[130, 185], [175, 210]], [[175, 210], [165, 235]]
    ]
  },
  {
    id: 'sagitario',
    name: '♐ Constelación de Sagitario (La Tetera Cósmica)',
    position: { bottom: '12%', right: '2%' },
    width: '210px',
    height: '165px',
    viewBox: '0 0 230 180',
    nodes: [
      [40, 95], [85, 135], [115, 95], [115, 45], [175, 65], [185, 125]
    ],
    lines: [
      [[40, 95], [85, 135]], [[40, 95], [115, 95]], [[85, 135], [115, 95]],
      [[115, 95], [115, 45]], [[115, 45], [175, 65]], [[115, 95], [185, 125]],
      [[175, 65], [185, 125]], [[85, 135], [185, 125]]
    ]
  },
  {
    id: 'capricornio',
    name: '♑ Constelación de Capricornio',
    position: { top: '11%', right: '2%' },
    width: '220px',
    height: '150px',
    viewBox: '0 0 240 160',
    nodes: [
      [35, 45], [55, 65], [125, 135], [185, 75], [215, 55]
    ],
    lines: [
      [[35, 45], [55, 65]], [[55, 65], [125, 135]],
      [[125, 135], [185, 75]], [[185, 75], [215, 55]],
      [[35, 45], [215, 55]]
    ]
  },
  {
    id: 'acuario',
    name: '♒ Constelación de Acuario (El Portador)',
    position: { bottom: '12%', left: '2%' },
    width: '220px',
    height: '165px',
    viewBox: '0 0 240 180',
    nodes: [
      [85, 40], [135, 45], [175, 65], [195, 55], [150, 110], [125, 140], [95, 165]
    ],
    lines: [
      [[85, 40], [135, 45]], [[135, 45], [175, 65]], [[175, 65], [195, 55]],
      [[175, 65], [150, 110]], [[150, 110], [125, 140]], [[125, 140], [95, 165]]
    ]
  },
  {
    id: 'piscis',
    name: '♓ Constelación de Piscis (La Empatía)',
    position: { top: '11%', left: '2%' },
    width: '210px',
    height: '180px',
    viewBox: '0 0 230 200',
    nodes: [
      [55, 165], [40, 115], [35, 65], [110, 155], [165, 145], [195, 125]
    ],
    lines: [
      [[55, 165], [40, 115]], [[40, 115], [35, 65]],
      [[55, 165], [110, 155]], [[110, 155], [165, 145]],
      [[165, 145], [195, 125]]
    ]
  },
  {
    id: 'orion',
    name: '✦ Constelación de Orión (El Guardián)',
    position: { top: '11%', left: '2%' },
    width: '200px',
    height: '220px',
    viewBox: '0 0 210 230',
    nodes: [
      [105, 18], [45, 46], [160, 42], [82, 115], [105, 110],
      [128, 105], [105, 142], [52, 195], [162, 190]
    ],
    lines: [
      [[105, 18], [45, 46]], [[105, 18], [160, 42]], [[45, 46], [82, 115]],
      [[160, 42], [128, 105]], [[82, 115], [105, 110]], [[105, 110], [128, 105]],
      [[105, 110], [105, 142]], [[82, 115], [52, 195]], [[128, 105], [162, 190]],
      [[52, 195], [162, 190]]
    ]
  },
  {
    id: 'casiopea',
    name: '✦ Constelación de Casiopea (La Corona)',
    position: { top: '12%', right: '2%' },
    width: '230px',
    height: '130px',
    viewBox: '0 0 250 140',
    nodes: [
      [25, 110], [75, 45], [130, 85], [185, 35], [232, 85]
    ],
    lines: [
      [[25, 110], [75, 45]], [[75, 45], [130, 85]],
      [[130, 85], [185, 35]], [[185, 35], [232, 85]]
    ]
  },
  {
    id: 'crux',
    name: '✦ Constelación Cruz del Sur',
    position: { bottom: '12%', left: '2%' },
    width: '170px',
    height: '195px',
    viewBox: '0 0 180 210',
    nodes: [
      [90, 24], [90, 184], [32, 104], [148, 96], [122, 130]
    ],
    lines: [
      [[90, 24], [90, 184]], [[32, 104], [148, 96]],
      [[90, 184], [122, 130]], [[122, 130], [148, 96]]
    ]
  },
  {
    id: 'fenix',
    name: '✦ Constelación del Fénix (Resiliencia)',
    position: { bottom: '12%', right: '2%' },
    width: '230px',
    height: '160px',
    viewBox: '0 0 260 180',
    nodes: [
      [130, 22], [130, 74], [82, 54], [18, 34],
      [178, 54], [242, 34], [130, 132], [88, 164], [172, 164]
    ],
    lines: [
      [[130, 22], [130, 74]], [[130, 74], [82, 54]], [[82, 54], [18, 34]],
      [[130, 74], [178, 54]], [[178, 54], [242, 34]], [[130, 74], [130, 132]],
      [[130, 132], [88, 164]], [[130, 132], [172, 164]]
    ]
  }
];

/**
 * Cielo Estrellado Global de EquilibrIA con Constelaciones Zodiacales y Celestiales
 * - En Modo Claro: Destellos elegantes en las orillas; en la zona central de los módulos,
 *   destellitos sutiles que acompañan sin interrumpir la lectura.
 * - En Modo Oscuro: Cielo de estrellas blancas brillantes con halo celestial y
 *   constelaciones zodiacales aleatorias en las esquinas que se aprecian cómodamente.
 */
const StarryBackground = ({ count = 135 }) => {
  const themeCtx = useContext(ThemeContext);
  const activeSwatches = themeCtx?.activeThemeData?.swatches;
  const isDark = themeCtx?.theme === 'dark';

  const [constellationIndex, setConstellationIndex] = useState(0);
  const [constellationActive, setConstellationActive] = useState(false);

  // Ciclo periódico de constelaciones en Modo Oscuro (aleatorias sin repetir la misma consecutivamente)
  // Comienza una vez que la lluvia de bienvenida completa su recorrido (~8.5s)
  useEffect(() => {
    if (!isDark) {
      setConstellationActive(false);
      return;
    }

    const delayTimer = setTimeout(() => {
      setConstellationActive(true);
      setConstellationIndex(Math.floor(Math.random() * CELESTIAL_CONSTELLATIONS.length));
    }, 8500);

    const interval = setInterval(() => {
      setConstellationIndex((prevIndex) => {
        let nextIndex;
        do {
          nextIndex = Math.floor(Math.random() * CELESTIAL_CONSTELLATIONS.length);
        } while (nextIndex === prevIndex && CELESTIAL_CONSTELLATIONS.length > 1);
        return nextIndex;
      });
    }, 12500);

    return () => {
      clearTimeout(delayTimer);
      clearInterval(interval);
    };
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

  // Generar destellos y estrellas distribuidas armónicamente
  const stars = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const top = Math.random() * 98 + 1;
      const left = Math.random() * 98 + 1;

      // Zona central donde se encuentran los módulos y opciones (13% a 87% de ancho)
      const isInsideModules = left >= 13 && left <= 87;

      // En el centro: destellitos sutiles y amigables (1.4 - 2.4px)
      // En las orillas: destellos vibrantes tipo cruz y estrellas con brillo pleno
      const size = isInsideModules 
        ? Math.random() * 1.0 + 1.4 
        : Math.random() * 2.2 + 1.6;

      // En el centro un destellito cada 6 estrellas; en las orillas cada 3
      const isSparkle = isInsideModules ? (i % 6 === 0) : (i % 3 === 0);
      const color = palette[i % palette.length];

      // Opacidad sutil en el centro (0.16 a 0.28) y viva en orillas (0.50 a 0.95)
      const opacity = isInsideModules 
        ? (Math.random() * 0.12 + 0.16).toFixed(2) 
        : (Math.random() * 0.45 + 0.50).toFixed(2);

      return {
        id: i,
        top: `${top.toFixed(1)}%`,
        left: `${left.toFixed(1)}%`,
        size: isSparkle ? (isInsideModules ? size + 1.2 : Math.max(size + 1.8, 4.4)) : size,
        duration: `${(Math.random() * 2.5 + 2.5).toFixed(1)}s`,
        delay: `${(Math.random() * 4).toFixed(1)}s`,
        opacity,
        isSparkle,
        isInsideModules,
        color
      };
    });
  }, [count, palette]);

  const currentConstellation = CELESTIAL_CONSTELLATIONS[constellationIndex];
  const isLibra = currentConstellation?.isSpecial;

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
          70% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          85% {
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
            stroke-dashoffset: 220;
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
            transform: scale(1.45);
            opacity: 1;
          }
        }

        /* Destello especial de Libra */
        @keyframes libraFulcrumGlow {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 6px #fde047) drop-shadow(0 0 12px #eab308);
          }
          50% {
            transform: scale(1.6);
            filter: drop-shadow(0 0 10px #ffffff) drop-shadow(0 0 22px #fde047);
          }
        }

        /* Destellitos sutiles dentro de los módulos: elegantes, descansados y sin estorbar */
        .star-node.star-module-subtle {
          box-shadow: 0 0 3px var(--star-color, var(--primary)), 0 0 7px var(--star-color, var(--primary)) !important;
        }

        .star-node.star-sparkle.star-module-subtle::before,
        .star-node.star-sparkle.star-module-subtle::after {
          width: 7px !important;
          height: 1.5px !important;
          box-shadow: 0 0 3px var(--star-color, var(--primary)) !important;
        }

        .star-node.star-sparkle.star-module-subtle::after {
          width: 1.5px !important;
          height: 7px !important;
        }

        [data-theme='dark'] .star-node.star-module-subtle {
          box-shadow: 0 0 3px rgba(255, 255, 255, 0.6) !important;
        }
      `}</style>

      {/* Capa de Estrellas Base (Destellitos sutiles en el centro de módulos, vivas en orillas) */}
      {stars.map((star) => (
        <div
          key={star.id}
          className={`star-node ${star.isSparkle ? 'star-sparkle' : ''} ${star.isInsideModules ? 'star-module-subtle' : ''}`}
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

      {/* Capa de Constelaciones Zodiacales & Celestiales en Modo Oscuro */}
      {isDark && constellationActive && currentConstellation && (
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
            animation: 'constellationAppearance 12s ease-in-out infinite',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <svg
            width="100%"
            height="100%"
            viewBox={currentConstellation.viewBox}
            style={{ 
              overflow: 'visible', 
              filter: isLibra 
                ? 'drop-shadow(0 0 10px rgba(250, 204, 21, 0.85))' 
                : 'drop-shadow(0 0 8px rgba(165, 180, 252, 0.7))' 
            }}
          >
            {/* Líneas tenues que conectan las estrellas */}
            {currentConstellation.lines.map(([p1, p2], idx) => (
              <line
                key={`line-${idx}`}
                x1={p1[0]}
                y1={p1[1]}
                x2={p2[0]}
                y2={p2[1]}
                stroke={isLibra ? 'rgba(253, 224, 71, 0.78)' : 'rgba(224, 231, 255, 0.65)'}
                strokeWidth={isLibra ? '1.8' : '1.5'}
                strokeDasharray="220"
                style={{
                  animation: 'drawCelestialLine 1.8s ease-out forwards',
                  animationDelay: `${idx * 0.08}s`,
                  strokeLinecap: 'round'
                }}
              />
            ))}

            {/* Estrellas nodo brillantes */}
            {currentConstellation.nodes.map(([x, y], idx) => {
              const isFulcrum = isLibra && idx === 0;
              return (
                <g key={`node-${idx}`} transform={`translate(${x}, ${y})`}>
                  <circle
                    r={isFulcrum ? '4.8' : '3.4'}
                    fill={isLibra ? '#fef08a' : '#ffffff'}
                    style={{
                      filter: isLibra 
                        ? 'drop-shadow(0 0 8px #fde047) drop-shadow(0 0 16px #eab308)' 
                        : 'drop-shadow(0 0 6px #ffffff) drop-shadow(0 0 12px rgba(199, 210, 254, 0.9))',
                      animation: isFulcrum 
                        ? 'libraFulcrumGlow 2s infinite ease-in-out' 
                        : `constellationStarPulse ${2.5 + (idx % 3) * 0.5}s infinite ease-in-out`,
                      animationDelay: `${idx * 0.12}s`
                    }}
                  />
                  {(idx % 2 === 0 || isFulcrum) && (
                    <circle
                      r={isFulcrum ? '10' : '7.5'}
                      fill="none"
                      stroke={isLibra ? 'rgba(250, 204, 21, 0.5)' : 'rgba(255, 255, 255, 0.35)'}
                      strokeWidth="0.8"
                      strokeDasharray={isFulcrum ? 'none' : '3 2'}
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Etiqueta mística con el nombre de la constelación */}
          <div
            style={{
              marginTop: '4px',
              padding: isLibra ? '4px 14px' : '3px 10px',
              borderRadius: '12px',
              background: isLibra ? 'rgba(30, 27, 75, 0.75)' : 'rgba(15, 23, 42, 0.55)',
              backdropFilter: 'blur(8px)',
              border: isLibra ? '1px solid rgba(250, 204, 21, 0.6)' : '1px solid rgba(165, 180, 252, 0.25)',
              boxShadow: isLibra 
                ? '0 0 18px rgba(250, 204, 21, 0.4), 0 0 8px rgba(99, 102, 241, 0.3)' 
                : '0 0 12px rgba(99, 102, 241, 0.25)'
            }}
          >
            <span
              style={{
                fontSize: isLibra ? '11px' : '10.5px',
                fontWeight: isLibra ? '700' : '600',
                letterSpacing: '1.2px',
                color: isLibra ? '#fef08a' : '#e0e7ff',
                textTransform: 'uppercase',
                textShadow: isLibra 
                  ? '0 0 10px rgba(250, 204, 21, 0.9)' 
                  : '0 0 8px rgba(165, 180, 252, 0.8)'
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
