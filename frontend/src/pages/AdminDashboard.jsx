import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { 
  Sun, Moon, LogOut, ShieldAlert, Award, FileText, Users, BarChart3, 
  PlusCircle, Trash2, Calendar, ClipboardList, Sparkles, Loader, CheckCircle2,
  AlertTriangle, CheckSquare, Settings, Activity, ShieldCheck, Download,
  UserCheck, Lock, FileSpreadsheet, RefreshCw, Zap, Layers, HelpCircle, Eye, Sliders,
  Target, ChevronRight, Check, ArrowLeft, Volume2, Mic, Bell, UserX, Key
} from 'lucide-react';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  // Tab State: 'analytics', 'tasks', 'alerts', 'evaluations', 'members', 'audit', 'reports', 'ai_plans'
  const [activeTab, setActiveTab] = useState('analytics');

  // Sub-Tab State for Evaluations: 'active_tests', 'templates', 'create_custom'
  const [evalSubTab, setEvalSubTab] = useState('active_tests');

  // Sub-Tab State for Members: 'directory', 'roles_rbac'
  const [membersSubTab, setMembersSubTab] = useState('directory');

  // Notification Drawer State
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Alerta Crítica: Un miembro requiere atención emocional en el área de Tecnología.', time: 'Hace 10 min', unread: true },
    { id: 2, text: 'Test Completado: Juan Pérez completó el Chequeo de Salud Emocional (+50 XP).', time: 'Hace 30 min', unread: true },
    { id: 3, text: 'Tarea Programada: Tarea de Pausa Activa vence mañana para el depto. de Salud.', time: 'Hace 2 horas', unread: false }
  ]);

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
  const [reportData, setReportData] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(true);

  // Form States: Tasks
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskCategory, setTaskCategory] = useState('Bienestar');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskAssignedType, setTaskAssignedType] = useState('all');
  const [taskAssignedTarget, setTaskAssignedTarget] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

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

  // Template Targeting States
  const [templateTargets, setTemplateTargets] = useState({});

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

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, sugRes, tasksRes, alertsRes, evalsRes, templatesRes, membersRes, auditRes, reportRes] = await Promise.allSettled([
        api.get('/institutions/dashboard'),
        api.get('/institutions/suggestions'),
        api.get('/tasks'),
        api.get('/alerts?status=pendiente'),
        api.get('/evaluations'),
        api.get('/evaluations/templates'),
        api.get('/institutions/members'),
        api.get('/audit/logs'),
        api.get('/reports/export')
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.data) setStats(statsRes.value.data);
      if (sugRes.status === 'fulfilled' && sugRes.value.data) setSuggestions(sugRes.value.data);
      if (tasksRes.status === 'fulfilled' && tasksRes.value.data) setTasks(tasksRes.value.data);
      if (alertsRes.status === 'fulfilled' && alertsRes.value.data) setAlerts(alertsRes.value.data);
      if (evalsRes.status === 'fulfilled' && evalsRes.value.data) setEvaluations(evalsRes.value.data);
      if (templatesRes.status === 'fulfilled' && templatesRes.value.data) setTemplates(templatesRes.value.data);
      if (membersRes.status === 'fulfilled' && membersRes.value.data) setMembers(membersRes.value.data);
      if (auditRes.status === 'fulfilled' && auditRes.value.data) setAuditLogs(auditRes.value.data);
      if (reportRes.status === 'fulfilled' && reportRes.value.data) setReportData(reportRes.value.data);
    } catch (err) {
      console.error('Error al cargar datos del administrador:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (showPrivacyNotice) {
      const timer = setTimeout(() => {
        setShowPrivacyNotice(false);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [showPrivacyNotice]);

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

  // Exportar Reporte en JSON / CSV (Módulo 8)
  const handleExportCSV = () => {
    if (!reportData) return;
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", `Reporte_Bienestar_${new Date().toISOString().slice(0,10)}.json`);
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
          
          {/* Mascota Equi el Búho Orientador en la vista previa del Admin */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '16px',
            border: '2px solid var(--primary-light)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{
              fontSize: '36px',
              backgroundColor: 'var(--primary-light)',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px var(--primary-light)',
              flexShrink: 0
            }}>
              🦉
            </div>
            <div>
              <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Equi • Tu Búho Orientador (Vista de Prueba Admin)
              </span>
              <p style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
                "{progressPercent === 0 ? '¡Hola Administrador! Aquí puedes probar la experiencia completa con la escala de emojis y dictado por voz.' : progressPercent >= 100 ? '¡Excelente! Has completado todas las preguntas de prueba.' : '¡Vas por la mitad del test! Sigue completando las opciones.'}"
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
                    {(q.type === 'scale_1_10' ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] : [1, 2, 3, 4, 5]).map((val) => {
                      const emojiMap5 = ['😫', '🙁', '😐', '🙂', '😁'];
                      const emojiMap10 = ['😫', '😣', '🙁', '😟', '😐', '🙂', '😊', '😄', '😁', '🤩'];
                      const emoji = q.type === 'scale_1_10' ? emojiMap10[val - 1] : emojiMap5[val - 1];
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setPreviewAnswers(prev => ({ ...prev, [q.id]: val }))}
                          className={`duo-card ${previewAnswers[q.id] === val ? 'selected' : ''}`}
                          style={{ justifyContent: 'center', padding: '10px 6px', flexDirection: 'column', gap: '4px' }}
                        >
                          <span style={{ fontSize: '18px' }}>{emoji}</span>
                          <span style={{ fontSize: '14px', fontWeight: '900' }}>{val}</span>
                        </button>
                      );
                    })}
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
          <div style={{
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%)',
            color: '#ffffff',
            padding: '8px',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--accent-tech-glow)'
          }}>
            <BarChart3 size={18} />
          </div>
          <div>
            <h1 style={{ fontSize: '17px', fontWeight: '900', letterSpacing: '-0.5px' }}>EquilibrIA</h1>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '500' }}>Sistema inteligente de análisis del bienestar emocional</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          
          {/* Botón de Notificaciones 🔔 */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="theme-toggle"
              style={{ border: '1px solid var(--border)', width: '36px', height: '36px', borderRadius: '50%', position: 'relative' }}
              title="Notificaciones en vivo"
            >
              <Bell size={16} />
              {unreadNotificationsCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
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
                    <div key={n.id} className="notification-item" style={{ borderLeft: n.unread ? '4px solid var(--primary)' : '1px solid var(--border)' }}>
                      <p style={{ fontSize: '11.5px', color: 'var(--text-primary)', fontWeight: n.unread ? '800' : '500' }}>{n.text}</p>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button onClick={toggleTheme} className="theme-toggle" style={{ border: '1px solid var(--border)', width: '36px', height: '36px', borderRadius: '50%' }}>
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
        
        {/* Banner de Confidencialidad Superior */}
        {showPrivacyNotice && (
          <div style={{
            width: '100%',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            padding: '16px 24px',
            borderRadius: '14px',
            border: '2px solid var(--border)',
            borderLeft: '6px solid var(--primary)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '20px',
            animation: 'fadeIn var(--transition-normal)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ShieldAlert size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <span>
                <strong>Aviso de Confidencialidad</strong>: Para proteger la identidad y promover la honestidad de los colaboradores, toda la información de bienestar se presenta exclusivamente de forma agregada y anónima.
              </span>
            </div>
            <button onClick={() => setShowPrivacyNotice(false)} aria-label="Cerrar aviso" style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold', lineHeight: 1 }}>×</button>
          </div>
        )}

        {/* Pestañas de Navegación de los Módulos */}
        <div className="tab-container">
          <button className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}><BarChart3 size={15} /><span>Analíticas</span></button>
          <button className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}><ClipboardList size={15} /><span>Tareas</span></button>
          <button className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`} onClick={() => setActiveTab('alerts')}><AlertTriangle size={15} /><span>Alertas</span>{alerts.length > 0 && <span style={{ backgroundColor: 'var(--danger)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: 'var(--radius-full)', fontWeight: 'bold' }}>{alerts.length}</span>}</button>
          <button className={`tab-btn ${activeTab === 'evaluations' ? 'active' : ''}`} onClick={() => setActiveTab('evaluations')}><Calendar size={15} /><span>Tests</span></button>
          <button className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`} onClick={() => setActiveTab('members')}><Users size={15} /><span>Miembros y Roles</span></button>
          <button className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}><FileSpreadsheet size={15} /><span>Reportes</span></button>
          <button className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}><ShieldCheck size={15} /><span>Auditoría</span></button>
          <button className={`tab-btn ${activeTab === 'ai_plans' ? 'active' : ''}`} onClick={() => setActiveTab('ai_plans')}><Sparkles size={15} /><span>Sugerencias IA</span></button>
        </div>

        {/* TAB 1: ANALÍTICAS Y CLIMA EMOCIONAL */}
        {activeTab === 'analytics' && (
          <div className="animate-fade">
            <div className="grid grid-3" style={{ marginBottom: '24px' }}>
              <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', letterSpacing: '0.5px' }}>ESTRÉS PROMEDIO</span>
                  <h2 style={{ fontSize: '26px', fontWeight: '900', marginTop: '4px', color: 'var(--danger)' }}>{stats.averages.stress || 0}%</h2>
                </div>
                <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--danger-light)', color: 'var(--danger)' }}><ShieldAlert size={20} /></div>
              </div>

              <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', letterSpacing: '0.5px' }}>MOTIVACIÓN PROMEDIO</span>
                  <h2 style={{ fontSize: '26px', fontWeight: '900', marginTop: '4px', color: 'var(--success)' }}>{stats.averages.motivation || 0}%</h2>
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
                
                {/* Categoría y Destinatarios */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>CATEGORÍA DE LA TAREA:</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    {['Bienestar', 'Académica', 'Laboral'].map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setTaskCategory(cat)}
                        className={`duo-pill ${taskCategory === cat ? 'selected' : ''}`}
                        style={{ padding: '6px 14px', fontSize: '12px' }}
                      >
                        {cat}
                      </button>
                    ))}
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
                      <div className="form-group">
                        <label style={{ fontSize: '11px', fontWeight: '800' }}>Correo Electrónico del Colaborador:</label>
                        <input 
                          type="email" 
                          placeholder="Ej. miembro@bienestar.com"
                          value={taskAssignedTarget} 
                          onChange={(e) => setTaskAssignedTarget(e.target.value)} 
                          required 
                          style={{ borderRadius: '8px' }}
                        />
                      </div>
                    )}
                  </div>

                  <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>FECHA DE VENCIMIENTO DE LA TAREA:</label>
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-primary)', padding: '4px 10px', borderRadius: '20px', border: '1px solid var(--border)' }}>
                      <Calendar size={14} style={{ color: 'var(--primary)' }} />
                      <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)' }}>Personalizada:</span>
                      <input 
                        type="date" 
                        value={taskDueDate} 
                        onChange={(e) => setTaskDueDate(e.target.value)} 
                        style={{ padding: '4px 8px', fontSize: '11.5px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                      />
                    </div>
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

                        <h5 style={{ fontSize: '12px', fontWeight: '800', marginBottom: '8px' }}>Respuestas del Cuestionario:</h5>
                        <div style={{ display: 'grid', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                          {selectedTestAnalytics.responses.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center' }}>No hay respuestas registradas aún para este test.</p>
                          ) : (
                            selectedTestAnalytics.responses.map((r) => (
                              <div key={r.id} className="futuristic-card-item" style={{ padding: '10px', fontSize: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '10px', marginBottom: '4px' }}>
                                  <span>{new Date(r.created_at).toLocaleDateString()}</span>
                                  <span style={{ fontWeight: '800', color: r.dominant_sentiment === 'Positivo' ? 'var(--success)' : 'var(--danger)' }}>{r.dominant_sentiment}</span>
                                </div>
                                <p style={{ fontStyle: 'italic', color: 'var(--text-primary)' }}>"{r.original_text}"</p>
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
                <h3 style={{ fontSize: '16px', fontWeight: '900', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={16} style={{ color: 'var(--accent)' }} />
                  Activar Plantillas Precargadas de Tests
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                  {templates.map((tpl) => {
                    const config = templateTargets[tpl.id] || { type: 'all', target: '' };
                    return (
                      <div key={tpl.id} className="futuristic-card-item" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{ fontSize: '9px', fontWeight: '800', padding: '3px 8px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>{tpl.category}</span>
                            <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{tpl.questions.length} preguntas</span>
                          </div>
                          <h4 style={{ fontSize: '14.5px', fontWeight: '800', marginBottom: '6px' }}>{tpl.title.replace('[Plantilla] ', '')}</h4>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{tpl.description}</p>
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
                      <div className="form-group">
                        <label>{'Correo Electrónico:'}</label>
                        <input 
                          type="email" 
                          placeholder="Ej. miembro@bienestar.com"
                          value={evalAssignedTarget} 
                          onChange={(e) => setEvalAssignedTarget(e.target.value)} 
                          required 
                          style={{ borderRadius: '8px' }}
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
                              {q.type === 'scale_1_5' ? 'Escala 1-5' : 
                               q.type === 'scale_1_10' ? 'Escala 1-10' : 
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
                          { id: 'scale_1_5', label: '⭕ Escala 1 a 5' },
                          { id: 'scale_1_10', label: '🔟 Escala 1 a 10' },
                          { id: 'text', label: '📝 Texto / Voz' },
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

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-primary)', padding: '4px 10px', borderRadius: '20px', border: '1px solid var(--border)' }}>
                        <Calendar size={14} style={{ color: 'var(--primary)' }} />
                        <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)' }}>Personalizada:</span>
                        <input 
                          type="date" 
                          value={evalDate} 
                          onChange={(e) => setEvalDate(e.target.value)} 
                          style={{ padding: '4px 8px', fontSize: '11.5px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {members.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>No hay miembros registrados.</p>
                ) : (
                  members.map((m) => (
                    <div key={m.id} className="futuristic-card-item" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '15px' }}>
                        {m.first_name?.[0]}{m.last_name?.[0]}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: '800' }}>{m.first_name} {m.last_name}</h4>
                        <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{m.email}</p>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                          <span style={{ fontSize: '9px', fontWeight: '800', padding: '2px 6px', borderRadius: '10px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>{m.department || 'General'}</span>
                          <span style={{ fontSize: '9px', fontWeight: '800', padding: '2px 6px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>{m.role}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
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

        {/* TAB 7: REPORTES INSTITUCIONALES */}
        {activeTab === 'reports' && (
          <div className="glass-card animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileSpreadsheet size={18} style={{ color: 'var(--accent)' }} /> Centro de Reportes Consolidados
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>Resumen descargable en formato oficial para toma de decisiones.</p>
              </div>
              <button onClick={handleExportCSV} className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '13px', borderRadius: '12px' }}>
                <Download size={15} /><span>Exportar Reporte (JSON/CSV)</span>
              </button>
            </div>

            {reportData && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div className="futuristic-card-item">
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700' }}>INSTITUCIÓN</span>
                  <h4 style={{ fontSize: '16px', fontWeight: '900', marginTop: '4px' }}>{reportData.institucion}</h4>
                </div>
                <div className="futuristic-card-item">
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700' }}>REFLEXIONES Y TESTS ANALIZADOS</span>
                  <h4 style={{ fontSize: '16px', fontWeight: '900', marginTop: '4px', color: 'var(--primary)' }}>{reportData.metricas_clave?.total_reflexiones_registradas || 0}</h4>
                </div>
                <div className="futuristic-card-item">
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700' }}>ALERTAS ATENDIDAS</span>
                  <h4 style={{ fontSize: '16px', fontWeight: '900', marginTop: '4px', color: 'var(--success)' }}>{reportData.alertas?.atendidas || 0} / {reportData.alertas?.totales || 0}</h4>
                </div>
              </div>
            )}
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

      </main>
    </div>
  );
};

export default AdminDashboard;
