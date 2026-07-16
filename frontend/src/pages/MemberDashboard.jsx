import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { 
  Sun, Moon, LogOut, Send, History, Heart, Brain, Smile, Activity, 
  AlertCircle, CheckCircle2, ClipboardList, Sparkles, MessageSquare, SendHorizontal, Bot, User 
} from 'lucide-react';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MemberDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  // Tab State: 'bienestar', 'tareas', 'chat_ia'
  const [activeTab, setActiveTab] = useState('bienestar');
  
  // Bienestar States
  const [reflectionText, setReflectionText] = useState('');
  const [history, setHistory] = useState([]);
  const [reflectionLoading, setReflectionLoading] = useState(false);
  const [reflectionError, setReflectionError] = useState('');
  const [latestAnalysis, setLatestAnalysis] = useState(null);

  // Tareas States
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  // Chat IA States
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Hola, soy tu asistente de apoyo en Equilibria. Puedo ayudarte a organizar tus ideas, tus prioridades y a encontrar un ritmo más estable para tu bienestar.' }
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

  useEffect(() => {
    Promise.all([fetchHistory(), fetchTasks()]);
  }, []);

  useEffect(() => {
    // Desplazar el chat hacia abajo cuando cambian los mensajes
    if (activeTab === 'chat_ia') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  // Enviar Reflexión Diaria
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
      fetchHistory(); // Recargar historial
      fetchTasks();   // Recargar tareas por si se sugirió alguna nueva
    } catch (err) {
      setReflectionError(err.response?.data?.message || 'Error al analizar la reflexión.');
    } finally {
      setReflectionLoading(false);
    }
  };

  // Completar o Desmarcar Tarea
  const handleToggleTaskStatus = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'pendiente' ? 'completada' : 'pendiente';
    try {
      const response = await api.put(`/tasks/${taskId}/status`, { status: newStatus });
      // Actualizar estado local
      setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? response.data.task : t));
    } catch (err) {
      console.error('Error al cambiar estado de la tarea:', err);
    }
  };

  // Enviar Mensaje al Chat de IA
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

  // Preparar datos para el gráfico
  const chartData = [...history]
    .reverse()
    .map(ref => ({
      fecha: new Date(ref.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      Estrés: ref.stress_score,
      Motivación: ref.motivation_score,
      Agotamiento: ref.burnout_score
    }));

  // Calcular porcentaje de tareas completadas
  const completedTasksCount = tasks.filter(t => t.status === 'completada').length;
  const taskProgressPercent = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

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
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
            color: '#ffffff',
            padding: '10px',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--tech-glow)'
          }}>
            <Heart size={20} />
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
            <span style={{ fontWeight: '800', display: 'block' }}>{user?.first_name} {user?.last_name}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '500' }}>Miembro</span>
          </div>

          <button onClick={logout} className="theme-toggle" style={{ color: 'var(--danger)', border: '1px solid var(--border)', width: '38px', height: '38px', borderRadius: '50%' }} title="Cerrar Sesión">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Contenedor del Tablero */}
      <main style={{ flex: 1, padding: '36px 40px', maxWidth: '1300px', width: '100%', margin: '0 auto' }}>
        
        {/* Sistema de Pestañas (Tabs) */}
        <div className="tab-container" style={{ maxWidth: '600px', margin: '0 auto 36px auto' }}>
          <button 
            className={`tab-btn ${activeTab === 'bienestar' ? 'active' : ''}`}
            onClick={() => setActiveTab('bienestar')}
          >
            <Brain size={16} />
            <span>Mi Bienestar</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'tareas' ? 'active' : ''}`}
            onClick={() => setActiveTab('tareas')}
          >
            <ClipboardList size={16} />
            <span>Mis Tareas</span>
            {tasks.filter(t => t.status === 'pendiente').length > 0 && (
              <span style={{
                backgroundColor: 'var(--danger)',
                color: '#fff',
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 'bold'
              }}>
                {tasks.filter(t => t.status === 'pendiente').length}
              </span>
            )}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'chat_ia' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat_ia')}
          >
            <Sparkles size={16} />
            <span>Asistente</span>
          </button>
        </div>

        {/* CONTENIDO TAB 1: MI BIENESTAR */}
        {activeTab === 'bienestar' && (
          <div className="grid grid-2 animate-fade">
            
            {/* Columna Izquierda: Ingresar Reflexión */}
            <div className="glass-card">
              <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Brain size={20} style={{ color: 'var(--primary)' }} />
                Reflexión Diaria
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5' }}>
                Describe cómo te encuentras hoy, qué te ha pesado más o qué te ha resultado complejo. El sistema analizará tu texto para ofrecerte una vista clara y confidencial de tu estado emocional.
              </p>

              {reflectionError && (
                <div style={{
                  backgroundColor: 'var(--danger-light)',
                  border: '1px solid var(--danger)',
                  color: 'var(--danger)',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '600'
                }}>
                  <AlertCircle size={16} />
                  <span>{reflectionError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitReflection}>
                <div className="form-group">
                  <textarea
                    rows="6"
                    placeholder="Escribe de manera abierta sobre tu estado mental o académico hoy... Ej. Me he sentido abrumado por los proyectos de la universidad y no he podido descansar, pero sigo motivado por los resultados."
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
                    required
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={reflectionLoading}
                  style={{ width: '100%' }}
                >
                  {reflectionLoading ? <Loader className="animate-spin" size={18} /> : (
                    <>
                      <Send size={16} />
                      <span>Analizar Bienestar</span>
                    </>
                  )}
                </button>
              </form>

              {/* Indicadores en tiempo real (Último análisis) */}
              {latestAnalysis && (
                <div style={{
                  marginTop: '28px',
                  padding: '24px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)'
                }} className="animate-fade">
                  <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <Smile size={18} style={{ color: 'var(--accent)' }} />
                    Métricas de Análisis Reciente
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ padding: '14px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', fontWeight: '700' }}>ESTRÉS</span>
                      <span style={{ fontSize: '20px', fontWeight: '900', display: 'block', marginTop: '6px', color: latestAnalysis.stress_score > 60 ? 'var(--danger)' : 'var(--success)' }}>
                        {latestAnalysis.stress_score}%
                      </span>
                    </div>
                    <div style={{ padding: '14px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', fontWeight: '700' }}>MOTIVACIÓN</span>
                      <span style={{ fontSize: '20px', fontWeight: '900', display: 'block', marginTop: '6px', color: latestAnalysis.motivation_score > 55 ? 'var(--success)' : 'var(--warning)' }}>
                        {latestAnalysis.motivation_score}%
                      </span>
                    </div>
                    <div style={{ padding: '14px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', fontWeight: '700' }}>AGOTAMIENTO</span>
                      <span style={{ fontSize: '20px', fontWeight: '900', display: 'block', marginTop: '6px', color: latestAnalysis.burnout_score > 60 ? 'var(--warning)' : 'var(--success)' }}>
                        {latestAnalysis.burnout_score}%
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>Sentimiento Predominante: </span>
                    <span style={{ fontWeight: '800', color: latestAnalysis.dominant_sentiment === 'Positivo' ? 'var(--success)' : latestAnalysis.dominant_sentiment === 'Negativo' ? 'var(--danger)' : 'var(--text-primary)' }}>
                      {latestAnalysis.dominant_sentiment}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Columna Derecha: Gráfico Histórico */}
            <div style={{ display: 'grid', gap: '28px' }}>
              <div className="glass-card">
                <h3 style={{ fontSize: '16px', fontWeight: '900', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={18} style={{ color: 'var(--accent)' }} />
                  Curva de Tendencias de Ánimo
                </h3>
                
                {chartData.length === 0 ? (
                  <div style={{ height: '240px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    Registra tu primera reflexión para generar el gráfico histórico.
                  </div>
                ) : (
                  <div style={{ width: '100%', height: '240px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="fecha" stroke="var(--text-muted)" fontSize={11} fontWeight={600} />
                        <YAxis stroke="var(--text-muted)" fontSize={11} domain={[0, 100]} />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                        <Legend verticalAlign="top" height={36} iconType="circle" />
                        <Line type="monotone" dataKey="Estrés" stroke="var(--danger)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="Motivación" stroke="var(--success)" strokeWidth={3} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="Agotamiento" stroke="var(--warning)" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Historial de reflexiones */}
              <div className="glass-card">
                <h3 style={{ fontSize: '16px', fontWeight: '900', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <History size={18} />
                  Historial de Reflexiones
                </h3>
                <div style={{ display: 'grid', gap: '12px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                  {history.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '24px' }}>
                      No tienes reflexiones guardadas.
                    </p>
                  ) : (
                    history.map((ref) => (
                      <div key={ref.id} style={{
                        padding: '16px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--bg-secondary)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>
                            {new Date(ref.created_at).toLocaleString('es-ES')}
                          </span>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: '800',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: ref.dominant_sentiment === 'Positivo' ? 'var(--success-light)' : ref.dominant_sentiment === 'Negativo' ? 'var(--danger-light)' : 'var(--bg-primary)',
                            color: ref.dominant_sentiment === 'Positivo' ? 'var(--success)' : ref.dominant_sentiment === 'Negativo' ? 'var(--danger)' : 'var(--text-secondary)'
                          }}>
                            {ref.dominant_sentiment}
                          </span>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-primary)', fontStyle: 'italic', marginBottom: '10px', lineHeight: '1.4' }}>
                          "{ref.original_text}"
                        </p>
                        <div style={{ display: 'flex', gap: '20px', fontSize: '11px', fontWeight: '700' }}>
                          <span>Estrés: <strong style={{ color: 'var(--danger)' }}>{ref.stress_score}%</strong></span>
                          <span>Motivación: <strong style={{ color: 'var(--success)' }}>{ref.motivation_score}%</strong></span>
                          <span>Agotamiento: <strong style={{ color: 'var(--warning)' }}>{ref.burnout_score}%</strong></span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONTENIDO TAB 2: GESTIÓN DE TAREAS */}
        {activeTab === 'tareas' && (
          <div className="grid grid-2 animate-fade">
            
            {/* Panel de Tareas pendientes y completadas */}
            <div className="glass-card" style={{ gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ClipboardList size={20} style={{ color: 'var(--primary)' }} />
                    Tareas Asignadas
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Tareas creadas por los administradores de bienestar para apoyar tu rendimiento y balance.
                  </p>
                </div>
                
                {/* Indicador de Progreso en Tareas */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '220px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                      <span>Progreso Total</span>
                      <span>{taskProgressPercent}%</span>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${taskProgressPercent}%` }} />
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: 'var(--primary-light)',
                    color: 'var(--primary)',
                    fontWeight: '800',
                    fontSize: '14px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)'
                  }}>
                    {completedTasksCount}/{tasks.length}
                  </div>
                </div>
              </div>

              {tasksLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                  <Loader className="animate-spin" size={24} />
                </div>
              ) : tasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                  <CheckCircle2 size={40} style={{ color: 'var(--success)', marginBottom: '12px' }} />
                  <p style={{ fontSize: '14px', fontWeight: '600' }}>¡Excelente! No tienes ninguna tarea asignada en este momento.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {tasks.map((task) => (
                    <div 
                      key={task.id} 
                      style={{
                        padding: '20px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border)',
                        backgroundColor: task.status === 'completada' ? 'var(--primary-light)' : 'var(--bg-secondary)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '20px',
                        opacity: task.status === 'completada' ? 0.8 : 1,
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'start', gap: '16px', flex: 1 }}>
                        {/* Checkbox personalizado */}
                        <button
                          onClick={() => handleToggleTaskStatus(task.id, task.status)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: task.status === 'completada' ? 'var(--success)' : 'var(--text-muted)',
                            marginTop: '2px',
                            transition: 'color var(--transition-fast)'
                          }}
                        >
                          {task.status === 'completada' ? <CheckCircle2 size={24} /> : (
                            <div style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '6px',
                              border: '2px solid var(--border)',
                              backgroundColor: 'var(--bg-primary)'
                            }} />
                          )}
                        </button>

                        <div>
                          <h4 style={{
                            fontSize: '15px',
                            fontWeight: '800',
                            textDecoration: task.status === 'completada' ? 'line-through' : 'none',
                            color: task.status === 'completada' ? 'var(--text-muted)' : 'var(--text-primary)'
                          }}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.4' }}>
                              {task.description}
                            </p>
                          )}
                          
                          {/* Tags de Tarea */}
                          <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
                            <span style={{
                              fontSize: '10px',
                              fontWeight: '700',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: 'var(--bg-tertiary)',
                              color: 'var(--text-secondary)'
                            }}>
                              Categoría: {task.category}
                            </span>
                            
                            {task.due_date && (
                              <span style={{
                                fontSize: '10px',
                                fontWeight: '700',
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-full)',
                                backgroundColor: 'var(--warning-light)',
                                color: 'var(--warning)'
                              }}>
                                Vence: {new Date(task.due_date).toLocaleDateString()}
                              </span>
                            )}
                            
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              Asignado por: {task.creator_name}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CONTENIDO TAB 3: ASISTENTE EMOCIONAL IA */}
        {activeTab === 'chat_ia' && (
          <div className="animate-fade" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="glow-card" style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Bot size={28} style={{ color: 'var(--primary)' }} />
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '900' }}>Orientador de Bienestar IA</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                    Soporte conversacional continuo de Gemini basado en tu historial.
                  </p>
                </div>
              </div>
            </div>

            <div className="chat-container">
              {/* Mensajes del chat */}
              <div className="chat-messages">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`chat-bubble ${msg.sender}`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '11px', fontWeight: '700', opacity: 0.8 }}>
                      {msg.sender === 'ai' ? (
                        <>
                          <Bot size={12} />
                          <span>Asistente Mental</span>
                        </>
                      ) : (
                        <>
                          <User size={12} />
                          <span>Tú</span>
                        </>
                      )}
                    </div>
                    <p style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>
                  </div>
                ))}
                
                {chatLoading && (
                  <div className="chat-bubble ai" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Loader className="animate-spin" size={14} />
                    <span>Gemini está escribiendo...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input de Mensaje */}
              <form onSubmit={handleSendChatMessage} className="chat-input-area">
                <input
                  type="text"
                  placeholder="Platícale a la IA cómo manejar la carga de hoy..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  disabled={chatLoading}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={chatLoading || !userInput.trim()}
                  style={{ padding: '0 20px', borderRadius: 'var(--radius-sm)' }}
                >
                  <SendHorizontal size={18} />
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default MemberDashboard;
