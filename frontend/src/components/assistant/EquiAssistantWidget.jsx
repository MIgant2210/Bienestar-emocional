import React, { useState, useRef, useEffect, useContext } from 'react';
import { Bot, X, Send, Sparkles, Wind, MessageSquare, AlertCircle, RefreshCw, ChevronDown, Heart, GripVertical } from 'lucide-react';
import api from '../../services/api';
import { ThemeContext } from '../../contexts/ThemeContext';

const EQUI_PALETTES = {
  indigo: {
    btnGradient: 'linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #818cf8 100%)',
    headerGradient: 'linear-gradient(135deg, #312e81 0%, #4f46e5 100%)',
    shadow: '0 8px 24px rgba(99, 102, 241, 0.45)',
    border: '#818cf8',
    glow: 'rgba(99, 102, 241, 0.3)'
  },
  ocean: {
    btnGradient: 'linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #38bdf8 100%)',
    headerGradient: 'linear-gradient(135deg, #0c4a6e 0%, #0284c7 100%)',
    shadow: '0 8px 24px rgba(2, 132, 199, 0.45)',
    border: '#38bdf8',
    glow: 'rgba(2, 132, 199, 0.3)'
  },
  emerald: {
    btnGradient: 'linear-gradient(135deg, #047857 0%, #10b981 50%, #34d399 100%)',
    headerGradient: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
    shadow: '0 8px 24px rgba(16, 185, 129, 0.45)',
    border: '#34d399',
    glow: 'rgba(16, 185, 129, 0.3)'
  },
  sunset: {
    btnGradient: 'linear-gradient(135deg, #c2410c 0%, #ea580c 50%, #f59e0b 100%)',
    headerGradient: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)',
    shadow: '0 8px 24px rgba(234, 88, 12, 0.45)',
    border: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.3)'
  },
  cyberpunk: {
    btnGradient: 'linear-gradient(135deg, #be185d 0%, #ec4899 50%, #f472b6 100%)',
    headerGradient: 'linear-gradient(135deg, #831843 0%, #db2777 100%)',
    shadow: '0 8px 24px rgba(236, 72, 153, 0.45)',
    border: '#f472b6',
    glow: 'rgba(236, 72, 153, 0.3)'
  }
};

const QUICK_SUGGESTIONS = [
  { label: '🌟 Recorrido con Equi', action: 'tour' },
  { label: '🧘 Pausa para calmarme', action: 'breathe' },
  { label: '🇬🇹 ¿Qué onda con el estrés?', text: '¿Qué hábitos o pausas me sugieres hoy para aliviar la sobrecarga laboral y recargar pilas?' },
  { label: '⚡ Siento sobrecarga hoy', text: 'Siento mucha sobrecarga mental con mis tareas de hoy, ¿qué me sugieres hacer?' },
  { label: '✨ ¿Cómo cuidar mi energía?', text: '¿Qué hábitos rápidos puedo aplicar hoy para cuidar mi energía y enfoque?' },
  { label: '💡 Consejo de motivación', text: 'Dame un consejo constructivo para mantener el ánimo y motivación en mi jornada laboral.' }
];

const EquiAssistantWidget = ({ onOpenBreathing, onStartTour }) => {
  const themeContext = useContext(ThemeContext);
  const colorPalette = themeContext?.colorPalette || 'indigo';
  const paletteTheme = EQUI_PALETTES[colorPalette] || EQUI_PALETTES.indigo;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: '¡Hola! Soy Equi, tu asistente inteligente de bienestar en EquilibrIA. 💜🇬🇹\n\n¿Cómo te encuentras hoy o en qué puedo acompañarte?',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Posición movible del botón flotante (draggable)
  const [position, setPosition] = useState(() => {
    try {
      const saved = localStorage.getItem('equi_widget_position');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.top === 'number' && typeof parsed.right === 'number') {
          return parsed;
        }
      }
    } catch (e) {
      // Ignorar error de parsing
    }
    return { top: null, right: 24 }; // null top significa bottom: 24px por defecto
  });

  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);
  const dragStartRef = useRef({ startX: 0, startY: 0, initialTop: 0, initialRight: 0 });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Manejo de Arrastre (Pointer Events)
  const handlePointerDown = (e) => {
    // Solo clic izquierdo
    if (e.button !== 0) return;

    const currentTop = position.top !== null ? position.top : (window.innerHeight - 80);
    const currentRight = position.right !== null ? position.right : 24;

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialTop: currentTop,
      initialRight: currentRight
    };
    hasMovedRef.current = false;
    isDraggingRef.current = true;

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;

    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;

    if (Math.hypot(dx, dy) > 4) {
      hasMovedRef.current = true;
    }

    // Calcular nueva posición con límites seguros
    // LÍMITE SUPERIOR: No pasar de la barra superior (top >= 75px)
    const minTop = 75;
    const maxTop = window.innerHeight - 68;
    let newTop = dragStartRef.current.initialTop + dy;
    newTop = Math.max(minTop, Math.min(newTop, maxTop));

    // LÍMITE HORIZONTAL: Mantener dentro de la ventana
    const minRight = 16;
    const maxRight = window.innerWidth - 180;
    let newRight = dragStartRef.current.initialRight - dx;
    newRight = Math.max(minRight, Math.min(newRight, maxRight));

    setPosition({ top: newTop, right: newRight });
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);

    if (hasMovedRef.current) {
      // Guardar posición persistente si se arrastró
      try {
        setPosition((curr) => {
          localStorage.setItem('equi_widget_position', JSON.stringify(curr));
          return curr;
        });
      } catch (e) {
        // storage unavailable
      }
    } else {
      // Fue un simple clic: alternar estado abierto/cerrado
      setIsOpen((prev) => !prev);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim() || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query.trim(),
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const response = await api.post('/analysis/chat', { message: query.trim() });
      const aiReply = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.data.reply || 'Estoy aquí contigo. ¿Quieres profundizar más en esto?',
        is_emergency: response.data.is_emergency,
        citations: response.data.citations || [],
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      console.error('Error con Equi Assistant:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'Disculpa, tuve un breve contratiempo de conexión. Por favor intenta escribirme nuevamente.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (item) => {
    if (item.action === 'tour') {
      if (onStartTour) {
        onStartTour();
      }
      setIsOpen(false);
    } else if (item.action === 'breathe') {
      if (onOpenBreathing) {
        onOpenBreathing();
      }
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'ai',
          text: 'Te he abierto el ejercicio de Respiración Guiada 4-7-8. Tómate un momento para conectar con tu respiración.',
          timestamp: new Date()
        }
      ]);
    } else if (item.text) {
      handleSendMessage(item.text);
    }
  };

  // Posicionamiento inteligente del contenedor de chat según la altura del botón
  // Posicionamiento inteligente del contenedor de chat según el cuadrante del botón en pantalla
  const isLeftHalf = typeof window !== 'undefined' && position.right > (window.innerWidth / 2);
  const isTopHalf = position.top !== null && position.top < (typeof window !== 'undefined' ? window.innerHeight / 2 : 450);

  return (
    <div
      style={{
        position: 'fixed',
        top: position.top !== null ? `${position.top}px` : 'auto',
        bottom: position.top === null ? '24px' : 'auto',
        right: `${position.right}px`,
        zIndex: 9998,
        userSelect: 'none',
        touchAction: 'none'
      }}
    >
      {/* Ventana Desplegable de Chat con detección inteligente de bordes */}
      {isOpen && (
        <div
          className="equi-chat-window-responsive"
          style={{
            position: 'absolute',
            top: isTopHalf ? '56px' : 'auto',
            bottom: isTopHalf ? 'auto' : '62px',
            left: isLeftHalf ? '0' : 'auto',
            right: isLeftHalf ? 'auto' : '0',
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: '520px',
            maxHeight: 'calc(100vh - 90px)',
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '24px',
            border: '1.5px solid var(--border)',
            boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeIn 0.22s ease-out',
            zIndex: 9999
          }}
        >
          {/* Cabecera de Equi adaptada a la paleta del sistema */}
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: paletteTheme.headerGradient,
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid rgba(255, 255, 255, 0.4)'
                }}
              >
                <img src="/logo.png" alt="Equi" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Equi • Asistente IA
                  <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.25)', fontWeight: '800' }}>
                    🇬🇹 Chapín & Gemini
                  </span>
                </h4>
                <span style={{ fontSize: '11px', opacity: 0.9, fontWeight: '600' }}>
                  ● En línea • Orientación & Escucha Activa
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Minimizar chat"
              >
                <ChevronDown size={18} />
              </button>
            </div>
          </div>

          {/* Cuerpo de Mensajes */}
          <div
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              backgroundColor: 'var(--bg-primary)'
            }}
          >
            {messages.map((m) => {
              const isAi = m.sender === 'ai';
              return (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    justifyContent: isAi ? 'flex-start' : 'flex-end',
                    gap: '8px'
                  }}
                >
                  {isAi && (
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '4px'
                      }}
                    >
                      <img src="/logo.png" alt="Equi" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
                    </div>
                  )}

                  <div
                    style={{
                      maxWidth: '82%',
                      padding: '12px 14px',
                      borderRadius: isAi ? '4px 18px 18px 18px' : '18px 4px 18px 18px',
                      backgroundColor: isAi ? (m.is_emergency ? '#fee2e2' : 'var(--bg-secondary)') : 'var(--primary)',
                      color: isAi ? (m.is_emergency ? '#991b1b' : 'var(--text-primary)') : '#ffffff',
                      border: isAi ? `1px solid ${m.is_emergency ? '#ef4444' : 'var(--border)'}` : 'none',
                      fontSize: '12.5px',
                      lineHeight: '1.45',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {m.text}

                    {/* Citaciones RAG */}
                    {m.citations && m.citations.length > 0 && (
                      <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid rgba(0,0,0,0.08)', fontSize: '10px', color: 'var(--text-muted)' }}>
                        <span style={{ fontWeight: '800' }}>Fuentes de bienestar: </span>
                        {m.citations.map((c, cIdx) => (
                          <span key={cIdx}>{c.title || c.source}{cIdx < m.citations.length - 1 ? ', ' : ''}</span>
                        ))}
                      </div>
                    )}

                    <span style={{ fontSize: '9px', opacity: 0.65, display: 'block', textAlign: 'right', marginTop: '4px' }}>
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-muted)', fontSize: '11.5px', paddingLeft: '36px' }}>
                <div className="animate-spin" style={{ width: '14px', height: '14px', border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
                <span>Equi está escribiendo...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Sugerencias Rápidas */}
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: 'var(--bg-secondary)',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              whiteSpace: 'nowrap'
            }}
          >
            {QUICK_SUGGESTIONS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSuggestionClick(item)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '700',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Formulario de Entrada */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: '10px 14px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              backgroundColor: 'var(--bg-primary)'
            }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escribe a Equi sobre cómo te sientes..."
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '14px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '12.5px',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="btn btn-primary"
              style={{
                padding: '10px 14px',
                borderRadius: '14px',
                opacity: loading || !inputText.trim() ? 0.6 : 1,
                cursor: loading || !inputText.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              <Send size={15} />
            </button>
          </form>

        </div>
      )}

      {/* Botón Flotante Principal Arrastrable y Adaptado al Color Activo */}
      <div
        onPointerDown={handlePointerDown}
        className="equi-floating-trigger-btn"
        style={{
          padding: '10px 16px',
          borderRadius: '28px',
          background: paletteTheme.btnGradient,
          color: '#ffffff',
          border: `2px solid ${paletteTheme.border}`,
          boxShadow: paletteTheme.shadow,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          cursor: isDraggingRef.current ? 'grabbing' : 'grab',
          transition: 'transform 0.15s ease',
          transform: isOpen ? 'scale(0.96)' : 'scale(1)',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          minWidth: 'max-content',
          flexShrink: 0,
          boxSizing: 'border-box'
        }}
        title="Arrastra para mover • Haz clic para conversar con Equi"
      >
        <GripVertical size={13} className="equi-drag-handle-icon" style={{ opacity: 0.7, cursor: 'grab' }} />
        <div style={{ position: 'relative', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/logo.png" alt="Equi Colibrí" style={{ width: '22px', height: '22px', objectFit: 'contain', pointerEvents: 'none' }} />
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              border: '1.5px solid #ffffff'
            }}
          />
        </div>
        <div style={{ textAlign: 'left', pointerEvents: 'none' }}>
          <span style={{ fontSize: '13px', fontWeight: '900', display: 'block', lineHeight: 1.1 }}>
            {isOpen ? 'Cerrar' : 'Equi AI'}
          </span>
          <span className="equi-trigger-subtitle" style={{ fontSize: '10px', opacity: 0.88, fontWeight: '700' }}>
            {isOpen ? 'Minimizar' : 'Asistente de Bienestar'}
          </span>
        </div>
      </div>

    </div>
  );
};

export default EquiAssistantWidget;

