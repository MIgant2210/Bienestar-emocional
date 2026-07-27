import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { 
  Sun, Moon, LogOut, ShieldAlert, Award, FileText, Users, BarChart3, 
  PlusCircle, Trash2, Calendar, ClipboardList, Sparkles, Loader, CheckCircle2,
  AlertTriangle, CheckSquare, Settings, Activity, ShieldCheck, Download,
  UserCheck, Lock, FileSpreadsheet, RefreshCw, Zap, Layers, HelpCircle, Eye, Sliders,
  Target, ChevronRight, Check, ArrowLeft
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
  const [taskAssignedEmail, setTaskAssignedEmail] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  // Form States: Evaluations / Tests Custom
  const [evalTitle, setEvalTitle] = useState('');
  const [evalDesc, setEvalDesc] = useState('');
  const [evalCategory, setEvalCategory] = useState('Bienestar Integral');
  const [evalDate, setEvalDate] = useState('');
  const [evalAssignedType, setEvalAssignedType] = useState('all'); // 'all', 'department', 'individual'
  const [evalAssignedTarget, setEvalAssignedTarget] = useState(''); // Email o Nombre de departamento
  
  const [customQuestions, setCustomQuestions] = useState([
    { id: 'q1', question: '¿Cómo evalúas tu nivel general de energía o fatiga esta semana?', type: 'scale_1_5' },
    { id: 'q2', question: 'Describe factores clave que influyeron en tu estado de ánimo o clima.', type: 'text' }
  ]);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState('scale_1_5');
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalError, setEvalError] = useState('');
  const [evalSuccess, setEvalSuccess] = useState('');

  // Template Targeting States (por ID de plantilla)
  const [templateTargets, setTemplateTargets] = useState({}); // { [tplId]: { type: 'all'|'department'|'individual', target: '' } }

  // Estado para Inspeccionar Respuestas y Métricas de un Test Seleccionado
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
      assigned_email: taskAssignedEmail || null
    };

    try {
      await api.post('/tasks', payload);
      setCreateSuccess('Tarea creada y asignada exitosamente.');
      setTaskTitle('');
      setTaskDesc('');
      setTaskDueDate('');
      setTaskAssignedEmail('');
      
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
    
    // Obtener segmentación de destino seleccionada en la tarjeta
    const tplConfig = templateTargets[templateId] || { type: 'all', target: '' };

    try {
      const res = await api.post('/evaluations/activate-template', { 
        template_id: templateId,
        assigned_type: tplConfig.type,
        assigned_target: tplConfig.target
      });
      setEvalSuccess(res.data.message);
      setEvalSubTab('active_tests'); // Redirigir a tests activos
      const evalsRes = await api.get('/evaluations');
      setEvaluations(evalsRes.data);
    } catch (err) {
      setEvalError(err.response?.data?.message || 'Error al activar el test precargado.');
    } finally {
      setEvalLoading(false);
    }
  };

  // Manejar cambio en la segmentación del template
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
      setEvalSubTab('active_tests'); // Redirigir a la pestaña de activos
      
      const evalsRes = await api.get('/evaluations');
      setEvaluations(evalsRes.data);
    } catch (err) {
      setEvalError(err.response?.data?.message || 'Error al programar el test.');
    } finally {
      setEvalLoading(false);
    }
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <span style={{ color: 'var(--text-secondary)' }}>Cargando módulos de la plataforma...</span>
      </div>
    );
  }

  // Gráfica de pastel de sentimientos
  const pieData = Object.keys(stats.sentiment_distribution).map(key => ({
    name: key,
    value: stats.sentiment_distribution[key] || 0
  }));

  const COLORS = {
    Positivo: 'var(--success)',
    Neutro: 'var(--text-muted)',
    Negativo: 'var(--danger)'
  };

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
        
        {/* Cabecera / Barra Superior Fija del Test */}
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

        {/* Contenedor Principal (Google Forms Preview Style) */}
        <div style={{ width: '100%', maxWidth: '780px', padding: '24px 16px', display: 'grid', gap: '20px' }}>
          
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            borderTop: '8px solid var(--primary)',
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
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  borderLeft: previewAnswers[q.id] !== undefined ? '5px solid var(--success)' : '1px solid var(--border)',
                  boxShadow: 'var(--shadow-sm)',
                  padding: '24px 28px'
                }}
              >
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <span style={{ color: 'var(--primary)' }}>{idx + 1}.</span>
                  {q.question}
                </h3>

                {q.type === 'text' && (
                  <textarea
                    rows="3"
                    placeholder="Escribe la respuesta de prueba..."
                    value={previewAnswers[q.id] || ''}
                    onChange={(e) => setPreviewAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                    required
                  />
                )}

                {(q.type === 'scale_1_5' || q.type === 'scale_1_10') && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginTop: '8px', 
                    backgroundColor: 'var(--bg-primary)', 
                    padding: '14px 20px', 
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: '700' }}>Muy Bajo</span>
                    <div style={{ display: 'flex', gap: q.type === 'scale_1_10' ? '8px' : '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
                      {(q.type === 'scale_1_10' ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] : [1, 2, 3, 4, 5]).map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setPreviewAnswers(prev => ({ ...prev, [q.id]: val }))}
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            border: previewAnswers[q.id] === val ? '2px solid var(--primary)' : '1px solid var(--border)',
                            backgroundColor: previewAnswers[q.id] === val ? 'var(--primary-light)' : 'var(--bg-secondary)',
                            fontWeight: '900',
                            color: previewAnswers[q.id] === val ? 'var(--primary)' : 'var(--text-primary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: '700' }}>Muy Alto</span>
                  </div>
                )}

                {q.type === 'boolean' && (
                  <div style={{ 
                    display: 'flex', 
                    gap: '16px', 
                    marginTop: '8px', 
                    backgroundColor: 'var(--bg-primary)', 
                    padding: '14px 20px', 
                    borderRadius: '8px',
                    border: '1px solid var(--border)'
                  }}>
                    {['Sí', 'No'].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setPreviewAnswers(prev => ({ ...prev, [q.id]: opt }))}
                        style={{
                          flex: 1,
                          padding: '10px 16px',
                          borderRadius: '8px',
                          border: previewAnswers[q.id] === opt ? '2px solid var(--primary)' : '1px solid var(--border)',
                          backgroundColor: previewAnswers[q.id] === opt ? 'var(--primary-light)' : 'var(--bg-secondary)',
                          fontWeight: '800',
                          color: previewAnswers[q.id] === opt ? 'var(--primary)' : 'var(--text-primary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {previewAnswers[q.id] === opt && <Check size={14} />}
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
                style={{ flex: 1, padding: '12px 24px', borderRadius: '8px' }}
              >
                {previewSubmitLoading ? <Loader className="animate-spin" size={16} /> : 'Enviar Respuesta de Prueba'}
              </button>
              <button 
                type="button" 
                onClick={() => setPreviewTest(null)}
                className="btn btn-secondary"
                style={{ padding: '12px 24px', borderRadius: '8px' }}
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navbar Superior Compacta */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 24px',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
        zIndex: 10
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
      <main style={{ flex: 1, padding: '28px 24px 36px', maxWidth: '1380px', width: '100%', margin: '0 auto' }}>
        
        {/* Banner de Confidencialidad Superior */}
        {showPrivacyNotice && (
          <div style={{
            width: '100%',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            padding: '16px 24px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
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

        {/* Pestañas de Navegación de los 8 Módulos Funcionales */}
        <div className="tab-container">
          <button className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}><BarChart3 size={15} /><span>Analíticas</span></button>
          <button className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}><ClipboardList size={15} /><span>Tareas</span></button>
          <button className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`} onClick={() => setActiveTab('alerts')}><AlertTriangle size={15} /><span>Alertas</span>{alerts.length > 0 && <span style={{ backgroundColor: 'var(--danger)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: 'var(--radius-full)', fontWeight: 'bold' }}>{alerts.length}</span>}</button>
          <button className={`tab-btn ${activeTab === 'evaluations' ? 'active' : ''}`} onClick={() => setActiveTab('evaluations')}><Calendar size={15} /><span>Tests</span></button>
          <button className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`} onClick={() => setActiveTab('members')}><Users size={15} /><span>Miembros</span></button>
          <button className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}><FileSpreadsheet size={15} /><span>Reportes</span></button>
          <button className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}><ShieldCheck size={15} /><span>Auditoría</span></button>
          <button className={`tab-btn ${activeTab === 'ai_plans' ? 'active' : ''}`} onClick={() => setActiveTab('ai_plans')}><Sparkles size={15} /><span>Sugerencias IA</span></button>
        </div>

        {/* TAB 1: ANALÍTICAS Y CLIMA EMOCIONAL */}
        {activeTab === 'analytics' && (
          <div className="animate-fade">
            <div className="grid grid-3" style={{ marginBottom: '24px', gap: '18px' }}>
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

            <div className="grid grid-2" style={{ gap: '24px' }}>
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

        {/* TAB 2: TAREAS */}
        {activeTab === 'tasks' && (
          <div className="grid grid-2 animate-fade" style={{ alignItems: 'start' }}>
            <div className="glass-card">
              <h3 style={{ fontSize: '17px', fontWeight: '900', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlusCircle size={18} style={{ color: 'var(--primary)' }} /> Crear Tarea Institucional
              </h3>

              {createError && <div style={{ backgroundColor: 'var(--danger-light)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '10px', borderRadius: 'var(--radius-sm)', fontSize: '12.5px', marginBottom: '14px' }}>{createError}</div>}
              {createSuccess && <div style={{ backgroundColor: 'var(--success-light)', border: '1px solid var(--success)', color: 'var(--success)', padding: '10px', borderRadius: 'var(--radius-sm)', fontSize: '12.5px', marginBottom: '14px' }}>{createSuccess}</div>}

              <form onSubmit={handleCreateTask}>
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label>Título de la Tarea</label>
                  <input type="text" placeholder="Ej. Pausa activa de respiración" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required />
                </div>
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label>Descripción</label>
                  <textarea rows="3" placeholder="Describe los detalles..." value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} style={{ resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div className="form-group" style={{ flex: 1, marginBottom: '14px' }}>
                    <label>Categoría</label>
                    <select value={taskCategory} onChange={(e) => setTaskCategory(e.target.value)}>
                      <option value="Bienestar">Bienestar</option>
                      <option value="Académica">Académica</option>
                      <option value="Laboral">Laboral</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1, marginBottom: '14px' }}>
                    <label>Fecha Vencimiento</label>
                    <input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={createLoading} style={{ width: '100%' }}>
                  {createLoading ? <Loader className="animate-spin" size={16} /> : 'Publicar Tarea'}
                </button>
              </form>
            </div>

            <div className="glass-card">
              <h3 style={{ fontSize: '17px', fontWeight: '900', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ClipboardList size={18} /> Tareas Publicadas
              </h3>
              <div style={{ display: 'grid', gap: '12px', maxHeight: '450px', overflowY: 'auto' }}>
                {tasks.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No hay tareas creadas.</p>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} style={{ padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ fontSize: '9px', fontWeight: '800', padding: '2px 6px', borderRadius: 'var(--radius-full)', backgroundColor: task.status === 'completada' ? 'var(--success-light)' : 'var(--bg-primary)', color: task.status === 'completada' ? 'var(--success)' : 'var(--text-secondary)' }}>{task.status}</span>
                          <h4 style={{ fontSize: '13.5px', fontWeight: '800' }}>{task.title}</h4>
                        </div>
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
                  <div key={al.id} style={{ padding: '16px', borderRadius: 'var(--radius-sm)', borderLeft: `4px solid ${al.priority === 'Alta' ? 'var(--danger)' : 'var(--warning)'}`, backgroundColor: 'var(--bg-secondary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: '800' }}>{al.user_name}</span>
                      <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: 'var(--radius-full)', backgroundColor: al.priority === 'Alta' ? 'var(--danger-light)' : 'var(--warning-light)', color: al.priority === 'Alta' ? 'var(--danger)' : 'var(--warning)' }}>Riesgo {al.priority}</span>
                    </div>
                    <p style={{ fontSize: '12.5px', fontStyle: 'italic', marginBottom: '12px' }}>"{al.reflection_text}"</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input type="text" placeholder="Ingresar notas de atención..." value={resolutionNotes[al.id] || ''} onChange={(e) => setResolutionNotes(prev => ({ ...prev, [al.id]: e.target.value }))} style={{ flex: 1, padding: '8px 12px', fontSize: '12px' }} />
                      <button onClick={() => handleAttendAlert(al.id)} className="btn btn-primary" disabled={resolvingId === al.id} style={{ padding: '8px 14px', fontSize: '12px' }}>Atender Alerta</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: MÓDULO DE TESTS, VISOR DE RESPUESTAS Y MÉTODOS DE SEGMENTACIÓN (Módulo 4) */}
        {activeTab === 'evaluations' && (
          <div className="animate-fade" style={{ display: 'grid', gap: '20px' }}>
            
            {/* Cabecera del Creador de Cuestionarios */}
            <div className="glass-card" style={{ paddingBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={18} style={{ color: 'var(--primary)' }} />
                    Módulo de Creación y Programación de Tests
                  </h2>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Diseña cuestionarios a medida o activa plantillas preestablecidas. Define la segmentación por colaborador o departamento.
                  </p>
                </div>
              </div>

              {/* Sub-Navegación de Tests en el Admin */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                <button 
                  onClick={() => setEvalSubTab('active_tests')}
                  className={`tab-btn ${evalSubTab === 'active_tests' ? 'active' : ''}`}
                  style={{ flex: 'none', padding: '6px 16px', fontSize: '12px' }}
                >
                  <Eye size={13} />
                  <span>Tests Activos y Reportes</span>
                </button>
                <button 
                  onClick={() => setEvalSubTab('templates')}
                  className={`tab-btn ${evalSubTab === 'templates' ? 'active' : ''}`}
                  style={{ flex: 'none', padding: '6px 16px', fontSize: '12px' }}
                >
                  <Zap size={13} />
                  <span>Banco de Tests Precargados</span>
                </button>
                <button 
                  onClick={() => setEvalSubTab('create_custom')}
                  className={`tab-btn ${evalSubTab === 'create_custom' ? 'active' : ''}`}
                  style={{ flex: 'none', padding: '6px 16px', fontSize: '12px' }}
                >
                  <PlusCircle size={13} />
                  <span>Crear Test Personalizado</span>
                </button>
              </div>
            </div>

            {evalError && <div style={{ backgroundColor: 'var(--danger-light)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '10px', borderRadius: 'var(--radius-sm)', fontSize: '12.5px' }}>{evalError}</div>}
            {evalSuccess && <div style={{ backgroundColor: 'var(--success-light)', border: '1px solid var(--success)', color: 'var(--success)', padding: '10px', borderRadius: 'var(--radius-sm)', fontSize: '12.5px' }}>{evalSuccess}</div>}

            {/* SUB-TAB A: LISTA DE TESTS ACTIVOS E INFORMES DE RESPUESTAS */}
            {evalSubTab === 'active_tests' && (
              <div className="grid grid-2 animate-fade" style={{ alignItems: 'start' }}>
                
                {/* Listado de Tests */}
                <div className="glass-card">
                  <h3 style={{ fontSize: '15px', fontWeight: '900', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ClipboardList size={16} />
                    Lista de Cuestionarios en Curso
                  </h3>
                  <div style={{ display: 'grid', gap: '12px', maxHeight: '480px', overflowY: 'auto' }}>
                    {evaluations.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '12.5px' }}>
                        No hay cuestionarios activos. Ve a la pestaña "Tests Precargados" para activar uno al instante.
                      </div>
                    ) : (
                      evaluations.map((ev) => (
                        <div 
                          key={ev.id} 
                          style={{ 
                            padding: '14px', 
                            borderRadius: 'var(--radius-sm)', 
                            border: selectedTestAnalytics?.test_id === ev.id ? '2px solid var(--primary)' : '1px solid var(--border)', 
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
                              className="btn btn-secondary"
                              style={{ flex: 1, padding: '6px 10px', fontSize: '11.5px', borderRadius: 'var(--radius-sm)' }}
                            >
                              <Eye size={13} />
                              <span>Ver Respuestas e IA</span>
                            </button>
                            <button 
                              onClick={() => { setPreviewTest(ev); setPreviewAnswers({}); setPreviewSuccess(''); }}
                              className="btn btn-primary"
                              style={{ flex: 1, padding: '6px 10px', fontSize: '11.5px', borderRadius: 'var(--radius-sm)' }}
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

                {/* Visor de Respuestas y Métricas */}
                <div className="glass-card">
                  <h3 style={{ fontSize: '15px', fontWeight: '900', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BarChart3 size={16} style={{ color: 'var(--accent)' }} />
                    Métricas de Respuestas Consolidadas
                  </h3>

                  {analyticsLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}><Loader className="animate-spin" size={20} /></div>
                  ) : !selectedTestAnalytics ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '12.5px', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)' }}>
                      Haz clic en "Ver Respuestas e IA" en cualquiera de los cuestionarios para consultar el análisis de respuestas agregado.
                    </div>
                  ) : (
                    <div className="animate-fade">
                      <div style={{ marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase' }}>Analíticas del Cuestionario</span>
                        <h4 style={{ fontSize: '15px', fontWeight: '800', marginTop: '2px' }}>{selectedTestAnalytics.title}</h4>
                        <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>Respuestas procesadas por IA: <strong>{selectedTestAnalytics.total_responses}</strong></span>
                      </div>

                      {/* KPI cards */}
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

                      {/* Lista de Respuestas */}
                      <h5 style={{ fontSize: '12px', fontWeight: '800', marginBottom: '8px' }}>Respuestas del Cuestionario:</h5>
                      <div style={{ display: 'grid', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                        {selectedTestAnalytics.responses.length === 0 ? (
                          <p style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center' }}>No hay respuestas registradas aún para este test.</p>
                        ) : (
                          selectedTestAnalytics.responses.map((r) => (
                            <div key={r.id} style={{ padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', fontSize: '12px' }}>
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
            )}

            {/* SUB-TAB B: BANCO DE TESTS PRECARGADOS (ACTIVACIÓN CON SEGMENTACIÓN) */}
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
                      <div key={tpl.id} style={{ padding: '20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{ fontSize: '9px', fontWeight: '800', padding: '3px 8px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>{tpl.category}</span>
                            <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{tpl.questions.length} preguntas</span>
                          </div>
                          <h4 style={{ fontSize: '14.5px', fontWeight: '800', marginBottom: '6px' }}>{tpl.title.replace('[Plantilla] ', '')}</h4>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{tpl.description}</p>
                        </div>

                        {/* Segmentación antes de activar */}
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                          <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>SEGMENTAR PÚBLICO:</label>
                          <select 
                            value={config.type} 
                            onChange={(e) => handleTemplateTargetChange(tpl.id, 'type', e.target.value)}
                            style={{ padding: '6px', fontSize: '12px', marginBottom: '8px' }}
                          >
                            <option value="all">Toda la Institución</option>
                            <option value="department">Un Departamento</option>
                            <option value="individual">Colaborador Individual</option>
                          </select>
                          
                          {config.type !== 'all' && (
                            <input 
                              type="text" 
                              placeholder={config.type === 'department' ? "Ej. Tecnología" : "Ej. colaborador@correo.com"} 
                              value={config.target}
                              onChange={(e) => handleTemplateTargetChange(tpl.id, 'target', e.target.value)}
                              style={{ padding: '6px 10px', fontSize: '12px', width: '100%' }}
                            />
                          )}
                        </div>

                        <button 
                          onClick={() => handleActivateTemplate(tpl.id)}
                          className="btn btn-primary"
                          disabled={evalLoading}
                          style={{ width: '100%', padding: '8px', fontSize: '12.5px' }}
                        >
                          <Zap size={13} />
                          <span>Habilitar Test en la Institución</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SUB-TAB C: CREAR TEST PERSONALIZADO A MEDIDA */}
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
                      <select value={evalCategory} onChange={(e) => setEvalCategory(e.target.value)}>
                        <option value="Clima Laboral">Clima Laboral / Entorno</option>
                        <option value="Ánimo Personal">Ánimo Personal / Estrés</option>
                        <option value="Bienestar Integral">Bienestar Integral Multimodal</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label>Descripción</label>
                    <textarea rows="2" placeholder="Propósito de la evaluación..." value={evalDesc} onChange={(e) => setEvalDesc(e.target.value)} style={{ resize: 'vertical' }} />
                  </div>

                  {/* Asignación y Segmentación del Test */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px', backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <div className="form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Target size={12} style={{ color: 'var(--primary)' }} /> Destinatarios del Test
                      </label>
                      <select value={evalAssignedType} onChange={(e) => { setEvalAssignedType(e.target.value); setEvalAssignedTarget(''); }}>
                        <option value="all">Todo el Personal (Todos)</option>
                        <option value="department">Por Departamento Específico</option>
                        <option value="individual">Colaborador Individual (Correo)</option>
                      </select>
                    </div>

                    {evalAssignedType !== 'all' && (
                      <div className="form-group">
                        <label>{evalAssignedType === 'department' ? 'Escribe el Departamento:' : 'Escribe el Correo Electrónico:'}</label>
                        <input 
                          type={evalAssignedType === 'individual' ? 'email' : 'text'} 
                          placeholder={evalAssignedType === 'department' ? "Ej. Tecnología" : "Ej. miembro@bienestar.com"}
                          value={evalAssignedTarget} 
                          onChange={(e) => setEvalAssignedTarget(e.target.value)} 
                          required 
                        />
                      </div>
                    )}
                  </div>

                  {/* Constructor de Preguntas */}
                  <div style={{ marginBottom: '16px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Preguntas del Test ({customQuestions.length})</label>
                    <div style={{ display: 'grid', gap: '8px', marginBottom: '12px' }}>
                      {customQuestions.map((q, idx) => (
                        <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '12px' }}>
                          <span><strong>P{idx+1}:</strong> {q.question}</span>
                          <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: '700' }}>
                            [{q.type === 'scale_1_5' ? 'Escala 1-5' : 
                              q.type === 'scale_1_10' ? 'Escala 1-10' : 
                              q.type === 'boolean' ? 'Sí / No' : 'Texto + Grabación Voz'}]
                          </span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <input 
                        type="text" 
                        placeholder="Escribe el enunciado de la pregunta..." 
                        value={newQuestionText} 
                        onChange={(e) => setNewQuestionText(e.target.value)} 
                        style={{ flex: 2, minWidth: '200px', padding: '8px 12px', fontSize: '12px' }} 
                      />
                      <select 
                        value={newQuestionType} 
                        onChange={(e) => setNewQuestionType(e.target.value)}
                        style={{ flex: 1, minWidth: '150px', padding: '8px 12px', fontSize: '12px' }}
                      >
                        <option value="scale_1_5">Escala del 1 al 5</option>
                        <option value="scale_1_10">Escala del 1 al 10</option>
                        <option value="text">Texto Libre / Grabación de Voz</option>
                        <option value="boolean">Pregunta de Sí o No</option>
                      </select>
                      <button 
                        type="button" 
                        onClick={handleAddQuestion} 
                        className="btn btn-secondary" 
                        style={{ padding: '8px 16px', fontSize: '12px' }}
                      >
                        + Agregar
                      </button>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label>Fecha Límite</label>
                    <input type="date" value={evalDate} onChange={(e) => setEvalDate(e.target.value)} required />
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={evalLoading} style={{ width: '100%', padding: '12px' }}>
                    {evalLoading ? <Loader className="animate-spin" size={16} /> : 'Programar Test Personalizado'}
                  </button>
                </form>
              </div>
            )}

          </div>
        )}

        {/* TAB 5: DIRECTORIO DE MIEMBROS (Módulo 3) */}
        {activeTab === 'members' && (
          <div className="glass-card animate-fade">
            <h3 style={{ fontSize: '17px', fontWeight: '900', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} style={{ color: 'var(--primary)' }} /> Directorio de Integrantes de la Institución
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '10px' }}>Nombre</th>
                    <th style={{ padding: '10px' }}>Correo</th>
                    <th style={{ padding: '10px' }}>Departamento</th>
                    <th style={{ padding: '10px' }}>Rol</th>
                    <th style={{ padding: '10px' }}>Fecha Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {members.length === 0 ? (
                    <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No hay miembros registrados.</td></tr>
                  ) : (
                    members.map((m) => (
                      <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px', fontWeight: '700' }}>{m.first_name} {m.last_name}</td>
                        <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>{m.email}</td>
                        <td style={{ padding: '10px', fontWeight: '600' }}>{m.department || 'General'}</td>
                        <td style={{ padding: '10px' }}><span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: '800' }}>{m.role}</span></td>
                        <td style={{ padding: '10px', color: 'var(--text-muted)', fontSize: '11.5px' }}>{new Date(m.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: BITÁCORA DE AUDITORÍA (Módulo 9) */}
        {activeTab === 'audit' && (
          <div className="glass-card animate-fade">
            <h3 style={{ fontSize: '17px', fontWeight: '900', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} style={{ color: 'var(--success)' }} /> Bitácora Inmutable de Auditoría del Sistema
            </h3>
            <div style={{ overflowX: 'auto', maxHeight: '450px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '8px' }}>Acción</th>
                    <th style={{ padding: '8px' }}>Usuario</th>
                    <th style={{ padding: '8px' }}>Detalles</th>
                    <th style={{ padding: '8px' }}>IP</th>
                    <th style={{ padding: '8px' }}>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length === 0 ? (
                    <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No hay eventos de auditoría registrados.</td></tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '8px', fontWeight: '800', color: 'var(--primary)' }}>{log.action}</td>
                        <td style={{ padding: '8px' }}>{log.user_name}</td>
                        <td style={{ padding: '8px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>{log.details || 'N/A'}</td>
                        <td style={{ padding: '8px', color: 'var(--text-muted)' }}>{log.ip_address || '127.0.0.1'}</td>
                        <td style={{ padding: '8px', color: 'var(--text-muted)' }}>{new Date(log.created_at).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: REPORTES INSTITUCIONALES (Módulo 8) */}
        {activeTab === 'reports' && (
          <div className="glass-card animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileSpreadsheet size={18} style={{ color: 'var(--accent)' }} /> Centro de Reportes Consolidados
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>Resumen descargable en formato oficial para toma de decisiones.</p>
              </div>
              <button onClick={handleExportCSV} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                <Download size={15} /><span>Exportar Reporte (JSON/CSV)</span>
              </button>
            </div>

            {reportData && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700' }}>INSTITUCIÓN</span>
                  <h4 style={{ fontSize: '16px', fontWeight: '900', marginTop: '4px' }}>{reportData.institucion}</h4>
                </div>
                <div style={{ padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700' }}>REFLEXIONES Y TESTS ANALIZADOS</span>
                  <h4 style={{ fontSize: '16px', fontWeight: '900', marginTop: '4px', color: 'var(--primary)' }}>{reportData.metricas_clave?.total_reflexiones_registradas || 0}</h4>
                </div>
                <div style={{ padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
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
                  <div key={sug.id} style={{ padding: '16px', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--accent)', backgroundColor: 'var(--bg-secondary)' }}>
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
