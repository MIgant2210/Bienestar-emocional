import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { 
  Sun, Moon, LogOut, ShieldAlert, Award, FileText, Users, BarChart3, 
  PlusCircle, Trash2, Calendar, ClipboardList, Sparkles, Loader, CheckCircle2,
  AlertTriangle, CheckSquare, Settings, Activity, ShieldCheck, Download,
  UserCheck, Lock, FileSpreadsheet, RefreshCw, RotateCcw, Zap, Layers, HelpCircle, Eye, Sliders,
  Target, ChevronRight, Check, ArrowLeft, Volume2, Mic, Bell, UserX, Key, Palette, Edit3, KeyRound, Heart, Bot, SendHorizontal, Building, MessageSquare, Smile, UserPlus, Plus, X, Printer, Trophy, Brain,
  Search, Filter, Copy, CheckCircle, ExternalLink, Shield, ToggleLeft, ToggleRight, ChevronLeft,
  ThumbsUp, ThumbsDown, BookOpen, Globe, Tag
} from 'lucide-react';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
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
import InstitutionalReportView from '../components/reports/InstitutionalReportView';
import { useNavigate } from 'react-router-dom';
import { hasModuleAccess } from '../components/ProtectedRoute';

const TAB_TO_URL = {
  bienestar: '/mi-bienestar',
  analytics: '/analiticas',
  tasks: '/tareas',
  alerts: '/alertas',
  evaluations: '/tests',
  clinical_appointments: '/agenda',
  members: '/usuarios',
  institutions: '/instituciones',
  progress: '/mi-progreso',
  kudos: '/kudos',
  reports: '/reportes',
  audit: '/auditoria',
  ai_plans: '/sugerencias-ia',
  chat_ia: '/chatbot-ia',
  culture: '/cultura'
};

const AdminDashboard = ({ initialTab = 'analytics' }) => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme, colorPalette, changePalette, PALETTES } = useContext(ThemeContext);
  const navigate = useNavigate();

  // System Alert Toast State
  const [systemAlert, setSystemAlert] = useState({ show: false, type: 'info', title: '', message: '' });
  const showAlert = (type, title, message) => {
    setSystemAlert({ show: true, type, title, message });
  };

  const cleanEvalTitle = (title) => {
    if (!title) return '';
    return title.replace(/^\[Plantilla(?:\s+Express)?\]\s*/i, '').replace(/^Plantilla\s+/i, '').trim();
  };

  // Selected Submission Modal State (por colaborador individual)
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Reference for Appointment Form Scroll
  const apptFormRef = useRef(null);

  // Tab State sincronizado con la URL
  const [activeTab, setActiveTab] = useState(initialTab);

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
  const paletteMenuRef = useRef(null);

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

  const [editingUser, setEditingUser] = useState(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editRole, setEditRole] = useState('miembro');
  const [editDept, setEditDept] = useState('General');
  const [editDeptId, setEditDeptId] = useState('');
  const [editStatus, setEditStatus] = useState('ACTIVE');
  const [editPassword, setEditPassword] = useState('');
  const [userUpdateLoading, setUserUpdateLoading] = useState(false);
  const [userUpdateMsg, setUserUpdateMsg] = useState('');

  // Filtros Avanzados de Miembros
  const [memberSearchText, setMemberSearchText] = useState('');
  const [memberRoleFilter, setMemberRoleFilter] = useState('todos');
  const [memberDeptFilter, setMemberDeptFilter] = useState('todos');
  const [memberStatusFilter, setMemberStatusFilter] = useState('todos');
  const [memberInstFilter, setMemberInstFilter] = useState('todos');

  // Reseteo de Contraseña y Transferencia Institucional
  const [resetPassModalData, setResetPassModalData] = useState(null);
  const [resetPassLoading, setResetPassLoading] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferTargetUser, setTransferTargetUser] = useState(null);
  const [transferTargetInstId, setTransferTargetInstId] = useState('');
  const [transferTargetDeptId, setTransferTargetDeptId] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);

  // Notification Drawer State (Generado 100% en vivo desde la base de datos)
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Módulo de Gestión de Instituciones y Departamentos States (Superadmin / Admins)
  const [instSubTab, setInstSubTab] = useState('institutions'); // 'institutions', 'departments', 'invitations'
  const [allInstitutions, setAllInstitutions] = useState([]);
  const [selectedInstForDepts, setSelectedInstForDepts] = useState('');
  const [instCreateLoading, setInstCreateLoading] = useState(false);
  const [newInstName, setNewInstName] = useState('');
  const [newInstType, setNewInstType] = useState('educativa');
  const [newInstDesc, setNewInstDesc] = useState('');
  const [newInstEmail, setNewInstEmail] = useState('');
  const [newInstPhone, setNewInstPhone] = useState('');
  const [newInstCountry, setNewInstCountry] = useState('Guatemala');
  const [newInstCity, setNewInstCity] = useState('');
  const [newInstDomains, setNewInstDomains] = useState('');
  const [newInstRequireDomain, setNewInstRequireDomain] = useState(false);

  // Departamentos States
  const [departmentsList, setDepartmentsList] = useState([]);
  const [deptsLoading, setDeptsLoading] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');
  const [newDeptLeaderId, setNewDeptLeaderId] = useState('');
  const [deptCreateLoading, setDeptCreateLoading] = useState(false);

  // Invitaciones States
  const [invitationsList, setInvitationsList] = useState([]);
  const [invLoading, setInvLoading] = useState(false);
  const [newInvRole, setNewInvRole] = useState('miembro');
  const [newInvDeptId, setNewInvDeptId] = useState('');
  const [newInvMaxUses, setNewInvMaxUses] = useState('');
  const [newInvExpiresDays, setNewInvExpiresDays] = useState('30');
  const [invCreateLoading, setInvCreateLoading] = useState(false);
  const [copiedInvCode, setCopiedInvCode] = useState(null);

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
  const [reportScope, setReportScope] = useState('institution'); // 'institution', 'department', 'user'
  const [reportTargetUserId, setReportTargetUserId] = useState('');
  const [reportTargetUserObj, setReportTargetUserObj] = useState(null);
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [reportQuickRange, setReportQuickRange] = useState('');
  const [reportDeptFilter, setReportDeptFilter] = useState('todos');
  const [reportStatusFilter, setReportStatusFilter] = useState('todos');
  const [reportRoleFilter, setReportRoleFilter] = useState('todos');
  const [reportRiskFilter, setReportRiskFilter] = useState('todos');
  const [reportPriorityFilter, setReportPriorityFilter] = useState('todos');
  
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
  const [privacyCountdown, setPrivacyCountdown] = useState(20);

  // Auto-cierre del aviso de confidencialidad a los 20 segundos
  useEffect(() => {
    if (!showPrivacyNotice) return;
    const interval = setInterval(() => {
      setPrivacyCountdown(prev => {
        if (prev <= 1) {
          setShowPrivacyNotice(false);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showPrivacyNotice]);

  // Form States: Tasks
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskCategory, setTaskCategory] = useState('Bienestar');
  const [taskPriority, setTaskPriority] = useState('Media');
  const [taskEstMinutes, setTaskEstMinutes] = useState(15);
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskAssignedType, setTaskAssignedType] = useState('all');
  const [taskAssignedTarget, setTaskAssignedTarget] = useState('');
  const [taskResourceId, setTaskResourceId] = useState('');
  const [availableResources, setAvailableResources] = useState([]);
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
  const [adminTestStep, setAdminTestStep] = useState('intro'); // 'intro' | 'question'
  const [adminTestCurrentQIndex, setAdminTestCurrentQIndex] = useState(0);
  const [adminTestMascotMood, setAdminTestMascotMood] = useState('welcome');
  const [showAdminConfirmModal, setShowAdminConfirmModal] = useState(false);

  // Estado para Diccionario Cultural Guatemalteco 🇬🇹 (SuperAdmin)
  const [culturalExpressions, setCulturalExpressions] = useState([]);
  const [culturalCounts, setCulturalCounts] = useState({ total: 0, allowed: 0, explainable: 0, restricted: 0 });
  const [cultureSafetyFilter, setCultureSafetyFilter] = useState('ALL');
  const [cultureSearch, setCultureSearch] = useState('');
  const [cultureLoading, setCultureLoading] = useState(false);
  const [showExprModal, setShowExprModal] = useState(false);
  const [editingExpr, setEditingExpr] = useState(null);
  const [exprForm, setExprForm] = useState({
    term: '',
    meaning: '',
    example: '',
    category: 'GUATEMALTEQUISMO',
    safety_level: 'ALLOWED',
    can_use: true,
    can_explain: true,
    context_notes: ''
  });

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
    try {
      // 1. Cargar paquete agregado de alto rendimiento
      const [bundleRes, tasksRes, membersRes] = await Promise.allSettled([
        api.get('/reports/dashboard-bundle'),
        api.get('/tasks'),
        api.get('/institutions/members')
      ]);

      if (bundleRes.status === 'fulfilled' && bundleRes.value?.data) {
        const bundle = bundleRes.value.data;
        setStats({
          averages: bundle.averages || { stress: 0, motivation: 0, burnout: 0, total_reflections: 0 },
          sentiment_distribution: bundle.sentiment_distribution || { Positivo: 0, Neutro: 0, Negativo: 0 },
          historical_trends: bundle.historical_trends || [],
          total_members: bundle.total_members || bundle.active_users_count || 0
        });
        if (bundle.pending_alerts) setAlerts(bundle.pending_alerts);
      }
      if (tasksRes.status === 'fulfilled' && tasksRes.value?.data) setTasks(tasksRes.value.data);
      if (membersRes.status === 'fulfilled' && membersRes.value?.data) setMembers(membersRes.value.data);
    } catch (err) {
      console.error('Error al cargar datos base del dashboard:', err);
    } finally {
      setLoading(false);
    }

    // 2. Cargar instituciones, sugerencias, evaluaciones y plantillas precargadas
    try {
      fetchInstitutionsAll();
      fetchTemplates();
      api.get('/institutions/suggestions').then(res => { if (res.data) setSuggestions(res.data); }).catch(() => {});
      api.get('/evaluations').then(res => { if (res.data) setEvaluations(res.data); }).catch(() => {});
    } catch (err) {
      console.error('Error al cargar datos secundarios:', err);
    }
  };

  const fetchResourcesList = async () => {
    try {
      const res = await api.get('/wellbeing/resources');
      if (res.data && res.data.resources) {
        setAvailableResources(res.data.resources);
      }
    } catch (err) {
      console.warn('Error al cargar catálogo de recursos:', err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/evaluations/templates');
      if (res.data && Array.isArray(res.data)) {
        setTemplates(res.data);
      }
    } catch (err) {
      console.error('Error al cargar plantillas de evaluación:', err);
    }
  };

  const fetchInstitutionsAll = async () => {
    if (!user) return;
    try {
      if (user.role === 'superadmin' || user.role === 'admin_institucion') {
        const res = await api.get('/institutions/all');
        const instData = res.data || [];
        setAllInstitutions(instData);
        if (instData.length > 0 && !selectedInstForDepts) {
          setSelectedInstForDepts(user.role === 'superadmin' ? instData[0].id : (user.institution_id || instData[0].id));
        }
      } else if (user.institution_id) {
        setSelectedInstForDepts(user.institution_id);
      }
    } catch (err) {
      console.warn('Instituciones no disponibles para este rol:', err);
    }
  };

  const fetchDepartmentsForInst = async (instId) => {
    if (!instId) return;
    setDeptsLoading(true);
    try {
      const res = await api.get(`/institutions/${instId}/departments`);
      setDepartmentsList(res.data);
    } catch (err) {
      console.error('Error al cargar departamentos:', err);
    } finally {
      setDeptsLoading(false);
    }
  };

  const fetchInvitationsForInst = async (instId) => {
    if (!instId || (user && user.role !== 'superadmin' && user.role !== 'admin_institucion')) return;
    setInvLoading(true);
    try {
      const res = await api.get(`/institutions/${instId}/invitations`);
      setInvitationsList(res.data);
    } catch (err) {
      console.error('Error al cargar invitaciones:', err);
    } finally {
      setInvLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'tasks') {
      fetchResourcesList();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'evaluations' || evalSubTab === 'templates') {
      fetchTemplates();
    }
  }, [activeTab, evalSubTab]);

  useEffect(() => {
    if (activeTab === 'culture') {
      fetchCulturalExpressions();
    }
  }, [activeTab, cultureSafetyFilter, cultureSearch]);

  useEffect(() => {
    if (selectedInstForDepts) {
      fetchDepartmentsForInst(selectedInstForDepts);
      fetchInvitationsForInst(selectedInstForDepts);
    }
  }, [selectedInstForDepts]);

  // Generador Dinámico de Notificaciones
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

  const handleCreateInstitution = async (e) => {
    e.preventDefault();
    if (!newInstName.trim()) return;
    setInstCreateLoading(true);
    try {
      const res = await api.post('/institutions', {
        name: newInstName.trim(),
        type: newInstType,
        description: newInstDesc.trim(),
        email: newInstEmail.trim(),
        phone: newInstPhone.trim(),
        country: newInstCountry.trim(),
        city: newInstCity.trim(),
        allowed_domains: newInstDomains.trim(),
        require_institutional_domain: newInstRequireDomain
      });
      setNewInstName('');
      setNewInstDesc('');
      setNewInstEmail('');
      setNewInstPhone('');
      setNewInstCity('');
      setNewInstDomains('');
      setNewInstRequireDomain(false);
      showAlert('success', 'Institución Creada', res.data.message);
      fetchInstitutionsAll();
    } catch (err) {
      showAlert('danger', 'Error de Creación', err.response?.data?.message || 'Error al crear institución.');
    } finally {
      setInstCreateLoading(false);
    }
  };

  const handleToggleInstitutionStatus = async (instId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const actionText = newStatus === 'SUSPENDED' ? 'suspender' : 'reactivar';
    if (!window.confirm(`¿Está seguro de que desea ${actionText} esta institución?`)) return;
    try {
      const res = await api.patch(`/institutions/${instId}/status`, { status: newStatus });
      showAlert('success', 'Estado Actualizado', res.data.message);
      fetchInstitutionsAll();
    } catch (err) {
      showAlert('danger', 'Error de Estado', err.response?.data?.message || 'Error al cambiar estado.');
    }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    const instId = user?.role === 'superadmin' ? selectedInstForDepts : user?.institution_id;
    if (!instId || !newDeptName.trim() || !newDeptCode.trim()) return;
    setDeptCreateLoading(true);
    try {
      const res = await api.post(`/institutions/${instId}/departments`, {
        name: newDeptName.trim(),
        code: newDeptCode.trim().toUpperCase(),
        description: newDeptDesc.trim(),
        leader_id: newDeptLeaderId || null
      });
      setNewDeptName('');
      setNewDeptCode('');
      setNewDeptDesc('');
      setNewDeptLeaderId('');
      showAlert('success', 'Departamento Creado', res.data.message);
      fetchDepartmentsForInst(instId);
      fetchInstitutionsAll();
    } catch (err) {
      showAlert('danger', 'Error al Crear Departamento', err.response?.data?.message || 'Error al crear departamento.');
    } finally {
      setDeptCreateLoading(false);
    }
  };

  const handleToggleDeptStatus = async (instId, deptId) => {
    try {
      const res = await api.patch(`/institutions/${instId}/departments/${deptId}/status`);
      showAlert('success', 'Departamento Actualizado', res.data.message);
      fetchDepartmentsForInst(instId);
      fetchInstitutionsAll();
    } catch (err) {
      showAlert('danger', 'Error al Actualizar Depto', err.response?.data?.message || 'Error al modificar departamento.');
    }
  };

  const handleCreateInvitation = async (e) => {
    e.preventDefault();
    const instId = user?.role === 'superadmin' ? selectedInstForDepts : user?.institution_id;
    if (!instId) return;
    setInvCreateLoading(true);
    try {
      const res = await api.post(`/institutions/${instId}/invitations`, {
        role: newInvRole,
        department_id: newInvDeptId || null,
        max_uses: newInvMaxUses ? parseInt(newInvMaxUses) : null,
        expires_in_days: parseInt(newInvExpiresDays) || 30
      });
      setNewInvMaxUses('');
      showAlert('success', 'Invitación Generada', `Código generado: ${res.data.invitation.code}`);
      fetchInvitationsForInst(instId);
    } catch (err) {
      showAlert('danger', 'Error de Invitación', err.response?.data?.message || 'Error al generar invitación.');
    } finally {
      setInvCreateLoading(false);
    }
  };

  const handleRevokeInvitation = async (instId, invId) => {
    if (!window.confirm('¿Está seguro de que desea revocar este código de invitación? No podrá volver a usarse.')) return;
    try {
      const res = await api.post(`/institutions/${instId}/invitations/${invId}/revoke`);
      showAlert('success', 'Invitación Revocada', res.data.message);
      fetchInvitationsForInst(instId);
    } catch (err) {
      showAlert('danger', 'Error al Revocar', err.response?.data?.message || 'Error al revocar invitación.');
    }
  };

  const openEditUserModal = (u) => {
    setEditingUser(u);
    setEditFirstName(u.first_name || '');
    setEditLastName(u.last_name || '');
    setEditRole(u.role || 'miembro');
    setEditDept(u.department || 'General');
    setEditDeptId(u.department_id || '');
    setEditStatus(u.status || 'ACTIVE');
    setUserUpdateMsg('');
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setUserUpdateLoading(true);
    setUserUpdateMsg('');
    try {
      const payload = {
        first_name: editFirstName.trim(),
        last_name: editLastName.trim(),
        role: editRole,
        department: editDept,
        department_id: editDeptId || null,
        status: editStatus
      };
      const res = await api.put(`/institutions/members/${editingUser.id}`, payload);
      setUserUpdateMsg(res.data.message);
      showAlert('success', 'Usuario Actualizado', res.data.message);
      const membersRes = await api.get('/institutions/members');
      if (membersRes.data) setMembers(membersRes.data);
      setTimeout(() => {
        setEditingUser(null);
        setUserUpdateMsg('');
      }, 1200);
    } catch (err) {
      const errTxt = err.response?.data?.message || 'Error al actualizar el usuario';
      showAlert('danger', 'Error al Actualizar', errTxt);
      setUserUpdateMsg(errTxt);
    } finally {
      setUserUpdateLoading(false);
    }
  };

  const handleGeneratePasswordReset = async (targetUser) => {
    setResetPassLoading(true);
    try {
      const res = await api.post(`/institutions/members/${targetUser.id}/reset-password`);
      setResetPassModalData({
        user: targetUser,
        reset_link: `${window.location.origin}${res.data.reset_link}`
      });
      showAlert('success', 'Enlace Generado', 'Enlace de restablecimiento generado de manera segura.');
    } catch (err) {
      showAlert('danger', 'Error', err.response?.data?.message || 'Error al generar restablecimiento.');
    } finally {
      setResetPassLoading(false);
    }
  };

  const handleMemberStatusAction = async (userId, action) => {
    try {
      const res = await api.post(`/institutions/members/${userId}/status-action`, { action });
      showAlert('success', 'Estado de Cuenta', res.data.message);
      fetchDashboardData();
    } catch (err) {
      showAlert('danger', 'Error de Acción', err.response?.data?.message || 'Error al modificar estado de la cuenta.');
    }
  };

  const openTransferModal = (u) => {
    setTransferTargetUser(u);
    setTransferTargetInstId(allInstitutions[0]?.id || '');
    setTransferTargetDeptId('');
    setShowTransferModal(true);
  };

  const handleTransferUserSubmit = async (e) => {
    e.preventDefault();
    if (!transferTargetUser || !transferTargetInstId) return;
    setTransferLoading(true);
    try {
      const res = await api.patch(`/institutions/members/${transferTargetUser.id}/transfer`, {
        institution_id: transferTargetInstId,
        department_id: transferTargetDeptId || null
      });
      showAlert('success', 'Usuario Transferido', res.data.message);
      setShowTransferModal(false);
      const membersRes = await api.get('/institutions/members');
      if (membersRes.data) setMembers(membersRes.data);
      fetchInstitutionsAll();
    } catch (err) {
      showAlert('danger', 'Error de Transferencia', err.response?.data?.message || 'Error al transferir usuario.');
    } finally {
      setTransferLoading(false);
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
      assigned_target: taskAssignedTarget,
      resource_id: taskResourceId || null
    };

    try {
      await api.post('/tasks', payload);
      setCreateSuccess('Tarea asignada y publicada exitosamente.');
      setTaskTitle('');
      setTaskDesc('');
      setTaskDueDate('');
      setTaskAssignedTarget('');
      setTaskResourceId('');
      
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

  // Funciones para Gestión del Diccionario Cultural Guatemalteco 🇬🇹
  const fetchCulturalExpressions = async () => {
    try {
      setCultureLoading(true);
      const params = {};
      if (cultureSafetyFilter !== 'ALL') params.safety_level = cultureSafetyFilter;
      if (cultureSearch) params.search = cultureSearch;
      const res = await api.get('/culture/expressions', { params });
      setCulturalExpressions(res.data.expressions || []);
      setCulturalCounts(res.data.counts || { total: 0, allowed: 0, explainable: 0, restricted: 0 });
    } catch (err) {
      console.error('Error al cargar expresiones culturales:', err);
    } finally {
      setCultureLoading(false);
    }
  };

  const handleOpenNewExprModal = () => {
    setEditingExpr(null);
    setExprForm({
      term: '',
      meaning: '',
      example: '',
      category: 'GUATEMALTEQUISMO',
      safety_level: 'ALLOWED',
      can_use: true,
      can_explain: true,
      context_notes: ''
    });
    setShowExprModal(true);
  };

  const handleOpenEditExprModal = (expr) => {
    setEditingExpr(expr);
    setExprForm({
      term: expr.term,
      meaning: expr.meaning,
      example: expr.example || '',
      category: expr.category || 'GUATEMALTEQUISMO',
      safety_level: expr.safety_level || 'ALLOWED',
      can_use: expr.can_use,
      can_explain: expr.can_explain,
      context_notes: expr.context_notes || ''
    });
    setShowExprModal(true);
  };

  const handleSaveCulturalExpression = async (e) => {
    e.preventDefault();
    if (!exprForm.term.trim() || !exprForm.meaning.trim()) {
      showAlert('error', 'Campos Requeridos', 'El término y el significado son obligatorios.');
      return;
    }
    try {
      if (editingExpr) {
        await api.put(`/culture/expressions/${editingExpr.id}`, exprForm);
        showAlert('success', 'Expresión Actualizada', `La expresión '${exprForm.term}' fue actualizada exitosamente.`);
      } else {
        await api.post('/culture/expressions', exprForm);
        showAlert('success', 'Expresión Creada', `La expresión '${exprForm.term}' fue agregada al Diccionario Cultural 🇬🇹.`);
      }
      setShowExprModal(false);
      fetchCulturalExpressions();
    } catch (err) {
      showAlert('error', 'Error', err.response?.data?.message || 'No se pudo guardar la expresión.');
    }
  };

  const handleToggleExpressionActive = async (expr) => {
    try {
      await api.put(`/culture/expressions/${expr.id}`, { active: !expr.active });
      fetchCulturalExpressions();
    } catch (err) {
      showAlert('error', 'Error', 'No se pudo cambiar el estado de la expresión.');
    }
  };

  const handleDeleteExpression = async (expr) => {
    if (!window.confirm(`¿Estás seguro de eliminar la expresión '${expr.term}' del diccionario?`)) return;
    try {
      await api.delete(`/culture/expressions/${expr.id}`);
      showAlert('info', 'Expresión Eliminada', `La expresión '${expr.term}' fue eliminada.`);
      fetchCulturalExpressions();
    } catch (err) {
      showAlert('error', 'Error', err.response?.data?.message || 'No se pudo eliminar la expresión.');
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

  // Obtener la Suite de 10 Reportes del Sistema con Filtros Avanzados y Alcance
  const fetchAllReports = async () => {
    setReportsLoading(true);
    try {
      const params = {};
      if (reportScope) params.scope = reportScope;
      if (reportScope === 'user' && reportTargetUserId) params.user_id = reportTargetUserId;
      if (reportQuickRange) params.quick_range = reportQuickRange;
      if (reportStartDate) params.start_date = reportStartDate;
      if (reportEndDate) params.end_date = reportEndDate;
      if (reportDeptFilter && reportDeptFilter !== 'todos') params.department = reportDeptFilter;
      if (reportStatusFilter && reportStatusFilter !== 'todos') params.status = reportStatusFilter;
      if (reportRoleFilter && reportRoleFilter !== 'todos') params.role = reportRoleFilter;
      if (reportRiskFilter && reportRiskFilter !== 'todos') params.risk_level = reportRiskFilter;
      if (reportPriorityFilter && reportPriorityFilter !== 'todos') params.priority = reportPriorityFilter;

      const res = await api.get('/reports/all', { params });
      setAllReportsData(res.data);
    } catch (err) {
      console.error('Error al cargar la suite de 10 reportes:', err);
    } finally {
      setReportsLoading(false);
    }
  };

  const handleReportFilterChange = (field, val, valObj = null) => {
    if (field === 'scope') {
      setReportScope(val);
      if (val === 'institution') {
        setReportDeptFilter('todos');
        setReportTargetUserId('');
        setReportTargetUserObj(null);
      } else if (val === 'department') {
        setReportTargetUserId('');
        setReportTargetUserObj(null);
      }
    } else if (field === 'user_id') {
      setReportTargetUserId(val);
      if (valObj) setReportTargetUserObj(valObj);
    } else if (field === 'start_date') {
      setReportStartDate(val);
      setReportQuickRange('');
    } else if (field === 'end_date') {
      setReportEndDate(val);
      setReportQuickRange('');
    } else if (field === 'department') {
      setReportDeptFilter(val);
    } else if (field === 'status') {
      setReportStatusFilter(val);
    } else if (field === 'role') {
      setReportRoleFilter(val);
    } else if (field === 'risk_level') {
      setReportRiskFilter(val);
    } else if (field === 'priority') {
      setReportPriorityFilter(val);
    }
  };

  const handleReportQuickRange = (rangeId) => {
    setReportQuickRange(rangeId);
    setReportStartDate('');
    setReportEndDate('');
  };

  const handleClearReportFilters = () => {
    setReportStartDate('');
    setReportEndDate('');
    setReportQuickRange('');
    setReportScope('institution');
    setReportDeptFilter('todos');
    setReportTargetUserId('');
    setReportTargetUserObj(null);
    setReportStatusFilter('todos');
    setReportRoleFilter('todos');
    setReportRiskFilter('todos');
    setReportPriorityFilter('todos');
  };

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchAllReports();
    } else if (activeTab === 'institutions') {
      fetchInstitutionsAll();
    }
  }, [activeTab, reportScope, reportTargetUserId, reportStartDate, reportEndDate, reportQuickRange, reportDeptFilter, reportStatusFilter, reportRoleFilter, reportRiskFilter, reportPriorityFilter]);

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

  const pieData = Object.keys(stats?.sentiment_distribution || {}).map(key => ({
    name: key,
    value: (stats?.sentiment_distribution && stats.sentiment_distribution[key]) || 0
  }));

  const COLORS = {
    Positivo: 'var(--success)',
    Neutro: 'var(--text-muted)',
    Negativo: 'var(--danger)'
  };

  const fallbackDeptNames = departmentsList.length > 0 
    ? departmentsList.map(d => typeof d === 'string' ? d : d.name)
    : ['General', 'Tecnología', 'Recursos Humanos', 'Psicología y Salud', 'Educación'];
  const unreadNotificationsCount = notifications.filter(n => n.unread).length;

  // INTERCEPTAR RENDERIZADO SI EL ADMIN ESTÁ PROBANDO EL TEST (EXPERIENCIA PASO A PASO CON COLIBRÍ)
  if (previewTest) {
    const questions = previewTest.questions || [];
    const totalQ = questions.length;
    const currentQ = questions[adminTestCurrentQIndex] || {};
    const isCurrentAnswered = previewAnswers[currentQ.id] !== undefined && previewAnswers[currentQ.id] !== '';
    const progressPercent = totalQ > 0 ? Math.round(((adminTestCurrentQIndex + (isCurrentAnswered ? 1 : 0)) / totalQ) * 100) : 0;

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

        {/* Modal de Confirmación antes de Enviar */}
        {showAdminConfirmModal && (
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
                ¿Deseas finalizar la prueba del test?
              </h3>

              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '24px' }}>
                Has completado las preguntas en modo prueba. La respuesta quedará registrada para fines de validación y métricas de analítica.
              </p>

              {previewSuccess && (
                <div style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)', padding: '10px', borderRadius: '12px', marginBottom: '16px', fontSize: '12.5px', fontWeight: '700' }}>
                  {previewSuccess}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAdminConfirmModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: '12px', borderRadius: '14px', fontWeight: '800' }}
                  disabled={previewSubmitLoading}
                >
                  Revisar
                </button>
                <button
                  type="button"
                  onClick={handleAdminSubmitPreviewTest}
                  className="btn btn-primary"
                  style={{ padding: '12px', borderRadius: '14px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  disabled={previewSubmitLoading}
                >
                  {previewSubmitLoading ? <Loader className="animate-spin" size={16} /> : <><span>Sí, Enviar Prueba</span><CheckCircle2 size={16} /></>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cabecera Fija Superior con Progreso */}
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
            onClick={() => { setPreviewTest(null); setAdminTestStep('intro'); }}
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
            <span>Salir de Vista Previa</span>
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '11px', fontWeight: '900', padding: '3px 10px', borderRadius: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', textTransform: 'uppercase' }}>
              🛡️ Modo Prueba Admin
            </span>

            {adminTestStep === 'question' && totalQ > 0 && (
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
          {adminTestStep === 'intro' && (
            <div className="animate-fade" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 340px) 1fr', gap: '32px', alignItems: 'center' }}>
              
              {/* Mascota Colibrí en estado de bienvenida */}
              <ColibriMascot 
                mood="welcome" 
                customMessage="¡Hola Administrador! Te acompaño en la prueba de este test. Así experimentarán tus colaboradores cada evaluación. 🌿"
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
                    {previewTest.category || 'Evaluación'}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>
                    Vista de Prueba Administrativa
                  </span>
                </div>
                
                <h1 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: '10px' }}>
                  {previewTest.title}
                </h1>
                
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
                  {previewTest.description || 'Evaluación guiada de bienestar emocional con preguntas dinámicas interactivas. Esta vista previa permite validar la experiencia completa de los integrantes.'}
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
                    <span>Experiencia Paso a Paso</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAdminTestStep('question');
                    setAdminTestCurrentQIndex(0);
                    setAdminTestMascotMood('thinking');
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
                  <span>Comenzar Prueba de Evaluación</span>
                  <ChevronRight size={18} />
                </button>
              </div>

            </div>
          )}

          {/* PASO 2: PREGUNTAS INDIVIDUALES (UNA A LA VEZ) */}
          {adminTestStep === 'question' && currentQ && (
            <div className="animate-fade" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 340px) 1fr', gap: '32px', alignItems: 'flex-start' }}>
              
              {/* Mascota Colibrí en el lateral */}
              <div style={{ position: 'sticky', top: '80px' }}>
                <ColibriMascot 
                  mood={adminTestMascotMood}
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
                      {adminTestCurrentQIndex + 1}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Pregunta {adminTestCurrentQIndex + 1} de {totalQ}
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
                        placeholder="Escribe o dicta por micrófono la respuesta de prueba..."
                        value={previewAnswers[currentQ.id] || ''}
                        onChange={(e) => {
                          setPreviewAnswers(prev => ({ ...prev, [currentQ.id]: e.target.value }));
                          setAdminTestMascotMood('happy');
                        }}
                        style={{ resize: 'vertical', width: '100%', marginBottom: '14px', borderRadius: '14px', padding: '14px', fontSize: '14px', lineHeight: '1.5' }}
                      />

                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                            if (!SpeechRecognition) {
                              alert('El dictado por voz nativo no es soportado por este navegador.');
                              return;
                            }
                            const rec = new SpeechRecognition();
                            rec.lang = 'es-ES';
                            rec.onresult = (event) => {
                              const transcript = event.results[0][0].transcript;
                              setPreviewAnswers(prev => ({ ...prev, [currentQ.id]: (prev[currentQ.id] || '') + ' ' + transcript }));
                              setAdminTestMascotMood('happy');
                            };
                            rec.start();
                          }}
                          className="duo-pill"
                        >
                          <Mic size={15} style={{ color: 'var(--primary)' }} />
                          <span>Hablar por Micrófono (Dictado por Voz)</span>
                        </button>
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
                          const isSelected = previewAnswers[currentQ.id] === val;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => {
                                setPreviewAnswers(prev => ({ ...prev, [currentQ.id]: val }));
                                setAdminTestMascotMood('happy');
                              }}
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
                          const isSelected = previewAnswers[currentQ.id] === `${item.emoji} ${item.label}` || previewAnswers[currentQ.id] === item.label;
                          return (
                            <button
                              key={eIdx}
                              type="button"
                              onClick={() => {
                                setPreviewAnswers(prev => ({ ...prev, [currentQ.id]: `${item.emoji} ${item.label}` }));
                                setAdminTestMascotMood('happy');
                              }}
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
                        savedImage={previewAnswers[currentQ.id] || ''}
                        onSaveDrawing={(dataUrl) => {
                          setPreviewAnswers(prev => ({ ...prev, [currentQ.id]: dataUrl }));
                          setAdminTestMascotMood('happy');
                        }}
                      />
                    </div>
                  )}

                  {/* Opción Booleana (Sí / No) */}
                  {currentQ.type === 'boolean' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewAnswers(prev => ({ ...prev, [currentQ.id]: 'Sí' }));
                          setAdminTestMascotMood('happy');
                        }}
                        className={`duo-card ${previewAnswers[currentQ.id] === 'Sí' ? 'selected' : ''}`}
                        style={{ justifyContent: 'center', padding: '18px', fontSize: '15px', fontWeight: '900', borderRadius: '14px' }}
                      >
                        <ThumbsUp size={20} />
                        <span>Sí</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPreviewAnswers(prev => ({ ...prev, [currentQ.id]: 'No' }));
                          setAdminTestMascotMood('happy');
                        }}
                        className={`duo-card ${previewAnswers[currentQ.id] === 'No' ? 'selected' : ''}`}
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
                        const isSelected = previewAnswers[currentQ.id] === opt;
                        return (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() => {
                              setPreviewAnswers(prev => ({ ...prev, [currentQ.id]: opt }));
                              setAdminTestMascotMood('happy');
                            }}
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
                      if (adminTestCurrentQIndex > 0) {
                        setAdminTestCurrentQIndex(prev => prev - 1);
                        setAdminTestMascotMood('thinking');
                      } else {
                        setAdminTestStep('intro');
                        setAdminTestMascotMood('welcome');
                      }
                    }}
                    className="btn btn-secondary"
                    style={{ padding: '12px 20px', borderRadius: '14px', fontWeight: '800', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <ChevronLeft size={16} />
                    <span>{adminTestCurrentQIndex === 0 ? 'Volver al Inicio' : 'Anterior'}</span>
                  </button>

                  {adminTestCurrentQIndex < totalQ - 1 ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (!isCurrentAnswered) return;
                        setAdminTestCurrentQIndex(prev => prev + 1);
                        if (adminTestCurrentQIndex + 1 === totalQ - 1) {
                          setAdminTestMascotMood('almost_done');
                        } else {
                          setAdminTestMascotMood('thinking');
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
                        setShowAdminConfirmModal(true);
                      }}
                      className="btn btn-primary"
                      disabled={!isCurrentAnswered}
                      style={{ padding: '12px 24px', borderRadius: '14px', fontWeight: '900', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--success)', borderColor: 'var(--success)' }}
                    >
                      <span>Finalizar Prueba</span>
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

          {/* Botón Acceso a Configuración */}
          <button 
            onClick={() => navigate('/configuracion')} 
            className="theme-toggle" 
            style={{ border: '1px solid var(--border)', width: '36px', height: '36px', borderRadius: '50%' }} 
            title="Configuración de la Cuenta y Privacidad"
          >
            <Settings size={15} style={{ color: 'var(--text-primary)' }} />
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
                <strong>Aviso de Confidencialidad</strong>: La información de bienestar es anónima y agregada. (Se cerrará en {privacyCountdown}s)
              </span>
            </div>
            <button onClick={() => setShowPrivacyNotice(false)} aria-label="Cerrar aviso" style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', lineHeight: 1 }}>×</button>
          </div>
        )}

        {/* Pestañas de Navegación Adaptativas por Rol */}
        <div className="tab-container" style={{ width: '100%', flexWrap: 'wrap', gap: '8px', justifyContent: 'flex-start' }}>
          {hasModuleAccess(user?.role, 'wellbeing') && (
            <button className={`tab-btn ${activeTab === 'bienestar' ? 'active' : ''}`} onClick={() => handleTabChange('bienestar')}><Brain size={15} /><span>Mi Bienestar</span></button>
          )}

          {hasModuleAccess(user?.role, 'analytics') && (
            <button className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => handleTabChange('analytics')}><BarChart3 size={15} /><span>Analíticas</span></button>
          )}
          
          {hasModuleAccess(user?.role, 'tasks') && (
            <button className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => handleTabChange('tasks')}><ClipboardList size={15} /><span>Tareas</span></button>
          )}
          
          {hasModuleAccess(user?.role, 'alerts') && (
            <button className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`} onClick={() => handleTabChange('alerts')}>
              <AlertTriangle size={15} /><span>Alertas</span>
              {alerts.length > 0 && <span style={{ backgroundColor: 'var(--danger)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: 'var(--radius-full)', fontWeight: 'bold' }}>{alerts.length}</span>}
            </button>
          )}

          {hasModuleAccess(user?.role, 'evaluations') && (
            <button className={`tab-btn ${activeTab === 'evaluations' ? 'active' : ''}`} onClick={() => handleTabChange('evaluations')}><Calendar size={15} /><span>Tests</span></button>
          )}

          {hasModuleAccess(user?.role, 'clinical_appointments') && (
            <button className={`tab-btn ${activeTab === 'clinical_appointments' ? 'active' : ''}`} onClick={() => handleTabChange('clinical_appointments')}>
              <Calendar size={15} /><span>Agenda de Citas</span>
            </button>
          )}

          {hasModuleAccess(user?.role, 'members') && (
            <button className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`} onClick={() => handleTabChange('members')}>
              <Users size={15} />
              <span>{user?.role === 'lider_depto' ? 'Directorio Depto' : 'Roles y Usuarios'}</span>
            </button>
          )}

          {hasModuleAccess(user?.role, 'institutions') && (
            <button className={`tab-btn ${activeTab === 'institutions' ? 'active' : ''}`} onClick={() => handleTabChange('institutions')}><Building size={15} /><span>Instituciones y Deptos</span></button>
          )}

          {hasModuleAccess(user?.role, 'progress') && (
            <button className={`tab-btn ${activeTab === 'progress' ? 'active' : ''}`} onClick={() => handleTabChange('progress')}><Trophy size={15} /><span>Mi Progreso / Gamificación</span></button>
          )}

          {hasModuleAccess(user?.role, 'kudos') && (
            <button className={`tab-btn ${activeTab === 'kudos' ? 'active' : ''}`} onClick={() => handleTabChange('kudos')}><MessageSquare size={15} /><span>Chat & Grupos</span></button>
          )}

          {hasModuleAccess(user?.role, 'reports') && (
            <button className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => handleTabChange('reports')}><FileSpreadsheet size={15} /><span>Reportes</span></button>
          )}

          {hasModuleAccess(user?.role, 'audit') && (
            <button className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => handleTabChange('audit')}><ShieldCheck size={15} /><span>Auditoría</span></button>
          )}

          {hasModuleAccess(user?.role, 'ai_plans') && (
            <button className={`tab-btn ${activeTab === 'ai_plans' ? 'active' : ''}`} onClick={() => handleTabChange('ai_plans')}><Sparkles size={15} /><span>Sugerencias IA</span></button>
          )}

          {hasModuleAccess(user?.role, 'chat_ia') && (
            <button className={`tab-btn ${activeTab === 'chat_ia' ? 'active' : ''}`} onClick={() => handleTabChange('chat_ia')}><Bot size={15} /><span>Chatbot IA</span></button>
          )}

          {hasModuleAccess(user?.role, 'culture') && (
            <button className={`tab-btn ${activeTab === 'culture' ? 'active' : ''}`} onClick={() => handleTabChange('culture')}>
              <BookOpen size={15} />
              <span>Diccionario Cultural 🇬🇹</span>
            </button>
          )}
        </div>

        {/* TAB 0: MI BIENESTAR PERSONAL */}
        {activeTab === 'bienestar' && (
          <MyWellbeing onNavigateToTab={(tab) => handleTabChange(tab)} />
        )}

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
                {/* Selector de Recurso de Bienestar para Validación Automática */}
                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '14px 16px', borderRadius: '14px', border: '1.5px solid var(--primary-light)', marginBottom: '16px' }}>
                  <label style={{ fontSize: '11.5px', fontWeight: '900', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', textTransform: 'uppercase' }}>
                    <Sparkles size={14} /> Vincular Recurso de Bienestar (Validación Interactiva):
                  </label>
                  <CustomSelect
                    options={[
                      { value: '', label: 'Ninguno (Tarea Manual)', sublabel: 'El usuario la marca como completada manualmente' },
                      ...availableResources.map(r => ({
                        value: r.id,
                        label: `${r.title} (${r.resource_type})`,
                        sublabel: `${r.category} • ~${r.reading_time_minutes} min • +${r.xp_reward || 15} XP`,
                        icon: '🧘'
                      }))
                    ]}
                    value={taskResourceId}
                    onChange={(val) => {
                      setTaskResourceId(val);
                      if (val) {
                        const found = availableResources.find(r => r.id === val);
                        if (found) {
                          if (!taskTitle) setTaskTitle(`Completar: ${found.title}`);
                          if (!taskDesc) setTaskDesc(`Realizar la actividad de bienestar "${found.title}" (${found.resource_type}) en el reproductor interactivo.`);
                          setTaskEstMinutes(found.reading_time_minutes || 15);
                          setTaskCategory('Bienestar');
                        }
                      }
                    }}
                    placeholder="Seleccionar recurso interactivo o lectura..."
                  />
                  {taskResourceId && (
                    <div style={{ fontSize: '11px', color: 'var(--success)', fontWeight: '800', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={13} /> Al completar el recurso, la tarea se validará y completará automáticamente (+20 XP).
                    </div>
                  )}
                </div>

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
                          {fallbackDeptNames.map(dept => (
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
                        {task.resource && (
                          <div style={{ marginTop: '6px' }}>
                            <span style={{ fontSize: '10.5px', fontWeight: '800', padding: '2px 8px', borderRadius: '6px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              🧘 Vinculada a Recurso: <strong>{task.resource.title}</strong> ({task.resource.resource_type})
                            </span>
                          </div>
                        )}
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
                    <TestResponseViewer rawText={al.reflection_text} userName={al.user_name} date={al.created_at} />
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
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
                                <h4 style={{ fontSize: '14px', fontWeight: '800' }}>{cleanEvalTitle(ev.title)}</h4>
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
                                onClick={() => { 
                                  setPreviewTest(ev); 
                                  setPreviewAnswers({}); 
                                  setAdminTestStep('intro');
                                  setAdminTestCurrentQIndex(0);
                                  setAdminTestMascotMood('welcome');
                                  setPreviewSuccess(''); 
                                }}
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
                          <h4 style={{ fontSize: '15px', fontWeight: '800', marginTop: '2px' }}>{cleanEvalTitle(selectedTestAnalytics.title)}</h4>
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
                    {templates.length > 0 ? `${templates.length} Plantillas Disponibles` : 'Cargando...'}
                  </span>
                </div>

                {templates.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    <div className="animate-spin" style={{ width: '28px', height: '28px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto 12px' }} />
                    <h4 style={{ fontSize: '13.5px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-secondary)' }}>Obteniendo banco de plantillas de evaluación...</h4>
                    <button 
                      type="button" 
                      onClick={fetchTemplates}
                      className="btn btn-secondary" 
                      style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '8px' }}
                    >
                      Recargar Banco de Plantillas
                    </button>
                  </div>
                ) : (
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
                )}
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
                          {fallbackDeptNames.map(dept => (
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

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => setMembersSubTab('directory')}
                  className={`duo-pill ${membersSubTab === 'directory' ? 'selected' : ''}`}
                >
                  <Users size={13} />
                  <span>Directorio de Miembros ({(members || []).length})</span>
                </button>
                <button 
                  onClick={() => setMembersSubTab('pending_accounts')}
                  className={`duo-pill ${membersSubTab === 'pending_accounts' ? 'selected' : ''}`}
                >
                  <ShieldCheck size={13} />
                  <span>Cuentas Pendientes</span>
                  {(members || []).filter(m => (m.status || '').toUpperCase() === 'PENDIENTE' || (m.status || '').toUpperCase() === 'PENDING').length > 0 && (
                    <span style={{ backgroundColor: 'var(--primary)', color: '#fff', fontSize: '10px', padding: '1px 7px', borderRadius: '10px', fontWeight: '900', marginLeft: '4px' }}>
                      {(members || []).filter(m => (m.status || '').toUpperCase() === 'PENDIENTE' || (m.status || '').toUpperCase() === 'PENDING').length}
                    </span>
                  )}
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
                {/* BARRA DE BÚSQUEDA Y FILTROS AVANZADOS */}
                <div style={{
                  backgroundColor: 'var(--bg-secondary)',
                  padding: '16px',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  marginBottom: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', alignItems: 'center' }}>
                    {/* Búsqueda por Texto */}
                    <div style={{ position: 'relative' }}>
                      <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        placeholder="Buscar por nombre o correo..."
                        value={memberSearchText}
                        onChange={(e) => setMemberSearchText(e.target.value)}
                        style={{ width: '100%', paddingLeft: '34px', paddingRight: '12px', fontSize: '12px', borderRadius: '10px', height: '38px' }}
                      />
                    </div>

                    {/* Filtro por Rol */}
                    <div>
                      <CustomSelect
                        options={[
                          { value: 'todos', label: '👥 Todos los Roles' },
                          { value: 'superadmin', label: '🛡️ SuperAdmin' },
                          { value: 'admin_institucion', label: '🏛️ Admin Institucional' },
                          { value: 'profesional_apoyo', label: '🧠 Profesional / Psicólogo' },
                          { value: 'lider_depto', label: '👔 Líder de Depto' },
                          { value: 'miembro', label: '👤 Miembro / Colaborador' }
                        ]}
                        value={memberRoleFilter}
                        onChange={(val) => setMemberRoleFilter(val)}
                      />
                    </div>

                    {/* Filtro por Departamento */}
                    <div>
                      <CustomSelect
                        options={[
                          { value: 'todos', label: '🏢 Todos los Departamentos' },
                          ...Array.from(new Set(members.map(m => m.department || 'General'))).map(d => ({ value: d, label: `🏢 ${d}` }))
                        ]}
                        value={memberDeptFilter}
                        onChange={(val) => setMemberDeptFilter(val)}
                      />
                    </div>

                    {/* Filtro por Estado */}
                    <div>
                      <CustomSelect
                        options={[
                          { value: 'todos', label: '🔘 Todos los Estados' },
                          { value: 'ACTIVE', label: '🟢 Activo (ACTIVE)' },
                          { value: 'PENDING', label: '🟠 Pendiente (PENDING)' },
                          { value: 'SUSPENDED', label: '🔴 Suspendido (SUSPENDED)' },
                          { value: 'INACTIVE', label: '⚪ Inactivo (INACTIVE)' }
                        ]}
                        value={memberStatusFilter}
                        onChange={(val) => setMemberStatusFilter(val)}
                      />
                    </div>

                    {/* Filtro por Institución (SuperAdmin) */}
                    {user?.role === 'superadmin' && allInstitutions.length > 0 && (
                      <div>
                        <CustomSelect
                          options={[
                            { value: 'todos', label: '🌐 Todas las Instituciones' },
                            ...allInstitutions.map(inst => ({ value: inst.id, label: `🏛️ ${inst.name}` }))
                          ]}
                          value={memberInstFilter}
                          onChange={(val) => setMemberInstFilter(val)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Resumen y Limpiar Filtros */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    <span>
                      Mostrando <strong>{(members || []).filter(m => {
                        if (memberSearchText.trim()) {
                          const q = memberSearchText.toLowerCase();
                          const fullName = `${m.first_name || ''} ${m.last_name || ''}`.toLowerCase();
                          const email = (m.email || '').toLowerCase();
                          if (!fullName.includes(q) && !email.includes(q)) return false;
                        }
                        if (memberRoleFilter !== 'todos' && m.role !== memberRoleFilter) return false;
                        if (memberDeptFilter !== 'todos' && (m.department !== memberDeptFilter && m.department_id !== memberDeptFilter)) return false;
                        if (memberStatusFilter !== 'todos' && (m.status || 'ACTIVE') !== memberStatusFilter) return false;
                        if (memberInstFilter !== 'todos' && m.institution_id !== memberInstFilter) return false;
                        return true;
                      }).length}</strong> de <strong>{members.length}</strong> usuarios registrados.
                    </span>

                    {(memberSearchText || memberRoleFilter !== 'todos' || memberDeptFilter !== 'todos' || memberStatusFilter !== 'todos' || memberInstFilter !== 'todos') && (
                      <button
                        onClick={() => {
                          setMemberSearchText('');
                          setMemberRoleFilter('todos');
                          setMemberDeptFilter('todos');
                          setMemberStatusFilter('todos');
                          setMemberInstFilter('todos');
                        }}
                        style={{ border: 'none', background: 'none', color: 'var(--primary)', fontWeight: '800', cursor: 'pointer', fontSize: '11px' }}
                      >
                        ✕ Limpiar Filtros
                      </button>
                    )}
                  </div>
                </div>

                {/* MODAL DE EDICIÓN ESTRUCTURADA DE USUARIO */}
                {editingUser && (
                  <div style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '2px solid var(--primary)',
                    borderRadius: '18px',
                    padding: '22px',
                    marginBottom: '24px',
                    boxShadow: 'var(--shadow-md)',
                    animation: 'fadeIn 0.2s ease'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                      <div>
                        <span style={{ fontSize: '10px', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Edición Administrativa RBAC
                        </span>
                        <h4 style={{ fontSize: '16px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                          <Edit3 size={17} style={{ color: 'var(--primary)' }} />
                          {editingUser.first_name} {editingUser.last_name} <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'normal' }}>({editingUser.email})</span>
                        </h4>
                      </div>
                      <button onClick={() => setEditingUser(null)} style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '22px', fontWeight: 'bold' }}>×</button>
                    </div>

                    {userUpdateMsg && (
                      <div style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '10px 14px', borderRadius: '10px', fontSize: '12.5px', marginBottom: '16px', fontWeight: '700' }}>
                        {userUpdateMsg}
                      </div>
                    )}

                    <form onSubmit={handleUpdateUser}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '18px' }}>
                        {/* Sección 1: Datos Básicos */}
                        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                          <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>
                            1. INFORMACIÓN PERSONAL
                          </span>
                          <div style={{ marginBottom: '10px' }}>
                            <label style={{ fontSize: '10px', fontWeight: '800', display: 'block', marginBottom: '4px' }}>NOMBRE:</label>
                            <input
                              type="text"
                              value={editFirstName}
                              onChange={(e) => setEditFirstName(e.target.value)}
                              required
                              style={{ width: '100%', fontSize: '12px', padding: '8px 10px', borderRadius: '8px' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '10px', fontWeight: '800', display: 'block', marginBottom: '4px' }}>APELLIDO:</label>
                            <input
                              type="text"
                              value={editLastName}
                              onChange={(e) => setEditLastName(e.target.value)}
                              required
                              style={{ width: '100%', fontSize: '12px', padding: '8px 10px', borderRadius: '8px' }}
                            />
                          </div>
                        </div>

                        {/* Sección 2: Asignación Institucional */}
                        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                          <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>
                            2. ASIGNACIÓN INSTITUCIONAL
                          </span>
                          <div style={{ marginBottom: '10px' }}>
                            <label style={{ fontSize: '10px', fontWeight: '800', display: 'block', marginBottom: '4px' }}>INSTITUCIÓN:</label>
                            <input
                              type="text"
                              value={editingUser.institution_name || 'EquilibrIA General'}
                              disabled
                              style={{ width: '100%', fontSize: '12px', padding: '8px 10px', borderRadius: '8px', opacity: 0.7 }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '10px', fontWeight: '800', display: 'block', marginBottom: '4px' }}>DEPARTAMENTO / ÁREA:</label>
                            <input
                              type="text"
                              placeholder="Ej. Tecnología, Recursos Humanos..."
                              value={editDept}
                              onChange={(e) => setEditDept(e.target.value)}
                              style={{ width: '100%', fontSize: '12px', padding: '8px 10px', borderRadius: '8px' }}
                            />
                          </div>
                        </div>

                        {/* Sección 3: Control de Acceso y Estado */}
                        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                          <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>
                            3. ROL Y ESTADO DE CUENTA
                          </span>
                          <div style={{ marginBottom: '10px' }}>
                            <label style={{ fontSize: '10px', fontWeight: '800', display: 'block', marginBottom: '4px' }}>ROL ASIGNADO:</label>
                            <select
                              value={editRole}
                              onChange={(e) => setEditRole(e.target.value)}
                              disabled={user?.role !== 'superadmin' && editRole === 'superadmin'}
                              style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', fontSize: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                            >
                              <option value="miembro">👤 Miembro / Colaborador</option>
                              <option value="lider_depto">👔 Líder de Departamento</option>
                              <option value="profesional_apoyo">🧠 Profesional / Psicólogo</option>
                              <option value="admin_institucion">🏛️ Admin Institucional</option>
                              {user?.role === 'superadmin' && (
                                <option value="superadmin">🛡️ SuperAdmin (Global)</option>
                              )}
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: '10px', fontWeight: '800', display: 'block', marginBottom: '4px' }}>ESTADO DE LA CUENTA:</label>
                            <select
                              value={editStatus}
                              onChange={(e) => setEditStatus(e.target.value)}
                              style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', fontSize: '12px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                            >
                              <option value="ACTIVE">🟢 Activa (ACTIVE)</option>
                              <option value="PENDING">🟠 Pendiente (PENDING)</option>
                              <option value="SUSPENDED">🔴 Suspendida (SUSPENDED)</option>
                              <option value="INACTIVE">⚪ Inactiva (INACTIVE)</option>
                            </select>
                          </div>
                        </div>

                        {/* Sección 4: Restablecimiento de Seguridad */}
                        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                              4. SEGURIDAD Y ACCESO
                            </span>
                            <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                              Genera un enlace seguro de restablecimiento de contraseña para el usuario sin exponer claves.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleGeneratePasswordReset(editingUser)}
                            disabled={resetPassLoading}
                            className="btn btn-secondary"
                            style={{ padding: '8px 12px', fontSize: '11.5px', borderRadius: '8px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                          >
                            <Key size={13} />
                            <span>{resetPassLoading ? 'Generando...' : 'Generar Reset de Contraseña'}</span>
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button
                          type="button"
                          onClick={() => setEditingUser(null)}
                          className="btn btn-secondary"
                          style={{ padding: '10px 18px', fontSize: '12.5px', borderRadius: '10px' }}
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={userUpdateLoading}
                          style={{ padding: '10px 24px', fontSize: '12.5px', borderRadius: '10px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          {userUpdateLoading ? <Loader className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                          <span>Guardar Cambios de Usuario</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* MODAL DE ENLACE DE RESTABLECIMIENTO DE CONTRASEÑA */}
                {resetPassModalData && (
                  <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.65)',
                    backdropFilter: 'blur(6px)',
                    zIndex: 99999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                  }}>
                    <div className="glass-card animate-scale" style={{ maxWidth: '520px', width: '100%', padding: '24px', borderRadius: '20px', border: '2px solid var(--primary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Key size={18} style={{ color: 'var(--primary)' }} />
                          Enlace de Restablecimiento Generado
                        </h4>
                        <button onClick={() => setResetPassModalData(null)} style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold' }}>×</button>
                      </div>

                      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                        Se ha generado el siguiente enlace seguro para <strong>{resetPassModalData.user.email}</strong>. Puedes copiarlo y enviárselo directamente:
                      </p>

                      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                        <input
                          type="text"
                          readOnly
                          value={resetPassModalData.reset_link}
                          style={{ flex: 1, fontSize: '11.5px', padding: '10px', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)' }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(resetPassModalData.reset_link);
                            showAlert('success', 'Copiado', 'Enlace copiado al portapapeles.');
                          }}
                          className="btn btn-primary"
                          style={{ padding: '0 14px', borderRadius: '8px', fontSize: '12px' }}
                        >
                          <Copy size={14} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setResetPassModalData(null)}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '10px', borderRadius: '10px', fontWeight: '800' }}
                      >
                        Entendido y Cerrar
                      </button>
                    </div>
                  </div>
                )}

                {/* MODAL DE TRANSFERENCIA ENTRE INSTITUCIONES (SUPERADMIN) */}
                {showTransferModal && transferTargetUser && (
                  <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.65)',
                    backdropFilter: 'blur(6px)',
                    zIndex: 99999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                  }}>
                    <div className="glass-card animate-scale" style={{ maxWidth: '520px', width: '100%', padding: '24px', borderRadius: '20px', border: '2px solid var(--accent)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <RefreshCw size={18} style={{ color: 'var(--accent)' }} />
                          Transferir Usuario de Institución
                        </h4>
                        <button onClick={() => setShowTransferModal(false)} style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold' }}>×</button>
                      </div>

                      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                        Transfiere la cuenta de <strong>{transferTargetUser.first_name} {transferTargetUser.last_name}</strong> ({transferTargetUser.email}) a otra organización.
                      </p>

                      <form onSubmit={handleTransferUserSubmit}>
                        <div style={{ marginBottom: '14px' }}>
                          <label style={{ fontSize: '11px', fontWeight: '800', display: 'block', marginBottom: '6px' }}>SELECCIONAR INSTITUCIÓN DE DESTINO:</label>
                          <select
                            value={transferTargetInstId}
                            onChange={(e) => setTransferTargetInstId(e.target.value)}
                            required
                            style={{ width: '100%', padding: '10px', borderRadius: '10px', fontSize: '12.5px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                          >
                            {allInstitutions.map(inst => (
                              <option key={inst.id} value={inst.id}>🏛️ {inst.name} ({inst.code})</option>
                            ))}
                          </select>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                          <button
                            type="button"
                            onClick={() => setShowTransferModal(false)}
                            className="btn btn-secondary"
                            style={{ padding: '10px 16px', fontSize: '12px', borderRadius: '10px' }}
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            disabled={transferLoading}
                            className="btn btn-primary"
                            style={{ padding: '10px 20px', fontSize: '12px', borderRadius: '10px', fontWeight: '900' }}
                          >
                            {transferLoading ? <Loader className="animate-spin" size={14} /> : 'Confirmar Transferencia'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* GRILLA DE USUARIOS FILTRADOS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                  {(members || []).filter(m => {
                    if (memberSearchText.trim()) {
                      const q = memberSearchText.toLowerCase();
                      const fullName = `${m.first_name || ''} ${m.last_name || ''}`.toLowerCase();
                      const email = (m.email || '').toLowerCase();
                      if (!fullName.includes(q) && !email.includes(q)) return false;
                    }
                    if (memberRoleFilter !== 'todos' && m.role !== memberRoleFilter) return false;
                    if (memberDeptFilter !== 'todos' && (m.department !== memberDeptFilter && m.department_id !== memberDeptFilter)) return false;
                    if (memberStatusFilter !== 'todos' && (m.status || 'ACTIVE') !== memberStatusFilter) return false;
                    if (memberInstFilter !== 'todos' && m.institution_id !== memberInstFilter) return false;
                    return true;
                  }).length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', padding: '30px', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: '16px' }}>
                      <Users size={32} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                      <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No se encontraron usuarios con los filtros seleccionados.</p>
                    </div>
                  ) : (
                    (members || []).filter(m => {
                      if (memberSearchText.trim()) {
                        const q = memberSearchText.toLowerCase();
                        const fullName = `${m.first_name || ''} ${m.last_name || ''}`.toLowerCase();
                        const email = (m.email || '').toLowerCase();
                        if (!fullName.includes(q) && !email.includes(q)) return false;
                      }
                      if (memberRoleFilter !== 'todos' && m.role !== memberRoleFilter) return false;
                      if (memberDeptFilter !== 'todos' && (m.department !== memberDeptFilter && m.department_id !== memberDeptFilter)) return false;
                      if (memberStatusFilter !== 'todos' && (m.status || 'ACTIVE') !== memberStatusFilter) return false;
                      if (memberInstFilter !== 'todos' && m.institution_id !== memberInstFilter) return false;
                      return true;
                    }).map((m) => {
                      const userStatus = m.status || 'ACTIVE';
                      const statusBadgeColor = userStatus === 'ACTIVE' ? 'var(--success)' : userStatus === 'PENDING' ? 'var(--warning)' : userStatus === 'SUSPENDED' ? 'var(--danger)' : 'var(--text-muted)';
                      const statusBgColor = userStatus === 'ACTIVE' ? 'var(--success-light)' : userStatus === 'PENDING' ? 'var(--warning-light)' : userStatus === 'SUSPENDED' ? 'var(--danger-light)' : 'var(--bg-primary)';

                      return (
                        <div key={m.id} className="futuristic-card-item" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <div style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '900',
                              fontSize: '15px',
                              flexShrink: 0
                            }}>
                              {m.first_name?.[0]}{m.last_name?.[0]}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                                <h4 style={{ fontSize: '14px', fontWeight: '800', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {m.first_name} {m.last_name}
                                </h4>
                                <span style={{
                                  fontSize: '9.5px',
                                  fontWeight: '900',
                                  padding: '2px 7px',
                                  borderRadius: '8px',
                                  backgroundColor: statusBgColor,
                                  color: statusBadgeColor,
                                  textTransform: 'uppercase',
                                  flexShrink: 0
                                }}>
                                  {userStatus}
                                </span>
                              </div>

                              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '6px' }}>
                                {m.email}
                              </p>

                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '9.5px', fontWeight: '800', padding: '2px 7px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                                  🏢 {m.department || 'General'}
                                </span>
                                <span style={{ fontSize: '9.5px', fontWeight: '800', padding: '2px 7px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                                  {m.role === 'superadmin' ? '🛡️ SuperAdmin' : m.role === 'admin_institucion' ? '🏛️ Admin' : m.role === 'profesional_apoyo' ? '🧠 Psicólogo' : m.role === 'lider_depto' ? '👔 Líder' : '👤 Miembro'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
                            <span>
                              {m.institution_name ? `🏛️ ${m.institution_name}` : 'EquilibrIA'}
                            </span>

                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                              {((m.status || '').toUpperCase() === 'PENDIENTE' || (m.status || '').toUpperCase() === 'PENDING') && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleMemberStatusAction(m.id, 'approve')}
                                    className="duo-pill"
                                    style={{ padding: '4px 8px', fontSize: '10.5px', color: 'var(--success)', borderColor: 'var(--success)', fontWeight: '800' }}
                                    title="Aprobar cuenta de usuario"
                                  >
                                    <CheckCircle2 size={12} />
                                    <span>Aprobar</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMemberStatusAction(m.id, 'reject')}
                                    className="duo-pill"
                                    style={{ padding: '4px 8px', fontSize: '10.5px', color: 'var(--danger)', borderColor: 'var(--danger)', fontWeight: '800' }}
                                    title="Rechazar solicitud"
                                  >
                                    <X size={12} />
                                    <span>Rechazar</span>
                                  </button>
                                </>
                              )}

                              {((m.status || '').toUpperCase() === 'ACTIVO' || (m.status || '').toUpperCase() === 'ACTIVE') && m.role !== 'superadmin' && (
                                <button
                                  type="button"
                                  onClick={() => handleMemberStatusAction(m.id, 'block')}
                                  className="duo-pill"
                                  style={{ padding: '4px 8px', fontSize: '10.5px', color: 'var(--warning)', borderColor: 'var(--warning)' }}
                                  title="Bloquear cuenta temporalmente"
                                >
                                  <Lock size={11} />
                                  <span>Bloquear</span>
                                </button>
                              )}

                              {((m.status || '').toUpperCase() === 'BLOQUEADO' || (m.status || '').toUpperCase() === 'SUSPENDED' || (m.status || '').toUpperCase() === 'RECHAZADO') && (
                                <button
                                  type="button"
                                  onClick={() => handleMemberStatusAction(m.id, 'reactivate')}
                                  className="duo-pill"
                                  style={{ padding: '4px 8px', fontSize: '10.5px', color: 'var(--primary)', borderColor: 'var(--primary)', fontWeight: '800' }}
                                  title="Reactivar cuenta"
                                >
                                  <RefreshCw size={11} />
                                  <span>Reactivar</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleGeneratePasswordReset(m)}
                                className="duo-pill"
                                style={{ padding: '4px 8px', fontSize: '10.5px' }}
                                title="Generar enlace de restablecimiento de contraseña"
                              >
                                <Key size={11} />
                                <span>Reset</span>
                              </button>

                              {user?.role === 'superadmin' && (
                                <button
                                  type="button"
                                  onClick={() => openTransferModal(m)}
                                  className="duo-pill"
                                  style={{ padding: '4px 8px', fontSize: '10.5px' }}
                                  title="Transferir a otra institución"
                                >
                                  <RefreshCw size={11} />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => openEditUserModal(m)}
                                className="duo-pill"
                                style={{ padding: '4px 10px', fontSize: '11px', fontWeight: '800' }}
                                title="Editar Rol y Permisos"
                              >
                                <Edit3 size={12} />
                                <span>Editar</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {membersSubTab === 'pending_accounts' && (
              <div className="animate-fade">
                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border)', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--primary)', marginBottom: '4px' }}>
                      Solicitudes y Cuentas Pendientes de Aprobación
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Revisa y autoriza el acceso a nuevos usuarios registrados en tu institución antes de que puedan ingresar al sistema.
                    </p>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '900', padding: '4px 12px', borderRadius: '12px', backgroundColor: 'var(--warning-light)', color: 'var(--warning)' }}>
                    {(members || []).filter(m => (m.status || '').toUpperCase() === 'PENDIENTE' || (m.status || '').toUpperCase() === 'PENDING').length} pendientes
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                  {(members || []).filter(m => (m.status || '').toUpperCase() === 'PENDIENTE' || (m.status || '').toUpperCase() === 'PENDING').length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
                      <CheckCircle2 size={36} style={{ color: 'var(--success)', margin: '0 auto 10px' }} />
                      <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '4px' }}>¡Todo al día!</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>No hay solicitudes de registro pendientes de aprobación en este momento.</p>
                    </div>
                  ) : (
                    (members || []).filter(m => (m.status || '').toUpperCase() === 'PENDIENTE' || (m.status || '').toUpperCase() === 'PENDING').map(m => (
                      <div key={m.id} className="futuristic-card-item" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '18px', gap: '14px', borderLeft: '4px solid var(--warning)' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <h4 style={{ fontSize: '14.5px', fontWeight: '900' }}>{m.first_name} {m.last_name}</h4>
                            <span style={{ fontSize: '10px', fontWeight: '900', padding: '2px 8px', borderRadius: '8px', backgroundColor: 'var(--warning-light)', color: 'var(--warning)', textTransform: 'uppercase' }}>
                              PENDIENTE
                            </span>
                          </div>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{m.email}</p>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                              🏢 {m.department || 'General'}
                            </span>
                            <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                              Rol: {m.role}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                          <button
                            type="button"
                            onClick={() => handleMemberStatusAction(m.id, 'approve')}
                            className="btn btn-primary"
                            style={{ flex: 1, padding: '8px', fontSize: '12px', borderRadius: '10px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: 'var(--success)', borderColor: 'var(--success)' }}
                          >
                            <CheckCircle2 size={14} />
                            <span>Aprobar Acceso</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMemberStatusAction(m.id, 'reject')}
                            className="btn btn-secondary"
                            style={{ padding: '8px 14px', fontSize: '12px', borderRadius: '10px', fontWeight: '800', color: 'var(--danger)' }}
                          >
                            <X size={14} />
                            <span>Rechazar</span>
                          </button>
                        </div>
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
          <InstitutionalReportView
            allReportsData={allReportsData}
            loading={reportsLoading}
            selectedReportId={selectedReportId}
            onSelectReport={(id) => setSelectedReportId(id)}
            filters={{
              scope: reportScope,
              user_id: reportTargetUserId,
              user_obj: reportTargetUserObj,
              start_date: reportStartDate,
              end_date: reportEndDate,
              quick_range: reportQuickRange,
              department: reportDeptFilter,
              status: reportStatusFilter,
              role: reportRoleFilter,
              risk_level: reportRiskFilter,
              priority: reportPriorityFilter
            }}
            onFilterChange={handleReportFilterChange}
            onClearFilters={handleClearReportFilters}
            onQuickRange={handleReportQuickRange}
          />
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
            <div className="glass-card" style={{ marginBottom: '20px', padding: '18px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '900', margin: 0 }}>Orientador de Bienestar IA</h3>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>Soporte conversacional de Gemini basado en tu historial e indicadores institucionales.</p>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building size={20} style={{ color: 'var(--primary)' }} /> Jerarquía Institucional y Departamentos Reales
                  </h3>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    Administración multitenant: Organizaciones, departamentos internos y códigos de acceso seguros.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setInstSubTab('institutions')}
                    className={`duo-pill ${instSubTab === 'institutions' ? 'selected' : ''}`}
                  >
                    <Building size={13} />
                    <span>Instituciones ({allInstitutions.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInstSubTab('departments')}
                    className={`duo-pill ${instSubTab === 'departments' ? 'selected' : ''}`}
                  >
                    <Layers size={13} />
                    <span>Departamentos ({departmentsList.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInstSubTab('invitations')}
                    className={`duo-pill ${instSubTab === 'invitations' ? 'selected' : ''}`}
                  >
                    <Key size={13} />
                    <span>Invitaciones ({invitationsList.length})</span>
                  </button>
                </div>
              </div>

              {/* SUB-PESTAÑA 1: INSTITUCIONES */}
              {instSubTab === 'institutions' && (
                <div>
                  {/* Formulario de Creación Exclusivo para SuperAdmin */}
                  {user?.role === 'superadmin' && (
                    <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '24px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <PlusCircle size={16} /> Crear Nueva Organización Institucional (Exclusivo SuperAdmin)
                      </h4>

                      <form onSubmit={handleCreateInstitution}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                          <div>
                            <label style={{ fontSize: '11px', fontWeight: '800', display: 'block', marginBottom: '4px' }}>NOMBRE DE LA INSTITUCIÓN *:</label>
                            <input
                              type="text"
                              placeholder="Ej. Universidad Central de Guatemala"
                              value={newInstName}
                              onChange={(e) => setNewInstName(e.target.value)}
                              required
                              style={{ width: '100%', borderRadius: '10px', fontSize: '12px', padding: '10px' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '11px', fontWeight: '800', display: 'block', marginBottom: '4px' }}>TIPO / SECTOR *:</label>
                            <CustomSelect
                              options={[
                                { value: 'educativa', label: '🎓 Educativa / Universidad' },
                                { value: 'laboral', label: '💼 Empresa / Corporativo' },
                                { value: 'salud', label: '🏥 Salud / Clínica' },
                                { value: 'comunitaria', label: '🤝 Comunitaria / ONG' }
                              ]}
                              value={newInstType}
                              onChange={(val) => setNewInstType(val)}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '11px', fontWeight: '800', display: 'block', marginBottom: '4px' }}>CORREO OFICIAL:</label>
                            <input
                              type="email"
                              placeholder="contacto@institucion.edu.gt"
                              value={newInstEmail}
                              onChange={(e) => setNewInstEmail(e.target.value)}
                              style={{ width: '100%', borderRadius: '10px', fontSize: '12px', padding: '10px' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '11px', fontWeight: '800', display: 'block', marginBottom: '4px' }}>TELÉFONO:</label>
                            <input
                              type="text"
                              placeholder="+502 2345-6789"
                              value={newInstPhone}
                              onChange={(e) => setNewInstPhone(e.target.value)}
                              style={{ width: '100%', borderRadius: '10px', fontSize: '12px', padding: '10px' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '11px', fontWeight: '800', display: 'block', marginBottom: '4px' }}>CIUDAD / SEDE:</label>
                            <input
                              type="text"
                              placeholder="Ciudad de Guatemala"
                              value={newInstCity}
                              onChange={(e) => setNewInstCity(e.target.value)}
                              style={{ width: '100%', borderRadius: '10px', fontSize: '12px', padding: '10px' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '11px', fontWeight: '800', display: 'block', marginBottom: '4px' }}>PAÍS:</label>
                            <input
                              type="text"
                              value={newInstCountry}
                              onChange={(e) => setNewInstCountry(e.target.value)}
                              style={{ width: '100%', borderRadius: '10px', fontSize: '12px', padding: '10px' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '11px', fontWeight: '800', display: 'block', marginBottom: '4px' }}>DOMINIOS PERMITIDOS (OPCIONAL):</label>
                            <input
                              type="text"
                              placeholder="ej. universidad.edu.gt, facultad.edu.gt"
                              value={newInstDomains}
                              onChange={(e) => setNewInstDomains(e.target.value)}
                              style={{ width: '100%', borderRadius: '10px', fontSize: '12px', padding: '10px' }}
                            />
                          </div>
                        </div>

                        <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <input
                            type="checkbox"
                            id="require_domain_checkbox"
                            checked={newInstRequireDomain}
                            onChange={(e) => setNewInstRequireDomain(e.target.checked)}
                            style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                          />
                          <label htmlFor="require_domain_checkbox" style={{ fontSize: '12px', fontWeight: '700', cursor: 'pointer', color: 'var(--text-primary)' }}>
                            Exigir validación estricta de correo institucional en el registro
                          </label>
                        </div>

                        <div style={{ marginBottom: '14px' }}>
                          <label style={{ fontSize: '11px', fontWeight: '800', display: 'block', marginBottom: '4px' }}>DESCRIPCIÓN / PROPÓSITO INSTITUCIONAL:</label>
                          <textarea
                            rows={2}
                            placeholder="Misión, objetivos institucionales o área de cobertura..."
                            value={newInstDesc}
                            onChange={(e) => setNewInstDesc(e.target.value)}
                            style={{ width: '100%', borderRadius: '10px', fontSize: '12px', padding: '10px' }}
                          />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={instCreateLoading}
                            style={{ padding: '12px 24px', borderRadius: '12px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            {instCreateLoading ? <Loader className="animate-spin" size={16} /> : <PlusCircle size={16} />}
                            <span>Registrar Institución en EquilibrIA</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Listado de Instituciones Registradas */}
                  <div className="grid grid-2" style={{ gap: '16px' }}>
                    {allInstitutions.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>No hay instituciones creadas aún.</p>
                    ) : (
                      allInstitutions.map((inst) => {
                        const isSuspended = inst.status === 'SUSPENDED';
                        const statusBadgeBg = inst.status === 'ACTIVE' ? 'var(--success-light)' : isSuspended ? 'var(--danger-light)' : 'var(--bg-primary)';
                        const statusBadgeColor = inst.status === 'ACTIVE' ? 'var(--success)' : isSuspended ? 'var(--danger)' : 'var(--text-muted)';

                        return (
                          <div key={inst.id} className="futuristic-card-item" style={{ padding: '20px', borderLeft: `4px solid ${isSuspended ? 'var(--danger)' : 'var(--primary)'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                              <div>
                                <span style={{ fontSize: '10px', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                  CÓDIGO: {inst.code || 'EQUI-ORG'}
                                </span>
                                <h4 style={{ fontSize: '16px', fontWeight: '900', marginTop: '2px' }}>{inst.name}</h4>
                              </div>

                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <span style={{ fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '10px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', textTransform: 'uppercase' }}>
                                  {inst.type}
                                </span>
                                <span style={{ fontSize: '10px', fontWeight: '900', padding: '3px 8px', borderRadius: '10px', backgroundColor: statusBadgeBg, color: statusBadgeColor }}>
                                  {inst.status}
                                </span>
                              </div>
                            </div>

                            {inst.description && (
                              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                                {inst.description}
                              </p>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: '10px', marginBottom: '12px', fontSize: '11px', textAlign: 'center' }}>
                              <div>
                                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Integrantes</span>
                                <strong style={{ fontSize: '13px' }}>{inst.total_members || 0}</strong>
                              </div>
                              <div>
                                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Activos</span>
                                <strong style={{ fontSize: '13px', color: 'var(--success)' }}>{inst.active_members || 0}</strong>
                              </div>
                              <div>
                                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Departamentos</span>
                                <strong style={{ fontSize: '13px', color: 'var(--primary)' }}>{inst.total_departments || 0}</strong>
                              </div>
                            </div>

                            {/* Departamentos */}
                            <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '10px', marginBottom: '12px' }}>
                              <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                                DEPARTAMENTOS ACTIVOS:
                              </span>
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {(inst.departments || []).map((d) => (
                                  <span key={d} style={{ fontSize: '10.5px', padding: '2px 8px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', fontWeight: '700' }}>
                                    🏢 {d}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Acciones de SuperAdmin */}
                            {user?.role === 'superadmin' && (
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                                <button
                                  type="button"
                                  onClick={() => handleToggleInstitutionStatus(inst.id, inst.status)}
                                  className="duo-pill"
                                  style={{
                                    padding: '6px 12px',
                                    fontSize: '11.5px',
                                    fontWeight: '800',
                                    color: isSuspended ? 'var(--success)' : 'var(--danger)',
                                    borderColor: isSuspended ? 'var(--success)' : 'var(--danger)'
                                  }}
                                >
                                  <Shield size={12} />
                                  <span>{isSuspended ? 'Reactivar Institución' : 'Suspender Acceso'}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* SUB-PESTAÑA 2: DEPARTAMENTOS REALES */}
              {instSubTab === 'departments' && (
                <div>
                  {/* Selector de Institución si es SuperAdmin */}
                  {user?.role === 'superadmin' && (
                    <div style={{ marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '800' }}>INSTITUCIÓN A GESTIONAR:</label>
                      <div style={{ minWidth: '260px' }}>
                        <CustomSelect
                          options={allInstitutions.map(i => ({ value: i.id, label: `🏛️ ${i.name} (${i.code})` }))}
                          value={selectedInstForDepts}
                          onChange={(val) => setSelectedInstForDepts(val)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Formulario de Creación de Departamento */}
                  <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '18px', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '22px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <PlusCircle size={16} /> Crear Departamento en la Institución
                    </h4>

                    <form onSubmit={handleCreateDepartment} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', alignItems: 'end' }}>
                      <div>
                        <label style={{ fontSize: '10.5px', fontWeight: '800', display: 'block', marginBottom: '4px' }}>NOMBRE DEL DEPARTAMENTO *:</label>
                        <input
                          type="text"
                          placeholder="Ej. Innovación y Desarrollo"
                          value={newDeptName}
                          onChange={(e) => setNewDeptName(e.target.value)}
                          required
                          style={{ width: '100%', fontSize: '12px', padding: '9px', borderRadius: '9px' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '10.5px', fontWeight: '800', display: 'block', marginBottom: '4px' }}>CÓDIGO ÚNICO (Ej. I+D, TEC, RRHH) *:</label>
                        <input
                          type="text"
                          placeholder="Ej. INV"
                          value={newDeptCode}
                          onChange={(e) => setNewDeptCode(e.target.value)}
                          required
                          style={{ width: '100%', fontSize: '12px', padding: '9px', borderRadius: '9px', textTransform: 'uppercase' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '10.5px', fontWeight: '800', display: 'block', marginBottom: '4px' }}>ASIGNAR LÍDER (OPCIONAL):</label>
                        <select
                          value={newDeptLeaderId}
                          onChange={(e) => setNewDeptLeaderId(e.target.value)}
                          style={{ width: '100%', fontSize: '12px', padding: '9px', borderRadius: '9px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                        >
                          <option value="">Sin Líder Asignado</option>
                          {members.map(m => (
                            <option key={m.id} value={m.id}>{m.first_name} {m.last_name} ({m.email})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={deptCreateLoading}
                          style={{ width: '100%', padding: '10px', borderRadius: '10px', fontWeight: '900', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        >
                          {deptCreateLoading ? <Loader className="animate-spin" size={14} /> : <Plus size={14} />}
                          <span>Crear Departamento</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Listado de Departamentos */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                    {deptsLoading ? (
                      <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '30px' }}><Loader className="animate-spin" size={24} /></div>
                    ) : departmentsList.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>No hay departamentos registrados para esta institución.</p>
                    ) : (
                      departmentsList.map(dept => (
                        <div key={dept.id} className="futuristic-card-item" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: dept.is_active ? 1 : 0.65 }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <span style={{ fontSize: '10px', fontWeight: '900', padding: '2px 7px', borderRadius: '6px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                                {dept.code}
                              </span>
                              <span style={{ fontSize: '10px', fontWeight: '900', padding: '2px 6px', borderRadius: '6px', backgroundColor: dept.is_active ? 'var(--success-light)' : 'var(--danger-light)', color: dept.is_active ? 'var(--success)' : 'var(--danger)' }}>
                                {dept.is_active ? 'ACTIVO' : 'INACTIVO'}
                              </span>
                            </div>

                            <h4 style={{ fontSize: '14.5px', fontWeight: '800', marginBottom: '4px' }}>{dept.name}</h4>
                            <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{dept.description || 'Área institucional de trabajo.'}</p>
                            
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <span>👔 Líder: <strong>{dept.leader_name || 'No asignado'}</strong></span>
                              <span>👥 Miembros Asociados: <strong>{dept.user_count || 0}</strong></span>
                            </div>
                          </div>

                          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              onClick={() => handleToggleDeptStatus(dept.institution_id, dept.id)}
                              className="duo-pill"
                              style={{ padding: '4px 10px', fontSize: '11px', color: dept.is_active ? 'var(--danger)' : 'var(--success)' }}
                            >
                              <span>{dept.is_active ? 'Desactivar (Soft Delete)' : 'Reactivar'}</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* SUB-PESTAÑA 3: INVITACIONES INSTITUCIONALES */}
              {instSubTab === 'invitations' && (
                <div>
                  {/* Selector de Institución si es SuperAdmin */}
                  {user?.role === 'superadmin' && (
                    <div style={{ marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '800' }}>INSTITUCIÓN:</label>
                      <div style={{ minWidth: '260px' }}>
                        <CustomSelect
                          options={allInstitutions.map(i => ({ value: i.id, label: `🏛️ ${i.name} (${i.code})` }))}
                          value={selectedInstForDepts}
                          onChange={(val) => setSelectedInstForDepts(val)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Formulario de Generación de Invitación */}
                  <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '18px', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '22px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Key size={16} /> Generar Código de Invitación Seguro
                    </h4>

                    <form onSubmit={handleCreateInvitation} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'end' }}>
                      <div>
                        <label style={{ fontSize: '10.5px', fontWeight: '800', display: 'block', marginBottom: '4px' }}>ROL AUTORIZADO:</label>
                        <select
                          value={newInvRole}
                          onChange={(e) => setNewInvRole(e.target.value)}
                          style={{ width: '100%', fontSize: '12px', padding: '9px', borderRadius: '9px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                        >
                          <option value="miembro">👤 Miembro / Colaborador</option>
                          <option value="lider_depto">👔 Líder de Departamento</option>
                          <option value="profesional_apoyo">🧠 Profesional / Psicólogo</option>
                          <option value="admin_institucion">🏛️ Admin Institucional</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '10.5px', fontWeight: '800', display: 'block', marginBottom: '4px' }}>DEPARTAMENTO DESTINO:</label>
                        <select
                          value={newInvDeptId}
                          onChange={(e) => setNewInvDeptId(e.target.value)}
                          style={{ width: '100%', fontSize: '12px', padding: '9px', borderRadius: '9px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                        >
                          <option value="">General / Por Definir</option>
                          {departmentsList.map(d => (
                            <option key={d.id} value={d.id}>🏢 {d.name} ({d.code})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '10.5px', fontWeight: '800', display: 'block', marginBottom: '4px' }}>USOS MÁXIMOS (VACÍO = ILIMITADO):</label>
                        <input
                          type="number"
                          placeholder="Ej. 10"
                          min="1"
                          value={newInvMaxUses}
                          onChange={(e) => setNewInvMaxUses(e.target.value)}
                          style={{ width: '100%', fontSize: '12px', padding: '9px', borderRadius: '9px' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '10.5px', fontWeight: '800', display: 'block', marginBottom: '4px' }}>DÍAS DE VIGENCIA:</label>
                        <input
                          type="number"
                          placeholder="30"
                          min="1"
                          max="365"
                          value={newInvExpiresDays}
                          onChange={(e) => setNewInvExpiresDays(e.target.value)}
                          style={{ width: '100%', fontSize: '12px', padding: '9px', borderRadius: '9px' }}
                        />
                      </div>

                      <div>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={invCreateLoading}
                          style={{ width: '100%', padding: '10px', borderRadius: '10px', fontWeight: '900', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        >
                          {invCreateLoading ? <Loader className="animate-spin" size={14} /> : <Key size={14} />}
                          <span>Generar Código</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Listado de Invitaciones */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                    {invLoading ? (
                      <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '30px' }}><Loader className="animate-spin" size={24} /></div>
                    ) : invitationsList.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '12.5px' }}>No hay invitaciones creadas para esta institución.</p>
                    ) : (
                      invitationsList.map(inv => {
                        const isRevoked = !inv.is_active;
                        const statusColor = inv.status === 'ACTIVE' ? 'var(--success)' : 'var(--danger)';
                        const statusBg = inv.status === 'ACTIVE' ? 'var(--success-light)' : 'var(--danger-light)';

                        return (
                          <div key={inv.id} className="futuristic-card-item" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: isRevoked ? 0.6 : 1 }}>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ fontSize: '10px', fontWeight: '900', padding: '2px 7px', borderRadius: '6px', backgroundColor: statusBg, color: statusColor }}>
                                  {inv.status}
                                </span>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                  Usos: <strong>{inv.used_count}</strong> {inv.max_uses ? `/ ${inv.max_uses}` : '(Ilimitado)'}
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', backgroundColor: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: '8px' }}>
                                <span style={{ fontSize: '13px', fontWeight: '900', fontFamily: 'monospace', letterSpacing: '1px', color: 'var(--primary)', flex: 1 }}>
                                  {inv.code}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(inv.code);
                                    setCopiedInvCode(inv.code);
                                    showAlert('success', 'Código Copiado', `Código ${inv.code} copiado al portapapeles.`);
                                    setTimeout(() => setCopiedInvCode(null), 2000);
                                  }}
                                  style={{ border: 'none', background: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                  title="Copiar código"
                                >
                                  {copiedInvCode === inv.code ? <CheckCircle size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
                                </button>
                              </div>

                              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                <span>Rol asignado: <strong>{inv.role}</strong></span>
                                <span>Depto: <strong>{inv.department || 'General'}</strong></span>
                                <span>Vence: <strong>{inv.expires_at ? new Date(inv.expires_at).toLocaleDateString() : 'Sin expiración'}</strong></span>
                                {inv.created_by_name && <span>Creado por: {inv.created_by_name}</span>}
                              </div>
                            </div>

                            {inv.is_active && (
                              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                  type="button"
                                  onClick={() => handleRevokeInvitation(inv.institution_id, inv.id)}
                                  className="duo-pill"
                                  style={{ padding: '4px 10px', fontSize: '11px', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                                >
                                  <span>Revocar Código</span>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 12: DICCIONARIO CULTURAL GUATEMALTECO 🇬🇹 (SUPERADMIN) */}
        {activeTab === 'culture' && (
          <div className="animate-fade" style={{ display: 'grid', gap: '16px' }}>
            
            {/* Header del Módulo */}
            <div className="glass-card" style={{
              padding: '20px 24px',
              borderRadius: '20px',
              border: '1.5px solid var(--border)',
              borderBottom: '4px solid var(--primary)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '10px', fontWeight: '900', padding: '2px 8px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', textTransform: 'uppercase' }}>
                    🇬🇹 Diccionario Cultural & Ética IA
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>
                    3 Niveles de Seguridad
                  </span>
                </div>
                <h1 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                  Diccionario Cultural Guatemalteco
                </h1>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', maxWidth: '650px', lineHeight: '1.4' }}>
                  Administra los modismos y términos locales clasificados para la interacción segura y ética de la IA.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (showExprModal) {
                    setShowExprModal(false);
                  } else {
                    handleOpenNewExprModal();
                  }
                }}
                className="btn btn-primary"
                style={{ padding: '10px 18px', borderRadius: '12px', fontWeight: '800', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {showExprModal && !editingExpr ? <X size={16} /> : <Plus size={16} />}
                <span>{showExprModal && !editingExpr ? 'Cerrar Formulario' : '➕ Nueva Expresión'}</span>
              </button>
            </div>

            {/* FORMULARIO SUPERIOR EXPANDIBLE (SE ABRE ARRIBA AL PRESIONAR EL BOTÓN) */}
            {showExprModal && (
              <div className="glass-card animate-scale" style={{
                padding: '20px 24px',
                borderRadius: '18px',
                border: '2px solid var(--primary)',
                backgroundColor: 'var(--bg-secondary)',
                boxShadow: 'var(--shadow-md)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                    <BookOpen size={18} />
                    <span>{editingExpr ? `Editar Expresión: "${editingExpr.term}"` : '➕ Registrar Nueva Expresión Cultural'}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowExprModal(false)}
                    style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}
                    title="Cerrar"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSaveCulturalExpression} style={{ display: 'grid', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        TÉRMINO O PALABRA: *
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. cabal, chilero, patojo..."
                        value={exprForm.term}
                        onChange={(e) => setExprForm({ ...exprForm, term: e.target.value })}
                        required
                        disabled={!!editingExpr}
                        style={{ width: '100%', borderRadius: '10px', padding: '8px 12px', fontSize: '12.5px' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        NIVEL DE SEGURIDAD: *
                      </label>
                      <select
                        value={exprForm.safety_level}
                        onChange={(e) => {
                          const lvl = e.target.value;
                          setExprForm({
                            ...exprForm,
                            safety_level: lvl,
                            can_use: lvl === 'ALLOWED'
                          });
                        }}
                        style={{ width: '100%', fontSize: '12px', padding: '8px 10px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                      >
                        <option value="ALLOWED">🟢 Nivel 1 (Permitida) • Uso sutil por IA</option>
                        <option value="EXPLAINABLE">🟡 Nivel 2 (Solo Explicable) • Si el usuario pregunta</option>
                        <option value="RESTRICTED">🔴 Nivel 3 (Restringida) • Vulgaridad / Bloqueo</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        CATEGORÍA:
                      </label>
                      <select
                        value={exprForm.category}
                        onChange={(e) => setExprForm({ ...exprForm, category: e.target.value })}
                        style={{ width: '100%', fontSize: '12px', padding: '8px 10px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                      >
                        <option value="GUATEMALTEQUISMO">Guatemaltequismo</option>
                        <option value="COLOQUIAL">Coloquialismo</option>
                        <option value="JERGA">Jerga Popular</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        SIGNIFICADO: *
                      </label>
                      <input
                        type="text"
                        placeholder="Descripción clara y precisa del significado..."
                        value={exprForm.meaning}
                        onChange={(e) => setExprForm({ ...exprForm, meaning: e.target.value })}
                        required
                        style={{ width: '100%', borderRadius: '10px', padding: '8px 12px', fontSize: '12.5px' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        EJEMPLO DE USO COTIDIANO:
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Cabal, eso era lo que teníamos pendiente."
                        value={exprForm.example}
                        onChange={(e) => setExprForm({ ...exprForm, example: e.target.value })}
                        style={{ width: '100%', borderRadius: '10px', padding: '8px 12px', fontSize: '12.5px' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      NOTAS DE CONTEXTO (OPCIONAL):
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Uso positivo de afirmación / evitar dirigir al usuario..."
                      value={exprForm.context_notes}
                      onChange={(e) => setExprForm({ ...exprForm, context_notes: e.target.value })}
                      style={{ width: '100%', borderRadius: '10px', padding: '8px 12px', fontSize: '12px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setShowExprModal(false)}
                      className="btn btn-secondary"
                      style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: '700' }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ padding: '8px 22px', borderRadius: '10px', fontSize: '12px', fontWeight: '800' }}
                    >
                      {editingExpr ? '💾 Guardar Cambios' : '➕ Registrar Expresión'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Barra Compacta de Filtros y Estadísticas Integradas */}
            <div className="glass-card" style={{
              padding: '12px 18px',
              borderRadius: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              {/* Buscador */}
              <div style={{ position: 'relative', flex: 1, minWidth: '220px', maxWidth: '380px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Buscar término o significado..."
                  value={cultureSearch}
                  onChange={(e) => setCultureSearch(e.target.value)}
                  style={{ width: '100%', padding: '7px 10px 7px 32px', borderRadius: '10px', fontSize: '12px' }}
                />
              </div>

              {/* Botones de Filtro con Conteo Integrado */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                {[
                  { id: 'ALL', label: 'Todos', count: culturalCounts.total, color: 'var(--text-primary)', bg: 'var(--bg-secondary)' },
                  { id: 'ALLOWED', label: '🟢 Permitidas', count: culturalCounts.allowed, color: 'var(--success)', bg: 'var(--success-light)' },
                  { id: 'EXPLAINABLE', label: '🟡 Explicables', count: culturalCounts.explainable, color: 'var(--warning)', bg: 'rgba(234, 179, 8, 0.12)' },
                  { id: 'RESTRICTED', label: '🔴 Restringidas', count: culturalCounts.restricted, color: 'var(--danger)', bg: 'var(--danger-light)' }
                ].map(f => {
                  const isSelected = cultureSafetyFilter === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setCultureSafetyFilter(f.id)}
                      className={`duo-pill ${isSelected ? 'selected' : ''}`}
                      style={{
                        fontSize: '11.5px',
                        padding: '5px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: isSelected ? '800' : '600'
                      }}
                    >
                      <span>{f.label}</span>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: '900',
                        padding: '1px 6px',
                        borderRadius: '10px',
                        backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-tertiary)',
                        color: isSelected ? '#fff' : 'var(--text-secondary)'
                      }}>
                        {f.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* VISTA DE LISTA COMPACTA Y ORDENADA */}
            {cultureLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <Loader className="animate-spin" size={24} style={{ margin: '0 auto 10px', color: 'var(--primary)' }} />
                <span style={{ fontSize: '12.5px' }}>Cargando expresiones...</span>
              </div>
            ) : culturalExpressions.length === 0 ? (
              <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
                <BookOpen size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
                <h3 style={{ fontSize: '14px', fontWeight: '800' }}>No se encontraron expresiones</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Ajusta los filtros de búsqueda o agrega una nueva expresión arriba.
                </p>
              </div>
            ) : (
              <div className="glass-card" style={{ padding: '6px', borderRadius: '18px', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gap: '4px' }}>
                  {culturalExpressions.map((expr, idx) => {
                    const isAllowed = expr.safety_level === 'ALLOWED';
                    const isExplainable = expr.safety_level === 'EXPLAINABLE';
                    const isRestricted = expr.safety_level === 'RESTRICTED';

                    const badgeColor = isAllowed ? 'var(--success)' : isExplainable ? 'var(--warning)' : 'var(--danger)';
                    const badgeBg = isAllowed ? 'var(--success-light)' : isExplainable ? 'rgba(234, 179, 8, 0.12)' : 'var(--danger-light)';
                    const badgeIcon = isAllowed ? '🟢 N1' : isExplainable ? '🟡 N2' : '🔴 N3';
                    const badgeDesc = isAllowed ? 'Permitida' : isExplainable ? 'Solo Explicable' : 'Restringida';

                    return (
                      <div 
                        key={expr.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 16px',
                          borderRadius: '12px',
                          backgroundColor: idx % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-secondary)',
                          borderLeft: `4px solid ${badgeColor}`,
                          opacity: expr.active ? 1 : 0.6,
                          gap: '14px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {/* Nivel y Término */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '180px' }}>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: '900',
                            padding: '2px 7px',
                            borderRadius: '6px',
                            backgroundColor: badgeBg,
                            color: badgeColor,
                            whiteSpace: 'nowrap'
                          }} title={badgeDesc}>
                            {badgeIcon}
                          </span>

                          <div>
                            <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)', display: 'block' }}>
                              "{expr.term}"
                            </strong>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>
                              {expr.category}
                            </span>
                          </div>
                        </div>

                        {/* Significado y Ejemplo */}
                        <div style={{ flex: 1, minWidth: '220px' }}>
                          <p style={{ fontSize: '12px', color: 'var(--text-primary)', margin: 0, lineHeight: '1.35' }}>
                            {expr.meaning}
                          </p>
                          {expr.example && (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', display: 'block', marginTop: '2px' }}>
                              💡 "{expr.example}"
                            </span>
                          )}
                        </div>

                        {/* Estado y Acciones Compactas */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                          <button
                            type="button"
                            onClick={() => handleToggleExpressionActive(expr)}
                            className="duo-pill"
                            style={{
                              fontSize: '10.5px',
                              padding: '3px 8px',
                              color: expr.active ? 'var(--success)' : 'var(--text-muted)',
                              borderColor: expr.active ? 'var(--success)' : 'var(--border)'
                            }}
                            title={expr.active ? 'Desactivar expresión' : 'Activar expresión'}
                          >
                            {expr.active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                            <span>{expr.active ? 'Activa' : 'Inactiva'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditExprModal(expr)}
                            className="theme-toggle"
                            style={{ border: '1px solid var(--border)', width: '28px', height: '28px', borderRadius: '8px', color: 'var(--primary)' }}
                            title="Editar"
                          >
                            <Edit3 size={12} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteExpression(expr)}
                            className="theme-toggle"
                            style={{ border: '1px solid var(--border)', width: '28px', height: '28px', borderRadius: '8px', color: 'var(--danger)' }}
                            title="Eliminar"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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

              {/* Contenido de Respuestas Estructurado */}
              <div style={{ marginBottom: '18px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary)', marginBottom: '8px' }}>
                  Respuestas de las Preguntas del Test y Boceto:
                </h4>
                <TestResponseViewer 
                  rawText={selectedSubmission.original_text} 
                  userName={selectedSubmission.user_name} 
                  date={selectedSubmission.created_at} 
                />
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
