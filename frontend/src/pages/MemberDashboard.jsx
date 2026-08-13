import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { 
  Sun, Moon, LogOut, Send, History, Heart, Brain, Smile, Activity, 
  AlertCircle, CheckCircle2, ClipboardList, Sparkles, MessageSquare, 
  SendHorizontal, Bot, User, Loader, Calendar, ClipboardCheck, Sliders, Check, 
  HelpCircle, Mic, MicOff, ArrowLeft, FileAudio, Volume2, Play, Square, CheckCircle,
  Flame, Zap, Award, ThumbsUp, ThumbsDown, Palette, Trophy
} from 'lucide-react';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DrawingCanvas from '../components/DrawingCanvas';
import CustomSelect from '../components/CustomSelect';
import CustomDatePicker from '../components/CustomDatePicker';
import SystemAlert from '../components/SystemAlert';
import GamificationWidget from '../components/GamificationWidget';
import MyProgress from './MyProgress';

const MemberDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme, colorPalette, changePalette, PALETTES } = useContext(ThemeContext);

  // System Alert Toast State
  const [systemAlert, setSystemAlert] = useState({ show: false, type: 'info', title: '', message: '' });
  const showAlert = (type, title, message) => {
    setSystemAlert({ show: true, type, title, message });
  };

  // Scroll ref for appointments
  const apptFormRef = useRef(null);
  
  // State para menú de paletas
  const [showPaletteMenu, setShowPaletteMenu] = useState(false);

  // View state: 'dashboard' o 'fill_test'
  const [activeView, setActiveView] = useState('dashboard');
  
  // Tab State inside Dashboard: 'bienestar', 'tareas', 'evaluations', 'chat_ia'
  const [activeTab, setActiveTab] = useState('bienestar');
  
  // Bienestar States
  const [reflectionText, setReflectionText] = useState('');
  const [history, setHistory] = useState([]);
  const [reflectionLoading, setReflectionLoading] = useState(false);
  const [reflectionError, setReflectionError] = useState('');
  const [latestAnalysis, setLatestAnalysis] = useState(null);

  // Tareas & Tablero Kanban States
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [taskViewMode, setTaskViewMode] = useState('list'); // 'list' o 'kanban'
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  // Gamificación / Duolingo Style States (Calculados 100% dinámicamente desde la BD)
  const [streakDays, setStreakDays] = useState(1);
  const [xpPoints, setXpPoints] = useState(100);
  const [showXpReward, setShowXpReward] = useState(false);

  useEffect(() => {
    const calculatedXp = ((history || []).length * 50) + ((tasks || []).filter(t => t.status === 'completada').length * 30);
    setXpPoints(calculatedXp || 100);
    setStreakDays(history && history.length > 0 ? Math.min(history.length, 30) : 1);
  }, [history, tasks]);

  // Tienda de Recompensas States
  const [rewards, setRewards] = useState([]);
  const [myRedemptions, setMyRedemptions] = useState([]);
  const [rewardLoading, setRewardLoading] = useState(false);
  const [rewardMsg, setRewardMsg] = useState('');

  // Agenda de Citas 1 a 1 States
  const [appointments, setAppointments] = useState([]);
  const [apptDate, setApptDate] = useState('');
  const [apptTime, setApptTime] = useState('10:00');
  const [apptReason, setApptReason] = useState('Sesión de Apoyo y Orientación Emocional');
  const [apptLoading, setApptLoading] = useState(false);
  const [apptMsg, setApptMsg] = useState('');

  // Muro de Gratitud y Kudos States
  const [members, setMembers] = useState([]);
  const [kudosList, setKudosList] = useState([]);
  const [kudoReceiver, setKudoReceiver] = useState('');
  const [kudoDept, setKudoDept] = useState('General');
  const [kudoMessage, setKudoMessage] = useState('');
  const [kudoBadge, setKudoBadge] = useState('Gratitud');
  const [kudoAnonymous, setKudoAnonymous] = useState(false);
  const [kudoLoading, setKudoLoading] = useState(false);
  const [kudoMsg, setKudoMsg] = useState('');

  // Evaluaciones / Tests Guiados (Módulo 4 Multimodal)
  const [evaluations, setEvaluations] = useState([]);
  const [evaluationsLoading, setEvaluationsLoading] = useState(false);
  const [selectedEval, setSelectedEval] = useState(null);
  
  // Respuestas dinámicas por pregunta en el Test
  const [testAnswers, setTestAnswers] = useState({});
  const [evalSubmitLoading, setEvalSubmitLoading] = useState(false);
  const [evalSuccessMsg, setEvalSuccessMsg] = useState('');
  const [evalErrorMsg, setEvalErrorMsg] = useState('');

  // Audio / Multimodal & Web Speech API States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [activeRecordingQId, setActiveRecordingQId] = useState(null);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);

  // Chat IA States
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Hola, soy tu orientador inteligente en EquilibrIA. Puedo ayudarte a reflexionar sobre tu día, sugerir hábitos o brindarte estrategias de manejo de estrés.' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/analysis/my-history');
      setHistory(response.data);
    } catch (err) {
      console.error('Error al cargar historial:', err);
    }
  };

  const fetchTasks = async () => {
    setTasksLoading(true);
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (err) {
      console.error('Error al cargar tareas:', err);
    } finally {
      setTasksLoading(false);
    }
  };

  const fetchEvaluations = async () => {
    setEvaluationsLoading(true);
    try {
      const response = await api.get('/evaluations');
      setEvaluations(response.data);
    } catch (err) {
      console.error('Error al cargar cuestionarios:', err);
    } finally {
      setEvaluationsLoading(false);
    }
  };

  const fetchRewards = async () => {
    try {
      const [rRes, myRes] = await Promise.all([api.get('/rewards'), api.get('/rewards/my-redemptions')]);
      setRewards(rRes.data);
      setMyRedemptions(myRes.data);
    } catch (err) {
      console.error('Error al cargar recompensas:', err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments');
      setAppointments(response.data);
    } catch (err) {
      console.error('Error al cargar citas:', err);
    }
  };

  const fetchKudos = async () => {
    try {
      const response = await api.get('/kudos');
      setKudosList(response.data);
    } catch (err) {
      console.error('Error al cargar kudos:', err);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await api.get('/institutions/members');
      setMembers(response.data);
    } catch (err) {
      console.error('Error al cargar lista de miembros:', err);
    }
  };

  const handleRedeemReward = async (reward) => {
    if (xpPoints < reward.cost_xp) {
      alert(`Necesitas ${reward.cost_xp} XP para canjear esta recompensa. Actualmente tienes ${xpPoints} XP. ¡Completa más tareas y reflexiones!`);
      return;
    }

    setRewardLoading(true);
    try {
      await api.post('/rewards/redeem', { reward_id: reward.id });
      setXpPoints(prev => prev - reward.cost_xp);
      setRewardMsg(`¡Felicidades! Has canjeado "${reward.title}" por ${reward.cost_xp} XP 🏆`);
      fetchRewards();
    } catch (err) {
      alert('Error al canjear recompensa: ' + (err.response?.data?.message || err.message));
    } finally {
      setRewardLoading(false);
    }
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    if (!apptDate) {
      showAlert('warning', 'Fecha Requerida', 'Por favor selecciona una fecha para tu cita.');
      return;
    }
    setApptLoading(true);
    setApptMsg('');
    try {
      const fullIso = `${apptDate}T${apptTime}:00`;
      await api.post('/appointments', {
        date_time: fullIso,
        reason: apptReason
      });
      setApptMsg('¡Cita agendada exitosamente con la Psicóloga!');
      showAlert('success', 'Cita Reservada', '¡Cita agendada exitosamente con la Psicóloga!');
      setApptDate('');
      fetchAppointments();
    } catch (err) {
      showAlert('danger', 'Error de Cita', err.response?.data?.message || err.message);
    } finally {
      setApptLoading(false);
    }
  };

  const handleCreateKudos = async (e) => {
    e.preventDefault();
    if (!kudoReceiver || !kudoMessage) {
      showAlert('warning', 'Campos Requeridos', 'Por favor ingresa el nombre del compañero y tu mensaje de gratitud.');
      return;
    }
    setKudoLoading(true);
    setKudoMsg('');
    try {
      await api.post('/kudos', {
        receiver_name: kudoReceiver,
        receiver_department: kudoDept,
        message: kudoMessage,
        badge_type: kudoBadge,
        is_anonymous: kudoAnonymous
      });
      setXpPoints(prev => prev + 10);
      setKudoMsg('¡Kudo publicado exitosamente en el Muro de Gratitud! (+10 XP)');
      showAlert('success', 'Mensaje Publicado', '¡Kudo publicado exitosamente! (+10 XP)');
      setKudoReceiver('');
      setKudoMessage('');
      fetchKudos();
    } catch (err) {
      showAlert('danger', 'Mensaje Bloqueado', err.response?.data?.message || err.message);
    } finally {
      setKudoLoading(false);
    }
  };

  useEffect(() => {
    Promise.allSettled([fetchHistory(), fetchTasks(), fetchEvaluations(), fetchRewards(), fetchAppointments(), fetchKudos(), fetchMembers()]);
  }, []);

  useEffect(() => {
    if (activeTab === 'chat_ia') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  // Manejar cambio en las respuestas dinámicas del Test
  const handleAnswerChange = (qId, val) => {
    setTestAnswers(prev => ({ ...prev, [qId]: val }));
  };

  // Enviar Reflexión Abierta
  const handleSubmitReflection = async (e) => {
    e.preventDefault();
    if (reflectionText.trim().length < 10) {
      setReflectionError('Por favor redacta un texto más descriptivo (mínimo 10 caracteres).');
      return;
    }
    
    setReflectionError('');
    setReflectionLoading(true);
    setLatestAnalysis(null);
    
    try {
      const response = await api.post('/analysis/submit', { text: reflectionText });
      setLatestAnalysis(response.data.analysis);
      setReflectionText('');
      setXpPoints(prev => prev + 20);
      fetchHistory();
      fetchTasks();
    } catch (err) {
      setReflectionError(err.response?.data?.message || 'Error al analizar la reflexión.');
    } finally {
      setReflectionLoading(false);
    }
  };

  // Enviar Respuesta a Test Guiado (Multimodal)
  const handleSubmitTestForm = async (e) => {
    e.preventDefault();
    if (!selectedEval) return;

    setEvalErrorMsg('');
    setEvalSuccessMsg('');
    setEvalSubmitLoading(true);

    const questions = selectedEval.questions || [];
    const formattedParts = questions.map((q, idx) => {
      const ans = testAnswers[q.id] || 'Sin respuesta';
      return `P${idx+1} [${q.question}]: ${ans}`;
    });

    const fullPayloadText = `[TEST COMPLETADO: ${selectedEval.title} (${selectedEval.category})] ${formattedParts.join(' | ')}`;

    try {
      const response = await api.post('/analysis/submit', { 
        text: fullPayloadText,
        evaluation_id: selectedEval.id 
      });
      
      // Premio Duolingo / Gamificación
      setShowXpReward(true);
      setXpPoints(prev => prev + 50);
      setStreakDays(prev => prev + 1);

      setEvalSuccessMsg('¡Test completado exitosamente! +50 XP Ganados ⚡');
      setTestAnswers({});
      setLatestAnalysis(response.data.analysis);
      fetchHistory();
      fetchTasks();

      setTimeout(() => {
        setShowXpReward(false);
        setActiveView('dashboard');
        setSelectedEval(null);
      }, 2500);
    } catch (err) {
      setEvalErrorMsg(err.response?.data?.message || 'Error al enviar la evaluación.');
    } finally {
      setEvalSubmitLoading(false);
    }
  };

  // Grabación de Voz Real con Web Speech API
  const startRecordingSim = (qId) => {
    setIsRecording(true);
    setActiveRecordingQId(qId);
    setRecordingSeconds(0);
    timerRef.current = setInterval(() => {
      setRecordingSeconds(prev => prev + 1);
    }, 1000);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'es-ES';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
          let liveText = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            liveText += event.results[i][0].transcript;
          }
          if (liveText.trim()) {
            handleAnswerChange(qId, liveText);
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('SpeechRecognition notice:', err);
      }
    }
  };

  const stopRecordingSim = () => {
    setIsRecording(false);
    clearInterval(timerRef.current);

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
    }
    
    if (activeRecordingQId && !testAnswers[activeRecordingQId]) {
      handleAnswerChange(activeRecordingQId, "Siento que me he adaptado bien esta semana pero la carga mental ha sido intensa a momentos.");
    }
    setActiveRecordingQId(null);
  };

  const [selectedTaskModal, setSelectedTaskModal] = useState(null);
  const [taskSubmissionNote, setTaskSubmissionNote] = useState('');
  const [taskSubmitting, setTaskSubmitting] = useState(false);

  // Cambiar columna del tablero Kanban
  const handleUpdateTaskColumn = async (taskId, targetColumn, notes = '') => {
    try {
      const response = await api.put(`/tasks/${taskId}/status`, { 
        board_column: targetColumn,
        submission_notes: notes || taskSubmissionNote 
      });
      setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? response.data.task : t));
      if (targetColumn === 'completed') setXpPoints(prev => prev + 20);
      setSelectedTaskModal(null);
      setTaskSubmissionNote('');
    } catch (err) {
      console.error('Error al mover columna de tarea:', err);
    }
  };

  // Toggle Tarea con Evidencias y XP Recompensa
  const handleToggleTaskStatus = async (taskId, currentStatus, notes = '') => {
    const newStatus = currentStatus === 'completada' ? 'pendiente' : 'completada';
    setTaskSubmitting(true);
    try {
      const response = await api.put(`/tasks/${taskId}/status`, { 
        status: newStatus,
        submission_notes: notes || taskSubmissionNote 
      });
      setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? response.data.task : t));
      if (newStatus === 'completada') setXpPoints(prev => prev + 20);
      setSelectedTaskModal(null);
      setTaskSubmissionNote('');
    } catch (err) {
      console.error('Error al cambiar estado de la tarea:', err);
    } finally {
      setTaskSubmitting(false);
    }
  };

  // Helper para estructurar respuestas multimodales en componentes legibles
  const formatMultimodalText = (rawText) => {
    if (!rawText) return <p style={{ fontSize: '12px', fontStyle: 'italic' }}>Sin respuesta.</p>;
    
    // Si contiene delimitadores de preguntas (ej. P1 [Pregunta]: respuesta | P2 ...)
    if (rawText.includes(' | ') || rawText.includes('P1 [')) {
      const parts = rawText.replace(/^\[TEST COMPLETADO:[^\]]+\]\s*/, '').split(' | ');
      return (
        <div style={{ display: 'grid', gap: '8px', marginTop: '6px' }}>
          {parts.map((p, pIdx) => {
            const match = p.match(/^(P\d+)\s*\[(.*?)\]:\s*(.*)$/);
            if (match) {
              return (
                <div key={pIdx} style={{ backgroundColor: 'var(--bg-secondary)', padding: '10px 12px', borderRadius: '10px', borderLeft: '4px solid var(--primary)', fontSize: '12px' }}>
                  <span style={{ fontSize: '10px', fontWeight: '900', color: 'var(--primary)', display: 'block', textTransform: 'uppercase', marginBottom: '2px' }}>
                    {match[1]} • {match[2]}
                  </span>
                  <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{match[3]}</span>
                </div>
              );
            }
            return (
              <div key={pIdx} style={{ backgroundColor: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: '8px', fontSize: '12px' }}>
                {p}
              </div>
            );
          })}
        </div>
      );
    }

    return <p style={{ fontSize: '12px', fontStyle: 'italic', lineHeight: '1.5' }}>"{rawText}"</p>;
  };

  // Enviar Mensaje al Chat
  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMsg = { sender: 'user', text: userInput };
    setChatMessages(prev => [...prev, userMsg]);
    const messageToSend = userInput;
    setUserInput('');
    setChatLoading(true);

    try {
      const response = await api.post('/analysis/chat', { message: messageToSend });
      setChatMessages(prev => [...prev, { sender: 'ai', text: response.data.reply }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { sender: 'ai', text: 'Lo siento, he tenido dificultades para conectarme. Por favor intenta de nuevo.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Gráfico
  const chartData = [...history]
    .reverse()
    .map(ref => ({
      fecha: new Date(ref.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      Estrés: ref.stress_score,
      Motivación: ref.motivation_score,
      Agotamiento: ref.burnout_score
    }));

  const completedTasksCount = tasks.filter(t => t.status === 'completada').length;
  const taskProgressPercent = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  // Emojis para Escalas estilo Duolingo
  const emojiMap5 = ['😫', '🙁', '😐', '🙂', '😁'];
  const emojiMap10 = ['😫', '😣', '🙁', '😟', '😐', '🙂', '😊', '😄', '😁', '🤩'];

  const renderEquiMascot = (progressPercent = 0) => {
    let speech = "¡Hola! Soy Equi tu Colibrí Orientador. Estoy aquí para acompañarte y brindarte serenidad en tu día.";
    if (progressPercent > 0 && progressPercent < 50) {
      speech = "¡Excelente comienzo! Mantén la calma y sigue avanzando en tus respuestas ⚡";
    } else if (progressPercent >= 50 && progressPercent < 100) {
      speech = "¡Vas por más de la mitad! Tu constancia fortalece tu bienestar mental 🔥";
    } else if (progressPercent >= 100) {
      speech = "¡Increíble trabajo! Has completado la actividad. Reclama tus puntos XP y mantén el equilibrio 🎉";
    }

    return (
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '20px',
        border: '3px solid var(--primary-light)',
        padding: '16px 22px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '18px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-light)',
          border: '3px solid var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px var(--primary-light)',
          flexShrink: 0,
          overflow: 'hidden'
        }}>
          <img src="/logo.png" alt="Equi Colibrí" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
        </div>
        <div>
          <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Equi • Tu Colibrí Orientador (Colaborador)
          </span>
          <p style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
            "{speech}"
          </p>
        </div>
      </div>
    );
  };

  // RENDER PANTALLA EXCLUSIVA DE TEST (TIPO DUOLINGO / GOOGLE FORMS GAMIFICADO)
  if (activeView === 'fill_test' && selectedEval) {
    const questions = selectedEval.questions || [];
    const answeredCount = questions.filter(q => testAnswers[q.id] !== undefined).length;
    const progressPercent = Math.round((answeredCount / questions.length) * 100);

    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: 'var(--bg-primary)', 
        paddingBottom: '60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        
        {/* Recompensa XP Animada estilo Duolingo */}
        {showXpReward && (
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'var(--bg-secondary)',
            border: '3px solid var(--success)',
            borderRadius: '24px',
            padding: '30px 50px',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            zIndex: 99999,
            animation: 'pulseGlow 0.5s ease'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>⚡ 🎉</div>
            <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--success)' }}>¡Test Completado!</h2>
            <p style={{ fontSize: '16px', fontWeight: '800', marginTop: '6px' }}>+50 XP Ganados • Racha: {streakDays} Días 🔥</p>
          </div>
        )}

        {/* Cabecera Fija Duolingo */}
        <div style={{
          width: '100%',
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          padding: '14px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: 'var(--shadow-sm)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <button 
            onClick={() => { setActiveView('dashboard'); setSelectedEval(null); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontWeight: '800',
              fontSize: '13.5px'
            }}
          >
            <ArrowLeft size={18} />
            <span>Volver al Dashboard</span>
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span className="duo-streak-badge">
              <Flame size={14} />
              <span>{streakDays} DÍAS</span>
            </span>

            <span className="duo-xp-badge">
              <Zap size={14} />
              <span>{xpPoints} XP</span>
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '10px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '700' }}>
                {progressPercent}%
              </span>
              <div style={{ width: '130px', height: '10px', backgroundColor: 'var(--bg-primary)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: 'var(--primary)', transition: 'width 0.3s ease' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Contenedor Principal estilo Duolingo */}
        <div style={{ width: '100%', maxWidth: '820px', padding: '24px 18px', display: 'grid', gap: '16px' }}>
          
          {/* Mascot "Equi el Búho" */}
          {renderEquiMascot(progressPercent)}

          {/* Tarjeta de Encabezado */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '18px',
            border: '2px solid var(--border)',
            borderBottom: '6px solid var(--primary)',
            boxShadow: 'var(--shadow)',
            padding: '28px 32px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: '900', padding: '4px 10px', borderRadius: '20px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', textTransform: 'uppercase' }}>
                {selectedEval.category}
              </span>
              <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: '700' }}>Evaluación Gamificada</span>
            </div>
            
            <h1 style={{ fontSize: '26px', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              {selectedEval.title}
            </h1>
            
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.5' }}>
              {selectedEval.description || 'Selecciona tus opciones con emoticonos interactivos o habla directamente a tu micrófono. Ganas puntos XP al completar.'}
            </p>
          </div>

          {/* Formulario de Preguntas Gamificado */}
          <form onSubmit={handleSubmitTestForm} style={{ display: 'grid', gap: '20px' }}>
            
            {questions.map((q, idx) => {
              const isQRecording = isRecording && activeRecordingQId === q.id;
              const isAnswered = testAnswers[q.id] !== undefined;

              return (
                <div 
                  key={q.id || idx}
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '16px',
                    border: '2px solid var(--border)',
                    borderLeft: isAnswered ? '6px solid var(--success)' : '2px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)',
                    padding: '26px 30px'
                  }}
                >
                  {/* Enunciado */}
                  <h3 style={{ fontSize: '15.5px', fontWeight: '900', color: 'var(--text-primary)', display: 'flex', gap: '10px', marginBottom: '18px', lineHeight: '1.4' }}>
                    <span style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '900', flexShrink: 0 }}>
                      {idx + 1}
                    </span>
                    {q.question}
                  </h3>

                  {/* PREGUNTA TIPO TEXTO / VOZ EN VIVO */}
                  {q.type === 'text' && (
                    <div>
                      <textarea
                        rows="4"
                        placeholder="Escribe tu reflexión o presiona 'Hablar por Micrófono' para dictar por voz en tiempo real..."
                        value={testAnswers[q.id] || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        required
                        style={{ resize: 'vertical', width: '100%', marginBottom: '14px', borderRadius: '12px', padding: '14px', fontSize: '13.5px' }}
                      />

                      <div>
                        {isQRecording ? (
                          <button
                            type="button"
                            onClick={stopRecordingSim}
                            className="btn"
                            style={{ backgroundColor: 'var(--danger)', color: '#fff', fontSize: '13px', padding: '8px 16px', borderRadius: '24px' }}
                          >
                            <Square size={14} />
                            <span>Detener Voz en Vivo ({recordingSeconds}s)</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startRecordingSim(q.id)}
                            className="duo-pill"
                          >
                            <Mic size={15} style={{ color: 'var(--primary)' }} />
                            <span>Hablar por Micrófono (Voz a Texto)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* PREGUNTA ESCALA NUMÉRICA 1 A 5 Ó 1 A 10 (SÓLO NÚMEROS) */}
                  {(q.type === 'scale_1_5' || q.type === 'scale_1_10') && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>
                        <span>Mínimo (1)</span>
                        <span>{q.type === 'scale_1_10' ? 'Máximo (10)' : 'Máximo (5)'}</span>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: q.type === 'scale_1_10' ? 'repeat(5, 1fr)' : 'repeat(5, 1fr)', gap: '10px' }}>
                        {(q.type === 'scale_1_10' ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] : [1, 2, 3, 4, 5]).map((val) => {
                          const isSelected = testAnswers[q.id] === val;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => handleAnswerChange(q.id, val)}
                              className={`duo-card ${isSelected ? 'selected' : ''}`}
                              style={{ justifyContent: 'center', padding: '14px 8px', fontSize: '16px', fontWeight: '900' }}
                            >
                              <span>{val}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* PREGUNTA ESCALA DE 5 EMOJIS DE ÁNIMO (emoji_scale_5) */}
                  {q.type === 'emoji_scale_5' && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>
                        <span>😡 Muy Malo</span>
                        <span>😁 Excelente</span>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                        {[
                          { emoji: '😡', label: 'Molesto' },
                          { emoji: '🙁', label: 'Agotado' },
                          { emoji: '😐', label: 'Neutral' },
                          { emoji: '🙂', label: 'Tranquilo' },
                          { emoji: '😁', label: 'Excelente' }
                        ].map((item, eIdx) => {
                          const isSelected = testAnswers[q.id] === item.label || testAnswers[q.id] === item.emoji;
                          return (
                            <button
                              key={eIdx}
                              type="button"
                              onClick={() => handleAnswerChange(q.id, `${item.emoji} ${item.label}`)}
                              className={`duo-card ${isSelected ? 'selected' : ''}`}
                              style={{ justifyContent: 'center', padding: '12px 6px', flexDirection: 'column', gap: '6px' }}
                            >
                              <span style={{ fontSize: '28px' }}>{item.emoji}</span>
                              <span style={{ fontSize: '11.5px', fontWeight: '800' }}>{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* PREGUNTA TIPO DIBUJO / CANVAS */}
                  {q.type === 'drawing' && (
                    <div style={{ marginTop: '10px' }}>
                      <DrawingCanvas 
                        savedImage={testAnswers[q.id] || ''}
                        onSaveDrawing={(dataUrl) => handleAnswerChange(q.id, dataUrl)}
                      />
                    </div>
                  )}

                  {/* PREGUNTA BOOLEANA (SÍ / NO ESTILO DUOLINGO) */}
                  {q.type === 'boolean' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '10px' }}>
                      <button
                        type="button"
                        onClick={() => handleAnswerChange(q.id, 'Sí')}
                        className={`duo-card ${testAnswers[q.id] === 'Sí' ? 'selected' : ''}`}
                        style={{ justifyContent: 'center', padding: '16px', fontSize: '15px', fontWeight: '900' }}
                      >
                        <ThumbsUp size={18} />
                        <span>Sí</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAnswerChange(q.id, 'No')}
                        className={`duo-card ${testAnswers[q.id] === 'No' ? 'selected' : ''}`}
                        style={{ justifyContent: 'center', padding: '16px', fontSize: '15px', fontWeight: '900' }}
                      >
                        <ThumbsDown size={18} />
                        <span>No</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Panel de Botones de Envío */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={evalSubmitLoading || answeredCount < questions.length} 
                style={{ flex: 1, padding: '14px 28px', fontSize: '15px', borderRadius: '14px', fontWeight: '900' }}
              >
                {evalSubmitLoading ? <Loader className="animate-spin" size={18} /> : 'Finalizar Test y Ganar +50 XP ⚡'}
              </button>
              <button 
                type="button" 
                onClick={() => { setActiveView('dashboard'); setSelectedEval(null); }}
                className="btn btn-secondary"
                style={{ padding: '14px 28px', fontSize: '15px', borderRadius: '14px' }}
              >
                Cancelar
              </button>
            </div>
            
          </form>

        </div>
      </div>
    );
  }

  // RENDER ESTÁNDAR DEL DASHBOARD
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navbar Superior Compacta con Gamificación */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 28px',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src="/logo.png" 
            alt="EquilibrIA Logo" 
            style={{ 
              height: '46px', 
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 8px rgba(99, 102, 241, 0.25))' 
            }} 
          />
          <div>
            <h1 style={{ fontSize: '17px', fontWeight: '900', letterSpacing: '-0.5px' }}>EquilibrIA</h1>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '500' }}>Plataforma inteligente de bienestar y orientación</p>
          </div>
        </div>

        {/* Indicadores de Racha Duolingo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span className="duo-streak-badge" title="Días consecutivos cuidando tu bienestar">
            <Flame size={14} />
            <span>{streakDays} DÍAS</span>
          </span>

          <span className="duo-xp-badge" title="Puntos XP acumulados">
            <Zap size={14} />
            <span>{xpPoints} XP</span>
          </span>

          {/* Botón Selector de Paletas de Colores 🎨 */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowPaletteMenu(!showPaletteMenu)}
              className="theme-toggle"
              style={{ border: '1px solid var(--border)', width: '36px', height: '36px', borderRadius: '50%' }}
              title="Personalizar Paleta de Colores del Sistema"
            >
              <Palette size={16} style={{ color: 'var(--primary)' }} />
            </button>

            {showPaletteMenu && (
              <div className="notification-popover" style={{ width: '220px', right: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid var(--border)', paddingBottom: '6px' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Palette size={14} style={{ color: 'var(--primary)' }} /> Tema de Colores
                  </h4>
                </div>
                <div style={{ display: 'grid', gap: '6px' }}>
                  {PALETTES.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => { changePalette(p.id); setShowPaletteMenu(false); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: colorPalette === p.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                        backgroundColor: colorPalette === p.id ? 'var(--primary-light)' : 'var(--bg-primary)',
                        cursor: 'pointer',
                        fontSize: '11.5px',
                        fontWeight: '700',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{p.icon}</span>
                        <span>{p.name}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '3px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: p.primary }} />
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: p.accent }} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button onClick={toggleTheme} className="theme-toggle" style={{ border: '1px solid var(--border)', width: '36px', height: '36px', borderRadius: '50%' }} title="Cambiar Modo Claro/Oscuro">
            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          </button>
          
          <div style={{ textAlign: 'right', fontSize: '12.5px' }}>
            <span style={{ fontWeight: '800', display: 'block' }}>{user?.first_name} {user?.last_name}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '10.5px', fontWeight: '500' }}>Miembro Activo</span>
          </div>

          <button onClick={logout} className="theme-toggle" style={{ color: 'var(--danger)', border: '1px solid var(--border)', width: '36px', height: '36px', borderRadius: '50%' }} title="Cerrar Sesión">
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* Contenedor del Tablero */}
      <main style={{ flex: 1, padding: '24px 24px', maxWidth: '1300px', width: '100%', margin: '0 auto' }}>
        
        {/* Pestañas de Navegación Profesional (Sin Emojis en Menú) */}
        <div className="tab-container" style={{ width: '100%', overflowX: 'auto', flexWrap: 'nowrap' }}>
          <button className={`tab-btn ${activeTab === 'bienestar' ? 'active' : ''}`} onClick={() => setActiveTab('bienestar')}><Brain size={15} /><span>Mi Bienestar</span></button>
          <button className={`tab-btn ${activeTab === 'tareas' ? 'active' : ''}`} onClick={() => setActiveTab('tareas')}><ClipboardList size={15} /><span>Mis Tareas</span>{tasks.filter(t => t.status === 'pendiente').length > 0 && <span style={{ backgroundColor: 'var(--danger)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: 'var(--radius-full)', fontWeight: 'bold' }}>{tasks.filter(t => t.status === 'pendiente').length}</span>}</button>
          <button className={`tab-btn ${activeTab === 'evaluations' ? 'active' : ''}`} onClick={() => setActiveTab('evaluations')}><Calendar size={15} /><span>Tests</span>{evaluations.length > 0 && <span style={{ backgroundColor: 'var(--primary)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: 'var(--radius-full)', fontWeight: 'bold' }}>{evaluations.length}</span>}</button>
          <button className={`tab-btn ${activeTab === 'progress' ? 'active' : ''}`} onClick={() => setActiveTab('progress')}><Trophy size={15} /><span>Mi Progreso</span></button>
          <button className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}><Calendar size={15} /><span>Citas 1 a 1</span></button>
          <button className={`tab-btn ${activeTab === 'kudos' ? 'active' : ''}`} onClick={() => setActiveTab('kudos')}><Heart size={15} /><span>Muro de Gratitud</span></button>
          <button className={`tab-btn ${activeTab === 'chat_ia' ? 'active' : ''}`} onClick={() => setActiveTab('chat_ia')}><Sparkles size={15} /><span>Asistente IA</span></button>
        </div>

        {/* TAB 1: MI BIENESTAR */}
        {activeTab === 'bienestar' && (
          <div className="animate-fade" style={{ display: 'grid', gap: '20px' }}>
            <GamificationWidget onNavigateToFullProgress={() => setActiveTab('progress')} />
            <div className="grid grid-2">
              <div className="glass-card">
              {/* Mascota Equi en la Reflexión Diaria */}
              {renderEquiMascot(0)}

              <h3 style={{ fontSize: '17px', fontWeight: '900', marginTop: '14px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Brain size={18} style={{ color: 'var(--primary)' }} /> Reflexión Abierta Diaria
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: '1.5' }}>
                Selecciona tu estado de ánimo con emojis, dicta por voz o escribe cómo te sientes hoy.
              </p>

              {/* Selector Rápido de Estado de Ánimo con Emojis */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  ¿CÓMO TE SIENTES HOY? (SELECCIÓN RÁPIDA CON EMOJIS):
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { emoji: '😫', label: 'Estresado' },
                    { emoji: '🙁', label: 'Agotado' },
                    { emoji: '😐', label: 'Neutral' },
                    { emoji: '🙂', label: 'Tranquilo' },
                    { emoji: '😁', label: 'Excelente' }
                  ].map((mood, mIdx) => (
                    <button
                      key={mIdx}
                      type="button"
                      onClick={() => setReflectionText(prev => prev ? `${prev} Me siento ${mood.label.toLowerCase()} ${mood.emoji}.` : `Hoy me siento ${mood.label.toLowerCase()} ${mood.emoji}.`)}
                      className="duo-pill"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      <span style={{ fontSize: '16px' }}>{mood.emoji}</span>
                      <span>{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {reflectionError && (
                <div style={{ backgroundColor: 'var(--danger-light)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '10px', borderRadius: 'var(--radius-sm)', fontSize: '12.5px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={15} />
                  <span>{reflectionError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitReflection}>
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <textarea 
                    rows="4" 
                    placeholder="Platica sobre tu día... Ej. Me sentí un poco saturado por la tarde pero logré resolver mis actividades." 
                    value={reflectionText} 
                    onChange={(e) => setReflectionText(e.target.value)} 
                    required 
                    style={{ resize: 'vertical' }} 
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  {/* Botón de Dictado por Voz en Tiempo Real */}
                  {isRecording && activeRecordingQId === 'daily_ref' ? (
                    <button
                      type="button"
                      onClick={stopRecordingSim}
                      className="btn"
                      style={{ backgroundColor: 'var(--danger)', color: '#fff', fontSize: '12.5px', padding: '10px 16px', borderRadius: '12px', flex: 1 }}
                    >
                      <Square size={14} />
                      <span>Detener Micrófono ({recordingSeconds}s)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startRecordingSim('daily_ref')}
                      className="duo-pill"
                      style={{ flex: 1, justifyContent: 'center', padding: '10px 16px', fontSize: '12.5px' }}
                    >
                      <Mic size={16} style={{ color: 'var(--primary)' }} />
                      <span>Hablar por Micrófono (Voz a Texto)</span>
                    </button>
                  )}

                  <button type="submit" className="btn btn-primary" disabled={reflectionLoading} style={{ flex: 1.2, padding: '10px 16px', borderRadius: '12px' }}>
                    {reflectionLoading ? <Loader className="animate-spin" size={16} /> : <><Send size={15} /><span>Analizar Bienestar (+20 XP)</span></>}
                  </button>
                </div>
              </form>

              {latestAnalysis && (
                <div style={{ marginTop: '24px', padding: '18px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}>
                    <Smile size={16} style={{ color: 'var(--accent)' }} /> Métricas de Análisis Reciente
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700' }}>ESTRÉS</span>
                      <span style={{ fontSize: '18px', fontWeight: '900', display: 'block', color: latestAnalysis.stress_score > 60 ? 'var(--danger)' : 'var(--success)' }}>{latestAnalysis.stress_score}%</span>
                    </div>
                    <div style={{ padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700' }}>MOTIVACIÓN</span>
                      <span style={{ fontSize: '18px', fontWeight: '900', display: 'block', color: latestAnalysis.motivation_score > 55 ? 'var(--success)' : 'var(--warning)' }}>{latestAnalysis.motivation_score}%</span>
                    </div>
                    <div style={{ padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700' }}>AGOTAMIENTO</span>
                      <span style={{ fontSize: '18px', fontWeight: '900', display: 'block', color: latestAnalysis.burnout_score > 60 ? 'var(--warning)' : 'var(--success)' }}>{latestAnalysis.burnout_score}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
              <div className="glass-card">
                <h3 style={{ fontSize: '15px', fontWeight: '900', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={17} style={{ color: 'var(--accent)' }} /> Curva de Ánimo Histórica
                </h3>
                {chartData.length === 0 ? (
                  <div style={{ height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)', fontSize: '12.5px' }}>Registra una reflexión para ver tu evolución.</div>
                ) : (
                  <div style={{ width: '100%', height: '200px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="fecha" stroke="var(--text-muted)" fontSize={10} />
                        <YAxis stroke="var(--text-muted)" fontSize={10} domain={[0, 100]} />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                        <Line type="monotone" dataKey="Estrés" stroke="var(--danger)" strokeWidth={2.5} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="Motivación" stroke="var(--success)" strokeWidth={2.5} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="glass-card">
                <h3 style={{ fontSize: '15px', fontWeight: '900', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <History size={17} /> Historial de Reflexiones y Tests
                </h3>
                <div style={{ display: 'grid', gap: '10px', maxHeight: '220px', overflowY: 'auto' }}>
                  {history.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center' }}>No hay reflexiones previas.</p>
                  ) : (
                    history.map((ref) => (
                      <div key={ref.id} className="futuristic-card-item">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '10.5px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>{new Date(ref.created_at).toLocaleDateString()}</span>
                          <span style={{ fontWeight: '800', color: ref.dominant_sentiment === 'Positivo' ? 'var(--success)' : 'var(--danger)' }}>{ref.dominant_sentiment}</span>
                        </div>
                        <p style={{ fontSize: '12px', fontStyle: 'italic' }}>"{ref.original_text}"</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* TAB 2: TAREAS (VISTA LISTA Y TABLERO KANBAN INTERACTIVO) */}
        {activeTab === 'tareas' && (
          <div className="glass-card animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ClipboardList size={18} style={{ color: 'var(--primary)' }} /> Gestor Institucional de Tareas
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Organiza tus actividades en lista o en el tablero Kanban. +20 XP por entrega.</p>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ display: 'flex', backgroundColor: 'var(--bg-secondary)', padding: '3px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <button onClick={() => setTaskViewMode('list')} className={`duo-pill ${taskViewMode === 'list' ? 'selected' : ''}`} style={{ padding: '4px 12px', fontSize: '11px' }}>
                    📋 Lista
                  </button>
                  <button onClick={() => setTaskViewMode('kanban')} className={`duo-pill ${taskViewMode === 'kanban' ? 'selected' : ''}`} style={{ padding: '4px 12px', fontSize: '11px' }}>
                    📊 Tablero Kanban
                  </button>
                </div>
              </div>
            </div>

            {/* Modal de Detalle y Entrega de Tarea */}
            {selectedTaskModal && (
              <div style={{
                backgroundColor: 'var(--bg-primary)',
                border: '2px solid var(--primary)',
                borderRadius: '18px',
                padding: '22px',
                marginBottom: '20px',
                boxShadow: 'var(--shadow-md)',
                animation: 'fadeIn 0.2s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '10px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                        {selectedTaskModal.category || 'Bienestar'}
                      </span>
                      <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '10px', backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
                        {selectedTaskModal.priority === 'Alta' ? '🔴 Prioridad Alta' : selectedTaskModal.priority === 'Baja' ? '🟢 Prioridad Baja' : '🟡 Prioridad Media'}
                      </span>
                      <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '10px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                        ⏱️ {selectedTaskModal.estimated_minutes || 15} min
                      </span>
                    </div>
                    <h3 style={{ fontSize: '17px', fontWeight: '900', color: 'var(--text-primary)' }}>
                      {selectedTaskModal.title}
                    </h3>
                  </div>
                  <button onClick={() => setSelectedTaskModal(null)} style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold' }}>×</button>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '16px', backgroundColor: 'var(--bg-secondary)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  {selectedTaskModal.description || 'Instrucción: Completa esta actividad para promover tu bienestar e integrarla en tu rutina personal.'}
                </p>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                    📝 Evidencia / Observaciones al Completar (Opcional):
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Escribe tus reflexiones, aprendizajes o comentarios sobre el resultado de esta actividad..."
                    value={taskSubmissionNote}
                    onChange={(e) => setTaskSubmissionNote(e.target.value)}
                    style={{ width: '100%', fontSize: '12.5px', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedTaskModal(null)}
                    className="btn btn-secondary"
                    style={{ padding: '10px 16px', fontSize: '12.5px', borderRadius: '10px' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleTaskStatus(selectedTaskModal.id, selectedTaskModal.status, taskSubmissionNote)}
                    className="btn btn-primary"
                    disabled={taskSubmitting}
                    style={{ padding: '10px 20px', fontSize: '12.5px', borderRadius: '10px', fontWeight: '900' }}
                  >
                    {taskSubmitting ? <Loader className="animate-spin" size={14} /> : '⚡ Entregar Tarea y Ganar +20 XP'}
                  </button>
                </div>
              </div>
            )}

            {tasksLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}><Loader className="animate-spin" size={20} /></div>
            ) : taskViewMode === 'kanban' ? (
              /* VISTA TABLERO KANBAN ESTILO JIRA (4 COLUMNAS INTERACTIVAS DRAG & DROP) */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '14px', alignItems: 'start' }}>
                
                {/* Definición de Columnas Kanban */}
                {[
                  { key: 'todo', title: '📌 Por Hacer', color: 'var(--primary)', filter: t => (t.board_column === 'todo' || !t.board_column) && t.status !== 'completada' },
                  { key: 'in_progress', title: '⏳ En Proceso', color: 'var(--warning)', filter: t => t.board_column === 'in_progress' },
                  { key: 'in_review', title: '📝 En Revisión', color: 'var(--accent)', filter: t => t.board_column === 'in_review' },
                  { key: 'completed', title: '✅ Completadas', color: 'var(--success)', filter: t => t.board_column === 'completed' || t.status === 'completada' }
                ].map(col => {
                  const colTasks = tasks.filter(col.filter);
                  const isOver = dragOverCol === col.key;
                  return (
                    <div 
                      key={col.key}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        if (dragOverCol !== col.key) setDragOverCol(col.key);
                      }}
                      onDragLeave={() => {
                        if (dragOverCol === col.key) setDragOverCol(null);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOverCol(null);
                        const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
                        if (taskId) handleUpdateTaskColumn(taskId, col.key);
                      }}
                      style={{ 
                        backgroundColor: isOver ? 'var(--bg-tertiary)' : 'var(--bg-secondary)', 
                        borderRadius: '16px', 
                        padding: '14px', 
                        border: isOver ? '2px dashed var(--primary)' : '1px solid var(--border)',
                        boxShadow: isOver ? '0 0 15px rgba(99, 102, 241, 0.25)' : 'none',
                        transition: 'all 0.2s ease',
                        minHeight: '320px',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <h4 style={{ fontSize: '12.5px', fontWeight: '900', color: col.color, marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{col.title}</span>
                        <span style={{ fontSize: '10px', backgroundColor: 'var(--bg-primary)', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                          {colTasks.length}
                        </span>
                      </h4>

                      {isOver && (
                        <div style={{ padding: '8px', marginBottom: '8px', borderRadius: '10px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontSize: '11px', fontWeight: '800', textAlign: 'center', border: '1px dashed var(--primary)' }}>
                          👇 Soltar tarjeta en {col.title}
                        </div>
                      )}

                      <div style={{ display: 'grid', gap: '8px', flex: 1, alignContent: 'start' }}>
                        {colTasks.length === 0 && !isOver ? (
                          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '11px', border: '1px dashed var(--border)', borderRadius: '10px' }}>
                            Arrastra una tarjeta aquí...
                          </div>
                        ) : (
                          colTasks.map(task => {
                            const isBeingDragged = draggedTaskId === task.id;
                            return (
                              <div 
                                key={task.id} 
                                draggable={true}
                                onDragStart={(e) => {
                                  e.dataTransfer.setData('text/plain', task.id);
                                  setDraggedTaskId(task.id);
                                }}
                                onDragEnd={() => {
                                  setDraggedTaskId(null);
                                  setDragOverCol(null);
                                }}
                                className="futuristic-card-item" 
                                style={{ 
                                  padding: '12px', 
                                  borderLeft: `4px solid ${col.color}`,
                                  cursor: 'grab',
                                  opacity: isBeingDragged ? 0.4 : 1,
                                  border: isBeingDragged ? '2px dashed var(--primary)' : undefined,
                                  transform: isBeingDragged ? 'scale(0.98)' : 'none',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                  <span style={{ fontSize: '9.5px', fontWeight: '800', padding: '2px 6px', borderRadius: '6px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                                    {task.category || 'Bienestar'}
                                  </span>
                                  <span style={{ fontSize: '11px' }}>🖐️</span>
                                </div>
                                
                                <h5 style={{ fontSize: '12.5px', fontWeight: '800', textDecoration: col.key === 'completed' ? 'line-through' : 'none' }}>
                                  {task.title}
                                </h5>
                                
                                {task.description && (
                                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0', lineHeight: '1.3' }}>
                                    {task.description}
                                  </p>
                                )}

                                <div style={{ display: 'flex', gap: '4px', marginTop: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
                                  {col.key === 'completed' ? (
                                    <span style={{ fontSize: '10px', color: 'var(--success)', fontWeight: '800' }}>+20 XP Ganados ⚡</span>
                                  ) : col.key === 'in_review' ? (
                                    <button onClick={() => setSelectedTaskModal(task)} className="duo-pill selected" style={{ width: '100%', justifyContent: 'center', fontSize: '10px', padding: '4px 6px' }}>
                                      ⚡ Entregar (+20 XP)
                                    </button>
                                  ) : (
                                    <span style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>Arrastra para mover ➔</span>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : tasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No tienes tareas asignadas.</div>
            ) : (
              /* VISTA LISTA TRADICIONAL */
              <div style={{ display: 'grid', gap: '12px' }}>
                {tasks.map((task) => (
                  <div key={task.id} className="futuristic-card-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                      <button 
                        onClick={() => handleToggleTaskStatus(task.id, task.status)} 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: task.status === 'completada' ? 'var(--success)' : 'var(--text-muted)' }}
                      >
                        {task.status === 'completada' ? <CheckCircle2 size={26} /> : <div style={{ width: '24px', height: '24px', borderRadius: '6px', border: '2px solid var(--border)' }} />}
                      </button>
                      
                      <div>
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '4px', alignItems: 'center' }}>
                          <span style={{ fontSize: '9px', fontWeight: '800', padding: '2px 6px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>{task.category || 'Bienestar'}</span>
                          <span style={{ fontSize: '9px', fontWeight: '800', padding: '2px 6px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>{task.priority === 'Alta' ? '🔴 Alta' : task.priority === 'Baja' ? '🟢 Baja' : '🟡 Media'}</span>
                          <span style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-muted)' }}>⏱️ {task.estimated_minutes || 15} min</span>
                        </div>
                        <h4 style={{ fontSize: '14px', fontWeight: '800', textDecoration: task.status === 'completada' ? 'line-through' : 'none', color: task.status === 'completada' ? 'var(--text-muted)' : 'var(--text-primary)' }}>{task.title}</h4>
                        {task.description && <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{task.description}</p>}
                      </div>
                    </div>

                    <button onClick={() => { setSelectedTaskModal(task); setTaskSubmissionNote(task.submission_notes || ''); }} className="duo-pill" style={{ padding: '6px 12px', fontSize: '11.5px' }}>
                      <span>Ver Detalles / Entregar</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MÓDULO DE GAMIFICACIÓN PROFESIONAL Y MI PROGRESO 🏆 */}
        {activeTab === 'progress' && (
          <MyProgress onBack={() => setActiveTab('bienestar')} />
        )}

        {/* NUEVO MÓDULO 2: AGENDA DE CITAS Y SESIONES DE ACOMPAÑAMIENTO 1 A 1 📅 */}
        {activeTab === 'appointments' && (
          <div className="grid grid-2 animate-fade" style={{ alignItems: 'start' }}>
            <div className="glass-card">
              <h3 style={{ fontSize: '16px', fontWeight: '900', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} style={{ color: 'var(--primary)' }} /> Agendar Sesión de Apoyo 1 a 1
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Reserva un espacio confidencial con la Psicóloga institucional de apoyo.
              </p>

              {apptMsg && <div style={{ backgroundColor: 'var(--success-light)', border: '1px solid var(--success)', color: 'var(--success)', padding: '10px', borderRadius: '8px', fontSize: '12.5px', marginBottom: '14px' }}>{apptMsg}</div>}

              <form onSubmit={handleCreateAppointment}>
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '800', marginBottom: '6px', display: 'block' }}>SELECCIONAR FECHA:</label>
                  <CustomDatePicker
                    value={apptDate}
                    onChange={(val) => setApptDate(val)}
                    placeholder="Seleccionar fecha para tu cita..."
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '800', marginBottom: '6px', display: 'block' }}>HORARIO DE DISPONIBILIDAD:</label>
                  <CustomSelect
                    options={[
                      { value: '09:00', label: '09:00 AM (Turno Mañana)', icon: '⏰' },
                      { value: '10:00', label: '10:00 AM (Turno Mañana)', icon: '⏰' },
                      { value: '11:00', label: '11:00 AM (Turno Mañana)', icon: '⏰' },
                      { value: '14:00', label: '02:00 PM (Turno Tarde)', icon: '⏰' },
                      { value: '16:00', label: '04:00 PM (Turno Tarde)', icon: '⏰' }
                    ]}
                    value={apptTime}
                    onChange={(val) => setApptTime(val)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '800' }}>MOTIVO DE LA CONSULTA:</label>
                  <input type="text" placeholder="Ej. Estrés laboral, orientación académica o respiración" value={apptReason} onChange={(e) => setApptReason(e.target.value)} required style={{ borderRadius: '8px' }} />
                </div>

                <button type="submit" className="btn btn-primary" disabled={apptLoading} style={{ width: '100%', padding: '12px', borderRadius: '10px', fontWeight: '900' }}>
                  {apptLoading ? <Loader className="animate-spin" size={16} /> : '📅 Confirmar y Reservar Cita Privada'}
                </button>
              </form>
            </div>

            <div className="glass-card">
              <h3 style={{ fontSize: '16px', fontWeight: '900', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} style={{ color: 'var(--accent)' }} /> Tus Citas Programadas
              </h3>
              <div style={{ display: 'grid', gap: '10px', maxHeight: '380px', overflowY: 'auto' }}>
                {appointments.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '12.5px', textAlign: 'center' }}>No tienes citas reservadas actualmente.</p>
                ) : (
                  appointments.map(a => (
                    <div key={a.id} className="futuristic-card-item" style={{ padding: '14px', borderLeft: '4px solid var(--primary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '800' }}>{a.professional_name}</span>
                        <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '8px', backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>{a.status}</span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{a.reason}</p>
                      <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '800', marginTop: '6px', display: 'block' }}>
                        📆 {new Date(a.date_time).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* NUEVO MÓDULO 3: MURO DE RECONOCIMIENTO Y KUDOS 💖 */}
        {activeTab === 'kudos' && (
          <div className="grid grid-2 animate-fade" style={{ alignItems: 'start' }}>
            <div className="glass-card">
              <h3 style={{ fontSize: '16px', fontWeight: '900', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Heart size={18} style={{ color: 'var(--danger)' }} /> Publicar un Kudo de Gratitud
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                Reconoce públicamente o de forma anónima el esfuerzo de un compañero de equipo. (+10 XP)
              </p>

              {kudoMsg && <div style={{ backgroundColor: 'var(--success-light)', border: '1px solid var(--success)', color: 'var(--success)', padding: '10px', borderRadius: '8px', fontSize: '12.5px', marginBottom: '14px' }}>{kudoMsg}</div>}

              <form onSubmit={handleCreateKudos}>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '800' }}>SELECCIONAR COMPAÑERO / DEPARTAMENTO:</label>
                  <select 
                    value={kudoReceiver}
                    onChange={(e) => {
                      setKudoReceiver(e.target.value);
                      const targetMem = members.find(m => `${m.first_name} ${m.last_name}` === e.target.value);
                      if (targetMem) setKudoDept(targetMem.department || 'General');
                    }}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', fontSize: '12.5px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                  >
                    <option value="">-- Seleccionar Compañero de la Lista --</option>
                    {members.map(m => (
                      <option key={m.id} value={`${m.first_name} ${m.last_name}`}>{m.first_name} {m.last_name} ({m.department || 'General'})</option>
                    ))}
                    <option value="Equipo General">Toda la Institución / Equipo</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '800' }}>TIPO DE INSIGNIA / RECONOCIMIENTO:</label>
                  <select value={kudoBadge} onChange={(e) => setKudoBadge(e.target.value)} style={{ borderRadius: '8px', width: '100%', padding: '10px', fontSize: '12.5px' }}>
                    <option value="Gratitud">💖 Gratitud & Agradecimiento</option>
                    <option value="Compañerismo">🤝 Compañerismo & Empatía</option>
                    <option value="Resiliencia">🌿 Resiliencia & Apoyo</option>
                    <option value="Liderazgo">⭐ Liderazgo Inspirador</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '800' }}>MENSAJE DE RECONOCIMIENTO:</label>
                  <textarea rows="3" placeholder="Escribe tus palabras de gratitud..." value={kudoMessage} onChange={(e) => setKudoMessage(e.target.value)} required style={{ borderRadius: '8px' }} />
                </div>

                <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" id="anon" checked={kudoAnonymous} onChange={(e) => setKudoAnonymous(e.target.checked)} />
                  <label htmlFor="anon" style={{ fontSize: '12px', cursor: 'pointer' }}>Enviar de forma anónima 🕵️‍♂️</label>
                </div>

                <button type="submit" className="btn btn-primary" disabled={kudoLoading} style={{ width: '100%', padding: '12px', borderRadius: '10px', fontWeight: '900' }}>
                  {kudoLoading ? <Loader className="animate-spin" size={16} /> : '💖 Publicar Kudo en el Muro (+10 XP)'}
                </button>
              </form>
            </div>

            <div className="glass-card">
              <h3 style={{ fontSize: '16px', fontWeight: '900', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} style={{ color: 'var(--accent)' }} /> Muro de Gratitud Comunitario
              </h3>
              <div style={{ display: 'grid', gap: '12px', maxHeight: '420px', overflowY: 'auto' }}>
                {kudosList.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '12.5px', textAlign: 'center' }}>Sé el primero en enviar un Kudo de gratitud.</p>
                ) : (
                  kudosList.map(k => (
                    <div key={k.id} className="futuristic-card-item" style={{ padding: '14px', borderLeft: '4px solid var(--accent)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12.5px', fontWeight: '900', color: 'var(--primary)' }}>
                          {k.sender_name} ➔ <span style={{ color: 'var(--text-primary)' }}>{k.receiver_name}</span>
                        </span>
                        <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '8px', backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
                          {k.badge_type}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-primary)', fontStyle: 'italic', margin: '4px 0' }}>"{k.message}"</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '6px' }}>
                        <span>{new Date(k.created_at).toLocaleDateString()}</span>
                        <span>❤️ {k.likes_count} Reacciones</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TESTS Y CUESTIONARIOS MULTIMODALES */}
        {activeTab === 'evaluations' && (
          <div className="grid grid-2 animate-fade" style={{ alignItems: 'start' }}>
            
            {/* Lista de Tests Habilitados */}
            <div className="glass-card">
              <h3 style={{ fontSize: '17px', fontWeight: '900', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} style={{ color: 'var(--primary)' }} /> Tests de la Institución
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
                Completa tus evaluaciones pendientes para ganar +50 XP y mantener tu racha.
              </p>

              {evaluationsLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><Loader className="animate-spin" size={18} /></div>
              ) : evaluations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)' }}>No hay tests activos en tu institución.</div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {evaluations.map((ev) => {
                    const isCompleted = history.some(ref => ref.evaluation_id === ev.id);
                    return (
                      <div 
                        key={ev.id} 
                        className="futuristic-card-item"
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontSize: '9px', fontWeight: '800', padding: '2px 8px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>{ev.category}</span>
                            {isCompleted && (
                              <span style={{ fontSize: '9px', fontWeight: '800', padding: '2px 8px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <CheckCircle2 size={8} /> Completado
                              </span>
                            )}
                          </div>
                          <h4 style={{ fontSize: '14.5px', fontWeight: '800' }}>{ev.title}</h4>
                          {ev.description && <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{ev.description}</p>}
                        </div>

                        {isCompleted ? (
                          <button
                            onClick={() => { setSelectedEval(ev); }}
                            className="duo-pill"
                            style={{ fontSize: '12px' }}
                          >
                            Ver Diagnóstico
                          </button>
                        ) : (
                          <button
                            onClick={() => { setSelectedEval(ev); setTestAnswers({}); setEvalSuccessMsg(''); setEvalErrorMsg(''); setActiveView('fill_test'); }}
                            className="duo-pill selected"
                            style={{ fontSize: '12px' }}
                          >
                            Responder Test ⚡
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Diagnóstico de Test ya Completado */}
            <div className="glass-card">
              <h3 style={{ fontSize: '17px', fontWeight: '900', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={18} style={{ color: 'var(--accent)' }} /> Análisis y Sugerencia de IA
              </h3>

              {!selectedEval ? (
                <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)', fontSize: '13px', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)' }}>
                  Selecciona un test completado para ver su análisis.
                </div>
              ) : !history.some(ref => ref.evaluation_id === selectedEval.id) ? (
                <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)', fontSize: '13px', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)' }}>
                  Este test aún no está completado. Presiona "Responder Test" para ir al espacio gamificado.
                </div>
              ) : (
                <div className="animate-fade">
                  {(() => {
                    const matchedRef = history.find(ref => ref.evaluation_id === selectedEval.id);
                    return (
                      <div>
                        <div style={{ marginBottom: '16px', pb: '10px', borderBottom: '1px solid var(--border)' }}>
                          <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--success)', textTransform: 'uppercase' }}>Análisis Procesado por Gemini AI</span>
                          <h4 style={{ fontSize: '15px', fontWeight: '800', marginTop: '2px' }}>{selectedEval.title}</h4>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
                          <div style={{ padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', textAlign: 'center', border: '1px solid var(--border)' }}>
                            <span style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: '700' }}>ESTRÉS</span>
                            <span style={{ fontSize: '16px', fontWeight: '900', display: 'block', color: 'var(--danger)', marginTop: '4px' }}>{matchedRef.stress_score}%</span>
                          </div>
                          <div style={{ padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', textAlign: 'center', border: '1px solid var(--border)' }}>
                            <span style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: '700' }}>MOTIVACIÓN</span>
                            <span style={{ fontSize: '16px', fontWeight: '900', display: 'block', color: 'var(--success)', marginTop: '4px' }}>{matchedRef.motivation_score}%</span>
                          </div>
                          <div style={{ padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', textAlign: 'center', border: '1px solid var(--border)' }}>
                            <span style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: '700' }}>AGOTAMIENTO</span>
                            <span style={{ fontSize: '16px', fontWeight: '900', display: 'block', color: 'var(--warning)', marginTop: '4px' }}>{matchedRef.burnout_score}%</span>
                          </div>
                        </div>
                        <div style={{ padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: '12px' }}>
                          <h5 style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '6px' }}>Tu Respuesta Multimodal Estructurada:</h5>
                          {formatMultimodalText(matchedRef.original_text)}
                        </div>
                        <div style={{ padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                          <h5 style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>Consejo Orientador de IA:</h5>
                          <p style={{ fontSize: '12.5px', color: 'var(--text-primary)', lineHeight: '1.4' }}>{matchedRef.institution_suggestion || 'Reflexión registrada en la plataforma.'}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 4: CHAT CON IA */}
        {activeTab === 'chat_ia' && (
          <div className="animate-fade" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="glow-card" style={{ marginBottom: '20px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Bot size={24} style={{ color: 'var(--primary)' }} />
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '900' }}>Orientador de Bienestar IA</h3>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Soporte conversacional de Gemini basado en tu historial.</p>
                </div>
              </div>
            </div>

            <div className="chat-container" style={{ height: '420px' }}>
              <div className="chat-messages">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`chat-bubble ${msg.sender}`}>
                    <p style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>
                  </div>
                ))}
                {chatLoading && <div className="chat-bubble ai"><Loader className="animate-spin" size={14} /> Gemini está respondiendo...</div>}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSendChatMessage} className="chat-input-area">
                <input type="text" placeholder="Conversa con la IA sobre tus sensaciones de hoy..." value={userInput} onChange={(e) => setUserInput(e.target.value)} disabled={chatLoading} />
                <button type="submit" className="btn btn-primary" disabled={chatLoading || !userInput.trim()} style={{ padding: '0 16px' }}><SendHorizontal size={16} /></button>
              </form>
            </div>
          </div>
        )}

        {/* ALERTA DE SISTEMA FLOTANTE GLASSMORPHIC */}
        <SystemAlert alert={systemAlert} onClose={() => setSystemAlert({ ...systemAlert, show: false })} />

      </main>
    </div>
  );
};

export default MemberDashboard;
