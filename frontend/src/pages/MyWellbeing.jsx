import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, Activity, Calendar, Sparkles, BookOpen, Clock, HeartHandshake,
  TrendingUp, Shield, AlertCircle, CheckCircle2, Mic, Square, Send, 
  Search, Book, ArrowRight, UserCheck, HelpCircle, ChevronRight, Eye,
  ShieldCheck, Loader, RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import GamificationWidget from '../components/GamificationWidget';
import ConsentModal from '../components/ConsentModal';
import TestResponseViewer from '../components/TestResponseViewer';

const MyWellbeing = ({ onNavigateToTab }) => {
  const navigate = useNavigate();

  // Estados de Pestañas Internas de Mi Bienestar
  const [activeSection, setActiveSection] = useState('estado_actual'); // 'estado_actual', 'historial', 'evaluaciones', 'tendencias', 'recomendaciones', 'recursos'

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

  // Estados de Formulario de Registro Emocional / Reflexión
  const [reflectionText, setReflectionText] = useState('');
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

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    fetchHistory(historyPeriod);
  }, [historyPeriod]);

  // Manejo de Grabación de Voz con Verificación de Consentimiento
  const handleStartVoice = () => {
    if (!userConsents['voice_analysis']) {
      setConsentModalType('voice_analysis');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Tu navegador no soporta reconocimiento de voz nativo. Puedes escribir tu reflexión.');
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
      <div className="tab-container" style={{ width: '100%', overflowX: 'auto', flexWrap: 'nowrap' }}>
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
          <div className="glass-card" style={{
            padding: '20px 24px',
            borderLeft: `5px solid ${summary?.status_tone === 'danger' ? 'var(--danger)' : summary?.status_tone === 'warning' ? 'var(--warning)' : 'var(--success)'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Diagnóstico Preventivo Orientativo
              </span>
              <h3 style={{ fontSize: '17px', fontWeight: '900', color: 'var(--text-primary)', marginTop: '2px', marginBottom: '6px' }}>
                {summary?.status_label || 'Bienestar en observación'}
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5', maxWidth: '750px' }}>
                {summary?.guidance}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setActiveSection('recursos')}
                className="btn btn-secondary"
                style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: '700' }}
              >
                Ver Recursos
              </button>
              <button
                onClick={() => {
                  if (onNavigateToTab) onNavigateToTab('clinical_appointments');
                  else navigate('/agenda-citas');
                }}
                className="btn btn-primary"
                style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: '700' }}
              >
                Solicitar Cita
              </button>
            </div>
          </div>

          {/* Grid de 4 Indicadores Clave Preventivos */}
          <div className="grid grid-4">
            <div className="glass-card" style={{ padding: '16px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800' }}>ESTRÉS ESTIMADO</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '6px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '900', color: summary?.averages?.stress > 60 ? 'var(--danger)' : 'var(--success)' }}>
                  {summary?.averages?.stress || 0}%
                </h3>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>Promedio</span>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '16px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800' }}>MOTIVACIÓN</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '6px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '900', color: summary?.averages?.motivation > 50 ? 'var(--success)' : 'var(--warning)' }}>
                  {summary?.averages?.motivation || 0}%
                </h3>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>Energía</span>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '16px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800' }}>AGOTAMIENTO</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '6px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '900', color: summary?.averages?.burnout > 60 ? 'var(--warning)' : 'var(--success)' }}>
                  {summary?.averages?.burnout || 0}%
                </h3>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>Fatiga</span>
              </div>
            </div>

            <div className="glass-card" style={{ padding: '16px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800' }}>BIENESTAR GENERAL</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '6px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--primary)' }}>
                  {summary?.averages?.general_wellbeing || 0}%
                </h3>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>Balance</span>
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

              {/* Selector de Emojis */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  ESTADO DE ÁNIMO DOMINANTE:
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { emoji: '😫', label: 'Tensión' },
                    { emoji: '🙁', label: 'Cansancio' },
                    { emoji: '😐', label: 'Neutro' },
                    { emoji: '🙂', label: 'Tranquilo' },
                    { emoji: '😁', label: 'Energético' }
                  ].map((mood, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setReflectionText(prev => prev ? `${prev} Me siento ${mood.label.toLowerCase()} ${mood.emoji}.` : `Hoy me siento ${mood.label.toLowerCase()} ${mood.emoji}.`)}
                      className="duo-pill"
                      style={{ padding: '6px 10px', fontSize: '11.5px' }}
                    >
                      <span>{mood.emoji}</span>
                      <span>{mood.label}</span>
                    </button>
                  ))}
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
                <h4 style={{ fontSize: '13.5px', fontWeight: '800', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={15} style={{ color: 'var(--accent)' }} /> Recomendación para tu bienestar
                </h4>
                {recommendedResources.length > 0 ? (
                  <div style={{ display: 'grid', gap: '8px' }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                      {recommendedResources[0].description}
                    </p>
                    <button
                      onClick={() => {
                        setSelectedResource(recommendedResources[0]);
                        setActiveSection('recursos');
                      }}
                      className="btn btn-secondary"
                      style={{ marginTop: '6px', width: '100%', fontSize: '11.5px', fontWeight: '800', justifyContent: 'center' }}
                    >
                      <BookOpen size={14} />
                      <span>Leer: {recommendedResources[0].title}</span>
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
              <div style={{ width: '100%', height: '260px' }}>
                <ResponsiveContainer width="100%" height="100%">
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
                              style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: '800' }}
                            >
                              Completar Test ➔
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
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECCIÓN F: CENTRO DE RECURSOS                           */}
      {/* ======================================================== */}
      {activeSection === 'recursos' && (
        <div className="animate-fade" style={{ display: 'grid', gap: '18px' }}>
          
          {/* Modal de Lectura de Recurso */}
          {selectedResource && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(6px)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}>
              <div className="glass-card animate-fade" style={{
                maxWidth: '650px',
                width: '100%',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '18px',
                padding: '28px',
                maxHeight: '85vh',
                overflowY: 'auto'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase' }}>
                      {selectedResource.category} • {selectedResource.resource_type}
                    </span>
                    <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-primary)', marginTop: '2px' }}>
                      {selectedResource.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedResource(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    ×
                  </button>
                </div>

                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  {selectedResource.author} • {selectedResource.reading_time_minutes} min de lectura
                </div>

                <div style={{ fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: '1.7', backgroundColor: 'var(--bg-primary)', padding: '18px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '20px' }}>
                  {selectedResource.content}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setSelectedResource(null)}
                    className="btn btn-primary"
                    style={{ padding: '8px 20px', borderRadius: '10px' }}
                  >
                    Cerrar Recurso
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Barra de Búsqueda y Filtros de Recursos */}
          <div className="glass-card" style={{ padding: '18px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <div style={{ flex: 1, position: 'relative', minWidth: '220px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Buscar recursos, guías o ejercicios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '38px', fontSize: '12.5px' }}
                />
              </div>
            </div>

            {/* Categorías */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
              {resourceCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="duo-pill"
                  style={{
                    padding: '6px 12px',
                    fontSize: '11.5px',
                    fontWeight: selectedCategory === cat ? '800' : '600',
                    backgroundColor: selectedCategory === cat ? 'var(--primary)' : 'var(--bg-primary)',
                    color: selectedCategory === cat ? '#fff' : 'var(--text-secondary)',
                    borderColor: selectedCategory === cat ? 'var(--primary)' : 'var(--border)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Recursos */}
          <div className="grid grid-2">
            {filteredResources.length === 0 ? (
              <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <Book size={32} style={{ opacity: 0.3, margin: '0 auto 10px' }} />
                <p style={{ fontSize: '13px', fontWeight: '600' }}>No se encontraron recursos que coincidan con tu búsqueda.</p>
              </div>
            ) : (
              filteredResources.map(res => (
                <div key={res.id} className="glass-card" style={{ padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '2px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>
                        {res.category}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {res.reading_time_minutes} min
                      </span>
                    </div>

                    <h4 style={{ fontSize: '14.5px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '6px' }}>
                      {res.title}
                    </h4>

                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '14px' }}>
                      {res.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                      {res.resource_type.toUpperCase()}
                    </span>
                    <button
                      onClick={() => setSelectedResource(res)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '11.5px', fontWeight: '800' }}
                    >
                      <Eye size={13} />
                      <span>Leer Contenido</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default MyWellbeing;
