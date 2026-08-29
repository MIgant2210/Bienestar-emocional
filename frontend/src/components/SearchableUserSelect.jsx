import React, { useState, useEffect, useRef } from 'react';
import { Search, User, X, Check, Loader, ChevronDown } from 'lucide-react';
import api from '../services/api';

export const SearchableUserSelect = ({
  value,
  onChange,
  departmentFilter,
  placeholder = "Buscar colaborador por nombre, apellido o email...",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Cargar información del usuario seleccionado si se pasa un ID o un objeto
  useEffect(() => {
    if (!value) {
      setSelectedUser(null);
      return;
    }
    if (typeof value === 'object' && value.id) {
      setSelectedUser(value);
    } else if (typeof value === 'string' && value !== 'todos') {
      // Buscar en el backend si solo tenemos el ID
      const fetchUserDetails = async () => {
        try {
          const res = await api.get('/reports/users-search', { params: { q: '', department: departmentFilter } });
          const found = res.data.users?.find(u => u.id === value);
          if (found) setSelectedUser(found);
        } catch (err) {
          console.error("Error al cargar detalles de usuario:", err);
        }
      };
      fetchUserDetails();
    }
  }, [value, departmentFilter]);

  // Búsqueda con debounce conectada a GET /api/reports/users-search
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = { q: query.trim() };
        if (departmentFilter && departmentFilter !== 'todos') {
          params.department = departmentFilter;
        }
        const res = await api.get('/reports/users-search', { params });
        setResults(res.data.users || []);
      } catch (err) {
        console.error("Error al buscar colaboradores:", err);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query, isOpen, departmentFilter]);

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (user) => {
    setSelectedUser(user);
    if (onChange) onChange(user.id, user);
    setIsOpen(false);
    setQuery('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSelectedUser(null);
    if (onChange) onChange('', null);
    setQuery('');
  };

  const handleOpen = () => {
    if (disabled) return;
    setIsOpen(true);
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 50);
  };

  return (
    <div ref={containerRef} className="searchable-user-select-container" style={{ position: 'relative', width: '100%', zIndex: isOpen ? 99999 : 10 }}>
      {/* Botón / Input de Activación */}
      <div
        onClick={handleOpen}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          backgroundColor: 'var(--bg-secondary)',
          border: isOpen ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
          borderRadius: '12px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          minHeight: '42px',
          boxShadow: isOpen ? '0 0 0 3px var(--primary-glow)' : 'none',
          transition: 'all 0.15s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', minWidth: 0, flex: 1 }}>
          <User size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          {selectedUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', minWidth: 0 }}>
              <span style={{ fontSize: '12.5px', fontWeight: '800', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selectedUser.name}
              </span>
              <span className="duo-pill" style={{ fontSize: '10px', padding: '1px 6px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: '800' }}>
                {selectedUser.department}
              </span>
            </div>
          ) : (
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {placeholder}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {selectedUser && (
            <button
              type="button"
              onClick={handleClear}
              title="Quitar usuario seleccionado"
              style={{
                border: 'none',
                background: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown size={14} style={{ color: 'var(--text-muted)', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
        </div>
      </div>

      {/* Menú Desplegable Flotante */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          backgroundColor: 'var(--bg-secondary)',
          border: '1.5px solid var(--primary)',
          borderRadius: '14px',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4)',
          zIndex: 999999,
          padding: '10px',
          display: 'grid',
          gap: '8px',
          animation: 'fadeIn 0.12s ease'
        }}>
          {/* Buscador interno */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--bg-primary)',
            padding: '6px 10px',
            borderRadius: '10px',
            border: '1px solid var(--border)'
          }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Escribe para buscar por nombre o correo..."
              style={{
                border: 'none',
                background: 'none',
                outline: 'none',
                fontSize: '12px',
                color: 'var(--text-primary)',
                width: '100%'
              }}
            />
            {loading && <Loader size={13} className="animate-spin" style={{ color: 'var(--primary)' }} />}
          </div>

          {/* Lista de Resultados */}
          <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'grid', gap: '4px' }}>
            {results.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '14px', color: 'var(--text-muted)', fontSize: '11.5px' }}>
                {loading ? 'Buscando usuarios autorizados...' : 'No se encontraron colaboradores coincidentes.'}
              </div>
            ) : (
              results.map((u) => {
                const isSelected = selectedUser?.id === u.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => handleSelect(u)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: isSelected ? 'var(--primary-light)' : 'transparent',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-primary)' }}>
                        {u.name}
                      </div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {u.email} • {u.department} • <span style={{ textTransform: 'capitalize' }}>{u.role}</span>
                      </div>
                    </div>
                    {isSelected && <Check size={14} style={{ color: 'var(--primary)' }} />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableUserSelect;
