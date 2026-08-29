import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, Zap, Award, ArrowRight, ArrowLeft, ArrowUp, RotateCw, Eye, Compass, Activity, Wind } from 'lucide-react';

/**
 * Mascota Oficial de EquilibrIA: Colibrí Morado Inteligente y Demostrador de Poses de Bienestar
 * Ilustración SVG en capas con profundidad volumétrica 3D, sombreados suaves,
 * múltiples capas de animación reactiva y demostrador dinámico de posturas y ejercicios.
 */
const ColibriMascot = ({ 
  mood = 'welcome', // 'welcome' | 'thinking' | 'happy' | 'almost_done' | 'celebrate'
  customMessage = '',
  progressPercent = 0,
  compact = false,
  // Modos especiales para ejercicios guiados de bienestar:
  phase = null, // 'ready' | 'inhale' | 'hold' | 'exhale' | 'step' | 'celebrate'
  exercisePose = 'neutral', // 'neutral' | 'inhale' | 'hold' | 'exhale' | 'neck_right' | 'neck_left' | 'neck_front' | 'shoulder_roll' | 'shoulder_lift' | 'chest_open' | 'stretch_up' | 'twist_right' | 'twist_left' | 'wrist_roll' | 'eyes_closed' | 'celebrate'
  duration = 4, // Duración del paso en segundos para sincronización CSS
  inStage = false // Renderizar dentro del escenario "Sala de Bienestar"
}) => {
  const [bounce, setBounce] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Gatillar reacción sutil cada vez que cambia el estado, la fase o la pose
  useEffect(() => {
    setBounce(true);
    const t = setTimeout(() => setBounce(false), 600);
    return () => clearTimeout(t);
  }, [mood, phase, exercisePose, progressPercent]);

  // Mensaje motivacional contextual según estado y pose
  const getDefaultMessage = () => {
    if (customMessage) return customMessage;
    
    switch (exercisePose) {
      case 'neck_right':
        return 'Inclina suavemente tu cabeza hacia la derecha. Siente el estiramiento en el cuello.';
      case 'neck_left':
        return 'Ahora cambia hacia el lado izquierdo con suavidad y respira.';
      case 'neck_front':
        return 'Baja el mentón hacia el pecho liberando la tensión en la nuca.';
      case 'shoulder_roll':
        return 'Gira los hombros en círculos amplios y relajantes hacia atrás.';
      case 'shoulder_lift':
        return 'Eleva los hombros, retén 3 segundos y suelta de golpe con un suspiro.';
      case 'chest_open':
        return 'Abre el pecho hacia adelante y estira los brazos hacia atrás.';
      case 'stretch_up':
        return 'Estira la columna y los brazos hacia el cielo lo más alto posible.';
      case 'twist_right':
        return 'Gira suavemente el torso hacia la derecha con la espalda erguida.';
      case 'twist_left':
        return 'Gira suavemente hacia la izquierda respirando con tranquilidad.';
      case 'wrist_roll':
        return 'Rota las muñecas en círculos suaves para descansar tus manos.';
      case 'eyes_closed':
        return 'Cierra suavemente los ojos y deja descansar la vista de las pantallas.';
      default:
        break;
    }

    if (phase) {
      switch (phase) {
        case 'inhala':
        case 'inhale':
          return 'Inhala suavemente llenando tu abdomen de calma y oxígeno... 🌿';
        case 'reten_in':
        case 'hold':
          return 'Mantén la respiración y siente tu centro en equilibrio... 💜';
        case 'exhala':
        case 'exhale':
          return 'Exhala despacio soltando toda la tensión acumulada... ✨';
        case 'celebrate':
        case 'completado':
          return '¡Maravilloso trabajo! Has completado tu ejercicio de bienestar. 🎉';
        default:
          return 'Encuentra una postura cómoda y comencemos cuando gustes.';
      }
    }

    switch (mood) {
      case 'welcome':
        return '¡Hola! Te acompañaré en esta evaluación. Tómate tu tiempo y responde con sinceridad. 🌿';
      case 'happy':
        return '¡Excelente reflexión! Cada respuesta suma a tu bienestar y autoconocimiento. ✨';
      case 'thinking':
        return 'Respira profundo y escucha lo que sientes. No hay respuestas incorrectas. 💜';
      case 'almost_done':
        return '¡Casi terminamos! Estás a un solo paso de completar tu actividad. 🚀';
      case 'celebrate':
        return '¡Lo lograste! Has ganado tus puntos de XP y sumado a tu bienestar. ¡Gran trabajo! 🎉';
      default:
        return 'Avanzando paso a paso con calma...';
    }
  };

  // Cálculo de transformaciones y posturas visuales del Colibrí
  let bodyScale = 1;
  let bodyTranslateX = 0;
  let bodyTranslateY = 0;
  let bodyRotate = 0;
  let headRotate = 0;
  let headTranslateY = 0;
  let wingFrontTransform = 'rotate(0deg)';
  let wingBackTransform = 'rotate(0deg)';
  let wingAnimation = 'colibriFlapFront 0.18s infinite ease-in-out';
  let wingSpeed = '0.18s';
  let haloGlowColor = 'rgba(139, 92, 246, 0.35)';
  let haloScale = 1;
  let poseBadge = null;

  const currentPose = exercisePose || phase || 'neutral';

  switch (currentPose) {
    case 'inhale':
    case 'inhala':
      bodyScale = 1.18;
      bodyTranslateY = -14;
      bodyRotate = -6;
      headRotate = -10;
      haloGlowColor = 'rgba(56, 189, 248, 0.5)';
      haloScale = 1.4;
      wingSpeed = '0.12s';
      poseBadge = { text: 'Inhalación Profunda', icon: Wind, color: '#38bdf8' };
      break;

    case 'hold':
    case 'reten_in':
      bodyScale = 1.18;
      bodyTranslateY = -14;
      bodyRotate = -4;
      haloGlowColor = 'rgba(129, 140, 248, 0.5)';
      haloScale = 1.4;
      wingSpeed = '0.35s';
      poseBadge = { text: 'Retención Serena', icon: Sparkles, color: '#818cf8' };
      break;

    case 'exhale':
    case 'exhala':
      bodyScale = 0.90;
      bodyTranslateY = 8;
      bodyRotate = 4;
      headRotate = 6;
      haloGlowColor = 'rgba(236, 72, 153, 0.4)';
      haloScale = 0.85;
      wingSpeed = '0.24s';
      poseBadge = { text: 'Exhalación y Soltado', icon: Wind, color: '#ec4899' };
      break;

    case 'neck_right':
      headRotate = 28;
      bodyRotate = 14;
      bodyTranslateX = 12;
      bodyTranslateY = -4;
      haloGlowColor = 'rgba(245, 158, 11, 0.45)';
      poseBadge = { text: 'Inclinación Cuello Derecha', icon: ArrowRight, color: '#f59e0b' };
      break;

    case 'neck_left':
      headRotate = -28;
      bodyRotate = -14;
      bodyTranslateX = -12;
      bodyTranslateY = -4;
      haloGlowColor = 'rgba(245, 158, 11, 0.45)';
      poseBadge = { text: 'Inclinación Cuello Izquierda', icon: ArrowLeft, color: '#f59e0b' };
      break;

    case 'neck_front':
      headRotate = 18;
      headTranslateY = 10;
      bodyRotate = 12;
      bodyTranslateY = 6;
      haloGlowColor = 'rgba(245, 158, 11, 0.45)';
      poseBadge = { text: 'Flexión Cervical Frontal', icon: Activity, color: '#f59e0b' };
      break;

    case 'shoulder_roll':
      bodyScale = 1.05;
      wingAnimation = 'colibriShoulderRoll 1.2s infinite linear';
      haloGlowColor = 'rgba(16, 185, 129, 0.45)';
      haloScale = 1.25;
      poseBadge = { text: 'Rotación Circular de Hombros', icon: RotateCw, color: '#10b981' };
      break;

    case 'shoulder_lift':
      bodyTranslateY = -18;
      bodyScale = 1.08;
      headTranslateY = -6;
      wingFrontTransform = 'rotate(-25deg) translateY(-8px)';
      haloGlowColor = 'rgba(16, 185, 129, 0.45)';
      poseBadge = { text: 'Elevación y Descarga', icon: ArrowUp, color: '#10b981' };
      break;

    case 'chest_open':
      bodyScale = 1.15;
      bodyRotate = -12;
      wingFrontTransform = 'rotate(-45deg) scaleX(1.15)';
      wingBackTransform = 'rotate(45deg) scaleX(1.15)';
      haloGlowColor = 'rgba(255, 122, 0, 0.45)';
      haloScale = 1.35;
      poseBadge = { text: 'Apertura Torácica y Pecho', icon: Heart, color: '#ff7a00' };
      break;

    case 'stretch_up':
      bodyScale = 1.15;
      bodyRotate = -22;
      bodyTranslateY = -20;
      headRotate = -18;
      haloGlowColor = 'rgba(139, 92, 246, 0.5)';
      haloScale = 1.45;
      poseBadge = { text: 'Extensión de Columna hacia Arriba', icon: ArrowUp, color: '#8b5cf6' };
      break;

    case 'twist_right':
      bodyRotate = 20;
      bodyTranslateX = 14;
      haloGlowColor = 'rgba(14, 165, 233, 0.45)';
      poseBadge = { text: 'Torsión Espinal Derecha', icon: ArrowRight, color: '#0ea5e9' };
      break;

    case 'twist_left':
      bodyRotate = -20;
      bodyTranslateX = -14;
      haloGlowColor = 'rgba(14, 165, 233, 0.45)';
      poseBadge = { text: 'Torsión Espinal Izquierda', icon: ArrowLeft, color: '#0ea5e9' };
      break;

    case 'wrist_roll':
      wingAnimation = 'colibriWristRoll 0.8s infinite ease-in-out';
      haloGlowColor = 'rgba(236, 72, 153, 0.4)';
      poseBadge = { text: 'Movilidad de Manos y Muñecas', icon: RotateCw, color: '#ec4899' };
      break;

    case 'eyes_closed':
      haloGlowColor = 'rgba(251, 191, 36, 0.4)';
      poseBadge = { text: 'Descanso Visual y Palming', icon: Eye, color: '#f59e0b' };
      break;

    case 'celebrate':
      bodyScale = 1.12;
      bodyTranslateY = -10;
      haloGlowColor = 'rgba(16, 185, 129, 0.5)';
      haloScale = 1.5;
      wingSpeed = '0.09s';
      poseBadge = { text: '¡Excelente Práctica!', icon: Award, color: '#10b981' };
      break;

    default:
      break;
  }

  const isEyesClosed = (
    currentPose === 'hold' || 
    currentPose === 'reten_in' || 
    currentPose === 'eyes_closed' || 
    currentPose === 'celebrate'
  );

  const colibriSvg = (
    <div 
      className={`colibri-flight-body ${isHovered ? 'colibri-flight-hovered' : ''}`}
      style={{
        position: 'relative',
        width: inStage ? '160px' : (compact ? '70px' : '120px'),
        height: inStage ? '160px' : (compact ? '70px' : '120px'),
        zIndex: 2,
        transform: `translate(${bodyTranslateX}px, ${bodyTranslateY}px) scale(${bodyScale}) rotate(${bodyRotate}deg)`,
        transition: `transform ${duration || 0.6}s cubic-bezier(0.4, 0, 0.2, 1)`,
        animation: (currentPose === 'celebrate' || mood === 'celebrate')
          ? 'colibriFlyJoy 1.2s infinite ease-in-out' 
          : 'colibriFloatAdvanced 3.6s infinite ease-in-out'
      }}
    >
      <svg 
        viewBox="0 0 200 200" 
        width="100%" 
        height="100%" 
        style={{ overflow: 'visible', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.18))' }}
      >
        <defs>
          {/* Gradientes Volumétricos 3D Oficiales de EquilibrIA */}
          <linearGradient id="colibriBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d8b4fe" />
            <stop offset="35%" stopColor="#a855f7" />
            <stop offset="70%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#3b0764" />
          </linearGradient>

          <linearGradient id="colibriBellyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="45%" stopColor="#ff7a00" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>

          <linearGradient id="colibriWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="40%" stopColor="#9333ea" />
            <stop offset="85%" stopColor="#6b21a8" />
            <stop offset="100%" stopColor="#4c1d95" />
          </linearGradient>

          <linearGradient id="colibriBeakGrad" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>

        {/* COLA DEL COLIBRÍ CON BALANCEO NATURAL */}
        <g className="colibri-tail" style={{ transformOrigin: '70px 140px' }}>
          <path d="M 68 135 C 48 162, 28 178, 16 188 C 36 178, 58 162, 72 145 Z" fill="#6b21a8" opacity="0.9" />
          <path d="M 72 138 C 56 168, 42 186, 32 196 C 48 182, 68 164, 76 145 Z" fill="#a855f7" />
          <path d="M 76 140 C 68 170, 60 190, 52 202 C 64 184, 75 166, 80 145 Z" fill="#ff7a00" opacity="0.9" />
        </g>

        {/* ALA TRASERA (Aleteo o postura de extensión) */}
        <g 
          className="colibri-wing-back" 
          style={{ 
            transformOrigin: '95px 85px', 
            transform: wingBackTransform,
            animation: wingAnimation,
            animationDuration: wingSpeed,
            transition: 'transform 0.4s ease' 
          }}
        >
          <path 
            d="M 95 85 C 108 30, 138 10, 165 5 C 148 32, 122 68, 98 90 Z" 
            fill="url(#colibriWingGrad)" 
            opacity="0.75"
          />
        </g>

        {/* CUERPO PRINCIPAL CON POSTURA DEMOSTRATIVA */}
        <g className="colibri-body-group" style={{ transformOrigin: '110px 100px' }}>
          {/* Lomo */}
          <path 
            d="M 80 140 C 65 110, 70 70, 95 55 C 115 45, 140 50, 145 70 C 150 90, 140 125, 105 142 C 95 146, 85 145, 80 140 Z" 
            fill="url(#colibriBodyGrad)"
          />

          {/* Pecho Brillante e Iridiscente */}
          <path 
            d="M 105 72 C 125 70, 142 85, 138 108 C 132 130, 110 138, 98 135 C 112 125, 125 110, 122 92 C 120 80, 112 75, 105 72 Z" 
            fill="url(#colibriBellyGrad)"
          />

          {/* Cuello con destello turquesa */}
          <ellipse cx="126" cy="74" rx="8" ry="12" fill="#38bdf8" opacity="0.65" transform="rotate(-20 126 74)" />
        </g>

        {/* CABEZA Y PICO CON ROTACIÓN DE POSTURA */}
        <g 
          className="colibri-head-group" 
          style={{ 
            transformOrigin: '130px 65px', 
            transform: `translateY(${headTranslateY}px) rotate(${headRotate}deg)`,
            transition: 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)' 
          }}
        >
          {/* Pico largo */}
          <path 
            d="M 142 66 L 196 62 Q 198 63 195 65 L 140 71 Z" 
            fill="url(#colibriBeakGrad)"
          />

          {/* Ojo (Abierto o Cerrado en meditación/serenidad) */}
          <g className="colibri-eye" style={{ transformOrigin: '130px 62px' }}>
            {isEyesClosed ? (
              <path d="M 124 62 Q 130 56 136 62" stroke="#ff7a00" strokeWidth="2.8" fill="none" strokeLinecap="round" />
            ) : (
              <>
                <circle cx="130" cy="62" r="5.5" fill="#0f172a" />
                <circle cx="132" cy="60" r="2" fill="#ffffff" />
              </>
            )}
          </g>
        </g>

        {/* ALA DELANTERA (Aleteo, estiramiento o rotación) */}
        <g 
          className="colibri-wing-front" 
          style={{ 
            transformOrigin: '105px 82px', 
            transform: wingFrontTransform,
            animation: wingAnimation,
            animationDuration: wingSpeed,
            transition: 'transform 0.4s ease' 
          }}
        >
          <path 
            d="M 105 82 C 122 20, 158 0, 188 -5 C 170 28, 136 68, 108 92 Z" 
            fill="url(#colibriWingGrad)" 
          />
          <path 
            d="M 112 78 C 126 32, 152 16, 175 10 C 160 35, 134 65, 114 85 Z" 
            fill="#e9d5ff" 
            opacity="0.65" 
          />
        </g>

        {/* PARTÍCULAS / DESTELLOS FLOTANTES EN ÓRBITA */}
        <g className="colibri-sparkles-group">
          <circle cx="172" cy="38" r="3" fill="#fde047" opacity="0.9" className="sparkle-1" />
          <circle cx="42" cy="78" r="2.5" fill="#ff7a00" opacity="0.85" className="sparkle-2" />
          <circle cx="155" cy="135" r="3.5" fill="#c084fc" opacity="0.9" className="sparkle-3" />
          <circle cx="70" cy="30" r="2" fill="#38bdf8" opacity="0.8" className="sparkle-4" />
        </g>
      </svg>
    </div>
  );

  // Modo "inStage" para la "Sala de Bienestar"
  if (inStage) {
    const IconBadge = poseBadge?.icon || Sparkles;

    return (
      <div 
        className="colibri-stage-container"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '520px',
          minHeight: '270px',
          margin: '0 auto 16px',
          borderRadius: '24px',
          background: 'linear-gradient(145deg, rgba(248, 245, 240, 0.96) 0%, rgba(243, 238, 250, 0.94) 50%, rgba(238, 248, 248, 0.96) 100%)',
          border: '1.5px solid rgba(139, 92, 246, 0.25)',
          boxShadow: '0 20px 40px -15px rgba(99, 102, 241, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '22px 20px',
          overflow: 'hidden'
        }}
      >
        {/* ELEMENTOS DEL ESCENARIO: Rama Zen / Sakura Suave */}
        <svg 
          viewBox="0 0 400 120" 
          style={{ position: 'absolute', bottom: -10, left: -20, width: '260px', opacity: 0.35, pointerEvents: 'none', zIndex: 1 }}
        >
          <path d="M 0 100 Q 80 80, 160 90 T 260 70" stroke="#78350f" strokeWidth="6" fill="none" strokeLinecap="round" />
          <circle cx="120" cy="85" r="7" fill="#f472b6" opacity="0.8" />
          <circle cx="180" cy="88" r="6" fill="#fbcfe8" opacity="0.9" />
          <circle cx="230" cy="74" r="8" fill="#f472b6" opacity="0.85" />
          <circle cx="235" cy="72" r="3" fill="#fef08a" />
        </svg>

        {/* Aura Resplandeciente Sincronizada con la Postura */}
        <div 
          style={{
            position: 'absolute',
            width: '190px',
            height: '190px',
            borderRadius: '50%',
            background: haloGlowColor,
            transform: `scale(${haloScale})`,
            transition: `all ${duration || 0.6}s cubic-bezier(0.4, 0, 0.2, 1)`,
            filter: 'blur(32px)',
            zIndex: 1,
            pointerEvents: 'none'
          }}
        />

        {/* Colibrí Demostrando la Postura en el Escenario */}
        {colibriSvg}

        {/* Badge Demostrativo de la Postura / Movimiento */}
        {poseBadge && (
          <div style={{ position: 'relative', zIndex: 3, marginTop: '10px', textAlign: 'center' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: '900',
              color: poseBadge.color || 'var(--primary)',
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              padding: '4px 12px',
              borderRadius: '12px',
              border: `1px solid ${poseBadge.color}55`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '6px'
            }}>
              <IconBadge size={13} />
              <span>Colibrí Demostrando: {poseBadge.text}</span>
            </span>
            <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', margin: 0, lineHeight: '1.4' }}>
              {getDefaultMessage()}
            </p>
          </div>
        )}

        {/* ESTILOS CSS PARA POSTURAS Y MOVIMIENTOS */}
        <style>{`
          @keyframes colibriFloatAdvanced {
            0% { transform: translateY(0px) rotate(0deg); }
            25% { transform: translateY(-7px) rotate(2deg); }
            50% { transform: translateY(-12px) rotate(-1deg); }
            75% { transform: translateY(-5px) rotate(1.5deg); }
            100% { transform: translateY(0px) rotate(0deg); }
          }
          @keyframes colibriFlyJoy {
            0% { transform: translateY(0px) rotate(-4deg) scale(1); }
            30% { transform: translateY(-16px) rotate(5deg) scale(1.08); }
            60% { transform: translateY(-6px) rotate(-2deg) scale(1.04); }
            100% { transform: translateY(0px) rotate(-4deg) scale(1); }
          }
          @keyframes colibriFlapFront {
            0% { transform: rotate(0deg) scaleY(1); }
            50% { transform: rotate(-38deg) scaleY(0.65) skewX(-10deg); }
            100% { transform: rotate(0deg) scaleY(1); }
          }
          @keyframes colibriFlapBack {
            0% { transform: rotate(0deg) scaleY(1); }
            50% { transform: rotate(34deg) scaleY(0.65) skewX(10deg); }
            100% { transform: rotate(0deg) scaleY(1); }
          }
          @keyframes colibriShoulderRoll {
            0% { transform: rotate(0deg) translateY(0px); }
            25% { transform: rotate(-25deg) translateY(-8px); }
            50% { transform: rotate(15deg) translateY(4px); }
            75% { transform: rotate(-10deg) translateY(-4px); }
            100% { transform: rotate(0deg) translateY(0px); }
          }
          @keyframes colibriWristRoll {
            0% { transform: rotate(0deg) skewX(0deg); }
            50% { transform: rotate(20deg) skewX(15deg); }
            100% { transform: rotate(0deg) skewX(0deg); }
          }
          @keyframes colibriTailAnim {
            0% { transform: rotate(0deg); }
            50% { transform: rotate(-6deg); }
            100% { transform: rotate(0deg); }
          }
          @keyframes sparkleFloat1 {
            0%, 100% { transform: translateY(0) scale(1); opacity: 0.8; }
            50% { transform: translateY(-10px) translateX(4px) scale(1.2); opacity: 1; }
          }
          @keyframes sparkleFloat2 {
            0%, 100% { transform: translateY(0) scale(1); opacity: 0.7; }
            50% { transform: translateY(8px) translateX(-5px) scale(1.3); opacity: 1; }
          }
          .sparkle-1 { animation: sparkleFloat1 2.2s infinite ease-in-out; }
          .sparkle-2 { animation: sparkleFloat2 2.8s infinite ease-in-out; }
          .sparkle-3 { animation: sparkleFloat1 3.2s infinite ease-in-out 0.5s; }
          .sparkle-4 { animation: sparkleFloat2 2.5s infinite ease-in-out 1s; }
        `}</style>
      </div>
    );
  }

  // Render normal
  return (
    <div 
      className={`colibri-companion-container ${bounce ? 'colibri-bounce' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: compact ? 'row' : 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        padding: compact ? '10px 16px' : '22px 18px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '24px',
        border: '1.5px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
        position: 'relative',
        transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        backdropFilter: 'blur(16px)',
        zIndex: 5,
        cursor: 'default',
        overflow: 'hidden'
      }}
    >
      <div 
        style={{
          position: 'absolute',
          width: '130px',
          height: '130px',
          borderRadius: '50%',
          background: haloGlowColor,
          filter: 'blur(20px)',
          zIndex: 0,
          pointerEvents: 'none',
          animation: 'colibriPulseGlow 3s infinite alternate ease-in-out'
        }}
      />

      {colibriSvg}

      <div 
        style={{
          width: compact ? 'auto' : '100%',
          textAlign: compact ? 'left' : 'center',
          zIndex: 2
        }}
      >
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          fontSize: '11px',
          fontWeight: '900',
          padding: '4px 12px',
          borderRadius: '12px',
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          <Sparkles size={12} />
          <span>Equi • Tu Guía Emocional</span>
        </div>

        <p style={{
          fontSize: compact ? '12px' : '13px',
          color: 'var(--text-primary)',
          lineHeight: '1.5',
          margin: 0,
          fontWeight: '600'
        }}>
          {getDefaultMessage()}
        </p>

        {progressPercent > 0 && !compact && (
          <div style={{ marginTop: '12px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '11px',
              fontWeight: '800',
              color: 'var(--text-muted)',
              marginBottom: '5px'
            }}>
              <span>Progreso de la Evaluación</span>
              <span>{progressPercent}%</span>
            </div>
            <div style={{
              width: '100%',
              height: '7px',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '6px',
              overflow: 'hidden',
              border: '1px solid var(--border)'
            }}>
              <div style={{
                width: `${progressPercent}%`,
                height: '100%',
                backgroundColor: 'var(--primary)',
                transition: 'width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }} />
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes colibriFloatAdvanced {
          0% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-7px) rotate(2deg); }
          50% { transform: translateY(-12px) rotate(-1deg); }
          75% { transform: translateY(-5px) rotate(1.5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes colibriFlyJoy {
          0% { transform: translateY(0px) rotate(-4deg) scale(1); }
          30% { transform: translateY(-16px) rotate(5deg) scale(1.08); }
          60% { transform: translateY(-6px) rotate(-2deg) scale(1.04); }
          100% { transform: translateY(0px) rotate(-4deg) scale(1); }
        }
        @keyframes colibriFlapFront {
          0% { transform: rotate(0deg) scaleY(1); }
          50% { transform: rotate(-38deg) scaleY(0.65) skewX(-10deg); }
          100% { transform: rotate(0deg) scaleY(1); }
        }
        @keyframes colibriFlapBack {
          0% { transform: rotate(0deg) scaleY(1); }
          50% { transform: rotate(34deg) scaleY(0.65) skewX(10deg); }
          100% { transform: rotate(0deg) scaleY(1); }
        }
        @keyframes colibriTailAnim {
          0% { transform: rotate(0deg); }
          50% { transform: rotate(-6deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes colibriPulseGlow {
          0% { transform: scale(0.9); opacity: 0.7; }
          100% { transform: scale(1.2); opacity: 1; }
        }
        .colibri-wing-front { animation: colibriFlapFront 0.18s infinite ease-in-out; }
        .colibri-wing-back { animation: colibriFlapBack 0.18s infinite ease-in-out; }
        .colibri-tail { animation: colibriTailAnim 1.8s infinite ease-in-out; }
        .sparkle-1 { animation: sparkleFloat1 2.2s infinite ease-in-out; }
        .sparkle-2 { animation: sparkleFloat2 2.8s infinite ease-in-out; }
        .sparkle-3 { animation: sparkleFloat1 3.2s infinite ease-in-out 0.5s; }
        .sparkle-4 { animation: sparkleFloat2 2.5s infinite ease-in-out 1s; }
      `}</style>
    </div>
  );
};

export default ColibriMascot;
