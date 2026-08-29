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
    return { ...opt, value: String(opt.value), label: opt.label || String(opt.value) };
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
    <div ref={containerRef} className="custom-select-container" style={{ position: 'relative', width: '100%', zIndex: isOpen ? 99999 : 1, overflow: 'visible', ...style }}>
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
          padding: '10px 14px',
          backgroundColor: 'var(--bg-secondary)',
          color: selectedOption ? 'var(--text-primary)' : 'var(--text-muted)',
          border: isOpen ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
          borderRadius: '12px',
          boxShadow: isOpen ? '0 0 0 3px var(--primary-glow)' : 'none',
          fontSize: '12.5px',
          fontWeight: '700',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s ease',
          opacity: disabled ? 0.6 : 1,
          height: '42px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', minWidth: 0 }}>
          {Icon && <Icon size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />}
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '12.5px' }}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown 
          size={15} 
          style={{ 
            color: 'var(--text-muted)', 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            flexShrink: 0,
            marginLeft: '6px'
          }} 
        />
      </button>

      {/* Menú Desplegable Flotante */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          minWidth: '220px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1.5px solid var(--primary)',
          borderRadius: '14px',
          boxShadow: '0 18px 45px rgba(0, 0, 0, 0.35)',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.12s ease'
        }}>
          {/* Barra de búsqueda solo si hay más de 6 opciones */}
          {normalizedOptions.length > 6 && (
            <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-secondary)', padding: '5px 10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <Search size={13} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ border: 'none', background: 'none', padding: 0, fontSize: '11.5px', outline: 'none', width: '100%', color: 'var(--text-primary)' }}
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Opciones */}
          <div style={{ overflowY: 'auto', padding: '5px', maxHeight: '220px' }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '11.5px' }}>
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
                      e.preventDefault();
                    }}
                    onClick={() => handleSelectOption(opt.value)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: isSelected ? 'var(--primary-light)' : 'transparent',
                      color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: isSelected ? '800' : '600',
                      transition: 'background-color 0.12s ease',
                      marginBottom: '2px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      {opt.icon && <span style={{ fontSize: '14px' }}>{opt.icon}</span>}
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{opt.label}</div>
                        {opt.sublabel && <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{opt.sublabel}</div>}
                      </div>
                    </div>
                    {isSelected && <Check size={14} style={{ color: 'var(--primary)', flexShrink: 0, marginLeft: '6px' }} />}
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
