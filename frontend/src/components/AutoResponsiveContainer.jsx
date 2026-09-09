import React, { useRef, useState, useEffect } from 'react';
import { ResponsiveContainer } from 'recharts';

/**
 * Contenedor ultra-robusto para gráficas de Recharts.
 * Resuelve el problema común donde ResponsiveContainer calcula width=0 en
 * CSS Grid, Flexbox, vistas móviles o cuando se cambia de pestaña.
 */
const AutoResponsiveContainer = ({ children, height = 250, minHeight = 200, className = '' }) => {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth > 0) {
      return Math.min(Math.max(window.innerWidth - 48, 280), 1200);
    }
    return 320;
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const measure = () => {
      if (containerRef.current) {
        const measured = containerRef.current.clientWidth || 
          Math.floor(containerRef.current.getBoundingClientRect().width);
        if (measured > 0 && Math.abs(measured - containerWidth) > 2) {
          setContainerWidth(measured);
        }
      }
    };

    measure();

    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        measure();
      });
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', measure);
    const timer1 = setTimeout(measure, 50);
    const timer2 = setTimeout(measure, 200);
    const timer3 = setTimeout(measure, 600);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', measure);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [containerWidth]);

  return (
    <div
      ref={containerRef}
      className={`chart-container-responsive ${className}`}
      style={{
        width: '100%',
        minWidth: 0,
        height,
        minHeight,
        position: 'relative',
        display: 'block'
      }}
    >
      <ResponsiveContainer width={containerWidth} height={height} key={`rc-${containerWidth}`}>
        {children}
      </ResponsiveContainer>
    </div>
  );
};

export default AutoResponsiveContainer;
