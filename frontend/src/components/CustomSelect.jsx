import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

const CustomSelect = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = "Seleccionar opción...", 
  icon: Icon,
  disabled = false,
  style = {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Formatear las opciones (pueden ser strings, números u objetos {value, label, icon, sublabel})
  const normalizedOptions = options.map(opt => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { value: String(opt), label: String(opt) };
    }
    return { ...opt, value: String(opt.value) };
  });

  const selectedOption = normalizedOptions.find(opt => {
    if (value === null || value === undefined) return false;
    const currVal = typeof value === 'object' && value.target ? String(value.target.value) : String(value);
    return String(opt.value) === currVal;
  });

  const filteredOptions = normalizedOptions.filter(opt =>
    (opt.label && String(opt.label).toLowerCase().includes(searchQuery.toLowerCase())) ||
    (opt.sublabel && String(opt.sublabel).toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelectOption = (optVal) => {
    if (typeof onChange === 'function') {
      try {
        onChange(optVal);
      } catch (err) {
        console.error('Error al actualizar CustomSelect:', err);
      }
    }
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', zIndex: isOpen ? 1000 : 1, ...style }}>
      {/* Botón Principal del Selector */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '11px 16px',
          backgroundColor: 'var(--bg-secondary)',
          color: selectedOption ? 'var(--text-primary)' : 'var(--text-muted)',
          border: isOpen ? '2px solid var(--primary)' : '1.5px solid var(--border)',
          borderRadius: '14px',
          boxShadow: isOpen ? '0 0 0 4px var(--primary-glow)' : 'var(--shadow-sm)',
          fontSize: '13px',
          fontWeight: '700',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          opacity: disabled ? 0.6 : 1
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
          {Icon && <Icon size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />}
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown 
          size={16} 
          style={{ 
            color: 'var(--primary)', 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s ease',
            flexShrink: 0 
          }} 
        />
      </button>

      {/* Menú Desplegable Flotante */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          backgroundColor: 'var(--bg-secondary)',
          border: '2px solid var(--primary)',
          borderRadius: '16px',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.45)',
          zIndex: 10001,
          maxHeight: '260px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeIn 0.15s ease'
        }}>
          {/* Barra de búsqueda si hay más de 4 opciones */}
          {normalizedOptions.length > 4 && (
            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-tertiary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-primary)', padding: '6px 12px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <Search size={14} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Buscar opción..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ border: 'none', background: 'none', padding: 0, fontSize: '12px', outline: 'none', width: '100%', color: 'var(--text-primary)' }}
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Opciones */}
          <div style={{ overflowY: 'auto', padding: '6px', maxHeight: '200px' }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '14px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                No se encontraron opciones.
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selectedOption && selectedOption.value === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onMouseDown={(e) => {
                      // Evitar que mousedown en document cierre antes de procesar el clic
                      e.preventDefault();
                    }}
                    onClick={() => handleSelectOption(opt.value)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      backgroundColor: isSelected ? 'var(--primary-light)' : 'transparent',
                      color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '12.5px',
                      fontWeight: isSelected ? '800' : '600',
                      transition: 'background-color 0.15s ease',
                      marginBottom: '2px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {opt.icon && <span style={{ fontSize: '16px' }}>{opt.icon}</span>}
                      <div>
                        <div>{opt.label}</div>
                        {opt.sublabel && <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{opt.sublabel}</div>}
                      </div>
                    </div>
                    {isSelected && <Check size={15} style={{ color: 'var(--primary)' }} />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
