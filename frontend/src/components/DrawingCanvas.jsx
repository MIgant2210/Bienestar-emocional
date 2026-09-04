import React, { useRef, useState, useEffect } from 'react';
import { Palette, RotateCcw, Eraser, CheckCircle2, PenTool } from 'lucide-react';

const DrawingCanvas = ({ onSaveDrawing, savedImage }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#2563eb');
  const [lineWidth, setLineWidth] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Configurar canvas para alta definición
    const rect = canvas.getBoundingClientRect();
    const displayWidth = rect.width || canvas.offsetWidth || 340;
    const displayHeight = rect.height || canvas.offsetHeight || 220;

    canvas.width = displayWidth * 2;
    canvas.height = displayHeight * 2;
    ctx.scale(2, 2);
    
    // Fondo blanco inicial
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, displayWidth, displayHeight);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Si ya existía un dibujo guardado, cargarlo
    if (savedImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
        setHasDrawn(true);
      };
      img.src = savedImage;
    } else {
      setHasDrawn(false);
    }
  }, [savedImage]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    
    const scaleX = (canvas.width / 2) / (rect.width || 1);
    const scaleY = (canvas.height / 2) / (rect.height || 1);

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Capturar el puntero para trazos continuos fluidos
    if (e.target && e.pointerId !== undefined) {
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch (_) {}
    }

    const ctx = canvas.getContext('2d');
    const coords = getCoordinates(e);
    
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const coords = getCoordinates(e);

    ctx.strokeStyle = isEraser ? '#ffffff' : color;
    ctx.lineWidth = isEraser ? lineWidth * 3 : lineWidth;
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    if (e && e.target && e.pointerId !== undefined) {
      try {
        e.target.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }

    // Guardar imagen como Base64 Data URL
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      if (onSaveDrawing) {
        onSaveDrawing(dataUrl);
      }
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const displayWidth = rect.width || canvas.offsetWidth || 340;
    const displayHeight = rect.height || canvas.offsetHeight || 220;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, displayWidth, displayHeight);
    setHasDrawn(false);
    if (onSaveDrawing) {
      onSaveDrawing('');
    }
  };

  const colorsList = [
    { hex: '#2563eb', label: 'Azul' },
    { hex: '#9333ea', label: 'Morado' },
    { hex: '#16a34a', label: 'Verde' },
    { hex: '#dc2626', label: 'Rojo' },
    { hex: '#eab308', label: 'Amarillo' },
    { hex: '#1e293b', label: 'Oscuro' }
  ];

  return (
    <div className="eval-canvas-card" style={{
      backgroundColor: 'var(--bg-secondary)',
      borderRadius: '16px',
      border: '2px solid var(--border)',
      padding: '16px',
      boxShadow: 'var(--shadow-sm)',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <div className="eval-canvas-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
        <span style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Palette size={15} />
          <span>Lienzo de Expresión Gráfica Canvas</span>
        </span>

        {/* Herramientas de Pincel y Paleta */}
        <div className="eval-canvas-tools" style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          {colorsList.map(c => (
            <button
              key={c.hex}
              type="button"
              onClick={() => { setColor(c.hex); setIsEraser(false); }}
              className="eval-canvas-color-btn"
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: c.hex,
                border: color === c.hex && !isEraser ? '2.5px solid var(--text-primary)' : '1px solid var(--border)',
                cursor: 'pointer',
                transform: color === c.hex && !isEraser ? 'scale(1.15)' : 'scale(1)',
                transition: 'transform 0.2s ease',
                padding: 0
              }}
              title={`Color ${c.label}`}
            />
          ))}

          <button
            type="button"
            onClick={() => setIsEraser(!isEraser)}
            className={`duo-pill ${isEraser ? 'selected' : ''}`}
            style={{ padding: '4px 8px', fontSize: '11px' }}
            title="Borrador"
          >
            <Eraser size={13} />
          </button>

          <button
            type="button"
            onClick={clearCanvas}
            className="duo-pill"
            style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--danger)' }}
            title="Limpiar todo el lienzo"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      <div className="eval-canvas-viewport" style={{ position: 'relative', width: '100%', height: '220px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', boxSizing: 'border-box' }}>
        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          onPointerLeave={stopDrawing}
          style={{
            width: '100%',
            height: '100%',
            touchAction: 'none',
            cursor: isEraser ? 'cell' : 'crosshair',
            backgroundColor: '#ffffff',
            display: 'block'
          }}
        />
        {!hasDrawn && (
          <div style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: '#94a3b8',
            fontSize: '13px',
            fontWeight: '600'
          }}>
            <PenTool size={16} />
            <span>Dibuja aquí libremente con tu mouse o pantalla táctil</span>
          </div>
        )}
      </div>

      {hasDrawn && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', color: 'var(--success)', fontSize: '11.5px', fontWeight: '800' }}>
          <CheckCircle2 size={14} />
          <span>Ilustración capturada y lista para análisis de IA</span>
        </div>
      )}
    </div>
  );
};

export default DrawingCanvas;
