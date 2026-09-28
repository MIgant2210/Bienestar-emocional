import React, { useState, useEffect, useContext } from 'react';
import { Sparkles, Heart, Zap, Award, ArrowRight, ArrowLeft, ArrowUp, RotateCw, Eye, Compass, Activity, Wind } from 'lucide-react';
import { ThemeContext } from '../contexts/ThemeContext';

/**
 * Mapa de Plumaje Completo y Armonía Cromática de Equi por cada Temática.
 * Transforma el cuerpo, pecho, alas, cola, reflejos y destellos orbitales
 * para que cada una de las 14 temáticas tenga una identidad visual única y notable.
 */
const THEME_PLUMAGE_MAP = {
  equilibria: {
    bodyGrad: [
      { offset: '0%', color: '#d8b4fe' },
      { offset: '35%', color: '#a855f7' },
      { offset: '70%', color: '#7c3aed' },
      { offset: '100%', color: '#3b0764' }
    ],
    bellyGrad: [
      { offset: '0%', color: '#fde047' },
      { offset: '45%', color: '#ff7a00' },
      { offset: '100%', color: '#e11d48' }
    ],
    wingGrad: [
      { offset: '0%', color: '#c084fc' },
      { offset: '40%', color: '#9333ea' },
      { offset: '85%', color: '#6b21a8' },
      { offset: '100%', color: '#4c1d95' }
    ],
    wingHighlight: '#e9d5ff',
    tail: ['#6b21a8', '#a855f7', '#ff7a00'],
    throat: '#38bdf8',
    sparkles: ['#fde047', '#ff7a00', '#c084fc', '#38bdf8']
  },
  spring: {
    bodyGrad: [
      { offset: '0%', color: '#bbf7d0' },
      { offset: '35%', color: '#4ade80' },
      { offset: '70%', color: '#16a34a' },
      { offset: '100%', color: '#14532d' }
    ],
    bellyGrad: [
      { offset: '0%', color: '#fff1f2' },
      { offset: '45%', color: '#f472b6' },
      { offset: '100%', color: '#db2777' }
    ],
    wingGrad: [
      { offset: '0%', color: '#fbcfe8' },
      { offset: '40%', color: '#f472b6' },
      { offset: '85%', color: '#ec4899' },
      { offset: '100%', color: '#9d174d' }
    ],
    wingHighlight: '#fdf2f8',
    tail: ['#16a34a', '#f472b6', '#ec4899'],
    throat: '#fbcfe8',
    sparkles: ['#f472b6', '#4ade80', '#fef08a', '#ec4899']
  },
  summer: {
    bodyGrad: [
      { offset: '0%', color: '#7dd3fc' },
      { offset: '35%', color: '#38bdf8' },
      { offset: '70%', color: '#0284c7' },
      { offset: '100%', color: '#0369a1' }
    ],
    bellyGrad: [
      { offset: '0%', color: '#fef08a' },
      { offset: '45%', color: '#facc15' },
      { offset: '100%', color: '#f59e0b' }
    ],
    wingGrad: [
      { offset: '0%', color: '#a5f3fc' },
      { offset: '40%', color: '#22d3ee' },
      { offset: '85%', color: '#0891b2' },
      { offset: '100%', color: '#164e63' }
    ],
    wingHighlight: '#e0f2fe',
    tail: ['#0284c7', '#f59e0b', '#06b6d4'],
    throat: '#fef08a',
    sparkles: ['#facc15', '#38bdf8', '#fb923c', '#22d3ee']
  },
  autumn: {
    bodyGrad: [
      { offset: '0%', color: '#fed7aa' },
      { offset: '35%', color: '#fb923c' },
      { offset: '70%', color: '#ea580c' },
      { offset: '100%', color: '#7c2d12' }
    ],
    bellyGrad: [
      { offset: '0%', color: '#fef3c7' },
      { offset: '45%', color: '#fbbf24' },
      { offset: '100%', color: '#d97706' }
    ],
    wingGrad: [
      { offset: '0%', color: '#fdba74' },
      { offset: '40%', color: '#f97316' },
      { offset: '85%', color: '#c2410c' },
      { offset: '100%', color: '#9a3412' }
    ],
    wingHighlight: '#ffedd5',
    tail: ['#9a3412', '#ea580c', '#d97706'],
    throat: '#fed7aa',
    sparkles: ['#f59e0b', '#ea580c', '#fef3c7', '#c2410c']
  },
  winter: {
    bodyGrad: [
      { offset: '0%', color: '#e0f2fe' },
      { offset: '35%', color: '#7dd3fc' },
      { offset: '70%', color: '#0284c7' },
      { offset: '100%', color: '#1e3a8a' }
    ],
    bellyGrad: [
      { offset: '0%', color: '#ffffff' },
      { offset: '45%', color: '#e0f2fe' },
      { offset: '100%', color: '#93c5fd' }
    ],
    wingGrad: [
      { offset: '0%', color: '#bae6fd' },
      { offset: '40%', color: '#38bdf8' },
      { offset: '85%', color: '#0369a1' },
      { offset: '100%', color: '#0c4a6e' }
    ],
    wingHighlight: '#f0f9ff',
    tail: ['#1e3a8a', '#0284c7', '#7dd3fc'],
    throat: '#ffffff',
    sparkles: ['#38bdf8', '#ffffff', '#93c5fd', '#e0f2fe']
  },
  halloween: {
    bodyGrad: [
      { offset: '0%', color: '#d8b4fe' },
      { offset: '35%', color: '#9333ea' },
      { offset: '70%', color: '#581c87' },
      { offset: '100%', color: '#18181b' }
    ],
    bellyGrad: [
      { offset: '0%', color: '#fed7aa' },
      { offset: '45%', color: '#fb923c' },
      { offset: '100%', color: '#ea580c' }
    ],
    wingGrad: [
      { offset: '0%', color: '#c084fc' },
      { offset: '40%', color: '#7c3aed' },
      { offset: '85%', color: '#4c1d95' },
      { offset: '100%', color: '#18181b' }
    ],
    wingHighlight: '#f3e8ff',
    tail: ['#3b0764', '#ea580c', '#7c3aed'],
    throat: '#fde047',
    sparkles: ['#fb923c', '#a855f7', '#fbbf24', '#c084fc']
  },
  birthday: {
    bodyGrad: [
      { offset: '0%', color: '#f472b6' },
      { offset: '35%', color: '#ec4899' },
      { offset: '70%', color: '#db2777' },
      { offset: '100%', color: '#831843' }
    ],
    bellyGrad: [
      { offset: '0%', color: '#fef08a' },
      { offset: '45%', color: '#facc15' },
      { offset: '100%', color: '#f59e0b' }
    ],
    wingGrad: [
      { offset: '0%', color: '#a5b4fc' },
      { offset: '40%', color: '#818cf8' },
      { offset: '85%', color: '#6366f1' },
      { offset: '100%', color: '#4338ca' }
    ],
    wingHighlight: '#fdf2f8',
    tail: ['#ec4899', '#38bdf8', '#facc15'],
    throat: '#fef08a',
    sparkles: ['#ec4899', '#38bdf8', '#facc15', '#a855f7']
  },
  valentines: {
    bodyGrad: [
      { offset: '0%', color: '#fda4af' },
      { offset: '35%', color: '#fb7185' },
      { offset: '70%', color: '#f43f5e' },
      { offset: '100%', color: '#9f1239' }
    ],
    bellyGrad: [
      { offset: '0%', color: '#fff1f2' },
      { offset: '45%', color: '#fecdd3' },
      { offset: '100%', color: '#fda4af' }
    ],
    wingGrad: [
      { offset: '0%', color: '#fb7185' },
      { offset: '40%', color: '#f43f5e' },
      { offset: '85%', color: '#e11d48' },
      { offset: '100%', color: '#881337' }
    ],
    wingHighlight: '#ffe4e6',
    tail: ['#be123c', '#f43f5e', '#fda4af'],
    throat: '#fff1f2',
    sparkles: ['#f43f5e', '#fda4af', '#ffffff', '#fb7185']
  },
  environment: {
    bodyGrad: [
      { offset: '0%', color: '#6ee7b7' },
      { offset: '35%', color: '#10b981' },
      { offset: '70%', color: '#059669' },
      { offset: '100%', color: '#064e3b' }
    ],
    bellyGrad: [
      { offset: '0%', color: '#d1fae5' },
      { offset: '45%', color: '#a7f3d0' },
      { offset: '100%', color: '#34d399' }
    ],
    wingGrad: [
      { offset: '0%', color: '#34d399' },
      { offset: '40%', color: '#059669' },
      { offset: '85%', color: '#047857' },
      { offset: '100%', color: '#022c22' }
    ],
    wingHighlight: '#ecfdf5',
    tail: ['#047857', '#10b981', '#34d399'],
    throat: '#a7f3d0',
    sparkles: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0']
  },
  graduation: {
    bodyGrad: [
      { offset: '0%', color: '#93c5fd' },
      { offset: '35%', color: '#3b82f6' },
      { offset: '70%', color: '#1d4ed8' },
      { offset: '100%', color: '#1e3a8a' }
    ],
    bellyGrad: [
      { offset: '0%', color: '#fef08a' },
      { offset: '45%', color: '#facc15' },
      { offset: '100%', color: '#d97706' }
    ],
    wingGrad: [
      { offset: '0%', color: '#60a5fa' },
      { offset: '40%', color: '#2563eb' },
      { offset: '85%', color: '#1e40af' },
      { offset: '100%', color: '#0f172a' }
    ],
    wingHighlight: '#dbeafe',
    tail: ['#1e3a8a', '#d97706', '#3b82f6'],
    throat: '#fef08a',
    sparkles: ['#facc15', '#60a5fa', '#d97706', '#93c5fd']
  },
  guatemala: {
    bodyGrad: [
      { offset: '0%', color: '#6ee7b7' },
      { offset: '35%', color: '#10b981' },
      { offset: '70%', color: '#059669' },
      { offset: '100%', color: '#064e3b' }
    ],
    bellyGrad: [
      { offset: '0%', color: '#fda4af' },
      { offset: '40%', color: '#f43f5e' },
      { offset: '75%', color: '#e11d48' },
      { offset: '100%', color: '#9f1239' }
    ],
    wingGrad: [
      { offset: '0%', color: '#34d399' },
      { offset: '35%', color: '#059669' },
      { offset: '75%', color: '#047857' },
      { offset: '100%', color: '#022c22' }
    ],
    wingHighlight: '#a7f3d0',
    tail: ['#047857', '#10b981', '#34d399'],
    throat: '#6ee7b7',
    sparkles: ['#34d399', '#059669', '#e11d48', '#6ee7b7']
  },
  christmas: {
    bodyGrad: [
      { offset: '0%', color: '#86efac' },
      { offset: '35%', color: '#22c55e' },
      { offset: '70%', color: '#16a34a' },
      { offset: '100%', color: '#14532d' }
    ],
    bellyGrad: [
      { offset: '0%', color: '#fca5a5' },
      { offset: '45%', color: '#ef4444' },
      { offset: '100%', color: '#b91c1c' }
    ],
    wingGrad: [
      { offset: '0%', color: '#4ade80' },
      { offset: '40%', color: '#15803d' },
      { offset: '85%', color: '#166534' },
      { offset: '100%', color: '#052e16' }
    ],
    wingHighlight: '#f0fdf4',
    tail: ['#15803d', '#dc2626', '#f59e0b'],
    throat: '#fef08a',
    sparkles: ['#dc2626', '#16a34a', '#f59e0b', '#ffffff']
  },
  newyear: {
    bodyGrad: [
      { offset: '0%', color: '#a5b4fc' },
      { offset: '35%', color: '#6366f1' },
      { offset: '70%', color: '#4338ca' },
      { offset: '100%', color: '#0f172a' }
    ],
    bellyGrad: [
      { offset: '0%', color: '#fef9c3' },
      { offset: '45%', color: '#fde047' },
      { offset: '100%', color: '#f59e0b' }
    ],
    wingGrad: [
      { offset: '0%', color: '#818cf8' },
      { offset: '40%', color: '#4f46e5' },
      { offset: '85%', color: '#312e81' },
      { offset: '100%', color: '#09090b' }
    ],
    wingHighlight: '#e0e7ff',
    tail: ['#312e81', '#f59e0b', '#818cf8'],
    throat: '#fde047',
    sparkles: ['#f59e0b', '#818cf8', '#fde047', '#ffffff']
  },
  anniversary: {
    bodyGrad: [
      { offset: '0%', color: '#d8b4fe' },
      { offset: '35%', color: '#a855f7' },
      { offset: '70%', color: '#7c3aed' },
      { offset: '100%', color: '#3b0764' }
    ],
    bellyGrad: [
      { offset: '0%', color: '#fef08a' },
      { offset: '45%', color: '#facc15' },
      { offset: '100%', color: '#d97706' }
    ],
    wingGrad: [
      { offset: '0%', color: '#c084fc' },
      { offset: '40%', color: '#9333ea' },
      { offset: '85%', color: '#6b21a8' },
      { offset: '100%', color: '#4c1d95' }
    ],
    wingHighlight: '#fae8ff',
    tail: ['#7c3aed', '#f59e0b', '#d8b4fe'],
    throat: '#fef08a',
    sparkles: ['#f59e0b', '#a855f7', '#fef08a', '#d8b4fe']
  }
};

/**
 * Mascota Oficial de EquilibrIA: Colibrí Morado Inteligente / Quetzal y Demostrador de Poses de Bienestar
 * Ilustración SVG en capas con profundidad volumétrica 3D, sombreados suaves,
 * múltiples capas de animación reactiva, soporte de temáticas visuales y demostrador dinámico.
 */
const ColibriMascot = ({ 
  mood = 'welcome', // 'welcome' | 'thinking' | 'happy' | 'almost_done' | 'celebrate'
  customMessage = '',
  progressPercent = 0,
  compact = false,
  themeId = null, // 'equilibria' | 'spring' | 'summer' | 'autumn' | 'winter' | 'halloween' | 'birthday' | 'valentines' | 'environment' | 'graduation' | 'guatemala' | 'christmas' | 'newyear' | 'anniversary'
  // Modos especiales para ejercicios guiados de bienestar:
  phase = null, // 'ready' | 'inhale' | 'hold' | 'exhale' | 'step' | 'celebrate'
  exercisePose = 'neutral', // 'neutral' | 'inhale' | 'hold' | 'exhale' | 'neck_right' | 'neck_left' | 'neck_front' | 'shoulder_roll' | 'shoulder_lift' | 'chest_open' | 'stretch_up' | 'twist_right' | 'twist_left' | 'wrist_roll' | 'eyes_closed' | 'celebrate'
  duration = 4, // Duración del paso en segundos para sincronización CSS
  inStage = false // Renderizar dentro del escenario "Sala de Bienestar"
}) => {
  const themeCtx = useContext(ThemeContext);
  const activeThemeId = themeId || themeCtx?.activeTheme || 'equilibria';
  const isQuetzal = activeThemeId === 'guatemala';
  const [bounce, setBounce] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Obtener la paleta de plumaje específica de la temática activa
  const plumage = THEME_PLUMAGE_MAP[activeThemeId] || THEME_PLUMAGE_MAP.equilibria;
  const gradPrefix = activeThemeId;

  // Gatillar reacción sutil cada vez que cambia el estado, la fase o la pose
  useEffect(() => {
    setBounce(true);
    const t = setTimeout(() => setBounce(false), 600);
    return () => clearTimeout(t);
  }, [mood, phase, exercisePose, progressPercent]);

  // Título e identidad de la mascota según la temática activa
  const getMascotBadgeTitle = () => {
    if (isQuetzal) return 'Equi • Edición Quetzal';
    switch (activeThemeId) {
      case 'spring': return 'Equi • Primavera Floreciente';
      case 'summer': return 'Equi • Verano Tropical';
      case 'autumn': return 'Equi • Calidez Otoñal';
      case 'winter': return 'Equi • Escarcha Invernal';
      case 'halloween': return 'Equi • Hechizo Mágico';
      case 'birthday': return 'Equi • Fiesta de Cumpleaños';
      case 'valentines': return 'Equi • Amor & Empatía';
      case 'environment': return 'Equi • Guardián Botánico';
      case 'graduation': return 'Equi • Excelencia Académica';
      case 'christmas': return 'Equi • Espíritu Navideño';
      case 'newyear': return 'Equi • Gala de Año Nuevo';
      case 'anniversary': return 'Equi • Corona de Aniversario';
      default: return 'Equi • Tu Guía Emocional';
    }
  };

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
          return 'Inhala suavemente llenando tu abdomen de calma y oxígeno...';
        case 'reten_in':
        case 'hold':
          return 'Mantén la respiración y siente tu centro en equilibrio...';
        case 'exhala':
        case 'exhale':
          return 'Exhala despacio soltando toda la tensión acumulada...';
        case 'celebrate':
        case 'completado':
          return '¡Maravilloso trabajo! Has completado tu ejercicio de bienestar.';
        default:
          return 'Encuentra una postura cómoda y comencemos cuando gustes.';
      }
    }

    switch (mood) {
      case 'welcome':
        return '¡Hola! Te acompañaré en esta evaluación. Tómate tu tiempo y responde con sinceridad.';
      case 'happy':
        return '¡Excelente reflexión! Cada respuesta suma a tu bienestar y autoconocimiento.';
      case 'thinking':
        return 'Respira profundo y escucha lo que sientes. No hay respuestas incorrectas.';
      case 'almost_done':
        return '¡Casi terminamos! Estás a un solo paso de completar tu actividad.';
      case 'celebrate':
        return '¡Lo lograste! Has ganado tus puntos de XP y sumado a tu bienestar. ¡Gran trabajo!';
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
          {/* Gradientes Volumétricos Dinámicos según la Temática */}
          <linearGradient id={`colibriBodyGrad_${gradPrefix}`} x1="0%" y1="0%" x2="100%" y2="100%">
            {plumage.bodyGrad.map((stop, idx) => (
              <stop key={idx} offset={stop.offset} stopColor={stop.color} />
            ))}
          </linearGradient>

          <linearGradient id={`colibriBellyGrad_${gradPrefix}`} x1="0%" y1="0%" x2="100%" y2="100%">
            {plumage.bellyGrad.map((stop, idx) => (
              <stop key={idx} offset={stop.offset} stopColor={stop.color} />
            ))}
          </linearGradient>

          <linearGradient id={`colibriWingGrad_${gradPrefix}`} x1="0%" y1="0%" x2="100%" y2="100%">
            {plumage.wingGrad.map((stop, idx) => (
              <stop key={idx} offset={stop.offset} stopColor={stop.color} />
            ))}
          </linearGradient>

          <linearGradient id="colibriBeakGrad" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Gradiente Especial para la Cola del Quetzal */}
          <linearGradient id="quetzalTailGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="45%" stopColor="#059669" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>

          {/* Gradiente de Lentes de Sol Veraniegos */}
          <linearGradient id="summerLensGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
        </defs>

        {/* COLA DEL COLIBRÍ (O SERPENTINAS LARGAS DEL QUETZAL) */}
        {isQuetzal ? (
          <g className="colibri-tail quetzal-tail" style={{ transformOrigin: '70px 140px' }}>
            <path d="M 68 140 C 42 175, 18 215, 30 265 C 42 225, 62 185, 72 145 Z" fill="url(#quetzalTailGrad)" opacity="0.95" />
            <path d="M 74 142 C 54 180, 36 228, 48 278 C 58 234, 76 190, 78 147 Z" fill="#047857" opacity="0.88" />
            <path d="M 65 136 C 50 155, 38 168, 28 176 C 44 164, 60 152, 70 142 Z" fill="#34d399" />
            <path d="M 72 138 C 60 162, 50 178, 42 186 C 54 172, 68 156, 76 144 Z" fill="#10b981" />
          </g>
        ) : (
          <g className="colibri-tail" style={{ transformOrigin: '70px 140px' }}>
            <path d="M 68 135 C 48 162, 28 178, 16 188 C 36 178, 58 162, 72 145 Z" fill={plumage.tail[0]} opacity="0.92" />
            <path d="M 72 138 C 56 168, 42 186, 32 196 C 48 182, 68 164, 76 145 Z" fill={plumage.tail[1]} />
            <path d="M 76 140 C 68 170, 60 190, 52 202 C 64 184, 75 166, 80 145 Z" fill={plumage.tail[2]} opacity="0.92" />
          </g>
        )}

        {/* ALA TRASERA (Aleteo o postura de extensión con gradiente temático) */}
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
            fill={`url(#colibriWingGrad_${gradPrefix})`} 
            opacity="0.80"
          />
        </g>

        {/* CUERPO PRINCIPAL CON POSTURA DEMOSTRATIVA */}
        <g className="colibri-body-group" style={{ transformOrigin: '110px 100px' }}>
          {/* Lomo y silueta del cuerpo */}
          <path 
            d="M 80 140 C 65 110, 70 70, 95 55 C 115 45, 140 50, 145 70 C 150 90, 140 125, 105 142 C 95 146, 85 145, 80 140 Z" 
            fill={`url(#colibriBodyGrad_${gradPrefix})`}
          />

          {/* Pecho Brillante e Iridiscente */}
          <path 
            d="M 105 72 C 125 70, 142 85, 138 108 C 132 130, 110 138, 98 135 C 112 125, 125 110, 122 92 C 120 80, 112 75, 105 72 Z" 
            fill={`url(#colibriBellyGrad_${gradPrefix})`}
          />

          {/* Cuello con destello temático */}
          <ellipse cx="126" cy="74" rx="8" ry="12" fill={plumage.throat} opacity="0.75" transform="rotate(-20 126 74)" />

          {/* Accesorio Otoñal: Bufanda tejida en el cuello */}
          {activeThemeId === 'autumn' && (
            <g className="mascot-accessory-autumn" transform="translate(106, 64) scale(1.25)">
              <path d="M 6 4 Q 18 11 28 4 Q 24 16 14 16 Q 5 14 6 4 Z" fill="#ea580c" />
              <path d="M 9 10 Q 15 20 16 30 L 23 27 Q 19 18 16 10 Z" fill="#c2410c" />
              <line x1="16" y1="30" x2="16" y2="34" stroke="#f97316" strokeWidth="1.8" />
              <line x1="19.5" y1="29" x2="19.5" y2="33" stroke="#f97316" strokeWidth="1.8" />
              <line x1="23" y1="27" x2="23" y2="31" stroke="#f97316" strokeWidth="1.8" />
              <path d="M 12 11 L 10 13 L 13 14 L 11 16 L 15 15 L 14 11 Z" fill="#fbbf24" />
            </g>
          )}

          {/* Accesorio Navidad: Campanita festiva en el cuello */}
          {activeThemeId === 'christmas' && (
            <g className="mascot-accessory-christmas-bell" transform="translate(118, 76) scale(1.2)">
              <path d="M 0 0 C -4 4, -5 8, -7 9 L 7 9 C 5 8, 4 4, 0 0 Z" fill="#f59e0b" stroke="#d97706" strokeWidth="0.8" />
              <circle cx="0" cy="10" r="1.8" fill="#d97706" />
              <circle cx="0" cy="0" r="2.2" fill="#ef4444" />
            </g>
          )}

          {/* Accesorio Año Nuevo: Corbatín elegante de gala */}
          {activeThemeId === 'newyear' && (
            <g className="mascot-accessory-newyear-bowtie" transform="translate(118, 73) scale(1.25)">
              <polygon points="0,0 -9,-5 -9,5" fill="#09090b" stroke="#f59e0b" strokeWidth="0.9" />
              <polygon points="0,0 9,-5 9,5" fill="#09090b" stroke="#f59e0b" strokeWidth="0.9" />
              <circle cx="0" cy="0" r="2.5" fill="#f59e0b" />
            </g>
          )}

          {/* Accesorio Aniversario: Medalla de honor con cinta en el pecho */}
          {activeThemeId === 'anniversary' && (
            <g className="mascot-accessory-anniversary-medal" transform="translate(118, 76) scale(1.2)">
              <polygon points="-4,-2 0,4 4,-2" fill="#7c3aed" />
              <circle cx="0" cy="7" r="4.5" fill="#f59e0b" stroke="#d97706" strokeWidth="0.9" />
              <circle cx="0" cy="7" r="2.3" fill="#fef08a" />
            </g>
          )}
        </g>

        {/* CABEZA Y PICO CON ROTACIÓN DE POSTURA Y ACCESORIOS */}
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
            fill={isQuetzal ? "#0f172a" : "url(#colibriBeakGrad)"}
          />

          {/* Copete plumoso característico del Quetzal */}
          {isQuetzal && (
            <g className="quetzal-crest">
              <path 
                d="M 116 54 C 114 40, 122 34, 128 42 C 132 30, 142 32, 145 44 C 149 32, 158 38, 156 54 Z" 
                fill="#10b981" 
                opacity="0.95" 
              />
              <circle cx="128" cy="40" r="2.8" fill="#34d399" />
              <circle cx="144" cy="40" r="2.8" fill="#34d399" />
            </g>
          )}

          {/* Corona Floral de Primavera */}
          {activeThemeId === 'spring' && (
            <g className="mascot-accessory-spring" transform="translate(128, 38) scale(1.22)">
              <path d="M -12 6 Q 0 0 14 6" stroke="#15803d" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <circle cx="-9" cy="4" r="5" fill="#f472b6" />
              <circle cx="-9" cy="4" r="2" fill="#fef08a" />
              <circle cx="2" cy="0" r="5.5" fill="#fb7185" />
              <circle cx="2" cy="0" r="2.2" fill="#ffffff" />
              <circle cx="11" cy="4" r="4.5" fill="#f472b6" />
              <circle cx="11" cy="4" r="1.8" fill="#fef08a" />
              <ellipse cx="-14" cy="8" rx="3.5" ry="1.8" fill="#34d399" transform="rotate(-30 -14 8)" />
              <ellipse cx="16" cy="7" rx="3.5" ry="1.8" fill="#34d399" transform="rotate(30 16 7)" />
            </g>
          )}

          {/* Gorrito de Invierno */}
          {activeThemeId === 'winter' && (
            <g className="mascot-accessory-winter" transform="translate(130, 32) scale(1.22)">
              <path d="M -15 17 C -15 3, 11 3, 11 17 Z" fill="#0284c7" />
              <rect x="-17" y="14" width="30" height="6" rx="3" fill="#38bdf8" />
              <line x1="-10" y1="14" x2="-10" y2="20" stroke="#bae6fd" strokeWidth="1.2" />
              <line x1="-2" y1="14" x2="-2" y2="20" stroke="#bae6fd" strokeWidth="1.2" />
              <line x1="6" y1="14" x2="6" y2="20" stroke="#bae6fd" strokeWidth="1.2" />
              <circle cx="-2" cy="2" r="6" fill="#f8fafc" />
              <circle cx="-2" cy="2" r="4.8" fill="#ffffff" />
            </g>
          )}

          {/* Sombrero Mágico de Halloween */}
          {activeThemeId === 'halloween' && (
            <g className="mascot-accessory-halloween" transform="translate(128, 25) scale(1.22)">
              <path d="M -16 23 L 0 -5 L 14 23 Z" fill="#18181b" />
              <ellipse cx="-1" cy="23" rx="20" ry="4.5" fill="#27272a" />
              <path d="M -11 19 L -10 21 L 8 21 L 9 19 Z" fill="#9333ea" />
              <rect x="-3" y="18" width="5" height="5" fill="#f59e0b" rx="1" />
              <circle cx="0" cy="-5" r="2.5" fill="#fbbf24" />
            </g>
          )}

          {/* Bonete de Cumpleaños */}
          {activeThemeId === 'birthday' && (
            <g className="mascot-accessory-birthday" transform="translate(128, 24) scale(1.25)">
              <path d="M -13 25 L 0 -5 L 11 25 Z" fill="#ec4899" />
              <circle cx="-2" cy="15" r="2.2" fill="#fef08a" />
              <circle cx="5" cy="20" r="2" fill="#38bdf8" />
              <circle cx="-1" cy="6" r="1.6" fill="#ffffff" />
              <circle cx="0" cy="-5" r="4" fill="#f59e0b" />
              <ellipse cx="-1" cy="25" rx="13" ry="3" fill="#a855f7" />
            </g>
          )}

          {/* Birrete de Graduación con Diploma */}
          {activeThemeId === 'graduation' && (
            <g className="mascot-accessory-graduation" transform="translate(130, 34) scale(1.25)">
              <polygon points="0,-4 20,4 0,12 -20,4" fill="#1e293b" />
              <path d="M -9 5 L -9 12 Q 0 17 9 12 L 9 5 Z" fill="#0f172a" />
              <circle cx="0" cy="4" r="2.2" fill="#f59e0b" />
              <path d="M 0 4 Q 11 6 15 15" stroke="#f59e0b" strokeWidth="1.8" fill="none" />
              <circle cx="15" cy="16" r="1.8" fill="#eab308" />
              <g transform="translate(10, 22) rotate(-25)">
                <rect x="-6" y="-3" width="12" height="6" rx="2" fill="#fef9c3" stroke="#d97706" strokeWidth="0.8" />
                <line x1="0" y1="-3" x2="0" y2="3" stroke="#dc2626" strokeWidth="1.2" />
              </g>
            </g>
          )}

          {/* Gorro Navideño de Santa */}
          {activeThemeId === 'christmas' && (
            <g className="mascot-accessory-christmas" transform="translate(128, 25) scale(1.25)">
              <path d="M -15 22 C -13 7, 5 0, 18 2 C 20 11, 14 18, 9 22 Z" fill="#dc2626" />
              <rect x="-17" y="19" width="28" height="6" rx="3" fill="#f8fafc" />
              <circle cx="21" cy="5" r="5" fill="#ffffff" />
            </g>
          )}

          {/* Corona Real de Aniversario */}
          {activeThemeId === 'anniversary' && (
            <g className="mascot-accessory-anniversary" transform="translate(128, 33) scale(1.22)">
              <polygon points="-13,15 -15,0 -5,6 0,-4 5,6 15,0 13,15" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
              <rect x="-13" y="13" width="26" height="4" rx="1" fill="#d97706" />
              <circle cx="0" cy="15" r="1.8" fill="#e11d48" />
              <circle cx="-6" cy="15" r="1.4" fill="#38bdf8" />
              <circle cx="6" cy="15" r="1.4" fill="#38bdf8" />
              <circle cx="0" cy="-4" r="1.5" fill="#fef08a" />
            </g>
          )}

          {/* Tiara de Gala de Año Nuevo */}
          {activeThemeId === 'newyear' && (
            <g className="mascot-accessory-newyear-tiara" transform="translate(128, 38) scale(1.15)">
              <polygon points="-8,8 -10,0 -4,4 0,-4 4,4 10,0 8,8" fill="#f59e0b" />
              <circle cx="0" cy="-4" r="1.5" fill="#ffffff" />
            </g>
          )}

          {/* Brote Natural del Medio Ambiente */}
          {activeThemeId === 'environment' && (
            <g className="mascot-accessory-environment" transform="translate(128, 36) scale(1.3)">
              <path d="M 0 11 Q -9 0 -5 -7 Q 5 -5 0 11 Z" fill="#10b981" />
              <path d="M 0 11 Q 9 2 7 -5 Q -2 -3 0 11 Z" fill="#34d399" />
              <path d="M 0 11 L 0 -5" stroke="#047857" strokeWidth="0.9" fill="none" />
              <circle cx="-2" cy="-4" r="1.5" fill="#ffffff" opacity="0.85" />
            </g>
          )}

          {/* Corazón de San Valentín flotando */}
          {activeThemeId === 'valentines' && (
            <g className="mascot-accessory-valentines" transform="translate(130, 32) scale(1.2)">
              <path d="M 0 3 C -5 -5, -14 0, 0 12 C 14 0, 5 -5, 0 3 Z" fill="#e11d48" opacity="0.95" />
              <path d="M 12 -4 C 9 -9, 3 -6, 12 3 C 21 -6, 15 -9, 12 -4 Z" fill="#f43f5e" opacity="0.85" transform="scale(0.65)" />
              <circle cx="0" cy="5" r="1.5" fill="#ffffff" opacity="0.8" />
            </g>
          )}

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

          {/* Lentes de Sol de Verano con Flor de Hibisco */}
          {activeThemeId === 'summer' && (
            <g className="mascot-accessory-summer" transform="translate(130, 54) scale(1.15)">
              <rect x="-11" y="0" width="18" height="12" rx="4.5" fill="#0f172a" />
              <rect x="-10" y="1" width="16" height="10" rx="3.5" fill="url(#summerLensGrad)" />
              <path d="M -11 3 L -19 1" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M 7 4 L 15 3" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M -8 2 L -3 10" stroke="#ffffff" strokeWidth="1.4" opacity="0.8" strokeLinecap="round" />
              <g transform="translate(-16, -14)">
                <circle cx="0" cy="0" r="4.5" fill="#fb7185" />
                <circle cx="0" cy="0" r="2" fill="#fef08a" />
                <circle cx="-3" cy="-2" r="3" fill="#f43f5e" opacity="0.9" />
                <circle cx="3" cy="-2" r="3" fill="#f43f5e" opacity="0.9" />
              </g>
            </g>
          )}
        </g>

        {/* ALA DELANTERA (Aleteo, estiramiento o rotación con plumaje temático) */}
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
            fill={`url(#colibriWingGrad_${gradPrefix})`} 
          />
          <path 
            d="M 112 78 C 126 32, 152 16, 175 10 C 160 35, 134 65, 114 85 Z" 
            fill={plumage.wingHighlight} 
            opacity="0.65" 
          />
        </g>

        {/* PARTÍCULAS / DESTELLOS FLOTANTES EN ÓRBITA CON COLORES DEL TEMA */}
        <g className="colibri-sparkles-group">
          <circle cx="172" cy="38" r="3" fill={plumage.sparkles[0]} opacity="0.9" className="sparkle-1" />
          <circle cx="42" cy="78" r="2.5" fill={plumage.sparkles[1]} opacity="0.85" className="sparkle-2" />
          <circle cx="155" cy="135" r="3.5" fill={plumage.sparkles[2]} opacity="0.9" className="sparkle-3" />
          <circle cx="70" cy="30" r="2" fill={plumage.sparkles[3]} opacity="0.8" className="sparkle-4" />
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
          <span>{getMascotBadgeTitle()}</span>
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
    </div>
  );
};

export default ColibriMascot;
