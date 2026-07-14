import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { Sun, Moon, LogOut, ShieldAlert, Award, FileText, Settings, Users, BarChart3, HelpCircle } from 'lucide-react';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const [stats, setStats] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      const statsRes = await api.get('/institutions/dashboard');
      const sugRes = await api.get('/institutions/suggestions');
      
      setStats(statsRes.data);
      setSuggestions(sugRes.data);
      setError('');
    } catch (err) {
      console.error('Error al cargar datos del administrador:', err);
      setError(err.response?.data?.message || 'No se pudieron cargar los datos del dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <span style={{ color: 'var(--text-secondary)' }}>Cargando datos agregados...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', gap: '16px', padding: '24px' }}>
        <div style={{ color: 'var(--danger)', fontSize: '18px', fontWeight: '700' }}>Error</div>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '520px' }}>{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', gap: '16px', padding: '24px' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '18px', fontWeight: '700' }}>No hay datos disponibles.</div>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '520px' }}>Verifica que tu usuario tenga una institución asignada y que el backend esté en ejecución.</p>
      </div>
    );
  }

  // Preparar datos para el gráfico de pastel (Sentimiento dominante)
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
        boxShadow: 'var(--shadow)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            backgroundColor: 'var(--accent-light)',
            color: 'var(--accent)',
            padding: '8px',
            borderRadius: 'var(--radius-sm)'
          }}>
            <BarChart3 size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '800' }}>Dashboard Institucional</h1>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Monitoreo Agregado de Clima Emocional</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={toggleTheme} className="theme-toggle">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          
          <div style={{ textAlign: 'right', fontSize: '13px' }}>
            <span style={{ fontWeight: '700', display: 'block' }}>Panel Administrativo</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>Rol: {user?.role === 'superadmin' ? 'Super Admin' : 'Gestor de Bienestar'}</span>
          </div>

          <button onClick={logout} className="theme-toggle" style={{ color: 'var(--danger)' }} title="Cerrar Sesión">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Contenido Principal */}
      <main style={{ flex: 1, padding: '40px', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
        
        {/* Banner Informativo */}
        <div style={{
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          padding: '16px 24px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '32px',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '13px',
          fontWeight: '600'
        }}>
          <ShieldAlert size={20} />
          <span>
            <strong>Nota de Confidencialidad</strong>: Para proteger la identidad y privacidad de tu comunidad, todos los indicadores y sugerencias se calculan en base a estadísticas agregadas. Los nombres y textos individuales no se exponen en este panel.
          </span>
        </div>

        {/* Tarjetas KPI */}
        <div className="grid grid-3" style={{ marginBottom: '32px' }}>
          <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>ESTRÉS PROMEDIO</span>
              <h2 style={{ fontSize: '32px', fontWeight: '800', marginTop: '8px', color: 'var(--danger)' }}>{stats.averages.stress}%</h2>
            </div>
            <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'hsl(350, 100%, 96%)', color: 'var(--danger)' }}>
              <ShieldAlert size={24} />
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>MOTIVACIÓN PROMEDIO</span>
              <h2 style={{ fontSize: '32px', fontWeight: '800', marginTop: '8px', color: 'var(--success)' }}>{stats.averages.motivation}%</h2>
            </div>
            <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'hsl(150, 100%, 95%)', color: 'var(--success)' }}>
              <Award size={24} />
            </div>
          </div>

          <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>MIEMBROS ACTIVOS</span>
              <h2 style={{ fontSize: '32px', fontWeight: '800', marginTop: '8px', color: 'var(--primary)' }}>{stats.total_members}</h2>
            </div>
            <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
              <Users size={24} />
            </div>
          </div>
        </div>

        {/* Sección de Gráficos */}
        <div className="grid grid-2" style={{ marginBottom: '32px', alignItems: 'start' }}>
          
          {/* Gráfico de Línea de Tendencias Históricas */}
          <div className="glass-card">
            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '24px' }}>Evolución Emocional de la Comunidad</h3>
            {stats.historical_trends.length === 0 ? (
              <div style={{ height: '260px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
                Aún no hay datos de tendencia histórica registrados.
              </div>
            ) : (
              <div style={{ width: '100%', height: '260px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.historical_trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} />
                    <YAxis stroke="var(--text-secondary)" fontSize={12} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                    <Legend verticalAlign="top" height={36} />
                    <Line type="monotone" dataKey="stress" name="Estrés" stroke="var(--danger)" strokeWidth={2.5} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="motivation" name="Motivación" stroke="var(--success)" strokeWidth={2.5} />
                    <Line type="monotone" dataKey="burnout" name="Agotamiento" stroke="var(--warning)" strokeWidth={2.5} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Gráfico de Pastel de Distribución de Sentimiento */}
          <div className="glass-card">
            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '24px' }}>Distribución del Sentimiento</h3>
            {pieData.every(d => d.value === 0) ? (
              <div style={{ height: '260px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
                No hay suficientes datos de sentimiento registrados.
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '260px', gap: '20px' }}>
                <div style={{ width: '220px', height: '220px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {pieData.map((entry, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: COLORS[entry.name] }} />
                      <span style={{ textTransform: 'capitalize', fontWeight: '600' }}>{entry.name}: {entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Sugerencias Organizacionales generadas por Gemini */}
        <div className="glass-card animate-fade">
          <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="var(--primary)" />
            Recomendaciones y Plan de Acción de la IA
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            A continuación se listan las sugerencias generadas automáticamente por Gemini a partir de las preocupaciones redactadas de forma anónima por los miembros. Utiliza estas ideas para diseñar talleres o ajustar políticas de bienestar.
          </p>

          <div style={{ display: 'grid', gap: '16px' }}>
            {suggestions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '13px', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)' }}>
                No se han generado recomendaciones de la IA aún.
              </div>
            ) : (
              suggestions.map((sug) => (
                <div key={sug.id} style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  borderLeft: '4px solid var(--accent)',
                  backgroundColor: 'var(--bg-secondary)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}>
                  <p style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: '500', marginBottom: '8px' }}>
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

      </main>
    </div>
  );
};

export default AdminDashboard;
