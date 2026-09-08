import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Brain, ClipboardList, Calendar, Trophy, 
  MessageSquare, HeartHandshake, ChevronRight, ChevronLeft, 
  X, Check, Bot, Zap, ArrowRight, BarChart3, Users, Building, ShieldCheck
} from 'lucide-react';
import ColibriMascot from './ColibriMascot';
import ColibriEquiAvatar from './ColibriEquiAvatar';

/**
 * ============================================================================
 * EQUI TOUR MODAL (Recorrido Interactivo Guiado con Equi el Colibrí)
 * ============================================================================
 * Presenta paso a paso las funciones principales de EquilibrIA con animaciones,
 * poses interactivas de la mascota oficial y recompensas de bienvenida.
 */
export const EquiTourModal = ({ 
  isOpen, 
  onClose, 
  userRole = 'miembro', 
  userName = '', 
  onCompleteReward 
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Pasos personalizados según el rol del usuario (Colaborador / Administrador)
  const isMember = userRole === 'miembro';

  const memberSteps = [
    {
      id: 'welcome',
      title: `¡Hola ${userName ? userName : ''}! Soy Equi 💜`,
      subtitle: 'Tu colibrí compañero de bienestar emocional',
      icon: Sparkles,
      iconColor: 'var(--primary)',
      badge: 'Bienvenida',
      mascotMood: 'welcome',
      mascotMessage: '¡Qué alegría tenerte aquí! Te acompañaré en cada jornada para cuidar tu energía, reducir el estrés y potenciar tu bienestar.',
      content: (
        <div style={{ display: 'grid', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          <p>
            Bienvenido a <strong>EquilibrIA</strong>, tu espacio seguro y confidencial diseñado para ayudarte a encontrar el balance perfecto entre tu vida diaria y tus metas.
          </p>
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
              🌟 ¿Qué haremos juntos?
            </span>
            <span>Vamos a dar un vistazo rápido de 1 minuto por tus herramientas principales para que aproveches al máximo tu plataforma.</span>
          </div>
        </div>
      )
    },
    {
      id: 'wellbeing',
      title: 'Mi Bienestar Integral',
      subtitle: 'Monitorea cómo te sientes día a día',
      icon: Brain,
      iconColor: '#a855f7',
      badge: 'Módulo Principal',
      mascotMood: 'happy',
      mascotMessage: '¡Tómate 2 minutos al día para registrar tus emociones o escuchar una pausa guiada de calma!',
      content: (
        <div style={{ display: 'grid', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          <p>
            En este módulo podrás registrar tus reflexiones por <strong>texto o voz</strong>. Nuestro sistema procesa tus palabras con respeto a tu privacidad para entregarte recomendaciones personalizadas.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <span style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '12px', display: 'block' }}>🎙️ Registro por Voz</span>
              <span style={{ fontSize: '11px' }}>Cuéntame cómo estuvo tu día de forma natural y sin esfuerzo.</span>
            </div>
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <span style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '12px', display: 'block' }}>🧘 Pausas y Recursos</span>
              <span style={{ fontSize: '11px' }}>Ejercicios de respiración, estiramiento y cápsulas anti-estrés.</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'tasks',
      title: 'Mis Tareas y Hábitos',
      subtitle: 'Organiza tu día en Lista o Tablero Kanban',
      icon: ClipboardList,
      iconColor: '#3b82f6',
      badge: 'Productividad Saludable',
      mascotMood: 'thinking',
      mascotMessage: 'Divide grandes tareas en pequeños pasos alcanzables. ¡Cada logro suma experiencia a tu perfil!',
      content: (
        <div style={{ display: 'grid', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          <p>
            Visualiza tus pendientes laborales y compromisos personales sin abrumarte. Puedes alternar fácilmente entre una <strong>vista de lista</strong> o un <strong>tablero Kanban</strong> visual.
          </p>
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Zap size={20} style={{ color: 'var(--warning)', flexShrink: 0 }} />
            <span style={{ fontSize: '12px' }}>
              <strong>Recompensas al instante:</strong> Cada tarea completada te premia con <strong>+20 XP</strong> para subir de nivel en la plataforma.
            </span>
          </div>
        </div>
      )
    },
    {
      id: 'evaluations',
      title: 'Evaluaciones y Tests Preventivos',
      subtitle: 'Cuestionarios interactivos con retroalimentación',
      icon: Calendar,
      iconColor: '#10b981',
      badge: 'Autoconocimiento',
      mascotMood: 'happy',
      mascotMessage: '¡Te acompaño pregunta a pregunta en cada test interactivo con dinámicas claras y amigables!',
      content: (
        <div style={{ display: 'grid', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          <p>
            Responde evaluaciones breves sobre balance de vida, sobrecarga o clima de equipo diseñadas bajo criterios psicológicos preventivos.
          </p>
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>
              🎯 Retroalimentación inmediata
            </span>
            <span style={{ fontSize: '11.5px' }}>
              Al terminar, obtendrás recomendaciones prácticas y orientativas adaptadas a tus respuestas para mejorar tu semana.
            </span>
          </div>
        </div>
      )
    },
    {
      id: 'progress',
      title: 'Mi Progreso y Recompensas',
      subtitle: 'Gamificación, rachas e insignias de bienestar',
      icon: Trophy,
      iconColor: '#f59e0b',
      badge: 'Motivación',
      mascotMood: 'celebrate',
      mascotMessage: '¡Mantén tu racha activa! Cada día que cuidas de ti mismo te acerca a nuevas insignias y reconocimientos.',
      content: (
        <div style={{ display: 'grid', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          <p>
            Tu esfuerzo diario se traduce en <strong>puntos de experiencia (XP)</strong>, niveles honoríficos y rachas consecutivas de autocuidado.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <span style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '12px', display: 'block' }}>🔥 Racha de Bienestar</span>
              <span style={{ fontSize: '11px' }}>Ingresa diariamente y mantén encendida la llama de tus hábitos.</span>
            </div>
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <span style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '12px', display: 'block' }}>🎁 Tienda y Logros</span>
              <span style={{ fontSize: '11px' }}>Canjea beneficios institucionales y desbloquea trofeos.</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'community',
      title: 'Comunidad y Apoyo 1 a 1',
      subtitle: 'Kudos entre compañeros y citas confidenciales',
      icon: HeartHandshake,
      iconColor: '#ec4899',
      badge: 'Red de Apoyo',
      mascotMood: 'welcome',
      mascotMessage: 'Reconocer a tus compañeros genera un ambiente positivo, y si necesitas apoyo profesional, estamos a un clic.',
      content: (
        <div style={{ display: 'grid', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          <p>
            El bienestar es colectivo. Comparte reconocimientos (<strong>Kudos</strong>) con tus colegas y descarga tarjetas de felicitación para celebrar sus logros.
          </p>
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>
              🔒 Agenda Confidencial 1 a 1
            </span>
            <span style={{ fontSize: '11.5px' }}>
              Puedes solicitar una sesión de orientación confidencial con el equipo de bienestar cuando sientas que necesitas conversar.
            </span>
          </div>
        </div>
      )
    },
    {
      id: 'equi_ai',
      title: '¡Y aquí estoy yo siempre contigo!',
      subtitle: 'Tu botón flotante de Asistente Equi AI',
      icon: Bot,
      iconColor: 'var(--primary)',
      badge: 'Asistente 24/7',
      mascotMood: 'celebrate',
      mascotMessage: '¡Felicidades por completar el recorrido! Recuerda que puedes arrastrar mi botón a cualquier parte de tu pantalla.',
      content: (
        <div style={{ display: 'grid', gap: '12px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          <p>
            En la esquina inferior verás mi botón flotante <strong>"Equi AI"</strong>. Puedes hacer clic en él en cualquier momento para:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', display: 'grid', gap: '4px' }}>
            <li>Conversar sobre tus inquietudes o desahogarte de manera confidencial.</li>
            <li>Iniciar una sesión guiada de respiración profunda 4-7-8 cuando te sientas con prisa.</li>
            <li>Recibir recomendaciones constructivas para tu día a día.</li>
          </ul>
          <div style={{ backgroundColor: 'var(--primary-light)', padding: '12px 16px', borderRadius: '14px', border: '2px solid var(--primary)', textAlign: 'center', marginTop: '4px' }}>
            <span style={{ fontSize: '14px', fontWeight: '900', color: 'var(--primary)', display: 'block' }}>
              🎉 ¡Recompensa de Bienvenida Desbloqueada!
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: '700' }}>
              Has ganado <strong>+25 XP</strong> por completar el recorrido con Equi.
            </span>
          </div>
        </div>
      )
    }
  ];

  const adminSteps = [
    {
      id: 'admin_welcome',
      title: `¡Bienvenido Administrador! Soy Equi 💜`,
      subtitle: 'Centro de Inteligencia y Gestión del Bienestar',
      icon: Sparkles,
      iconColor: 'var(--primary)',
      badge: 'Panel de Control',
      mascotMood: 'welcome',
      mascotMessage: '¡Hola! Te orientaré en las herramientas de monitoreo y cuidado preventivo de tu organización.',
      content: (
        <div style={{ display: 'grid', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          <p>
            Como líder o gestor de bienestar en <strong>EquilibrIA</strong>, tienes acceso a métricas analíticas anonimizadas y herramientas de acción preventiva para cuidar a tus equipos.
          </p>
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
              🛡️ Confidencialidad y Ética Garantizada
            </span>
            <span>Todas las métricas se presentan agregadas y anónimas respetando los más altos estándares de privacidad psicológica.</span>
          </div>
        </div>
      )
    },
    {
      id: 'admin_analytics',
      title: 'Analíticas y Semáforo de Alertas',
      subtitle: 'Detección temprana y clima departamental',
      icon: BarChart3,
      iconColor: '#3b82f6',
      badge: 'Prevención',
      mascotMood: 'thinking',
      mascotMessage: 'Visualiza la evolución del clima laboral y atiende oportunamente alertas preventivas de sobrecarga.',
      content: (
        <div style={{ display: 'grid', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          <p>
            Consulta gráficos de tendencia en tiempo real, índices de estrés, satisfacción y engagement divididos por departamentos o sedes.
          </p>
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>
              🚨 Bandeja de Alertas Preventivas
            </span>
            <span style={{ fontSize: '11.5px' }}>
              Recibe notificaciones automáticas cuando un grupo reporte sobrecarga y documenta planes de acción de forma ordenada.
            </span>
          </div>
        </div>
      )
    },
    {
      id: 'admin_evals_and_members',
      title: 'Gestión de Evaluaciones y Usuarios',
      subtitle: 'Activa tests con 1 clic y administra equipos',
      icon: Users,
      iconColor: '#10b981',
      badge: 'Herramientas Clave',
      mascotMood: 'happy',
      mascotMessage: '¡Puedes activar cuestionarios validados en segundos para toda la empresa o departamentos específicos!',
      content: (
        <div style={{ display: 'grid', gap: '10px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          <p>
            EquilibrIA cuenta con plantillas preconfiguradas de tests organizacionales (Burnout, Clima, Riesgos Psicosociales) listos para ser aplicados.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <span style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '12px', display: 'block' }}>📋 Tests en 1 Clic</span>
              <span style={{ fontSize: '11px' }}>Activa evaluaciones automáticas con fechas límite y recordatorios.</span>
            </div>
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <span style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '12px', display: 'block' }}>👥 Usuarios y Sedes</span>
              <span style={{ fontSize: '11px' }}>Control de roles, invitaciones, departamentos e instituciones.</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'admin_ready',
      title: '¡Todo listo para gestionar el bienestar!',
      subtitle: 'Equi está a tu disposición en cualquier momento',
      icon: Bot,
      iconColor: 'var(--primary)',
      badge: 'Soporte Continuo',
      mascotMood: 'celebrate',
      mascotMessage: '¡Excelente! Tienes todas las herramientas a tu alcance para crear un entorno laboral más sano y positivo.',
      content: (
        <div style={{ display: 'grid', gap: '12px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          <p>
            También cuentas con el asistente <strong>Equi AI</strong> en tu pantalla para consultar dudas y el módulo de <strong>Reportes Oficiales</strong> para exportar análisis institucionales en PDF o Excel.
          </p>
          <div style={{ backgroundColor: 'var(--primary-light)', padding: '12px 16px', borderRadius: '14px', border: '2px solid var(--primary)', textAlign: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: '900', color: 'var(--primary)', display: 'block' }}>
              ✨ ¡Recorrido Completado!
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: '700' }}>
              Gracias por liderar el bienestar de tu equipo con empatía y datos.
            </span>
          </div>
        </div>
      )
    }
  ];

  const steps = isMember ? memberSteps : adminSteps;
  const currentStepData = steps[currentStep] || steps[0];
  const totalSteps = steps.length;
  const isLastStep = currentStep === totalSteps - 1;

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (isLastStep) {
      handleFinish();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    if (onCompleteReward) {
      onCompleteReward();
    }
    onClose();
  };

  const StepIcon = currentStepData.icon;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 100000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      animation: 'fadeIn 0.25s ease'
    }}>
      <div 
        className="glass-card animate-scale"
        style={{
          maxWidth: '680px',
          width: '100%',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '24px',
          border: '2px solid var(--primary)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}
      >
        {/* Encabezado del Modal con Indicador de Progreso */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img src="/logo.png" alt="Equi Colibrí" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
            </div>
            <div>
              <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Tour Guiado con Equi el Colibrí
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-primary)' }}>
                  Paso {currentStep + 1} de {totalSteps}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>•</span>
                <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700' }}>
                  {currentStepData.badge}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar tour"
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s ease'
            }}
            title="Omitir recorrido"
          >
            <X size={18} />
          </button>
        </div>

        {/* Barra de Progreso Lineal Superior */}
        <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--border)' }}>
          <div 
            style={{ 
              width: `${((currentStep + 1) / totalSteps) * 100}%`, 
              height: '100%', 
              backgroundColor: 'var(--primary)',
              transition: 'width 0.3s ease'
            }} 
          />
        </div>

        {/* Cuerpo del Modal: Colibrí Animado + Explicación (Adaptable a móviles) */}
        <div 
          className="equi-tour-content-body"
          style={{
            padding: '24px',
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '20px',
            alignItems: 'center'
          }}
        >
          {/* Mascota Equi con Globito Contextual */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-secondary)',
            padding: '16px 12px',
            borderRadius: '20px',
            border: '1px solid var(--border)',
            minHeight: '260px'
          }}>
            <div style={{ width: '170px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ColibriEquiAvatar 
                pose={currentStepData.mascotMood === 'celebrate' ? 'celebrate' : (currentStepData.mascotMood === 'happy' ? 'inhale' : 'neutral')}
                compact={true}
                animated={true}
              />
            </div>
            
            {/* Pequeña Burbuja de Diálogo de Equi */}
            <div style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '8px 12px',
              marginTop: '4px',
              fontSize: '11px',
              color: 'var(--text-primary)',
              fontWeight: '700',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)',
              position: 'relative'
            }}>
              <span style={{ color: 'var(--primary)' }}>“</span>{currentStepData.mascotMessage}<span style={{ color: 'var(--primary)' }}>”</span>
            </div>
          </div>

          {/* Panel de Contenido y Detalles del Paso */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: currentStepData.iconColor,
                flexShrink: 0
              }}>
                <StepIcon size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px' }}>
                  {currentStepData.title}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                  {currentStepData.subtitle}
                </span>
              </div>
            </div>

            {/* Contenido personalizado del paso */}
            <div style={{ minHeight: '140px' }}>
              {currentStepData.content}
            </div>

            {/* Indicadores de Puntos (Dots) */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentStep(idx)}
                  style={{
                    width: currentStep === idx ? '20px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    backgroundColor: currentStep === idx ? 'var(--primary)' : 'var(--border)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    padding: 0
                  }}
                  title={`Ir al paso ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Pie de Acciones del Modal */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-secondary)',
          gap: '12px'
        }}>
          <div>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '12.5px',
                fontWeight: '700',
                cursor: 'pointer',
                padding: '6px 10px',
                borderRadius: '8px'
              }}
            >
              Saltar recorrido
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="btn btn-secondary"
                style={{
                  padding: '9px 16px',
                  borderRadius: '12px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ChevronLeft size={16} />
                <span>Atrás</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="btn btn-primary"
              style={{
                padding: '9px 20px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '900',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px var(--primary-light)'
              }}
            >
              <span>{isLastStep ? '¡Empezar a explorar!' : 'Siguiente'}</span>
              {isLastStep ? <Check size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquiTourModal;
