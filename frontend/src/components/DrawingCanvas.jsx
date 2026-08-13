import React, { useRef, useState, useEffect } from 'react';
import { Palette, RotateCcw, Eraser, CheckCircle2 } from 'lucide-react';

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
    canvas.width = rect.width * 2;
    canvas.height = 240 * 2;
    ctx.scale(2, 2);
    
    // Fondo blanco suave inicial
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, 240);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Si ya existía un dibujo guardado, cargarlo
    if (savedImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, 240);
        setHasDrawn(true);
      };
      img.src = savedImage;
    }
  }, []);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const coords = getCoordinates(e);
    
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const coords = getCoordinates(e);

    ctx.strokeStyle = isEraser ? '#ffffff' : color;
    ctx.lineWidth = isEraser ? lineWidth * 3 : lineWidth;
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
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
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, 240);
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
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      borderRadius: '16px',
      border: '2px solid var(--border)',
      padding: '16px',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
        <span style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Palette size={15} />
          Lienzo Interactivo de Expresión Gráfica Canvas
        </span>

        {/* Herramientas de Pincel y Paleta */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {colorsList.map(c => (
            <button
              key={c.hex}
              type="button"
              onClick={() => { setColor(c.hex); setIsEraser(false); }}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: c.hex,
                border: color === c.hex && !isEraser ? '2.5px solid var(--text-primary)' : '1px solid var(--border)',
                cursor: 'pointer',
                transform: color === c.hex && !isEraser ? 'scale(1.15)' : 'scale(1)',
                transition: 'transform 0.2s ease'
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

      <div style={{ position: 'relative', width: '100%', height: '240px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{
            width: '100%',
            height: '240px',
            touchAction: 'none',
            cursor: isEraser ? 'cell' : 'crosshair',
            backgroundColor: '#ffffff'
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
            color: '#94a3b8',
            fontSize: '13px',
            fontWeight: '600'
          }}>
            ✏️ Dibuja aquí libremente con tu mouse o pantalla táctil
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
