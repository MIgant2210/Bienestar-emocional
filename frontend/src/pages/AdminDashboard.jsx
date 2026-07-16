import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { 
  Sun, Moon, LogOut, ShieldAlert, Award, FileText, Users, BarChart3, 
  PlusCircle, Trash2, Calendar, ClipboardList, Sparkles, Loader, CheckCircle2 
} from 'lucide-react';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  // Tab State: 'analytics', 'tasks', 'ai_plans'
  const [activeTab, setActiveTab] = useState('analytics');

  // General States
  const [stats, setStats] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(true);

  // Create Task Form States
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskCategory, setTaskCategory] = useState('Bienestar');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskAssignedEmail, setTaskAssignedEmail] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  const fetchDashboardData = async () => {
    try {
      const [statsRes, sugRes, tasksRes] = await Promise.allSettled([
        api.get('/institutions/dashboard'),
        api.get('/institutions/suggestions'),
        api.get('/tasks')
      ]);

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data);
      }

      if (sugRes.status === 'fulfilled') {
        setSuggestions(sugRes.value.data);
      }

      if (tasksRes.status === 'fulfilled') {
        setTasks(tasksRes.value.data);
      }
    } catch (err) {
      console.error('Error al cargar datos del administrador:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
      const response = await api.post('/tasks', payload);
      setCreateSuccess('Tarea creada y asignada exitosamente.');
      setTaskTitle('');
      setTaskDesc('');
      setTaskDueDate('');
      setTaskAssignedEmail('');
      
      // Recargar lista de tareas
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

  if (loading || !stats) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <span style={{ color: 'var(--text-secondary)' }}>Cargando datos agregados...</span>
      </div>
    );
  }

  // Gráfica de pastel de sentimientos
  const pieData = Object.keys(stats.sentiment_distribution).map(key => ({
    name: key,
    value: stats.sentiment_distribution[key]
  }));

  const COLORS = {
    Positivo: 'var(--success)',
    Neutro: 'var(--text-muted)',
    Negativo: 'var(--danger)'
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navbar Superior */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 40px',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%)',
            color: '#ffffff',
            padding: '10px',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--accent-tech-glow)'
          }}>
            <BarChart3 size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '-0.5px' }}>EquilibrIA</h1>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '500' }}>Sistema inteligente de análisis del bienestar emocional</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={toggleTheme} className="theme-toggle" style={{ border: '1px solid var(--border)', width: '38px', height: '38px', borderRadius: '50%' }}>
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          
          <div style={{ textAlign: 'right', fontSize: '13px' }}>
            <span style={{ fontWeight: '800', display: 'block' }}>Panel Administrativo</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '500' }}>Gestor de Bienestar</span>
          </div>

          <button onClick={logout} className="theme-toggle" style={{ color: 'var(--danger)', border: '1px solid var(--border)', width: '38px', height: '38px', borderRadius: '50%' }} title="Cerrar Sesión">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Contenido Principal */}
      <main style={{ flex: 1, padding: '36px 40px', maxWidth: '1300px', width: '100%', margin: '0 auto' }}>
        
        {/* Banner de Confidencialidad */}
        {showPrivacyNotice && (
          <div style={{
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            padding: '14px 20px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '28px',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <ShieldAlert size={18} style={{ marginTop: '2px' }} />
              <span>
                <strong>Políticas de privacidad</strong>: los contenidos personales de los miembros no se exponen en este panel. La información que se visualiza se presenta de forma agregada y anónima.
              </span>
            </div>
            <button
              onClick={() => setShowPrivacyNotice(false)}
              aria-label="Cerrar aviso"
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--primary)',
                cursor: 'pointer',
                fontSize: '16px',
                lineHeight: 1
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Pestañas de Navegación del Administrador */}
        <div className="tab-container" style={{ maxWidth: '600px', margin: '0 auto 36px auto' }}>
          <button 
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={16} />
            <span>Analíticas</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            <ClipboardList size={16} />
            <span>Asignar Tareas</span>
            {tasks.length > 0 && (
              <span style={{
                backgroundColor: 'var(--primary)',
                color: '#fff',
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 'bold'
              }}>
                {tasks.length}
              </span>
            )}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'ai_plans' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai_plans')}
          >
            <Sparkles size={16} />
            <span>Sugerencias</span>
          </button>
        </div>

        {/* TAB 1: ANALÍTICAS */}
        {activeTab === 'analytics' && (
          <div className="animate-fade">
            {/* KPI Cards */}
            <div className="grid grid-3" style={{ marginBottom: '32px' }}>
              <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', letterSpacing: '0.5px' }}>ESTRÉS DE LA COMUNIDAD</span>
                  <h2 style={{ fontSize: '28px', fontWeight: '900', marginTop: '6px', color: 'var(--danger)' }}>{stats.averages.stress}%</h2>
                </div>
                <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--danger-light)', color: 'var(--danger)' }}>
                  <ShieldAlert size={22} />
                </div>
              </div>

              <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', letterSpacing: '0.5px' }}>MOTIVACIÓN PROMEDIO</span>
                  <h2 style={{ fontSize: '28px', fontWeight: '900', marginTop: '6px', color: 'var(--success)' }}>{stats.averages.motivation}%</h2>
                </div>
                <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>
                  <Award size={22} />
                </div>
              </div>

              <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '800', letterSpacing: '0.5px' }}>MIEMBROS ACTIVOS</span>
                  <h2 style={{ fontSize: '28px', fontWeight: '900', marginTop: '6px', color: 'var(--primary)' }}>{stats.total_members}</h2>
                </div>
                <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                  <Users size={22} />
                </div>
              </div>
            </div>

            {/* Gráficos de tendencias e histogramas */}
            <div className="grid grid-2">
              <div className="glass-card">
                <h3 style={{ fontSize: '16px', fontWeight: '900', marginBottom: '20px' }}>Evolución del Clima Emocional</h3>
                {stats.historical_trends.length === 0 ? (
                  <div style={{ height: '260px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
                    No hay suficientes datos históricos registrados.
                  </div>
                ) : (
                  <div style={{ width: '100%', height: '260px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats.historical_trends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
                        <YAxis stroke="var(--text-muted)" fontSize={11} domain={[0, 100]} />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                        <Legend verticalAlign="top" height={36} iconType="circle" />
                        <Line type="monotone" dataKey="stress" name="Estrés" stroke="var(--danger)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="motivation" name="Motivación" stroke="var(--success)" strokeWidth={3} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="burnout" name="Agotamiento" stroke="var(--warning)" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="glass-card">
                <h3 style={{ fontSize: '16px', fontWeight: '900', marginBottom: '20px' }}>Distribución del Sentimiento Dominante</h3>
                {pieData.every(d => d.value === 0) ? (
                  <div style={{ height: '260px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
                    Sin datos de sentimientos registrados en la comunidad.
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '260px', gap: '24px', flexWrap: 'wrap' }}>
                    <div style={{ width: '200px', height: '200px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={6}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[entry.name] || 'var(--text-muted)'} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {pieData.map((entry, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: COLORS[entry.name] }} />
                          <span style={{ textTransform: 'capitalize', fontWeight: '700', color: 'var(--text-primary)' }}>{entry.name}: {entry.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ASIGNACIÓN Y GESTIÓN DE TAREAS */}
        {activeTab === 'tasks' && (
          <div className="grid grid-2 animate-fade" style={{ alignItems: 'start' }}>
            
            {/* Formulario de Creación */}
            <div className="glass-card">
              <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlusCircle size={20} style={{ color: 'var(--primary)' }} />
                Crear Tarea Institucional
              </h3>

              {createError && (
                <div style={{
                  backgroundColor: 'var(--danger-light)',
                  border: '1px solid var(--danger)',
                  color: 'var(--danger)',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  marginBottom: '16px',
                  fontWeight: '600'
                }}>{createError}</div>
              )}

              {createSuccess && (
                <div style={{
                  backgroundColor: 'var(--success-light)',
                  border: '1px solid var(--success)',
                  color: 'var(--success)',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  marginBottom: '16px',
                  fontWeight: '600'
                }}>{createSuccess}</div>
              )}

              <form onSubmit={handleCreateTask}>
                <div className="form-group">
                  <label>Título de la Tarea</label>
                  <input
                    type="text"
                    placeholder="Ej. Pausa activa: Respiración 5 min"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Descripción / Instrucciones</label>
                  <textarea
                    rows="3"
                    placeholder="Describe los pasos o el propósito de la tarea..."
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Categoría</label>
                    <select
                      value={taskCategory}
                      onChange={(e) => setTaskCategory(e.target.value)}
                    >
                      <option value="Bienestar">Bienestar</option>
                      <option value="Académica">Académica</option>
                      <option value="Laboral">Laboral</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Fecha de Vencimiento</label>
                    <input
                      type="date"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Asignación Individual (Opcional)</label>
                  <input
                    type="email"
                    placeholder="Correo de miembro específico (dejar vacío para Todos)"
                    value={taskAssignedEmail}
                    onChange={(e) => setTaskAssignedEmail(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createLoading}
                  style={{ width: '100%', marginTop: '8px' }}
                >
                  {createLoading ? <Loader className="animate-spin" size={18} /> : 'Publicar Tarea'}
                </button>
              </form>
            </div>

            {/* Listado de Tareas Publicadas */}
            <div className="glass-card">
              <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ClipboardList size={20} />
                Tareas Publicadas
              </h3>
              
              <div style={{ display: 'grid', gap: '14px', maxHeight: '480px', overflowY: 'auto', paddingRight: '4px' }}>
                {tasks.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '24px' }}>
                    No hay tareas creadas para esta institución.
                  </p>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} style={{
                      padding: '16px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg-secondary)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      gap: '12px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{
                            fontSize: '9px',
                            fontWeight: '800',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: task.status === 'completada' ? 'var(--success-light)' : 'var(--bg-primary)',
                            color: task.status === 'completada' ? 'var(--success)' : 'var(--text-secondary)',
                            textTransform: 'uppercase'
                          }}>
                            {task.status}
                          </span>
                          <h4 style={{ fontSize: '14px', fontWeight: '800' }}>{task.title}</h4>
                        </div>
                        {task.description && (
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.4' }}>
                            {task.description}
                          </p>
                        )}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '10px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>
                          <span>Categoría: {task.category}</span>
                          <span>Asignado: {task.assigned_user_name}</span>
                          {task.due_date && <span>Vence: {new Date(task.due_date).toLocaleDateString()}</span>}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="theme-toggle"
                        style={{ color: 'var(--danger)', border: '1px solid var(--border)', width: '32px', height: '32px', borderRadius: '50%' }}
                        title="Eliminar Tarea"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: RECOMENDACIONES IA */}
        {activeTab === 'ai_plans' && (
          <div className="glass-card animate-fade" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Sparkles size={22} style={{ color: 'var(--accent)' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '900' }}>Plan de Acción Recomendado por Gemini</h3>
            </div>
            
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '28px', lineHeight: '1.5' }}>
              Gemini genera sugerencias basadas en el análisis automatizado y confidencial de las reflexiones diarias de los miembros.
              Úsalas para planificar actividades presenciales, talleres o implementar pausas en el calendario escolar/laboral.
            </p>

            <div style={{ display: 'grid', gap: '16px' }}>
              {suggestions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)' }}>
                  Aún no hay recomendaciones acumuladas de IA. Invita a los miembros a registrar sus reflexiones de bienestar.
                </div>
              ) : (
                suggestions.map((sug) => (
                  <div key={sug.id} style={{
                    padding: '20px',
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: '4px solid var(--accent)',
                    backgroundColor: 'var(--bg-secondary)',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <p style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '600', marginBottom: '10px', lineHeight: '1.5' }}>
                      "{sug.suggestion}"
                    </p>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Generada el {new Date(sug.created_at).toLocaleString('es-ES')}
                    </span>
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
