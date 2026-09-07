import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Wind, Volume2, VolumeX, X, Sparkles } from 'lucide-react';

const BREATHING_PATTERNS = {
  '4-7-8': {
    name: 'Descompresión Profunda 4-7-8',
    inhale: 4,
    hold: 7,
    exhale: 8,
    desc: 'Técnica de oro para liberar ansiedad acumulada, calmar el sistema nervioso y restaurar el foco.'
  },
  '4-4-6': {
    name: 'Relajación Rápida 4-4-6',
    inhale: 4,
    hold: 4,
    exhale: 6,
    desc: 'Estimula el nervio vago y estabiliza el ritmo cardíaco en pausas laborales de 2 minutos.'
  },
  '4-4-4': {
    name: 'Respiración Cuadrada 4-4-4',
    inhale: 4,
    hold: 4,
    exhale: 4,
    desc: 'Claridad mental y equilibrio ideal antes de reuniones o tareas de alta concentración.'
  }
};

const BreathingExerciseModal = ({ isOpen, onClose, onRewardXp }) => {
  if (!isOpen) return null;

  const [patternKey, setPatternKey] = useState('4-7-8');
  const pattern = BREATHING_PATTERNS[patternKey];

  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('idle'); // 'idle', 'inhale', 'hold', 'exhale'
  const [secondsRemaining, setSecondsRemaining] = useState(pattern.inhale);
  const [currentCycle, setCurrentCycle] = useState(1);
  const totalCycles = 4;
  const [isCompleted, setIsCompleted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const timerRef = useRef(null);

  // Sintetizador Web Audio API: Sonido suave tipo campana tibetana / chime de meditación
  const playChime = (type = 'inhale') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const freq = type === 'inhale' ? 528 : (type === 'hold' ? 660 : 432);
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      // AudioContext protegido por políticas del navegador hasta interacción de usuario
    }
  };

  useEffect(() => {
    handleReset();
  }, [patternKey]);

  useEffect(() => {
    if (!isActive) {
      clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev > 1) {
          return prev - 1;
        }

        if (phase === 'inhale') {
          if (pattern.hold > 0) {
            setPhase('hold');
            playChime('hold');
            return pattern.hold;
          } else {
            setPhase('exhale');
            playChime('exhale');
            return pattern.exhale;
          }
        } else if (phase === 'hold') {
          setPhase('exhale');
          playChime('exhale');
          return pattern.exhale;
        } else if (phase === 'exhale') {
          if (currentCycle < totalCycles) {
            setCurrentCycle((c) => c + 1);
            setPhase('inhale');
            playChime('inhale');
            return pattern.inhale;
          } else {
            setIsActive(false);
            setPhase('idle');
            setIsCompleted(true);
            playChime('hold');
            if (onRewardXp) onRewardXp(25);
            return pattern.inhale;
          }
        }
        return pattern.inhale;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isActive, phase, currentCycle, pattern, totalCycles, soundEnabled]);

  const handleStart = () => {
    setIsActive(true);
    setPhase('inhale');
    setSecondsRemaining(pattern.inhale);
    setIsCompleted(false);
    playChime('inhale');
  };

  const handlePause = () => setIsActive(false);
  const handleResume = () => setIsActive(true);
  const handleReset = () => {
    setIsActive(false);
    setPhase('idle');
    setSecondsRemaining(pattern.inhale);
    setCurrentCycle(1);
    setIsCompleted(false);
  };

  let circleScale = 1;
  let circleColor = 'var(--primary)';
  let phaseTitle = 'Pausa Consciente';
  let phaseDesc = 'Siéntate en postura cómoda, relaja los hombros y prepárate.';

  if (phase === 'inhale') {
    circleScale = 1.35;
    circleColor = '#38bdf8';
    phaseTitle = 'Inhala suavemente...';
    phaseDesc = 'Toma aire profundo por la nariz expandiendo el abdomen.';
  } else if (phase === 'hold') {
    circleScale = 1.35;
    circleColor = '#a855f7';
    phaseTitle = 'Mantén el aire...';
    phaseDesc = 'Siente la quietud y calma interior.';
  } else if (phase === 'exhale') {
    circleScale = 0.85;
    circleColor = '#10b981';
    phaseTitle = 'Exhala lentamente...';
    phaseDesc = 'Suelta el aire suavemente por la boca liberando cualquier carga.';
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.25s ease-out'
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '24px',
          border: '1.5px solid var(--border)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--bg-secondary)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Wind size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: 'var(--text-primary)' }}>
                Pausa Consciente
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                Respiración Guiada y Descompresión
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="duo-pill"
              title={soundEnabled ? 'Silenciar campanadas' : 'Activar campanadas'}
              style={{ padding: '6px 10px', fontSize: '12px' }}
            >
              {soundEnabled ? <Volume2 size={16} style={{ color: 'var(--primary)' }} /> : <VolumeX size={16} style={{ color: 'var(--text-muted)' }} />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="duo-pill"
              style={{ padding: '6px 10px', borderRadius: '50%' }}
              title="Cerrar modal"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {Object.entries(BREATHING_PATTERNS).map(([k, p]) => (
              <button
                key={k}
                type="button"
                onClick={() => setPatternKey(k)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '10px',
                  fontSize: '11.5px',
                  fontWeight: patternKey === k ? '800' : '600',
                  backgroundColor: patternKey === k ? 'var(--primary)' : 'var(--bg-secondary)',
                  color: patternKey === k ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {k} • {p.name.split(' ')[0]}
              </button>
            ))}
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', margin: 0, maxWidth: '420px', lineHeight: 1.4 }}>
            {pattern.desc}
          </p>

          <div
            style={{
              width: '260px',
              height: '260px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              margin: '8px 0'
            }}
          >
            <div
              style={{
                width: '190px',
                height: '190px',
                borderRadius: '50%',
                backgroundColor: circleColor,
                opacity: 0.18,
                position: 'absolute',
                transform: `scale(${circleScale * 1.3})`,
                filter: 'blur(16px)',
                transition: phase === 'inhale' ? `all ${pattern.inhale}s ease-in-out` : (phase === 'exhale' ? `all ${pattern.exhale}s ease-in-out` : 'all 0.5s ease')
              }}
            />

            <div
              style={{
                width: '210px',
                height: '210px',
                borderRadius: '50%',
                border: `2px dashed ${circleColor}55`,
                position: 'absolute',
                transform: `scale(${circleScale * 1.1}) rotate(${isActive ? 90 : 0}deg)`,
                transition: `all ${phase === 'inhale' ? pattern.inhale : pattern.exhale}s ease-in-out`
              }}
            />

            <div
              style={{
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-secondary)',
                border: `3.5px solid ${circleColor}`,
                boxShadow: `0 0 35px ${circleColor}50`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
                transform: `scale(${circleScale})`,
                transition: phase === 'inhale' ? `transform ${pattern.inhale}s ease-in-out` : (phase === 'exhale' ? `transform ${pattern.exhale}s ease-in-out` : 'none')
              }}
            >
              <Wind size={28} style={{ color: circleColor, marginBottom: '4px' }} />
              {isActive ? (
                <span style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-primary)', lineHeight: 1 }}>
                  {secondsRemaining}s
                </span>
              ) : (
                <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>
                  {isCompleted ? '¡Completado!' : '4 Ciclos'}
                </span>
              )}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <h4 style={{ fontSize: '17px', fontWeight: '900', color: circleColor, margin: '0 0 4px 0', transition: 'color 0.3s' }}>
              {phaseTitle}
            </h4>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>
              {phaseDesc}
            </p>
            {isActive && (
              <div style={{ marginTop: '6px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>
                Ciclo {currentCycle} de {totalCycles}
              </div>
            )}
          </div>

          {isCompleted && (
            <div
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '14px',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '1.5px solid #10b981',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: '800'
              }}
            >
              <Sparkles size={18} />
              <span>¡Pausa completada con éxito! +25 XP otorgados a tu bienestar.</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '6px' }}>
            {!isActive ? (
              <button
                type="button"
                onClick={phase === 'idle' ? handleStart : handleResume}
                className="btn btn-primary"
                style={{
                  padding: '12px 28px',
                  borderRadius: '14px',
                  fontSize: '14px',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)'
                }}
              >
                <Play size={16} fill="currentColor" />
                <span>{phase === 'idle' ? 'Comenzar Pausa' : 'Reanudar'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePause}
                className="btn btn-secondary"
                style={{ padding: '12px 24px', borderRadius: '14px', fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Pause size={16} fill="currentColor" />
                <span>Pausar</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleReset}
              className="btn btn-secondary"
              style={{ padding: '12px', borderRadius: '14px' }}
              title="Reiniciar ejercicio"
            >
              <RotateCcw size={16} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BreathingExerciseModal;
