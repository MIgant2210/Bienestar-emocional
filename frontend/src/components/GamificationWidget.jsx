import React, { useState, useEffect } from 'react';
import { 
  Award, Flame, Calendar, Sparkles, Trophy, Lock, 
  ChevronRight, Footprints, Compass, Heart, Loader, ShieldCheck
} from 'lucide-react';
import api from '../services/api';

const ICON_MAP = {
  Footprints: Footprints,
  Calendar: Calendar,
  Flame: Flame,
  Compass: Compass,
  Heart: Heart,
  Sparkles: Sparkles,
  Award: Award
};

export default function GamificationWidget({ onNavigateToFullProgress }) {
  const [profile, setProfile] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGamificationData = async () => {
    try {
      setLoading(true);
      const [resProfile, resBadges] = await Promise.all([
        api.get('/gamification/me', { timeout: 10000 }),
        api.get('/gamification/badges', { timeout: 10000 })
      ]);
      setProfile(resProfile.data);
      setBadges(resBadges.data || []);
    } catch (err) {
      console.error('Error al cargar datos de gamificación:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGamificationData();
  }, []);

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Loader className="animate-spin" size={24} style={{ margin: '0 auto 8px auto', display: 'block' }} />
        <span style={{ fontSize: '12.5px', fontWeight: '700' }}>Cargando progreso de gamificación...</span>
      </div>
    );
  }

  if (!profile) return null;

  const lvl = profile.level_info || {};
  const unlockedCount = badges.filter(b => b.unlocked).length;
  const lockedNextBadge = badges.find(b => !b.unlocked);

  return (
    <div className="glass-card animate-fade" style={{ padding: '22px 24px', position: 'relative', overflow: 'hidden' }}>
      
      {/* Encabezado y Acción Principal */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '14px',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.15)'
          }}>
            <Trophy size={22} />
          </div>
          <div>
            <span style={{ fontSize: '10.5px', fontWeight: '900', color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
              MI PROGRESO DE BIENESTAR
            </span>
            <h3 style={{ fontSize: '17px', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>
              {lvl.title || 'Iniciante de Bienestar'}
            </h3>
          </div>
        </div>

        {onNavigateToFullProgress && (
          <button
            type="button"
            onClick={onNavigateToFullProgress}
            className="btn btn-primary"
            style={{ padding: '8px 14px', fontSize: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800' }}
          >
            Ver Todo Mi Progreso <ChevronRight size={15} />
          </button>
        )}
      </div>

      {/* Grid de 4 Pilares: Nivel & XP, Racha, Medallas, Ranking */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))', gap: '14px', marginBottom: '18px', width: '100%', boxSizing: 'border-box' }}>
        
        {/* 1. Nivel y XP */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', padding: '14px 16px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>NIVEL ACTUAL</span>
            <span className="duo-pill" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: '900', fontSize: '11px' }}>
              NIVEL {lvl.level || 1}
            </span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '8px' }}>
            {lvl.total_xp || 0} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>XP TOTAL</span>
          </div>
          
          {/* Barra de Progreso */}
          <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border)', borderRadius: '10px', overflow: 'hidden', marginBottom: '6px' }}>
            <div style={{
              width: `${lvl.progress_percent || 0}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%)',
              borderRadius: '10px',
              transition: 'width 0.5s ease'
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: '700' }}>
            <span>{lvl.xp_in_current_level || 0} XP</span>
            <span>Faltan {lvl.xp_remaining || 0} XP para Nivel {(lvl.level || 1) + 1}</span>
          </div>
        </div>

        {/* 2. Racha Diaria */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', padding: '14px 16px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>RACHA ACTIVA</span>
            <Flame size={18} style={{ color: '#f97316' }} />
          </div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: '#f97316', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Flame size={20} style={{ color: '#f97316' }} />
            <span>{profile.current_streak || 0}</span>
            <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>DÍAS</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
            Mejor racha histórica: <strong>{profile.longest_streak || 0} días</strong>
          </p>
        </div>

        {/* 3. Resumen de Medallas */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', padding: '14px 16px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>MEDALLAS LOGRADAS</span>
            <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--primary)' }}>{unlockedCount} de 6</span>
          </div>
          
          {/* Fila de Íconos de Medallas */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '6px' }}>
            {badges.slice(0, 6).map(badge => {
              const IconComponent = ICON_MAP[badge.icon] || Award;
              const isUnlocked = badge.unlocked;
              return (
                <div
                  key={badge.id}
                  title={`${badge.name}: ${badge.description}`}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    backgroundColor: isUnlocked ? badge.color : 'var(--bg-primary)',
                    color: isUnlocked ? '#ffffff' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: isUnlocked ? 1 : 0.45,
                    border: isUnlocked ? `1px solid ${badge.color}` : '1px dashed var(--border)',
                    boxShadow: isUnlocked ? `0 2px 8px ${badge.color}40` : 'none',
                    position: 'relative'
                  }}
                >
                  <IconComponent size={15} />
                  {!isUnlocked && (
                    <Lock size={10} style={{ position: 'absolute', bottom: '-2px', right: '-2px', backgroundColor: 'var(--bg-secondary)', borderRadius: '50%', color: 'var(--text-muted)' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Posición en Ranking */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', padding: '14px 16px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)' }}>POSICIÓN INSTITUCIONAL</span>
            <ShieldCheck size={18} style={{ color: 'var(--primary)' }} />
          </div>
          <div style={{ fontSize: '22px', fontWeight: '900', color: 'var(--primary)', marginBottom: '4px' }}>
            #{profile.institution_rank || 1}
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Basado en XP de participación constante.
          </p>
        </div>

      </div>

      {/* Tarjeta Próximo Logro */}
      {lockedNextBadge && (
        <div style={{
          backgroundColor: 'var(--primary-light)',
          borderRadius: '14px',
          border: '1px solid var(--primary)',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={20} style={{ color: 'var(--primary)' }} />
            <div>
              <span style={{ fontSize: '10.5px', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase' }}>PRÓXIMO LOGRO A DESBLOQUEAR</span>
              <p style={{ fontSize: '12.5px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                Medalla "{lockedNextBadge.name}": {lockedNextBadge.description}
              </p>
            </div>
          </div>
          <div style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--primary)' }}>
            Avance: {lockedNextBadge.current_value} / {lockedNextBadge.criterion_value}
          </div>
        </div>
      )}

    </div>
  );
}
