import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  ClipboardList, Image as ImageIcon, Eye, X, ZoomIn, ZoomOut, RotateCcw, 
  Download, CheckCircle2, Smile, AlertCircle, FileText, Sparkles, Brain, 
  HelpCircle, ChevronRight, Layers, Maximize2, Palette
} from 'lucide-react';

/**
 * Función inteligente para parsear textos de respuestas de tests y reflexiones.
 * Extrae título, categoría, preguntas individuales, respuestas, tipos y dibujos base64.
 */
export const parseTestResponse = (rawText) => {
  if (!rawText || typeof rawText !== 'string') {
    return {
      isTest: false,
      title: null,
      category: null,
      questions: [],
      drawingImage: null,
      cleanText: ''
    };
  }

  const text = rawText.trim();
  const isTest = text.includes('[TEST COMPLETADO:') || text.includes('TEST COMPLETADO') || text.includes('| P') || /P\d+\s*\[/.test(text);

  let title = 'Evaluación de Bienestar';
  let category = 'Bienestar Integral';
  let drawingImage = null;
  const questions = [];

  // Extraer Título y Categoría si existen en el encabezado
  const headerMatch = text.match(/\[TEST COMPLETADO:\s*([^\]]+)\]/i);
  if (headerMatch) {
    const fullHeader = headerMatch[1]; // ej: "Evaluación de Bienestar Integral y Prevención de Burnout (Bienestar Integral)"
    const catMatch = fullHeader.match(/\(([^)]+)\)$/);
    if (catMatch) {
      category = catMatch[1].trim();
      title = fullHeader.replace(/\(([^)]+)\)$/, '').trim();
    } else {
      title = fullHeader.trim();
    }
  }

  // Detectar cualquier imagen Base64 presente en el texto
  const base64Match = text.match(/data:image\/(png|jpeg|jpg|webp);base64,[A-Za-z0-9+/=]+/);
  if (base64Match) {
    drawingImage = base64Match[0];
  }

  if (isTest) {
    // Remover encabezado para procesar preguntas
    let questionsText = text.replace(/\[TEST COMPLETADO:[^\]]+\]\s*/i, '');

    // Separar por el delimitador oficial " | P" o buscar patrones "P[0-9]+ ["
    const rawParts = questionsText.split(/\s*\|\s*(?=P\d+\s*\[)/);

    rawParts.forEach((part, index) => {
      const qMatch = part.match(/^P?(\d+)?\s*\[([^\]]+)\]:\s*([\s\S]*)$/);
      if (qMatch) {
        const qNum = qMatch[1] ? `P${qMatch[1]}` : `P${index + 1}`;
        const questionPrompt = qMatch[2].trim();
        let answerVal = qMatch[3].trim();

        const isDrawing = answerVal.startsWith('data:image/') || questionPrompt.toLowerCase().includes('dibuja') || questionPrompt.toLowerCase().includes('boceto');
        let drawingData = null;

        if (isDrawing) {
          if (answerVal.startsWith('data:image/')) {
            drawingData = answerVal;
            if (!drawingImage) drawingImage = drawingData;
            answerVal = '[Boceto / Dibujo cargado por el usuario]';
          }
        }

        // Determinar tipo de respuesta para formateo visual
        let type = 'text';
        if (isDrawing) {
          type = 'drawing';
        } else if (/^(\uD83D[\uDE00-\uDE4F]|Estresado|Agotado|Neutral|Tranquilo|Excelente|Tensi[oó]n|Cansancio|Neutro|Energ[eé]tico|Molesto)/i.test(answerVal)) {
          type = 'emoji';
        } else if (/^\d+(\s*\/\s*10)?$/.test(answerVal) || (!isNaN(Number(answerVal)) && Number(answerVal) <= 10)) {
          type = 'scale';
        } else if (/^(sí|si|no|verdadero|falso)$/i.test(answerVal)) {
          type = 'yesno';
        }

        questions.push({
          number: qNum,
          question: questionPrompt,
          answer: answerVal,
          type,
          isDrawing,
          drawingData
        });
      } else if (part.trim()) {
        questions.push({
          number: `P${index + 1}`,
          question: `Pregunta ${index + 1}`,
          answer: part.replace(/data:image\/[A-Za-z0-9+/=;,-]+/g, '[Dibujo Adjunto]').trim(),
          type: 'text',
          isDrawing: false,
          drawingData: null
        });
      }
    });
  }

  // Texto limpio para previsualizaciones sin mostrar caracteres base64
  const cleanText = text
    .replace(/data:image\/[A-Za-z0-9+/=;,-]+/g, '[Boceto / Dibujo Adjunto]')
    .replace(/\[TEST COMPLETADO:[^\]]+\]\s*/i, '');

  return {
    isTest,
    title,
    category,
    questions,
    drawingImage,
    cleanText
  };
};

/**
 * Modal para visualizar el dibujo/boceto cargado por el usuario en pantalla completa con Portal
 */
export const DrawingViewerModal = ({ isOpen, imageSrc, title = 'Boceto / Dibujo del Usuario', onClose }) => {
  const [zoom, setZoom] = useState(1);

  // Bloquear scroll de fondo cuando el modal esté abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !imageSrc) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = `boceto-equilibria-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const modalContent = (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(5, 7, 15, 0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        animation: 'fadeIn 0.2s ease',
        boxSizing: 'border-box'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="glass-card animate-scale" 
        style={{
          maxWidth: '860px',
          width: '94vw',
          maxHeight: '92vh',
          backgroundColor: 'var(--bg-secondary)',
          border: '2px solid var(--primary)',
          borderRadius: '24px',
          padding: '26px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
          position: 'relative',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        {/* Encabezado del Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '14px',
              backgroundColor: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)'
            }}>
              <ImageIcon size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '900', margin: 0, color: 'var(--text-primary)' }}>{title}</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Boceto libre y expresión gráfica registrada en la evaluación
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar modal de dibujo"
            className="duo-pill"
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: '800',
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <X size={16} />
            <span>Cerrar</span>
          </button>
        </div>

        {/* Barra de Controles: Zoom y Descarga */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              onClick={() => setZoom(prev => Math.min(prev + 0.25, 2.5))}
              className="duo-pill"
              style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '700' }}
              title="Acercar"
            >
              <ZoomIn size={14} />
              <span>Acercar ({Math.round(zoom * 100)}%)</span>
            </button>
            <button
              onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.5))}
              className="duo-pill"
              style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '700' }}
              title="Alejar"
            >
              <ZoomOut size={14} />
              <span>Alejar</span>
            </button>
            <button
              onClick={() => setZoom(1)}
              className="duo-pill"
              style={{ padding: '6px 12px', fontSize: '12px', fontWeight: '700' }}
              title="Restablecer escala original"
            >
              <RotateCcw size={14} />
              <span>100%</span>
            </button>
          </div>

          <button
            onClick={handleDownload}
            className="btn btn-secondary"
            style={{ padding: '7px 16px', fontSize: '12px', borderRadius: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={14} />
            <span>Descargar Boceto PNG</span>
          </button>
        </div>

        {/* Contenedor del Lienzo con Fondo Blanco de Alto Contraste */}
        <div style={{
          flex: 1,
          minHeight: '340px',
          maxHeight: '520px',
          overflow: 'auto',
          backgroundColor: '#090a0f',
          borderRadius: '18px',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          position: 'relative'
        }}>
          <img
            src={imageSrc}
            alt="Boceto cargado por el usuario"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
              transition: 'transform 0.15s ease',
              borderRadius: '12px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
              backgroundColor: '#ffffff',
              border: '2px solid rgba(255,255,255,0.2)'
            }}
          />
        </div>

        {/* Pie del Modal */}
        <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
          <button
            onClick={onClose}
            className="btn btn-primary"
            style={{ padding: '10px 28px', borderRadius: '14px', fontWeight: '900', fontSize: '13px' }}
          >
            Cerrar Pantalla de Dibujo
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

/**
 * Modal Detallado de Respuestas del Test en pantalla completa con Portal
 */
export const TestResponseModal = ({ isOpen, rawText, userName = 'Colaborador', date, onClose }) => {
  const [showDrawingModal, setShowDrawingModal] = useState(false);
  const parsed = parseTestResponse(rawText);

  // Bloquear scroll de fondo cuando el modal esté abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <>
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(5, 7, 15, 0.88)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 999980,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          animation: 'fadeIn 0.2s ease',
          boxSizing: 'border-box'
        }}
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          className="glass-card animate-scale" 
          style={{
            maxWidth: '920px',
            width: '94vw',
            maxHeight: '92vh',
            backgroundColor: 'var(--bg-secondary)',
            border: '2px solid var(--primary)',
            borderRadius: '24px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
            position: 'relative',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}
        >
          {/* Encabezado del Modal */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                flexShrink: 0
              }}>
                <ClipboardList size={24} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '900', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '3px 10px', borderRadius: '8px' }}>
                    {parsed.category}
                  </span>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: '600' }}>
                    {parsed.questions.length} preguntas respondidas
                  </span>
                </div>
                <h3 style={{ fontSize: '19px', fontWeight: '900', margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                  {parsed.title}
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
                  Participante: <strong>{userName}</strong> {date ? `• Fecha de Aplicación: ${new Date(date).toLocaleString()}` : ''}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Cerrar respuestas del test"
              className="duo-pill"
              style={{
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: '800',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flexShrink: 0
              }}
            >
              <X size={16} />
              <span>Cerrar</span>
            </button>
          </div>

          {/* Banner Destacado del Boceto / Dibujo Libre */}
          {parsed.drawingImage && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              borderRadius: '16px',
              backgroundColor: 'var(--primary-light)',
              border: '2px solid var(--primary)',
              marginBottom: '18px',
              flexWrap: 'wrap',
              gap: '12px',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div 
                  onClick={() => setShowDrawingModal(true)}
                  style={{ 
                    width: '54px', 
                    height: '54px', 
                    borderRadius: '10px', 
                    overflow: 'hidden', 
                    border: '2px solid var(--primary)', 
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}
                  title="Haz clic para ver el dibujo en grande"
                >
                  <img src={parsed.drawingImage} alt="Thumbnail boceto" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div>
                  <h4 style={{ fontSize: '13.5px', fontWeight: '900', color: 'var(--primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Palette size={16} />
                    <span>Boceto / Dibujo Libre Registrado</span>
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                    El usuario incluyó una expresión gráfica en su evaluación.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDrawingModal(true)}
                className="btn btn-primary"
                style={{ padding: '8px 18px', fontSize: '12px', borderRadius: '12px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Maximize2 size={14} />
                <span>Ver Dibujo en Pantalla Completa</span>
              </button>
            </div>
          )}

          {/* Lista Ordenada y Espaciosa de Preguntas y Respuestas */}
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px', display: 'grid', gap: '14px' }}>
            {parsed.questions.length === 0 ? (
              <div style={{ padding: '24px', backgroundColor: 'var(--bg-primary)', borderRadius: '16px', fontSize: '13.5px', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                {parsed.cleanText || rawText}
              </div>
            ) : (
              parsed.questions.map((q, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '16px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '900',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      padding: '3px 10px',
                      borderRadius: '8px',
                      color: 'var(--primary)',
                      flexShrink: 0
                    }}>
                      {q.number}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                      {q.question}
                    </span>
                  </div>

                  {/* Renderizado de Respuesta según tipo */}
                  <div style={{ paddingLeft: '4px' }}>
                    {q.isDrawing ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '4px', flexWrap: 'wrap' }}>
                        {parsed.drawingImage && (
                          <div
                            onClick={() => setShowDrawingModal(true)}
                            style={{
                              width: '84px',
                              height: '60px',
                              borderRadius: '10px',
                              overflow: 'hidden',
                              border: '2px solid var(--primary)',
                              cursor: 'pointer',
                              backgroundColor: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                            }}
                            title="Haz clic para ampliar el boceto"
                          >
                            <img src={parsed.drawingImage} alt="Boceto" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowDrawingModal(true)}
                          className="duo-pill"
                          style={{ padding: '8px 16px', fontSize: '12px', fontWeight: '800', color: 'var(--primary)', borderColor: 'var(--primary)', backgroundColor: 'var(--primary-light)' }}
                        >
                          <ImageIcon size={15} />
                          <span>Abrir Visor del Boceto / Dibujo</span>
                        </button>
                      </div>
                    ) : q.type === 'emoji' ? (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 18px',
                        borderRadius: '14px',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        fontSize: '13.5px',
                        fontWeight: '800',
                        color: 'var(--text-primary)'
                      }}>
                        <span style={{ fontSize: '20px' }}>{q.answer.match(/(😫|🙁|😐|🙂|😁|😡|😣|😟|😊|😄|🤩)/)?.[0] || '🙂'}</span>
                        <span>{q.answer.replace(/(😫|🙁|😐|🙂|😁|😡|😣|😟|😊|😄|🤩)/g, '').trim() || q.answer}</span>
                      </div>
                    ) : q.type === 'scale' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '15px',
                          fontWeight: '900',
                          color: Number(q.answer) >= 7 ? 'var(--danger)' : Number(q.answer) <= 3 ? 'var(--success)' : 'var(--primary)',
                          padding: '6px 14px',
                          borderRadius: '10px',
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border)'
                        }}>
                          {q.answer} / 10
                        </span>
                        <div style={{ flex: 1, minWidth: '140px', maxWidth: '220px', height: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: '5px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${(Number(q.answer) / 10) * 100}%`,
                            backgroundColor: Number(q.answer) >= 7 ? 'var(--danger)' : Number(q.answer) <= 3 ? 'var(--success)' : 'var(--primary)',
                            borderRadius: '5px'
                          }} />
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        padding: '10px 14px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--bg-secondary)',
                        fontSize: '13px',
                        color: 'var(--text-primary)',
                        lineHeight: '1.5',
                        borderLeft: '4px solid var(--primary)'
                      }}>
                        "{q.answer}"
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pie del Modal */}
          <div style={{ marginTop: '18px', borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-primary"
              style={{ padding: '10px 30px', borderRadius: '14px', fontWeight: '900', fontSize: '13px' }}
            >
              Cerrar Pantalla de Respuestas
            </button>
          </div>
        </div>
      </div>

      {/* Visor Modal de Dibujo */}
      <DrawingViewerModal
        isOpen={showDrawingModal}
        imageSrc={parsed.drawingImage}
        title={`Boceto de ${userName} - ${parsed.title}`}
        onClose={() => setShowDrawingModal(false)}
      />
    </>
  );

  return createPortal(modalContent, document.body);
};

/**
 * Componente Tarjeta / Visor Integrado para usar en feeds de alertas, historiales, etc.
 * Muestra resumen limpio, botón "Ver Respuestas" y botón "Ver Dibujo" si aplica.
 */
const TestResponseViewer = ({ 
  rawText, 
  userName, 
  date, 
  compact = false, 
  previewOnly = false,
  showActions = true,
  customTitle
}) => {
  const [showResponsesModal, setShowResponsesModal] = useState(false);
  const [showDrawingModal, setShowDrawingModal] = useState(false);

  const parsed = parseTestResponse(rawText);

  // Si no es un test y no tiene imagen, mostrar texto plano normal
  if (!parsed.isTest && !parsed.drawingImage) {
    return (
      <div style={{ fontSize: compact ? '12px' : '12.5px', fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: '1.4' }}>
        "{rawText}"
      </div>
    );
  }

  return (
    <div style={{
      borderRadius: '14px',
      backgroundColor: 'var(--bg-primary)',
      border: '1px solid var(--border)',
      padding: compact ? '10px 12px' : '14px 16px',
      marginTop: '6px',
      marginBottom: '8px'
    }}>
      {/* Encabezado del Test */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '10px',
            fontWeight: '900',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            padding: '2px 8px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <ClipboardList size={12} />
            {parsed.isTest ? 'TEST COMPLETADO' : 'REFLEXIÓN CON DIBUJO'}
          </span>
          <span style={{ fontSize: '12.5px', fontWeight: '800', color: 'var(--text-primary)' }}>
            {customTitle || parsed.title}
          </span>
        </div>

        {parsed.category && parsed.isTest && (
          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: '600' }}>
            {parsed.category}
          </span>
        )}
      </div>

      {/* Resumen breve de preguntas o contenido */}
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: '1.4' }}>
        {parsed.isTest ? (
          <span>
            {parsed.questions.length} respuestas registradas ordenadamente en la evaluación institucional.
          </span>
        ) : (
          <p style={{ margin: 0, fontStyle: 'italic' }}>
            "{parsed.cleanText.slice(0, 140)}{parsed.cleanText.length > 140 ? '...' : ''}"
          </p>
        )}
      </div>

      {/* Botones de Acción */}
      {showActions && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {parsed.isTest && (
            <button
              type="button"
              onClick={() => setShowResponsesModal(true)}
              className="btn btn-secondary"
              style={{ padding: '6px 14px', fontSize: '11.5px', borderRadius: '10px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Eye size={13} />
              <span>Ver Respuestas del Test ({parsed.questions.length})</span>
            </button>
          )}

          {parsed.drawingImage && (
            <button
              type="button"
              onClick={() => setShowDrawingModal(true)}
              className="btn btn-secondary"
              style={{
                fontSize: '12px',
                padding: '6px 14px',
                borderRadius: '10px',
                fontWeight: '800',
                color: 'var(--primary)',
                borderColor: 'var(--primary)',
                backgroundColor: 'var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ImageIcon size={14} />
              <span>Ver Dibujo / Boceto Cargado</span>
            </button>
          )}
        </div>
      )}

      {/* Modal de Respuestas con React Portal */}
      <TestResponseModal
        isOpen={showResponsesModal}
        rawText={rawText}
        userName={userName}
        date={date}
        onClose={() => setShowResponsesModal(false)}
      />

      {/* Modal de Dibujo con React Portal */}
      <DrawingViewerModal
        isOpen={showDrawingModal}
        imageSrc={parsed.drawingImage}
        title={`Boceto de ${userName || 'Usuario'} - ${parsed.title}`}
        onClose={() => setShowDrawingModal(false)}
      />
    </div>
  );
};

export default TestResponseViewer;
