import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Sparkles, Check } from 'lucide-react';

const CustomDatePicker = ({ 
  value, 
  onChange, 
  placeholder = "Seleccionar fecha...",
  style = {} 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Fecha base para el calendario flotante
  const initialDate = value ? new Date(value + 'T00:00:00') : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  const [openUpward, setOpenUpward] = useState(false);

  const handleToggle = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 360) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Calcular días del mes actual
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const handleSelectDay = (day) => {
    const monthStr = String(viewMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${viewYear}-${monthStr}-${dayStr}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleQuickPreset = (addDays) => {
    const d = new Date();
    d.setDate(d.getDate() + addDays);
    const year = d.getFullYear();
    const monthStr = String(d.getMonth() + 1).padStart(2, '0');
    const dayStr = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${monthStr}-${dayStr}`;
    onChange(dateStr);
    setViewYear(year);
    setViewMonth(d.getMonth());
    setIsOpen(false);
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Formatear texto mostrado
  const formattedDisplay = value ? (() => {
    try {
      const [y, m, d] = value.split('-');
      const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      return dateObj.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return value;
    }
  })() : null;

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', ...style }}>
      {/* Botón Principal del Fecha Selector */}
      <button
        type="button"
        onClick={handleToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '11px 16px',
          backgroundColor: 'var(--bg-secondary)',
          color: value ? 'var(--text-primary)' : 'var(--text-muted)',
          border: isOpen ? '2px solid var(--primary)' : '1.5px solid var(--border)',
          borderRadius: '14px',
          boxShadow: isOpen ? '0 0 0 4px var(--primary-glow)' : 'var(--shadow-sm)',
          fontSize: '13px',
          fontWeight: '700',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CalendarIcon size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <span>{formattedDisplay || placeholder}</span>
        </div>
        <Sparkles size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
      </button>

      {/* Popover del Calendario Flotante */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          ...(openUpward 
            ? { bottom: 'calc(100% + 8px)' } 
            : { top: 'calc(100% + 8px)' }
          ),
          left: 'auto',
          right: 'auto',
          backgroundColor: 'var(--bg-secondary)',
          border: '1.5px solid var(--primary)',
          borderRadius: '20px',
          boxShadow: '0 20px 48px rgba(0,0,0,0.4)',
          zIndex: 999999,
          padding: '14px',
          width: 'min(320px, calc(100vw - 24px))',
          maxWidth: 'calc(100vw - 24px)',
          boxSizing: 'border-box',
          animation: 'fadeIn 0.15s ease'
        }}>
          {/* Presets Rápidos */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
            {[
              { days: 0, label: 'Hoy' },
              { days: 1, label: 'Mañana' },
              { days: 3, label: '3 Días' },
              { days: 7, label: '1 Sem.' }
            ].map(p => (
              <button
                key={p.days}
                type="button"
                onClick={() => handleQuickPreset(p.days)}
                className="duo-pill"
                style={{ padding: '4px 8px', fontSize: '11px', flex: 1, justifyContent: 'center' }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Navegación del Mes */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <button
              type="button"
              onClick={prevMonth}
              className="theme-toggle"
              style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--border)' }}
            >
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontSize: '13.5px', fontWeight: '900', color: 'var(--primary)' }}>
              {monthNames[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="theme-toggle"
              style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--border)' }}
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Días de la Semana */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '6px' }}>
            {daysOfWeek.map(d => (
              <span key={d} style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--text-muted)' }}>{d}</span>
            ))}
          </div>

          {/* Matriz de Días */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const monthStr = String(viewMonth + 1).padStart(2, '0');
              const dayStr = String(day).padStart(2, '0');
              const dateStr = `${viewYear}-${monthStr}-${dayStr}`;
              const isSelected = value === dateStr;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  style={{
                    height: '34px',
                    borderRadius: '10px',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid transparent',
                    backgroundColor: isSelected ? 'var(--primary)' : 'transparent',
                    color: isSelected ? '#ffffff' : 'var(--text-primary)',
                    fontWeight: isSelected ? '900' : '600',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  className="calendar-day-box"
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;
