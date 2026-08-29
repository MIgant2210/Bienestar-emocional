import React, { useState } from 'react';
import { 
  Sparkles, Save, X, Eye, BookOpen, AlertCircle, Layers, Activity, 
  Filter, Clock, Plus, Trash2, CheckCircle2, RotateCcw, ShieldCheck, 
  Sliders, Play, Award, CheckSquare, MessageSquare, Volume2, Video, 
  HelpCircle, Compass, Heart, Calendar, Music, Headphones, Link2,
  Wind, FileText, PenLine, Smile, Lightbulb, UserCheck, Check
} from 'lucide-react';
import api from '../services/api';
import CustomSelect from './CustomSelect';
import ResourceInteractivePlayer from './ResourceInteractivePlayer';
import { GUIDED_EXERCISES_LIBRARY } from '../data/guidedExercises';

const ALL_19_CATEGORIES = [
  'Bienestar emocional',
  'Manejo del estrés',
  'Ansiedad y preocupación',
  'Motivación',
  'Autoestima',
  'Inteligencia emocional',
  'Relaciones interpersonales',
  'Comunicación',
  'Autocuidado',
  'Descanso',
  'Hábitos saludables',
  'Organización del tiempo',
  'Ambiente educativo',
  'Ambiente laboral',
  'Prevención del agotamiento',
  'Manejo de emociones',
  'Salud mental',
  'Necesito ayuda',
  'Cultura y bienestar en Guatemala'
].map(cat => ({ value: cat, label: cat }));

const RESOURCE_TYPES = [
  { value: 'articulo', label: 'Lectura / Artículo' },
  { value: 'ejercicio', label: 'Ejercicio / Pausa Activa' },
  { value: 'checklist', label: 'Checklist Interactivo' },
  { value: 'respiracion', label: 'Respiración Guiada' },
  { value: 'reflexion', label: 'Reflexión Guiada' },
  { value: 'registro_emocional', label: 'Registro Emocional' },
  { value: 'audio', label: 'Audio / Meditación' },
  { value: 'reto', label: 'Reto / Desafío' },
  { value: 'diario', label: 'Diario Personal' },
  { value: 'gratitud', label: 'Gratitud' },
  { value: 'quiz', label: 'Quiz Educativo' },
  { value: 'video', label: 'Video Educativo' },
  { value: 'consejo', label: 'Consejo Rápido' },
  { value: 'grounding', label: 'Técnica Grounding 5-4-3-2-1' }
];

const LEVEL_OPTIONS = [
  { value: 'principiante', label: 'Principiante' },
  { value: 'intermedio', label: 'Intermedio' },
  { value: 'avanzado', label: 'Avanzado' }
];

const getDefaultConfigForType = (type) => {
  switch (type) {
    case 'checklist':
      return {
        items: [
          { id: 'item_1', text: 'Tomar 1 vaso de agua al despertar', required: true, xp: 2 },
          { id: 'item_2', text: 'Hacer 3 respiraciones profundas conscientes', required: true, xp: 3 },
          { id: 'item_3', text: 'Realizar 5 minutos de estiramiento suave', required: false, xp: 2 }
        ],
        completion_behavior: 'all_required',
        min_percent: 80,
        completion_message: 'Has completado todas las actividades del checklist con éxito.'
      };
    case 'respiracion':
      return {
        technique_name: 'Respiración Relajante 4-4-6',
        inhale: 4,
        hold_in: 4,
        exhale: 6,
        hold_out: 0,
        cycles: 3,
        total_cycles: 3,
        voice_guide: true,
        sound_theme: 'zen_ambient',
        precautions: 'Si sientes mareo o incomodidad, detén el ejercicio y respira a tu ritmo natural.',
        steps: [
          { step: 1, name: 'INHALA', type: 'inhale', duration: 4, text: 'Inhala suavemente por la nariz llenando tus pulmones y abdomen.', voice: 'Inhala lentamente por la nariz.' },
          { step: 2, name: 'MANTÉN', type: 'hold', duration: 4, text: 'Sostén el aire con calma, sintiendo el centro de tu equilibrio.', voice: 'Mantén la respiración.' },
          { step: 3, name: 'EXHALA', type: 'exhale', duration: 6, text: 'Exhala despacio por la boca liberando toda la tensión acumulada.', voice: 'Exhala suavemente.' }
        ]
      };
    case 'reflexion':
      return {
        main_question: '¿Qué momento de tu jornada requirió mayor resiliencia hoy?',
        secondary_questions: ['¿Cómo respondiste ante esa situación?', '¿Qué puedes agradecer de tu aprendizaje?'],
        response_type: 'text',
        is_private: true
      };
    case 'registro_emocional':
      return {
        available_emotions: ['Calma', 'Alegría', 'Tensión', 'Cansancio', 'Motivación', 'Tristeza', 'Frustración', 'Gratitud'],
        track_intensity: true,
        additional_prompt: '¿Cómo te sientes en este momento y qué influyó principalmente en tu estado?',
        tags: ['Trabajo', 'Familia', 'Salud', 'Descanso', 'Metas']
      };
    case 'audio':
      return {
        audio_url: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg',
        narrator: 'Sofía Gómez (Voz de Bienestar)',
        duration_minutes: 5,
        transcription: 'Cierra suavemente los ojos, respira profundo y permite que este sonido ambiental te acompañe a un estado de calma y claridad mental.',
        background_music: 'Zen & Armonía'
      };
    case 'video':
      return {
        video_url: 'https://www.youtube.com/watch?v=inpok4MKVLM',
        thumbnail_url: '',
        duration_minutes: 5,
        transcription: 'En este video guiado aprenderás cómo reconectar con la respiración diafragmática y desactivar la respuesta de estrés en pocos minutos.'
      };
    case 'reto':
      return {
        duration_days: 7,
        days: [
          { day: 1, title: 'Día 1: Desconexión Digital 30 min', task: 'Apaga pantallas 30 min antes de dormir', xp: 5 },
          { day: 2, title: 'Día 2: Hidratación Consciente', task: 'Bebe 2 litros de agua durante la jornada', xp: 5 },
          { day: 3, title: 'Día 3: Pausa Activa de Mediodía', task: 'Realiza 5 min de estiramiento al mediodía', xp: 5 },
          { day: 4, title: 'Día 4: Reflexión de Gratitud', task: 'Escribe 3 cosas positivas de tu jornada', xp: 5 },
          { day: 5, title: 'Día 5: Caminata al Aire Libre', task: 'Camina 15 minutos en contacto con la luz natural', xp: 5 },
          { day: 6, title: 'Día 6: Conversación Significativa', task: 'Conecta con un amigo o colega sin hablar de trabajo', xp: 5 },
          { day: 7, title: 'Día 7: Balance y Cierre', task: 'Revisa tus logros semanales y celebra tu constancia', xp: 10 }
        ],
        final_reward_xp: 50,
        badge_unlock: 'Campeón de Bienestar'
      };
    case 'diario':
      return {
        prompts: [
          '¿Cómo te has sentido durante tu jornada?',
          '¿Qué situación requirió más energía o paciencia hoy?',
          '¿Qué aprendizaje o momento positivo te llevas?'
        ],
        is_private: true
      };
    case 'gratitud':
      return {
        item_count: 3,
        prompt_text: 'Escribe 3 motivos o momentos por los cuales te sientes agradecido el día de hoy.'
      };
    case 'quiz':
      return {
        questions: [
          {
            id: 'q1',
            question: '¿Cuál es una técnica efectiva para reducir la rumiación nocturna?',
            type: 'single',
            options: ['Tomar cafeína antes de dormir', 'Escribir las preocupaciones en una libreta (Brain Dump)', 'Ver pantallas brillantes en la cama', 'Saltarse la cena'],
            correct_answer: 1,
            explanation: 'Anotar pensamientos pendientes antes de acostarte ayuda a descargar la memoria de trabajo y disminuye la hiperactivación mental.'
          }
        ],
        disclaimer: 'Este quiz es de naturaleza didáctica y formativa, no constituye evaluación clínica.'
      };
    case 'consejo':
      return {
        key_takeaway: 'La respiración diafragmática profunda activa el sistema nervioso parasimpático y reduce el cortisol en menos de 2 minutos.',
        icon_badge: 'Lightbulb'
      };
    case 'grounding':
      return {
        technique: '5-4-3-2-1',
        total_cycles: 1,
        precautions: 'Tómate el tiempo necesario para detallar cada objeto o sensación.',
        steps: [
          { step: 1, name: '5 COSAS QUE VES', type: 'step', duration: 25, text: 'Observa 5 cosas a tu alrededor con atención.', voice: 'Identifica 5 cosas que puedes ver.' },
          { step: 2, name: '4 COSAS QUE SIENTES', type: 'step', duration: 25, text: 'Siente 4 texturas o sensaciones en tu cuerpo o entorno.', voice: 'Siente 4 texturas en tu cuerpo o entorno.' },
          { step: 3, name: '3 COSAS QUE ESCUCHAS', type: 'step', duration: 20, text: 'Escucha 3 sonidos distintos en tu ambiente.', voice: 'Presta atención a 3 sonidos distintos.' },
          { step: 4, name: '2 COSAS QUE HUELEN', type: 'step', duration: 20, text: 'Identifica 2 aromas o respira percibiendo el aire.', voice: 'Identifica 2 aromas o siente el aire fresco.' },
          { step: 5, name: '1 COSA QUE SABOREAS', type: 'step', duration: 15, text: 'Nota un sabor o toma un sorbo de agua consciente.', voice: 'Conecta con un sabor y siente tu presencia aquí y ahora.' }
        ]
      };
    case 'pausa_activa':
    case 'ejercicio':
      return {
        total_cycles: 1,
        precautions: 'Realiza movimientos suaves sin forzar articulaciones.',
        steps: [
          { step: 1, name: 'POSTURA INICIAL', type: 'step', duration: 20, text: 'Siéntate erguido con los pies planos en el suelo y hombros relajados.', voice: 'Acomoda tu postura y respira.' },
          { step: 2, name: 'MOVILIDAD', type: 'step', duration: 30, text: 'Realiza el movimiento guiado con respiración pausada y fluida.', voice: 'Realiza el movimiento despacio.' },
          { step: 3, name: 'INTEGRACIÓN', type: 'step', duration: 20, text: 'Respira profundo e integra la sensación de bienestar en tu cuerpo.', voice: 'Excelente, respira profundo.' }
        ]
      };
    default:
      return {};
  }
};

const ResourceAdminModal = ({ resource, onClose, onSaved }) => {
  const isEditing = !!resource;
  const initialType = resource?.resource_type || 'articulo';

  const [activeViewTab, setActiveViewTab] = useState('editor'); // 'editor' | 'preview'

  const [formData, setFormData] = useState({
    title: resource?.title || '',
    description: resource?.description || '',
    content: resource?.content || '',
    category: resource?.category || 'Bienestar emocional',
    resource_type: initialType,
    image_url: resource?.image_url || '',
    author: resource?.author || 'Equipo de Bienestar EquilibrIA',
    reading_time_minutes: resource?.reading_time_minutes || 5,
    level: resource?.level || 'principiante',
    tags: Array.isArray(resource?.tags) ? resource.tags.join(', ') : (resource?.tags || ''),
    source_url: resource?.source_url || '',
    source_institution: resource?.source_institution || 'Institucional',
    xp_reward: resource?.xp_reward || 15,
    counts_for_streak: resource?.counts_for_streak !== false,
    allow_ai_recommendation: resource?.allow_ai_recommendation !== false,
    media_url: resource?.media_url || '',
    is_published: resource?.is_published !== false
  });

  const [resourceConfig, setResourceConfig] = useState(
    resource?.resource_config || resource?.interactive_data || getDefaultConfigForType(initialType)
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTypeChange = (newType) => {
    setFormData(prev => ({ ...prev, resource_type: newType }));
    if (!resource || resource.resource_type !== newType) {
      setResourceConfig(getDefaultConfigForType(newType));
    }
  };

  const handleConfigChange = (key, value) => {
    setResourceConfig(prev => ({ ...prev, [key]: value }));
  };

  // Cargar cualquiera de los 14 ejercicios estructurados con 1-clic
  const loadPresetGuidedExercise = (preset) => {
    setFormData(prev => ({
      ...prev,
      title: preset.title,
      description: preset.description,
      category: preset.category,
      resource_type: preset.resource_type,
      reading_time_minutes: preset.reading_time_minutes,
      level: preset.level,
      xp_reward: preset.xp_reward,
      content: preset.steps.map(s => `**${s.name}** (${s.duration}s): ${s.text}`).join('\n\n')
    }));

    setResourceConfig({
      technique_name: preset.title,
      total_cycles: preset.total_cycles,
      cycles: preset.total_cycles,
      precautions: preset.precautions,
      steps: preset.steps,
      voice_guide: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.content.trim()) {
      setError('Título, descripción y contenido son obligatorios.');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      ...formData,
      resource_config: resourceConfig,
      interactive_data: resourceConfig
    };

    try {
      if (isEditing) {
        await api.put(`/wellbeing/resources/${resource.id}`, payload);
      } else {
        await api.post('/wellbeing/resources', payload);
      }
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al guardar el recurso.');
    } finally {
      setLoading(false);
    }
  };

  // Objeto para vista previa en tiempo real
  const previewResource = {
    ...formData,
    resource_config: resourceConfig,
    interactive_data: resourceConfig
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(248, 245, 240, 0.88)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div 
        className="glass-card animate-fade has-dropdown"
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '20px',
          border: '1px solid var(--border)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'visible'
        }}
      >
        {/* Header Modal */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '900', color: 'var(--text-primary)' }}>
                {isEditing ? 'Constructor: Editar Recurso' : 'Constructor Inteligente de Recursos'}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Experiencias interactivas guiadas por el Colibrí Morado y 15 plantillas dinámicas.
              </p>
            </div>
          </div>

          {/* Pestañas de Vista: Editor vs Vista Previa */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', backgroundColor: 'var(--bg-secondary)', padding: '3px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <button
                type="button"
                onClick={() => setActiveViewTab('editor')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  backgroundColor: activeViewTab === 'editor' ? 'var(--primary)' : 'transparent',
                  color: activeViewTab === 'editor' ? '#fff' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Sliders size={13} /> Constructor
              </button>
              <button
                type="button"
                onClick={() => setActiveViewTab('preview')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  backgroundColor: activeViewTab === 'preview' ? 'var(--primary)' : 'transparent',
                  color: activeViewTab === 'preview' ? '#fff' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Eye size={13} /> Vista Previa en Vivo
              </button>
            </div>

            <button 
              onClick={onClose}
              className="icon-button"
              style={{ padding: '6px', color: 'var(--text-secondary)' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {error && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: 'var(--danger-light)',
              color: 'var(--danger)',
              borderRadius: '12px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '13px',
              fontWeight: '700'
            }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {activeViewTab === 'preview' ? (
            /* ================================================================ */
            /* PESTAÑA: VISTA PREVIA EN TIEMPO REAL CON EL COLIBRÍ              */
            /* ================================================================ */
            <div className="animate-fade">
              <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', marginBottom: '18px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Eye size={12} /> Modo Vista Previa Interactiva ({formData.resource_type})
                  </span>
                  <h4 style={{ fontSize: '16px', fontWeight: '900', marginTop: '2px' }}>
                    {formData.title || 'Título del Recurso'}
                  </h4>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '800', padding: '4px 10px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                  +{formData.xp_reward} XP
                </span>
              </div>

              {formData.description && (
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '18px', lineHeight: '1.5' }}>
                  {formData.description}
                </p>
              )}

              {/* Renderizador interactivo en vivo con el Colibrí Morado */}
              <ResourceInteractivePlayer 
                resource={previewResource}
                readOnly={false}
              />
            </div>
          ) : (
            /* ================================================================ */
            /* PESTAÑA: FORMULARIO DINÁMICO                                     */
            /* ================================================================ */
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* 1. Selector de Tipo de Recurso (15 Tipos) */}
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Sliders size={14} style={{ color: 'var(--primary)' }} />
                  <span>Tipo de Recurso (Controla dinámicamente la plantilla):</span>
                </label>
                <CustomSelect
                  options={RESOURCE_TYPES}
                  value={formData.resource_type}
                  onChange={handleTypeChange}
                  placeholder="Selecciona el tipo de recurso interactivo"
                />
              </div>

              {/* BIBLIOTECA DE EJERCICIOS PREDETERMINADOS FILTRADOS EXCLUSIVAMENTE POR EL TIPO SELECCIONADO */}
              {GUIDED_EXERCISES_LIBRARY.some(ex => ex.resource_type === formData.resource_type) && (
                <div className="animate-fade" style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: '14px', border: '1.5px solid var(--primary-light)' }}>
                  <span style={{ fontSize: '12px', fontWeight: '900', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <Sparkles size={14} /> Plantillas Predeterminadas para {formData.resource_type === 'respiracion' ? 'Respiración Guiada' : formData.resource_type === 'pausa_activa' ? 'Pausa Activa' : formData.resource_type === 'grounding' ? 'Grounding' : 'Ejercicios de Relajación'}:
                  </span>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                    {GUIDED_EXERCISES_LIBRARY
                      .filter(ex => ex.resource_type === formData.resource_type)
                      .map(ex => (
                        <button
                          key={ex.id}
                          type="button"
                          onClick={() => loadPresetGuidedExercise(ex)}
                          className="btn btn-secondary"
                          style={{
                            padding: '8px 10px',
                            fontSize: '11.5px',
                            fontWeight: '700',
                            borderRadius: '10px',
                            textAlign: 'left',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '6px'
                          }}
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {ex.title}
                          </span>
                          <Check size={12} style={{ flexShrink: 0, color: 'var(--primary)' }} />
                        </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Datos Generales del Recurso */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    TÍTULO DEL RECURSO *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Respiración Relajante 4-4-6"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    CATEGORÍA DE BIENESTAR *
                  </label>
                  <CustomSelect
                    options={ALL_19_CATEGORIES}
                    value={formData.category}
                    onChange={(val) => setFormData({ ...formData, category: val })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  DESCRIPCIÓN BREVE *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Resumen del beneficio y objetivo de este recurso..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', resize: 'vertical' }}
                />
              </div>

              {/* ============================================================ */}
              {/* 3. CAMPOS ESPECÍFICOS SEGÚN EL TIPO DE RECURSO               */}
              {/* ============================================================ */}

              {/* PLANTILLA 1: AUDIO / MEDITACIÓN */}
              {formData.resource_type === 'audio' && (
                <div className="animate-fade" style={{ padding: '16px', borderRadius: '14px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--primary-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Headphones size={16} /> Configuración de Audio / Meditación
                    </h4>
                    <button
                      type="button"
                      onClick={() => handleConfigChange('audio_url', 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg')}
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Music size={12} /> Usar Audio Muestra de Lluvia y Calma
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        URL DEL ARCHIVO DE AUDIO (.MP3 / .OGG / STREAM) *
                      </label>
                      <input
                        type="url"
                        placeholder="https://ejemplo.com/audio-meditacion.mp3"
                        value={resourceConfig.audio_url || ''}
                        onChange={(e) => handleConfigChange('audio_url', e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '12.5px' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        NARRADOR O GUÍA DE VOZ:
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Sofía Gómez (Voz de Bienestar)"
                        value={resourceConfig.narrator || ''}
                        onChange={(e) => handleConfigChange('narrator', e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '12.5px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        MÚSICA O AMBIENTE DE FONDO:
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Ondas Theta / Zen & Armonía"
                        value={resourceConfig.background_music || ''}
                        onChange={(e) => handleConfigChange('background_music', e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '12.5px' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        DURACIÓN (MINUTOS):
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={120}
                        value={resourceConfig.duration_minutes || formData.reading_time_minutes || 5}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 5;
                          handleConfigChange('duration_minutes', val);
                          setFormData(prev => ({ ...prev, reading_time_minutes: val }));
                        }}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '12.5px' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      TRANSCRIPCIÓN / GUÍA TEXTUAL DEL AUDIO:
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Texto que narra el audio o indicaciones para acompañar la escucha..."
                      value={resourceConfig.transcription || ''}
                      onChange={(e) => handleConfigChange('transcription', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '12.5px' }}
                    />
                  </div>
                </div>
              )}

              {/* PLANTILLA 2: VIDEO EDUCATIVO */}
              {formData.resource_type === 'video' && (
                <div className="animate-fade" style={{ padding: '16px', borderRadius: '14px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--primary-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Video size={16} /> Configuración de Video Educativo
                    </h4>
                    <button
                      type="button"
                      onClick={() => handleConfigChange('video_url', 'https://www.youtube.com/watch?v=inpok4MKVLM')}
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Video size={12} /> Usar Video Muestra de Mindfulness
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        URL DEL VIDEO (YouTube / Vimeo / MP4) *
                      </label>
                      <input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={resourceConfig.video_url || ''}
                        onChange={(e) => handleConfigChange('video_url', e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '12.5px' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        DURACIÓN ESTIMADA (MINUTOS):
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={180}
                        value={resourceConfig.duration_minutes || formData.reading_time_minutes || 5}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 5;
                          handleConfigChange('duration_minutes', val);
                          setFormData(prev => ({ ...prev, reading_time_minutes: val }));
                        }}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '12.5px' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      PUNTOS CLAVE / RESUMEN DEL VIDEO:
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Resumen didáctico de las principales enseñanzas del video..."
                      value={resourceConfig.transcription || ''}
                      onChange={(e) => handleConfigChange('transcription', e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '12.5px' }}
                    />
                  </div>
                </div>
              )}

              {/* PLANTILLA 3: CHECKLIST */}
              {formData.resource_type === 'checklist' && (
                <div className="animate-fade" style={{ padding: '16px', borderRadius: '14px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--primary-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckSquare size={16} /> Configuración del Checklist
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        const nextItems = [...(resourceConfig.items || []), { id: `item_${Date.now()}`, text: '', required: true, xp: 2 }];
                        handleConfigChange('items', nextItems);
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '11.5px', borderRadius: '8px' }}
                    >
                      <Plus size={13} /> Agregar Elemento
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                    {(resourceConfig.items || []).map((item, idx) => (
                      <div key={item.id || idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'var(--bg-tertiary)', padding: '10px', borderRadius: '10px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>#{idx+1}</span>
                        <input
                          type="text"
                          placeholder="Descripción del ítem de la lista..."
                          value={item.text}
                          onChange={(e) => {
                            const updated = [...resourceConfig.items];
                            updated[idx].text = e.target.value;
                            handleConfigChange('items', updated);
                          }}
                          style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '12.5px' }}
                        />
                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={item.required}
                            onChange={(e) => {
                              const updated = [...resourceConfig.items];
                              updated[idx].required = e.target.checked;
                              handleConfigChange('items', updated);
                            }}
                          />
                          Obligatorio
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const filtered = resourceConfig.items.filter((_, i) => i !== idx);
                            handleConfigChange('items', filtered);
                          }}
                          style={{ border: 'none', background: 'transparent', color: 'var(--danger)', cursor: 'pointer' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      MENSAJE DE FELICITACIÓN AL FINALIZAR:
                    </label>
                    <input
                      type="text"
                      value={resourceConfig.completion_message || ''}
                      onChange={(e) => handleConfigChange('completion_message', e.target.value)}
                      placeholder="Has completado todas las actividades del checklist con éxito."
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '12.5px' }}
                    />
                  </div>
                </div>
              )}

              {/* PLANTILLA 4: EJERCICIO GUIADO / RESPIRACIÓN / PAUSA ACTIVA */}
              {(formData.resource_type === 'respiracion' || formData.resource_type === 'ejercicio' || formData.resource_type === 'pausa_activa' || formData.resource_type === 'grounding') && (
                <div className="animate-fade" style={{ padding: '16px', borderRadius: '14px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--primary-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Wind size={16} /> Configuración de Pasos y Ciclos del Ejercicio
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        const nextSteps = [...(resourceConfig.steps || []), {
                          step: (resourceConfig.steps?.length || 0) + 1,
                          name: `PASO ${(resourceConfig.steps?.length || 0) + 1}`,
                          type: 'step',
                          duration: 20,
                          text: 'Instrucción detallada...',
                          voice: 'Instrucción de voz breve.'
                        }];
                        handleConfigChange('steps', nextSteps);
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '11.5px', borderRadius: '8px' }}
                    >
                      <Plus size={13} /> Agregar Paso
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        NÚMERO DE CICLOS / REPETICIONES:
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={resourceConfig.total_cycles || resourceConfig.cycles || 3}
                        onChange={(e) => {
                          const c = parseInt(e.target.value) || 3;
                          handleConfigChange('total_cycles', c);
                          handleConfigChange('cycles', c);
                        }}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '12.5px' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        ADVERTENCIAS / PRECAUCIONES:
                      </label>
                      <input
                        type="text"
                        value={resourceConfig.precautions || ''}
                        onChange={(e) => handleConfigChange('precautions', e.target.value)}
                        placeholder="Si sientes mareo o incomodidad, detén el ejercicio..."
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '12.5px' }}
                      />
                    </div>
                  </div>

                  {/* Lista editable de pasos */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(resourceConfig.steps || []).map((st, idx) => (
                      <div key={idx} style={{ padding: '10px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                          <input
                            type="text"
                            placeholder="Nombre del paso (ej. INHALA, MANTÉN)..."
                            value={st.name || `Paso ${idx+1}`}
                            onChange={(e) => {
                              const updated = [...resourceConfig.steps];
                              updated[idx].name = e.target.value;
                              handleConfigChange('steps', updated);
                            }}
                            style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '12px' }}
                          />
                          <input
                            type="number"
                            min={1}
                            placeholder="Duración (segundos)"
                            value={st.duration || 4}
                            onChange={(e) => {
                              const updated = [...resourceConfig.steps];
                              updated[idx].duration = parseInt(e.target.value) || 4;
                              handleConfigChange('steps', updated);
                            }}
                            style={{ width: '120px', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '12px' }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const filtered = resourceConfig.steps.filter((_, i) => i !== idx);
                              handleConfigChange('steps', filtered);
                            }}
                            style={{ border: 'none', background: 'transparent', color: 'var(--danger)', cursor: 'pointer' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Texto descriptivo en pantalla..."
                          value={st.text || ''}
                          onChange={(e) => {
                            const updated = [...resourceConfig.steps];
                            updated[idx].text = e.target.value;
                            handleConfigChange('steps', updated);
                          }}
                          style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '12px', marginBottom: '4px' }}
                        />
                        <input
                          type="text"
                          placeholder="Locución breve de voz (Web Speech)..."
                          value={st.voice || ''}
                          onChange={(e) => {
                            const updated = [...resourceConfig.steps];
                            updated[idx].voice = e.target.value;
                            handleConfigChange('steps', updated);
                          }}
                          style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '12px' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Contenido Completo del Recurso */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  CONTENIDO COMPLETO / GUÍA TEXTUAL *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Desarrollo completo del artículo, instrucciones paso a paso o texto guía..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', resize: 'vertical' }}
                />
              </div>

              {/* 5. Parámetros de Gamificación y Publicación */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    NIVEL DE DIFICULTAD
                  </label>
                  <CustomSelect
                    options={LEVEL_OPTIONS}
                    value={formData.level}
                    onChange={(val) => setFormData({ ...formData, level: val })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    TIEMPO ESTIMADO (MINUTOS)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={formData.reading_time_minutes}
                    onChange={(e) => setFormData({ ...formData, reading_time_minutes: parseInt(e.target.value) || 5 })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    RECOMPENSA EN XP
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={200}
                    value={formData.xp_reward}
                    onChange={(e) => setFormData({ ...formData, xp_reward: parseInt(e.target.value) || 15 })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Checkboxes de publicación */}
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', padding: '14px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.counts_for_streak}
                    onChange={(e) => setFormData({ ...formData, counts_for_streak: e.target.checked })}
                  />
                  <span>Contar para Racha Diaria</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.allow_ai_recommendation}
                    onChange={(e) => setFormData({ ...formData, allow_ai_recommendation: e.target.checked })}
                  />
                  <span>Recomendable por IA</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  />
                  <span>Publicado en el Centro de Recursos</span>
                </label>
              </div>

              {/* Botón de Guardado */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                  style={{ padding: '10px 20px', fontSize: '13px', borderRadius: '12px' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ padding: '10px 28px', fontSize: '13px', fontWeight: '900', borderRadius: '12px' }}
                >
                  <Save size={16} />
                  <span>{loading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Publicar Recurso')}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceAdminModal;
