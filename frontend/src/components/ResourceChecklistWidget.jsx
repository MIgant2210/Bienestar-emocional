import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, CheckCircle2, Award, Sparkles } from 'lucide-react';

const ResourceChecklistWidget = ({ data, initialAnswers = {}, onSaveAnswers, onComplete }) => {
  const items = data?.items || [];
  const [checkedIds, setCheckedIds] = useState(initialAnswers?.checklist_checks || []);

  useEffect(() => {
    if (initialAnswers?.checklist_checks) {
      setCheckedIds(initialAnswers.checklist_checks);
    }
  }, [initialAnswers]);

  const toggleItem = (id) => {
    const newChecks = checkedIds.includes(id)
      ? checkedIds.filter(item => item !== id)
      : [...checkedIds, id];

    setCheckedIds(newChecks);
    if (onSaveAnswers) {
      onSaveAnswers({ checklist_checks: newChecks });
    }
  };

  const totalCount = items.length;
  const checkedCount = checkedIds.length;
  const percent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;
  const isAllChecked = totalCount > 0 && checkedCount === totalCount;

  return (
    <div style={{
      backgroundColor: 'var(--bg-primary)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '20px',
      margin: '16px 0',
      display: 'grid',
      gap: '14px'
    }} role="region" aria-label="Checklist interactivo de bienestar">
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckSquare size={18} style={{ color: 'var(--primary)' }} />
          <h4 style={{ fontSize: '14.5px', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>
            Hábitos y Puntos de Verificación
          </h4>
        </div>
        <div style={{ fontSize: '12px', fontWeight: '800', color: percent >= 100 ? 'var(--success)' : 'var(--primary)' }}>
          {checkedCount} de {totalCount} ({percent}%)
        </div>
      </div>

      {/* Barra de Progreso del Checklist */}
      <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${percent}%`,
          backgroundColor: percent >= 100 ? 'var(--success)' : 'var(--primary)',
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* Lista de Ítems */}
      <div style={{ display: 'grid', gap: '8px' }}>
        {items.map(item => {
          const isChecked = checkedIds.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '10px',
                backgroundColor: isChecked ? 'var(--primary-light)' : 'var(--bg-secondary)',
                border: '1px solid',
                borderColor: isChecked ? 'var(--primary)' : 'var(--border)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                userSelect: 'none'
              }}
            >
              <div style={{ color: isChecked ? 'var(--primary)' : 'var(--text-muted)' }}>
                {isChecked ? <CheckCircle2 size={18} /> : <Square size={18} />}
              </div>
              <span style={{
                fontSize: '13px',
                color: isChecked ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: isChecked ? '700' : '500',
                textDecoration: isChecked ? 'line-through' : 'none'
              }}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Botón de Guardar / Completar */}
      {isAllChecked && onComplete && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
          <button
            type="button"
            onClick={onComplete}
            className="btn btn-primary"
            style={{ padding: '8px 18px', borderRadius: '10px', fontSize: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Sparkles size={14} />
            <span>Completar Checklist (+XP)</span>
          </button>
        </div>
      )}

    </div>
  );
};

export default ResourceChecklistWidget;
