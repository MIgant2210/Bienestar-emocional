import React, { useMemo } from 'react';

const StarryBackground = ({ isLogin = false }) => {
  const systemColors = [
    '#6366f1', // Indigo Primary
    '#8b5cf6', // Violet Accent
    '#ec4899', // Rose Pink
    '#10b981', // Emerald Mint
    '#f59e0b', // Golden Amber
    '#3b82f6'  // Sky Blue
  ];

  // Generar destellos de colores distribuidos en pantalla completa y orillas del sistema
  const stars = useMemo(() => {
    return Array.from({ length: 120 }, (_, i) => {
      let top, left;

      if (isLogin) {
        // En la pantalla de Login se distribuyen en toda la pantalla
        top = Math.random() * 98 + 1;
        left = Math.random() * 98 + 1;
      } else {
        // En los paneles del sistema, mayor concentración en orillas y cobertura constante
        const edgeChoice = Math.random();
        if (edgeChoice < 0.40) {
          // Orilla Izquierda (1% a 15%)
          left = Math.random() * 14 + 1;
          top = Math.random() * 98 + 1;
        } else if (edgeChoice < 0.80) {
          // Orilla Derecha (85% a 99%)
          left = Math.random() * 14 + 85;
          top = Math.random() * 98 + 1;
        } else if (edgeChoice < 0.90) {
          // Orilla Superior (1% a 10%)
          left = Math.random() * 98 + 1;
          top = Math.random() * 9 + 1;
        } else {
          // Orilla Inferior (90% a 99%)
          left = Math.random() * 98 + 1;
          top = Math.random() * 9 + 90;
        }
      }

      const size = Math.random() * 3.2 + 1.8;
      const isSparkle = i % 3 === 0; // 1 de cada 3 es un destello en cruz
      const color = systemColors[i % systemColors.length];

      return {
        id: i,
        top: `${top.toFixed(1)}%`,
        left: `${left.toFixed(1)}%`,
        size: isSparkle ? Math.max(size, 3.5) : size,
        duration: `${(Math.random() * 3 + 2).toFixed(1)}s`,
        delay: `${(Math.random() * 4).toFixed(1)}s`,
        opacity: (Math.random() * 0.4 + 0.45).toFixed(2),
        isSparkle,
        color
      };
    });
  }, [isLogin]);

  return (
    <div className={`starry-sky-container ${isLogin ? 'is-login' : ''}`}>
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
    </div>
  );
};

export default StarryBackground;
