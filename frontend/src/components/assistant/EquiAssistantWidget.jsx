import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Wind, MessageSquare, AlertCircle, RefreshCw, ChevronDown, Heart } from 'lucide-react';
import api from '../../services/api';

const QUICK_SUGGESTIONS = [
  { label: '🧘 Pausa para calmarme', action: 'breathe' },
  { label: '⚡ Siento sobrecarga hoy', text: 'Siento mucha sobrecarga mental con mis tareas hoy, ¿qué me sugieres hacer?' },
  { label: '✨ ¿Cómo cuidar mi energía?', text: '¿Qué hábitos rápidos puedo aplicar hoy para cuidar mi energía y enfoque?' },
  { label: '💡 Consejo de motivación', text: 'Dame un consejo constructivo para mantener la motivación en mi jornada laboral.' }
];

const EquiAssistantWidget = ({ onOpenBreathing }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: '¡Hola! Soy Equi, tu asistente inteligente de bienestar en EquilibrIA. 💜\n\n¿Cómo te encuentras hoy o en qué puedo acompañarte?',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

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
    if (item.action === 'breathe') {
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

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9998 }}>
      
      {/* Ventana Desplegable de Chat */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '72px',
            right: '0',
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: '540px',
            maxHeight: 'calc(100vh - 120px)',
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '24px',
            border: '1.5px solid var(--border)',
            boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeIn 0.25s ease-out'
          }}
        >
          {/* Cabecera de Equi */}
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #312e81 0%, #4f46e5 100%)',
              color: '#ffffff'
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
                    Gemini Flash
                  </span>
                </h4>
                <span style={{ fontSize: '11px', opacity: 0.85, fontWeight: '600' }}>
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

      {/* Botón Flotante Principal */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '10px 18px',
          borderRadius: '28px',
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          color: '#ffffff',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 24px rgba(79, 70, 229, 0.45)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          transform: isOpen ? 'scale(0.96)' : 'scale(1)'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = isOpen ? 'scale(0.96)' : 'scale(1)')}
        title="Conversar con Equi, tu asistente de bienestar"
      >
        <div style={{ position: 'relative', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/logo.png" alt="Equi Colibrí" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
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
        <div style={{ textAlign: 'left' }}>
          <span style={{ fontSize: '13px', fontWeight: '900', display: 'block', lineHeight: 1.1 }}>
            {isOpen ? 'Cerrar Equi' : 'Equi AI'}
          </span>
          <span style={{ fontSize: '10px', opacity: 0.85, fontWeight: '700' }}>
            {isOpen ? 'Minimizar' : 'Asistente de Bienestar'}
          </span>
        </div>
      </button>

    </div>
  );
};

export default EquiAssistantWidget;
