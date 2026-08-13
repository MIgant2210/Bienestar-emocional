import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { 
  Sun, Moon, LogOut, ShieldAlert, Award, FileText, Users, BarChart3, 
  PlusCircle, Trash2, Calendar, ClipboardList, Sparkles, Loader, CheckCircle2,
  AlertTriangle, CheckSquare, Settings, Activity, ShieldCheck, Download,
  UserCheck, Lock, FileSpreadsheet, RefreshCw, RotateCcw, Zap, Layers, HelpCircle, Eye, Sliders,
  Target, ChevronRight, Check, ArrowLeft, Volume2, Mic, Bell, UserX, Key, Palette, Edit3, KeyRound, Heart, Bot, SendHorizontal, Building, MessageSquare, Smile, UserPlus, Plus, X, Printer, Trophy
} from 'lucide-react';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import DrawingCanvas from '../components/DrawingCanvas';
import CustomSelect from '../components/CustomSelect';
import CustomDatePicker from '../components/CustomDatePicker';
import SystemAlert from '../components/SystemAlert';
import GamificationWidget from '../components/GamificationWidget';
import MyProgress from './MyProgress';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme, colorPalette, changePalette, PALETTES } = useContext(ThemeContext);

  // System Alert Toast State
  const [systemAlert, setSystemAlert] = useState({ show: false, type: 'info', title: '', message: '' });
  const showAlert = (type, title, message) => {
    setSystemAlert({ show: true, type, title, message });
  };

  // Selected Submission Modal State (por colaborador individual)
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Reference for Appointment Form Scroll
  const apptFormRef = useRef(null);

  // Tab State: 'analytics', 'tasks', 'alerts', 'evaluations', 'members', 'audit', 'reports', 'ai_plans'
  const [activeTab, setActiveTab] = useState('analytics');

  // Sub-Tab State for Evaluations: 'active_tests', 'templates', 'create_custom'
  const [evalSubTab, setEvalSubTab] = useState('active_tests');

  // Sub-Tab State for Members: 'directory', 'roles_rbac'
  const [membersSubTab, setMembersSubTab] = useState('directory');

  // Style Chat & Group States
  const [chatChannel, setChatChannel] = useState('general'); // 'general', 'kudos', 'direct', 'group'
  const [chatColleague, setChatColleague] = useState(null);
  const [kudoReceiverName, setKudoReceiverName] = useState('');
  const [kudoBadge, setKudoBadge] = useState('Gratitud');
  const [kudoMessage, setKudoMessage] = useState('');
  const [kudoLoading, setKudoLoading] = useState(false);

  // Group Creation States (Persistidos en localStorage y Memoria)
  const [groupsList, setGroupsList] = useState(() => {
    try {
      const saved = localStorage.getItem('equilibrIA_groups');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'g1', name: 'Equipo de Bienestar 💡', members: ['Ana Martínez', 'Dra. Sofía Ramírez'] },
      { id: 'g2', name: 'Proyecto Innovación 🚀', members: ['Mateo Fernández', 'Carlos Mendoza'] }
    ];
  });
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupMembers, setNewGroupMembers] = useState([]);

  // Emoji Picker State
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

  // Paletas & Edición de Usuario
  const [showPaletteMenu, setShowPaletteMenu] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editRole, setEditRole] = useState('miembro');
  const [editDept, setEditDept] = useState('General');
  const [editPassword, setEditPassword] = useState('');
  const [userUpdateLoading, setUserUpdateLoading] = useState(false);
  const [userUpdateMsg, setUserUpdateMsg] = useState('');

  // Notification Drawer State (Generado 100% en vivo desde la base de datos Supabase)
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Módulo de Gestión de Instituciones y Departamentos States (Superadmin / Admins)
  const [allInstitutions, setAllInstitutions] = useState([]);
  const [newInstName, setNewInstName] = useState('');
  const [newInstType, setNewInstType] = useState('educativa');
  const [newDeptName, setNewDeptName] = useState('');
  const [selectedInstForDept, setSelectedInstForDept] = useState('');
  const [instCreateLoading, setInstCreateLoading] = useState(false);

  const handleNotificationClick = (notif) => {
    if (notif.targetTab) {
      setActiveTab(notif.targetTab);
    }
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, unread: false } : n));
    setShowNotifications(false);
  };

  // Roles RBAC Matrix State
  const [rolePermissions, setRolePermissions] = useState({
    superadmin: { alerts: true, create_tests: true, view_analytics: true, export_reports: true },
    psicologo: { alerts: true, create_tests: true, view_analytics: true, export_reports: false },
    lider_depto: { alerts: false, create_tests: false, view_analytics: true, export_reports: false },
    miembro: { alerts: false, create_tests: false, view_analytics: false, export_reports: false }
  });

  // States for all modules
  const [stats, setStats] = useState({
    averages: { stress: 0, motivation: 0, burnout: 0 },
    historical_trends: [],
    sentiment_distribution: { Positivo: 0, Neutro: 0, Negativo: 0 },
    total_members: 0
  });
  const [suggestions, setSuggestions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [members, setMembers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [kudosList, setKudosList] = useState([]);
  
  // Suite de 10 Reportes del Sistema States & Filtros Avanzados
  const [selectedReportId, setSelectedReportId] = useState('reporte_1_clima');
  const [allReportsData, setAllReportsData] = useState(null);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [reportDeptFilter, setReportDeptFilter] = useState('todos');
  const [reportStatusFilter, setReportStatusFilter] = useState('todos');
  const [reportRoleFilter, setReportRoleFilter] = useState('todos');
  
  // Chatbot IA States for Admin/SuperAdmin
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Hola, soy el orientador conversacional de bienestar de EquilibrIA. ¿En qué puedo asistirte u orientarte hoy?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    const messageText = userInput;
    setUserInput('');
    setChatMessages(prev => [...prev, { sender: 'user', text: messageText }]);
    setChatLoading(true);

    try {
      const response = await api.post('/analysis/chat', { message: messageText });
      setChatMessages(prev => [...prev, { sender: 'ai', text: response.data.reply }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { sender: 'ai', text: 'Error al conectar con el asistente de IA.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const [loading, setLoading] = useState(true);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(true);

  // Form States: Tasks
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskCategory, setTaskCategory] = useState('Bienestar');
  const [taskPriority, setTaskPriority] = useState('Media');
  const [taskEstMinutes, setTaskEstMinutes] = useState(15);
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskAssignedType, setTaskAssignedType] = useState('all');
  const [taskAssignedTarget, setTaskAssignedTarget] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [viewSubmissionsTask, setViewSubmissionsTask] = useState(null);

  // Form States: Clinical Diagnostic Notes & Analytics
  const [clinicalNotesMap, setClinicalNotesMap] = useState({});
  const [savingClinicalId, setSavingClinicalId] = useState(null);

  const handleSaveClinicalNotes = async (reflectionId) => {
    setSavingClinicalId(reflectionId);
    try {
      const noteText = clinicalNotesMap[reflectionId] || '';
      await api.put(`/evaluations/response/${reflectionId}/clinical-notes`, { clinical_notes: noteText });
      showAlert('success', 'Diagnóstico Guardado', '¡Nota diagnóstica manual guardada exitosamente!');
    } catch (err) {
      showAlert('danger', 'Error Diagnóstico', err.response?.data?.message || err.message);
    } finally {
      setSavingClinicalId(null);
    }
  };

  // Form States: Evaluations / Tests Custom
  const [evalTitle, setEvalTitle] = useState('');
  const [evalDesc, setEvalDesc] = useState('');
  const [evalCategory, setEvalCategory] = useState('Bienestar Integral');
  const [evalDate, setEvalDate] = useState('');
  const [evalAssignedType, setEvalAssignedType] = useState('all');
  const [evalAssignedTarget, setEvalAssignedTarget] = useState('');
  
  const [customQuestions, setCustomQuestions] = useState([
    { id: 'q1', question: '¿Cómo evalúas tu nivel general de energía o fatiga esta semana?', type: 'scale_1_5' },
    { id: 'q2', question: 'Describe factores clave que influyeron en tu estado de ánimo o clima.', type: 'text' }
  ]);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState('scale_1_5');
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalError, setEvalError] = useState('');
  const [evalSuccess, setEvalSuccess] = useState('');

  // Template Targeting States & Preview Modal
  const [templateTargets, setTemplateTargets] = useState({});
  const [previewTemplate, setPreviewTemplate] = useState(null);

  // Estado para Inspeccionar Respuestas y Métricas de un Test
  const [selectedTestAnalytics, setSelectedTestAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Estado para Vista Previa / Llenado de Test por Admin
  const [previewTest, setPreviewTest] = useState(null);
  const [previewAnswers, setPreviewAnswers] = useState({});
  const [previewSubmitLoading, setPreviewSubmitLoading] = useState(false);
  const [previewSuccess, setPreviewSuccess] = useState('');

  // Form States: Alert Resolution
  const [resolutionNotes, setResolutionNotes] = useState({});
  const [resolvingId, setResolvingId] = useState(null);

  // Form States: Clinical Appointments (Agenda de Citas Clínicas de la Psicóloga)
  const [appointments, setAppointments] = useState([]);
  const [apptUserId, setApptUserId] = useState('');
  const [apptDate, setApptDate] = useState('');
  const [apptTime, setApptTime] = useState('10:00');
  const [apptReason, setApptReason] = useState('Sesión de Orientación y Apoyo Emocional');
  const [apptNotes, setApptNotes] = useState('');
  const [apptLoading, setApptLoading] = useState(false);
  const [apptSuccessMsg, setApptSuccessMsg] = useState('');

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments');
      setAppointments(response.data);
    } catch (err) {
      console.error('Error al cargar citas clínicas:', err);
    }
  };

  const handleCreateApptManual = async (e) => {
    e.preventDefault();
    if (!apptUserId || !apptDate) {
      alert('Por favor selecciona el colaborador / paciente y la fecha de la cita.');
      return;
    }
    setApptLoading(true);
    setApptSuccessMsg('');
    try {
      const fullIso = `${apptDate}T${apptTime}:00`;
      await api.post('/appointments', {
        user_id: apptUserId,
        date_time: fullIso,
        reason: apptReason,
        clinical_notes: apptNotes
      });
      setApptSuccessMsg('¡Cita agendada exitosamente en la agenda del profesional! 📅');
      setApptDate('');
      setApptNotes('');
      fetchAppointments();
    } catch (err) {
      alert('Error al agendar cita: ' + (err.response?.data?.message || err.message));
    } finally {
      setApptLoading(false);
    }
  };

  const handleUpdateApptStatus = async (apptId, newStatus, currentNotes) => {
    try {
      await api.put(`/appointments/${apptId}/status`, {
        status: newStatus,
        clinical_notes: currentNotes
      });
      fetchAppointments();
    } catch (err) {
      alert('Error al actualizar estado de la cita: ' + (err.response?.data?.message || err.message));
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, sugRes, tasksRes, alertsRes, evalsRes, templatesRes, membersRes, auditRes, reportRes, apptsRes, rewardsRes, kudosRes] = await Promise.allSettled([
        api.get('/institutions/dashboard'),
        api.get('/institutions/suggestions'),
        api.get('/tasks'),
        api.get('/alerts?status=pendiente'),
        api.get('/evaluations'),
        api.get('/evaluations/templates'),
        api.get('/institutions/members'),
        api.get('/audit/logs'),
        api.get('/reports/export'),
        api.get('/appointments'),
        api.get('/rewards'),
        api.get('/kudos')
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.data) setStats(statsRes.value.data);
      if (sugRes.status === 'fulfilled' && sugRes.value.data) setSuggestions(sugRes.value.data);
      if (tasksRes.status === 'fulfilled' && tasksRes.value.data) setTasks(tasksRes.value.data);
      if (alertsRes.status === 'fulfilled' && alertsRes.value.data) setAlerts(alertsRes.value.data);
      if (evalsRes.status === 'fulfilled' && evalsRes.value.data) setEvaluations(evalsRes.value.data);
      if (templatesRes.status === 'fulfilled' && templatesRes.value.data) setTemplates(templatesRes.value.data);
      if (membersRes.status === 'fulfilled' && membersRes.value.data) setMembers(membersRes.value.data);
      if (auditRes.status === 'fulfilled' && auditRes.value.data) setAuditLogs(auditRes.value.data);
      if (reportRes.status === 'fulfilled' && reportRes.value.data) setAllReportsData(reportRes.value.data);
      if (apptsRes.status === 'fulfilled' && apptsRes.value.data) setAppointments(apptsRes.value.data);
      if (rewardsRes.status === 'fulfilled' && rewardsRes.value.data) setRewards(rewardsRes.value.data);
      if (kudosRes.status === 'fulfilled' && kudosRes.value.data) setKudosList(kudosRes.value.data);
      fetchInstitutionsAll();
    } catch (err) {
      console.error('Error al cargar datos del administrador:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstitutionsAll = async () => {
    try {
      const res = await api.get('/institutions/all');
      setAllInstitutions(res.data);
    } catch (err) {
      console.error('Error al cargar instituciones:', err);
    }
  };

  const handleCreateInstitution = async (e) => {
    e.preventDefault();
    if (!newInstName.trim()) return;
    setInstCreateLoading(true);
    try {
      const res = await api.post('/institutions', {
        name: newInstName,
        type: newInstType
      });
      setNewInstName('');
      showAlert('success', 'Institución Creada', res.data.message);
      fetchInstitutionsAll();
    } catch (err) {
      showAlert('danger', 'Error de Creación', err.response?.data?.message || 'Error al crear institución.');
    } finally {
      setInstCreateLoading(false);
    }
  };

  // Generador Dinámico de Notificaciones 100% basadas en la Base de Datos Supabase
  useEffect(() => {
    const realNotifs = [];
    (alerts || []).forEach((al) => {
      realNotifs.push({
        id: `al_${al.id}`,
        text: `Alerta Emocional: ${al.user_name || 'Miembro'} requiere atención en depto ${al.user_department || 'General'}.`,
        time: 'Reciente',
        unread: al.status === 'pendiente',
        targetTab: 'alerts'
      });
    });
    (appointments || []).forEach((app) => {
      realNotifs.push({
        id: `app_${app.id}`,
        text: `Cita Clínica: Con ${app.user_name || 'Paciente'} (${new Date(app.date_time).toLocaleDateString()}).`,
        time: 'Programada',
        unread: app.status === 'pendiente',
        targetTab: 'clinical_appointments'
      });
    });
    (tasks || []).forEach((tk) => {
      realNotifs.push({
        id: `tk_${tk.id}`,
        text: `Tarea Institucional: "${tk.title}" (Prioridad: ${tk.priority}).`,
        time: 'Asignada',
        unread: false,
        targetTab: 'tasks'
      });
    });
    (kudosList || []).forEach((kd) => {
      realNotifs.push({
        id: `kd_${kd.id}`,
        text: `Muro Gratitud: ${kd.sender_name} envió reconocimiento "${kd.badge_type}".`,
        time: 'Comunidad',
        unread: false,
        targetTab: 'kudos'
      });
    });
    setNotifications(realNotifs);
  }, [alerts, appointments, tasks, kudosList]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (showPrivacyNotice) {
      const timer = setTimeout(() => {
        setShowPrivacyNotice(false);
      }, 20000); // 20 segundos sin desfasar el diseño
      return () => clearTimeout(timer);
    }
  }, [showPrivacyNotice]);

  const openEditUserModal = (u) => {
    setEditingUser(u);
    setEditRole(u.role || 'miembro');
    setEditDept(u.department || 'General');
    setEditPassword('');
    setUserUpdateMsg('');
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setUserUpdateLoading(true);
    setUserUpdateMsg('');
    try {
      const payload = {
        role: editRole,
        department: editDept,
        ...(editPassword.trim() ? { new_password: editPassword } : {})
      };
      const res = await api.put(`/institutions/members/${editingUser.id}`, payload);
      setUserUpdateMsg(res.data.message);
      setEditPassword('');
      const membersRes = await api.get('/institutions/members');
      if (membersRes.data) setMembers(membersRes.data);
      setTimeout(() => {
        setEditingUser(null);
        setUserUpdateMsg('');
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.message || 'Error al actualizar el usuario');
    } finally {
      setUserUpdateLoading(false);
    }
  };

  // Toggle Permiso en la Matriz RBAC
  const togglePermission = (roleKey, permKey) => {
    setRolePermissions(prev => ({
      ...prev,
      [roleKey]: {
        ...prev[roleKey],
        [permKey]: !prev[roleKey][permKey]
      }
    }));
  };

  // Crear Tarea
  const handleCreateTask = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');
    setCreateLoading(true);

    const payload = {
      title: taskTitle,
      description: taskDesc,
      category: taskCategory,
      priority: taskPriority,
      estimated_minutes: taskEstMinutes,
      due_date: taskDueDate || null,
      assigned_type: taskAssignedType,
      assigned_target: taskAssignedTarget
    };

    try {
      await api.post('/tasks', payload);
      setCreateSuccess('Tarea asignada y publicada exitosamente.');
      setTaskTitle('');
      setTaskDesc('');
      setTaskDueDate('');
      setTaskAssignedTarget('');
      
      const tasksRes = await api.get('/tasks');
      setTasks(tasksRes.data);
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Error al crear la tarea.');
    } finally {
      setCreateLoading(false);
    }
  };

  // Eliminar Tarea
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta tarea?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      console.error('Error al eliminar tarea:', err);
    }
  };

  // Atender Alerta Emocional (Módulo 7)
  const handleAttendAlert = async (alertId) => {
    const notes = resolutionNotes[alertId];
    if (!notes || notes.trim().length < 5) {
      alert('Por favor ingrese notas de atención de al menos 5 caracteres.');
      return;
    }
    
    setResolvingId(alertId);
    try {
      await api.put(`/alerts/${alertId}/attend`, { notes });
      setAlerts(prev => prev.filter(a => a.id !== alertId));
      setResolutionNotes(prev => {
        const copy = { ...prev };
        delete copy[alertId];
        return copy;
      });
      const statsRes = await api.get('/institutions/dashboard');
      if (statsRes.data) setStats(statsRes.data);
    } catch (err) {
      console.error('Error al atender la alerta:', err);
      alert(err.response?.data?.message || 'Error al atender la alerta.');
    } finally {
      setResolvingId(null);
    }
  };

  // Activar Plantilla Precargada de Test (1-Clic)
  const handleActivateTemplate = async (templateId) => {
    setEvalLoading(true);
    setEvalSuccess('');
    setEvalError('');
    
    const tplConfig = templateTargets[templateId] || { type: 'all', target: '' };

    try {
      const res = await api.post('/evaluations/activate-template', { 
        template_id: templateId,
        assigned_type: tplConfig.type,
        assigned_target: tplConfig.target
      });
      setEvalSuccess(res.data.message);
      setEvalSubTab('active_tests');
      const evalsRes = await api.get('/evaluations');
      setEvaluations(evalsRes.data);
    } catch (err) {
      setEvalError(err.response?.data?.message || 'Error al activar el test precargado.');
    } finally {
      setEvalLoading(false);
    }
  };

  const handleTemplateTargetChange = (tplId, key, val) => {
    setTemplateTargets(prev => {
      const current = prev[tplId] || { type: 'all', target: '' };
      return {
        ...prev,
        [tplId]: { ...current, [key]: val }
      };
    });
  };

  // Inspeccionar Respuestas y Métricas de un Test
  const handleViewTestResponses = async (evalId) => {
    setAnalyticsLoading(true);
    try {
      const res = await api.get(`/evaluations/${evalId}/responses`);
      setSelectedTestAnalytics(res.data);
    } catch (err) {
      console.error('Error al cargar respuestas del test:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Probar Llenado de Test (Modo Vista Previa / Prueba Admin)
  const handleAdminSubmitPreviewTest = async (e) => {
    e.preventDefault();
    if (!previewTest) return;

    setPreviewSubmitLoading(true);
    setPreviewSuccess('');

    const questions = previewTest.questions || [];
    const formattedParts = questions.map((q, idx) => {
      const ans = previewAnswers[q.id] || 'Sin respuesta';
      return `P${idx+1} [${q.question}]: ${ans}`;
    });

    const fullPayloadText = `[TEST COMPLETADO: ${previewTest.title} (${previewTest.category})] ${formattedParts.join(' | ')}`;

    try {
      await api.post('/analysis/submit', { text: fullPayloadText, evaluation_id: previewTest.id });
      setPreviewSuccess('¡Test completado en modo prueba! Respuesta registrada en analíticas.');
      setPreviewAnswers({});
      fetchDashboardData();
      setTimeout(() => {
        setPreviewTest(null);
      }, 2000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error al enviar la prueba.');
    } finally {
      setPreviewSubmitLoading(false);
    }
  };

  // Agregar Pregunta Personalizada
  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return;
    const newQ = {
      id: `q_${Date.now()}`,
      question: newQuestionText,
      type: newQuestionType
    };
    setCustomQuestions(prev => [...prev, newQ]);
    setNewQuestionText('');
  };

  // Eliminar una pregunta específica del creador
  const handleRemoveCustomQuestion = (qId) => {
    setCustomQuestions(prev => prev.filter(q => q.id !== qId));
  };

  // Programar Test Personalizado
  const handleCreateEvaluation = async (e) => {
    e.preventDefault();
    setEvalError('');
    setEvalSuccess('');
    setEvalLoading(true);

    const payload = {
      title: evalTitle,
      description: evalDesc,
      category: evalCategory,
      questions: customQuestions,
      scheduled_date: evalDate || null,
      assigned_type: evalAssignedType,
      assigned_target: evalAssignedTarget
    };

    try {
      await api.post('/evaluations', payload);
      setEvalSuccess('Test de evaluación personalizado programado exitosamente.');
      setEvalTitle('');
      setEvalDesc('');
      setEvalDate('');
      setEvalAssignedTarget('');
      setEvalSubTab('active_tests');
      
      const evalsRes = await api.get('/evaluations');
      setEvaluations(evalsRes.data);
    } catch (err) {
      setEvalError(err.response?.data?.message || 'Error al programar el test.');
    } finally {
      setEvalLoading(false);
    }
  };

  const setQuickDateEval = (daysFromNow) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    setEvalDate(d.toISOString().slice(0, 10));
  };

  const setQuickDateTask = (daysFromNow) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    setTaskDueDate(d.toISOString().slice(0, 10));
  };

  // Eliminar Test
  const handleDeleteEvaluation = async (evalId) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este test?')) return;
    try {
      await api.delete(`/evaluations/${evalId}`);
      setEvaluations(prev => prev.filter(ev => ev.id !== evalId));
      if (selectedTestAnalytics?.test_id === evalId) setSelectedTestAnalytics(null);
    } catch (err) {
      console.error('Error al eliminar el test:', err);
    }
  };

  // Publicar Mensaje o Kudo en el Chat entre Colegas
  const handleCreateKudos = async (e) => {
    e.preventDefault();
    if (!kudoMessage.trim()) return;
    setKudoLoading(true);

    let receiver = 'Canal General EquilibrIA';
    if (chatChannel === 'kudos') receiver = 'Muro de Gratitud e Insignias';
    else if (chatChannel === 'group') receiver = selectedGroup?.name || 'Grupo de Trabajo';
    else if (chatChannel === 'direct') receiver = kudoReceiverName || 'Compañero';

    try {
      await api.post('/kudos', {
        receiver_name: receiver,
        receiver_department: 'General',
        message: kudoMessage,
        badge_type: kudoBadge
      });
      setKudoMessage('');
      showAlert('success', 'Mensaje Enviado', `Mensaje enviado a ${receiver}`);
      const res = await api.get('/kudos');
      setKudosList(res.data);
    } catch (err) {
      showAlert('danger', 'Mensaje Bloqueado', err.response?.data?.message || 'Error al enviar mensaje.');
    } finally {
      setKudoLoading(false);
    }
  };

  // Obtener la Suite de 10 Reportes del Sistema con Filtros Avanzados
  const fetchAllReports = async () => {
    setReportsLoading(true);
    try {
      const params = {};
      if (reportStartDate) params.start_date = reportStartDate;
      if (reportEndDate) params.end_date = reportEndDate;
      if (reportDeptFilter && reportDeptFilter !== 'todos') params.department = reportDeptFilter;
      if (reportStatusFilter && reportStatusFilter !== 'todos') params.status = reportStatusFilter;
      if (reportRoleFilter && reportRoleFilter !== 'todos') params.role = reportRoleFilter;

      const res = await api.get('/reports/all', { params });
      setAllReportsData(res.data);
    } catch (err) {
      console.error('Error al cargar la suite de 10 reportes:', err);
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchAllReports();
    } else if (activeTab === 'institutions') {
      fetchInstitutionsAll();
    }
  }, [activeTab, reportStartDate, reportEndDate, reportDeptFilter, reportStatusFilter, reportRoleFilter]);

  // Exportar Reporte en PDF Ejecutivo con Plantilla Impresa Oficial
  const handleExportPDF = () => {
    if (!allReportsData) return;
    const currentReport = allReportsData[selectedReportId] || {};
    const filters = allReportsData.filtros_aplicados || {};
    const detailList = currentReport.detalle || currentReport.detalle_catalogo || [];

    const printWin = window.open('', '_blank');
    if (!printWin) return;

    // Generar filas de la tabla de detalles en HTML formateado corporativo
    const tableRowsHtml = detailList.length === 0
      ? `<tr><td colspan="5" style="text-align:center; padding:18px; color:#64748b;">No hay registros detallados disponibles para la consulta seleccionada.</td></tr>`
      : detailList.map((item, idx) => `
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:10px; font-weight:700;">${idx + 1}</td>
          <td style="padding:10px; font-weight:700; color:#0f172a;">${item.title || item.user_name || item.action || item.suggestion || item.reason || item.receiver_name || `Registro #${idx+1}`}</td>
          <td style="padding:10px; color:#475569;">${item.user_department || item.receiver_dept || item.department || item.category || item.role || 'General'}</td>
          <td style="padding:10px;"><span style="background:#e0e7ff; color:#4338ca; padding:3px 8px; border-radius:12px; font-size:11px; font-weight:700;">${item.status || item.risk_level || item.board_column || item.sentiment || 'Activo'}</span></td>
          <td style="padding:10px; color:#64748b;">${item.created_at ? new Date(item.created_at).toLocaleDateString() : item.date_time ? new Date(item.date_time).toLocaleDateString() : 'N/A'}</td>
        </tr>
      `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>EquilibrIA - ${currentReport.titulo || 'Informe Oficial'}</title>
        <style>
          @page { size: letter; margin: 15mm; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; background: #ffffff; margin: 0; padding: 24px; }
          .header-bar { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #6366f1; padding-bottom: 16px; margin-bottom: 24px; }
          .brand-title { font-size: 24px; font-weight: 900; color: #4f46e5; letter-spacing: -0.5px; }
          .brand-sub { font-size: 12px; color: #64748b; font-weight: 600; }
          .doc-badge { background: #e0e7ff; color: #4338ca; border: 1px solid #c7d2fe; padding: 4px 12px; border-radius: 20px; font-weight: 800; font-size: 11px; }
          .doc-title { font-size: 20px; font-weight: 900; color: #0f172a; margin-bottom: 12px; }
          .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 12px; }
          .section-title { font-size: 14px; font-weight: 800; color: #334155; margin-bottom: 12px; border-left: 4px solid #6366f1; padding-left: 8px; }
          .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
          .kpi-card { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 12px; text-align: center; }
          .kpi-num { font-size: 22px; font-weight: 900; color: #4f46e5; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 12px; }
          th { background: #f1f5f9; color: #475569; font-weight: 800; padding: 10px; text-align: left; border-bottom: 2px solid #cbd5e1; }
          .signature-section { margin-top: 40px; page-break-inside: avoid; display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #e2e8f0; padding-top: 30px; }
          .sig-box { width: 55%; }
          .sig-line { border-top: 2px solid #0f172a; width: 85%; margin-top: 40px; margin-bottom: 8px; }
          .stamp-box { border: 2px dashed #6366f1; background: #e0e7ff; color: #4338ca; padding: 16px; border-radius: 12px; text-align: center; font-size: 11px; font-weight: 800; width: 35%; }
          .footer { font-size: 10px; color: #94a3b8; text-align: center; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="header-bar">
          <div>
            <div class="brand-title">EquilibrIA Platform</div>
            <div class="brand-sub">Sistema de Análisis de Bienestar Emocional e Información Institucional</div>
          </div>
          <div class="doc-badge">DOCUMENTO OFICIAL AUDITADO</div>
        </div>

        <div class="doc-title">${currentReport.titulo || 'Informe Consolidados de Bienestar'}</div>

        <div class="meta-box">
          <div><strong>Institución Emisora:</strong> ${allReportsData.institucion || 'EquilibrIA Central'}</div>
          <div><strong>Fecha de Emisión:</strong> ${allReportsData.fecha_generacion}</div>
          <div><strong>Rango de Consulta:</strong> ${filters.fecha_inicio || 'Todo el Historial'} al ${filters.fecha_fin || 'Fecha Actual'}</div>
          <div><strong>Filtro de Departamento:</strong> ${filters.departamento || 'Todos'}</div>
        </div>

        <div class="section-title">Consolidado de Indicadores Ejecutivos</div>
        <div class="kpi-grid">
          <div class="kpi-card">
            <div style="font-size:11px; color:#64748b; font-weight:700;">REGISTROS ANALIZADOS</div>
            <div class="kpi-num">${detailList.length}</div>
          </div>
          <div class="kpi-card">
            <div style="font-size:11px; color:#64748b; font-weight:700;">ESTADO DE REVISIÓN</div>
            <div class="kpi-num" style="font-size:15px; margin-top:8px; color:#10b981;">AUDITADO</div>
          </div>
          <div class="kpi-card">
            <div style="font-size:11px; color:#64748b; font-weight:700;">VALIDEZ LEGAL</div>
            <div class="kpi-num" style="font-size:15px; margin-top:8px; color:#6366f1;">VIGENTE</div>
          </div>
          <div class="kpi-card">
            <div style="font-size:11px; color:#64748b; font-weight:700;">NIVEL DE ACCESO</div>
            <div class="kpi-num" style="font-size:15px; margin-top:8px; color:#f59e0b;">CONFIDENCIAL</div>
          </div>
        </div>

        <div class="section-title">Detalle Consolidado de Registros en el Reporte</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>CONCEPTO / REGISTRO</th>
              <th>CATEGORÍA / DEPARTAMENTO</th>
              <th>ESTADO</th>
              <th>FECHA REGISTRO</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>

        <div class="signature-section">
          <div class="sig-box">
            <div style="font-size:11px; font-weight:800; color:#64748b;">AUTORIZACIÓN Y CERTIFICACIÓN INSTITUCIONAL</div>
            <div class="sig-line"></div>
            <div style="font-size:13px; font-weight:900; color:#0f172a;">Dra. Sofía Ramírez</div>
            <div style="font-size:12px; color:#475569; font-weight:600;">Dirección de Bienestar Emocional & Salud Institucional</div>
            <div style="font-size:11px; color:#94a3b8;">EquilibrIA Platform Certificación Oficial</div>
          </div>

          <div class="stamp-box">
            <div style="font-size:12px; font-weight:900; margin-bottom:4px;">SELLO INSTITUCIONAL DE VALIDACIÓN</div>
            Documento procesado de conformidad con normativas de confidencialidad y salud ocupacional.
          </div>
        </div>

        <div class="footer">
          Informe Oficial Confidencial • Generado automáticamente por EquilibrIA Platform Engine
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWin.document.write(htmlContent);
    printWin.document.close();
  };

  const handleExportCSV = () => {
    if (!allReportsData) return;
    const currentReport = allReportsData[selectedReportId] || {};
    const jsonStr = "data:text/csv;charset=utf-8," + encodeURIComponent(JSON.stringify(currentReport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `${selectedReportId}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportJSON = () => {
    if (!allReportsData) return;
    const currentReport = allReportsData[selectedReportId] || {};
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentReport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `${selectedReportId}_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // RENDER DE CALENDARIO FUTURISTA DE PROGRAMACIÓN
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const renderCalendar = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysCount = getDaysInMonth(year, month);
    const firstDayIndex = new Date(year, month, 1).getDay();
    
    const daysArray = Array.from({ length: daysCount }, (_, i) => i + 1);
    const blanksArray = Array.from({ length: firstDayIndex }, (_, i) => i);
    const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    return (
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '16px',
        border: '2px solid var(--border)',
        borderBottom: '5px solid var(--border)',
        padding: '20px',
        boxShadow: 'var(--shadow)',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} style={{ color: 'var(--primary)' }} />
            Calendario de Programación - {today.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </h4>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>Haz clic en un día para asignar fecha</span>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center', marginBottom: '8px' }}>
          {weekDays.map(d => (
            <span key={d} style={{ fontSize: '10.5px', fontWeight: '900', color: 'var(--text-muted)' }}>{d}</span>
          ))}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
          {blanksArray.map(b => (
            <div key={`blank-${b}`} style={{ minHeight: '52px' }} />
          ))}
          {daysArray.map(day => {
            const dayDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvals = evaluations.filter(ev => ev.scheduled_date && ev.scheduled_date.startsWith(dayDateStr));
            const isToday = day === today.getDate();
            
            return (
              <div 
                key={day} 
                className="calendar-day-hover"
                style={{
                  minHeight: '52px',
                  backgroundColor: isToday ? 'var(--primary-light)' : 'var(--bg-primary)',
                  border: isToday ? '2px solid var(--primary)' : '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '6px',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setEvalDate(dayDateStr);
                  setEvalSubTab('create_custom');
                }}
              >
                <span style={{ fontSize: '11.5px', fontWeight: '900', color: isToday ? 'var(--primary)' : 'var(--text-secondary)' }}>{day}</span>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {dayEvals.map(ev => (
                    <div 
                      key={ev.id} 
                      title={`${ev.title} (${ev.assigned_type})`}
                      style={{
                        height: '5px',
                        width: '100%',
                        borderRadius: '3px',
                        backgroundColor: ev.assigned_type === 'all' ? 'var(--primary)' : ev.assigned_type === 'department' ? 'var(--accent)' : 'var(--success)'
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // RENDER DE CALENDARIO MENSUAL DE CITAS CLÍNICAS DE LA PSICÓLOGA 📅
  const renderClinicalMonthCalendar = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysCount = getDaysInMonth(year, month);
    const firstDayIndex = new Date(year, month, 1).getDay();
    
    const daysArray = Array.from({ length: daysCount }, (_, i) => i + 1);
    const blanksArray = Array.from({ length: firstDayIndex }, (_, i) => i);
    const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    return (
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '16px',
        border: '2px solid var(--border)',
        borderBottom: '5px solid var(--primary)',
        padding: '20px',
        boxShadow: 'var(--shadow)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <Calendar size={18} style={{ color: 'var(--primary)' }} />
              Calendario Mensual de Citas Clínicas - {today.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Consulta los días ocupados con consultas 1 a 1 y selecciona una fecha para agendar o filtrar.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '11px', fontWeight: '800' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)' }}>● Aprobada</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--warning)' }}>● Pendiente</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>○ Disponible</span>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center', marginBottom: '8px' }}>
          {weekDays.map(d => (
            <span key={d} style={{ fontSize: '11px', fontWeight: '900', color: 'var(--text-muted)' }}>{d}</span>
          ))}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
          {blanksArray.map(b => (
            <div key={`blank-${b}`} style={{ minHeight: '60px' }} />
          ))}
          {daysArray.map(day => {
            const dayDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayAppts = appointments.filter(a => a.date_time && a.date_time.startsWith(dayDateStr));
            const approvedCount = dayAppts.filter(a => a.status === 'aprobada').length;
            const pendingCount = dayAppts.filter(a => a.status === 'pendiente').length;
            const isToday = day === today.getDate();
            const isSelected = apptDate === dayDateStr;
            
            return (
              <div 
                key={day} 
                className={`calendar-day-box ${isSelected ? 'selected-day' : ''}`}
                style={{
                  minHeight: '60px',
                  backgroundColor: isSelected ? 'var(--primary-light)' : isToday ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-primary)',
                  border: isSelected ? '2px solid var(--primary)' : isToday ? '2px solid var(--primary)' : '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '6px 8px',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setApptDate(dayDateStr);
                  if (apptFormRef.current) {
                    apptFormRef.current.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                title={dayAppts.length > 0 ? `${dayAppts.length} citas programadas para el ${dayDateStr}` : `Día libre (${dayDateStr})`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: '900', color: isToday || isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>{day}</span>
                  {dayAppts.length > 0 ? (
                    <span style={{ fontSize: '9.5px', fontWeight: '900', padding: '1px 5px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                      {dayAppts.length}
                    </span>
                  ) : (
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>libre</span>
                  )}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                  {approvedCount > 0 && (
                    <span style={{ fontSize: '9px', fontWeight: '800', color: 'var(--success)', backgroundColor: 'var(--success-light)', padding: '1px 4px', borderRadius: '4px' }}>
                      {approvedCount} Aprob.
                    </span>
                  )}
                  {pendingCount > 0 && (
                    <span style={{ fontSize: '9px', fontWeight: '800', color: 'var(--warning)', backgroundColor: 'var(--warning-light)', padding: '1px 4px', borderRadius: '4px' }}>
                      {pendingCount} Pend.
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <span style={{ color: 'var(--text-secondary)' }}>Cargando módulos de la plataforma...</span>
      </div>
    );
  }

  const pieData = Object.keys(stats.sentiment_distribution).map(key => ({
    name: key,
    value: stats.sentiment_distribution[key] || 0
  }));

  const COLORS = {
    Positivo: 'var(--success)',
    Neutro: 'var(--text-muted)',
    Negativo: 'var(--danger)'
  };

  const departmentsList = ['Tecnología', 'Operaciones', 'Recursos Humanos', 'Finanzas', 'Salud', 'Ventas'];
  const unreadNotificationsCount = notifications.filter(n => n.unread).length;

  // INTERCEPTAR RENDERIZADO SI EL ADMIN ESTÁ PROBANDO EL TEST
  if (previewTest) {
    const questions = previewTest.questions || [];
    const answeredCount = questions.filter(q => previewAnswers[q.id] !== undefined).length;
    const progressPercent = Math.round((answeredCount / questions.length) * 100);

    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: 'var(--bg-primary)', 
        paddingBottom: '60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%'
      }}>
        
        <div style={{
          width: '100%',
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: 'var(--shadow-sm)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <button 
            onClick={() => setPreviewTest(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '13px'
            }}
          >
            <ArrowLeft size={16} />
            <span>Cerrar Vista Previa</span>
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>
              Progreso de Prueba: {progressPercent}%
            </span>
            <div style={{ width: '120px', height: '6px', backgroundColor: 'var(--bg-primary)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: 'var(--primary)', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        </div>

        <div style={{ width: '100%', maxWidth: '780px', padding: '24px 16px', display: 'grid', gap: '20px' }}>
          
          {/* Mascota Equi el Colibrí Orientador en la vista previa del Admin */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '20px',
            border: '3px solid var(--primary-light)',
            padding: '16px 22px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{
              backgroundColor: 'var(--primary-light)',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
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
                Equi • Tu Colibrí Orientador (Vista de Prueba Admin)
              </span>
              <p style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
                "{progressPercent === 0 ? '¡Hola Administrador! Aquí puedes probar la experiencia completa con escalas numéricas, la escala de 5 Emojis de Ánimo y dictado por voz.' : progressPercent >= 100 ? '¡Excelente! Has completado todas las preguntas de prueba.' : '¡Vas por la mitad del test! Sigue completando las opciones.'}"
              </p>
            </div>
          </div>

          {/* Tarjeta de Encabezado */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '16px',
            border: '2px solid var(--border)',
            borderBottom: '6px solid var(--primary)',
            boxShadow: 'var(--shadow)',
            padding: '24px 28px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', textTransform: 'uppercase' }}>
                Vista Previa del Administrador
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Muestra</span>
            </div>
            
            <h1 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              {previewTest.title}
            </h1>
            
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.5' }}>
              {previewTest.description || 'Esta es la pantalla dedicada e independiente de llenado de tests. Los colaboradores interactúan únicamente en esta sección aislada.'}
            </p>
          </div>

          {previewSuccess && <div style={{ backgroundColor: 'var(--success-light)', border: '1px solid var(--success)', color: 'var(--success)', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>{previewSuccess}</div>}

          <form onSubmit={handleAdminSubmitPreviewTest} style={{ display: 'grid', gap: '16px' }}>
            {questions.map((q, idx) => (
              <div 
                key={q.id || idx}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '14px',
                  border: '2px solid var(--border)',
                  borderLeft: previewAnswers[q.id] !== undefined ? '5px solid var(--success)' : '2px solid var(--border)',
                  boxShadow: 'var(--shadow-sm)',
                  padding: '24px 28px'
                }}
              >
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <span style={{ color: 'var(--primary)' }}>{idx + 1}.</span>
                  {q.question}
                </h3>

                {q.type === 'text' && (
                  <div>
                    <textarea
                      rows="3"
                      placeholder="Escribe o dicta por micrófono la respuesta de prueba..."
                      value={previewAnswers[q.id] || ''}
                      onChange={(e) => setPreviewAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                      required
                    />
                    <div style={{ marginTop: '8px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                          if (!SpeechRecognition) {
                            alert('El dictado por voz nativo no es soportado por este navegador. Intenta con Google Chrome o Microsoft Edge.');
                            return;
                          }
                          const rec = new SpeechRecognition();
                          rec.lang = 'es-ES';
                          rec.onresult = (event) => {
                            const transcript = event.results[0][0].transcript;
                            setPreviewAnswers(prev => ({ ...prev, [q.id]: (prev[q.id] || '') + ' ' + transcript }));
                          };
                          rec.start();
                        }}
                        className="duo-pill"
                        style={{ fontSize: '11.5px' }}
                      >
                        <Mic size={14} style={{ color: 'var(--primary)' }} />
                        <span>Hablar por Micrófono (Dictado por Voz)</span>
                      </button>
                    </div>
                  </div>
                )}

                {(q.type === 'scale_1_5' || q.type === 'scale_1_10') && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginTop: '8px' }}>
                    {(q.type === 'scale_1_10' ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] : [1, 2, 3, 4, 5]).map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setPreviewAnswers(prev => ({ ...prev, [q.id]: val }))}
                        className={`duo-card ${previewAnswers[q.id] === val ? 'selected' : ''}`}
                        style={{ justifyContent: 'center', padding: '12px 6px', fontSize: '15px', fontWeight: '900' }}
                      >
                        <span>{val}</span>
                      </button>
                    ))}
                  </div>
                )}

                {q.type === 'emoji_scale_5' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginTop: '8px' }}>
                    {[
                      { emoji: '😡', label: 'Molesto' },
                      { emoji: '🙁', label: 'Agotado' },
                      { emoji: '😐', label: 'Neutral' },
                      { emoji: '🙂', label: 'Tranquilo' },
                      { emoji: '😁', label: 'Excelente' }
                    ].map((item, eIdx) => (
                      <button
                        key={eIdx}
                        type="button"
                        onClick={() => setPreviewAnswers(prev => ({ ...prev, [q.id]: `${item.emoji} ${item.label}` }))}
                        className={`duo-card ${previewAnswers[q.id] === `${item.emoji} ${item.label}` ? 'selected' : ''}`}
                        style={{ justifyContent: 'center', padding: '10px 4px', flexDirection: 'column', gap: '4px' }}
                      >
                        <span style={{ fontSize: '24px' }}>{item.emoji}</span>
                        <span style={{ fontSize: '11px', fontWeight: '800' }}>{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {q.type === 'drawing' && (
                  <div style={{ marginTop: '8px' }}>
                    <DrawingCanvas 
                      savedImage={previewAnswers[q.id] || ''}
                      onSaveDrawing={(dataUrl) => setPreviewAnswers(prev => ({ ...prev, [q.id]: dataUrl }))}
                    />
                  </div>
                )}

                {q.type === 'boolean' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px' }}>
                    {['Sí', 'No'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setPreviewAnswers(prev => ({ ...prev, [q.id]: opt }))}
                        className={`duo-card ${previewAnswers[q.id] === opt ? 'selected' : ''}`}
                        style={{ justifyContent: 'center', padding: '14px', fontSize: '15px', fontWeight: '900' }}
                      >
                        <span>{opt}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={previewSubmitLoading || answeredCount < questions.length}
                style={{ flex: 1, padding: '12px 24px', borderRadius: '12px', fontWeight: '900' }}
              >
                {previewSubmitLoading ? <Loader className="animate-spin" size={16} /> : 'Enviar Respuesta de Prueba'}
              </button>
              <button 
                type="button" 
                onClick={() => setPreviewTest(null)}
                className="btn btn-secondary"
                style={{ padding: '12px 24px', borderRadius: '12px' }}
              >
                Cerrar Prueba
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // RENDER NORMAL DEL PANEL DE ADMINISTRACIÓN
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      {/* Navbar Superior Compacta con Centro de Notificaciones */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 24px',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
        zIndex: 10,
        position: 'relative'
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
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '500' }}>Sistema inteligente de análisis del bienestar emocional</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          
          {/* Centro de Notificaciones */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => { setShowNotifications(!showNotifications); setShowPaletteMenu(false); }}
              className="theme-toggle"
              style={{ border: '1px solid var(--border)', width: '36px', height: '36px', borderRadius: '50%', position: 'relative' }}
              title="Centro de Notificaciones"
            >
              <Bell size={16} style={{ color: 'var(--primary)' }} />
              {unreadNotificationsCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: 'var(--danger)',
                  color: '#fff',
                  fontSize: '9px',
                  fontWeight: '900',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Popover Drawer de Notificaciones */}
            {showNotifications && (
              <div className="notification-popover">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Bell size={14} style={{ color: 'var(--primary)' }} /> Centro de Notificaciones
                  </h4>
                  <button onClick={() => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))} style={{ border: 'none', background: 'none', fontSize: '10.5px', color: 'var(--primary)', cursor: 'pointer', fontWeight: '800' }}>
                    Marcar leídas
                  </button>
                </div>
                <div>
                  {notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => handleNotificationClick(n)}
                      className="notification-item" 
                      style={{ 
                        borderLeft: n.unread ? '4px solid var(--primary)' : '1px solid var(--border)',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                        backgroundColor: n.unread ? 'var(--primary-light)' : 'transparent',
                        padding: '10px',
                        borderRadius: '8px',
                        marginBottom: '6px'
                      }}
                      title="Haz clic para ir al módulo relacionado"
                    >
                      <p style={{ fontSize: '11.5px', color: 'var(--text-primary)', fontWeight: n.unread ? '800' : '500' }}>{n.text}</p>
                      <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: '800', display: 'block', marginTop: '4px' }}>
                        {n.time} • Ir al módulo ➔
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Botón Selector de Paletas de Colores 🎨 */}
          <div style={{ position: 'relative' }}>
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
                    <Palette size={14} style={{ color: 'var(--primary)' }} /> Paleta de Colores
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
            <span style={{ color: 'var(--text-secondary)', fontSize: '10.5px', fontWeight: '500' }}>
              {user?.role === 'superadmin' ? 'Super Administrador' : 'Gestor de Bienestar'}
            </span>
          </div>

          <button onClick={logout} className="theme-toggle" style={{ color: 'var(--danger)', border: '1px solid var(--border)', width: '36px', height: '36px', borderRadius: '50%' }} title="Cerrar Sesión">
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* Contenido Principal */}
      <main style={{ flex: 1, padding: '24px 24px', maxWidth: '1300px', width: '100%', margin: '0 auto' }}>
        
        {/* Banner de Confidencialidad Flotante (Toast Fijo en Esquina para Evitar Desfase de Diseño) */}
        {showPrivacyNotice && (
          <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            maxWidth: '380px',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            padding: '14px 18px',
            borderRadius: '16px',
            border: '2px solid var(--primary)',
            boxShadow: 'var(--tech-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            fontSize: '12.5px',
            fontWeight: '600',
            animation: 'fadeIn 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldAlert size={22} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <span>
                <strong>Aviso de Confidencialidad</strong>: La información de bienestar es anónima y agregada. (Se cerrará en 20s)
              </span>
            </div>
            <button onClick={() => setShowPrivacyNotice(false)} aria-label="Cerrar aviso" style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', lineHeight: 1 }}>×</button>
          </div>
        )}

        {/* Pestañas de Navegación Adaptativas por Rol (Menú Multimódulo Ampliado en 2 Filas para SuperAdmin) */}
        <div className="tab-container" style={{ width: '100%', flexWrap: 'wrap', gap: '8px', justifyContent: 'flex-start' }}>
          <button className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}><BarChart3 size={15} /><span>Analíticas</span></button>
          <button className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}><ClipboardList size={15} /><span>Tareas</span></button>
          
          {(user?.role !== 'lider_depto') && (
            <button className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`} onClick={() => setActiveTab('alerts')}>
              <AlertTriangle size={15} /><span>Alertas</span>
              {alerts.length > 0 && <span style={{ backgroundColor: 'var(--danger)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: 'var(--radius-full)', fontWeight: 'bold' }}>{alerts.length}</span>}
            </button>
          )}

          <button className={`tab-btn ${activeTab === 'evaluations' ? 'active' : ''}`} onClick={() => setActiveTab('evaluations')}><Calendar size={15} /><span>Tests</span></button>

          {/* Agenda de Citas Clínicas 1 a 1 (Psicóloga, Superadmin, Admin) */}
          {(user?.role === 'superadmin' || user?.role === 'admin_institucion' || user?.role === 'profesional_apoyo') && (
            <button className={`tab-btn ${activeTab === 'clinical_appointments' ? 'active' : ''}`} onClick={() => setActiveTab('clinical_appointments')}>
              <Calendar size={15} /><span>Agenda de Citas</span>
            </button>
          )}

          {/* Módulos de Gestión de Integrantes (Superadmin, Admin e Líder) */}
          {(user?.role === 'superadmin' || user?.role === 'admin_institucion' || user?.role === 'lider_depto') && (
            <button className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`} onClick={() => setActiveTab('members')}><Users size={15} /><span>Roles y Usuarios</span></button>
          )}

          {/* Módulos Adicionales para SuperAdmin y Admins */}
          {(user?.role === 'superadmin' || user?.role === 'admin_institucion') && (
            <>
              <button className={`tab-btn ${activeTab === 'institutions' ? 'active' : ''}`} onClick={() => setActiveTab('institutions')}><Building size={15} /><span>Instituciones y Deptos</span></button>
              <button className={`tab-btn ${activeTab === 'progress' ? 'active' : ''}`} onClick={() => setActiveTab('progress')}><Trophy size={15} /><span>Mi Progreso / Gamificación</span></button>
              <button className={`tab-btn ${activeTab === 'kudos' ? 'active' : ''}`} onClick={() => setActiveTab('kudos')}><MessageSquare size={15} /><span>Chat & Grupos</span></button>
              <button className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}><FileSpreadsheet size={15} /><span>Reportes</span></button>
              <button className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}><ShieldCheck size={15} /><span>Auditoría</span></button>
            </>
          )}

          {(user?.role !== 'lider_depto') && (
            <button className={`tab-btn ${activeTab === 'ai_plans' ? 'active' : ''}`} onClick={() => setActiveTab('ai_plans')}><Sparkles size={15} /><span>Sugerencias IA</span></button>
          )}

          {user?.role === 'superadmin' && (
            <button className={`tab-btn ${activeTab === 'chat_ia' ? 'active' : ''}`} onClick={() => setActiveTab('chat_ia')}><Bot size={15} /><span>Chatbot IA</span></button>
          )}
        </div>

        {/* TAB 1: ANALÍTICAS Y CLIMA EMOCIONAL */}
        {activeTab === 'analytics' && (
          <div className="animate-fade" style={{ display: 'grid', gap: '20px' }}>
            <GamificationWidget onNavigateToFullProgress={() => setActiveTab('progress')} />
            <div className="grid grid-3">
              <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', letterSpacing: '0.5px' }}>ESTRÉS PROMEDIO</span>
                  <h2 style={{ fontSize: '26px', fontWeight: '900', marginTop: '4px', color: 'var(--danger)' }}>{stats?.averages?.stress || 0}%</h2>
                </div>
                <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--danger-light)', color: 'var(--danger)' }}><ShieldAlert size={20} /></div>
              </div>

              <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', letterSpacing: '0.5px' }}>MOTIVACIÓN PROMEDIO</span>
                  <h2 style={{ fontSize: '26px', fontWeight: '900', marginTop: '4px', color: 'var(--success)' }}>{stats?.averages?.motivation || 0}%</h2>
                </div>
                <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--success-light)', color: 'var(--success)' }}><Award size={20} /></div>
              </div>

              <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', letterSpacing: '0.5px' }}>INTEGRANTES ACTIVOS</span>
                  <h2 style={{ fontSize: '26px', fontWeight: '900', marginTop: '4px', color: 'var(--primary)' }}>{stats.total_members || 0}</h2>
                </div>
                <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}><Users size={20} /></div>
              </div>
            </div>

            <div className="grid grid-2">
              <div className="glass-card">
                <h3 style={{ fontSize: '16px', fontWeight: '900', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={18} style={{ color: 'var(--primary)' }} /> Evolución del Clima Emocional
                </h3>
                {!stats.historical_trends || stats.historical_trends.length === 0 ? (
                  <div style={{ height: '240px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>Sin suficientes datos históricos registrados.</div>
                ) : (
                  <div style={{ width: '100%', height: '240px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats.historical_trends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
                        <YAxis stroke="var(--text-muted)" fontSize={11} domain={[0, 100]} />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                        <Legend verticalAlign="top" height={36} iconType="circle" />
                        <Line type="monotone" dataKey="stress" name="Estrés" stroke="var(--danger)" strokeWidth={3} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="motivation" name="Motivación" stroke="var(--success)" strokeWidth={3} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="burnout" name="Agotamiento" stroke="var(--warning)" strokeWidth={3} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="glass-card">
                <h3 style={{ fontSize: '16px', fontWeight: '900', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={18} style={{ color: 'var(--accent)' }} /> Distribución del Sentimiento
                </h3>
                {pieData.every(d => d.value === 0) ? (
                  <div style={{ height: '240px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>Sin datos de sentimientos registrados.</div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '240px', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{ width: '180px', height: '180px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={68} paddingAngle={6} dataKey="value">
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[entry.name] || 'var(--text-muted)'} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {pieData.map((entry, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: COLORS[entry.name] }} />
                          <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{entry.name}: {entry.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TAREAS CON ASIGNACIÓN SEGMENTADA POR PÚBLICO */}
        {activeTab === 'tasks' && (
          <div className="grid grid-2 animate-fade" style={{ alignItems: 'start' }}>
            <div className="glass-card">
              <h3 style={{ fontSize: '17px', fontWeight: '900', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlusCircle size={18} style={{ color: 'var(--primary)' }} /> Asignación Inteligente de Tareas
              </h3>

              {createError && <div style={{ backgroundColor: 'var(--danger-light)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '10px', borderRadius: 'var(--radius-sm)', fontSize: '12.5px', marginBottom: '14px' }}>{createError}</div>}
              {createSuccess && <div style={{ backgroundColor: 'var(--success-light)', border: '1px solid var(--success)', color: 'var(--success)', padding: '10px', borderRadius: 'var(--radius-sm)', fontSize: '12.5px', marginBottom: '14px' }}>{createSuccess}</div>}

              <form onSubmit={handleCreateTask}>
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label>Título de la Tarea</label>
                  <input type="text" placeholder="Ej. Pausa activa de respiración consciente" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required />
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label>Descripción</label>
                  <textarea rows="3" placeholder="Describe los detalles de la actividad..." value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} style={{ resize: 'vertical' }} />
                </div>
                
                {/* Categoría, Prioridad y Tiempo Estimado */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>CATEGORÍA DE LA TAREA:</label>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {['Bienestar', 'Académica', 'Laboral'].map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setTaskCategory(cat)}
                            className={`duo-pill ${taskCategory === cat ? 'selected' : ''}`}
                            style={{ padding: '4px 10px', fontSize: '11.5px' }}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>NIVEL DE PRIORIDAD:</label>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {[
                          { id: 'Alta', label: '🔴 Alta' },
                          { id: 'Media', label: '🟡 Media' },
                          { id: 'Baja', label: '🟢 Baja' }
                        ].map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setTaskPriority(p.id)}
                            className={`duo-pill ${taskPriority === p.id ? 'selected' : ''}`}
                            style={{ padding: '4px 10px', fontSize: '11.5px' }}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>TIEMPO ESTIMADO:</label>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {[15, 30, 45, 60].map(m => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setTaskEstMinutes(m)}
                            className={`duo-pill ${taskEstMinutes === m ? 'selected' : ''}`}
                            style={{ padding: '4px 8px', fontSize: '11.5px' }}
                          >
                            ⏱️ {m}m
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Asignación por Público (Todos, Departamento, Individual) */}
                  <div style={{ backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '14px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                      PÚBLICO DESTINATARIO DE LA TAREA:
                    </label>
                    
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      {[
                        { id: 'all', label: 'Todo el Personal' },
                        { id: 'department', label: 'Por Departamento' },
                        { id: 'individual', label: 'Colaborador Individual' }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => { setTaskAssignedType(opt.id); setTaskAssignedTarget(''); }}
                          className={`duo-pill ${taskAssignedType === opt.id ? 'selected' : ''}`}
                          style={{ fontSize: '11.5px' }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    {taskAssignedType === 'department' && (
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>SELECCIONAR DEPARTAMENTO:</label>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                          {departmentsList.map(dept => (
                            <button
                              key={dept}
                              type="button"
                              onClick={() => setTaskAssignedTarget(dept)}
                              className={`duo-pill ${taskAssignedTarget === dept ? 'selected' : ''}`}
                              style={{ padding: '4px 10px', fontSize: '11px' }}
                            >
                              {dept}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {taskAssignedType === 'individual' && (
                      <div className="form-group" style={{ marginTop: '10px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '800', marginBottom: '6px', display: 'block' }}>SELECCIONAR COLABORADOR ESPECÍFICO:</label>
                        <CustomSelect
                          options={members.map(m => ({
                            value: m.email,
                            label: `${m.first_name} ${m.last_name}`,
                            sublabel: `${m.email} • Depto: ${m.department || 'General'}`,
                            icon: '👤'
                          }))}
                          value={taskAssignedTarget}
                          onChange={(val) => setTaskAssignedTarget(val)}
                          placeholder="Buscar o seleccionar colaborador..."
                        />
                      </div>
                    )}
                  </div>

                  <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>FECHA DE VENCIMIENTO DE LA TAREA:</label>
                  <CustomDatePicker
                    value={taskDueDate}
                    onChange={(val) => setTaskDueDate(val)}
                    placeholder="Seleccionar fecha límite de tarea..."
                  />
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {[
                      { days: 0, label: 'Hoy' },
                      { days: 1, label: 'Mañana' },
                      { days: 3, label: 'En 3 Días' },
                      { days: 7, label: 'En 7 Días' }
                    ].map(btn => (
                      <button
                        key={btn.days}
                        type="button"
                        onClick={() => setQuickDateTask(btn.days)}
                        className="duo-pill"
                        style={{ fontSize: '11.5px', padding: '6px 12px' }}
                      >
                        📅 {btn.label}
                      </button>
                    ))}
                  </div>
                  {taskDueDate && (
                    <span style={{ fontSize: '11.5px', color: 'var(--primary)', fontWeight: '800', display: 'block', marginTop: '6px' }}>
                      Fecha asignada: {taskDueDate}
                    </span>
                  )}
                </div>

                <button type="submit" className="btn btn-primary" disabled={createLoading} style={{ width: '100%', borderRadius: '12px', padding: '12px', fontWeight: '900' }}>
                  {createLoading ? <Loader className="animate-spin" size={16} /> : 'Publicar Tarea Segmentada'}
                </button>
              </form>
            </div>

            <div className="glass-card">
              <h3 style={{ fontSize: '17px', fontWeight: '900', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ClipboardList size={18} /> Tareas Activas de la Institución
              </h3>
              <div style={{ display: 'grid', gap: '12px', maxHeight: '480px', overflowY: 'auto' }}>
                {tasks.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No hay tareas creadas.</p>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="futuristic-card-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '9px', fontWeight: '800', padding: '2px 6px', borderRadius: 'var(--radius-full)', backgroundColor: task.status === 'completada' ? 'var(--success-light)' : 'var(--bg-primary)', color: task.status === 'completada' ? 'var(--success)' : 'var(--text-secondary)' }}>{task.status}</span>
                          <span style={{ fontSize: '9px', fontWeight: '800', padding: '2px 6px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <Target size={8} /> {task.assigned_type === 'all' ? 'Todos' : task.assigned_type === 'department' ? `Depto: ${task.assigned_target}` : `Individual: ${task.assigned_target}`}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '14px', fontWeight: '800' }}>{task.title}</h4>
                        {task.description && <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{task.description}</p>}
                      </div>
                      <button onClick={() => handleDeleteTask(task.id)} className="theme-toggle" style={{ color: 'var(--danger)', border: '1px solid var(--border)', width: '30px', height: '30px' }} title="Eliminar"><Trash2 size={13} /></button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* NUEVO MÓDULO DE LA PSICÓLOGA: AGENDA DE CITAS CLÍNICAS 1 A 1 📅 */}
        {activeTab === 'clinical_appointments' && (
          <div className="animate-fade">
            {renderClinicalMonthCalendar()}

            <div className="grid grid-2" style={{ alignItems: 'start' }}>
            {/* Formulario para Agendar Cita Manualmente */}
            <div ref={apptFormRef} className="glass-card">
              <h3 style={{ fontSize: '17px', fontWeight: '900', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} style={{ color: 'var(--primary)' }} /> Agendar Cita Manualmente (Psicóloga / Profesional)
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Registra una cita directa para un colaborador o paciente de la institución.
              </p>

              {apptSuccessMsg && (
                <div style={{ backgroundColor: 'var(--success-light)', border: '1px solid var(--success)', color: 'var(--success)', padding: '12px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px' }}>
                  {apptSuccessMsg}
                </div>
              )}

              <form onSubmit={handleCreateApptManual}>
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>SELECCIONAR COLABORADOR / PACIENTE:</label>
                  <CustomSelect
                    options={members.map(m => ({
                      value: m.id,
                      label: `${m.first_name} ${m.last_name}`,
                      sublabel: `${m.email} • Depto: ${m.department || 'General'}`,
                      icon: '👤'
                    }))}
                    value={apptUserId}
                    onChange={(val) => setApptUserId(val)}
                    placeholder="Seleccionar paciente de la institución..."
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>FECHA DE LA CITA:</label>
                  <CustomDatePicker
                    value={apptDate}
                    onChange={(val) => setApptDate(val)}
                    placeholder="Seleccionar fecha de la cita..."
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>HORARIO DE LA CITA:</label>
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

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>MOTIVO DE LA CONSULTA:</label>
                  <input type="text" placeholder="Ej. Acompañamiento por estrés laboral o seguimiento de burnout" value={apptReason} onChange={(e) => setApptReason(e.target.value)} required style={{ borderRadius: '10px' }} />
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>NOTAS PRELIMINARES DE LA PSICÓLOGA (CONFIDENCIAL):</label>
                  <textarea rows="3" placeholder="Observaciones privadas sobre el caso..." value={apptNotes} onChange={(e) => setApptNotes(e.target.value)} style={{ width: '100%', borderRadius: '10px', fontSize: '12.5px', padding: '10px' }} />
                </div>

                <button type="submit" className="btn btn-primary" disabled={apptLoading} style={{ width: '100%', padding: '12px', borderRadius: '12px', fontWeight: '900' }}>
                  {apptLoading ? <Loader className="animate-spin" size={16} /> : '📅 Agendar Cita Privada'}
                </button>
              </form>
            </div>

            {/* Listado y Calendario de Citas Solicitadas y Programadas */}
            <div className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={18} style={{ color: 'var(--accent)' }} /> Citas Solicitadas y Programadas
                </h3>
                <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '12px' }}>
                  Total: {appointments.length} Citas
                </span>
              </div>

              <div style={{ display: 'grid', gap: '14px', maxHeight: '560px', overflowY: 'auto' }}>
                {appointments.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '12.5px', textAlign: 'center', padding: '30px' }}>No hay citas registradas actualmente.</p>
                ) : (
                  appointments.map(a => (
                    <div key={a.id} className="futuristic-card-item" style={{ padding: '16px', borderLeft: a.status === 'aprobada' ? '5px solid var(--success)' : a.status === 'pendiente' ? '5px solid var(--warning)' : '5px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <div>
                          <h4 style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--text-primary)' }}>
                            👤 {a.user_name} <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '500' }}>({a.user_department})</span>
                          </h4>
                          <p style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700', marginTop: '2px' }}>
                            📆 {new Date(a.date_time).toLocaleString()}
                          </p>
                        </div>
                        <span style={{
                          fontSize: '10.5px',
                          fontWeight: '800',
                          padding: '3px 8px',
                          borderRadius: '10px',
                          backgroundColor: a.status === 'aprobada' ? 'var(--success-light)' : a.status === 'pendiente' ? 'var(--warning-light)' : 'var(--bg-secondary)',
                          color: a.status === 'aprobada' ? 'var(--success)' : a.status === 'pendiente' ? 'var(--warning)' : 'var(--text-secondary)',
                          textTransform: 'uppercase'
                        }}>
                          {a.status}
                        </span>
                      </div>

                      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                        Motivo: "{a.reason}"
                      </p>

                      {a.clinical_notes && (
                        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: '8px', fontSize: '11.5px', color: 'var(--text-primary)', marginBottom: '10px', fontStyle: 'italic' }}>
                          Nota Clínica: "{a.clinical_notes}"
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {a.status === 'pendiente' && (
                          <button
                            onClick={() => handleUpdateApptStatus(a.id, 'aprobada', a.clinical_notes)}
                            className="duo-pill selected"
                            style={{ fontSize: '11px', padding: '4px 10px' }}
                          >
                            🟢 Aprobar Cita
                          </button>
                        )}
                        {a.status !== 'completada' && (
                          <button
                            onClick={() => handleUpdateApptStatus(a.id, 'completada', a.clinical_notes)}
                            className="duo-pill"
                            style={{ fontSize: '11px', padding: '4px 10px' }}
                          >
                            ✅ Marcar Completada
                          </button>
                        )}
                        {a.status !== 'cancelada' && (
                          <button
                            onClick={() => handleUpdateApptStatus(a.id, 'cancelada', a.clinical_notes)}
                            className="duo-pill"
                            style={{ fontSize: '11px', padding: '4px 10px', color: 'var(--danger)' }}
                          >
                            ❌ Cancelar Cita
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        )}

        {/* TAB 3: ALERTAS DE RIESGO */}
        {activeTab === 'alerts' && (
          <div className="glass-card animate-fade">
            <h3 style={{ fontSize: '17px', fontWeight: '900', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} style={{ color: 'var(--danger)' }} /> Alertas de Riesgo Emocional
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '20px' }}>Miembros identificados con indicadores críticos ($\ge 75\%$).</p>
            <div style={{ display: 'grid', gap: '14px' }}>
              {alerts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)' }}>No hay alertas pendientes.</div>
              ) : (
                alerts.map((al) => (
                  <div key={al.id} className="futuristic-card-item" style={{ borderLeft: `5px solid ${al.priority === 'Alta' ? 'var(--danger)' : 'var(--warning)'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: '800' }}>{al.user_name}</span>
                      <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: 'var(--radius-full)', backgroundColor: al.priority === 'Alta' ? 'var(--danger-light)' : 'var(--warning-light)', color: al.priority === 'Alta' ? 'var(--danger)' : 'var(--warning)' }}>Riesgo {al.priority}</span>
                    </div>
                    <p style={{ fontSize: '12.5px', fontStyle: 'italic', marginBottom: '12px' }}>"{al.reflection_text}"</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input type="text" placeholder="Ingresar notas de atención..." value={resolutionNotes[al.id] || ''} onChange={(e) => setResolutionNotes(prev => ({ ...prev, [al.id]: e.target.value }))} style={{ flex: 1, padding: '8px 12px', fontSize: '12px', borderRadius: '8px' }} />
                      <button onClick={() => handleAttendAlert(al.id)} className="btn btn-primary" disabled={resolvingId === al.id} style={{ padding: '8px 14px', fontSize: '12px', borderRadius: '8px' }}>Atender Alerta</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: MÓDULO DE TESTS */}
        {activeTab === 'evaluations' && (
          <div className="animate-fade" style={{ display: 'grid', gap: '20px' }}>
            <div className="glass-card" style={{ paddingBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={18} style={{ color: 'var(--primary)' }} />
                    Módulo de Creación y Programación de Tests
                  </h2>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Diseña cuestionarios a medida o activa plantillas preestablecidas con segmentación dirigida.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                <button 
                  onClick={() => setEvalSubTab('active_tests')}
                  className={`duo-pill ${evalSubTab === 'active_tests' ? 'selected' : ''}`}
                >
                  <Eye size={14} />
                  <span>Tests Activos y Reportes</span>
                </button>
                <button 
                  onClick={() => setEvalSubTab('templates')}
                  className={`duo-pill ${evalSubTab === 'templates' ? 'selected' : ''}`}
                >
                  <Zap size={14} />
                  <span>Banco de Tests Precargados</span>
                </button>
                <button 
                  onClick={() => setEvalSubTab('create_custom')}
                  className={`duo-pill ${evalSubTab === 'create_custom' ? 'selected' : ''}`}
                >
                  <PlusCircle size={14} />
                  <span>Crear Test Personalizado</span>
                </button>
              </div>
            </div>

            {evalError && <div style={{ backgroundColor: 'var(--danger-light)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '10px', borderRadius: 'var(--radius-sm)', fontSize: '12.5px' }}>{evalError}</div>}
            {evalSuccess && <div style={{ backgroundColor: 'var(--success-light)', border: '1px solid var(--success)', color: 'var(--success)', padding: '10px', borderRadius: 'var(--radius-sm)', fontSize: '12.5px' }}>{evalSuccess}</div>}

            {evalSubTab === 'active_tests' && (
              <div>
                {renderCalendar()}

                <div className="grid grid-2 animate-fade" style={{ alignItems: 'start' }}>
                  <div className="glass-card">
                    <h3 style={{ fontSize: '15px', fontWeight: '900', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ClipboardList size={16} />
                      Lista de Cuestionarios en Curso
                    </h3>
                    <div style={{ display: 'grid', gap: '12px', maxHeight: '480px', overflowY: 'auto' }}>
                      {evaluations.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '12.5px' }}>
                          No hay cuestionarios activos. Ve a la pestaña "Banco de Tests Precargados" para activar uno al instante.
                        </div>
                      ) : (
                        evaluations.map((ev) => (
                          <div 
                            key={ev.id} 
                            className="futuristic-card-item"
                            style={{ 
                              borderLeft: selectedTestAnalytics?.test_id === ev.id ? '5px solid var(--primary)' : '1px solid var(--border)',
                              backgroundColor: selectedTestAnalytics?.test_id === ev.id ? 'var(--primary-light)' : 'var(--bg-secondary)',
                              display: 'flex', 
                              flexDirection: 'column', 
                              gap: '10px' 
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                              <div>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '4px' }}>
                                  <span style={{ fontSize: '9px', fontWeight: '800', padding: '2px 6px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>{ev.category}</span>
                                  <span style={{ fontSize: '9px', fontWeight: '800', padding: '2px 6px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                    <Target size={8} /> {ev.assigned_type === 'all' ? 'Todos' : ev.assigned_type === 'department' ? `Depto: ${ev.assigned_target}` : `Individual: ${ev.assigned_target}`}
                                  </span>
                                </div>
                                <h4 style={{ fontSize: '14px', fontWeight: '800' }}>{ev.title}</h4>
                              </div>
                              <button onClick={() => handleDeleteEvaluation(ev.id)} className="theme-toggle" style={{ color: 'var(--danger)', border: '1px solid var(--border)', width: '28px', height: '28px' }} title="Eliminar"><Trash2 size={12} /></button>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                onClick={() => handleViewTestResponses(ev.id)}
                                className="duo-pill"
                                style={{ flex: 1, fontSize: '11.5px', justifyContent: 'center' }}
                              >
                                <Eye size={13} />
                                <span>Ver Métricas</span>
                              </button>
                              <button 
                                onClick={() => { setPreviewTest(ev); setPreviewAnswers({}); setPreviewSuccess(''); }}
                                className="duo-pill selected"
                                style={{ flex: 1, fontSize: '11.5px', justifyContent: 'center' }}
                              >
                                <Sliders size={13} />
                                <span>Probar Llenado</span>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="glass-card">
                    <h3 style={{ fontSize: '15px', fontWeight: '900', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BarChart3 size={16} style={{ color: 'var(--accent)' }} />
                      Métricas de Respuestas Consolidadas
                    </h3>

                    {analyticsLoading ? (
                      <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}><Loader className="animate-spin" size={20} /></div>
                    ) : !selectedTestAnalytics ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '12.5px', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)' }}>
                        Haz clic en "Ver Métricas" en cualquiera de los cuestionarios para consultar el análisis.
                      </div>
                    ) : (
                      <div className="animate-fade">
                        <div style={{ marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                          <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase' }}>Analíticas del Cuestionario</span>
                          <h4 style={{ fontSize: '15px', fontWeight: '800', marginTop: '2px' }}>{selectedTestAnalytics.title}</h4>
                          <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>Respuestas procesadas por IA: <strong>{selectedTestAnalytics.total_responses}</strong></span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
                          <div style={{ padding: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', textAlign: 'center', border: '1px solid var(--border)' }}>
                            <span style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: '700' }}>ESTRÉS PROMEDIO</span>
                            <span style={{ fontSize: '16px', fontWeight: '900', display: 'block', color: 'var(--danger)', marginTop: '4px' }}>{selectedTestAnalytics.averages.stress}%</span>
                          </div>
                          <div style={{ padding: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', textAlign: 'center', border: '1px solid var(--border)' }}>
                            <span style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: '700' }}>MOTIVACIÓN</span>
                            <span style={{ fontSize: '16px', fontWeight: '900', display: 'block', color: 'var(--success)', marginTop: '4px' }}>{selectedTestAnalytics.averages.motivation}%</span>
                          </div>
                          <div style={{ padding: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', textAlign: 'center', border: '1px solid var(--border)' }}>
                            <span style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: '700' }}>AGOTAMIENTO</span>
                            <span style={{ fontSize: '16px', fontWeight: '900', display: 'block', color: 'var(--warning)', marginTop: '4px' }}>{selectedTestAnalytics.averages.burnout}%</span>
                          </div>
                        </div>

                        <h5 style={{ fontSize: '12.5px', fontWeight: '800', marginBottom: '8px', color: 'var(--primary)' }}>
                          Respuestas de Colaboradores Participantes ({selectedTestAnalytics.responses.length}):
                        </h5>
                        <div style={{ display: 'grid', gap: '12px', maxHeight: '380px', overflowY: 'auto' }}>
                          {selectedTestAnalytics.responses.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center' }}>No hay respuestas registradas aún para este test.</p>
                          ) : (
                            selectedTestAnalytics.responses.map((r) => (
                              <div key={r.id} className="futuristic-card-item" style={{ padding: '14px', fontSize: '12px', borderLeft: '4px solid var(--primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                                    <span style={{ fontWeight: '900', fontSize: '13.5px', color: 'var(--text-primary)' }}>{r.user_name}</span>
                                    <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '10px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>{r.user_department || 'General'}</span>
                                    <span style={{ fontWeight: '800', fontSize: '10px', padding: '2px 8px', borderRadius: '10px', backgroundColor: r.dominant_sentiment === 'Positivo' ? 'var(--success-light)' : 'var(--danger-light)', color: r.dominant_sentiment === 'Positivo' ? 'var(--success)' : 'var(--danger)' }}>
                                      {r.dominant_sentiment}
                                    </span>
                                  </div>
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                    {r.user_email || 'Anónimo'} • Enviado: {new Date(r.created_at).toLocaleDateString()}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setSelectedSubmission(r)}
                                  className="btn btn-primary"
                                  style={{ padding: '8px 14px', fontSize: '12px', borderRadius: '10px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}
                                >
                                  <Eye size={14} />
                                  <span>Ver Respuestas del Colaborador</span>
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {evalSubTab === 'templates' && (
              <div className="glass-card animate-fade">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Zap size={16} style={{ color: 'var(--accent)' }} />
                      Banco de Plantillas Precargadas de Tests (6 Cuestionarios)
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Selecciona una plantilla completa (10 preguntas) o exprés (5 preguntas). Puedes visualizar las preguntas y verificar el lienzo interactivo antes de activarla.
                    </p>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '10px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                    6 Plantillas Disponibles
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                  {templates.map((tpl) => {
                    const config = templateTargets[tpl.id] || { type: 'all', target: '' };
                    const hasCanvas = tpl.questions && tpl.questions.some(q => q.type === 'drawing');
                    return (
                      <div key={tpl.id} className="futuristic-card-item" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{ fontSize: '9px', fontWeight: '800', padding: '3px 8px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>{tpl.category}</span>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              {hasCanvas && <span title="Incluye lienzo gráfico de dibujo" style={{ fontSize: '12px' }}>🎨</span>}
                              <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: '700' }}>{tpl.questions.length} preguntas</span>
                            </div>
                          </div>

                          <h4 style={{ fontSize: '14.5px', fontWeight: '800', marginBottom: '6px' }}>{tpl.title.replace('[Plantilla] ', '').replace('[Plantilla Express] ', '')}</h4>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '12px' }}>{tpl.description}</p>

                          <button
                            type="button"
                            onClick={() => setPreviewTemplate(tpl)}
                            className="btn btn-secondary"
                            style={{ width: '100%', padding: '6px 12px', fontSize: '11.5px', borderRadius: '8px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: 'var(--bg-tertiary)' }}
                          >
                            <Eye size={13} />
                            <span>Ver Preguntas Precargadas ({tpl.questions ? tpl.questions.length : 0})</span>
                          </button>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                          <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>DESTINATARIOS:</label>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                            {[
                              { id: 'all', label: 'Todos' },
                              { id: 'department', label: 'Departamento' },
                              { id: 'individual', label: 'Individual' }
                            ].map(opt => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => handleTemplateTargetChange(tpl.id, 'type', opt.id)}
                                className={`duo-pill ${config.type === opt.id ? 'selected' : ''}`}
                                style={{ padding: '4px 10px', fontSize: '11px' }}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                          
                          {config.type !== 'all' && (
                            <input 
                              type="text" 
                              placeholder={config.type === 'department' ? "Ej. Tecnología" : "Ej. colaborador@correo.com"} 
                              value={config.target}
                              onChange={(e) => handleTemplateTargetChange(tpl.id, 'target', e.target.value)}
                              style={{ padding: '6px 10px', fontSize: '12px', width: '100%', borderRadius: '8px' }}
                            />
                          )}
                        </div>

                        <button 
                          onClick={() => handleActivateTemplate(tpl.id)}
                          className="btn btn-primary"
                          disabled={evalLoading}
                          style={{ width: '100%', padding: '10px', fontSize: '13px', borderRadius: '12px', fontWeight: '900' }}
                        >
                          <Zap size={14} />
                          <span>Habilitar Test en la Institución</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* MODAL DE VISTA PREVIA DE PREGUNTAS PRECARGADAS */}
            {previewTemplate && (
              <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(8px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                animation: 'fadeIn 0.2s ease'
              }}>
                <div style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '24px',
                  border: '2px solid var(--primary)',
                  maxWidth: '680px',
                  width: '100%',
                  maxHeight: '85vh',
                  overflowY: 'auto',
                  padding: '26px',
                  boxShadow: 'var(--tech-glow)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '14px' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '900', padding: '3px 8px', borderRadius: '10px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', textTransform: 'uppercase' }}>
                          {previewTemplate.category}
                        </span>
                        <span style={{ fontSize: '10px', fontWeight: '900', padding: '3px 8px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                          {previewTemplate.questions.length} PREGUNTAS
                        </span>
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-primary)' }}>
                        {previewTemplate.title.replace('[Plantilla] ', '').replace('[Plantilla Express] ', '')}
                      </h3>
                    </div>
                    <button 
                      onClick={() => setPreviewTemplate(null)} 
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '22px', cursor: 'pointer', fontWeight: 'bold', lineHeight: 1 }}
                      aria-label="Cerrar modal"
                    >
                      ×
                    </button>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
                    {previewTemplate.description}
                  </p>

                  <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', padding: '5px 12px', borderRadius: '10px', backgroundColor: 'rgba(236, 72, 153, 0.12)', color: '#ec4899', border: '1px solid rgba(236, 72, 153, 0.3)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      🎨 Incluye Lienzo de Dibujo Canvas Interactivo
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: '800', padding: '5px 12px', borderRadius: '10px', backgroundColor: 'var(--success-light)', color: 'var(--success)', border: '1px solid var(--success)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      🎙️ Dictado de Voz + Emojis de Ánimo
                    </span>
                  </div>

                  <h4 style={{ fontSize: '13.5px', fontWeight: '900', color: 'var(--primary)', marginBottom: '12px' }}>
                    Cuestionario Precargado Completo:
                  </h4>

                  <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
                    {previewTemplate.questions.map((q, idx) => {
                      const typeLabels = {
                        scale_1_5: { label: 'Escala 1 a 5', color: 'var(--primary)' },
                        scale_1_10: { label: 'Escala 1 a 10', color: 'var(--accent)' },
                        emoji_scale_5: { label: 'Escala 5 Emojis (1-5)', color: 'var(--warning)' },
                        boolean: { label: 'Sí / No', color: 'var(--success)' },
                        text: { label: 'Texto libre / Voz', color: 'var(--info)' },
                        drawing: { label: '🎨 Lienzo de Dibujo Canvas', color: '#ec4899' }
                      };
                      const tInfo = typeLabels[q.type] || { label: q.type, color: 'var(--text-secondary)' };

                      return (
                        <div key={q.id || idx} style={{ backgroundColor: 'var(--bg-primary)', padding: '12px 14px', borderRadius: '12px', border: q.type === 'drawing' ? '2px solid rgba(236, 72, 153, 0.4)' : '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            <span style={{ fontWeight: '900', color: 'var(--primary)', fontSize: '13px', minWidth: '24px' }}>#{idx + 1}</span>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>{q.question}</span>
                          </div>
                          <span style={{ fontSize: '10px', fontWeight: '900', padding: '4px 8px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', color: tInfo.color, whiteSpace: 'nowrap', border: `1px solid ${tInfo.color}` }}>
                            {tInfo.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                    <button 
                      onClick={() => setPreviewTemplate(null)} 
                      className="btn btn-secondary"
                      style={{ padding: '9px 18px', fontSize: '12.5px', borderRadius: '10px' }}
                    >
                      Cerrar Vista Previa
                    </button>
                    <button 
                      onClick={() => { handleActivateTemplate(previewTemplate.id); setPreviewTemplate(null); }} 
                      className="btn btn-primary"
                      style={{ padding: '9px 18px', fontSize: '12.5px', borderRadius: '10px', fontWeight: '900' }}
                    >
                      <Zap size={14} /> Habilitar esta Plantilla
                    </button>
                  </div>
                </div>
              </div>
            )}

            {evalSubTab === 'create_custom' && (
              <div className="glass-card animate-fade" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '900', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PlusCircle size={17} style={{ color: 'var(--primary)' }} />
                  Diseño de Cuestionario a Medida
                </h3>

                <form onSubmit={handleCreateEvaluation}>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div className="form-group" style={{ flex: 1.2, minWidth: '240px', marginBottom: '14px' }}>
                      <label>Título del Test</label>
                      <input type="text" placeholder="Ej. Encuesta de Clima y Exigencias" value={evalTitle} onChange={(e) => setEvalTitle(e.target.value)} required />
                    </div>
                    <div className="form-group" style={{ flex: 1, minWidth: '180px', marginBottom: '14px' }}>
                      <label>Categoría</label>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                        {['Clima Laboral', 'Ánimo Personal', 'Bienestar Integral'].map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setEvalCategory(cat)}
                            className={`duo-pill ${evalCategory === cat ? 'selected' : ''}`}
                            style={{ padding: '6px 12px', fontSize: '11.5px' }}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label>Descripción</label>
                    <textarea rows="2" placeholder="Propósito de la evaluación..." value={evalDesc} onChange={(e) => setEvalDesc(e.target.value)} style={{ resize: 'vertical' }} />
                  </div>

                  <div style={{ marginBottom: '16px', backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                      PÚBLICO DESTINATARIO:
                    </label>
                    
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      {[
                        { id: 'all', label: 'Todo el Personal' },
                        { id: 'department', label: 'Por Departamento' },
                        { id: 'individual', label: 'Colaborador Individual' }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => { setEvalAssignedType(opt.id); setEvalAssignedTarget(''); }}
                          className={`duo-pill ${evalAssignedType === opt.id ? 'selected' : ''}`}
                          style={{ fontSize: '12px' }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    {evalAssignedType === 'department' && (
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>SELECCIONAR DEPARTAMENTO:</label>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                          {departmentsList.map(dept => (
                            <button
                              key={dept}
                              type="button"
                              onClick={() => setEvalAssignedTarget(dept)}
                              className={`duo-pill ${evalAssignedTarget === dept ? 'selected' : ''}`}
                              style={{ padding: '4px 10px', fontSize: '11px' }}
                            >
                              {dept}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {evalAssignedType === 'individual' && (
                      <div className="form-group" style={{ marginTop: '10px' }}>
                        <label style={{ fontSize: '11px', fontWeight: '800', marginBottom: '6px', display: 'block' }}>SELECCIONAR COLABORADOR ESPECÍFICO:</label>
                        <CustomSelect
                          options={members.map(m => ({
                            value: m.email,
                            label: `${m.first_name} ${m.last_name}`,
                            sublabel: `${m.email} • Depto: ${m.department || 'General'}`,
                            icon: '👤'
                          }))}
                          value={evalAssignedTarget}
                          onChange={(val) => setEvalAssignedTarget(val)}
                          placeholder="Buscar o seleccionar colaborador..."
                        />
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: '16px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        Preguntas del Test ({customQuestions.length})
                      </label>
                      {customQuestions.length > 0 && (
                        <button 
                          type="button"
                          onClick={() => setCustomQuestions([])}
                          style={{ border: 'none', background: 'none', color: 'var(--danger)', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}
                        >
                          Limpiar Todo (Eliminar Ejemplos)
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'grid', gap: '8px', marginBottom: '12px' }}>
                      {customQuestions.map((q, idx) => (
                        <div key={q.id} className="futuristic-card-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', fontSize: '12.5px' }}>
                          <div style={{ flex: 1, marginRight: '10px' }}>
                            <span><strong>P{idx+1}:</strong> {q.question}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: '800', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'var(--primary-light)' }}>
                              {q.type === 'scale_1_5' ? 'Numérica 1-5' : 
                               q.type === 'scale_1_10' ? 'Numérica 1-10' : 
                               q.type === 'emoji_scale_5' ? '5 Emojis de Ánimo 😡😁' :
                               q.type === 'drawing' ? '🎨 Dibujo Canvas' :
                               q.type === 'boolean' ? 'Sí / No' : 'Texto + Voz'}
                            </span>
                            <button 
                              type="button" 
                              onClick={() => handleRemoveCustomQuestion(q.id)}
                              style={{ border: 'none', background: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '2px' }}
                              title="Eliminar esta pregunta"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>SELECCIONAR TIPO DE LA NUEVA PREGUNTA:</label>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {[
                          { id: 'scale_1_5', label: '🔢 Numérica 1 a 5' },
                          { id: 'scale_1_10', label: '🔟 Numérica 1 a 10' },
                          { id: 'emoji_scale_5', label: '😡 Escala 5 Emojis de Ánimo' },
                          { id: 'text', label: '📝 Texto / Voz' },
                          { id: 'drawing', label: '🎨 Dibujo Canvas' },
                          { id: 'boolean', label: '🔘 Sí / No' }
                        ].map(typeOpt => (
                          <button
                            key={typeOpt.id}
                            type="button"
                            onClick={() => setNewQuestionType(typeOpt.id)}
                            className={`duo-pill ${newQuestionType === typeOpt.id ? 'selected' : ''}`}
                            style={{ fontSize: '11.5px', padding: '4px 10px' }}
                          >
                            {typeOpt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" 
                        placeholder="Escribe el enunciado de la nueva pregunta..." 
                        value={newQuestionText} 
                        onChange={(e) => setNewQuestionText(e.target.value)} 
                        style={{ flex: 1, padding: '10px 14px', fontSize: '12.5px', borderRadius: '10px' }} 
                      />
                      <button 
                        type="button" 
                        onClick={handleAddQuestion} 
                        className="btn btn-secondary" 
                        style={{ padding: '10px 18px', fontSize: '12.5px', borderRadius: '10px' }}
                      >
                        + Agregar Pregunta
                      </button>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '18px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                      FECHA LÍMITE DE ENTREGA:
                    </label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '8px' }}>
                      {[
                        { days: 1, label: 'Mañana' },
                        { days: 3, label: 'En 3 Días' },
                        { days: 7, label: 'En 1 Semana' },
                        { days: 15, label: 'En 15 Días' }
                      ].map(btn => (
                        <button
                          key={btn.days}
                          type="button"
                          onClick={() => setQuickDateEval(btn.days)}
                          className="duo-pill"
                          style={{ fontSize: '11.5px', padding: '6px 12px' }}
                        >
                          📅 {btn.label}
                        </button>
                      ))}

                      <div style={{ minWidth: '220px' }}>
                        <CustomDatePicker
                          value={evalDate}
                          onChange={(val) => setEvalDate(val)}
                          placeholder="Seleccionar fecha límite..."
                        />
                      </div>
                    </div>
                    {evalDate && (
                      <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '800', display: 'block', marginTop: '4px' }}>
                        Fecha fijada: {evalDate}
                      </span>
                    )}
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={evalLoading} style={{ width: '100%', padding: '14px', borderRadius: '12px', fontWeight: '900' }}>
                    {evalLoading ? <Loader className="animate-spin" size={16} /> : 'Programar Test Personalizado'}
                  </button>
                </form>
              </div>
            )}

          </div>
        )}

        {/* TAB 5: DIRECTORIO DE MIEMBROS Y MATRIZ DE ROLES (RBAC ENERPRISE) */}
        {activeTab === 'members' && (
          <div className="glass-card animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={18} style={{ color: 'var(--primary)' }} /> Directorio de Integrantes y Gestión de Roles (RBAC)
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Administra los usuarios registrados y los niveles de permiso por rol institucional.</p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setMembersSubTab('directory')}
                  className={`duo-pill ${membersSubTab === 'directory' ? 'selected' : ''}`}
                >
                  <Users size={13} />
                  <span>Directorio de Miembros ({members.length})</span>
                </button>
                <button 
                  onClick={() => setMembersSubTab('roles_rbac')}
                  className={`duo-pill ${membersSubTab === 'roles_rbac' ? 'selected' : ''}`}
                >
                  <Key size={13} />
                  <span>Matriz de Permisos por Rol</span>
                </button>
              </div>
            </div>

            {membersSubTab === 'directory' && (
              <div>
                {/* Modal / Editor de Usuario Seleccionado */}
                {editingUser && (
                  <div style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '2px solid var(--primary)',
                    borderRadius: '16px',
                    padding: '20px',
                    marginBottom: '20px',
                    boxShadow: 'var(--shadow-md)',
                    animation: 'fadeIn 0.2s ease'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Edit3 size={16} style={{ color: 'var(--primary)' }} />
                        Edición de Usuario: <span style={{ color: 'var(--primary)' }}>{editingUser.first_name} {editingUser.last_name}</span> ({editingUser.email})
                      </h4>
                      <button onClick={() => setEditingUser(null)} style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}>×</button>
                    </div>

                    {userUpdateMsg && (
                      <div style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)', border: '1px solid var(--success)', padding: '10px', borderRadius: '8px', fontSize: '12.5px', marginBottom: '14px' }}>
                        {userUpdateMsg}
                      </div>
                    )}

                    <form onSubmit={handleUpdateUser} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                          ASIGNAR ROL INSTITUCIONAL:
                        </label>
                        <select 
                          value={editRole} 
                          onChange={(e) => setEditRole(e.target.value)}
                          style={{ width: '100%', padding: '10px', borderRadius: '10px', fontSize: '12.5px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                        >
                          <option value="miembro">👤 Miembro / Colaborador</option>
                          <option value="profesional_apoyo">🧠 Psicólogo / Profesional de Apoyo</option>
                          <option value="lider_depto">👔 Líder de Departamento / Manager</option>
                          <option value="superadmin">🛡️ Administrador General</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                          DEPARTAMENTO / ÁREA:
                        </label>
                        <select 
                          value={editDept} 
                          onChange={(e) => setEditDept(e.target.value)}
                          style={{ width: '100%', padding: '10px', borderRadius: '10px', fontSize: '12.5px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                        >
                          {departmentsList.concat(['General']).map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                          RESTABLECER CONTRASEÑA (OPCIONAL):
                        </label>
                        <input 
                          type="password" 
                          placeholder="Nueva contraseña..." 
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          style={{ width: '100%', padding: '10px', borderRadius: '10px', fontSize: '12.5px', border: '1px solid var(--border)' }}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button type="submit" className="btn btn-primary" disabled={userUpdateLoading} style={{ flex: 1, padding: '10px', fontSize: '12.5px', borderRadius: '10px', fontWeight: '800' }}>
                          {userUpdateLoading ? <Loader className="animate-spin" size={14} /> : 'Guardar Cambios'}
                        </button>
                        <button type="button" onClick={() => setEditingUser(null)} className="btn btn-secondary" style={{ padding: '10px', fontSize: '12.5px', borderRadius: '10px' }}>
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                  {members.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>No hay miembros registrados.</p>
                  ) : (
                    members.map((m) => (
                      <div key={m.id} className="futuristic-card-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '15px' }}>
                            {m.first_name?.[0]}{m.last_name?.[0]}
                          </div>
                          <div>
                            <h4 style={{ fontSize: '14px', fontWeight: '800' }}>{m.first_name} {m.last_name}</h4>
                            <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{m.email}</p>
                            <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                              <span style={{ fontSize: '9px', fontWeight: '800', padding: '2px 6px', borderRadius: '10px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>{m.department || 'General'}</span>
                              <span style={{ fontSize: '9px', fontWeight: '800', padding: '2px 6px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
                                {m.role === 'superadmin' ? '🛡️ Admin' : m.role === 'profesional_apoyo' ? '🧠 Psicólogo' : m.role === 'lider_depto' ? '👔 Líder' : '👤 Miembro'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={() => openEditUserModal(m)} 
                          className="duo-pill" 
                          style={{ padding: '6px 12px', fontSize: '11.5px' }}
                          title="Editar Rol y Contraseña"
                        >
                          <Edit3 size={13} />
                          <span>Editar</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {membersSubTab === 'roles_rbac' && (
              <div className="animate-fade">
                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border)', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--primary)', marginBottom: '4px' }}>
                    Control de Acceso Basado en Roles (RBAC Enterprise)
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Configura qué módulos y acciones puede ejecutar cada rol dentro de la plataforma institucional.
                  </p>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '2px solid var(--border)', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left' }}>Permiso / Funcionalidad</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center' }}>🛡️ Admin General</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center' }}>🧠 Psicólogo / Apoyo</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center' }}>👔 Líder de Depto</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center' }}>👤 Miembro / Colaborador</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { key: 'alerts', label: 'Ver y Atender Alertas Emocionales Críticas' },
                        { key: 'create_tests', label: 'Crear y Programar Cuestionarios Personalizados' },
                        { key: 'view_analytics', label: 'Ver Analíticas Agregadas del Clima Institucional' },
                        { key: 'export_reports', label: 'Exportar Reportes Institucionales (JSON/CSV)' }
                      ].map(perm => (
                        <tr key={perm.key} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '14px 16px', fontWeight: '700' }}>{perm.label}</td>
                          <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                            <button onClick={() => togglePermission('superadmin', perm.key)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: rolePermissions.superadmin[perm.key] ? 'var(--success)' : 'var(--text-muted)' }}>
                              {rolePermissions.superadmin[perm.key] ? <CheckCircle2 size={20} /> : <UserX size={20} />}
                            </button>
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                            <button onClick={() => togglePermission('psicologo', perm.key)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: rolePermissions.psicologo[perm.key] ? 'var(--success)' : 'var(--text-muted)' }}>
                              {rolePermissions.psicologo[perm.key] ? <CheckCircle2 size={20} /> : <UserX size={20} />}
                            </button>
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                            <button onClick={() => togglePermission('lider_depto', perm.key)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: rolePermissions.lider_depto[perm.key] ? 'var(--success)' : 'var(--text-muted)' }}>
                              {rolePermissions.lider_depto[perm.key] ? <CheckCircle2 size={20} /> : <UserX size={20} />}
                            </button>
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                            <button onClick={() => togglePermission('miembro', perm.key)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: rolePermissions.miembro[perm.key] ? 'var(--success)' : 'var(--text-muted)' }}>
                              {rolePermissions.miembro[perm.key] ? <CheckCircle2 size={20} /> : <UserX size={20} />}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: BITÁCORA DE AUDITORÍA */}
        {activeTab === 'audit' && (
          <div className="glass-card animate-fade">
            <h3 style={{ fontSize: '17px', fontWeight: '900', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} style={{ color: 'var(--success)' }} /> Bitácora Inmutable de Auditoría del Sistema
            </h3>
            <div style={{ display: 'grid', gap: '10px', maxHeight: '480px', overflowY: 'auto' }}>
              {auditLogs.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>No hay eventos registrados.</p>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="futuristic-card-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--primary)' }}>{log.action}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>por {log.user_name}</span>
                      </div>
                      {log.details && <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px' }}>{log.details}</p>}
                    </div>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB DE GAMIFICACIÓN PROFESIONAL Y MI PROGRESO 🏆 */}
        {activeTab === 'progress' && (
          <MyProgress onBack={() => setActiveTab('analytics')} />
        )}

        {/* TAB 7: CENTRO DE 10 REPORTES DEL SISTEMA CON EXPORTACIÓN MULTIFORMATO (PDF, CSV, JSON) */}
        {activeTab === 'reports' && (
          <div className="animate-fade" style={{ display: 'grid', gap: '20px' }}>
            
            {/* Header del Centro de Reportes */}
            <div className="glass-card" style={{ overflow: 'visible' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileSpreadsheet size={20} style={{ color: 'var(--primary)' }} /> Centro Avanzado de Reportes e Informes Institucionales (10 Reportes)
                  </h3>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Selecciona cualquier reporte consolidado y expórtalo en PDF oficial para imprimir, CSV para Excel o JSON estructurado.
                  </p>
                </div>

                {/* Botones de Exportación Multiformato sin Emojis */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button 
                    type="button"
                    onClick={handleExportPDF} 
                    className="btn btn-primary"
                    style={{ padding: '8px 14px', fontSize: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800' }}
                  >
                    <Printer size={15} /> Exportar en PDF (Impresión)
                  </button>
                  <button 
                    type="button"
                    onClick={handleExportCSV} 
                    className="duo-pill"
                    style={{ padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Download size={14} /> Exportar en CSV (Excel)
                  </button>
                  <button 
                    type="button"
                    onClick={handleExportJSON} 
                    className="duo-pill"
                    style={{ padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <FileSpreadsheet size={14} /> Exportar en JSON
                  </button>
                </div>
              </div>

              {/* BARRA DE FILTROS AVANZADOS DE REPORTES */}
              <div style={{ 
                backgroundColor: 'var(--bg-secondary)', 
                borderRadius: '16px', 
                border: '1px solid var(--border)', 
                padding: '16px 20px', 
                marginBottom: '20px',
                display: 'grid',
                gap: '12px',
                overflow: 'visible'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)' }}>
                    <Sliders size={16} /> Filtros Avanzados de Consulta e Informes
                  </span>
                  
                  {/* Presets Rápidos de Fecha sin Emojis */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7)).toISOString().slice(0, 10);
                        setReportStartDate(sevenDaysAgo);
                        setReportEndDate(new Date().toISOString().slice(0, 10));
                      }}
                      className="duo-pill"
                      style={{ padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Zap size={12} /> Últimos 7 Días
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30)).toISOString().slice(0, 10);
                        setReportStartDate(thirtyDaysAgo);
                        setReportEndDate(new Date().toISOString().slice(0, 10));
                      }}
                      className="duo-pill"
                      style={{ padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Calendar size={12} /> Últimos 30 Días
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const currentYear = new Date().getFullYear();
                        setReportStartDate(`${currentYear}-01-01`);
                        setReportEndDate(new Date().toISOString().slice(0, 10));
                      }}
                      className="duo-pill"
                      style={{ padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Calendar size={12} /> Este Año
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReportStartDate('');
                        setReportEndDate('');
                        setReportDeptFilter('todos');
                        setReportStatusFilter('todos');
                        setReportRoleFilter('todos');
                      }}
                      className="duo-pill"
                      style={{ padding: '4px 10px', fontSize: '11px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <RotateCcw size={12} /> Limpiar Filtros
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  {/* Fecha Inicio */}
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      FECHA INICIO
                    </label>
                    <CustomDatePicker 
                      value={reportStartDate} 
                      onChange={(val) => setReportStartDate(val)} 
                      placeholder="Desde (YYYY-MM-DD)" 
                    />
                  </div>

                  {/* Fecha Fin */}
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      FECHA FIN
                    </label>
                    <CustomDatePicker 
                      value={reportEndDate} 
                      onChange={(val) => setReportEndDate(val)} 
                      placeholder="Hasta (YYYY-MM-DD)" 
                    />
                  </div>

                  {/* Departamento */}
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      DEPARTAMENTO
                    </label>
                    <CustomSelect
                      value={reportDeptFilter}
                      onChange={(val) => setReportDeptFilter(typeof val === 'string' ? val : val?.target?.value || 'todos')}
                      options={[
                        { value: 'todos', label: 'Todos los Departamentos' },
                        { value: 'General', label: 'General' },
                        { value: 'Recursos Humanos', label: 'Recursos Humanos' },
                        { value: 'Tecnología', label: 'Tecnología / TI' },
                        { value: 'Operaciones', label: 'Operaciones' },
                        { value: 'Ventas', label: 'Ventas' },
                        { value: 'Finanzas', label: 'Finanzas' },
                        { value: 'Salud y Apoyo', label: 'Salud y Bienestar' }
                      ]}
                    />
                  </div>

                  {/* Estado / Condición */}
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      ESTADO / RIESGO
                    </label>
                    <CustomSelect
                      value={reportStatusFilter}
                      onChange={(val) => setReportStatusFilter(typeof val === 'string' ? val : val?.target?.value || 'todos')}
                      options={[
                        { value: 'todos', label: 'Todos los Estados' },
                        { value: 'pendiente', label: 'Pendientes / Riesgo' },
                        { value: 'completada', label: 'Completadas / Atendidas' }
                      ]}
                    />
                  </div>
                </div>
              </div>

              {/* Selector de los 10 Reportes del Sistema sin Emojis */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                {[
                  { id: 'reporte_1_clima', title: '1. Clima & Indicadores', Icon: BarChart3 },
                  { id: 'reporte_2_alertas', title: '2. Alertas & Prioridades', Icon: AlertTriangle },
                  { id: 'reporte_3_tareas', title: '3. Cumplimiento de Tareas', Icon: CheckSquare },
                  { id: 'reporte_4_citas', title: '4. Citas Clínicas de Apoyo', Icon: Calendar },
                  { id: 'reporte_5_kudos', title: '5. Muro de Gratitud & Kudos', Icon: Heart },
                  { id: 'reporte_6_gamificacion', title: '6. Gamificación & XP', Icon: Award },
                  { id: 'reporte_7_usuarios', title: '7. Directorio de Usuarios', Icon: Users },
                  { id: 'reporte_8_tests', title: '8. Tests Estandarizados', Icon: ClipboardList },
                  { id: 'reporte_9_auditoria', title: '9. Auditoría de Seguridad', Icon: ShieldCheck },
                  { id: 'reporte_10_sugerencias', title: '10. Estrategia de IA Gemini', Icon: Sparkles }
                ].map(r => {
                  const IconComp = r.Icon || FileSpreadsheet;
                  const isSelected = (selectedReportId || 'reporte_1_clima') === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedReportId(r.id)}
                      className={`duo-card ${isSelected ? 'selected' : ''}`}
                      style={{ padding: '10px 12px', justifyContent: 'flex-start', gap: '8px', fontSize: '12px' }}
                    >
                      <IconComp size={16} style={{ color: isSelected ? 'var(--primary)' : 'var(--text-muted)' }} />
                      <span style={{ fontWeight: '800' }}>{r.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Vista Previa Interactiva del Documento Ejecutivo Oficial (Cero JSON) */}
            <div className="glass-card">
              {reportsLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', padding: '40px', color: 'var(--primary)' }}>
                  <Loader className="animate-spin" size={24} />
                  <span style={{ fontWeight: '800', fontSize: '13px' }}>Cargando informe consolidado...</span>
                </div>
              ) : !allReportsData ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: '13px' }}>No hay datos de reportes cargados aún.</p>
                  <button onClick={fetchAllReports} className="btn btn-primary" style={{ marginTop: '10px', padding: '6px 14px', fontSize: '12px' }}>
                    Cargar Informes
                  </button>
                </div>
              ) : (
                <div className="animate-fade" style={{ display: 'grid', gap: '20px' }}>
                  {(() => {
                    const safeReportId = selectedReportId || 'reporte_1_clima';
                    const currentRep = (allReportsData && allReportsData[safeReportId]) || {};
                    const filters = (allReportsData && allReportsData.filtros_aplicados) || {};
                    const detailList = Array.isArray(currentRep.detalle) ? currentRep.detalle : (Array.isArray(currentRep.detalle_catalogo) ? currentRep.detalle_catalogo : []);

                    return (
                      <div style={{ display: 'grid', gap: '20px' }}>
                        {/* ENCABEZADO INSTITUCIONAL */}
                        <div style={{
                          borderBottom: '2px solid var(--primary)',
                          paddingBottom: '16px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '12px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <img src="/logo.png" alt="Logo EquilibrIA" style={{ height: '44px', objectFit: 'contain' }} />
                            <div>
                              <span style={{ fontSize: '10px', fontWeight: '900', color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                DOCUMENTO OFICIAL INSTITUCIONAL • CONFIDENCIAL
                              </span>
                              <h2 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-primary)', marginTop: '2px' }}>
                                {currentRep.titulo || 'Informe Consolidado de Bienestar'}
                              </h2>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <span className="duo-pill" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: '900', fontSize: '11px' }}>
                              CÓDIGO: EQ-REP-{safeReportId.toUpperCase()}
                            </span>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                              Emisión: {allReportsData?.fecha_generacion || new Date().toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* FICHA TÉCNICA DEL INFORME */}
                        <div style={{
                          backgroundColor: 'var(--bg-secondary)',
                          borderRadius: '14px',
                          border: '1px solid var(--border)',
                          padding: '14px 18px',
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '12px',
                          fontSize: '12px'
                        }}>
                          <div>
                            <span style={{ color: 'var(--text-muted)', fontWeight: '600', display: 'block' }}>Institución Emisora:</span>
                            <p style={{ fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>{allReportsData?.institucion || 'EquilibrIA Central'}</p>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', fontWeight: '600', display: 'block' }}>Rango de Fechas:</span>
                            <p style={{ fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>{filters?.fecha_inicio || 'Inicio'} al {filters?.fecha_fin || 'Actual'}</p>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', fontWeight: '600', display: 'block' }}>Filtro Departamento:</span>
                            <p style={{ fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>{filters?.departamento || 'Todos'}</p>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', fontWeight: '600', display: 'block' }}>Estado de Consulta:</span>
                            <p style={{ fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>{filters?.estado || 'Todos'}</p>
                          </div>
                        </div>

                        {/* MÉTRICAS CLAVE / RESUMEN EJECUTIVO */}
                        <div>
                          <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Consolidado de Indicadores Ejecutivos
                          </h4>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                            {selectedReportId === 'reporte_1_clima' && (
                              <>
                                <div className="futuristic-card-item">
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>ESTRÉS PROMEDIO</span>
                                  <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#ef4444', marginTop: '4px' }}>{currentRep.estres_promedio}%</h3>
                                </div>
                                <div className="futuristic-card-item">
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>MOTIVACIÓN PROMEDIO</span>
                                  <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#10b981', marginTop: '4px' }}>{currentRep.motivacion_promedio}%</h3>
                                </div>
                                <div className="futuristic-card-item">
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>RIESGO DE BURNOUT</span>
                                  <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#f59e0b', marginTop: '4px' }}>{currentRep.burnout_promedio}%</h3>
                                </div>
                                <div className="futuristic-card-item">
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>TOTAL REFLEXIONES</span>
                                  <h3 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--primary)', marginTop: '4px' }}>{currentRep.total_reflexiones}</h3>
                                </div>
                              </>
                            )}

                            {selectedReportId === 'reporte_2_alertas' && (
                              <>
                                <div className="futuristic-card-item">
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>TOTAL ALERTAS</span>
                                  <h3 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--primary)', marginTop: '4px' }}>{currentRep.total_alertas}</h3>
                                </div>
                                <div className="futuristic-card-item">
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>ALERTAS PENDIENTES</span>
                                  <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#ef4444', marginTop: '4px' }}>{currentRep.pendientes}</h3>
                                </div>
                                <div className="futuristic-card-item">
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>ALERTAS ATENDIDAS</span>
                                  <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#10b981', marginTop: '4px' }}>{currentRep.atendidas}</h3>
                                </div>
                              </>
                            )}

                            {selectedReportId === 'reporte_3_tareas' && (
                              <>
                                <div className="futuristic-card-item">
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>TOTAL TAREAS</span>
                                  <h3 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--primary)', marginTop: '4px' }}>{currentRep.total_tareas}</h3>
                                </div>
                                <div className="futuristic-card-item">
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>POR HACER</span>
                                  <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#f59e0b', marginTop: '4px' }}>{currentRep.por_hacer}</h3>
                                </div>
                                <div className="futuristic-card-item">
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>EN PROCESO</span>
                                  <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#3b82f6', marginTop: '4px' }}>{currentRep.en_proceso}</h3>
                                </div>
                                <div className="futuristic-card-item">
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>COMPLETADAS</span>
                                  <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#10b981', marginTop: '4px' }}>{currentRep.completadas}</h3>
                                </div>
                              </>
                            )}

                            {selectedReportId !== 'reporte_1_clima' && selectedReportId !== 'reporte_2_alertas' && selectedReportId !== 'reporte_3_tareas' && (
                              <>
                                <div className="futuristic-card-item">
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>REGISTROS TOTALES</span>
                                  <h3 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--primary)', marginTop: '4px' }}>{detailList.length}</h3>
                                </div>
                                <div className="futuristic-card-item">
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>ESTADO DE AUDITORÍA</span>
                                  <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#10b981', marginTop: '8px' }}>AUDITADO OK</h3>
                                </div>
                                <div className="futuristic-card-item">
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>VALIDEZ INSTITUCIONAL</span>
                                  <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--primary)', marginTop: '8px' }}>VIGENTE</h3>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* TABLA FORMATEADA CON EL DETALLE DE HALLAZGOS */}
                        <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '14px', border: '1px solid var(--border)', padding: '16px', overflowX: 'auto' }}>
                          <h4 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '12px', color: 'var(--text-primary)' }}>
                            Detalle Consolidado de Registros en el Reporte
                          </h4>

                          {detailList.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>
                              No hay registros detallados disponibles para este rango de consulta o filtros seleccionados.
                            </div>
                          ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                              <thead>
                                <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)' }}>
                                  <th style={{ padding: '8px 12px' }}>#</th>
                                  <th style={{ padding: '8px 12px' }}>CONCEPTO / TITULO</th>
                                  <th style={{ padding: '8px 12px' }}>CATEGORIA / DEPARTAMENTO</th>
                                  <th style={{ padding: '8px 12px' }}>ESTADO</th>
                                  <th style={{ padding: '8px 12px' }}>FECHA REGISTRO</th>
                                </tr>
                              </thead>
                              <tbody>
                                {detailList.map((item, idx) => (
                                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '10px 12px', fontWeight: '700' }}>{idx + 1}</td>
                                    <td style={{ padding: '10px 12px', fontWeight: '700', color: 'var(--text-primary)' }}>
                                      {item.title || item.user_name || item.action || item.suggestion || item.reason || item.receiver_name || `Registro #${idx+1}`}
                                    </td>
                                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                                      {item.user_department || item.receiver_dept || item.department || item.category || item.role || 'General'}
                                    </td>
                                    <td style={{ padding: '10px 12px' }}>
                                      <span className="duo-pill" style={{ padding: '2px 8px', fontSize: '10.5px' }}>
                                        {item.status || item.risk_level || item.board_column || item.sentiment || 'Activo'}
                                      </span>
                                    </td>
                                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>
                                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : item.date_time ? new Date(item.date_time).toLocaleDateString() : 'N/A'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>

                        {/* SECCIÓN OFICIAL DE FIRMA Y CERTIFICACIÓN INSTITUCIONAL */}
                        <div style={{
                          backgroundColor: 'var(--bg-secondary)',
                          borderRadius: '16px',
                          border: '1.5px solid var(--border)',
                          padding: '24px 28px',
                          marginTop: '8px',
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                          gap: '24px',
                          alignItems: 'center'
                        }}>
                          <div>
                            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                              FIRMA AUTORIZADA DE EMISIÓN Y AUDITORÍA
                            </span>
                            <div style={{ marginTop: '36px', borderTop: '2px solid var(--text-primary)', paddingTop: '8px' }}>
                              <p style={{ fontSize: '13.5px', fontWeight: '900', color: 'var(--text-primary)' }}>
                                Dra. Sofía Ramírez
                              </p>
                              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                                Dirección de Bienestar Emocional & Salud Institucional
                              </p>
                              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                EquilibrIA Platform Certificación Oficial
                              </p>
                            </div>
                          </div>

                          <div style={{
                            border: '2px dashed var(--primary)',
                            borderRadius: '14px',
                            padding: '16px 20px',
                            textAlign: 'center',
                            backgroundColor: 'var(--primary-light)'
                          }}>
                            <ShieldCheck size={28} style={{ color: 'var(--primary)', margin: '0 auto 6px auto' }} />
                            <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--primary)', display: 'block', textTransform: 'uppercase' }}>
                              SELLO INSTITUCIONAL DE VALIDACIÓN
                            </span>
                            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              Documento verificado y procesado de conformidad con normativas de confidencialidad y salud ocupacional.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 8: SUGERENCIAS IA */}
        {activeTab === 'ai_plans' && (
          <div className="glass-card animate-fade" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Sparkles size={20} style={{ color: 'var(--accent)' }} />
              <h3 style={{ fontSize: '17px', fontWeight: '900' }}>Plan de Acción Recomendado por Gemini</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>Sugerencias anónimas para actividades o pausas institucionales.</p>
            <div style={{ display: 'grid', gap: '14px' }}>
              {suggestions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)' }}>Aún no hay recomendaciones acumuladas de IA.</div>
              ) : (
                suggestions.map((sug) => (
                  <div key={sug.id} className="futuristic-card-item" style={{ borderLeft: '5px solid var(--accent)' }}>
                    <p style={{ fontSize: '13.5px', fontWeight: '600', marginBottom: '6px' }}>"{sug.suggestion}"</p>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{new Date(sug.created_at).toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 9: TIENDA DE RECOMPENSAS (SUPERADMIN / ADMIN) */}
        {activeTab === 'rewards' && (
          <div className="glass-card animate-fade">
            <h3 style={{ fontSize: '17px', fontWeight: '900', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} style={{ color: 'var(--primary)' }} /> Tienda Institucional de Recompensas XP
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Catálogo de incentivos y reconocimientos habilitados para los miembros de la institución.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              {rewards.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No hay recompensas registradas.</p>
              ) : (
                rewards.map(r => (
                  <div key={r.id} className="futuristic-card-item" style={{ padding: '16px' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>{r.icon || '🏅'}</div>
                    <h4 style={{ fontSize: '14.5px', fontWeight: '800' }}>{r.title}</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '6px 0' }}>{r.description}</p>
                    <span style={{ fontSize: '12px', fontWeight: '900', color: 'var(--primary)' }}>Costo: {r.cost_xp} XP</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 10: CHAT ENTRE COLEGAS Y GRUPOS DE TRABAJO */}
        {activeTab === 'kudos' && (
          <div className="glass-card animate-fade" style={{ padding: '0', overflow: 'hidden', borderRadius: '24px', border: '1px solid var(--border)', height: '650px', display: 'flex' }}>
            
            {/* Panel Izquierdo: Directorio de Canales, Grupos y Colegas */}
            <div style={{ width: '300px', backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-tertiary)' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={16} style={{ color: 'var(--primary)' }} /> Chat & Grupos entre Colegas
                </h4>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Canales de equipo e interacción</span>

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
                        No hay mensajes en esta sala de chat. ¡Sé el primero en escribir un mensaje a tus colegas!
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

        {/* TAB 11: ASISTENTE E INSPIRADOR DE BIENESTAR CON IA (GEMINI) UNIFICADO */}
        {activeTab === 'chat_ia' && (
          <div className="animate-fade" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="glow-card" style={{ marginBottom: '20px', padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Bot size={24} style={{ color: 'var(--primary)' }} />
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '900' }}>Orientador de Bienestar IA</h3>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>Soporte conversacional de Gemini basado en tu historial e indicadores institucionales.</p>
                </div>
              </div>
            </div>

            <div className="chat-container" style={{ height: '440px' }}>
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
                <input 
                  type="text" 
                  placeholder="Conversa con la IA sobre tus sensaciones, clima o estrategias..." 
                  value={userInput} 
                  onChange={(e) => setUserInput(e.target.value)} 
                  disabled={chatLoading} 
                />
                <button type="submit" className="btn btn-primary" disabled={chatLoading || !userInput.trim()} style={{ padding: '0 16px' }}>
                  <SendHorizontal size={16} />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 12: MÓDULO DE GESTIÓN DE INSTITUCIONES Y DEPARTAMENTOS (SUPERADMIN / ADMIN) */}
        {activeTab === 'institutions' && (
          <div className="animate-fade" style={{ display: 'grid', gap: '20px' }}>
            <div className="glass-card">
              <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building size={20} style={{ color: 'var(--primary)' }} /> Gestión de Instituciones y Departamentos Reales (Supabase)
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Crea y administra las organizaciones e instituciones vinculadas a la plataforma relacional.
              </p>

              {/* Formulario de Creación de Institución */}
              <form onSubmit={handleCreateInstitution} style={{ display: 'grid', gridTemplateColumns: '1fr 200px auto', gap: '12px', alignItems: 'end', marginBottom: '24px', backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', display: 'block', marginBottom: '6px' }}>NOMBRE DE LA NUEVA INSTITUCIÓN:</label>
                  <input
                    type="text"
                    placeholder="Ej. Universidad Central, Tecnologías S.A. o Colegio San Pablo"
                    value={newInstName}
                    onChange={(e) => setNewInstName(e.target.value)}
                    required
                    style={{ borderRadius: '10px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', display: 'block', marginBottom: '6px' }}>TIPO / SECTOR:</label>
                  <CustomSelect
                    options={[
                      { value: 'educativa', label: 'Educativa / Universidad' },
                      { value: 'laboral', label: 'Empresa / Corporativo' },
                      { value: 'salud', label: 'Salud / Clínica' },
                      { value: 'comunitaria', label: 'Comunitaria / ONG' }
                    ]}
                    value={newInstType}
                    onChange={(val) => setNewInstType(val)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={instCreateLoading}
                  style={{ padding: '12px 20px', borderRadius: '12px', fontWeight: '900', height: '44px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {instCreateLoading ? <Loader className="animate-spin" size={16} /> : <PlusCircle size={16} />}
                  <span>Crear Institución Real</span>
                </button>
              </form>

              {/* Listado de Instituciones en Supabase */}
              <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)', marginBottom: '12px' }}>
                Instituciones Registradas en Supabase ({allInstitutions.length}):
              </h4>
              <div className="grid grid-2" style={{ gap: '16px' }}>
                {allInstitutions.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>No hay instituciones creadas aún.</p>
                ) : (
                  allInstitutions.map((inst) => (
                    <div key={inst.id} className="futuristic-card-item" style={{ padding: '18px', borderLeft: '4px solid var(--primary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '900' }}>{inst.name}</h4>
                        <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '10px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', textTransform: 'uppercase' }}>
                          {inst.type}
                        </span>
                      </div>
                      
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                        👥 Miembros Totales: <strong>{inst.total_members}</strong> • Creado: {new Date(inst.created_at).toLocaleDateString()}
                      </div>

                      {/* Lista de Departamentos */}
                      <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '10px' }}>
                        <span style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                          DEPARTAMENTOS ACTIVOS EN ESTA INSTITUCIÓN:
                        </span>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {(inst.departments || []).map((d) => (
                            <span key={d} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', fontWeight: '700' }}>
                              🏢 {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODAL DE RESPUESTAS INDIVIDUALES POR COLABORADOR */}
        {selectedSubmission && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            animation: 'fadeIn 0.2s ease'
          }}>
            <div className="glass-card animate-scale" style={{ maxWidth: '720px', width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: '28px', border: '2px solid var(--primary)', borderRadius: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '14px', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase' }}>
                    Detalle Completo de Respuestas del Colaborador
                  </span>
                  <h3 style={{ fontSize: '18px', fontWeight: '900', marginTop: '2px' }}>
                    {selectedSubmission.user_name} <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>({selectedSubmission.user_email || 'Anónimo'})</span>
                  </h3>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    Departamento: <strong>{selectedSubmission.user_department || 'General'}</strong> • Fecha: {new Date(selectedSubmission.created_at).toLocaleString()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSubmission(null)}
                  style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '24px', fontWeight: 'bold' }}
                >
                  ×
                </button>
              </div>

              {/* Métricas de IA */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '18px' }}>
                <div style={{ padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700' }}>ESTRÉS</span>
                  <span style={{ fontSize: '18px', fontWeight: '900', display: 'block', color: 'var(--danger)', marginTop: '2px' }}>{selectedSubmission.stress_score}%</span>
                </div>
                <div style={{ padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700' }}>MOTIVACIÓN</span>
                  <span style={{ fontSize: '18px', fontWeight: '900', display: 'block', color: 'var(--success)', marginTop: '2px' }}>{selectedSubmission.motivation_score}%</span>
                </div>
                <div style={{ padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700' }}>AGOTAMIENTO</span>
                  <span style={{ fontSize: '18px', fontWeight: '900', display: 'block', color: 'var(--warning)', marginTop: '2px' }}>{selectedSubmission.burnout_score}%</span>
                </div>
              </div>

              {/* Contenido de Respuestas */}
              <div style={{ marginBottom: '18px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary)', marginBottom: '8px' }}>
                  Respuestas de las Preguntas del Test:
                </h4>
                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border)', fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
                  {selectedSubmission.original_text}
                </div>
              </div>

              {/* Notas Diagnósticas Manuales */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--primary)', display: 'block', marginBottom: '6px' }}>
                  🧠 DIAGNÓSTICO CLÍNICO Y OBSERVACIONES DE LA PSICÓLOGA:
                </label>
                <textarea
                  rows="3"
                  placeholder="Escribe tus observaciones clínicas o notas de seguimiento confidenciales..."
                  value={clinicalNotesMap[selectedSubmission.id] !== undefined ? clinicalNotesMap[selectedSubmission.id] : (selectedSubmission.clinical_notes || '')}
                  onChange={(e) => setClinicalNotesMap(prev => ({ ...prev, [selectedSubmission.id]: e.target.value }))}
                  style={{ width: '100%', fontSize: '12.5px', padding: '10px', borderRadius: '10px', marginBottom: '10px' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    handleSaveClinicalNotes(selectedSubmission.id);
                    showAlert('success', 'Diagnóstico Guardado', 'Las notas clínicas se guardaron exitosamente.');
                  }}
                  className="btn btn-primary"
                  disabled={savingClinicalId === selectedSubmission.id}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', fontWeight: '900' }}
                >
                  {savingClinicalId === selectedSubmission.id ? <Loader className="animate-spin" size={16} /> : '💾 Guardar Diagnóstico Clínico'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL DE CREACIÓN DE GRUPOS DE TRABAJO */}
        {showCreateGroupModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            animation: 'fadeIn 0.2s ease'
          }}>
            <div className="glass-card animate-scale" style={{ maxWidth: '480px', width: '100%', padding: '24px', borderRadius: '24px', border: '2px solid var(--primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserPlus size={18} style={{ color: 'var(--primary)' }} /> Crear Nuevo Grupo de Trabajo
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCreateGroupModal(false)}
                  style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold' }}
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateGroup} style={{ display: 'grid', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    NOMBRE DEL GRUPO DE TRABAJO:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Proyecto Innovación 🚀 o Equipo Tecnología 💡"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    required
                    style={{ width: '100%', borderRadius: '12px', padding: '10px 14px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    SELECCIONAR INTEGRANTES DEL GRUPO:
                  </label>
                  <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'grid', gap: '6px', backgroundColor: 'var(--bg-secondary)', padding: '10px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    {members.map(m => {
                      const name = `${m.first_name} ${m.last_name}`;
                      const isSelected = newGroupMembers.includes(name);
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setNewGroupMembers(prev => prev.filter(n => n !== name));
                            } else {
                              setNewGroupMembers(prev => [...prev, name]);
                            }
                          }}
                          className={`duo-card ${isSelected ? 'selected' : ''}`}
                          style={{ justifyContent: 'space-between', padding: '8px 12px', fontSize: '12px' }}
                        >
                          <span>👤 {name} ({m.department || 'General'})</span>
                          {isSelected && <Check size={14} style={{ color: 'var(--primary)' }} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '12px', borderRadius: '12px', fontWeight: '900', marginTop: '10px' }}
                >
                  ✨ Crear y Abrir Grupo
                </button>
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

export default AdminDashboard;
