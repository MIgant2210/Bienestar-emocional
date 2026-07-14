import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { Sun, Moon, LogOut, Send, History, Heart, Brain, Smile, Activity, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MemberDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  const [reflectionText, setReflectionText] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [latestAnalysis, setLatestAnalysis] = useState(null);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/analysis/my-history');
      setHistory(response.data);
    } catch (err) {
      console.error('Error al cargar historial:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSubmitReflection = async (e) => {
    e.preventDefault();
    if (reflectionText.trim().length < 10) {
      setErrorMsg('Por favor redacta un texto más descriptivo (mínimo 10 caracteres).');
      return;
    }
    
    setErrorMsg('');
    setLoading(true);
    setLatestAnalysis(null);
    
    try {
      const response = await api.post('/analysis/submit', { text: reflectionText });
      setLatestAnalysis(response.data.analysis);
      setReflectionText('');
      fetchHistory(); // Recargar historial
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error al analizar la reflexión.');
    } finally {
      setLoading(false);
    }
  };

  // Preparar datos para el gráfico de historial
  const chartData = [...history]
    .reverse() // Orden cronológico para la gráfica
    .map(ref => ({
      fecha: new Date(ref.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      Estrés: ref.stress_score,
      Motivación: ref.motivation_score,
      Agotamiento: ref.burnout_score
    }));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Barra de Navegación Superior */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 40px',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            padding: '8px',
            borderRadius: 'var(--radius-sm)'
          }}>
            <Heart size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '800' }}>Bienestar Emocional</h1>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Espacio Personal del Miembro</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={toggleTheme} className="theme-toggle">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          
          <div style={{ textAlign: 'right', fontSize: '13px' }}>
            <span style={{ fontWeight: '700', display: 'block' }}>{user?.first_name} {user?.last_name}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>{user?.email}</span>
          </div>

          <button onClick={logout} className="theme-toggle" style={{ color: 'var(--danger)' }} title="Cerrar Sesión">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Contenido Principal */}
      <main style={{ flex: 1, padding: '40px', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
        
        <div className="grid grid-2" style={{ alignItems: 'start' }}>
          
          {/* Columna Izquierda: Redactar Reflexión */}
          <div className="glass-card animate-fade">
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Brain size={18} color="var(--primary)" />
              ¿Cómo te sientes hoy?
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Escribe un párrafo sobre tus retos de la semana, tu estado de ánimo o preocupaciones.
              Nuestro asistente de Inteligencia Artificial analizará el texto para darte indicadores generales de bienestar.
            </p>

            {errorMsg && (
              <div style={{
                backgroundColor: 'hsl(350, 100%, 96%)',
                border: '1px solid var(--danger)',
                color: 'var(--danger)',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitReflection}>
              <div className="form-group">
                <textarea
                  rows="6"
                  placeholder="Escribe tu reflexión libre aquí (mínimo 10 caracteres)... Ej: Esta semana he sentido mucha presión por los exámenes finales y no he podido dormir bien, aunque me siento motivado por terminar mis proyectos."
                  value={reflectionText}
                  onChange={(e) => setReflectionText(e.target.value)}
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%' }}
              >
                {loading ? 'Analizando con Gemini...' : (
                  <>
                    <Send size={16} />
                    <span>Enviar Reflexión</span>
                  </>
                )}
              </button>
            </form>

            {/* Resultado Inmediato del Análisis */}
            {latestAnalysis && (
              <div style={{
                marginTop: '24px',
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border)'
              }} className="animate-fade">
                <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Smile size={16} color="var(--accent)" />
                  Resultado del Análisis Emocional
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px', textAlign: 'center' }}>
                  <div style={{ padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>Estrés</span>
                    <span style={{ fontSize: '18px', fontWeight: '800', color: latestAnalysis.stress_score > 60 ? 'var(--danger)' : 'var(--success)' }}>
                      {latestAnalysis.stress_score}%
                    </span>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>Motivación</span>
                    <span style={{ fontSize: '18px', fontWeight: '800', color: latestAnalysis.motivation_score > 50 ? 'var(--success)' : 'var(--warning)' }}>
                      {latestAnalysis.motivation_score}%
                    </span>
                  </div>
                  <div style={{ padding: '10px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>Agotamiento</span>
                    <span style={{ fontSize: '18px', fontWeight: '800', color: latestAnalysis.burnout_score > 60 ? 'var(--warning)' : 'var(--success)' }}>
                      {latestAnalysis.burnout_score}%
                    </span>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Sentimiento Dominante: </span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)' }}>
                    {latestAnalysis.dominant_sentiment}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Columna Derecha: Gráfica de Tendencias e Historial */}
          <div style={{ display: 'grid', gap: '24px' }}>
            
            {/* Gráfica de Tendencia Personal */}
            <div className="glass-card animate-fade">
              <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="var(--accent)" />
                Tendencias de mi Bienestar
              </h3>
              
              {chartData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                  Aún no hay suficientes datos para graficar tus tendencias. Escribe tu primera reflexión.
                </div>
              ) : (
                <div style={{ width: '100%', height: '240px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="fecha" stroke="var(--text-secondary)" fontSize={12} />
                      <YAxis stroke="var(--text-secondary)" fontSize={12} domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                      <Legend verticalAlign="top" height={36} />
                      <Line type="monotone" dataKey="Estrés" stroke="var(--danger)" strokeWidth={2.5} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="Motivación" stroke="var(--success)" strokeWidth={2.5} />
                      <Line type="monotone" dataKey="Agotamiento" stroke="var(--warning)" strokeWidth={2.5} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Historial Corto */}
            <div className="glass-card animate-fade">
              <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={18} />
                Historial de Reflexiones
              </h3>

              <div style={{ display: 'grid', gap: '12px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
                {history.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
                    Tu historial está vacío.
                  </p>
                ) : (
                  history.map((ref) => (
                    <div key={ref.id} style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg-secondary)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {new Date(ref.created_at).toLocaleString('es-ES')}
                        </span>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 'bold',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: ref.dominant_sentiment === 'Positivo' ? 'hsl(150, 100%, 95%)' : ref.dominant_sentiment === 'Negativo' ? 'hsl(350, 100%, 95%)' : 'var(--bg-primary)',
                          color: ref.dominant_sentiment === 'Positivo' ? 'var(--success)' : ref.dominant_sentiment === 'Negativo' ? 'var(--danger)' : 'var(--text-secondary)'
                        }}>
                          {ref.dominant_sentiment}
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-primary)', fontStyle: 'italic', marginBottom: '8px' }}>
                        "{ref.original_text}"
                      </p>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
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

      </main>
    </div>
  );
};

export default MemberDashboard;
