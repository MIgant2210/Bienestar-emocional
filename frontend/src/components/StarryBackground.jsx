import React, { useMemo } from 'react';

const StarryBackground = ({ count = 130 }) => {
  const systemColors = [
    '#6366f1', // Indigo Primary
    '#8b5cf6', // Violet Accent
    '#ec4899', // Rose Pink
    '#10b981', // Emerald Mint
    '#f59e0b', // Golden Amber
    '#3b82f6'  // Sky Blue
  ];

  // Generar destellos y estrellas distribuidas de forma armónica por toda la pantalla
  const stars = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const top = Math.random() * 98 + 1;
      const left = Math.random() * 98 + 1;

      // Variedad de tamaños: estrellas sutiles (1.5 - 2.8px) y destellos en cruz (3.8 - 5px)
      const size = Math.random() * 2.2 + 1.6;
      const isSparkle = i % 4 === 0; // 1 de cada 4 es un destello en cruz
      const color = systemColors[i % systemColors.length];

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
  }, [count]);

  return (
    <div className="starry-sky-container" aria-hidden="true">
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

