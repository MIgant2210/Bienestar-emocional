import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { 
  Sun, Moon, LogOut, Send, History, Heart, Brain, Smile, Activity, 
  AlertCircle, CheckCircle2, ClipboardList, Sparkles, MessageSquare, 
  SendHorizontal, Bot, User, Loader, Calendar, ClipboardCheck, Sliders, Check, 
  HelpCircle, Mic, MicOff, ArrowLeft, FileAudio, Volume2, Play, Square, Camera, Image, CheckCircle
} from 'lucide-react';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MemberDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  
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

  // Tareas States
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  // Evaluaciones / Tests Guiados (Módulo 4 Multimodal)
  const [evaluations, setEvaluations] = useState([]);
  const [evaluationsLoading, setEvaluationsLoading] = useState(false);
  const [selectedEval, setSelectedEval] = useState(null);
  
  // Respuestas dinámicas por pregunta en el Test
  const [testAnswers, setTestAnswers] = useState({});
  const [evalSubmitLoading, setEvalSubmitLoading] = useState(false);
  const [evalSuccessMsg, setEvalSuccessMsg] = useState('');
  const [evalErrorMsg, setEvalErrorMsg] = useState('');

  // Audio / Multimodal Simulation States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [activeRecordingQId, setActiveRecordingQId] = useState(null);
  const [audioFileUploaded, setAudioFileUploaded] = useState(false);
  const [audioFileName, setAudioFileName] = useState('');
  const timerRef = useRef(null);

  // Camera / Facial Expression Simulation States
  const [activeCameraQId, setActiveCameraQId] = useState(null);
  const [isCapturingCamera, setIsCapturingCamera] = useState(false);
  const [facialMetrics, setFacialMetrics] = useState(null);

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

  useEffect(() => {
    Promise.allSettled([fetchHistory(), fetchTasks(), fetchEvaluations()]);
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

    // Formatear respuestas de todas las preguntas en una narrativa para Gemini
    const questions = selectedEval.questions || [];
    const formattedParts = questions.map((q, idx) => {
      const ans = testAnswers[q.id] || 'Sin respuesta';
      return `P${idx+1} [${q.question}]: ${ans}`;
    });

    // Agregar simulación de archivo cargado
    const multimodalContext = audioFileUploaded ? ' [Audio Multimodal Analizado]' : '';
    const fullPayloadText = `[TEST COMPLETADO: ${selectedEval.title} (${selectedEval.category})]${multimodalContext} ${formattedParts.join(' | ')}`;

    try {
      const response = await api.post('/analysis/submit', { 
        text: fullPayloadText,
        evaluation_id: selectedEval.id 
      });
      setEvalSuccessMsg('¡Test completado exitosamente! Los resultados fueron procesados por la IA.');
      setTestAnswers({});
      setAudioFileUploaded(false);
      setAudioFileName('');
      setLatestAnalysis(response.data.analysis);
      fetchHistory();
      fetchTasks();
      // Esperar 2 segundos para volver al dashboard tras éxito
      setTimeout(() => {
        setActiveView('dashboard');
        setSelectedEval(null);
      }, 2000);
    } catch (err) {
      setEvalErrorMsg(err.response?.data?.message || 'Error al enviar la evaluación.');
    } finally {
      setEvalSubmitLoading(false);
    }
  };

  // Simulación de Audio por Pregunta
  const startRecordingSim = (qId) => {
    setIsRecording(true);
    setActiveRecordingQId(qId);
    setRecordingSeconds(0);
    timerRef.current = setInterval(() => {
      setRecordingSeconds(prev => prev + 1);
    }, 1000);
  };

  const stopRecordingSim = () => {
    setIsRecording(false);
    clearInterval(timerRef.current);
    
    // Transcripción simulada inteligente según el test y la pregunta
    let transcriptText = "Siento que me he adaptado bien pero la carga mental ha sido intensa.";
    
    if (activeRecordingQId) {
      handleAnswerChange(activeRecordingQId, transcriptText);
    }
    setActiveRecordingQId(null);
  };

  // Simulación de Expresión Facial / Cámara
  const startCameraSim = (qId) => {
    setActiveCameraQId(qId);
    setIsCapturingCamera(true);
    setFacialMetrics(null);
    
    setTimeout(() => {
      // Simular reconocimiento emocional
      setFacialMetrics({
        calma: 82,
        tension: 12,
        atencion: 90
      });
      setIsCapturingCamera(false);
      
      // Auto-completar el texto de la pregunta con métricas faciales
      const autoText = `[Métricas de Gesto Facial: Calma ${82}%, Tensión ${12}%, Atención ${90}%] Siento que mantengo una actitud resolutiva ante las tareas.`;
      handleAnswerChange(qId, autoText);
    }, 2800);
  };

  // Subida de Audio
  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFileUploaded(true);
      setAudioFileName(file.name);
      
      // Auto rellenar el texto con una transcripción simulada de la carga del archivo
      const textQuestion = selectedEval?.questions?.find(q => q.type === 'text');
      if (textQuestion) {
        handleAnswerChange(textQuestion.id, `[Transcripción de audio cargado "${file.name}"]: He notado cierta tensión pero estoy motivado.`);
      }
    }
  };

  // Toggle Tarea
  const handleToggleTaskStatus = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'pendiente' ? 'completada' : 'pendiente';
    try {
      const response = await api.put(`/tasks/${taskId}/status`, { status: newStatus });
      setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? response.data.task : t));
    } catch (err) {
      console.error('Error al cambiar estado de la tarea:', err);
    }
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

  // RENDER PANTALLA EXCLUSIVA DE TEST (TIPO GOOGLE FORMS SUPER PREMIUM)
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
        
        {/* Cabecera / Barra Superior Fija */}
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
            onClick={() => { setActiveView('dashboard'); setSelectedEval(null); }}
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
            <span>Volver al Panel</span>
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>
              Progreso: {progressPercent}%
            </span>
            <div style={{ width: '120px', height: '6px', backgroundColor: 'var(--bg-primary)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: 'var(--primary)', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        </div>

        {/* Contenedor Principal (Layout de Google Forms) */}
        <div style={{ width: '100%', maxWidth: '780px', padding: '24px 16px', display: 'grid', gap: '20px' }}>
          
          {/* Tarjeta de Encabezado de Google Forms (Con borde superior coloreado premium) */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            borderTop: '8px solid var(--primary)',
            boxShadow: 'var(--shadow)',
            padding: '24px 28px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span style={{ fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', textTransform: 'uppercase' }}>
                {selectedEval.category}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cuestionario Multimodal</span>
            </div>
            
            <h1 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              {selectedEval.title}
            </h1>
            
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.5' }}>
              {selectedEval.description || 'Completa las preguntas de este test a continuación. Tu información es procesada de forma agregada para el bienestar general.'}
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmitTestForm} style={{ display: 'grid', gap: '16px' }}>
            
            {/* Renderizado de cada Pregunta como una Tarjeta Independiente estilo Google Forms */}
            {questions.map((q, idx) => {
              const isQRecording = isRecording && activeRecordingQId === q.id;
              const isQCamera = activeCameraQId === q.id;
              
              return (
                <div 
                  key={q.id || idx}
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    borderLeft: testAnswers[q.id] !== undefined ? '5px solid var(--success)' : '1px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)',
                    padding: '24px 28px',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  }}
                >
                  {/* Título de la Pregunta */}
                  <h3 style={{ fontSize: '14.5px', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', gap: '8px', marginBottom: '16px', lineHeight: '1.4' }}>
                    <span style={{ color: 'var(--primary)' }}>{idx + 1}.</span>
                    {q.question}
                  </h3>

                  {/* Opciones de la Pregunta */}
                  {q.type === 'text' && (
                    <div>
                      <textarea
                        rows="4"
                        placeholder="Escribe tu reflexión detallada o usa los botones de abajo para respuestas multimodales..."
                        value={testAnswers[q.id] || ''}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        required
                        style={{ resize: 'vertical', width: '100%', marginBottom: '12px' }}
                      />

                      {/* Botones de Captura Multimodal por Pregunta */}
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        
                        {/* Botón Grabadora de Voz */}
                        {isQRecording ? (
                          <button
                            type="button"
                            onClick={stopRecordingSim}
                            className="btn"
                            style={{ backgroundColor: 'var(--danger)', color: '#fff', fontSize: '12px', padding: '6px 12px' }}
                          >
                            <Square size={13} />
                            <span>Detener Grabación ({recordingSeconds}s)</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startRecordingSim(q.id)}
                            className="btn btn-secondary"
                            style={{ fontSize: '12px', padding: '6px 12px' }}
                          >
                            <Mic size={13} />
                            <span>Grabar por Voz</span>
                          </button>
                        )}

                        {/* Botón Cámara / Gesto Facial */}
                        <button
                          type="button"
                          onClick={() => startCameraSim(q.id)}
                          className="btn btn-secondary"
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                          disabled={isCapturingCamera && activeCameraQId === q.id}
                        >
                          <Camera size={13} />
                          <span>Capturar Expresión Facial</span>
                        </button>
                      </div>

                      {/* Sección de Simulación de Captura Activa */}
                      {isQCamera && (
                        <div style={{ 
                          marginTop: '14px', 
                          padding: '16px', 
                          backgroundColor: 'var(--bg-primary)', 
                          borderRadius: '8px', 
                          border: '1px solid var(--border)', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          gap: '12px' 
                        }}>
                          {isCapturingCamera ? (
                            <>
                              <div style={{
                                width: '160px',
                                height: '120px',
                                backgroundColor: '#222',
                                borderRadius: '6px',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden'
                              }}>
                                {/* Scanning bar animation */}
                                <div style={{
                                  position: 'absolute',
                                  width: '100%',
                                  height: '2px',
                                  backgroundColor: 'var(--primary)',
                                  boxShadow: '0 0 8px var(--primary)',
                                  top: 0,
                                  animation: 'scanEffect 1.5s ease-in-out infinite'
                                }} />
                                <Camera size={28} style={{ color: '#555' }} />
                              </div>
                              <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Loader className="animate-spin" size={12} />
                                Escaneando expresiones faciales y gestos...
                              </span>
                            </>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontSize: '12px', fontWeight: '700' }}>
                              <CheckCircle size={16} />
                              <span>Métricas del Gesto Capturadas exitosamente: Calma 82%, Tensión 12%</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
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
                            onClick={() => handleAnswerChange(q.id, val)}
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              border: testAnswers[q.id] === val ? '2px solid var(--primary)' : '1px solid var(--border)',
                              backgroundColor: testAnswers[q.id] === val ? 'var(--primary-light)' : 'var(--bg-secondary)',
                              fontWeight: '900',
                              color: testAnswers[q.id] === val ? 'var(--primary)' : 'var(--text-primary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: testAnswers[q.id] === val ? 'var(--accent-tech-glow)' : 'none',
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
                          onClick={() => handleAnswerChange(q.id, opt)}
                          style={{
                            flex: 1,
                            padding: '10px 16px',
                            borderRadius: '8px',
                            border: testAnswers[q.id] === opt ? '2px solid var(--primary)' : '1px solid var(--border)',
                            backgroundColor: testAnswers[q.id] === opt ? 'var(--primary-light)' : 'var(--bg-secondary)',
                            fontWeight: '800',
                            color: testAnswers[q.id] === opt ? 'var(--primary)' : 'var(--text-primary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {testAnswers[q.id] === opt && <Check size={14} />}
                          <span>{opt}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Panel de Botones de Envío */}
            <div style={{
              display: 'flex',
              gap: '16px',
              marginTop: '10px'
            }}>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={evalSubmitLoading || answeredCount < questions.length} 
                style={{ flex: 1, padding: '12px 24px', fontSize: '14px', borderRadius: '8px' }}
              >
                {evalSubmitLoading ? <Loader className="animate-spin" size={16} /> : 'Enviar Test y Analizar Bienestar'}
              </button>
              <button 
                type="button" 
                onClick={() => { setActiveView('dashboard'); setSelectedEval(null); }}
                className="btn btn-secondary"
                style={{ padding: '12px 24px', fontSize: '14px', borderRadius: '8px' }}
              >
                Cancelar y Salir
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
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
            color: '#ffffff',
            padding: '8px',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--tech-glow)'
          }}>
            <Heart size={18} />
          </div>
          <div>
            <h1 style={{ fontSize: '17px', fontWeight: '900', letterSpacing: '-0.5px' }}>EquilibrIA</h1>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '500' }}>Plataforma inteligente de bienestar y orientación</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={toggleTheme} className="theme-toggle" style={{ border: '1px solid var(--border)', width: '36px', height: '36px', borderRadius: '50%' }}>
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
      <main style={{ flex: 1, padding: '28px 24px 36px', maxWidth: '1380px', width: '100%', margin: '0 auto' }}>
        
        {/* Pestañas de Navegación */}
        <div className="tab-container" style={{ maxWidth: '750px' }}>
          <button className={`tab-btn ${activeTab === 'bienestar' ? 'active' : ''}`} onClick={() => setActiveTab('bienestar')}><Brain size={15} /><span>Mi Bienestar</span></button>
          <button className={`tab-btn ${activeTab === 'tareas' ? 'active' : ''}`} onClick={() => setActiveTab('tareas')}><ClipboardList size={15} /><span>Mis Tareas</span>{tasks.filter(t => t.status === 'pendiente').length > 0 && <span style={{ backgroundColor: 'var(--danger)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: 'var(--radius-full)', fontWeight: 'bold' }}>{tasks.filter(t => t.status === 'pendiente').length}</span>}</button>
          <button className={`tab-btn ${activeTab === 'evaluations' ? 'active' : ''}`} onClick={() => setActiveTab('evaluations')}><Calendar size={15} /><span>Tests de Evaluación</span>{evaluations.length > 0 && <span style={{ backgroundColor: 'var(--primary)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: 'var(--radius-full)', fontWeight: 'bold' }}>{evaluations.length}</span>}</button>
          <button className={`tab-btn ${activeTab === 'chat_ia' ? 'active' : ''}`} onClick={() => setActiveTab('chat_ia')}><Sparkles size={15} /><span>Asistente IA</span></button>
        </div>

        {/* TAB 1: MI BIENESTAR */}
        {activeTab === 'bienestar' && (
          <div className="grid grid-2 animate-fade" style={{ gap: '24px', alignItems: 'start' }}>
            <div className="glass-card" style={{ minHeight: '100%' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '900', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Brain size={18} style={{ color: 'var(--primary)' }} /> Reflexión Abierta Diaria
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>Describe tus sensaciones o vivencias de hoy. La plataforma procesará tu texto confidencialmente.</p>

              {reflectionError && (
                <div style={{ backgroundColor: 'var(--danger-light)', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '10px', borderRadius: 'var(--radius-sm)', fontSize: '12.5px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={15} />
                  <span>{reflectionError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitReflection}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <textarea rows="5" placeholder="Platica sobre tu día... Ej. Me sentí saturado pero logré avanzar." value={reflectionText} onChange={(e) => setReflectionText(e.target.value)} required style={{ resize: 'vertical' }} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={reflectionLoading} style={{ width: '100%' }}>
                  {reflectionLoading ? <Loader className="animate-spin" size={16} /> : <><Send size={15} /><span>Analizar Bienestar</span></>}
                </button>
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
              <div className="glass-card" style={{ minHeight: '280px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '900', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={17} style={{ color: 'var(--accent)' }} /> Curva de Ánimo Histórica
                </h3>
                {chartData.length === 0 ? (
                  <div style={{ height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)', fontSize: '12.5px' }}>Registra una reflexión para ver tu evolución.</div>
                ) : (
                  <div style={{ width: '100%', height: '220px', padding: '8px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(109,99,255,0.08), rgba(255,122,92,0.06))' }}>
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
                      <div key={ref.id} style={{ padding: '12px 13px', borderRadius: '16px', border: '1px solid var(--border)', background: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.05))', boxShadow: '0 8px 18px rgba(15, 18, 34, 0.05)' }}>
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
        )}

        {/* TAB 2: TAREAS */}
        {activeTab === 'tareas' && (
          <div className="glass-card animate-fade">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ClipboardList size={18} style={{ color: 'var(--primary)' }} /> Tareas Asignadas
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Actividades de bienestar y tareas institucionales.</p>
              </div>
              <div style={{ fontSize: '13px', fontWeight: '800', backgroundColor: 'var(--primary-light)', padding: '6px 14px', borderRadius: 'var(--radius-sm)', color: 'var(--primary)' }}>
                Progreso: {completedTasksCount}/{tasks.length} ({taskProgressPercent}%)
              </div>
            </div>

            {tasksLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}><Loader className="animate-spin" size={20} /></div>
            ) : tasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No tienes tareas pendientes.</div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    style={{
                      padding: '16px 18px',
                      borderRadius: '18px',
                      border: task.status === 'completada' ? '1px solid rgba(109,99,255,0.2)' : '1px solid var(--border)',
                      background: task.status === 'completada'
                        ? 'linear-gradient(135deg, rgba(109,99,255,0.12), rgba(255,122,92,0.08))'
                        : 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      boxShadow: '0 10px 24px rgba(15, 18, 34, 0.06)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <button
                      onClick={() => handleToggleTaskStatus(task.id, task.status)}
                      style={{
                        background: task.status === 'completada' ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'var(--bg-secondary)',
                        border: 'none',
                        cursor: 'pointer',
                        color: task.status === 'completada' ? '#fff' : 'var(--text-muted)',
                        width: '38px',
                        height: '38px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: task.status === 'completada' ? '0 6px 16px rgba(109,99,255,0.2)' : 'none'
                      }}
                    >
                      {task.status === 'completada' ? <CheckCircle2 size={18} /> : <div style={{ width: '14px', height: '14px', borderRadius: '4px', border: '2px solid currentColor' }} />}
                    </button>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '800', textDecoration: task.status === 'completada' ? 'line-through' : 'none' }}>{task.title}</h4>
                      {task.description && <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{task.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TESTS Y CUESTIONARIOS MULTIMODALES */}
        {activeTab === 'evaluations' && (
          <div className="grid grid-2 animate-fade" style={{ alignItems: 'start' }}>
            
            {/* Lista de Tests Habilitados */}
            <div className="glass-card">
              <h3 style={{ fontSize: '17px', fontWeight: '900', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} style={{ color: 'var(--primary)' }} /> Tests y Cuestionarios de la Institución
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
                Completa tus evaluaciones pendientes o consulta tus reportes de IA para tests ya finalizados.
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
                        style={{
                          padding: '16px 18px',
                          borderRadius: '18px',
                          border: '1px solid var(--border)',
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '12px',
                          boxShadow: '0 10px 22px rgba(15, 18, 34, 0.06)',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '9px', fontWeight: '800', padding: '2px 8px', borderRadius: '999px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>{ev.category}</span>
                            {isCompleted && (
                              <span style={{ fontSize: '9px', fontWeight: '800', padding: '2px 8px', borderRadius: '999px', backgroundColor: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '2px' }}>
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
                            className="btn btn-secondary"
                            style={{ padding: '8px 12px', fontSize: '12px', borderRadius: '999px' }}
                          >
                            Ver Diagnóstico
                          </button>
                        ) : (
                          <button
                            onClick={() => { setSelectedEval(ev); setTestAnswers({}); setEvalSuccessMsg(''); setEvalErrorMsg(''); setActiveView('fill_test'); }}
                            className="btn btn-primary"
                            style={{ padding: '8px 12px', fontSize: '12px', borderRadius: '999px' }}
                          >
                            Responder Test
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
                  Selecciona un test completado de la izquierda para ver su análisis de bienestar y sugerencia orientadora.
                </div>
              ) : !history.some(ref => ref.evaluation_id === selectedEval.id) ? (
                <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)', fontSize: '13px', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)' }}>
                  Este test aún no está completado. Haz clic en "Responder Test" para ir al espacio de llenado multimodal.
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
                          <h5 style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>Tu Respuesta en Texto/Audio:</h5>
                          <p style={{ fontSize: '12px', color: 'var(--text-primary)', fontStyle: 'italic' }}>"{matchedRef.original_text}"</p>
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

      </main>
    </div>
  );
};

export default MemberDashboard;
