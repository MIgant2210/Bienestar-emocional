import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, Circle, Play, Pause, RotateCcw, Volume2, Sparkles, 
  HelpCircle, Award, Eye, Heart, ArrowRight, ArrowLeft, Clock,
  Calendar, Check, AlertTriangle, MessageSquare, BookOpen, ShieldCheck,
  Send, Smile, Compass, RefreshCw, Video, Music, Headphones, Sliders,
  VolumeX, ExternalLink, Activity, Wind, FileText, CheckSquare, PenLine,
  Brain, Lightbulb, Flame, SkipForward
} from 'lucide-react';
import ResourceAudioPlayer from './ResourceAudioPlayer';
import ColibriMascot from './ColibriMascot';
import EquilibriaCharacter from './EquilibriaCharacter';
import HumanWellnessAvatar from './HumanWellnessAvatar';
import AngieAvatar from './AngieAvatar';
import KennyAvatar from './KennyAvatar';

// Helper para convertir cualquier URL de YouTube a URL embebible
const getEmbedUrl = (url) => {
  if (!url) return 'https://www.youtube.com/embed/inpok4MKVLM';
  if (url.includes('youtube.com/embed/')) return url;
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('watch?v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
};

// Helper de Síntesis de Voz Web Speech API
const speakVoiceCue = (text, isVoiceEnabled = true) => {
  if (!isVoiceEnabled || !('speechSynthesis' in window) || !text) return;
  try {
    window.speechSynthesis.cancel(); // Cancelar locuciones previas
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.95; // Voz suave y pausada de bienestar
    utterance.pitch = 1.0;

    // Buscar una voz en español si está disponible
    const voices = window.speechSynthesis.getVoices();
    const esVoice = voices.find(v => v.lang.startsWith('es') || v.name.toLowerCase().includes('spanish'));
    if (esVoice) utterance.voice = esVoice;

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.log('Web Speech API notification:', err);
  }
};

const GuidedExercisePlayer = ({ resource, config, onComplete, readOnly }) => {
  const type = resource?.resource_type || 'articulo';

    const totalCycles = Number(config.total_cycles || config.cycles) || 3;
    
    let steps = config.steps;
    if (!steps || steps.length === 0) {
      if (type === 'respiracion') {
        const inh = Number(config.inhale) || 4;
        const hld = Number(config.hold_in || config.hold) || 4;
        const exh = Number(config.exhale) || 6;
        const hldOut = Number(config.hold_out) || 0;

        steps = [
          { step: 1, name: 'INHALA', type: 'inhale', duration: inh, text: 'Expande tu abdomen y llena tus pulmones con aire fresco.', voice: 'Inhala lentamente por la nariz.' }
        ];
        if (hld > 0) {
          steps.push({ step: 2, name: 'MANTÉN', type: 'hold', duration: hld, text: 'Mantén el aire. Cuerpo relajado y sereno.', voice: 'Mantén la respiración.' });
        }
        steps.push({ step: steps.length + 1, name: 'EXHALA', type: 'exhale', duration: exh, text: 'Suelta el aire lentamente liberando toda tensión.', voice: 'Exhala suavemente.' });
        if (hldOut > 0) {
          steps.push({ step: steps.length + 1, name: 'PAUSA', type: 'hold_out', duration: hldOut, text: 'Pausa con los pulmones vacíos en profunda calma.', voice: 'Pausa y siente la calma.' });
        }
      } else {
        steps = [
          { step: 1, name: 'POSTURA INICIAL', type: 'step', duration: 20, text: 'Ponte erguido con los pies firmes y hombros relajados.', voice: 'Acomoda tu postura y respira.' },
          { step: 2, name: 'SOLTADO', type: 'step', duration: 15, text: 'Deja caer los hombros de golpe y suspira profundamente.', voice: 'Deja caer los hombros y suspira.' },
          { step: 3, name: 'ROTACIÓN', type: 'step', duration: 30, text: 'Realiza giros circulares amplios y fluidos hacia atrás.', voice: 'Gira los hombros hacia atrás.' }
        ];
      }
    }

    const [isActive, setIsActive] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [currentCycle, setCurrentCycle] = useState(1);
    const [currentStepIdx, setCurrentStepIdx] = useState(0);
    const [stepSecondsLeft, setStepSecondsLeft] = useState(steps[0]?.duration || 4);
    const [isCompleted, setIsCompleted] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const [selectedGuide, setSelectedGuide] = useState('female'); // 'female' (Angie) | 'male' (Kenny)

    const currentStep = steps[currentStepIdx] || steps[0];

    // Cálculo de Progreso General
    const totalStepsInSession = steps.length * totalCycles;
    const currentStepNumber = (currentCycle - 1) * steps.length + (currentStepIdx + 1);
    const progressPercent = isCompleted ? 100 : Math.round(((currentStepNumber - 1) / totalStepsInSession) * 100);

    // Control del temporizador sincronizado
    useEffect(() => {
      let interval = null;
      if (isActive && !isCompleted) {
        interval = setInterval(() => {
          setStepSecondsLeft(prev => {
            if (prev > 1) return prev - 1;

            if (currentStepIdx < steps.length - 1) {
              const nextIdx = currentStepIdx + 1;
              setCurrentStepIdx(nextIdx);
              const nextStep = steps[nextIdx];
              speakVoiceCue(nextStep.voice, voiceEnabled);
              return nextStep.duration;
            } else {
              if (currentCycle < totalCycles) {
                setCurrentCycle(c => c + 1);
                setCurrentStepIdx(0);
                speakVoiceCue(`Ciclo ${currentCycle} completado. Continuamos.`, voiceEnabled);
                return steps[0].duration;
              } else {
                setIsCompleted(true);
                setIsActive(false);
                setHasStarted(false);
                speakVoiceCue('Excelente trabajo. Has completado el ejercicio.', voiceEnabled);
                if (onComplete && !readOnly) onComplete();
                return 0;
              }
            }
          });
        }, 1000);
      }
      return () => clearInterval(interval);
    }, [isActive, isCompleted, currentStepIdx, currentCycle, steps, totalCycles, voiceEnabled, onComplete, readOnly]);

    const handleStart = () => {
      setIsActive(true);
      setHasStarted(true);
      setIsCompleted(false);
      speakVoiceCue(currentStep.voice || 'Comenzamos.', voiceEnabled);
    };

    const handlePause = () => setIsActive(false);
    const handleResume = () => setIsActive(true);

    const handleReset = () => {
      setIsActive(false);
      setHasStarted(false);
      setIsCompleted(false);
      setCurrentCycle(1);
      setCurrentStepIdx(0);
      setStepSecondsLeft(steps[0]?.duration || 4);
      window.speechSynthesis?.cancel();
    };

    const handleSkipStep = () => {
      if (currentStepIdx < steps.length - 1) {
        const nextIdx = currentStepIdx + 1;
        setCurrentStepIdx(nextIdx);
        setStepSecondsLeft(steps[nextIdx].duration);
        speakVoiceCue(steps[nextIdx].voice, voiceEnabled);
      } else if (currentCycle < totalCycles) {
        setCurrentCycle(c => c + 1);
        setCurrentStepIdx(0);
        setStepSecondsLeft(steps[0].duration);
      } else {
        setIsCompleted(true);
        setIsActive(false);
        if (onComplete && !readOnly) onComplete();
      }
    };

    // Determinar pose para Angie y Kenny
    let colibriExercisePose = 'neutral';
    const stepText = `${currentStep.text || ''} ${currentStep.name || ''}`.toLowerCase();
    const stepType = currentStep.type || 'step';

    if (isCompleted) {
      colibriExercisePose = 'celebrate';
    } else if (stepType === 'inhale' || stepText.includes('inhala') || stepText.includes('toma aire') || stepText.includes('llena tus pulmones')) {
      colibriExercisePose = 'inhale';
    } else if (stepType === 'hold' || stepType === 'hold_out' || stepText.includes('mantén') || stepText.includes('sostén') || stepText.includes('pausa')) {
      colibriExercisePose = 'hold';
    } else if (stepType === 'exhale' || stepText.includes('exhala') || stepText.includes('suelta el aire') || stepText.includes('vacía')) {
      colibriExercisePose = 'exhale';
    } else if (stepText.includes('suelta los hombros') || stepText.includes('suelta') || stepText.includes('soltado') || stepText.includes('golpe') || stepText.includes('deja caer')) {
      colibriExercisePose = 'shoulder_drop';
    } else if (stepText.includes('eleva los hombros') || stepText.includes('eleva') || stepText.includes('oreja') || stepText.includes('elevación') || stepText.includes('sube los hombros')) {
      colibriExercisePose = 'shoulder_lift';
    } else if (stepText.includes('rotación') || stepText.includes('círculo') || stepText.includes('circunferencia') || (stepText.includes('hombro') && !stepText.includes('eleva') && !stepText.includes('suelta') && !stepText.includes('relajado'))) {
      colibriExercisePose = 'shoulder_roll';
    } else if (stepText.includes('apertura de pecho') || stepText.includes('detrás de la espalda') || stepText.includes('omóplatos') || stepText.includes('pecho y relaja la espalda') || stepText.includes('abre el pecho')) {
      colibriExercisePose = 'chest_open';
    } else if (stepText.includes('extensión de palma') || (stepText.includes('palma') && stepText.includes('derech'))) {
      colibriExercisePose = 'palm_stretch_right';
    } else if (stepText.includes('extensión contralateral') || (stepText.includes('palma') && (stepText.includes('izquierd') || stepText.includes('izq')))) {
      colibriExercisePose = 'palm_stretch_left';
    } else if (stepText.includes('rotación de muñecas') || stepText.includes('muñeca') || stepText.includes('dedo')) {
      colibriExercisePose = 'wrist_roll';
    } else if (stepText.includes('puños') || stepText.includes('antebrazos') || stepText.includes('tensa') || stepText.includes('aprieta')) {
      colibriExercisePose = 'fist_clench';
    } else if (stepText.includes('torsión') || stepText.includes('torso') || stepText.includes('tronco') || stepText.includes('gira el cuerpo')) {
      colibriExercisePose = 'twist_right';
    } else if (stepText.includes('mentón') || stepText.includes('barbilla') || (stepText.includes('pecho') && stepText.includes('cabeza'))) {
      colibriExercisePose = 'neck_front';
    } else if (stepText.includes('cuello') && (stepText.includes('izquierd') || stepText.includes('izq'))) {
      colibriExercisePose = 'neck_left';
    } else if (stepText.includes('cuello') && (stepText.includes('derech') || stepText.includes('der'))) {
      colibriExercisePose = 'neck_right';
    } else if (stepText.includes('cuello') || stepText.includes('cabeza') || stepText.includes('lateral')) {
      colibriExercisePose = 'neck_right';
    } else if (stepText.includes('arriba') || stepText.includes('techo') || stepText.includes('estira los brazos') || stepText.includes('brazos') || stepText.includes('columna') || stepText.includes('extensión hacia el techo')) {
      colibriExercisePose = 'stretch_up';
    } else if (stepText.includes('siéntate') || stepText.includes('sentad') || stepText.includes('erguido') || stepText.includes('pies planos') || stepText.includes('pies en el suelo') || stepText.includes('flor de loto') || stepText.includes('4-7-8') || stepText.includes('478') || stepText.includes('postura') || stepText.includes('posición') || stepText.includes('grounding') || stepText.includes('anclaje')) {
      colibriExercisePose = 'seated';
    } else {
      colibriExercisePose = 'neutral';
    }

    return (
      <div 
        className="futuristic-card-item animate-fade" 
        style={{ 
          padding: '30px 28px', 
          borderRadius: '28px', 
          border: '1.5px solid rgba(192, 132, 252, 0.35)', 
          backgroundColor: 'var(--bg-secondary, #ffffff)',
          boxShadow: '0 24px 50px -12px rgba(126, 34, 206, 0.12)',
          maxWidth: '920px',
          margin: '0 auto'
        }}
      >
        {/* BARRA SUPERIOR: ENCABEZADO Y SELECTOR DE GUÍAS TIPO TABS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid rgba(192, 132, 252, 0.15)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', backgroundColor: 'rgba(139, 92, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7e22ce' }}>
              <Wind size={20} />
            </div>
            <div>
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted, #64748b)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Ejercicio
              </span>
              <h3 style={{ fontSize: '17px', fontWeight: '900', color: 'var(--text-primary, #0f172a)', margin: 0 }}>
                {resource.title || config.title || 'Relajación y Liberación de Hombros'}
              </h3>
            </div>
          </div>

          {/* TABS SELECTORAS DE GUÍA: ANGIE | KENNY */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', backgroundColor: 'var(--bg-tertiary, #f8fafc)', padding: '4px', borderRadius: '16px', border: '1px solid var(--border, #e2e8f0)' }}>
              <button
                type="button"
                onClick={() => setSelectedGuide('female')}
                style={{
                  padding: '6px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: selectedGuide === 'female' ? '#7e22ce' : 'transparent',
                  color: selectedGuide === 'female' ? '#ffffff' : 'var(--text-secondary, #475569)',
                  fontSize: '12.5px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: selectedGuide === 'female' ? '0 4px 12px rgba(126, 34, 206, 0.25)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>👧 Angie</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedGuide('male')}
                style={{
                  padding: '6px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: selectedGuide === 'male' ? '#7e22ce' : 'transparent',
                  color: selectedGuide === 'male' ? '#ffffff' : 'var(--text-secondary, #475569)',
                  fontSize: '12.5px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: selectedGuide === 'male' ? '0 4px 12px rgba(126, 34, 206, 0.25)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>🙋‍♂️ Kenny</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              title={voiceEnabled ? 'Silenciar voz' : 'Activar voz'}
              style={{
                padding: '7px 12px',
                borderRadius: '12px',
                border: '1px solid var(--border, #e2e8f0)',
                backgroundColor: voiceEnabled ? 'rgba(139, 92, 246, 0.1)' : 'var(--bg-tertiary, #f8fafc)',
                color: voiceEnabled ? '#7e22ce' : 'var(--text-muted, #64748b)',
                fontSize: '11.5px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
          </div>
        </div>

        {/* LAYOUT PRINCIPAL: CRONÓMETRO + TEXTO A LA IZQ / ESCENARIO VECTORIAL 3D AL CENTRO */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 340px) 1fr', gap: '28px', alignItems: 'center', marginBottom: '24px' }}>
          
          {/* COLUMNA IZQUIERDA: INFORMACIÓN, CRONÓMETRO Y MENSAJE */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
            <div>
              <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#7e22ce', backgroundColor: 'rgba(139, 92, 246, 0.08)', padding: '4px 10px', borderRadius: '8px', display: 'inline-block', marginBottom: '8px' }}>
                Paso {currentStepIdx + 1} de {steps.length}
              </span>
              <h2 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text-primary, #0f172a)', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
                {currentStep.name || 'Soltado'}
              </h2>
              <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-secondary, #475569)', margin: 0, lineHeight: '1.5' }}>
                {isActive ? currentStep.text : (isCompleted ? '¡Excelente trabajo! Has completado la práctica.' : currentStep.text)}
              </p>
            </div>

            {/* CRONÓMETRO CIRCULAR EXACTO A LA REFERENCIA */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginTop: '6px' }}>
              <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="50" cy="50" r="42" stroke="rgba(192, 132, 252, 0.2)" strokeWidth="8" fill="none" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="#a855f7"
                    strokeWidth="8"
                    strokeLinecap="round"
                    fill="none"
                    style={{
                      strokeDasharray: 263.89,
                      strokeDashoffset: 263.89 * (1 - (stepSecondsLeft / (currentStep.duration || 4))),
                      transition: 'stroke-dashoffset 1s linear'
                    }}
                  />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '26px', fontWeight: '900', color: '#7e22ce', lineHeight: '1' }}>
                    {String(stepSecondsLeft).padStart(2, '0')}
                  </span>
                  <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginTop: '2px' }}>
                    seg
                  </span>
                </div>
              </div>

              {/* Botón Principal de Acción */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* No iniciado aún */}
                {!isActive && !hasStarted && !isCompleted && (
                  <button
                    type="button"
                    onClick={handleStart}
                    style={{
                      padding: '12px 24px',
                      borderRadius: '16px',
                      border: 'none',
                      backgroundColor: '#7e22ce',
                      color: '#ffffff',
                      fontSize: '13.5px',
                      fontWeight: '900',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 6px 18px rgba(126, 34, 206, 0.35)',
                      transition: 'transform 0.15s, background-color 0.2s'
                    }}
                  >
                    <Play size={16} fill="#ffffff" /> Iniciar
                  </button>
                )}

                {/* En ejecución */}
                {isActive && !isCompleted && (
                  <button
                    type="button"
                    onClick={handlePause}
                    style={{
                      padding: '11px 22px',
                      borderRadius: '14px',
                      border: '1.5px solid var(--border, #e2e8f0)',
                      backgroundColor: 'var(--bg-tertiary, #f8fafc)',
                      color: 'var(--text-primary, #334155)',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '7px'
                    }}
                  >
                    <Pause size={15} /> Pausar
                  </button>
                )}

                {/* Pausado: Opciones de Continuar y Reiniciar */}
                {!isActive && hasStarted && !isCompleted && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={handleResume}
                      style={{
                        padding: '11px 20px',
                        borderRadius: '14px',
                        border: 'none',
                        backgroundColor: '#7e22ce',
                        color: '#ffffff',
                        fontSize: '13px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 14px rgba(126, 34, 206, 0.3)'
                      }}
                    >
                      <Play size={15} fill="#ffffff" /> Continuar
                    </button>
                    <button
                      type="button"
                      onClick={handleReset}
                      title="Reiniciar ejercicio desde el principio"
                      style={{
                        padding: '11px 16px',
                        borderRadius: '14px',
                        border: '1.5px solid var(--border, #e2e8f0)',
                        backgroundColor: 'var(--bg-tertiary, #f8fafc)',
                        color: 'var(--text-muted, #64748b)',
                        fontSize: '13px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <RotateCcw size={15} /> Reiniciar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Pill Motivacional */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '12px', backgroundColor: 'rgba(139, 92, 246, 0.08)', color: '#7e22ce', fontSize: '12px', fontWeight: '800', width: 'fit-content' }}>
              <span>💜</span>
              <span>Respira profundo, tú puedes.</span>
            </div>

            {/* Barra de Progreso del Ejercicio */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted, #64748b)', marginBottom: '4px' }}>
                <span>Progreso del ejercicio</span>
                <span>{progressPercent}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', borderRadius: '4px', backgroundColor: 'rgba(192, 132, 252, 0.2)', overflow: 'hidden' }}>
                <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: '#7e22ce', borderRadius: '4px', transition: 'width 0.4s ease' }} />
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: ESCENARIO CON PLATAFORMA CIRCULAR */}
          <div 
            className="stage-wellness-container"
            style={{
              position: 'relative',
              width: '100%',
              minHeight: '340px',
              borderRadius: '28px',
              background: 'linear-gradient(150deg, #faf5ff 0%, #f3e8ff 45%, #eef2ff 100%)',
              border: '1.5px solid rgba(192, 132, 252, 0.4)',
              boxShadow: '0 20px 45px -12px rgba(126, 34, 206, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
              padding: '24px 16px 14px',
              overflow: 'hidden'
            }}
          >
            {/* Destellos ambientales */}
            <div style={{ position: 'absolute', top: '20px', right: '24px', opacity: 0.6 }}>
              <Sparkles size={16} color="#c084fc" />
            </div>
            <div style={{ position: 'absolute', bottom: '30px', left: '24px', opacity: 0.5 }}>
              <Sparkles size={14} color="#f472b6" />
            </div>

            {/* Plataforma 3D Circular en Perspectiva */}
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                width: '210px',
                height: '46px',
                borderRadius: '50%',
                background: 'linear-gradient(180deg, #e9d5ff 0%, #d8b4fe 40%, #c084fc 100%)',
                boxShadow: '0 12px 28px rgba(126, 34, 206, 0.25), inset 0 2px 4px rgba(255, 255, 255, 0.8)',
                border: '1.5px solid rgba(255, 255, 255, 0.7)',
                zIndex: 1
              }}
            />

            {/* Renderizado del Avatar Vectorial Cinemático */}
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', width: '100%', minHeight: '300px', marginBottom: '4px' }}>
              {selectedGuide === 'male' ? (
                <KennyAvatar compact={false} pose={colibriExercisePose} duration={currentStep.duration || 4} />
              ) : (
                <AngieAvatar compact={false} pose={colibriExercisePose} duration={currentStep.duration || 4} />
              )}
            </div>
          </div>
        </div>

        {/* BARRA INFERIOR: REINICIAR Y FINALIZAR */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid rgba(192, 132, 252, 0.15)', gap: '10px' }}>
          <button
            type="button"
            onClick={handleReset}
            title="Reiniciar ejercicio"
            style={{
              padding: '8px 14px',
              borderRadius: '12px',
              border: '1px solid var(--border, #e2e8f0)',
              backgroundColor: 'var(--bg-tertiary, #f8fafc)',
              color: 'var(--text-muted, #64748b)',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RotateCcw size={13} /> Reiniciar
          </button>
          <button
            type="button"
            onClick={handleSkipStep}
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              border: '1.5px solid rgba(139, 92, 246, 0.3)',
              backgroundColor: 'transparent',
              color: '#7e22ce',
              fontSize: '12px',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>Finalizar ejercicio</span>
          </button>
        </div>

        {/* PANTALLA DE FINALIZACIÓN EXITOSA */}
        {isCompleted && (
          <div className="animate-fade" style={{ marginTop: '20px', padding: '20px', backgroundColor: 'rgba(34, 197, 94, 0.08)', borderRadius: '20px', border: '1.5px solid #22c55e', textAlign: 'center' }}>
            <h4 style={{ fontSize: '18px', fontWeight: '900', color: '#16a34a', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Award size={22} /> ¡Ejercicio de Bienestar Completado!
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-primary, #334155)', margin: '0 0 12px 0', fontWeight: '600' }}>
              Has completado con éxito {totalCycles} ciclos de {resource.title || 'tu práctica diaria'}.
            </p>
            <button
              type="button"
              onClick={handleReset}
              style={{
                padding: '8px 22px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              Repetir Ejercicio
            </button>
          </div>
        )}
      </div>
    );
  
};

const ChecklistPlayer = ({ resource, config, savedAnswers, onSaveAnswers, onComplete, readOnly }) => {

    const items = config.items || [
      { id: 'item_1', text: 'Tomar 1 vaso de agua al despertar', required: true, xp: 2 },
      { id: 'item_2', text: 'Hacer 3 respiraciones profundas conscientes', required: true, xp: 3 },
      { id: 'item_3', text: 'Realizar 5 minutos de estiramiento suave', required: false, xp: 2 }
    ];

    const [checkedItems, setCheckedItems] = useState(savedAnswers.checked_items || {});

    const totalCount = items.length;
    const checkedCount = Object.values(checkedItems).filter(Boolean).length;
    const percent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;
    const requiredItems = items.filter(it => it.required);
    const requiredChecked = requiredItems.filter(it => checkedItems[it.id]).length;
    const isCompleted = config.completion_behavior === 'min_percent'
      ? percent >= (config.min_percent || 80)
      : requiredChecked === requiredItems.length && requiredItems.length > 0;

    const toggleItem = async (itemId) => {
      if (readOnly) return;
      const nextChecked = { ...checkedItems, [itemId]: !checkedItems[itemId] };
      setCheckedItems(nextChecked);
      if (onSaveAnswers) {
        await onSaveAnswers({ checked_items: nextChecked });
      }
    };

    return (
      <div className="futuristic-card-item" style={{ padding: '22px', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckSquare size={18} style={{ color: 'var(--primary)' }} />
              <span>Checklist de Bienestar ({checkedCount}/{totalCount})</span>
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Marca cada actividad conforme la completes en tu rutina diaria.
            </p>
          </div>
          <span style={{ fontSize: '12px', fontWeight: '800', color: isCompleted ? 'var(--success)' : 'var(--primary)', padding: '4px 10px', borderRadius: '10px', backgroundColor: isCompleted ? 'var(--success-light)' : 'var(--primary-light)' }}>
            {percent}% Completado
          </span>
        </div>

        {/* Barra de progreso */}
        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden', marginBottom: '18px' }}>
          <div style={{ width: `${percent}%`, height: '100%', backgroundColor: isCompleted ? 'var(--success)' : 'var(--primary)', transition: 'width 0.4s ease' }} />
        </div>

        {/* Lista de ítems */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
          {items.map((item, idx) => {
            const isChecked = !!checkedItems[item.id];
            return (
              <div 
                key={item.id || idx}
                onClick={() => toggleItem(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  backgroundColor: isChecked ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-secondary)',
                  border: `1px solid ${isChecked ? 'var(--success)' : 'var(--border)'}`,
                  cursor: readOnly ? 'default' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {isChecked ? (
                  <CheckCircle2 size={20} style={{ color: 'var(--success)', flexShrink: 0 }} />
                ) : (
                  <Circle size={20} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1 }}>
                  <span style={{
                    fontSize: '13.5px',
                    fontWeight: isChecked ? '600' : '700',
                    textDecoration: isChecked ? 'line-through' : 'none',
                    color: isChecked ? 'var(--text-muted)' : 'var(--text-primary)'
                  }}>
                    {item.text}
                  </span>
                  {item.required && (
                    <span style={{ marginLeft: '8px', fontSize: '10px', fontWeight: '800', color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '2px 6px', borderRadius: '6px' }}>
                      Obligatorio
                    </span>
                  )}
                </div>
                {item.xp > 0 && (
                  <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Sparkles size={11} /> +{item.xp} XP
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {isCompleted && (
          <div className="animate-fade" style={{ padding: '14px', borderRadius: '12px', backgroundColor: 'var(--success-light)', color: 'var(--success)', textAlign: 'center', fontWeight: '800', fontSize: '13px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Award size={16} />
            <span>{config.completion_message || 'Has completado todas las actividades del checklist con éxito.'}</span>
          </div>
        )}

        {!readOnly && onComplete && isCompleted && (
          <button 
            type="button" 
            onClick={onComplete}
            className="btn btn-primary"
            style={{ width: '100%', padding: '10px', fontSize: '13px', fontWeight: '900', borderRadius: '10px' }}
          >
            <Sparkles size={14} /> Reclamar {resource.xp_reward || 15} XP de Checklist
          </button>
        )}
      </div>
    );
};

// ============================================================================
  // 3. AUDIO / MEDITACIÓN CON REPRODUCTOR INTERACTIVO Y TRANSCRIPCIÓN
  // ============================================================================

const AudioGuidedPlayer = ({ resource, config, onComplete, readOnly }) => {

    const audioUrl = config.audio_url || 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg';
    const narrator = config.narrator || 'Sofía Gómez (Voz de Bienestar)';
    const duration = config.duration_minutes || resource?.reading_time_minutes || 5;
    const transcription = config.transcription || resource?.content || 'Respira profundamente mientras escuchas esta guía sonora de calma y serenidad.';

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [audioDuration, setAudioDuration] = useState(duration * 60);
    const audioRef = useRef(null);

    const togglePlay = () => {
      if (!audioRef.current) return;
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(e => console.log('Audio playback error:', e));
        setIsPlaying(true);
};

const handleTimeUpdate = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
        if (audioRef.current.duration) {
          setAudioDuration(audioRef.current.duration);
        }
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (onComplete && !readOnly) onComplete();
    };

    const formatTime = (secs) => {
      const mins = Math.floor(secs / 60);
      const s = Math.floor(secs % 60);
      return `${mins}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
      <div className="futuristic-card-item" style={{ padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
        <audio 
          ref={audioRef} 
          src={audioUrl} 
          onTimeUpdate={handleTimeUpdate} 
          onEnded={handleEnded} 
          preload="metadata"
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Headphones size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>
                {resource.title || 'Meditación Sonora'}
              </h4>
              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0 }}>
                Narrado por: <strong>{narrator}</strong> • {duration} min
              </p>
            </div>
          </div>

          <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', padding: '3px 8px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Headphones size={12} /> Audio Guiado
          </span>
        </div>

        {/* Reproductor de Audio Visual */}
        <div style={{ backgroundColor: 'var(--bg-primary)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border)', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
            <button
              type="button"
              onClick={togglePlay}
              className="btn btn-primary"
              style={{ width: '46px', height: '46px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '2px' }} />}
            </button>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(audioDuration)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={audioDuration || 100}
                value={currentTime}
                onChange={(e) => {
                  const t = parseFloat(e.target.value);
                  setCurrentTime(t);
                  if (audioRef.current) audioRef.current.currentTime = t;
                }}
                style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Music size={13} style={{ color: 'var(--primary)' }} /> Fondo: {config.background_music || 'Zen & Armonía'}
            </span>
            <span style={{ fontWeight: '800', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={12} /> +{resource.xp_reward || 15} XP al escuchar
            </span>
          </div>
        </div>

        {/* Transcripción / Guía */}
        {transcription && (
          <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={13} /> Guía y Transcripción:
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-primary)', lineHeight: '1.6', margin: 0 }}>
              {transcription}
            </p>
          </div>
        )}
      </div>
    );
};

// ============================================================================
  // 4. VIDEO EDUCATIVO CON REPRODUCTOR EMBEBIDO Y PUNTOS CLAVE
  // ============================================================================

const VideoPlayer = ({ resource, config, onComplete, readOnly }) => {

    const videoUrl = getEmbedUrl(config.video_url || 'https://www.youtube.com/embed/inpok4MKVLM');
    const duration = config.duration_minutes || resource?.reading_time_minutes || 5;
    const transcription = config.transcription || resource?.content;

    return (
      <div className="futuristic-card-item" style={{ padding: '22px', borderRadius: '16px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Video size={19} />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>
                {resource.title || 'Video Educativo'}
              </h4>
              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0 }}>
                Duración: ~{duration} min
              </p>
            </div>
          </div>

          <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--danger)', padding: '3px 8px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Video size={12} /> Video Interactivo
          </span>
        </div>

        {/* Reproductor de Video Embebido */}
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '14px', border: '1px solid var(--border)', marginBottom: '16px', backgroundColor: '#000' }}>
          <iframe
            src={videoUrl}
            title={resource.title || 'Video de Bienestar'}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Puntos Clave */}
        {transcription && (
          <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)', marginBottom: '16px' }}>
            <div style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={13} /> Lección Clave y Resumen:
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-primary)', lineHeight: '1.6', margin: 0 }}>
              {transcription}
            </p>
          </div>
        )}

        {!readOnly && onComplete && (
          <button 
            type="button" 
            onClick={onComplete}
            className="btn btn-primary"
            style={{ width: '100%', padding: '10px', fontSize: '13px', fontWeight: '900', borderRadius: '10px' }}
          >
            <Check size={14} /> Marcar Video como Visto (+{resource.xp_reward || 15} XP)
          </button>
        )}
      </div>
    );
};

// ============================================================================
  // 5. REGISTRO EMOCIONAL INTERACTIVO
  // ============================================================================

const EmotionalLogPlayer = ({ resource, config, savedAnswers, onSaveAnswers, onComplete, readOnly }) => {

    const emotions = config.available_emotions || [
      'Calma', 'Alegría', 'Tensión', 'Cansancio', 
      'Motivación', 'Tristeza', 'Frustración', 'Gratitud'
    ];
    const tags = config.tags || ['Trabajo', 'Familia', 'Salud', 'Descanso', 'Metas'];

    const [selectedEmotion, setSelectedEmotion] = useState(savedAnswers.selected_emotion || '');
    const [intensity, setIntensity] = useState(savedAnswers.intensity || 5);
    const [selectedTag, setSelectedTag] = useState(savedAnswers.context_tag || '');
    const [note, setNote] = useState(savedAnswers.note || '');
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = () => {
      if (onSaveAnswers) {
        onSaveAnswers({
          selected_emotion: selectedEmotion,
          intensity: intensity,
          context_tag: selectedTag,
          note: note
        });
      }
      setIsSaved(true);
      if (onComplete && !readOnly) onComplete();
    };

    return (
      <div className="futuristic-card-item" style={{ padding: '22px', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Smile size={18} style={{ color: 'var(--primary)' }} />
            <span>Registro Emocional Consciente</span>
          </h4>
          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={13} /> Registro Confidencial
          </span>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
          {config.additional_prompt || '¿Cómo te sientes en este momento y qué influyó en tu estado?'}
        </p>

        {/* Selector de Emociones */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
          {emotions.map((emo, idx) => {
            const isSel = selectedEmotion === emo;
            return (
              <button
                key={idx}
                type="button"
                disabled={readOnly}
                onClick={() => setSelectedEmotion(emo)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: `1px solid ${isSel ? 'var(--primary)' : 'var(--border)'}`,
                  backgroundColor: isSel ? 'var(--primary)' : 'var(--bg-secondary)',
                  color: isSel ? '#fff' : 'var(--text-primary)',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  cursor: readOnly ? 'default' : 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {emo}
              </button>
            );
          })}
        </div>

        {/* Barra de Intensidad */}
        <div style={{ marginBottom: '18px', padding: '14px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '800', marginBottom: '8px' }}>
            <span>Nivel de Intensidad:</span>
            <span style={{ color: 'var(--primary)' }}>{intensity} / 10</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            disabled={readOnly}
            value={intensity}
            onChange={(e) => setIntensity(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--primary)', cursor: readOnly ? 'default' : 'pointer' }}
          />
        </div>

        {/* Tags de Contexto */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            ÁREA O CONTEXTO PRINCIPAL:
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {tags.map((t, idx) => {
              const isSel = selectedTag === t;
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={readOnly}
                  onClick={() => setSelectedTag(t)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    border: `1px solid ${isSel ? 'var(--primary)' : 'var(--border)'}`,
                    backgroundColor: isSel ? 'var(--primary-light)' : 'var(--bg-tertiary)',
                    color: isSel ? 'var(--primary)' : 'var(--text-secondary)',
                    fontSize: '11.5px',
                    fontWeight: isSel ? '800' : '600',
                    cursor: readOnly ? 'default' : 'pointer'
                  }}
                >
                  #{t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Nota libre */}
        <div style={{ marginBottom: '18px' }}>
          <textarea
            rows={2}
            disabled={readOnly}
            placeholder="Comentario o reflexión breve (opcional)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '12.5px', resize: 'vertical' }}
          />
        </div>

        {!readOnly && (
          <button 
            type="button" 
            onClick={handleSave}
            className="btn btn-primary"
            style={{ width: '100%', padding: '10px', fontSize: '13px', fontWeight: '900', borderRadius: '10px' }}
          >
            <Heart size={14} /> {isSaved ? 'Registro Guardado con Éxito' : 'Registrar Estado Emocional (+15 XP)'}
          </button>
        )}
      </div>
    );
};

// ============================================================================
  // 6. QUIZ EDUCATIVO
  // ============================================================================

const QuizPlayer = ({ resource, config, savedAnswers, onSaveAnswers, onComplete, readOnly }) => {

    const questions = config.questions || [
      {
        id: 'q1',
        question: '¿Cuál es una técnica efectiva para reducir la rumiación nocturna?',
        type: 'single',
        options: ['Tomar cafeína antes de dormir', 'Escribir las preocupaciones en una libreta (Brain Dump)', 'Ver pantallas brillantes en la cama', 'Saltarse la cena'],
        correct_answer: 1,
        explanation: 'Anotar pensamientos pendientes antes de acostarte ayuda a descargar la memoria de trabajo y disminuye la hiperactivación mental.'
      }
    ];

    const [answers, setAnswers] = useState(savedAnswers.quiz_answers || {});
    const [showResults, setShowResults] = useState(false);

    const handleSelect = (qId, optionIdx) => {
      if (readOnly || showResults) return;
      setAnswers(prev => ({ ...prev, [qId]: optionIdx }));
    };

    const handleCheckResults = () => {
      setShowResults(true);
      if (onSaveAnswers) onSaveAnswers({ quiz_answers: answers });
      if (onComplete && !readOnly) onComplete();
    };

    let score = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct_answer || String(answers[q.id]) === String(q.correct_answer)) {
        score++;
      }
    });

    return (
      <div className="futuristic-card-item" style={{ padding: '22px', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Brain size={18} style={{ color: 'var(--primary)' }} />
              <span>Cuestionario Educativo de Bienestar ({questions.length} preguntas)</span>
            </h4>
            <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Pon a prueba tus conocimientos sobre hábitos y autocuidado.
            </p>
          </div>
          {showResults && (
            <span style={{ fontSize: '12px', fontWeight: '800', padding: '4px 10px', borderRadius: '8px', backgroundColor: score === questions.length ? 'var(--success-light)' : 'var(--primary-light)', color: score === questions.length ? 'var(--success)' : 'var(--primary)' }}>
              Puntuación: {score}/{questions.length}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
          {questions.map((q, qIdx) => {
            const selectedOpt = answers[q.id];
            return (
              <div key={q.id || qIdx} style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '13.5px', fontWeight: '800', marginBottom: '12px' }}>
                  {qIdx + 1}. {q.question}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedOpt === optIdx || selectedOpt === opt;
                    const isCorrect = showResults && (q.correct_answer === optIdx || q.correct_answer === opt);
                    const isWrongSelected = showResults && isSelected && !isCorrect;

                    let bg = 'var(--bg-tertiary)';
                    let borderColor = 'var(--border)';
                    let textColor = 'var(--text-primary)';

                    if (showResults) {
                      if (isCorrect) {
                        bg = 'var(--success-light)';
                        borderColor = 'var(--success)';
                        textColor = 'var(--success)';
                      } else if (isWrongSelected) {
                        bg = 'var(--danger-light)';
                        borderColor = 'var(--danger)';
                        textColor = 'var(--danger)';
                      }
                    } else if (isSelected) {
                      bg = 'var(--primary-light)';
                      borderColor = 'var(--primary)';
                      textColor = 'var(--primary)';
                    }

                    return (
                      <div 
                        key={optIdx}
                        onClick={() => handleSelect(q.id, optIdx)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '10px',
                          backgroundColor: bg,
                          border: `1px solid ${borderColor}`,
                          color: textColor,
                          fontSize: '13px',
                          fontWeight: isSelected ? '700' : '500',
                          cursor: (readOnly || showResults) ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <span style={{ width: '22px', height: '22px', borderRadius: '50%', border: '1px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800' }}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                    );
                  })}
                </div>

                {showResults && q.explanation && (
                  <div className="animate-fade" style={{ marginTop: '12px', padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', fontSize: '12px', color: 'var(--text-secondary)', borderLeft: '3px solid var(--primary)' }}>
                    <strong>Explicación didáctica:</strong> {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={14} style={{ color: 'var(--primary)' }} />
          <span>{config.disclaimer || 'Este cuestionario es de naturaleza didáctica y formativa, no constituye evaluación clínica.'}</span>
        </div>

        {!showResults && !readOnly && (
          <button 
            type="button" 
            onClick={handleCheckResults}
            className="btn btn-primary"
            style={{ width: '100%', padding: '10px', fontSize: '13px', fontWeight: '900', borderRadius: '10px' }}
          >
            Verificar Respuestas y Finalizar Quiz
          </button>
        )}
      </div>
    );
};

// ============================================================================
  // 7. RETO / DESAFÍO MULTIETAPAS (Día 1...N con progreso secuencial)
  // ============================================================================

const ChallengePlayer = ({ resource, config, savedAnswers, onSaveAnswers, onComplete, readOnly }) => {

    const days = config.days || [
      { day: 1, title: 'Día 1: Desconexión Digital 30 min', task: 'Apaga pantallas 30 min antes de dormir', xp: 5 },
      { day: 2, title: 'Día 2: Hidratación Consciente', task: 'Bebe 2 litros de agua durante la jornada', xp: 5 },
      { day: 3, title: 'Día 3: Pausa Activa de Mediodía', task: 'Realiza 5 min de estiramiento al mediodía', xp: 5 },
      { day: 4, title: 'Día 4: Reflexión de Gratitud', task: 'Escribe 3 cosas positivas de tu jornada', xp: 5 },
      { day: 5, title: 'Día 5: Caminata al Aire Libre', task: 'Camina 15 minutos en contacto con la luz natural', xp: 5 },
      { day: 6, title: 'Día 6: Conversación Significativa', task: 'Conecta con un amigo o colega sin hablar de trabajo', xp: 5 },
      { day: 7, title: 'Día 7: Balance y Cierre', task: 'Revisa tus logros semanales y celebra tu constancia', xp: 10 }
    ];

    const [completedDays, setCompletedDays] = useState(savedAnswers.completed_days || {});

    const toggleDay = (dayNum) => {
      if (readOnly) return;
      const next = { ...completedDays, [dayNum]: !completedDays[dayNum] };
      setCompletedDays(next);
      if (onSaveAnswers) onSaveAnswers({ completed_days: next });
    };

    const doneCount = Object.values(completedDays).filter(Boolean).length;
    const progressPct = days.length > 0 ? Math.round((doneCount / days.length) * 100) : 0;

    return (
      <div className="futuristic-card-item" style={{ padding: '22px', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} style={{ color: 'var(--primary)' }} />
              <span>Reto de Bienestar ({doneCount}/{days.length} Días Completados)</span>
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Completa cada desafío diario a tu propio ritmo para forjar hábitos sólidos.
            </p>
          </div>
          <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', padding: '4px 10px', borderRadius: '10px', backgroundColor: 'var(--primary-light)' }}>
            {progressPct}% Progreso
          </span>
        </div>

        {/* Barra de progreso */}
        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden', marginBottom: '18px' }}>
          <div style={{ width: `${progressPct}%`, height: '100%', backgroundColor: 'var(--primary)', transition: 'width 0.4s ease' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          {days.map((d, idx) => {
            const isDone = !!completedDays[d.day];
            return (
              <div 
                key={d.day || idx}
                onClick={() => toggleDay(d.day)}
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  backgroundColor: isDone ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-secondary)',
                  border: `1px solid ${isDone ? 'var(--success)' : 'var(--border)'}`,
                  cursor: readOnly ? 'default' : 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: isDone ? 'var(--success)' : 'var(--primary)' }}>
                    DÍA {d.day}
                  </span>
                  {isDone ? <CheckCircle2 size={16} style={{ color: 'var(--success)' }} /> : <Circle size={16} style={{ color: 'var(--text-muted)' }} />}
                </div>
                <h5 style={{ fontSize: '13px', fontWeight: '800', color: isDone ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                  {d.title}
                </h5>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                  {d.task}
                </p>
                {d.xp > 0 && (
                  <span style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--warning)', marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Sparkles size={11} /> +{d.xp} XP
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {progressPct === 100 && (
          <div className="animate-fade" style={{ padding: '14px', borderRadius: '12px', backgroundColor: 'var(--success-light)', color: 'var(--success)', textAlign: 'center', fontWeight: '800', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Award size={16} /> Reto Completado. Has desbloqueado la medalla especial y acumulado tus XP de constancia.
          </div>
        )}
      </div>
    );
};

// ============================================================================
  // 9. GRATITUD (Registro Diario con XP)
  // ============================================================================

const GratitudePlayer = ({ resource, config, savedAnswers, onSaveAnswers, onComplete, readOnly }) => {

    const count = Number(config.item_count) || 3;
    const [items, setItems] = useState(savedAnswers.gratitude_items || Array(count).fill(''));
    const [saved, setSaved] = useState(false);

    const handleChange = (idx, text) => {
      const next = [...items];
      next[idx] = text;
      setItems(next);
    };

    const handleSave = () => {
      if (onSaveAnswers) onSaveAnswers({ gratitude_items: items });
      setSaved(true);
      if (onComplete && !readOnly) onComplete();
    };

    return (
      <div className="futuristic-card-item" style={{ padding: '22px', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <h4 style={{ fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Heart size={18} style={{ color: 'var(--primary)' }} />
          <span>Registro Diario de Gratitud</span>
        </h4>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          {config.prompt_text || `Escribe ${count} motivos por los cuales te sientes agradecido hoy.`}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
          {Array.from({ length: count }).map((_, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', flexShrink: 0 }}>
                {idx + 1}
              </span>
              <input 
                type="text"
                disabled={readOnly}
                placeholder={`Hoy agradezco por...`}
                value={items[idx] || ''}
                onChange={(e) => handleChange(idx, e.target.value)}
                style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px' }}
              />
            </div>
          ))}
        </div>

        {!readOnly && (
          <button 
            type="button" 
            onClick={handleSave}
            className="btn btn-primary"
            style={{ width: '100%', padding: '10px', fontSize: '13px', fontWeight: '900', borderRadius: '10px' }}
          >
            <Heart size={14} /> {saved ? 'Gratitud Guardada' : 'Guardar y Completar (+15 XP)'}
          </button>
        )}
      </div>
    );
};

// ============================================================================
  // 10. DIARIO PERSONAL & REFLEXIÓN GUIADA (Introspección 100% privada)
  // ============================================================================

const ReflectionPlayer = ({ type, resource, config, savedAnswers, onSaveAnswers, onComplete, readOnly }) => {

    const prompts = config.prompts || (config.main_question ? [config.main_question, ...(config.secondary_questions || [])] : ['¿Cómo te has sentido hoy?', '¿Qué situación requirió más energía?']);
    const [responses, setResponses] = useState(savedAnswers.reflection_responses || {});
    const [savedMsg, setSavedMsg] = useState(false);

    const handleTextChange = (pIdx, val) => {
      setResponses(prev => ({ ...prev, [pIdx]: val }));
    };

    const handleSave = () => {
      if (onSaveAnswers) onSaveAnswers({ reflection_responses: responses });
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
      if (onComplete && !readOnly) onComplete();
    };

    return (
      <div className="futuristic-card-item" style={{ padding: '22px', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PenLine size={18} style={{ color: 'var(--primary)' }} />
            <span>{type === 'diario' ? 'Diario Personal Confidencial' : 'Reflexión Guiada'}</span>
          </h4>
          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={13} /> 100% Privado
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '18px' }}>
          {prompts.map((p, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                {p}
              </label>
              <textarea 
                rows={3}
                disabled={readOnly}
                placeholder="Escribe libremente tus pensamientos..."
                value={responses[idx] || ''}
                onChange={(e) => handleTextChange(idx, e.target.value)}
                style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', resize: 'vertical' }}
              />
            </div>
          ))}
        </div>

        {!readOnly && (
          <button 
            type="button" 
            onClick={handleSave}
            className="btn btn-primary"
            style={{ width: '100%', padding: '10px', fontSize: '13px', fontWeight: '900', borderRadius: '10px' }}
          >
            <Send size={14} /> {savedMsg ? 'Reflexión Guardada' : 'Guardar Reflexión Privada'}
          </button>
        )}
      </div>
    );
};

// ============================================================================
  // 12. CONSEJO RÁPIDO
  // ============================================================================

const AdvicePlayer = ({ resource, config }) => {

    return (
      <div className="futuristic-card-item" style={{ padding: '24px', borderRadius: '16px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--primary-light)', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Lightbulb size={24} />
        </div>
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '6px', color: 'var(--primary)' }}>
            Consejo de Equilibrio
          </h4>
          <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: '1.5', margin: 0 }}>
            {config.key_takeaway || resource.content}
          </p>
        </div>
      </div>
    );
};

// ============================================================================
};

export const ResourceInteractivePlayer = ({ 
  resource, 
  userProgress, 
  onSaveAnswers, 
  onComplete,
  readOnly = false 
}) => {
  if (!resource) return null;
  const type = resource?.resource_type || 'articulo';
  const config = resource?.resource_config || resource?.interactive_data || {};
  const savedAnswers = userProgress?.interactive_answers || {};

  const isGuidedExercise = (
    type === 'respiracion' || 
    type === 'pausa_activa' || 
    type === 'grounding' || 
    (type === 'ejercicio' && (config.steps || config.inhale || config.total_cycles))
  );

  if (isGuidedExercise) {
    return <GuidedExercisePlayer resource={resource} config={config} onComplete={onComplete} readOnly={readOnly} />;
  }
  if (type === 'checklist') {
    return <ChecklistPlayer resource={resource} config={config} savedAnswers={savedAnswers} onSaveAnswers={onSaveAnswers} onComplete={onComplete} readOnly={readOnly} />;
  }
  if (type === 'audio') {
    return <AudioGuidedPlayer resource={resource} config={config} onComplete={onComplete} readOnly={readOnly} />;
  }
  if (type === 'video') {
    return <VideoPlayer resource={resource} config={config} onComplete={onComplete} readOnly={readOnly} />;
  }
  if (type === 'registro_emocional') {
    return <EmotionalLogPlayer resource={resource} config={config} savedAnswers={savedAnswers} onSaveAnswers={onSaveAnswers} onComplete={onComplete} readOnly={readOnly} />;
  }
  if (type === 'quiz') {
    return <QuizPlayer resource={resource} config={config} savedAnswers={savedAnswers} onSaveAnswers={onSaveAnswers} onComplete={onComplete} readOnly={readOnly} />;
  }
  if (type === 'reto') {
    return <ChallengePlayer resource={resource} config={config} savedAnswers={savedAnswers} onSaveAnswers={onSaveAnswers} onComplete={onComplete} readOnly={readOnly} />;
  }
  if (type === 'gratitud') {
    return <GratitudePlayer resource={resource} config={config} savedAnswers={savedAnswers} onSaveAnswers={onSaveAnswers} onComplete={onComplete} readOnly={readOnly} />;
  }
  if (type === 'diario' || type === 'reflexion') {
    return <ReflectionPlayer type={type} resource={resource} config={config} savedAnswers={savedAnswers} onSaveAnswers={onSaveAnswers} onComplete={onComplete} readOnly={readOnly} />;
  }
  if (type === 'consejo') {
    return <AdvicePlayer resource={resource} config={config} />;
  }

  return null;
};

export default ResourceInteractivePlayer;
