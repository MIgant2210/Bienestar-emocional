import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, VolumeX, Play, Pause, RotateCcw, 
  Sparkles, Check, Mic2, Music, UserCheck, Star, Radio, Loader2,
  Zap, Compass, Feather, User
} from 'lucide-react';
import api from '../services/api';

// Función para limpiar símbolos de formato markdown antes de sintetizar voz
export const cleanTextForSpeech = (rawText) => {
  if (!rawText) return '';
  return rawText
    .replace(/\*\*([^*]+)\*\*/g, '$1')  // **negrita** -> negrita
    .replace(/\*([^*]+)\*/g, '$1')      // *cursiva* -> cursiva
    .replace(/__([^_]+)__/g, '$1')      // __negrita__ -> negrita
    .replace(/_([^_]+)_/g, '$1')        // _cursiva_ -> cursiva
    .replace(/#{1,6}\s?/g, '')          // # encabezados -> ''
    .replace(/^[•\-\*]\s+/gm, '')       // viñetas -> ''
    .replace(/\[\s?[xX]?\s?\]/g, '')     // checkboxes [x] -> ''
    .replace(/\s{2,}/g, ' ')            // espacios múltiples -> un espacio
    .trim();
};

const AI_VOICE_PERSONAS = [
  { id: 'christina', name: 'Camila', label: 'Camila (Pop & Enérgica)', tag: 'Juvenil & Vibrante', icon: Mic2, desc: 'Voz brillante, juvenil, expresiva y vibrante', sample: '¡Hola! Soy Camila. Me alegra mucho acompañarte hoy en tu espacio de bienestar.' },
  { id: 'taylor', name: 'Valeria', label: 'Valeria (Dulce & Melódica)', tag: 'Suave & Amigable', icon: Sparkles, desc: 'Tono dulce, suave, amigable y reconfortante', sample: '¡Hola! Soy Valeria. Vamos a tomarnos un respiro y calmar la mente juntos.' },
  { id: 'ariana', name: 'Lucía', label: 'Lucía (Fresca & Vivaz)', tag: 'Fresca & Expresiva', icon: Star, desc: 'Voz aguda, fresca, juvenil y llena de vitalidad', sample: '¡Hola! Soy Lucía. Qué lindo que dediques este tiempo especial para ti.' },
  { id: 'arjona', name: 'Alejandro', label: 'Alejandro (Profunda & Poética)', tag: 'Narrador Poético', icon: Music, desc: 'Voz masculina grave, reflexiva, pausada y poética', sample: 'Hola... soy Alejandro. Deja las prisas afuera, respira hondo y escucha.' },
  { id: 'badbunny', name: 'Diego', label: 'Diego (Urbano & Relajado)', tag: 'Moderno & Dinámico', icon: Radio, desc: 'Tono urbano, grave, moderno y relajado', sample: 'Hola... aquí estamos listos para que te relajes y reduzcas el estrés.' },
  { id: 'sofia', name: 'Sofía', label: 'Sofía (Joven & Cálida)', tag: 'Guía de Bienestar', icon: User, desc: 'Guía empática, clara, suave y humana', sample: '¡Hola! Soy Sofía, tu guía de bienestar. Comencemos juntos este ejercicio.' },
  { id: 'mateo', name: 'Mateo', label: 'Mateo (Joven & Dinámico)', tag: 'Guía de Bienestar', icon: Zap, desc: 'Tono motivador, fresco, natural y positivo', sample: '¡Hola! Soy Mateo. Vamos con todo a recargar esa energía positiva.' },
  { id: 'waze', name: 'Guía Rápido', label: 'Guía Rápido (Ágil & Directo)', tag: 'Ágil & Dinámica', icon: Compass, desc: 'Dicción ágil, rápida, fluida y al grano', sample: 'Iniciando recurso de bienestar. Mantén tu atención en las siguientes instrucciones.' },
  { id: 'zen', name: 'Modo Zen', label: 'Modo Zen (Relajación & Paz)', tag: 'Relajación Profunda', icon: Feather, desc: 'Pausada, suave, reconfortante y meditativa', sample: 'Respira profundo... suelta toda la tensión... y disfruta de este momento presente.' }
];

const ResourceAudioPlayer = ({ content, title, onParagraphChange }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState('christina');
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [paragraphs, setParagraphs] = useState([]);
  const [progressPercent, setProgressPercent] = useState(0);

  const audioRef = useRef(null);
  const audioCacheRef = useRef(new Map());
  const abortControllerRef = useRef(null);

  const isPlayingRef = useRef(false);
  const isReadingSessionRef = useRef(false);
  const currentParagraphRef = useRef(0);
  const selectedPersonaRef = useRef('christina');
  const playbackRateRef = useRef(1.0);
  const playbackSessionIdRef = useRef(0);

  isPlayingRef.current = isPlaying;
  currentParagraphRef.current = currentParagraph;
  selectedPersonaRef.current = selectedPersona;
  playbackRateRef.current = playbackRate;

  // Dividir el contenido en párrafos
  useEffect(() => {
    if (!content) return;
    const cleanParagraphs = content
      .split(/\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 0);
    setParagraphs(cleanParagraphs.length > 0 ? cleanParagraphs : [content]);
  }, [content]);

  // Limpiar audio al desmontar
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const stopAudio = () => {
    // 1. Invalidar de inmediato cualquier petición asíncrona o callback de voz en curso
    playbackSessionIdRef.current++;

    if (audioRef.current) {
      audioRef.current.onplay = null;
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch (e) {}
      abortControllerRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setIsLoadingAudio(false);
  };

  // Obtener audio sintetizado con IA desde el backend
  const fetchAudioBlob = async (text, personaId, rateVal) => {
    const cacheKey = `${personaId}_${rateVal}_${text}`;
    if (audioCacheRef.current.has(cacheKey)) {
      return audioCacheRef.current.get(cacheKey);
    }

    try {
      const response = await api.post(
        '/wellbeing/tts',
        { text, persona: personaId, rate: rateVal },
        { responseType: 'blob' }
      );
      const audioBlob = response.data;
      audioCacheRef.current.set(cacheKey, audioBlob);
      return audioBlob;
    } catch (err) {
      console.warn('Fallback a síntesis nativa por error en backend TTS:', err);
      return null;
    }
  };

  // Reproduce un párrafo específico con voz neural, permitiendo continuar donde se quedó (startAtSeconds)
  const playParagraph = async (index, personaId = selectedPersonaRef.current, rateMultiplier = playbackRateRef.current, startAtSeconds = 0) => {
    const currentSessionId = ++playbackSessionIdRef.current;
    
    if (index >= paragraphs.length) {
      stopAudio();
      isReadingSessionRef.current = false;
      setCurrentParagraph(0);
      setProgressPercent(100);
      if (onParagraphChange) onParagraphChange(-1);
      return;
    }

    isReadingSessionRef.current = true;
    const rawText = paragraphs[index];
    const cleanText = cleanTextForSpeech(rawText);

    if (!cleanText) {
      if (index + 1 < paragraphs.length) {
        playParagraph(index + 1, personaId, rateMultiplier);
      }
      return;
    }

    setIsLoadingAudio(true);
    setCurrentParagraph(index);
    if (onParagraphChange) onParagraphChange(index);

    const audioBlob = await fetchAudioBlob(cleanText, personaId, rateMultiplier);

    // Si durante la descarga de audio la sesión cambió o se detuvo, abortar
    if (playbackSessionIdRef.current !== currentSessionId) {
      return;
    }

    setIsLoadingAudio(false);

    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.playbackRate = rateMultiplier;
      if (startAtSeconds > 0) {
        try {
          audio.currentTime = startAtSeconds;
        } catch (e) {}
      }
      audioRef.current = audio;

      audio.onplay = () => {
        if (playbackSessionIdRef.current !== currentSessionId) {
          audio.pause();
          return;
        }
        setIsPlaying(true);
        setIsPaused(false);
        const pct = Math.round(((index + 1) / paragraphs.length) * 100);
        setProgressPercent(pct);
      };

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        if (playbackSessionIdRef.current !== currentSessionId) return;

        if (index + 1 < paragraphs.length) {
          playParagraph(index + 1, personaId, rateMultiplier);
        } else {
          stopAudio();
          isReadingSessionRef.current = false;
          setCurrentParagraph(0);
          setProgressPercent(100);
          if (onParagraphChange) onParagraphChange(-1);
        }
      };

      audio.onerror = (e) => {
        if (playbackSessionIdRef.current !== currentSessionId) return;
        console.error('Error al reproducir audio blob:', e);
        setIsPlaying(false);
        setIsLoadingAudio(false);
      };

      audio.play().catch(err => {
        if (playbackSessionIdRef.current !== currentSessionId) return;
        console.warn('AutoPlay prevented or error:', err);
        setIsPlaying(false);
      });
    } else {
      setIsPlaying(false);
      setIsLoadingAudio(false);
    }
  };

  // Cambio Inmediato de Voz: continúa leyendo exactamente donde se quedó la voz anterior
  const handleSelectPersona = async (personaId) => {
    const wasPlayingOrReading = isReadingSessionRef.current || isPlaying || isPaused;
    const resumeFromSecond = audioRef.current ? (audioRef.current.currentTime || 0) : 0;
    const paragraphIdxToResume = currentParagraphRef.current;

    // 1. Detener absolutamente toda reproducción anterior
    stopAudio();

    setSelectedPersona(personaId);
    selectedPersonaRef.current = personaId;
    setShowVoiceMenu(false);

    // 2. Si ya estaba en lectura activa, continuar leyendo EXACTAMENTE donde se quedó la otra voz
    if (wasPlayingOrReading) {
      isReadingSessionRef.current = true;
      playParagraph(paragraphIdxToResume, personaId, playbackRateRef.current, resumeFromSecond);
    } else {
      // 3. Si estaba inactivo, reproducir ÚNICAMENTE la muestra corta de la nueva voz seleccionada
      const currentSessionId = playbackSessionIdRef.current;
      const personaObj = AI_VOICE_PERSONAS.find(p => p.id === personaId) || AI_VOICE_PERSONAS[0];
      setIsLoadingAudio(true);
      const sampleBlob = await fetchAudioBlob(personaObj.sample, personaId, playbackRateRef.current);
      
      // Si el usuario volvió a cambiar de voz durante la descarga de la muestra, cancelar
      if (playbackSessionIdRef.current !== currentSessionId) {
        return;
      }

      setIsLoadingAudio(false);
      if (sampleBlob) {
        const audioUrl = URL.createObjectURL(sampleBlob);
        const sampleAudio = new Audio(audioUrl);
        sampleAudio.playbackRate = playbackRateRef.current;
        audioRef.current = sampleAudio;

        sampleAudio.onplay = () => {
          if (playbackSessionIdRef.current !== currentSessionId) {
            sampleAudio.pause();
            return;
          }
          setIsPlaying(true);
        };

        sampleAudio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          if (playbackSessionIdRef.current === currentSessionId) {
            setIsPlaying(false);
          }
        };

        sampleAudio.play().catch(() => {});
      }
    }
  };

  const handlePlay = () => {
    isReadingSessionRef.current = true;
    if (isPaused && audioRef.current) {
      audioRef.current.play();
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      playParagraph(currentParagraph);
    }
  };

  const handlePause = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    isReadingSessionRef.current = false;
    stopAudio();
    setCurrentParagraph(0);
    setProgressPercent(0);
    if (onParagraphChange) onParagraphChange(-1);
  };

  const handleRestart = () => {
    isReadingSessionRef.current = true;
    stopAudio();
    setTimeout(() => {
      playParagraph(0);
    }, 50);
  };

  const handleRateChange = (newRate) => {
    setPlaybackRate(newRate);
    playbackRateRef.current = newRate;
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
    if (isPlaying) {
      playParagraph(currentParagraph, selectedPersona, newRate);
    }
  };

  const currentPersonaObj = AI_VOICE_PERSONAS.find(p => p.id === selectedPersona) || AI_VOICE_PERSONAS[0];

  return (
    <div style={{
      backgroundColor: 'var(--bg-primary)',
      border: '1.5px solid var(--border)',
      borderRadius: '16px',
      padding: '14px 18px',
      marginBottom: '16px',
      display: 'grid',
      gap: '12px',
      position: 'relative'
    }} role="region" aria-label="Reproductor de audio en voz alta con Inteligencia Artificial">
      
      {/* Cabecera del Reproductor con Selección de Voz IA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: isPlaying ? 'var(--primary)' : 'var(--bg-secondary)',
            color: isPlaying ? '#ffffff' : 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            boxShadow: isPlaying ? '0 0 15px var(--primary-glow)' : 'none',
            fontSize: '18px'
          }}>
            {isLoadingAudio ? (
              <Loader2 size={18} className="animate-spin" />
            ) : isPlaying ? (
              <Volume2 size={18} className="animate-pulse" />
            ) : currentPersonaObj?.icon ? (
              <currentPersonaObj.icon size={18} />
            ) : (
              <Volume2 size={18} />
            )}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '900', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Lectura con Voz IA Neural</span>
              <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: '900', padding: '2px 8px', borderRadius: '6px', backgroundColor: 'var(--primary-light)' }}>
                {currentPersonaObj.tag}
              </span>
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              Voz: <strong style={{ color: 'var(--primary)' }}>{currentPersonaObj.name}</strong> • {currentPersonaObj.desc}
            </div>
          </div>
        </div>

        {/* Botón Selector de Voz de Artistas y Celebridades */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowVoiceMenu(!showVoiceMenu)}
            className="btn btn-secondary"
            style={{
              padding: '7px 14px',
              fontSize: '12px',
              fontWeight: '800',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderColor: showVoiceMenu ? 'var(--primary)' : 'var(--border)',
              backgroundColor: 'var(--bg-secondary)'
            }}
            aria-label="Cambiar voz de IA"
          >
            <Sparkles size={14} style={{ color: 'var(--primary)' }} />
            <span>{currentPersonaObj.label}</span>
          </button>

          {/* Menú Flotante de Voces con Artistas y Celebridades */}
          {showVoiceMenu && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 6px)',
              width: '320px',
              backgroundColor: 'var(--bg-secondary)',
              border: '2px solid var(--primary)',
              borderRadius: '16px',
              padding: '8px',
              boxShadow: '0 20px 45px rgba(0,0,0,0.5)',
              zIndex: 99999,
              maxHeight: '340px',
              overflowY: 'auto'
            }}>
              <div style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--text-muted)', padding: '6px 10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Elige tu Voz Humana & Artista con IA:
              </div>
              {AI_VOICE_PERSONAS.map(p => {
                const isSelected = selectedPersona === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPersona(p.id)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: 'none',
                      background: isSelected ? 'var(--primary-light)' : 'transparent',
                      color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '3px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'grid', lineHeight: '1.25' }}>
                      <div style={{ fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <p.icon size={14} style={{ color: isSelected ? 'var(--primary)' : 'var(--text-muted)' }} />
                        <span>{p.name}</span>
                        <span style={{ fontSize: '9px', fontWeight: '700', color: 'var(--text-muted)', backgroundColor: 'var(--bg-primary)', padding: '1px 5px', borderRadius: '4px' }}>
                          {p.tag}
                        </span>
                      </div>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>{p.desc}</span>
                    </div>
                    {isSelected && <Check size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Barra de Progreso de Lectura */}
      {paragraphs.length > 0 && (
        <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${progressPercent}%`,
            backgroundColor: 'var(--primary)',
            transition: 'width 0.3s ease'
          }} />
        </div>
      )}

      {/* Controles de Reproducción y Velocidad */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!isPlaying ? (
            <button
              type="button"
              disabled={isLoadingAudio}
              onClick={handlePlay}
              className="btn btn-primary"
              style={{ padding: '7px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}
              aria-label={isPaused ? "Continuar lectura" : "Reproducir audio"}
            >
              {isLoadingAudio ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} fill="currentColor" />}
              <span>{isLoadingAudio ? 'Cargando Voz IA...' : (isPaused ? 'Continuar' : 'Escuchar Recurso')}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePause}
              className="btn btn-secondary"
              style={{ padding: '7px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}
              aria-label="Pausar lectura"
            >
              <Pause size={13} fill="currentColor" />
              <span>Pausar</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleStop}
            className="btn btn-secondary"
            style={{ padding: '7px 12px', borderRadius: '10px', fontSize: '12px' }}
            title="Detener"
            aria-label="Detener lectura"
          >
            Detener
          </button>

          <button
            type="button"
            onClick={handleRestart}
            className="btn btn-secondary"
            style={{ padding: '7px 12px', borderRadius: '10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
            title="Reiniciar desde el inicio"
            aria-label="Reiniciar lectura"
          >
            <RotateCcw size={12} />
          </button>
        </div>

        {/* Botones de Velocidad */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginRight: '2px' }}>Velocidad:</span>
          {[0.8, 1.0, 1.25, 1.5].map(rate => (
            <button
              key={rate}
              type="button"
              onClick={() => handleRateChange(rate)}
              style={{
                padding: '3px 8px',
                borderRadius: '7px',
                border: '1px solid',
                borderColor: playbackRate === rate ? 'var(--primary)' : 'var(--border)',
                backgroundColor: playbackRate === rate ? 'var(--primary)' : 'transparent',
                color: playbackRate === rate ? '#ffffff' : 'var(--text-secondary)',
                fontSize: '11px',
                fontWeight: playbackRate === rate ? '800' : '600',
                cursor: 'pointer'
              }}
              aria-label={`Velocidad ${rate}x`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ResourceAudioPlayer;
