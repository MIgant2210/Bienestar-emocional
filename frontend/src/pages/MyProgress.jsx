import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { 
  Trophy, Flame, Award, Calendar as CalendarIcon, Footprints, 
  Compass, Heart, Sparkles, Lock, ArrowLeft, RefreshCw, 
  ShieldCheck, CheckCircle2, Sliders, Users, Star, Loader, History
} from 'lucide-react';
import api from '../services/api';

const ICON_MAP = {
  Footprints: Footprints,
  Calendar: CalendarIcon,
  Flame: Flame,
  Compass: Compass,
  Heart: Heart,
  Sparkles: Sparkles,
  Award: Award
};

export default function MyProgress({ onBack }) {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [badges, setBadges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [history, setHistory] = useState([]);
  const [streakData, setStreakData] = useState(null);
  const [sortFilter, setSortFilter] = useState('xp'); // 'xp', 'badges', 'streak', 'level'
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [resProfile, resBadges, resLeaderboard, resHistory, resStreak] = await Promise.all([
        api.get('/gamification/me'),
        api.get('/gamification/badges'),
        api.get(`/gamification/leaderboard?sort_by=${sortFilter}`),
        api.get('/gamification/xp-history'),
        api.get('/gamification/streak')
      ]);

      setProfile(resProfile.data);
      setBadges(resBadges.data || []);
      setLeaderboard(resLeaderboard.data || []);
      setHistory(resHistory.data || []);
      setStreakData(resStreak.data);
    } catch (err) {
      console.error('Error al cargar la información de gamificación:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [sortFilter]);

  if (loading && !profile) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: 'var(--text-secondary)' }}>
        <Loader className="animate-spin" size={32} style={{ marginRight: '10px' }} />
        <span>Cargando tu perfil de progreso y gamificación...</span>
      </div>
    );
  }

  const lvl = profile?.level_info || {};
  const activeDatesSet = new Set(streakData?.active_dates || []);

  // Generar cuadrícula del mes actual para el calendario de actividad
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className="animate-fade" style={{ display: 'grid', gap: '24px', maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      
      {/* BARRA SUPERIOR DE NAVEGACIÓN */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="duo-card"
              style={{ padding: '8px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ArrowLeft size={16} /> Volver al Inicio
            </button>
          )}
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy style={{ color: 'var(--primary)' }} /> Mi Progreso de Bienestar Emocional
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Seguimiento de nivel, racha de constancia, medallas obtenidas y ranking institucional.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchAllData}
          className="duo-pill"
          style={{ padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Actualizar Datos
        </button>
      </div>

      {/* TARJETA PRINCIPAL DE PERFIL Y NIVEL */}
      <div className="glass-card" style={{ padding: '28px', background: 'linear-gradient(135deg, var(--card-bg) 0%, var(--bg-secondary) 100%)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'center' }}>
          
          {/* Avatar y Datos Personales */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: '900',
              boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)'
            }}>
              {user?.first_name?.charAt(0) || 'U'}
            </div>

            <div>
              <span className="duo-pill" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: '900', fontSize: '11px' }}>
                NIVEL {lvl.level || 1} • {lvl.title || 'Iniciante'}
              </span>
              <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-primary)', marginTop: '4px' }}>
                {profile?.first_name} {profile?.last_name}
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                Departamento: <strong>{profile?.department || 'General'}</strong>
              </p>
            </div>
          </div>

          {/* Medidor de XP y Barra de Progreso */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>PROGRESO DE EXPERIENCIA</span>
              <span style={{ fontSize: '22px', fontWeight: '900', color: 'var(--primary)' }}>
                {lvl.total_xp || 0} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>XP</span>
              </span>
            </div>

            <div style={{ width: '100%', height: '14px', backgroundColor: 'var(--border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '8px', padding: '2px' }}>
              <div style={{
                width: `${lvl.progress_percent || 0}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--primary) 0%, #ec4899 50%, var(--accent) 100%)',
                borderRadius: '10px',
                transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '700' }}>
              <span>{lvl.xp_in_current_level || 0} / {lvl.xp_for_next_level - lvl.xp_for_current_level} XP acumulados</span>
              <span style={{ color: 'var(--primary)' }}>Faltan {lvl.xp_remaining || 0} XP para Nivel {(lvl.level || 1) + 1}</span>
            </div>
          </div>

        </div>
      </div>

      {/* SECCIÓN DE RACHA Y CALENDARIO DE ACTIVIDAD */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Ficha de Racha Real */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Flame size={24} style={{ color: '#f97316' }} />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '900' }}>Racha de Constancia Diaria</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Calculada automáticamente con tus registros reales.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div className="futuristic-card-item" style={{ textAlign: 'center', padding: '16px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>RACHA ACTUAL</span>
              <h2 style={{ fontSize: '32px', fontWeight: '900', color: '#f97316', margin: '4px 0 0 0' }}>
                🔥 {profile?.current_streak || 0}
              </h2>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Días consecutivos</span>
            </div>

            <div className="futuristic-card-item" style={{ textAlign: 'center', padding: '16px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>MEJOR RACHA</span>
              <h2 style={{ fontSize: '32px', fontWeight: '900', color: 'var(--primary)', margin: '4px 0 0 0' }}>
                🏆 {profile?.longest_streak || 0}
              </h2>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Récord histórico</span>
            </div>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
            Última actividad registrada: <strong>{profile?.last_activity_date || 'Hoy sin registrar'}</strong>
          </p>
        </div>

        {/* Calendario de Actividad Visual */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarIcon size={18} style={{ color: 'var(--primary)' }} /> Calendario de Participación ({monthNames[month]} {year})
            </h3>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} /> Días Activos
            </span>
          </div>

          {/* Días de la Semana Header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span>Dom</span><span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span>
          </div>

          {/* Cuadrícula de Días */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} style={{ height: '36px' }} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isActive = activeDatesSet.has(dateStr);

              return (
                <div
                  key={dateStr}
                  title={isActive ? `¡Participaste el ${dateStr}!` : `Sin actividad el ${dateStr}`}
                  style={{
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: isActive ? 'var(--primary)' : 'var(--bg-secondary)',
                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: isActive ? '900' : '600',
                    border: isActive ? '1px solid var(--primary)' : '1px solid var(--border)',
                    boxShadow: isActive ? '0 2px 8px rgba(139, 92, 246, 0.3)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {dayNum}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* SECCIÓN DE LAS 6 MEDALLAS OFICIALES */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={22} style={{ color: 'var(--primary)' }} /> Galería Oficial de Medallas de Bienestar (6 Medallas)
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Desbloquea insignias institucionales al mantener constancia y participar activamente.
            </p>
          </div>

          <span className="duo-pill" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: '900', fontSize: '12px' }}>
            DESBLOQUEADAS: {badges.filter(b => b.unlocked).length} / 6
          </span>
        </div>

        {/* Grid de las 6 Medallas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {badges.map((badge) => {
            const IconComp = ICON_MAP[badge.icon] || Award;
            const isUnlocked = badge.unlocked;

            return (
              <div
                key={badge.id}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '18px',
                  border: isUnlocked ? `2px solid ${badge.color}` : '1.5px dashed var(--border)',
                  padding: '18px',
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'flex-start',
                  position: 'relative',
                  opacity: isUnlocked ? 1 : 0.65,
                  boxShadow: isUnlocked ? `0 8px 24px ${badge.color}25` : 'none',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                {/* Ícono de Medalla */}
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  backgroundColor: isUnlocked ? badge.color : 'var(--bg-primary)',
                  color: isUnlocked ? '#ffffff' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: isUnlocked ? `0 4px 14px ${badge.color}40` : 'none',
                  filter: isUnlocked ? 'none' : 'grayscale(100%)'
                }}>
                  <IconComp size={26} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: '900', color: isUnlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {badge.name}
                    </h4>
                    <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '10px', backgroundColor: isUnlocked ? `${badge.color}20` : 'var(--border)', color: isUnlocked ? badge.color : 'var(--text-muted)' }}>
                      {badge.rarity}
                    </span>
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: '1.4' }}>
                    {badge.description}
                  </p>

                  {/* Estado / Avance */}
                  {isUnlocked ? (
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={13} /> Obtenida el {new Date(badge.unlocked_at).toLocaleDateString()}
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '4px' }}>
                        <span><Lock size={10} style={{ display: 'inline', marginRight: '4px' }} /> Bloqueada</span>
                        <span>{badge.current_value} / {badge.criterion_value}</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{ width: `${badge.progress_percent}%`, height: '100%', backgroundColor: badge.color, borderRadius: '6px' }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TABLERO DE CLASIFICACIÓN / RANKING INSTITUCIONAL */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={22} style={{ color: 'var(--primary)' }} /> Tablero de Clasificación Institucional
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Ranking de participación y constancia de colaboradores de tu institución. <em>(Confidencial y libre de datos clínicos)</em>.
            </p>
          </div>

          {/* Filtros de Clasificación */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'xp', label: 'Mayor XP' },
              { id: 'badges', label: 'Más Medallas' },
              { id: 'streak', label: 'Mejor Racha' },
              { id: 'level', label: 'Nivel Más Alto' }
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSortFilter(f.id)}
                className={`duo-pill ${sortFilter === f.id ? 'selected' : ''}`}
                style={{ padding: '6px 12px', fontSize: '11.5px', cursor: 'pointer' }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla de Ranking */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 16px' }}>POSICIÓN</th>
                <th style={{ padding: '12px 16px' }}>COLABORADOR</th>
                <th style={{ padding: '12px 16px' }}>DEPARTAMENTO</th>
                <th style={{ padding: '12px 16px' }}>NIVEL</th>
                <th style={{ padding: '12px 16px' }}>RACHA (🔥)</th>
                <th style={{ padding: '12px 16px' }}>MEDALLAS (🏅)</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>XP TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No hay otros participantes registrados en el ranking aún.
                  </td>
                </tr>
              ) : (
                leaderboard.map((item) => (
                  <tr
                    key={item.user_id}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      backgroundColor: item.is_current_user ? 'var(--primary-light)' : 'transparent',
                      fontWeight: item.is_current_user ? '800' : '500'
                    }}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: '900' }}>
                      {item.rank === 1 ? '🥇 #1' : item.rank === 2 ? '🥈 #2' : item.rank === 3 ? '🥉 #3' : `#${item.rank}`}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: '800' }}>
                      {item.first_name} {item.last_name} {item.is_current_user && <span style={{ fontSize: '10px', color: 'var(--primary)', marginLeft: '4px' }}>(TÚ)</span>}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {item.department}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className="duo-pill" style={{ fontSize: '11px', padding: '2px 8px' }}>
                        Nivel {item.current_level}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: '800', color: '#f97316' }}>
                      🔥 {item.current_streak} días
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: '800', color: 'var(--primary)' }}>
                      🏅 {item.badges_count}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '900', color: 'var(--primary)' }}>
                      {item.total_xp} XP
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* HISTORIAL DE TRANSACCIONES DE XP */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <History size={20} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '17px', fontWeight: '900' }}>Historial Real de Transacciones de XP</h3>
        </div>

        <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border)', overflowX: 'auto' }}>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '13px' }}>
              Aún no tienes registros en tu historial de XP. ¡Completa tu primera evaluación o registro diario!
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)', fontSize: '11px' }}>
                  <th style={{ padding: '10px 14px' }}>CONCEPTO / ACCIÓN</th>
                  <th style={{ padding: '10px 14px' }}>TIPO DE ACTIVIDAD</th>
                  <th style={{ padding: '10px 14px' }}>FECHA DE REGISTRO</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>XP GANADO</th>
                </tr>
              </thead>
              <tbody>
                {history.map((tx) => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: '800', color: 'var(--text-primary)' }}>
                      {tx.description}
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                      <span className="duo-pill" style={{ fontSize: '10.5px' }}>{tx.action_type}</span>
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>
                      {new Date(tx.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '900', color: '#10b981' }}>
                      +{tx.xp_amount} XP
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
