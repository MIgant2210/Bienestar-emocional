import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { 
  Sun, Moon, LogOut, Send, History, Heart, Brain, Smile, Activity, 
  AlertCircle, CheckCircle2, ClipboardList, Sparkles, MessageSquare, 
  SendHorizontal, Bot, User, Loader, Calendar, ClipboardCheck, Sliders, Check, 
  HelpCircle, Mic, MicOff, ArrowLeft, FileAudio, Volume2, Play, Square, CheckCircle,
  Flame, Zap, Award, ThumbsUp, ThumbsDown, Palette, Trophy, Bell, Settings as SettingsIcon,
  UserPlus, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DrawingCanvas from '../components/DrawingCanvas';
import CustomSelect from '../components/CustomSelect';
import CustomDatePicker from '../components/CustomDatePicker';
import SystemAlert from '../components/SystemAlert';
import GamificationWidget from '../components/GamificationWidget';
import NotificationCenter from '../components/NotificationCenter';
import TestResponseViewer from '../components/TestResponseViewer';
import ColibriMascot from '../components/ColibriMascot';
import StarryBackground from '../components/StarryBackground';
import MyProgress from './MyProgress';
import MyWellbeing from './MyWellbeing';
import { useNavigate } from 'react-router-dom';

const TAB_TO_URL = {
  bienestar: '/mi-bienestar',
  tasks: '/tareas',
  tareas: '/tareas',
  evaluations: '/tests',
  clinical_appointments: '/agenda',
  appointments: '/agenda',
  progress: '/mi-progreso',
  kudos: '/kudos',
  chat_ia: '/chatbot-ia'
};

const MemberDashboard = ({ initialTab }) => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme, colorPalette, changePalette, PALETTES } = useContext(ThemeContext);
  const navigate = useNavigate();

  // Tab State inside Dashboard
  const [activeTab, setActiveTab] = useState(initialTab || 'progress');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    const targetUrl = TAB_TO_URL[tabKey];
    if (targetUrl) {
      navigate(targetUrl);
    }
  };

  // System Alert Toast State
  const [systemAlert, setSystemAlert] = useState({ show: false, type: 'info', title: '', message: '' });
  const showAlert = (type, title, message) => {
    setSystemAlert({ show: true, type, title, message });
  };

  // Scroll ref for appointments
  const apptFormRef = useRef(null);
  const paletteMenuRef = useRef(null);
  
  // State para menú de paletas y notificaciones
  const [showPaletteMenu, setShowPaletteMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!showPaletteMenu) return;
    const handleOutsidePalette = (e) => {
      if (paletteMenuRef.current && !paletteMenuRef.current.contains(e.target)) {
        setShowPaletteMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsidePalette);
    return () => document.removeEventListener('mousedown', handleOutsidePalette);
  }, [showPaletteMenu]);

  // View state: 'dashboard' o 'fill_test'
  const [activeView, setActiveView] = useState('dashboard');
  
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
  const [targetWellbeingResourceId, setTargetWellbeingResourceId] = useState(null);

  const handleOpenTaskResource = (resId) => {
    setTargetWellbeingResourceId(resId);
    setSelectedTaskModal(null);
    handleTabChange('bienestar');
  };

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

  // Chat & Grupos de Trabajo States
  const [members, setMembers] = useState([]);
  const [kudosList, setKudosList] = useState([]);
  const [chatChannel, setChatChannel] = useState('general'); // 'general', 'kudos', 'group', 'direct'
  const [kudoReceiverName, setKudoReceiverName] = useState('');
  const [kudoDept, setKudoDept] = useState('General');
  const [kudoMessage, setKudoMessage] = useState('');
  const [kudoBadge, setKudoBadge] = useState('Gratitud');
  const [kudoAnonymous, setKudoAnonymous] = useState(false);
  const [kudoLoading, setKudoLoading] = useState(false);
  const [kudoMsg, setKudoMsg] = useState('');
  const [groupsList, setGroupsList] = useState(() => {
    try {
      const saved = localStorage.getItem('equilibrIA_groups');
      return saved ? JSON.parse(saved) : [
        { id: 'g_1', name: 'Comité de Clima y Bienestar', members: ['Todos'] },
        { id: 'g_2', name: 'Equipo de Proyectos e Innovación', members: ['Equipo'] }
      ];
    } catch(e) {
      return [{ id: 'g_1', name: 'Comité de Clima y Bienestar', members: ['Todos'] }];
    }
  });
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupMembers, setNewGroupMembers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const modernEmojis = ['😊', '🚀', '👍', '❤️', '💡', '🔥', '🙏', '🎉', '⭐', '💪', '👏', '😄', '🌟', '✨', '🧠', '💬', '💯', '🤝', '🙌', '🎯', '🍀', '🌈', '☕', '🎁'];

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    const newG = {
      id: `g_${Date.now()}`,
      name: newGroupName.trim(),
      members: newGroupMembers
    };
    setGroupsList(prev => {
      const updated = [...prev, newG];
      try { localStorage.setItem('equilibrIA_groups', JSON.stringify(updated)); } catch(err){}
      return updated;
    });
    setNewGroupName('');
    setNewGroupMembers([]);
    setShowCreateGroupModal(false);
    setSelectedGroup(newG);
    setChatChannel('group');
    showAlert('success', 'Grupo Creado', `¡Grupo "${newG.name}" creado exitosamente!`);
  };

  // Evaluaciones / Tests Guiados (Módulo 4 Multimodal)
  const [evaluations, setEvaluations] = useState([]);
  const [evaluationsLoading, setEvaluationsLoading] = useState(false);
  const [selectedEval, setSelectedEval] = useState(null);
  
  // Respuestas dinámicas por pregunta en el Test
  const [testAnswers, setTestAnswers] = useState({});
  const [evalSubmitLoading, setEvalSubmitLoading] = useState(false);
  const [evalSuccessMsg, setEvalSuccessMsg] = useState('');
  const [evalErrorMsg, setEvalErrorMsg] = useState('');

  // Estados para experiencia de evaluación interactiva Paso a Paso y Mascota Colibrí
  const [testStep, setTestStep] = useState('intro'); // 'intro' | 'question'
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [mascotMood, setMascotMood] = useState('welcome');

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

  const cleanEvalTitle = (title) => {
    if (!title) return '';
    return title.replace(/^\[Plantilla(?:\s+Express)?\]\s*/i, '').replace(/^Plantilla\s+/i, '').trim();
  };

  const fetchTasks = async () => {
    setTasksLoading(true);
    try {
      const response = await api.get('/tasks');
      setTasks(response.data || []);
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
      setEvaluations(response.data || []);
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
    if (!user || user.role === 'miembro') return;
    try {
      const response = await api.get('/institutions/members');
      setMembers(response.data || []);
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
    if (!kudoMessage.trim()) {
      showAlert('warning', 'Mensaje Requerido', 'Por favor ingresa un mensaje para enviar.');
      return;
    }
    setKudoLoading(true);
    setKudoMsg('');

    let targetReceiver = kudoReceiverName;
    if (chatChannel === 'general') {
      targetReceiver = 'Canal General EquilibrIA';
    } else if (chatChannel === 'kudos') {
      targetReceiver = 'Muro de Gratitud e Insignias';
    } else if (chatChannel === 'group' && selectedGroup) {
      targetReceiver = selectedGroup.name;
    }

    try {
      await api.post('/kudos', {
        receiver_name: targetReceiver || 'Canal General',
        receiver_department: kudoDept || 'General',
        message: kudoMessage,
        badge_type: kudoBadge,
        is_anonymous: kudoAnonymous
      });
      setXpPoints(prev => prev + 10);
      setKudoMsg('¡Mensaje publicado exitosamente! (+10 XP)');
      showAlert('success', 'Mensaje Enviado', '¡Mensaje compartido exitosamente! (+10 XP)');
      setKudoMessage('');
      fetchKudos();
    } catch (err) {
      showAlert('danger', 'Error al Enviar', err.response?.data?.message || err.message);
    } finally {
      setKudoLoading(false);
    }
  };

  const fetchDashboardBundle = async () => {
    try {
      const response = await api.get('/wellbeing/dashboard-bundle');
      const data = response.data;
      if (data.history) setHistory(data.history);
      if (data.tasks) setTasks(data.tasks);
      if (data.evaluations) setEvaluations(data.evaluations);
      if (data.xp !== undefined) setXpPoints(data.xp);
      if (data.streak !== undefined) setStreakDays(data.streak);
    } catch (err) {
      console.warn('Fallback a llamadas individuales:', err);
      fetchHistory();
      fetchTasks();
      fetchEvaluations();
    }
  };

  useEffect(() => {
    fetchDashboardBundle();
    // Cargas diferidas para módulos secundarios
    Promise.allSettled([fetchRewards(), fetchAppointments(), fetchKudos(), fetchMembers(), fetchTasks()]);
  }, []);

  useEffect(() => {
    if (activeTab === 'tareas' || activeTab === 'tasks') {
      fetchTasks();
    } else if (activeTab === 'evaluations' || activeTab === 'tests') {
      fetchEvaluations();
    }
  }, [activeTab]);

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
      setChatMessages(prev => [...prev, { 
        sender: 'ai', 
        text: response.data.reply,
        is_emergency: response.data.is_emergency,
        citations: response.data.citations || []
      }]);
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

  // RENDER PANTALLA EXCLUSIVA DE TEST PASO A PASO CON MASCOTA COLIBRÍ
  if (activeView === 'fill_test' && selectedEval) {
    const questions = selectedEval.questions || [];
    const totalQ = questions.length;
    const currentQ = questions[currentQuestionIndex] || {};
    const isCurrentAnswered = testAnswers[currentQ.id] !== undefined && testAnswers[currentQ.id] !== '';
    const answeredCount = questions.filter(q => testAnswers[q.id] !== undefined && testAnswers[q.id] !== '').length;
    const progressPercent = totalQ > 0 ? Math.round(((currentQuestionIndex + (isCurrentAnswered ? 1 : 0)) / totalQ) * 100) : 0;

    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'var(--page-bg)', 
        backgroundColor: 'var(--bg-primary)',
        paddingBottom: '60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }} className="animate-fade">
        
        {/* Cielo Estrellado Oficial de EquilibrIA */}
        <StarryBackground isLogin={false} />

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

        {/* Modal de Confirmación antes de Finalizar */}
        {showConfirmModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
          }} className="animate-fade">
            <div className="glass-card" style={{
              maxWidth: '460px',
              width: '100%',
              padding: '32px 28px',
              textAlign: 'center',
              borderRadius: '24px',
              border: '2px solid var(--border)',
              boxShadow: 'var(--shadow-lg)'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Sparkles size={30} />
              </div>

              <h3 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '8px' }}>
                ¿Deseas finalizar el test?
              </h3>

              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '24px' }}>
                Has respondido las preguntas de la evaluación. Una vez enviado, tus respuestas serán procesadas de forma confidencial y recibirás tu diagnóstico con <strong>+50 XP</strong>.
              </p>

              {evalErrorMsg && (
                <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '10px', borderRadius: '12px', marginBottom: '16px', fontSize: '12.5px', fontWeight: '700' }}>
                  {evalErrorMsg}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: '12px', borderRadius: '14px', fontWeight: '800' }}
                  disabled={evalSubmitLoading}
                >
                  Revisar
                </button>
                <button
                  type="button"
                  onClick={handleSubmitTestForm}
                  className="btn btn-primary"
                  style={{ padding: '12px', borderRadius: '14px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  disabled={evalSubmitLoading}
                >
                  {evalSubmitLoading ? <Loader className="animate-spin" size={16} /> : <><span>Sí, Enviar</span><CheckCircle2 size={16} /></>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cabecera Fija Superior con Progreso y Gamificación */}
        <div style={{
          width: '100%',
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          padding: '12px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: 'var(--shadow-sm)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(10px)'
        }}>
          <button 
            onClick={() => { setActiveView('dashboard'); setSelectedEval(null); setTestStep('intro'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontWeight: '800',
              fontSize: '13px'
            }}
          >
            <ArrowLeft size={16} />
            <span>Salir del Test</span>
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span className="duo-streak-badge">
              <Flame size={14} />
              <span>{streakDays} DÍAS</span>
            </span>

            <span className="duo-xp-badge">
              <Zap size={14} />
              <span>{xpPoints} XP</span>
            </span>

            {testStep === 'question' && totalQ > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '800' }}>
                  {progressPercent}%
                </span>
                <div style={{ width: '120px', height: '8px', backgroundColor: 'var(--bg-primary)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: 'var(--primary)', transition: 'width 0.3s ease' }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CONTENEDOR PRINCIPAL CENTRADO Y AMPLIO EN PC */}
        <div style={{ 
          width: '100%', 
          maxWidth: '1060px', 
          margin: 'auto 0',
          padding: '40px 24px', 
          position: 'relative', 
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          
          {/* PASO 1: PANTALLA INTRODUCTORIA / ENCABEZADO DEL TEST */}
          {testStep === 'intro' && (
            <div className="animate-fade" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 340px) 1fr', gap: '32px', alignItems: 'center' }}>
              
              {/* Mascota Colibrí en estado de bienvenida */}
              <ColibriMascot 
                mood="welcome" 
                customMessage="¡Hola! Te acompañaré paso a paso en esta evaluación. Responde con calma y sinceridad. 🌿"
                progressPercent={0}
              />

              {/* Tarjeta de Encabezado */}
              <div className="glass-card" style={{
                padding: '40px 36px',
                borderRadius: '24px',
                border: '2px solid var(--border)',
                borderBottom: '6px solid var(--primary)',
                boxShadow: 'var(--shadow-lg)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '900', padding: '4px 12px', borderRadius: '20px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', textTransform: 'uppercase' }}>
                    {selectedEval.category}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>
                    Evaluación de Bienestar
                  </span>
                </div>
                
                <h1 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: '10px' }}>
                  {selectedEval.title}
                </h1>
                
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
                  {selectedEval.description || 'Evaluación guiada de bienestar emocional con preguntas dinámicas interactivas. Tus reflexiones nos permitirán ofrecerte mejores recomendaciones.'}
                </p>

                {/* Chips de Información del Test */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '28px' }}>
                  <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '8px 14px', borderRadius: '12px', fontSize: '12.5px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📋</span>
                    <span>{totalQ} preguntas interactivas</span>
                  </div>
                  <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '8px 14px', borderRadius: '12px', fontSize: '12.5px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>⏱️</span>
                    <span>~{Math.max(2, Math.round(totalQ * 0.6))} minutos estimados</span>
                  </div>
                  <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '8px 14px', borderRadius: '12px', fontSize: '12.5px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Zap size={14} />
                    <span>+50 XP de recompensa</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setTestStep('question');
                    setCurrentQuestionIndex(0);
                    setMascotMood('thinking');
                  }}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '16px 24px',
                    fontSize: '15px',
                    borderRadius: '16px',
                    fontWeight: '900',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: 'var(--shadow-md)'
                  }}
                >
                  <span>Comenzar Evaluación</span>
                  <ChevronRight size={18} />
                </button>
              </div>

            </div>
          )}

          {/* PASO 2: PREGUNTAS INDIVIDUALES (UNA A LA VEZ) */}
          {testStep === 'question' && currentQ && (
            <div className="animate-fade" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 340px) 1fr', gap: '32px', alignItems: 'flex-start' }}>
              
              {/* Mascota Colibrí en el lateral */}
              <div style={{ position: 'sticky', top: '80px' }}>
                <ColibriMascot 
                  mood={mascotMood}
                  progressPercent={progressPercent}
                />
              </div>

              {/* Tarjeta de la Pregunta Actual */}
              <div className="glass-card" style={{
                padding: '38px 36px',
                borderRadius: '24px',
                border: '2px solid var(--border)',
                borderLeft: isCurrentAnswered ? '6px solid var(--success)' : '2px solid var(--border)',
                boxShadow: 'var(--shadow-md)'
              }}>
                {/* Header de la Pregunta */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: isCurrentAnswered ? 'var(--success-light)' : 'var(--primary-light)',
                      color: isCurrentAnswered ? 'var(--success)' : 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '900',
                      fontSize: '13.5px'
                    }}>
                      {currentQuestionIndex + 1}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Pregunta {currentQuestionIndex + 1} de {totalQ}
                    </span>
                  </div>

                  {isCurrentAnswered && (
                    <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--success)', backgroundColor: 'var(--success-light)', padding: '3px 10px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={12} /> Respondida
                    </span>
                  )}
                </div>

                {/* Enunciado */}
                <h2 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-primary)', lineHeight: '1.45', marginBottom: '24px' }}>
                  {currentQ.question}
                </h2>

                {/* COMPONENTES DE RESPUESTA POR TIPO */}
                <div style={{ marginBottom: '32px' }}>
                  
                  {/* Tipo Texto con Dictado por Voz */}
                  {currentQ.type === 'text' && (
                    <div>
                      <textarea
                        rows="5"
                        placeholder="Escribe tu reflexión o presiona 'Hablar por Micrófono' para dictar por voz en tiempo real..."
                        value={testAnswers[currentQ.id] || ''}
                        onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                        style={{ resize: 'vertical', width: '100%', marginBottom: '14px', borderRadius: '14px', padding: '14px', fontSize: '14px', lineHeight: '1.5' }}
                      />

                      <div>
                        {isRecording && activeRecordingQId === currentQ.id ? (
                          <button
                            type="button"
                            onClick={stopRecordingSim}
                            className="btn"
                            style={{ backgroundColor: 'var(--danger)', color: '#fff', fontSize: '13px', padding: '8px 18px', borderRadius: '24px' }}
                          >
                            <Square size={14} />
                            <span>Detener Grabación ({recordingSeconds}s)</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startRecordingSim(currentQ.id)}
                            className="duo-pill"
                          >
                            <Mic size={15} style={{ color: 'var(--primary)' }} />
                            <span>Hablar por Micrófono (Voz a Texto)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Escala Numérica 1 a 5 o 1 a 10 */}
                  {(currentQ.type === 'scale_1_5' || currentQ.type === 'scale_1_10') && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>
                        <span>Mínimo (1)</span>
                        <span>{currentQ.type === 'scale_1_10' ? 'Máximo (10)' : 'Máximo (5)'}</span>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: currentQ.type === 'scale_1_10' ? 'repeat(5, 1fr)' : 'repeat(5, 1fr)', gap: '10px' }}>
                        {(currentQ.type === 'scale_1_10' ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] : [1, 2, 3, 4, 5]).map((val) => {
                          const isSelected = testAnswers[currentQ.id] === val;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => handleAnswerChange(currentQ.id, val)}
                              className={`duo-card ${isSelected ? 'selected' : ''}`}
                              style={{ justifyContent: 'center', padding: '16px 8px', fontSize: '17px', fontWeight: '900', borderRadius: '14px' }}
                            >
                              <span>{val}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Escala de 5 Emojis de Ánimo */}
                  {currentQ.type === 'emoji_scale_5' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>
                        <span>😡 Muy Bajo / Difícil</span>
                        <span>😁 Excelente / Pleno</span>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                        {[
                          { emoji: '😡', label: 'Molesto' },
                          { emoji: '🙁', label: 'Agotado' },
                          { emoji: '😐', label: 'Neutral' },
                          { emoji: '🙂', label: 'Tranquilo' },
                          { emoji: '😁', label: 'Excelente' }
                        ].map((item, eIdx) => {
                          const isSelected = testAnswers[currentQ.id] === `${item.emoji} ${item.label}` || testAnswers[currentQ.id] === item.label;
                          return (
                            <button
                              key={eIdx}
                              type="button"
                              onClick={() => handleAnswerChange(currentQ.id, `${item.emoji} ${item.label}`)}
                              className={`duo-card ${isSelected ? 'selected' : ''}`}
                              style={{ justifyContent: 'center', padding: '14px 6px', flexDirection: 'column', gap: '6px', borderRadius: '16px' }}
                            >
                              <span style={{ fontSize: '30px' }}>{item.emoji}</span>
                              <span style={{ fontSize: '11px', fontWeight: '800' }}>{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Dibujo / Canvas */}
                  {currentQ.type === 'drawing' && (
                    <div>
                      <DrawingCanvas 
                        savedImage={testAnswers[currentQ.id] || ''}
                        onSaveDrawing={(dataUrl) => handleAnswerChange(currentQ.id, dataUrl)}
                      />
                    </div>
                  )}

                  {/* Opción Booleana (Sí / No) */}
                  {currentQ.type === 'boolean' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <button
                        type="button"
                        onClick={() => handleAnswerChange(currentQ.id, 'Sí')}
                        className={`duo-card ${testAnswers[currentQ.id] === 'Sí' ? 'selected' : ''}`}
                        style={{ justifyContent: 'center', padding: '18px', fontSize: '15px', fontWeight: '900', borderRadius: '14px' }}
                      >
                        <ThumbsUp size={20} />
                        <span>Sí</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAnswerChange(currentQ.id, 'No')}
                        className={`duo-card ${testAnswers[currentQ.id] === 'No' ? 'selected' : ''}`}
                        style={{ justifyContent: 'center', padding: '18px', fontSize: '15px', fontWeight: '900', borderRadius: '14px' }}
                      >
                        <ThumbsDown size={20} />
                        <span>No</span>
                      </button>
                    </div>
                  )}

                  {/* Opciones de Selección Única */}
                  {currentQ.type === 'single_choice' && Array.isArray(currentQ.options) && (
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {currentQ.options.map((opt, oIdx) => {
                        const isSelected = testAnswers[currentQ.id] === opt;
                        return (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() => handleAnswerChange(currentQ.id, opt)}
                            className={`duo-card ${isSelected ? 'selected' : ''}`}
                            style={{ padding: '14px 18px', fontSize: '14px', fontWeight: '800', textAlign: 'left', borderRadius: '14px' }}
                          >
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* BARRA DE NAVEGACIÓN INFERIOR (ANTERIOR / SIGUIENTE) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (currentQuestionIndex > 0) {
                        setCurrentQuestionIndex(prev => prev - 1);
                        setMascotMood('thinking');
                      } else {
                        setTestStep('intro');
                        setMascotMood('welcome');
                      }
                    }}
                    className="btn btn-secondary"
                    style={{ padding: '12px 20px', borderRadius: '14px', fontWeight: '800', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <ChevronLeft size={16} />
                    <span>{currentQuestionIndex === 0 ? 'Volver al Inicio' : 'Anterior'}</span>
                  </button>

                  {currentQuestionIndex < totalQ - 1 ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (!isCurrentAnswered) return;
                        setCurrentQuestionIndex(prev => prev + 1);
                        if (currentQuestionIndex + 1 === totalQ - 1) {
                          setMascotMood('almost_done');
                        } else {
                          setMascotMood('thinking');
                        }
                      }}
                      className="btn btn-primary"
                      disabled={!isCurrentAnswered}
                      style={{ padding: '12px 24px', borderRadius: '14px', fontWeight: '900', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <span>Siguiente</span>
                      <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (!isCurrentAnswered) return;
                        setShowConfirmModal(true);
                      }}
                      className="btn btn-primary"
                      disabled={!isCurrentAnswered}
                      style={{ padding: '12px 24px', borderRadius: '14px', fontWeight: '900', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--success)', borderColor: 'var(--success)' }}
                    >
                      <span>Finalizar Test</span>
                      <CheckCircle2 size={16} />
                    </button>
                  )}
                </div>

              </div>

            </div>
          )}

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

          {/* Centro de Notificaciones */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => { setShowNotifications(!showNotifications); setShowPaletteMenu(false); }}
              className="theme-toggle"
              style={{ border: '1px solid var(--border)', width: '36px', height: '36px', borderRadius: '50%', position: 'relative' }}
              title="Centro de Notificaciones"
            >
              <Bell size={16} style={{ color: 'var(--primary)' }} />
            </button>
            <NotificationCenter isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
          </div>

          {/* Botón Selector de Paletas de Colores 🎨 */}
          <div ref={paletteMenuRef} style={{ position: 'relative' }}>
            <button 
              onClick={() => { setShowPaletteMenu(!showPaletteMenu); setShowNotifications(false); }}
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

          {/* Botón Acceso a Configuración */}
          <button 
            onClick={() => navigate('/configuracion')} 
            className="theme-toggle" 
            style={{ border: '1px solid var(--border)', width: '36px', height: '36px', borderRadius: '50%' }} 
            title="Configuración de la Cuenta y Privacidad"
          >
            <SettingsIcon size={15} style={{ color: 'var(--text-primary)' }} />
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
          <button className={`tab-btn ${activeTab === 'bienestar' ? 'active' : ''}`} onClick={() => handleTabChange('bienestar')}><Brain size={15} /><span>Mi Bienestar</span></button>
          <button className={`tab-btn ${activeTab === 'tareas' || activeTab === 'tasks' ? 'active' : ''}`} onClick={() => handleTabChange('tasks')}><ClipboardList size={15} /><span>Mis Tareas</span>{tasks.filter(t => t.status === 'pendiente').length > 0 && <span style={{ backgroundColor: 'var(--danger)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: 'var(--radius-full)', fontWeight: 'bold' }}>{tasks.filter(t => t.status === 'pendiente').length}</span>}</button>
          <button className={`tab-btn ${activeTab === 'evaluations' ? 'active' : ''}`} onClick={() => handleTabChange('evaluations')}><Calendar size={15} /><span>Tests</span>{evaluations.length > 0 && <span style={{ backgroundColor: 'var(--primary)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: 'var(--radius-full)', fontWeight: 'bold' }}>{evaluations.length}</span>}</button>
          <button className={`tab-btn ${activeTab === 'progress' ? 'active' : ''}`} onClick={() => handleTabChange('progress')}><Trophy size={15} /><span>Mi Progreso</span></button>
          <button className={`tab-btn ${activeTab === 'appointments' || activeTab === 'clinical_appointments' ? 'active' : ''}`} onClick={() => handleTabChange('clinical_appointments')}><Calendar size={15} /><span>Citas 1 a 1</span></button>
          <button className={`tab-btn ${activeTab === 'kudos' ? 'active' : ''}`} onClick={() => handleTabChange('kudos')}><MessageSquare size={15} /><span>Chat & Grupos</span></button>
          <button className={`tab-btn ${activeTab === 'chat_ia' ? 'active' : ''}`} onClick={() => handleTabChange('chat_ia')}><Sparkles size={15} /><span>Asistente IA</span></button>
        </div>

        {/* TAB 1: MI BIENESTAR INTEGRAL */}
        {activeTab === 'bienestar' && (
          <MyWellbeing 
            onNavigateToTab={(tab) => handleTabChange(tab)} 
            initialResourceId={targetWellbeingResourceId}
            onResourceCompleted={() => {
              fetchTasks();
              setTargetWellbeingResourceId(null);
            }}
          />
        )}

        {/* TAB 2: TAREAS (VISTA LISTA Y TABLERO KANBAN INTERACTIVO) */}
        {(activeTab === 'tareas' || activeTab === 'tasks') && (
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
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
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

                {/* Recurso de Bienestar Vinculado con Acción Directa */}
                {selectedTaskModal.resource && (
                  <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.08)', border: '1.5px solid var(--primary)', borderRadius: '14px', padding: '14px 16px', marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={14} /> Recurso de Bienestar Vinculado:
                    </div>
                    <div style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {selectedTaskModal.resource.title} ({selectedTaskModal.resource.resource_type})
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                      Al abrir y completar este recurso en el reproductor interactivo de bienestar, esta tarea se validará y completará automáticamente (+20 XP).
                    </p>
                    {selectedTaskModal.status !== 'completada' ? (
                      <button
                        type="button"
                        onClick={() => handleOpenTaskResource(selectedTaskModal.resource.id || selectedTaskModal.resource_id)}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '10px 14px', fontSize: '12.5px', fontWeight: '900', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        <Play size={14} /> Realizar Recurso Ahora en Mi Bienestar
                      </button>
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={16} /> Ya completaste y validaste este recurso con éxito
                      </span>
                    )}
                  </div>
                )}

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

                                {/* Recurso de Bienestar Vinculado */}
                                {task.resource && (
                                  <div style={{ marginTop: '6px', padding: '6px 8px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                    <div style={{ fontSize: '10px', fontWeight: '900', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: task.status !== 'completada' ? '5px' : '0' }}>
                                      <span>🧘</span>
                                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.resource.title}</span>
                                    </div>
                                    {task.status !== 'completada' && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenTaskResource(task.resource.id || task.resource_id);
                                        }}
                                        className="btn btn-primary"
                                        style={{ width: '100%', padding: '4px 6px', fontSize: '10px', fontWeight: '900', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                                      >
                                        <Play size={10} /> Realizar Recurso
                                      </button>
                                    )}
                                  </div>
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
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '9px', fontWeight: '800', padding: '2px 6px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>{task.category || 'Bienestar'}</span>
                          <span style={{ fontSize: '9px', fontWeight: '800', padding: '2px 6px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>{task.priority === 'Alta' ? '🔴 Alta' : task.priority === 'Baja' ? '🟢 Baja' : '🟡 Media'}</span>
                          <span style={{ fontSize: '9px', fontWeight: '800', color: 'var(--text-muted)' }}>⏱️ {task.estimated_minutes || 15} min</span>
                          {task.resource && (
                            <span style={{ fontSize: '9.5px', fontWeight: '800', padding: '2px 8px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              🧘 Vinculada a: {task.resource.title}
                            </span>
                          )}
                        </div>
                        <h4 style={{ fontSize: '14px', fontWeight: '800', textDecoration: task.status === 'completada' ? 'line-through' : 'none', color: task.status === 'completada' ? 'var(--text-muted)' : 'var(--text-primary)' }}>{task.title}</h4>
                        {task.description && <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{task.description}</p>}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {task.resource && task.status !== 'completada' && (
                        <button
                          type="button"
                          onClick={() => handleOpenTaskResource(task.resource.id || task.resource_id)}
                          className="btn btn-primary"
                          style={{ padding: '6px 12px', fontSize: '11.5px', fontWeight: '900', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Play size={12} /> Realizar Recurso
                        </button>
                      )}
                      <button onClick={() => { setSelectedTaskModal(task); setTaskSubmissionNote(task.submission_notes || ''); }} className="duo-pill" style={{ padding: '6px 12px', fontSize: '11.5px' }}>
                        <span>Ver Detalles / Entregar</span>
                      </button>
                    </div>
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
        {(activeTab === 'appointments' || activeTab === 'clinical_appointments') && (
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
                        <span style={{ fontSize: '13px', fontWeight: '800' }}>{a.professional_name || 'Psicóloga Institucional'}</span>
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

        {/* NUEVO MÓDULO 3: CHAT DE EQUIPO, SALAS Y GRUPOS DE TRABAJO 💬 */}
        {activeTab === 'kudos' && (
          <div className="glass-card animate-fade" style={{ padding: '0', overflow: 'hidden', borderRadius: '24px', border: '1px solid var(--border)', height: '650px', display: 'flex' }}>
            
            {/* Panel Izquierdo: Directorio de Canales, Grupos y Colegas */}
            <div style={{ width: '300px', backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-tertiary)' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={16} style={{ color: 'var(--primary)' }} /> Chat & Grupos de Equipo
                </h4>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Canales de interacción y bienestar</span>

                <button 
                  type="button"
                  onClick={() => setShowCreateGroupModal(true)} 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: '10px', padding: '8px 12px', fontSize: '11.5px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: '800' }}
                >
                  <UserPlus size={14} /> ＋ Crear Grupo de Trabajo
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'grid', gap: '6px' }}>
                <button 
                  type="button"
                  onClick={() => { setChatChannel('general'); setSelectedGroup(null); }}
                  className={`duo-card ${chatChannel === 'general' ? 'selected' : ''}`}
                  style={{ justifyContent: 'flex-start', padding: '10px 12px', gap: '10px' }}
                >
                  <span style={{ fontSize: '20px' }}>💬</span>
                  <div style={{ textAlign: 'left' }}>
                    <h5 style={{ fontSize: '13px', fontWeight: '800' }}>Canal General EquilibrIA</h5>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Comunidad Institucional</span>
                  </div>
                </button>

                <button 
                  type="button"
                  onClick={() => { setChatChannel('kudos'); setSelectedGroup(null); }}
                  className={`duo-card ${chatChannel === 'kudos' ? 'selected' : ''}`}
                  style={{ justifyContent: 'flex-start', padding: '10px 12px', gap: '10px' }}
                >
                  <span style={{ fontSize: '20px' }}>💖</span>
                  <div style={{ textAlign: 'left' }}>
                    <h5 style={{ fontSize: '13px', fontWeight: '800' }}>Muro de Gratitud e Insignias</h5>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Reconocimientos comunitarios</span>
                  </div>
                </button>

                {/* Sección de Grupos de Trabajo */}
                <div style={{ fontSize: '10.5px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '12px', padding: '0 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>GRUPOS DE TRABAJO ({groupsList.length})</span>
                </div>
                {groupsList.map(g => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      setSelectedGroup(g);
                      setChatChannel('group');
                    }}
                    className={`duo-card ${selectedGroup?.id === g.id && chatChannel === 'group' ? 'selected' : ''}`}
                    style={{ justifyContent: 'flex-start', padding: '8px 10px', gap: '10px' }}
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '14px' }}>
                      👥
                    </div>
                    <div style={{ textAlign: 'left', flex: 1, overflow: 'hidden' }}>
                      <h5 style={{ fontSize: '12.5px', fontWeight: '800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.name}</h5>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{g.members?.length || 0} integrantes</span>
                    </div>
                  </button>
                ))}

                {/* Sección del Directorio de Compañeros */}
                <div style={{ fontSize: '10.5px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '12px', padding: '0 6px' }}>
                  DIRECTORIO DE COMPAÑEROS ({members.length})
                </div>

                {members.map(m => (
                  <button 
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setKudoReceiverName(`${m.first_name} ${m.last_name}`);
                      setChatChannel('direct');
                      setSelectedGroup(null);
                    }}
                    className={`duo-card ${kudoReceiverName === `${m.first_name} ${m.last_name}` && chatChannel === 'direct' ? 'selected' : ''}`}
                    style={{ justifyContent: 'flex-start', padding: '8px 10px', gap: '10px' }}
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '12px' }}>
                      {m.first_name?.[0]}{m.last_name?.[0]}
                    </div>
                    <div style={{ textAlign: 'left', flex: 1, overflow: 'hidden' }}>
                      <h5 style={{ fontSize: '12.5px', fontWeight: '800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.first_name} {m.last_name}</h5>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{m.department || 'General'}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Panel Derecho: Sala de Chat Stream de Bienestar con Entrada Fija */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)', height: '100%' }}>
              
              {/* Cabecera de la Sala Activa */}
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '16px' }}>
                    {chatChannel === 'general' ? '💬' : chatChannel === 'kudos' ? '💖' : chatChannel === 'group' ? '👥' : '👤'}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14.5px', fontWeight: '900' }}>
                      {chatChannel === 'general' ? 'Canal General EquilibrIA' : chatChannel === 'kudos' ? 'Muro de Gratitud e Insignias' : chatChannel === 'group' ? selectedGroup?.name || 'Grupo de Trabajo' : `Chat Directo con ${kudoReceiverName || 'Compañero'}`}
                    </h4>
                    <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: '700' }}>● En línea • Mensajería Cifrada de Equipo</span>
                  </div>
                </div>
              </div>

              {/* Historial de Mensajes con Scroll Interno Aislado por Sala */}
              <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: 'var(--bg-primary)' }}>
                {(() => {
                  const currentRoomMessages = (kudosList || []).filter((k) => {
                    if (chatChannel === 'general') {
                      return k.receiver_name === 'Canal General EquilibrIA' || k.receiver_name === 'Comunidad General' || !k.receiver_name;
                    }
                    if (chatChannel === 'kudos') {
                      return k.receiver_name === 'Muro de Gratitud e Insignias' || k.badge_type === 'Gratitud' || k.receiver_name === 'Muro de Gratitud';
                    }
                    if (chatChannel === 'group') {
                      return selectedGroup && (k.receiver_name === selectedGroup.name || k.receiver_name === `Grupo: ${selectedGroup.name}`);
                    }
                    if (chatChannel === 'direct') {
                      return (
                        (k.sender_name === `${user?.first_name} ${user?.last_name}` && k.receiver_name === kudoReceiverName) ||
                        (k.sender_name === kudoReceiverName && (k.receiver_name === `${user?.first_name} ${user?.last_name}` || k.receiver_name === user?.email)) ||
                        k.receiver_name === kudoReceiverName
                      );
                    }
                    return true;
                  });

                  if (currentRoomMessages.length === 0) {
                    return (
                      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '13px' }}>
                        No hay mensajes en esta sala de chat. ¡Sé el primero en escribir un mensaje a tus compañeros!
                      </div>
                    );
                  }

                  return currentRoomMessages.map((k) => {
                    const isMe = k.sender_id === user?.id || k.sender_name === `${user?.first_name} ${user?.last_name}`;
                    return (
                      <div key={k.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                        <div className={isMe ? 'chat-bubble-sender' : 'chat-bubble-receiver'} style={{ maxWidth: '75%', padding: '12px 16px', borderRadius: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '11.5px', fontWeight: '900', opacity: 0.9 }}>
                              {isMe ? 'Tú' : k.sender_name} ➔ <span style={{ textDecoration: 'underline' }}>{k.receiver_name}</span>
                            </span>
                            <span style={{ fontSize: '9.5px', padding: '2px 6px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.2)', fontWeight: '800' }}>
                              {k.badge_type}
                            </span>
                          </div>
                          <p style={{ fontSize: '13px', lineHeight: '1.45', margin: '4px 0', whiteSpace: 'pre-wrap' }}>{k.message}</p>
                          <span style={{ fontSize: '9.5px', opacity: 0.7, display: 'block', textAlign: 'right', marginTop: '4px' }}>
                            {new Date(k.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Entrada Fija al Pie de Bienestar con Selector de Emojis */}
              <form onSubmit={handleCreateKudos} style={{ padding: '14px 20px', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative' }}>
                
                {/* Paleta Emergente de Emojis Modernos */}
                {showEmojiPicker && (
                  <div style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '20px',
                    marginBottom: '10px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1.5px solid var(--border)',
                    borderRadius: '18px',
                    padding: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    zIndex: 9999,
                    width: '300px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(6, 1fr)',
                    gap: '8px'
                  }}>
                    {modernEmojis.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setKudoMessage(prev => prev + emoji);
                          setShowEmojiPicker(false);
                        }}
                        style={{
                          fontSize: '22px',
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          borderRadius: '8px',
                          padding: '4px',
                          transition: 'transform 0.15s ease'
                        }}
                        className="calendar-day-box"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)' }}>Insignia / Categoría:</span>
                  {['Gratitud', 'Compañerismo', 'Resiliencia', 'Liderazgo'].map(b => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setKudoBadge(b)}
                      className={`duo-pill ${kudoBadge === b ? 'selected' : ''}`}
                      style={{ fontSize: '11px', padding: '3px 8px' }}
                    >
                      {b}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {/* Botón Emergente de Emojis */}
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="theme-toggle"
                    style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--border)', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Insertar Emojis"
                  >
                    <Smile size={20} style={{ color: 'var(--primary)' }} />
                  </button>

                  <input 
                    type="text" 
                    placeholder={chatChannel === 'direct' ? `Escribe un mensaje para ${kudoReceiverName}...` : chatChannel === 'group' ? `Mensaje para el grupo ${selectedGroup?.name}...` : "Escribe un mensaje para el equipo..."}
                    value={kudoMessage} 
                    onChange={(e) => setKudoMessage(e.target.value)} 
                    required 
                    style={{ flex: 1, borderRadius: '24px', padding: '12px 20px', fontSize: '13px', backgroundColor: 'var(--bg-primary)' }}
                  />
                  
                  <button type="submit" className="btn btn-primary" disabled={kudoLoading} style={{ borderRadius: '24px', padding: '10px 24px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {kudoLoading ? <Loader className="animate-spin" size={16} /> : <SendHorizontal size={16} />}
                    <span>Enviar</span>
                  </button>
                </div>
              </form>
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
                          <h4 style={{ fontSize: '14.5px', fontWeight: '800' }}>{cleanEvalTitle(ev.title)}</h4>
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
                            onClick={() => {
                              setSelectedEval(ev);
                              setTestAnswers({});
                              setTestStep('intro');
                              setCurrentQuestionIndex(0);
                              setMascotMood('welcome');
                              setEvalSuccessMsg('');
                              setEvalErrorMsg('');
                              setActiveView('fill_test');
                            }}
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
                          <h4 style={{ fontSize: '15px', fontWeight: '800', marginTop: '2px' }}>{cleanEvalTitle(selectedEval.title)}</h4>
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
                          <h5 style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '6px' }}>Tu Respuesta del Test y Boceto:</h5>
                          <TestResponseViewer rawText={matchedRef.original_text} userName="Mi Evaluación" date={matchedRef.created_at} />
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

        {/* TAB 4: CHAT CON IA (ESTÁTICO SIN ANIMACIONES MOLESTAS) */}
        {activeTab === 'chat_ia' && (
          <div className="animate-fade" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="glass-card" style={{ marginBottom: '20px', padding: '18px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '900', margin: 0 }}>Orientador de Bienestar IA</h3>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>Soporte conversacional de Gemini basado en tu historial.</p>
                </div>
              </div>
            </div>

            <div className="chat-container" style={{ height: '420px' }}>
              <div className="chat-messages">
                {chatMessages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`chat-bubble ${msg.sender}`}
                    style={msg.is_emergency ? { border: '2px solid var(--danger)', backgroundColor: 'var(--danger-light)', color: 'var(--text-primary)' } : {}}
                  >
                    <p style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>
                    {msg.citations && msg.citations.length > 0 && (
                      <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.1)', fontSize: '11px', opacity: 0.85 }}>
                        <strong>📚 Fuentes de referencia:</strong>
                        <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                          {msg.citations.map((c, cIdx) => (
                            <li key={cIdx}>
                              {c.title} {c.source && `• ${c.source}`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
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

        {/* MODAL CREAR GRUPO DE TRABAJO */}
        {showCreateGroupModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}>
            <div className="glass-card animate-scale" style={{ maxWidth: '480px', width: '100%', padding: '24px', borderRadius: '20px', border: '2px solid var(--primary)', backgroundColor: 'var(--bg-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserPlus size={18} style={{ color: 'var(--primary)' }} /> Crear Grupo de Trabajo
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCreateGroupModal(false)}
                  style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold' }}
                >
                  ×
                </button>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Crea un espacio de comunicación e interacción con tus colegas de equipo.
              </p>
              <form onSubmit={handleCreateGroup}>
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '800' }}>NOMBRE DEL GRUPO:</label>
                  <input
                    type="text"
                    placeholder="Ej. Equipo de Proyecto Alpha, Comité de Bienestar..."
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    required
                    style={{ borderRadius: '10px' }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '800' }}>SELECCIONAR INTEGRANTES:</label>
                  <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px', display: 'grid', gap: '6px' }}>
                    {members.map(m => (
                      <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer', padding: '4px 6px', borderRadius: '6px' }}>
                        <input
                          type="checkbox"
                          checked={newGroupMembers.includes(`${m.first_name} ${m.last_name}`)}
                          onChange={(e) => {
                            const name = `${m.first_name} ${m.last_name}`;
                            if (e.target.checked) setNewGroupMembers(prev => [...prev, name]);
                            else setNewGroupMembers(prev => prev.filter(n => n !== name));
                          }}
                        />
                        <span>{m.first_name} {m.last_name} ({m.department || 'General'})</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setShowCreateGroupModal(false)} className="btn btn-secondary" style={{ flex: 1, padding: '10px', borderRadius: '10px' }}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '10px', borderRadius: '10px', fontWeight: '900' }}>
                    Crear Grupo
                  </button>
                </div>
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
