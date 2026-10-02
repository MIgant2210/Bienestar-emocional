import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, X, Sparkles } from 'lucide-react';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const WEEKDAY_NAMES = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

/**
 * CustomDatePicker - Selector de Fecha Personalizado y Elegante
 * Totalmente desacoplado de los inputs nativos del navegador.
 * Soporta selección ágil de año (dropdown de 100 años), mes y día con diseño armónico.
 */
const CustomDatePicker = ({
  value,
  onChange,
  placeholder = 'Selecciona tu fecha de nacimiento',
  disabled = false,
  hasError = false,
  maxDate,
  minDate,
  id,
  name
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Fecha actual de referencia
  const today = useMemo(() => new Date(), []);
  const currentYear = today.getFullYear();

  // Límites por defecto (para nacimiento: máximo hoy, mínimo hace 100 años)
  const max = useMemo(() => (maxDate ? new Date(maxDate) : today), [maxDate, today]);
  const min = useMemo(() => (minDate ? new Date(minDate) : new Date(currentYear - 100, 0, 1)), [minDate, currentYear]);

  // Parsear valor inicial si existe
  const parsedValue = useMemo(() => {
    if (!value) return null;
    const parts = value.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  }, [value]);

  // Estado del mes y año visualizados en el calendario
  const [viewYear, setViewYear] = useState(() => {
    return parsedValue ? parsedValue.getFullYear() : (currentYear - 20); // Sugerir 20 años por defecto en nacimiento
  });
  const [viewMonth, setViewMonth] = useState(() => {
    return parsedValue ? parsedValue.getMonth() : today.getMonth();
  });

  // Cerrar al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Sincronizar vista cuando cambia el valor externamente
  useEffect(() => {
    if (parsedValue) {
      setViewYear(parsedValue.getFullYear());
      setViewMonth(parsedValue.getMonth());
    }
  }, [parsedValue]);

  // Lista de años disponibles (desde el máximo hacia atrás)
  const yearOptions = useMemo(() => {
    const startYear = max.getFullYear();
    const endYear = min.getFullYear();
    const years = [];
    for (let y = startYear; y >= endYear; y--) {
      years.push(y);
    }
    return years;
  }, [max, min]);

  // Días del mes a desplegar
  const daysInMonth = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    // Ajustar para que lunes sea 0 y domingo sea 6
    const adjustedFirstDay = (firstDayIndex + 6) % 7;
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();

    const days = [];
    // Espacios en blanco para alinear el primer día
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null);
    }
    // Días del mes
    for (let d = 1; d <= totalDays; d++) {
      days.push(d);
    }
    return days;
  }, [viewYear, viewMonth]);

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const handleSelectDay = (day) => {
    if (!day) return;
    const selectedDate = new Date(viewYear, viewMonth, day);
    if (selectedDate > max || selectedDate < min) return;

    const formattedMonth = String(viewMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const isoString = `${viewYear}-${formattedMonth}-${formattedDay}`;

    onChange(isoString);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
  };

  // Texto legible para el usuario
  const displayText = useMemo(() => {
    if (!parsedValue) return '';
    const day = parsedValue.getDate();
    const month = MONTH_NAMES[parsedValue.getMonth()];
    const year = parsedValue.getFullYear();
    return `${day} de ${month} de ${year}`;
  }, [parsedValue]);

  // Cálculo de edad estimada si hay fecha
  const calculatedAge = useMemo(() => {
    if (!parsedValue) return null;
    const ageDiffMs = Date.now() - parsedValue.getTime();
    const ageDate = new Date(ageDiffMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    return isNaN(age) || age < 0 ? null : age;
  }, [parsedValue]);

  return (
    <div className="custom-datepicker-container" ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {/* Botón Disparador */}
      <button
        type="button"
        id={id}
        name={name}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '11px 14px',
          borderRadius: '12px',
          backgroundColor: 'var(--bg-secondary, #f8fafc)',
          border: hasError 
            ? '1.5px solid #ef4444' 
            : isOpen 
              ? '1.5px solid var(--primary)' 
              : '1.5px solid var(--border, rgba(148, 163, 184, 0.25))',
          boxShadow: isOpen ? '0 0 0 3px var(--primary-light)' : 'none',
          color: displayText ? 'var(--text-primary)' : 'var(--text-muted, #94a3b8)',
          fontSize: '14px',
          fontWeight: displayText ? '600' : '400',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          outline: 'none',
          textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: displayText ? 'var(--primary-light)' : 'rgba(148, 163, 184, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: displayText ? 'var(--primary)' : 'var(--text-muted)',
            flexShrink: 0
          }}>
            <CalendarIcon size={18} />
          </div>
          <span style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: displayText ? 'var(--text-primary)' : 'var(--text-muted)'
          }}>
            {displayText || placeholder}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {displayText && !disabled && (
            <span
              onClick={handleClear}
              title="Borrar selección"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                backgroundColor: 'rgba(148, 163, 184, 0.18)',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <X size={13} />
            </span>
          )}
          <ChevronDown 
            size={16} 
            style={{ 
              color: 'var(--text-muted)', 
              transform: isOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s ease'
            }} 
          />
        </div>
      </button>

      {/* Popover / Desplegable del Calendario */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            zIndex: 9999,
            width: '100%',
            minWidth: '300px',
            maxWidth: '340px',
            backgroundColor: 'var(--bg-primary, #ffffff)',
            borderRadius: '16px',
            border: '1px solid var(--border, rgba(148, 163, 184, 0.2))',
            boxShadow: '0 20px 35px -10px rgba(0, 0, 0, 0.25), 0 0 15px rgba(99, 102, 241, 0.1)',
            padding: '16px',
            animation: 'fadeInUp 0.18s ease-out',
            backdropFilter: 'blur(12px)'
          }}
        >
          {/* Barra Superior con Selectores Rápidos de Mes y Año */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
            gap: '6px'
          }}>
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Mes anterior"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid var(--border, rgba(148, 163, 184, 0.2))',
                backgroundColor: 'var(--bg-secondary, #f8fafc)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <ChevronLeft size={16} />
            </button>

            {/* Selectores Mes y Año */}
            <div style={{ display: 'flex', gap: '6px', flex: 1, justifyContent: 'center' }}>
              {/* Selector de Mes */}
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                style={{
                  padding: '5px 8px',
                  borderRadius: '8px',
                  border: '1px solid var(--border, rgba(148, 163, 184, 0.2))',
                  backgroundColor: 'var(--bg-secondary, #f8fafc)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx}>{m}</option>
                ))}
              </select>

              {/* Selector de Año */}
              <select
                value={viewYear}
                onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                style={{
                  padding: '5px 8px',
                  borderRadius: '8px',
                  border: '1px solid var(--border, rgba(148, 163, 184, 0.2))',
                  backgroundColor: 'var(--bg-secondary, #f8fafc)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {yearOptions.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              title="Mes siguiente"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: '1px solid var(--border, rgba(148, 163, 184, 0.2))',
                backgroundColor: 'var(--bg-secondary, #f8fafc)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Días de la Semana */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '4px',
            marginBottom: '8px',
            textAlign: 'center'
          }}>
            {WEEKDAY_NAMES.map(w => (
              <span
                key={w}
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: 'var(--text-secondary, #64748b)',
                  textTransform: 'uppercase',
                  padding: '2px 0'
                }}
              >
                {w}
              </span>
            ))}
          </div>

          {/* Matriz de Días */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '4px',
            textAlign: 'center'
          }}>
            {daysInMonth.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} style={{ height: '34px' }} />;
              }

              const cellDate = new Date(viewYear, viewMonth, day);
              const isDisabled = cellDate > max || cellDate < min;
              const isSelected = parsedValue &&
                parsedValue.getDate() === day &&
                parsedValue.getMonth() === viewMonth &&
                parsedValue.getFullYear() === viewYear;
              const isToday = today.getDate() === day &&
                today.getMonth() === viewMonth &&
                today.getFullYear() === viewYear;

              return (
                <button
                  type="button"
                  key={`day-${day}`}
                  disabled={isDisabled}
                  onClick={() => handleSelectDay(day)}
                  style={{
                    height: '34px',
                    borderRadius: '9px',
                    border: isSelected 
                      ? 'none' 
                      : isToday 
                        ? '1.5px dashed var(--primary)' 
                        : '1px solid transparent',
                    backgroundColor: isSelected 
                      ? 'var(--primary)' 
                      : 'transparent',
                    color: isSelected 
                      ? '#ffffff' 
                      : isDisabled 
                        ? 'var(--text-muted, #cbd5e1)' 
                        : 'var(--text-primary)',
                    fontSize: '13px',
                    fontWeight: isSelected || isToday ? '700' : '500',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDisabled ? 0.35 : 1,
                    boxShadow: isSelected ? '0 4px 12px var(--tech-glow)' : 'none',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (!isDisabled && !isSelected) {
                      e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                      e.currentTarget.style.color = 'var(--primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isDisabled && !isSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Pie del Calendario: Información y Cumpleaños */}
          {calculatedAge !== null && (
            <div style={{
              marginTop: '12px',
              paddingTop: '10px',
              borderTop: '1px solid var(--border, rgba(148, 163, 184, 0.15))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: 'var(--text-secondary)'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600' }}>
                <Sparkles size={14} style={{ color: 'var(--primary)' }} />
                Edad: <strong style={{ color: 'var(--text-primary)' }}>{calculatedAge} años</strong>
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  fontWeight: '700',
                  fontSize: '11px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Listo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;
