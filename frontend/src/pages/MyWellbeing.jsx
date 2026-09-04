import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
  Brain, Activity, Calendar, Sparkles, BookOpen, Clock, HeartHandshake,
  TrendingUp, Shield, AlertCircle, CheckCircle2, Mic, Square, Send, 
  Search, Book, ArrowRight, ArrowLeft, UserCheck, HelpCircle, ChevronRight, Eye,
  ShieldCheck, Loader, RefreshCw, Zap, Award, Heart, ShieldAlert,
  Bookmark, BookmarkCheck, Star, Volume2, Play, Plus, Edit, Type, 
  ExternalLink, Filter, RotateCcw, CheckSquare, Lock, Phone, User, X, ArrowUpDown,
  Flame, Trophy, Building, BarChart3, Smile, Frown, Meh, Sun, Coffee
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import GamificationWidget from '../components/GamificationWidget';
import ConsentModal from '../components/ConsentModal';
import TestResponseViewer from '../components/TestResponseViewer';
import ResourceAudioPlayer from '../components/ResourceAudioPlayer';
import ResourceInteractivePlayer from '../components/ResourceInteractivePlayer';
import ResourceAdminModal from '../components/ResourceAdminModal';
import CustomSelect from '../components/CustomSelect';

const RESOURCE_TYPE_OPTIONS = [
  { value: 'Todos', label: 'Todos los Tipos (14)' },
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
  { value: 'grounding', label: 'Grounding 5-4-3-2-1' }
];

const RESOURCE_SORT_OPTIONS = [
  { value: 'recent', label: 'Más Recientes' },
  { value: 'popular', label: 'Más Populares' },
  { value: 'duration_asc', label: 'Menor Duración' },
  { value: 'xp_desc', label: 'Mayor XP' },
  { value: 'recommended', label: 'Recomendados para Mí' }
];

const RESOURCE_LEVEL_OPTIONS = [
  { value: 'Todos', label: 'Todos los Niveles' },
  { value: 'principiante', label: 'Principiante' },
  { value: 'intermedio', label: 'Intermedio' },
  { value: 'avanzado', label: 'Avanzado' }
];

const RESOURCE_DURATION_OPTIONS = [
  { value: 'all', label: 'Cualquier Duración' },
  { value: 'short', label: '≤ 5 minutos' },
  { value: 'medium', label: '5 a 10 minutos' },
  { value: 'long', label: '> 10 minutos' }
];

// Helper para formatear negritas y markdown limpio en el lector
const renderFormattedText = (rawText) => {
  if (!rawText) return null;
  const parts = rawText.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: '800' }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
};

const MyWellbeing = ({ onNavigateToTab, initialResourceId, onResourceCompleted }) => {
  const navigate = useNavigate();
  const { user: authUser } = useContext(AuthContext) || {};
  const isAdminOrSupport = authUser && ['superadmin', 'admin_institucion', 'profesional_apoyo'].includes(authUser.role);

  // Estados de Pestañas Internas de Mi Bienestar
  const [activeSection, setActiveSection] = useState(initialResourceId ? 'recursos' : 'estado_actual'); // 'estado_actual', 'historial', 'evaluaciones', 'tendencias', 'recomendaciones', 'recursos'

  // Estados de Datos
  const [summary, setSummary] = useState(null);
  const [historyPeriod, setHistoryPeriod] = useState('30d');
  const [historyData, setHistoryData] = useState({ chart_data: [], records: [] });
  const [myEvaluations, setMyEvaluations] = useState([]);
  const [trends, setTrends] = useState({ has_sufficient_data: false, indicators: [] });
  const [recommendations, setRecommendations] = useState([]);
  const [resources, setResources] = useState([]);
  const [recommendedResources, setRecommendedResources] = useState([]);
  const [resourceCategories, setResourceCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResource, setSelectedResource] = useState(null);

  // Estados específicos de Recursos Interactivos y Accesibilidad
  const [resourceTab, setResourceTab] = useState('all'); // 'all', 'favorites', 'in_progress', 'completed'
  const [resourceTypeFilter, setResourceTypeFilter] = useState('Todos');
  const [resourceLevelFilter, setResourceLevelFilter] = useState('Todos');
  const [resourceDurationFilter, setResourceDurationFilter] = useState('all');
  const [resourceSortBy, setResourceSortBy] = useState('recent');
  const [fontSizeMode, setFontSizeMode] = useState('normal'); // 'small', 'normal', 'large'
  const [activeParagraphIndex, setActiveParagraphIndex] = useState(-1);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [celebrationToast, setCelebrationToast] = useState(null);

  // Estados de Formulario de Registro Emocional / Reflexión
  const [reflectionText, setReflectionText] = useState('');
  const [selectedMoodId, setSelectedMoodId] = useState(null);
  const [reflectionLoading, setReflectionLoading] = useState(false);
  const [reflectionSuccess, setReflectionSuccess] = useState('');
  const [reflectionError, setReflectionError] = useState('');
  const [latestAnalysis, setLatestAnalysis] = useState(null);

  // Grabación de Voz & Consentimiento
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [consentModalType, setConsentModalType] = useState(null);
  const [userConsents, setUserConsents] = useState({});
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);

  const [loading, setLoading] = useState(true);

  // Auto-scroll al encabezado del recurso al abrirlo (optimizado para celular, tablet y escritorio)
  useEffect(() => {
    if (selectedResource) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const timer = setTimeout(() => {
        const viewerTop = document.getElementById('resource-viewer-top');
        if (viewerTop) {
          viewerTop.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [selectedResource?.id]);

  // Cargar datos iniciales
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [sumRes, evalsRes, trendsRes, recsRes, resRes, consentsRes] = await Promise.all([
        api.get('/wellbeing/summary'),
        api.get('/wellbeing/my-evaluations'),
        api.get('/wellbeing/trends'),
        api.get('/wellbeing/recommendations'),
        api.get('/wellbeing/resources'),
        api.get('/wellbeing/consents')
      ]);

      setSummary(sumRes.data);
      setMyEvaluations(evalsRes.data || []);
      setTrends(trendsRes.data || { has_sufficient_data: false, indicators: [] });
      setRecommendations(recsRes.data?.recommendations || []);
      setResources(resRes.data?.resources || []);
      setRecommendedResources(resRes.data?.recommended || []);
      setResourceCategories(['Todas', ...(resRes.data?.categories || [])]);

      // Mapear consentimientos
      const cMap = {};
      (consentsRes.data || []).forEach(c => {
        cMap[c.consent_type] = c.status === 'accepted';
      });
      setUserConsents(cMap);

    } catch (err) {
      console.error('Error cargando datos de bienestar:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (period = historyPeriod) => {
    try {
      const res = await api.get(`/wellbeing/history?period=${period}`);
      setHistoryData(res.data || { chart_data: [], records: [] });
    } catch (err) {
      console.error('Error cargando historial:', err);
    }
  };

  const fetchResources = async () => {
    try {
      let url = '/wellbeing/resources?';
      if (selectedCategory && selectedCategory !== 'Todas') url += `category=${encodeURIComponent(selectedCategory)}&`;
      if (searchQuery.trim()) url += `search=${encodeURIComponent(searchQuery.trim())}&`;
      if (resourceTypeFilter && resourceTypeFilter !== 'Todos') url += `type=${encodeURIComponent(resourceTypeFilter)}&`;
      if (resourceLevelFilter && resourceLevelFilter !== 'Todos') url += `level=${encodeURIComponent(resourceLevelFilter)}&`;
      if (resourceDurationFilter && resourceDurationFilter !== 'all') url += `duration=${encodeURIComponent(resourceDurationFilter)}&`;
      if (resourceSortBy && resourceSortBy !== 'recent') url += `sort_by=${encodeURIComponent(resourceSortBy)}&`;
      if (resourceTab === 'favorites') url += `favorites_only=true&`;
      if (resourceTab === 'in_progress') url += `status=en_progreso&`;
      if (resourceTab === 'completed') url += `status=completado&`;

      const res = await api.get(url);
      setResources(res.data?.resources || []);
      setRecommendedResources(res.data?.recommended || []);
      if (res.data?.categories) {
        setResourceCategories(['Todas', ...res.data.categories]);
      }
    } catch (err) {
      console.error('Error cargando recursos:', err);
    }
  };

  const handleToggleFavorite = async (e, resId) => {
    if (e) e.stopPropagation();
    try {
      const res = await api.post(`/wellbeing/resources/${resId}/favorite`);
      const isFav = res.data?.is_favorite;
      setResources(prev => prev.map(r => r.id === resId ? { ...r, is_favorite: isFav } : r));
      if (selectedResource && selectedResource.id === resId) {
        setSelectedResource(prev => ({ ...prev, is_favorite: isFav }));
      }
    } catch (err) {
      console.error('Error al alternar favorito:', err);
    }
  };

  const handleCompleteResource = async (resId) => {
    try {
      const res = await api.post(`/wellbeing/resources/${resId}/complete`);
      const { gamification, progress, completed_tasks_count } = res.data || {};

      setResources(prev => prev.map(r => r.id === resId ? { ...r, progress: progress } : r));
      if (selectedResource && selectedResource.id === resId) {
        setSelectedResource(prev => ({ ...prev, progress: progress }));
      }

      if (completed_tasks_count > 0) {
        setCelebrationToast({
          message: `¡Felicitaciones! Has completado el recurso y validado automáticamente ${completed_tasks_count} tarea(s) vinculada(s). (+${gamification?.xp_gained || 20} XP)`,
          streak: gamification?.current_streak,
          badges: gamification?.new_badges || []
        });
        setTimeout(() => setCelebrationToast(null), 7000);
      } else if (gamification && !gamification.already_awarded && gamification.xp_gained > 0) {
        setCelebrationToast({
          message: `¡Felicitaciones! Has completado el recurso y ganado +${gamification.xp_gained} XP.`,
          streak: gamification.current_streak,
          badges: gamification.new_badges || []
        });
        setTimeout(() => setCelebrationToast(null), 6000);
      }

      const sumRes = await api.get('/wellbeing/summary');
      setSummary(sumRes.data);

      if (onResourceCompleted) {
        onResourceCompleted();
      }
    } catch (err) {
      console.error('Error al completar recurso:', err);
    }
  };

  const handleSaveInteractiveAnswers = async (resId, answers) => {
    try {
      const res = await api.post(`/wellbeing/resources/${resId}/interactive-submit`, { answers });
      const updatedAnswers = res.data?.interactive_answers;
      setResources(prev => prev.map(r => {
        if (r.id === resId) {
          return {
            ...r,
            progress: {
              ...(r.progress || {}),
              status: r.progress?.status === 'completado' ? 'completado' : 'en_progreso',
              interactive_answers: updatedAnswers
            }
          };
        }
        return r;
      }));
      if (selectedResource && selectedResource.id === resId) {
        setSelectedResource(prev => ({
          ...prev,
          progress: {
            ...(prev.progress || {}),
            status: prev.progress?.status === 'completado' ? 'completado' : 'en_progreso',
            interactive_answers: updatedAnswers
          }
        }));
      }
    } catch (err) {
      console.error('Error guardando respuestas interactivas:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (initialResourceId && resources.length > 0) {
      const found = resources.find(r => r.id === initialResourceId);
      if (found) {
        setActiveSection('recursos');
        setSelectedResource(found);
      }
    }
  }, [initialResourceId, resources]);

  useEffect(() => {
    fetchHistory(historyPeriod);
  }, [historyPeriod]);

  useEffect(() => {
    if (activeSection === 'recursos') {
      const timer = setTimeout(() => {
        fetchResources();
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [activeSection, selectedCategory, searchQuery, resourceTab, resourceTypeFilter, resourceLevelFilter, resourceDurationFilter, resourceSortBy]);

  // Manejo de Grabación de Voz con Verificación de Consentimiento
  const handleStartVoice = () => {
    if (!userConsents['voice_analysis']) {
      setConsentModalType('voice_analysis');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setReflectionError('Tu navegador no soporta reconocimiento de voz nativo. Puedes escribir tu reflexión en el campo de texto.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let currentText = '';
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript + ' ';
        }
        setReflectionText(prev => (prev ? prev + ' ' : '') + currentText.trim());
      };

      recognition.onerror = (e) => {
        console.error('Speech recognition error:', e);
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);

    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  const handleStopVoice = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Enviar Reflexión
  const handleSubmitReflection = async (e) => {
    e.preventDefault();
    if (!reflectionText.trim() || reflectionText.length < 10) {
      setReflectionError('Por favor redacta una reflexión de al menos 10 caracteres.');
      return;
    }

    setReflectionLoading(true);
    setReflectionError('');
    setReflectionSuccess('');

    try {
      const res = await api.post('/analysis/submit', { text: reflectionText });
      setLatestAnalysis(res.data.analysis);
      setReflectionSuccess('¡Reflexión registrada exitosamente! (+20 XP ganados)');
      setReflectionText('');
      setSelectedMoodId(null);
      fetchAllData();
      fetchHistory(historyPeriod);
    } catch (err) {
      setReflectionError(err.response?.data?.message || 'Error al procesar la reflexión.');
    } finally {
      setReflectionLoading(false);
    }
  };

  const filteredResources = resources.filter(r => {
    const matchCat = selectedCategory === 'Todas' || r.category === selectedCategory;
    const matchSearch = !searchQuery || 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="animate-fade" style={{ display: 'grid', gap: '22px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
      
      {/* Modal de Consentimiento Reutilizable */}
      <ConsentModal
        isOpen={!!consentModalType}
        consentType={consentModalType}
        onClose={() => setConsentModalType(null)}
        onAccepted={(type) => {
          setUserConsents(prev => ({ ...prev, [type]: true }));
          if (type === 'voice_analysis') {
            setTimeout(handleStartVoice, 300);
          }
        }}
      />

      {/* Barra Superior del Módulo Mi Bienestar */}
      <div className="glass-card" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px',
        padding: '18px 24px',
        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--primary-light) 100%)',
        border: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            backgroundColor: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)'
          }}>
            <Brain size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '-0.5px' }}>Mi Bienestar</h2>
              <span style={{ fontSize: '10.5px', fontWeight: '800', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '12px', color: 'var(--primary)' }}>
                Espacio Personal
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Monitoreo preventivo, historial de evolución emocional, tendencias y centro de recursos.
            </p>
          </div>
        </div>

        {/* Acceso Rápido a Solicitar Apoyo */}
        <button
          onClick={() => {
            if (onNavigateToTab) onNavigateToTab('clinical_appointments');
            else navigate('/agenda-citas');
          }}
          className="btn btn-primary"
          style={{
            padding: '10px 18px',
            borderRadius: '12px',
            fontSize: '12.5px',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <HeartHandshake size={16} />
          <span>Solicitar Apoyo (Cita 1 a 1)</span>
        </button>
      </div>

      {/* Sub-Navegación Unificada de Mi Bienestar */}
      <div className="tab-container wellbeing-subtabs" style={{ width: '100%', flexWrap: 'wrap', gap: '8px' }}>
        {[
          { id: 'estado_actual', label: 'Estado Actual', icon: Activity },
          { id: 'historial', label: 'Historial de Bienestar', icon: Clock },
          { id: 'evaluaciones', label: 'Mis Evaluaciones', icon: Calendar, badge: summary?.pending_evaluations_count },
          { id: 'tendencias', label: 'Tendencias', icon: TrendingUp },
          { id: 'recomendaciones', label: 'Recomendaciones', icon: Sparkles },
          { id: 'recursos', label: 'Centro de Recursos', icon: BookOpen }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              className={`tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveSection(tab.id)}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              {tab.badge > 0 && (
                <span style={{
                  backgroundColor: 'var(--primary)',
                  color: '#fff',
                  fontSize: '9.5px',
                  fontWeight: '900',
                  padding: '1px 6px',
                  borderRadius: '10px'
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* SECCIÓN A: ESTADO ACTUAL                                */}
      {/* ======================================================== */}
      {activeSection === 'estado_actual' && (
        <div className="animate-fade" style={{ display: 'grid', gap: '20px' }}>
          
          {/* Banner Preventivo de Orientación */}
          {/* Banner Preventivo de Orientación Compacto */}
          <div className="glass-card" style={{
            padding: '14px 20px',
            borderLeft: `4px solid ${summary?.status_tone === 'danger' ? 'var(--danger)' : summary?.status_tone === 'warning' ? 'var(--warning)' : 'var(--success)'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Diagnóstico Preventivo Orientativo
              </span>
              <h3 style={{ fontSize: '15px', fontWeight: '900', color: 'var(--text-primary)', marginTop: '2px', marginBottom: '3px' }}>
                {summary?.status_label || 'Bienestar en observación'}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4', maxWidth: '750px', margin: 0 }}>
                {summary?.guidance}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setActiveSection('recursos')}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '11.5px', fontWeight: '700' }}
              >
                Ver Recursos
              </button>
              <button
                onClick={() => {
                  if (onNavigateToTab) onNavigateToTab('clinical_appointments');
                  else navigate('/agenda-citas');
                }}
                className="btn btn-primary"
                style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '11.5px', fontWeight: '700' }}
              >
                Solicitar Cita
              </button>
            </div>
          </div>

          {/* Grid Compacto de 4 Indicadores Clave Preventivos */}
          <div className="grid grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            
            {/* 1. Estrés Estimado */}
            <div className="glass-card" style={{ padding: '14px 18px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '8px', backgroundColor: summary?.averages?.stress > 60 ? 'var(--danger-light)' : 'var(--success-light)', color: summary?.averages?.stress > 60 ? 'var(--danger)' : 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldAlert size={13} />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', letterSpacing: '0.4px' }}>ESTRÉS</span>
                </div>
                <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
                  Promedio
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '2px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: '900', color: summary?.averages?.stress > 60 ? 'var(--danger)' : 'var(--text-primary)', margin: 0 }}>
                  {summary?.averages?.stress || 0}%
                </h3>
                <span style={{ fontSize: '11px', fontWeight: '700', color: summary?.averages?.stress > 60 ? 'var(--danger)' : 'var(--success)' }}>
                  {summary?.averages?.stress > 60 ? 'Elevado' : 'Controlado'}
                </span>
              </div>
              <div style={{ height: '4px', width: '100%', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
                <div style={{ height: '100%', width: `${Math.min(100, summary?.averages?.stress || 0)}%`, backgroundColor: summary?.averages?.stress > 60 ? 'var(--danger)' : 'var(--success)', borderRadius: '4px', transition: 'width 0.4s ease' }} />
              </div>
            </div>

            {/* 2. Motivación */}
            <div className="glass-card" style={{ padding: '14px 18px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '8px', backgroundColor: summary?.averages?.motivation >= 50 ? 'var(--success-light)' : 'var(--warning-light)', color: summary?.averages?.motivation >= 50 ? 'var(--success)' : 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Award size={13} />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', letterSpacing: '0.4px' }}>MOTIVACIÓN</span>
                </div>
                <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
                  Energía
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '2px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: '900', color: summary?.averages?.motivation >= 50 ? 'var(--success)' : 'var(--warning)', margin: 0 }}>
                  {summary?.averages?.motivation || 0}%
                </h3>
                <span style={{ fontSize: '11px', fontWeight: '700', color: summary?.averages?.motivation >= 50 ? 'var(--success)' : 'var(--warning)' }}>
                  {summary?.averages?.motivation >= 50 ? 'Óptima' : 'Baja'}
                </span>
              </div>
              <div style={{ height: '4px', width: '100%', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
                <div style={{ height: '100%', width: `${Math.min(100, summary?.averages?.motivation || 0)}%`, backgroundColor: summary?.averages?.motivation >= 50 ? 'var(--success)' : 'var(--warning)', borderRadius: '4px', transition: 'width 0.4s ease' }} />
              </div>
            </div>

            {/* 3. Agotamiento */}
            <div className="glass-card" style={{ padding: '14px 18px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '8px', backgroundColor: summary?.averages?.burnout > 60 ? 'var(--danger-light)' : 'var(--success-light)', color: summary?.averages?.burnout > 60 ? 'var(--danger)' : 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Activity size={13} />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', letterSpacing: '0.4px' }}>AGOTAMIENTO</span>
                </div>
                <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
                  Fatiga
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '2px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: '900', color: summary?.averages?.burnout > 60 ? 'var(--warning)' : 'var(--text-primary)', margin: 0 }}>
                  {summary?.averages?.burnout || 0}%
                </h3>
                <span style={{ fontSize: '11px', fontWeight: '700', color: summary?.averages?.burnout > 60 ? 'var(--warning)' : 'var(--success)' }}>
                  {summary?.averages?.burnout > 60 ? 'Atención' : 'Bajo'}
                </span>
              </div>
              <div style={{ height: '4px', width: '100%', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
                <div style={{ height: '100%', width: `${Math.min(100, summary?.averages?.burnout || 0)}%`, backgroundColor: summary?.averages?.burnout > 60 ? 'var(--warning)' : 'var(--success)', borderRadius: '4px', transition: 'width 0.4s ease' }} />
              </div>
            </div>

            {/* 4. Bienestar General */}
            <div className="glass-card" style={{ padding: '14px 18px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Heart size={13} />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', letterSpacing: '0.4px' }}>BIENESTAR</span>
                </div>
                <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '6px', backgroundColor: 'var(--bg-primary)', color: 'var(--primary)' }}>
                  Balance
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '2px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--primary)', margin: 0 }}>
                  {summary?.averages?.general_wellbeing || 0}%
                </h3>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary)' }}>
                  General
                </span>
              </div>
              <div style={{ height: '4px', width: '100%', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
                <div style={{ height: '100%', width: `${Math.min(100, summary?.averages?.general_wellbeing || 0)}%`, backgroundColor: 'var(--primary)', borderRadius: '4px', transition: 'width 0.4s ease' }} />
              </div>
            </div>

          </div>

          {/* Formulario de Reflexión Diaria */}
          <div className="grid grid-2">
            <div className="glass-card">
              <h3 style={{ fontSize: '16px', fontWeight: '900', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Brain size={18} style={{ color: 'var(--primary)' }} /> Registro de Reflexión Diaria
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: '1.5' }}>
                Registra cómo te has sentido en tu jornada. La información se procesa bajo estricta confidencialidad.
              </p>

              {/* Selector de Estado de Ánimo en Primera Persona y Selección Única */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                  ESTADO DE ÁNIMO DOMINANTE:
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'tenso', emoji: '😫', label: 'Tenso', sentence: 'Hoy me siento tenso 😫.', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.35)', color: '#ef4444' },
                    { id: 'cansado', emoji: '😧', label: 'Cansado', sentence: 'Hoy me siento cansado 😧.', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.35)', color: '#f59e0b' },
                    { id: 'neutro', emoji: '😐', label: 'Neutro', sentence: 'Hoy me siento neutro 😐.', bg: 'rgba(156, 163, 175, 0.12)', border: 'rgba(156, 163, 175, 0.35)', color: '#6b7280' },
                    { id: 'tranquilo', emoji: '😊', label: 'Tranquilo', sentence: 'Hoy me siento tranquilo 😊.', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.35)', color: '#10b981' },
                    { id: 'energetico', emoji: '😁', label: 'Energético', sentence: 'Hoy me siento energético 😁.', bg: 'rgba(99, 102, 241, 0.12)', border: 'rgba(99, 102, 241, 0.35)', color: '#6366f1' }
                  ].map((mood) => {
                    const isSelected = selectedMoodId === mood.id;
                    return (
                      <button
                        key={mood.id}
                        type="button"
                        onClick={() => {
                          setSelectedMoodId(mood.id);
                          setReflectionText(prev => {
                            const trimmed = (prev || '').trim();
                            const newSentence = `${mood.sentence} `;
                            if (!trimmed) {
                              return newSentence;
                            }
                            // Expresión regular que detecta frases previas de estado de ánimo tanto nuevas como heredadas
                            const existingMoodRegex = /^(Hoy me siento|Me siento)\s+[^\.\!\?]+[\.\!\?]\s*/i;
                            if (existingMoodRegex.test(trimmed)) {
                              return trimmed.replace(existingMoodRegex, newSentence);
                            }
                            return `${newSentence}${trimmed}`;
                          });
                        }}
                        className="duo-pill"
                        style={{
                          padding: '7px 14px',
                          fontSize: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: isSelected ? mood.bg : 'var(--bg-secondary)',
                          borderColor: isSelected ? mood.color : mood.border,
                          borderWidth: isSelected ? '2px' : '1px',
                          borderStyle: 'solid',
                          color: isSelected ? mood.color : 'var(--text-primary)',
                          fontWeight: isSelected ? '900' : '700',
                          boxShadow: isSelected ? `0 0 0 3px ${mood.bg}` : 'none',
                          transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                          transition: 'all 0.15s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.transform = 'scale(1.05)'; }}
                        onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.transform = 'scale(1)'; }}
                      >
                        <span style={{ fontSize: '17px', lineHeight: 1 }}>{mood.emoji}</span>
                        <span>{mood.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {reflectionSuccess && (
                <div style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)', padding: '10px', borderRadius: '8px', fontSize: '12px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={15} />
                  <span>{reflectionSuccess}</span>
                </div>
              )}

              {reflectionError && (
                <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '10px', borderRadius: '8px', fontSize: '12px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={15} />
                  <span>{reflectionError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitReflection}>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <textarea
                    rows="4"
                    placeholder="Describe en pocas líneas tu experiencia, desafíos o satisfacción de la jornada..."
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
                    required
                    style={{ resize: 'vertical', fontSize: '13px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {isRecording ? (
                    <button
                      type="button"
                      onClick={handleStopVoice}
                      className="btn"
                      style={{ backgroundColor: 'var(--danger)', color: '#fff', fontSize: '12px', padding: '10px 14px', borderRadius: '10px', flex: 1 }}
                    >
                      <Square size={14} />
                      <span>Detener ({recordingSeconds}s)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStartVoice}
                      className="duo-pill"
                      style={{ flex: 1, justifyContent: 'center', padding: '10px 14px', fontSize: '12px' }}
                      title="Requiere consentimiento de análisis de voz"
                    >
                      <Mic size={15} style={{ color: 'var(--primary)' }} />
                      <span>Dictar por Voz</span>
                    </button>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={reflectionLoading}
                    style={{ flex: 1.2, padding: '10px 16px', borderRadius: '10px', fontSize: '12.5px', fontWeight: '800' }}
                  >
                    {reflectionLoading ? <Loader className="animate-spin" size={15} /> : <><Send size={14} /><span>Analizar (+20 XP)</span></>}
                  </button>
                </div>
              </form>
            </div>

            {/* Último Registro y Recomendación Rápida */}
            <div style={{ display: 'grid', gap: '14px' }}>
              <div className="glass-card" style={{ padding: '18px' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: '800', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={15} style={{ color: 'var(--primary)' }} /> Último Registro Emocional
                </h4>
                {summary?.last_reflection ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span>Fecha: {new Date(summary.last_reflection.created_at).toLocaleDateString()}</span>
                      <span style={{ fontWeight: '800', color: summary.last_reflection.dominant_sentiment === 'Positivo' ? 'var(--success)' : 'var(--danger)' }}>
                        {summary.last_reflection.dominant_sentiment}
                      </span>
                    </div>
                    <TestResponseViewer 
                      rawText={summary.last_reflection.original_text} 
                      userName="Mi Registro" 
                      date={summary.last_reflection.created_at} 
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
                      <div style={{ padding: '6px', backgroundColor: 'var(--bg-primary)', borderRadius: '6px' }}>
                        <span style={{ fontSize: '9.5px', color: 'var(--text-secondary)' }}>Estrés</span>
                        <strong style={{ display: 'block', fontSize: '13px', color: 'var(--danger)' }}>{summary.last_reflection.stress_score}%</strong>
                      </div>
                      <div style={{ padding: '6px', backgroundColor: 'var(--bg-primary)', borderRadius: '6px' }}>
                        <span style={{ fontSize: '9.5px', color: 'var(--text-secondary)' }}>Motivación</span>
                        <strong style={{ display: 'block', fontSize: '13px', color: 'var(--success)' }}>{summary.last_reflection.motivation_score}%</strong>
                      </div>
                      <div style={{ padding: '6px', backgroundColor: 'var(--bg-primary)', borderRadius: '6px' }}>
                        <span style={{ fontSize: '9.5px', color: 'var(--text-secondary)' }}>Agotamiento</span>
                        <strong style={{ display: 'block', fontSize: '13px', color: 'var(--warning)' }}>{summary.last_reflection.burnout_score}%</strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Aún no has registrado tu primera reflexión.</p>
                )}
              </div>

              {/* Recursos Recomendados para ti */}
              <div className="glass-card" style={{ padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ fontSize: '13.5px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={15} style={{ color: 'var(--accent)' }} /> Recomendación para tu bienestar
                  </h4>
                  <span style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '2px 8px', borderRadius: '6px' }}>
                    🎯 Sugerencia Personalizada
                  </span>
                </div>

                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.4' }}>
                  Recursos seleccionados certeramente según tus indicadores y reflexiones recientes:
                </p>

                {recommendedResources.length > 0 ? (
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {recommendedResources.slice(0, 2).map((recRes) => (
                      <div
                        key={recRes.id}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '12px',
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--primary)', textTransform: 'capitalize', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            {recRes.resource_type === 'respiracion' && '🧘 Respiración'}
                            {recRes.resource_type === 'ejercicio' && '⚡ Ejercicio'}
                            {recRes.resource_type === 'checklist' && '📝 Checklist'}
                            {recRes.resource_type === 'grounding' && '🌿 Grounding'}
                            {recRes.resource_type === 'audio' && '🎧 Audio'}
                            {recRes.resource_type === 'video' && '🎬 Video'}
                            {recRes.resource_type === 'reflexion' && '🧠 Reflexión'}
                            {recRes.resource_type === 'diario' && '📔 Diario'}
                            {recRes.resource_type === 'gratitud' && '💛 Gratitud'}
                            {recRes.resource_type === 'quiz' && '💡 Quiz'}
                            {recRes.resource_type === 'reto' && '🎯 Reto'}
                            {recRes.resource_type === 'consejo' && '💡 Consejo'}
                            {recRes.resource_type === 'actividad' && '🚶 Actividad'}
                            {recRes.resource_type === 'infografia' && '📊 Infografía'}
                            {recRes.resource_type === 'articulo' && '📖 Lectura'}
                          </span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>
                            ~{recRes.reading_time_minutes || 3} min • +{recRes.xp_reward || 20} XP
                          </span>
                        </div>

                        <strong style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: '1.3' }}>
                          {recRes.title}
                        </strong>

                        <button
                          onClick={() => {
                            setSelectedResource(recRes);
                            setActiveSection('recursos');
                          }}
                          className="btn btn-primary"
                          style={{
                            marginTop: '4px',
                            padding: '6px 12px',
                            fontSize: '11px',
                            fontWeight: '800',
                            borderRadius: '8px',
                            justifyContent: 'center'
                          }}
                        >
                          <Play size={12} />
                          <span>Iniciar Actividad</span>
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={() => {
                        setResourceTab('recommended');
                        setActiveSection('recursos');
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--primary)',
                        fontSize: '11.5px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        padding: '4px 0',
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>Ver más en el Centro de Recursos</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                ) : (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Explora la biblioteca en el Centro de Recursos.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* SECCIÓN B: HISTORIAL DE BIENESTAR                       */}
      {/* ======================================================== */}
      {activeSection === 'historial' && (
        <div className="animate-fade" style={{ display: 'grid', gap: '20px' }}>
          
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={18} style={{ color: 'var(--primary)' }} /> Curva de Evolución Preventiva
                </h3>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Representación gráfica de indicadores preventivos a lo largo del tiempo.
                </p>
              </div>

              {/* Filtro por Período */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { id: '7d', label: '7 Días' },
                  { id: '30d', label: '30 Días' },
                  { id: '3m', label: '3 Meses' },
                  { id: '6m', label: '6 Meses' },
                  { id: 'all', label: 'Todo' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setHistoryPeriod(p.id)}
                    className="duo-pill"
                    style={{
                      padding: '5px 12px',
                      fontSize: '11.5px',
                      fontWeight: historyPeriod === p.id ? '900' : '600',
                      backgroundColor: historyPeriod === p.id ? 'var(--primary)' : 'var(--bg-primary)',
                      color: historyPeriod === p.id ? '#fff' : 'var(--text-secondary)',
                      borderColor: historyPeriod === p.id ? 'var(--primary)' : 'var(--border)'
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {historyData.chart_data.length === 0 ? (
              <div style={{ height: '240px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                No hay registros disponibles en el período seleccionado.
              </div>
            ) : (
              <div className="chart-container-responsive">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <LineChart data={historyData.chart_data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="fecha" stroke="var(--text-muted)" fontSize={11} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', borderRadius: '10px', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="Estrés" stroke="var(--danger)" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Motivación" stroke="var(--success)" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Agotamiento" stroke="var(--warning)" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="Bienestar General" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Lista de Registros Históricos */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '14px' }}>
              Bitácora Detallada ({historyData.records.length} registros)
            </h4>
            <div style={{ display: 'grid', gap: '10px', maxHeight: '360px', overflowY: 'auto' }}>
              {historyData.records.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '12.5px', textAlign: 'center', padding: '20px' }}>
                  No se encontraron reflexiones o tests en este rango.
                </p>
              ) : (
                historyData.records.map(rec => (
                  <div key={rec.id} className="futuristic-card-item" style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>
                        {new Date(rec.created_at).toLocaleString()}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        backgroundColor: rec.dominant_sentiment === 'Positivo' ? 'var(--success-light)' : rec.dominant_sentiment === 'Negativo' ? 'var(--danger-light)' : 'var(--primary-light)',
                        color: rec.dominant_sentiment === 'Positivo' ? 'var(--success)' : rec.dominant_sentiment === 'Negativo' ? 'var(--danger)' : 'var(--primary)'
                      }}>
                        {rec.dominant_sentiment}
                      </span>
                    </div>
                    <TestResponseViewer 
                      rawText={rec.original_text} 
                      userName="Mi Registro" 
                      date={rec.created_at} 
                      compact={true} 
                    />
                    <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      <span>Estrés: <strong>{rec.stress_score}%</strong></span>
                      <span>Motivación: <strong>{rec.motivation_score}%</strong></span>
                      <span>Agotamiento: <strong>{rec.burnout_score}%</strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* SECCIÓN C: MIS EVALUACIONES                             */}
      {/* ======================================================== */}
      {activeSection === 'evaluaciones' && (
        <div className="animate-fade" style={{ display: 'grid', gap: '16px' }}>
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '900', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} style={{ color: 'var(--primary)' }} /> Cuestionarios y Evaluaciones Institucionales
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Consulta los cuestionarios asignados a tu perfil y revisa tus resultados individuales.
            </p>

            <div style={{ display: 'grid', gap: '12px' }}>
              {myEvaluations.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '12.5px' }}>
                  No tienes evaluaciones asignadas en este momento.
                </p>
              ) : (
                myEvaluations.map(ev => {
                  const isCompleted = ev.user_status === 'completado';
                  return (
                    <div key={ev.id} className="futuristic-card-item" style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '2px 8px', borderRadius: '6px' }}>
                              {ev.category}
                            </span>
                            <span style={{
                              fontSize: '10.5px',
                              fontWeight: '800',
                              color: isCompleted ? 'var(--success)' : 'var(--warning)',
                              backgroundColor: isCompleted ? 'var(--success-light)' : 'var(--warning-light)',
                              padding: '2px 8px',
                              borderRadius: '6px'
                            }}>
                              {isCompleted ? 'Completado' : 'Pendiente'}
                            </span>
                          </div>
                          <h4 style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                            {ev.title}
                          </h4>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', marginBottom: '8px' }}>
                            {ev.description}
                          </p>
                        </div>

                        <div>
                          {isCompleted ? (
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                                Completado: {new Date(ev.completed_at).toLocaleDateString()}
                              </span>
                              {ev.my_result && (
                                <div style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
                                  <span style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)' }}>
                                    Estrés: <strong>{ev.my_result.stress_score}%</strong>
                                  </span>
                                  <span style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)' }}>
                                    Motivación: <strong>{ev.my_result.motivation_score}%</strong>
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                if (onNavigateToTab) onNavigateToTab('evaluaciones');
                                else navigate('/tests');
                              }}
                              className="btn btn-primary"
                              style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                              <span>Completar Test</span>
                              <ArrowRight size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECCIÓN D: TENDENCIAS                                   */}
      {/* ======================================================== */}
      {activeSection === 'tendencias' && (
        <div className="animate-fade" style={{ display: 'grid', gap: '18px' }}>
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '900', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} style={{ color: 'var(--primary)' }} /> Análisis de Tendencias de Bienestar
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Comparativa evolutiva de tus indicadores respecto a semanas previas para identificar patrones preventivos.
            </p>

            {!trends.has_sufficient_data ? (
              <div style={{ padding: '36px 20px', textAlign: 'center', backgroundColor: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <HelpCircle size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 10px' }} />
                <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                  {trends.message}
                </p>
              </div>
            ) : (
              <div className="grid grid-2">
                {trends.indicators.map((ind, idx) => (
                  <div key={idx} className="glass-card" style={{ padding: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <h4 style={{ fontSize: '14.5px', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>
                        {ind.name}
                      </h4>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        backgroundColor: ind.tone === 'success' ? 'var(--success-light)' : ind.tone === 'danger' ? 'var(--danger-light)' : ind.tone === 'warning' ? 'var(--warning-light)' : 'var(--primary-light)',
                        color: ind.tone === 'success' ? 'var(--success)' : ind.tone === 'danger' ? 'var(--danger)' : ind.tone === 'warning' ? 'var(--warning)' : 'var(--primary)'
                      }}>
                        {ind.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '26px', fontWeight: '900', color: 'var(--text-primary)' }}>
                        {ind.current_value}%
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Previo: {ind.previous_value}%
                      </span>
                    </div>

                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
                      {ind.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECCIÓN E: RECOMENDACIONES                              */}
      {/* ======================================================== */}
      {activeSection === 'recomendaciones' && (
        <div className="animate-fade" style={{ display: 'grid', gap: '16px' }}>
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '900', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} style={{ color: 'var(--accent)' }} /> Recomendaciones Preventivas Personalizadas
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Sugerencias orientativas basadas en tus registros para promover el autocuidado y equilibrio.
            </p>

            <div style={{ display: 'grid', gap: '14px' }}>
              {recommendations.map(rec => (
                <div key={rec.id} className="futuristic-card-item" style={{ padding: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {rec.title}
                      </h4>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                        {rec.text}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          setSelectedCategory(rec.action_category || 'Todas');
                          setActiveSection('recursos');
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '800' }}
                      >
                        {rec.action_label}
                      </button>
                      <button
                        onClick={() => {
                          if (onNavigateToTab) onNavigateToTab('clinical_appointments');
                          else navigate('/agenda-citas');
                        }}
                        className="btn btn-primary"
                        style={{ padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '800' }}
                      >
                        Solicitar Apoyo
                      </button>
                    </div>
                  </div>

                  {/* Recursos Certeros Vinculados a esta Recomendación */}
                  {rec.resources && rec.resources.length > 0 && (
                    <div style={{ width: '100%', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                        Recursos recomendados para esta área:
                      </span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                        {rec.resources.map(r => (
                          <div
                            key={r.id}
                            onClick={() => {
                              setSelectedResource(r);
                              setActiveSection('recursos');
                            }}
                            style={{
                              padding: '10px 12px',
                              borderRadius: '12px',
                              backgroundColor: 'var(--bg-secondary)',
                              border: '1px solid var(--border)',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = 'var(--primary)';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = 'var(--border)';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--primary)', textTransform: 'capitalize' }}>
                                {r.resource_type === 'respiracion' ? '🧘 Respiración' :
                                 r.resource_type === 'ejercicio' ? '⚡ Ejercicio' :
                                 r.resource_type === 'grounding' ? '🌿 Grounding' :
                                 r.resource_type === 'checklist' ? '📝 Checklist' :
                                 r.resource_type === 'audio' ? '🎧 Audio' :
                                 r.resource_type === 'video' ? '🎬 Video' :
                                 r.resource_type === 'quiz' ? '💡 Quiz' :
                                 r.resource_type === 'reto' ? '🎯 Reto' :
                                 r.resource_type === 'reflexion' ? '🧠 Reflexión' :
                                 r.resource_type === 'diario' ? '📔 Diario' :
                                 r.resource_type === 'gratitud' ? '💛 Gratitud' : '📖 ' + r.resource_type}
                              </span>
                              <span style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>+{r.xp_reward || 20} XP</span>
                            </div>
                            <strong style={{ fontSize: '11.5px', color: 'var(--text-primary)', lineHeight: '1.3' }}>
                              {r.title}
                            </strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECCIÓN F: CENTRO DE RECURSOS INTERACTIVO Y ACCESIBLE    */}
      {/* ======================================================== */}
      {activeSection === 'recursos' && (
        <div className="animate-fade" style={{ display: 'grid', gap: '18px' }}>
          
          {/* Toast de Celebración de Gamificación / XP */}
          {celebrationToast && (
            <div className="animate-fade" style={{
              backgroundColor: 'var(--success-light)',
              border: '1px solid var(--success)',
              borderRadius: '12px',
              padding: '14px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Award size={24} style={{ color: 'var(--success)' }} />
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: '900', color: 'var(--text-primary)' }}>
                    {celebrationToast.message}
                  </div>
                  {celebrationToast.streak && (
                    <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Flame size={14} style={{ color: '#f97316' }} />
                      <span>Tu racha de participación activa ahora es de <strong>{celebrationToast.streak} días</strong>.</span>
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCelebrationToast(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ×
              </button>
            </div>
          )}

          {/* VISTA DIRECTA EN PÁGINA: Editor/Creación Administrativa de Recursos */}
          {showAdminModal ? (
            <ResourceAdminModal
              resource={editingResource}
              onClose={() => {
                setShowAdminModal(false);
                setEditingResource(null);
              }}
              onSaved={() => {
                fetchResources();
              }}
            />
          ) : selectedResource ? (
            /* VISTA DIRECTA EN PÁGINA: Lectura e Interacción Directa con el Recurso (Sin Popups ni Fondos Oscuros) */
            <div id="resource-viewer-top" className="glass-card resource-viewer-card animate-fade" style={{
              width: '100%',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '20px',
              padding: '28px',
              border: '1.5px solid var(--border)',
              boxShadow: 'var(--shadow-md)',
              display: 'grid',
              gap: '16px'
            }}>
              
              {/* Barra Superior con Navegación Directa de Retorno */}
              <div className="resource-header-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedResource(null);
                    setActiveParagraphIndex(-1);
                  }}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '12.5px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <ArrowLeft size={16} />
                  <span>Volver a todos los recursos</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={(e) => handleToggleFavorite(e, selectedResource.id)}
                    className="btn btn-secondary"
                    style={{ padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}
                    title={selectedResource.is_favorite ? "Quitar de favoritos" : "Guardar en favoritos"}
                  >
                    {selectedResource.is_favorite ? <BookmarkCheck size={16} style={{ color: 'var(--primary)' }} /> : <Bookmark size={16} />}
                    <span>{selectedResource.is_favorite ? 'Guardado en Favoritos' : 'Guardar en Favoritos'}</span>
                  </button>

                  {isAdminOrSupport && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingResource(selectedResource);
                        setShowAdminModal(true);
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '8px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}
                      title="Editar este recurso"
                    >
                      <Edit size={14} />
                      <span>Editar</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Encabezado Principal del Recurso */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '3px 9px', borderRadius: '6px', textTransform: 'uppercase' }}>
                    {selectedResource.category}
                  </span>
                  <span style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-primary)', padding: '3px 9px', borderRadius: '6px', textTransform: 'uppercase' }}>
                    {selectedResource.resource_type}
                  </span>
                  <span style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--accent)', backgroundColor: 'rgba(234, 179, 8, 0.12)', padding: '3px 9px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={12} />
                    <span>+{selectedResource.xp_reward || 15} XP al completar</span>
                  </span>
                  {selectedResource.level && (
                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-primary)', padding: '3px 9px', borderRadius: '6px' }}>
                      Nivel: {selectedResource.level}
                    </span>
                  )}
                </div>

                <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-primary)', margin: '4px 0 8px', letterSpacing: '-0.3px' }}>
                  {selectedResource.title}
                </h2>

                <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <User size={13} /> {selectedResource.author}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} /> {selectedResource.reading_time_minutes} min estimados
                  </span>
                  {selectedResource.source_institution && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Building size={13} /> {selectedResource.source_institution}
                    </span>
                  )}
                </div>
              </div>

              {/* Barra de Accesibilidad (Ajuste de Tamaño de Letra - Solo para lecturas y artículos) */}
              {!['ejercicio', 'respiracion', 'grounding', 'pausa_activa'].includes(selectedResource.resource_type) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 14px', backgroundColor: 'var(--bg-primary)', borderRadius: '10px', fontSize: '11.5px', border: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Type size={14} /> Tamaño de lectura:
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[
                      { id: 'small', label: 'A-', size: '12.5px' },
                      { id: 'normal', label: 'A', size: '14.5px' },
                      { id: 'large', label: 'A+', size: '16.5px' }
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFontSizeMode(f.id)}
                        style={{
                          padding: '3px 9px',
                          borderRadius: '6px',
                          border: '1px solid',
                          borderColor: fontSizeMode === f.id ? 'var(--primary)' : 'var(--border)',
                          backgroundColor: fontSizeMode === f.id ? 'var(--primary)' : 'transparent',
                          color: fontSizeMode === f.id ? '#fff' : 'var(--text-secondary)',
                          fontSize: '11px',
                          fontWeight: '800',
                          cursor: 'pointer'
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Lector en Voz Alta con Voces Juveniles (Exclusivo para Artículos, Consejos y Lecturas, no para Ejercicios Guiados) */}
              {!['ejercicio', 'respiracion', 'grounding', 'pausa_activa'].includes(selectedResource.resource_type) && (
                <ResourceAudioPlayer
                  content={selectedResource.content}
                  title={selectedResource.title}
                  onParagraphChange={(idx) => setActiveParagraphIndex(idx)}
                />
              )}

              {/* Módulo Interactivo Dinámico para los 15 Tipos de Recursos */}
              <ResourceInteractivePlayer
                resource={selectedResource}
                userProgress={selectedResource.progress}
                onSaveAnswers={(answers) => handleSaveInteractiveAnswers(selectedResource.id, answers)}
                onComplete={() => handleCompleteResource(selectedResource.id)}
              />

              {/* Directorio de Ayuda y Contactos Institucionales */}
              {selectedResource.category === 'Necesito ayuda' && (
                <div style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  borderRadius: '14px',
                  padding: '16px',
                  display: 'grid',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', fontWeight: '900', fontSize: '13.5px' }}>
                    <Phone size={16} /> Contactos y Asistencia Inmediata
                  </div>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: '10px' }}>
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: '800', color: 'var(--text-primary)' }}>Línea Nacional de Salud Mental (MSPAS Guatemala)</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Atención profesional y confidencial 24/7</div>
                      </div>
                      <a href="tel:1515" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '12px', textDecoration: 'none', fontWeight: '800' }}>
                        Llamar 1515 / 1540
                      </a>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: '10px' }}>
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: '800', color: 'var(--text-primary)' }}>Orientación Psicológica Institucional</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Sesión privada 1 a 1 en sede o virtual</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedResource(null);
                          if (onNavigateToTab) onNavigateToTab('clinical_appointments');
                          else navigate('/agenda-citas');
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '6px 14px', fontSize: '12px', fontWeight: '800' }}
                      >
                        Agendar Cita
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Contenido Completo del Recurso con Formateo Markdown Limpio (Exclusivo para Lecturas/Guías) */}
              {!['ejercicio', 'respiracion', 'grounding', 'pausa_activa'].includes(selectedResource.resource_type) && (
                <div className="resource-content-box" style={{
                  fontSize: fontSizeMode === 'large' ? '16.5px' : (fontSizeMode === 'small' ? '13px' : '14.5px'),
                  color: 'var(--text-primary)',
                  lineHeight: '1.8',
                  backgroundColor: 'var(--bg-primary)',
                  padding: '22px',
                  borderRadius: '14px',
                  border: '1px solid var(--border)'
                }}>
                  {selectedResource.content.split(/\n+/).map((par, pIdx) => {
                    const isCurrent = activeParagraphIndex === pIdx;
                    return (
                      <p
                        key={pIdx}
                        style={{
                          margin: '0 0 14px 0',
                          backgroundColor: isCurrent ? 'var(--primary-light)' : 'transparent',
                          color: isCurrent ? 'var(--primary)' : 'inherit',
                          fontWeight: isCurrent ? '700' : 'normal',
                          padding: isCurrent ? '6px 10px' : '0',
                          borderRadius: isCurrent ? '8px' : '0',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {renderFormattedText(par)}
                      </p>
                    );
                  })}
                </div>
              )}

              {/* Respaldo Institucional y Enlace Oficial */}
              {selectedResource.source_url && (
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ExternalLink size={13} />
                  <span>Fuente Oficial de Referencia:</span>
                  <a
                    href={selectedResource.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}
                  >
                    {selectedResource.source_institution || selectedResource.source_url} ↗
                  </a>
                </div>
              )}

              {/* Pie con Botón de Completitud */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <div>
                  {selectedResource.progress?.status === 'completado' ? (
                    <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={16} /> Ya completaste este recurso
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleCompleteResource(selectedResource.id)}
                      className="btn btn-primary"
                      style={{ padding: '9px 20px', borderRadius: '10px', fontSize: '12.5px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <Sparkles size={16} />
                      <span>Marcar como Completado (+{selectedResource.xp_reward || 15} XP)</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedResource(null);
                    setActiveParagraphIndex(-1);
                  }}
                  className="btn btn-secondary"
                  style={{ padding: '9px 22px', borderRadius: '10px', fontSize: '12.5px', fontWeight: '700' }}
                >
                  Volver al Catálogo
                </button>
              </div>

            </div>
          ) : (
            /* VISTA DEL CATÁLOGO DE RECURSOS */
            <>

          {/* Subnavegación Superior del Centro de Recursos */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: `Todos (${resources.length})`, icon: BookOpen },
                { id: 'favorites', label: 'Guardados', icon: Bookmark },
                { id: 'in_progress', label: 'Continuar leyendo', icon: Clock },
                { id: 'completed', label: 'Completados', icon: CheckCircle2 }
              ].map(tab => {
                const isCurrent = resourceTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setResourceTab(tab.id)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: isCurrent ? '800' : '600',
                      backgroundColor: isCurrent ? 'var(--primary)' : 'var(--bg-secondary)',
                      color: isCurrent ? '#ffffff' : 'var(--text-secondary)',
                      border: '1px solid',
                      borderColor: isCurrent ? 'var(--primary)' : 'var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {isAdminOrSupport && (
              <button
                type="button"
                onClick={() => {
                  setEditingResource(null);
                  setShowAdminModal(true);
                }}
                className="btn btn-primary"
                style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={14} />
                <span>+ Nuevo Recurso</span>
              </button>
            )}
          </div>

          {/* Barra de Búsqueda y Filtros con CustomSelect (Con overflow visible para no recortar menús) */}
          <div className="glass-card has-dropdown" style={{ padding: '18px', display: 'grid', gap: '14px', position: 'relative', zIndex: 50, overflow: 'visible' }}>
            
            {/* Fila 1: Búsqueda, Filtros y Ordenamiento con CustomSelect */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'center' }}>
              <div style={{ position: 'relative', minWidth: '200px' }}>
                <Search size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Buscar por título, autor o tema..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '40px', fontSize: '12.5px', width: '100%', height: '42px', borderRadius: '12px' }}
                />
              </div>

              {/* Filtro por Tipo con CustomSelect */}
              <div>
                <CustomSelect
                  options={RESOURCE_TYPE_OPTIONS}
                  value={resourceTypeFilter}
                  onChange={(val) => setResourceTypeFilter(val)}
                  placeholder="Tipo de Recurso"
                  icon={Filter}
                />
              </div>

              {/* Filtro por Nivel con CustomSelect */}
              <div>
                <CustomSelect
                  options={RESOURCE_LEVEL_OPTIONS}
                  value={resourceLevelFilter}
                  onChange={(val) => setResourceLevelFilter(val)}
                  placeholder="Nivel de Dificultad"
                  icon={Sparkles}
                />
              </div>

              {/* Filtro por Duración con CustomSelect */}
              <div>
                <CustomSelect
                  options={RESOURCE_DURATION_OPTIONS}
                  value={resourceDurationFilter}
                  onChange={(val) => setResourceDurationFilter(val)}
                  placeholder="Duración"
                  icon={Clock}
                />
              </div>

              {/* Ordenamiento de Recursos */}
              <div>
                <CustomSelect
                  options={RESOURCE_SORT_OPTIONS}
                  value={resourceSortBy}
                  onChange={(val) => setResourceSortBy(val)}
                  placeholder="Ordenar por"
                  icon={ArrowUpDown}
                />
              </div>
            </div>

            {/* Fila 2: Categorías de Recursos Oficiales con wrap limpio */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {resourceCategories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`duo-pill ${selectedCategory === cat ? 'selected' : ''}`}
                  style={{
                    padding: '6px 14px',
                    fontSize: '11.5px',
                    fontWeight: selectedCategory === cat ? '800' : '600',
                    backgroundColor: selectedCategory === cat ? 'var(--primary)' : 'var(--bg-primary)',
                    color: selectedCategory === cat ? '#ffffff' : 'var(--text-secondary)',
                    borderColor: selectedCategory === cat ? 'var(--primary)' : 'var(--border)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

          </div>

          {/* Sección de Recomendados Inteligentes para el Usuario */}
          {recommendedResources.length > 0 && resourceTab === 'all' && selectedCategory === 'Todas' && !searchQuery && (
            <div className="glass-card" style={{ padding: '18px', backgroundColor: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Sparkles size={16} style={{ color: 'var(--primary)' }} />
                <h4 style={{ fontSize: '13.5px', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>
                  Recomendados para tu equilibrio diario
                </h4>
              </div>
              <div className="grid grid-3" style={{ gap: '12px' }}>
                {recommendedResources.map(rec => (
                  <div
                    key={'rec_' + rec.id}
                    onClick={() => setSelectedResource(rec)}
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      padding: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '2px 6px', borderRadius: '4px' }}>
                        {rec.category}
                      </span>
                      <h5 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)', margin: '6px 0 4px' }}>
                        {rec.title}
                      </h5>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {rec.reading_time_minutes} min
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontWeight: '800' }}>
                        <span>Explorar</span>
                        <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grid Principal de Recursos */}
          <div className="grid grid-2">
            {resources.length === 0 ? (
              <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
                <Book size={36} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  No se encontraron recursos
                </h4>
                <p style={{ fontSize: '12.5px', margin: 0 }}>
                  Prueba cambiando los términos de búsqueda o seleccionando otra categoría.
                </p>
              </div>
            ) : (
              resources.map(res => {
                const isFav = res.is_favorite;
                const isCompleted = res.progress?.status === 'completado';
                const isInProgress = res.progress?.status === 'en_progreso';
                const progressPct = res.progress?.progress_percent || 0;

                return (
                  <div
                    key={res.id}
                    className="glass-card"
                    style={{
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      border: isCompleted ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border)'
                    }}
                  >
                    <div>
                      {/* Cabecera de la Tarjeta */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '2px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>
                            {res.category}
                          </span>
                          <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', backgroundColor: 'var(--bg-primary)', padding: '2px 6px', borderRadius: '6px', textTransform: 'uppercase' }}>
                            {res.resource_type}
                          </span>
                          {res.interactive_type !== 'none' && (
                            <span style={{ fontSize: '10px', fontWeight: '800', color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.12)', padding: '2px 6px', borderRadius: '6px' }}>
                              Interactivo
                            </span>
                          )}
                        </div>

                        {/* Botón Favorito */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleFavorite(e, res.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: isFav ? 'var(--primary)' : 'var(--text-muted)', padding: '2px' }}
                          title={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
                          aria-label="Alternar favorito"
                        >
                          {isFav ? <BookmarkCheck size={18} fill="currentColor" /> : <Bookmark size={18} />}
                        </button>
                      </div>

                      {/* Título y Descripción */}
                      <h4 style={{ fontSize: '14.5px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '6px', lineHeight: '1.3' }}>
                        {res.title}
                      </h4>

                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.45', marginBottom: '14px' }}>
                        {res.description}
                      </p>

                      {/* Metadatos: Nivel, Duración, XP */}
                      <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px', flexWrap: 'wrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> {res.reading_time_minutes} min
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <BarChart3 size={12} /> {res.level || 'Principiante'}
                        </span>
                        <span style={{ color: 'var(--accent)', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Sparkles size={12} /> +{res.xp_reward || 15} XP
                        </span>
                      </div>

                      {/* Barra de Progreso */}
                      {(isInProgress || isCompleted) && (
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: isCompleted ? 'var(--success)' : 'var(--primary)', fontWeight: '800', marginBottom: '3px' }}>
                            <span>{isCompleted ? 'Completado' : 'En progreso'}</span>
                            <span>{isCompleted ? '100%' : `${progressPct}%`}</span>
                          </div>
                          <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%',
                              width: isCompleted ? '100%' : `${progressPct}%`,
                              backgroundColor: isCompleted ? 'var(--success)' : 'var(--primary)'
                            }} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Pie de la Tarjeta */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {res.source_institution || res.author}
                      </span>

                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {isAdminOrSupport && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingResource(res);
                              setShowAdminModal(true);
                            }}
                            className="btn btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '11px' }}
                            title="Editar recurso"
                          >
                            <Edit size={13} />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedResource(res)}
                          className="btn btn-secondary"
                          style={{
                            padding: '6px 14px',
                            fontSize: '11.5px',
                            fontWeight: '800',
                            borderColor: isCompleted ? 'var(--success)' : 'var(--border)'
                          }}
                        >
                          <Eye size={13} />
                          <span>{isCompleted ? 'Revisar' : (isInProgress ? 'Continuar' : 'Explorar')}</span>
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>

          </>
          )}

        </div>
      )}

    </div>
  );
};

export default MyWellbeing;

