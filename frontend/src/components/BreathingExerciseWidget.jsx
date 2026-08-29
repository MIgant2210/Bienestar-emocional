import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Wind, CheckCircle2, Award, Info } from 'lucide-react';

const BREATHING_PATTERNS = {
  '4-4-6': {
    name: 'Relajación 4-4-6 (Recomendado)',
    inhale: 4,
    hold: 4,
    exhale: 6,
    desc: 'Estimula el nervio vago y disminuye el ritmo cardíaco en momentos de tensión.'
  },
  '4-4-4': {
    name: 'Respiración Cuadrada 4-4-4',
    inhale: 4,
    hold: 4,
    exhale: 4,
    desc: 'Equilibrio y concentración mental para tareas que requieren alto foco.'
  },
  '4-7-8': {
    name: 'Descompresión 4-7-8',
    inhale: 4,
    hold: 7,
    exhale: 8,
    desc: 'Técnica profunda para liberar estrés antes del descanso nocturno.'
  }
};

const BreathingExerciseWidget = ({ data, onComplete, initialCompleted = false }) => {
  const defaultPatternKey = data?.pattern_key || '4-4-6';
  const [selectedPatternKey, setSelectedPatternKey] = useState(defaultPatternKey);
  const pattern = BREATHING_PATTERNS[selectedPatternKey] || BREATHING_PATTERNS['4-4-6'];

  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('idle'); // 'idle', 'inhale', 'hold', 'exhale'
  const [secondsRemaining, setSecondsRemaining] = useState(pattern.inhale);
  const [currentCycle, setCurrentCycle] = useState(1);
  const totalCycles = data?.default_cycles || 4;
  const [isCompleted, setIsCompleted] = useState(initialCompleted);

  const timerRef = useRef(null);

  // Reiniciar estado al cambiar de patrón
  useEffect(() => {
    handleReset();
  }, [selectedPatternKey]);

  // Manejo del temporizador y las fases de respiración
  useEffect(() => {
    if (!isActive) {
      clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev > 1) {
          return prev - 1;
        }

        // Transición de fases
        if (phase === 'inhale') {
          if (pattern.hold > 0) {
            setPhase('hold');
            return pattern.hold;
          } else {
            setPhase('exhale');
            return pattern.exhale;
          }
        } else if (phase === 'hold') {
          setPhase('exhale');
          return pattern.exhale;
        } else if (phase === 'exhale') {
          if (currentCycle < totalCycles) {
            setCurrentCycle(c => c + 1);
            setPhase('inhale');
            return pattern.inhale;
          } else {
            // Finalizó todos los ciclos
            setIsActive(false);
            setPhase('idle');
            setIsCompleted(true);
            if (onComplete) onComplete();
            return pattern.inhale;
          }
        }
        return pattern.inhale;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isActive, phase, currentCycle, pattern, totalCycles]);

  const handleStart = () => {
    setIsActive(true);
    setPhase('inhale');
    setSecondsRemaining(pattern.inhale);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleResume = () => {
    setIsActive(true);
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase('idle');
    setSecondsRemaining(pattern.inhale);
    setCurrentCycle(1);
  };

  // Cálculo del tamaño y escala del círculo animado
  let circleScale = 1;
  let circleColor = 'var(--primary)';
  let phaseText = 'Listo para comenzar';
  let phaseSubtext = 'Encuentra una postura cómoda con la espalda recta.';

  if (phase === 'inhale') {
    circleScale = 1.35;
    circleColor = '#3b82f6';
    phaseText = 'Inhala profundamente...';
    phaseSubtext = 'Llena tus pulmones inflando suavemente el abdomen.';
  } else if (phase === 'hold') {
    circleScale = 1.35;
    circleColor = '#8b5cf6';
    phaseText = 'Mantén el aire...';
    phaseSubtext = 'Conserva la calma sin forzar la respiración.';
  } else if (phase === 'exhale') {
    circleScale = 0.85;
    circleColor = '#10b981';
    phaseText = 'Exhala lentamente...';
    phaseSubtext = 'Suelta todo el aire por la boca liberando la tensión.';
  }

  return (
    <div style={{
      backgroundColor: 'var(--bg-primary)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '24px 20px',
      margin: '16px 0',
      textAlign: 'center',
      display: 'grid',
      gap: '18px'
    }} role="region" aria-label="Ejercicio interactivo de respiración">
      
      {/* Selector de Patrón */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'wrap' }}>
        {Object.entries(BREATHING_PATTERNS).map(([key, p]) => (
          <button
            key={key}
            type="button"
            onClick={() => setSelectedPatternKey(key)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: selectedPatternKey === key ? '800' : '600',
              backgroundColor: selectedPatternKey === key ? 'var(--primary)' : 'var(--bg-secondary)',
              color: selectedPatternKey === key ? '#ffffff' : 'var(--text-secondary)',
              border: '1px solid var(--border)',
              cursor: 'pointer'
            }}
          >
            {p.name.split(' ')[0]} {key}
          </button>
        ))}
      </div>

      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
        {pattern.desc}
      </p>

      {/* Círculo Interactivo de Respiración */}
      <div style={{
        height: '240px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        {/* Halo exterior pulsante */}
        <div style={{
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          backgroundColor: circleColor,
          opacity: 0.15,
          position: 'absolute',
          transform: `scale(${circleScale * 1.2})`,
          transition: 'all 3s ease-in-out'
        }} />

        {/* Círculo principal */}
        <div style={{
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-secondary)',
          border: `3px solid ${circleColor}`,
          boxShadow: `0 0 30px ${circleColor}40`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
          transform: `scale(${circleScale})`,
          transition: phase === 'inhale' ? `transform ${pattern.inhale}s ease-in-out` : (phase === 'exhale' ? `transform ${pattern.exhale}s ease-in-out` : 'none')
        }}>
          <Wind size={26} style={{ color: circleColor, marginBottom: '4px' }} />
          {isActive ? (
            <span style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text-primary)', lineHeight: 1 }}>
              {secondsRemaining}s
            </span>
          ) : (
            <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)' }}>
              {isCompleted ? 'Completado' : '4 Ciclos'}
            </span>
          )}
        </div>
      </div>

      {/* Instrucción de Fase */}
      <div>
        <h4 style={{ fontSize: '16px', fontWeight: '900', color: circleColor, margin: '0 0 4px 0' }}>
          {phaseText}
        </h4>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
          {phaseSubtext}
        </p>
        {isActive && (
          <div style={{ marginTop: '8px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>
            Ciclo {currentCycle} de {totalCycles}
          </div>
        )}
      </div>

      {/* Botones de Control */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', alignItems: 'center' }}>
        {!isActive ? (
          <button
            type="button"
            onClick={phase === 'idle' ? handleStart : handleResume}
            className="btn btn-primary"
            style={{ padding: '10px 24px', borderRadius: '12px', fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Play size={15} fill="currentColor" />
            <span>{phase === 'idle' ? 'Comenzar Respiración' : 'Reanudar'}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePause}
            className="btn btn-secondary"
            style={{ padding: '10px 24px', borderRadius: '12px', fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Pause size={15} fill="currentColor" />
            <span>Pausar</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleReset}
          className="btn btn-secondary"
          style={{ padding: '10px 14px', borderRadius: '12px' }}
          title="Reiniciar ejercicio"
        >
          <RotateCcw size={15} />
        </button>

        {isCompleted && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '10px',
            backgroundColor: 'var(--success-light)',
            color: 'var(--success)',
            fontSize: '12px',
            fontWeight: '800'
          }}>
            <CheckCircle2 size={16} />
            <span>¡Meta de respiración alcanzada!</span>
          </div>
        )}
      </div>

      {/* Nota Preventiva / Descargo General */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        justifyContent: 'center',
        fontSize: '11px',
        color: 'var(--text-muted)'
      }}>
        <Info size={13} />
        <span>Ejercicio general de relajación y bienestar emocional. No sustituye evaluación ni tratamiento clínico.</span>
      </div>

    </div>
  );
};

export default BreathingExerciseWidget;
