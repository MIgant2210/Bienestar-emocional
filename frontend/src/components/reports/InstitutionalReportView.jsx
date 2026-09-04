import React, { useState } from 'react';
import {
  FileSpreadsheet, Download, Printer, RotateCcw, Calendar, Sliders,
  BarChart3, AlertTriangle, CheckSquare, Heart, Award, Users,
  ClipboardList, ShieldCheck, Sparkles, TrendingUp, Activity,
  Clock, Shield, Info, CheckCircle2, XCircle, ChevronRight, UserCheck,
  Building, User, AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from 'recharts';
import CustomDatePicker from '../CustomDatePicker';
import CustomSelect from '../CustomSelect';
import SearchableUserSelect from '../SearchableUserSelect';
import { exportReportToPDF, exportReportToExcel, exportReportToCSV, exportReportToJSON } from '../../utils/reportExportUtils';

// Paleta Oficial de Colores para Gráficas de EquilibrIA
const CHART_COLORS = {
  purple: '#7e22ce',
  lavender: '#a855f7',
  orange: '#f97316',
  cream: '#fef08a',
  green: '#10b981',
  red: '#ef4444',
  blue: '#3b82f6',
  amber: '#f59e0b',
  gray: '#94a3b8'
};

// Contenedor robusto para Recharts con detección dinámica de ancho en móviles y tablets
const AutoResponsiveContainer = ({ children, height = 260 }) => {
  const containerRef = React.useRef(null);
  const [containerWidth, setContainerWidth] = React.useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth > 0) {
      return Math.min(Math.max(window.innerWidth - 64, 280), 1200);
    }
    return 340;
  });

  React.useEffect(() => {
    if (!containerRef.current) return;

    const measure = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth || containerRef.current.getBoundingClientRect().width;
        if (w > 0) {
          setContainerWidth(Math.floor(w));
        }
      }
    };

    measure();

    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        measure();
      });
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', measure);
    const t1 = setTimeout(measure, 60);
    const t2 = setTimeout(measure, 250);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', measure);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="chart-container-responsive"
      style={{
        width: '100%',
        minWidth: 0,
        height,
        position: 'relative',
        display: 'block'
      }}
    >
      <ResponsiveContainer width={containerWidth} height={height} key={`rc-${containerWidth}`}>
        {children}
      </ResponsiveContainer>
    </div>
  );
};

export const InstitutionalReportView = ({
  allReportsData,
  loading = false,
  selectedReportId = 'reporte_1_clima',
  onSelectReport = () => {},
  filters = {},
  onFilterChange = () => {},
  onClearFilters = () => {},
  onQuickRange = () => {}
}) => {
  // Reporte seleccionado actual
  const safeReportId = selectedReportId || 'reporte_1_clima';
  const currentReport = (allReportsData && allReportsData[safeReportId]) || {};
  const appliedFilters = (allReportsData && allReportsData.filtros_aplicados) || {};
  const scopeData = (allReportsData && allReportsData.alcance) || { tipo: 'institution', etiqueta: 'Toda la institución' };
  const detailList = Array.isArray(currentReport.detalle)
    ? currentReport.detalle
    : (Array.isArray(currentReport.detalle_catalogo) ? currentReport.detalle_catalogo : []);

  // Validación de Rango de Fechas
  const isDateRangeInvalid = Boolean(
    filters.start_date &&
    filters.end_date &&
    filters.start_date > filters.end_date
  );

  // Lista de los 10 Reportes Oficiales
  const REPORT_TYPES = [
    { id: 'reporte_1_clima', code: 'EQ-REP-01', title: '1. Clima & Indicadores', Icon: BarChart3, category: 'Emocional' },
    { id: 'reporte_2_alertas', code: 'EQ-REP-02', title: '2. Alertas & Prioridades', Icon: AlertTriangle, category: 'Clínico' },
    { id: 'reporte_3_tareas', code: 'EQ-REP-03', title: '3. Cumplimiento de Tareas', Icon: CheckSquare, category: 'Gestión' },
    { id: 'reporte_4_citas', code: 'EQ-REP-04', title: '4. Citas Clínicas de Apoyo', Icon: Calendar, category: 'Clínico' },
    { id: 'reporte_5_kudos', code: 'EQ-REP-05', title: '5. Muro de Gratitud & Kudos', Icon: Heart, category: 'Cultura' },
    { id: 'reporte_6_gamificacion', code: 'EQ-REP-06', title: '6. Gamificación & XP', Icon: Award, category: 'Bienestar' },
    { id: 'reporte_7_usuarios', code: 'EQ-REP-07', title: '7. Directorio de Usuarios', Icon: Users, category: 'Institucional' },
    { id: 'reporte_8_tests', code: 'EQ-REP-08', title: '8. Tests Estandarizados', Icon: ClipboardList, category: 'Evaluación' },
    { id: 'reporte_9_auditoria', code: 'EQ-REP-09', title: '9. Auditoría de Seguridad', Icon: ShieldCheck, category: 'Seguridad' },
    { id: 'reporte_10_sugerencias', code: 'EQ-REP-10', title: '10. Estrategia de IA Gemini', Icon: Sparkles, category: 'IA & Analítica' }
  ];

  return (
    <div className="institutional-reports-module animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', minWidth: 0, overflow: 'visible' }}>
      
      {/* 1. HEADER Y BARRA DE HERRAMIENTAS PRINCIPAL */}
      <div className="glass-card" style={{ overflow: 'visible', position: 'relative', zIndex: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '19px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <FileSpreadsheet size={22} style={{ color: 'var(--primary)' }} />
              Centro de Reportes & Informes Institucionales
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Suite de 10 informes auditables con consultas parametrizadas en PostgreSQL, soporte de alcance institucional, departamental e individual.
            </p>
          </div>

          {/* Botones de Exportación Multiformato */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => exportReportToExcel(allReportsData, safeReportId)}
              className="btn btn-primary"
              title="Descargar libro oficial en Excel (.xlsx) con analíticas, KPIs y tablas formateadas"
              style={{
                padding: '8px 14px',
                fontSize: '12px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderColor: '#059669',
                color: '#ffffff'
              }}
            >
              <FileSpreadsheet size={15} /> Exportar en Excel (.xlsx)
            </button>
            <button
              type="button"
              onClick={() => exportReportToPDF(allReportsData, safeReportId)}
              className="btn btn-primary"
              title="Generar documento oficial para impresión / PDF"
              style={{ padding: '8px 14px', fontSize: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800' }}
            >
              <Printer size={15} /> Exportar en PDF
            </button>
            <button
              type="button"
              onClick={() => exportReportToCSV(allReportsData, safeReportId)}
              className="duo-pill"
              title="Descargar datos en CSV delimitado por punto y coma"
              style={{ padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <Download size={14} /> Exportar en CSV
            </button>
            <button
              type="button"
              onClick={() => exportReportToJSON(allReportsData, safeReportId)}
              className="duo-pill"
              title="Descargar estructura en JSON"
              style={{ padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <FileSpreadsheet size={14} /> Exportar en JSON
            </button>
          </div>
        </div>

        {/* 2. PANEL DE FILTROS AVANZADOS Y ALCANCE */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          padding: '18px 20px',
          marginBottom: '20px',
          display: 'grid',
          gap: '16px',
          overflow: 'visible',
          position: 'relative',
          zIndex: 100
        }}>
          {/* Fila 1: Presets de Periodo Rápido */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)' }}>
              <Calendar size={15} /> Periodos Rápidos:
            </span>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { id: 'today', label: 'Hoy' },
                { id: 'this_week', label: 'Esta Semana' },
                { id: 'last_week', label: 'Semana Anterior' },
                { id: 'last_7_days', label: 'Últimos 7 Días' },
                { id: 'last_30_days', label: 'Últimos 30 Días' },
                { id: 'this_month', label: 'Este Mes' },
                { id: 'last_month', label: 'Mes Anterior' },
                { id: 'this_year', label: 'Este Año' }
              ].map((p) => {
                const isActive = filters.quick_range === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onQuickRange(p.id)}
                    className="duo-pill"
                    style={{
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: isActive ? '900' : '600',
                      backgroundColor: isActive ? 'var(--primary)' : 'var(--bg-primary)',
                      color: isActive ? '#ffffff' : 'var(--text-secondary)',
                      borderColor: isActive ? 'var(--primary)' : 'var(--border)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={onClearFilters}
                className="duo-pill"
                style={{ padding: '4px 10px', fontSize: '11px', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RotateCcw size={12} /> Limpiar Filtros
              </button>
            </div>
          </div>

          {/* Banner de Validación de Fechas Invertidas */}
          {isDateRangeInvalid && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid #ef4444',
              borderRadius: '10px',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#ef4444',
              fontSize: '12px',
              fontWeight: '700'
            }}>
              <AlertCircle size={16} />
              <span>La fecha inicial ({filters.start_date}) no puede ser posterior a la fecha final ({filters.end_date}).</span>
            </div>
          )}

          {/* Fila 2: Controles de Filtros Dinámicos con Alcance */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px', overflow: 'visible', position: 'relative', zIndex: 100 }}>
            {/* 1. Selector de Alcance del Reporte */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                ALCANCE DEL REPORTE
              </label>
              <CustomSelect
                value={filters.scope || 'institution'}
                onChange={(val) => onFilterChange('scope', typeof val === 'string' ? val : val?.target?.value || 'institution')}
                options={[
                  { value: 'institution', label: 'Toda la institución', sublabel: 'Población general' },
                  { value: 'department', label: 'Departamento específico', sublabel: 'Segmentación departamental' },
                  { value: 'user', label: 'Usuario específico', sublabel: 'Análisis individual auditado' }
                ]}
              />
            </div>

            {/* 2. Selector Condicional de Departamento (si scope === 'department' o 'user') */}
            {(filters.scope === 'department' || filters.scope === 'user') && (
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  DEPARTAMENTO
                </label>
                <CustomSelect
                  value={filters.department || 'todos'}
                  onChange={(val) => onFilterChange('department', typeof val === 'string' ? val : val?.target?.value || 'todos')}
                  options={[
                    { value: 'todos', label: 'Todos los Departamentos' },
                    { value: 'General', label: 'General' },
                    { value: 'Recursos Humanos', label: 'Recursos Humanos' },
                    { value: 'Tecnología', label: 'Tecnología / TI' },
                    { value: 'Operaciones', label: 'Operaciones' },
                    { value: 'Ventas', label: 'Ventas' },
                    { value: 'Finanzas', label: 'Finanzas' },
                    { value: 'Salud y Apoyo', label: 'Salud y Bienestar' }
                  ]}
                />
              </div>
            )}

            {/* 3. Buscador Dinámico de Usuario Específico (si scope === 'user') */}
            {filters.scope === 'user' && (
              <div style={{ position: 'relative', zIndex: 120 }}>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  BUSCAR COLABORADOR
                </label>
                <SearchableUserSelect
                  value={filters.user_id || ''}
                  departmentFilter={filters.department}
                  onChange={(userId, userObj) => onFilterChange('user_id', userId, userObj)}
                  placeholder="Escribe nombre o email..."
                />
              </div>
            )}

            {/* 4. Fecha Inicio */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                FECHA INICIAL
              </label>
              <CustomDatePicker
                value={filters.start_date || ''}
                onChange={(val) => onFilterChange('start_date', val)}
                placeholder="Desde (YYYY-MM-DD)"
              />
            </div>

            {/* 5. Fecha Fin */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                FECHA FINAL
              </label>
              <CustomDatePicker
                value={filters.end_date || ''}
                onChange={(val) => onFilterChange('end_date', val)}
                placeholder="Hasta (YYYY-MM-DD)"
              />
            </div>

            {/* 6. Filtros Específicos por Tipo de Reporte */}
            {safeReportId === 'reporte_1_clima' && (
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  NIVEL DE RIESGO
                </label>
                <CustomSelect
                  value={filters.risk_level || 'todos'}
                  onChange={(val) => onFilterChange('risk_level', typeof val === 'string' ? val : val?.target?.value || 'todos')}
                  options={[
                    { value: 'todos', label: 'Todos los Niveles' },
                    { value: 'alto', label: 'Alto Riesgo (>= 70%)' },
                    { value: 'medio', label: 'Riesgo Moderado (40-69%)' },
                    { value: 'bajo', label: 'Riesgo Bajo (< 40%)' }
                  ]}
                />
              </div>
            )}

            {safeReportId === 'reporte_2_alertas' && (
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  ESTADO DE ALERTA
                </label>
                <CustomSelect
                  value={filters.status || 'todos'}
                  onChange={(val) => onFilterChange('status', typeof val === 'string' ? val : val?.target?.value || 'todos')}
                  options={[
                    { value: 'todos', label: 'Todos los Estados' },
                    { value: 'pendiente', label: 'Alertas Pendientes / Activas' },
                    { value: 'atendida', label: 'Alertas Atendidas / En proceso' },
                    { value: 'resuelta', label: 'Alertas Resueltas / Cerradas' }
                  ]}
                />
              </div>
            )}

            {safeReportId === 'reporte_3_tareas' && (
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  PRIORIDAD DE TAREA
                </label>
                <CustomSelect
                  value={filters.priority || 'todos'}
                  onChange={(val) => onFilterChange('priority', typeof val === 'string' ? val : val?.target?.value || 'todos')}
                  options={[
                    { value: 'todos', label: 'Todas las Prioridades' },
                    { value: 'Alta', label: 'Prioridad Alta' },
                    { value: 'Media', label: 'Prioridad Media' },
                    { value: 'Baja', label: 'Prioridad Baja' }
                  ]}
                />
              </div>
            )}

            {safeReportId === 'reporte_4_citas' && (
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  ESTADO DE CITA
                </label>
                <CustomSelect
                  value={filters.status || 'todos'}
                  onChange={(val) => onFilterChange('status', typeof val === 'string' ? val : val?.target?.value || 'todos')}
                  options={[
                    { value: 'todos', label: 'Todos los Estados' },
                    { value: 'programada', label: 'Programadas' },
                    { value: 'confirmada', label: 'Confirmadas' },
                    { value: 'completada', label: 'Completadas (Asistió)' },
                    { value: 'cancelada', label: 'Canceladas' },
                    { value: 'no_asistio', label: 'No Asistió (Ausente)' }
                  ]}
                />
              </div>
            )}

            {safeReportId === 'reporte_7_usuarios' && (
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  ROL INSTITUCIONAL
                </label>
                <CustomSelect
                  value={filters.role || 'todos'}
                  onChange={(val) => onFilterChange('role', typeof val === 'string' ? val : val?.target?.value || 'todos')}
                  options={[
                    { value: 'todos', label: 'Todos los Roles' },
                    { value: 'miembro', label: 'Miembros' },
                    { value: 'lider_depto', label: 'Líderes de Departamento' },
                    { value: 'profesional_apoyo', label: 'Profesionales de Apoyo' },
                    { value: 'admin_institucion', label: 'Administradores' }
                  ]}
                />
              </div>
            )}
          </div>
        </div>

        {/* 3. SELECTOR DE LOS 10 REPORTES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
          {REPORT_TYPES.map((r) => {
            const IconComp = r.Icon || FileSpreadsheet;
            const isSelected = safeReportId === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => onSelectReport(r.id)}
                className={`duo-card ${isSelected ? 'selected' : ''}`}
                style={{
                  padding: '10px 14px',
                  justifyContent: 'flex-start',
                  gap: '10px',
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                  backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-secondary)',
                  color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                  boxShadow: isSelected ? '0 4px 12px rgba(126, 34, 206, 0.1)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <IconComp size={17} style={{ color: isSelected ? 'var(--primary)' : 'var(--text-muted)' }} />
                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontWeight: '800', display: 'block' }}>{r.title}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{r.code} • {r.category}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. VISTA DEL INFORME INSTITUCIONAL PROFESIONAL */}
      <div className="glass-card" style={{ padding: '24px', position: 'relative', zIndex: 10 }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '12px', color: 'var(--primary)' }}>
            <Activity className="animate-spin" size={32} />
            <span style={{ fontWeight: '800', fontSize: '14px' }}>Procesando consulta en PostgreSQL...</span>
          </div>
        ) : !allReportsData ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <Info size={36} style={{ margin: '0 auto 12px auto', color: 'var(--text-muted)' }} />
            <h4 style={{ fontSize: '15px', fontWeight: '800' }}>Sin datos disponibles</h4>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>Ajusta los filtros o presiona limpiar filtros para cargar la información.</p>
          </div>
        ) : (
          <div className="report-institutional-sheet animate-fade" style={{ display: 'grid', gap: '24px' }}>
            
            {/* ENCABEZADO INSTITUCIONAL */}
            <div style={{
              borderBottom: '2px solid var(--primary)',
              paddingBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img src="/logo.png" alt="EquilibrIA" style={{ height: '48px', objectFit: 'contain' }} />
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    INFORME OFICIAL INSTITUCIONAL • CONFIDENCIAL
                  </span>
                  <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-primary)', marginTop: '2px' }}>
                    {currentReport.titulo || 'Informe Consolidado'}
                  </h2>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="duo-pill" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontWeight: '900', fontSize: '12px' }}>
                  CÓDIGO: {currentReport.codigo || safeReportId.toUpperCase()}
                </span>
                <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Emisión: {allReportsData.fecha_generacion}
                </p>
              </div>
            </div>

            {/* FICHA TÉCNICA DEL REPORTE */}
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              padding: '16px 20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px',
              fontSize: '12.5px'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontWeight: '600', display: 'block' }}>Institución Emisora:</span>
                <p style={{ fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>{allReportsData.institucion || 'EquilibrIA Central'}</p>
              </div>

              {/* ALCANCE DESTACADO */}
              <div>
                <span style={{ color: 'var(--text-muted)', fontWeight: '600', display: 'block' }}>Alcance Poblacional:</span>
                <p style={{ fontWeight: '900', color: 'var(--primary)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {scopeData.tipo === 'user' && <User size={14} />}
                  {scopeData.tipo === 'department' && <Building size={14} />}
                  {scopeData.tipo === 'institution' && <Users size={14} />}
                  <span>{scopeData.etiqueta || appliedFilters.alcance || 'Toda la institución'}</span>
                </p>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', fontWeight: '600', display: 'block' }}>Periodo de Análisis:</span>
                <p style={{ fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {appliedFilters.fecha_inicio || 'Inicio'} al {appliedFilters.fecha_fin || 'Actual'} ({appliedFilters.periodo_rapido || 'Personalizado'})
                </p>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontWeight: '600', display: 'block' }}>Estado / Condición:</span>
                <p style={{ fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>{appliedFilters.estado || 'Todos'}</p>
              </div>
            </div>

            {/* RESUMEN EJECUTIVO / INDICADORES CLAVE */}
            <div>
              <h4 style={{ fontSize: '13.5px', fontWeight: '900', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Resumen Ejecutivo de Indicadores ({scopeData.etiqueta || 'Toda la institución'})
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                {safeReportId === 'reporte_1_clima' && (
                  <>
                    <div className="futuristic-card-item">
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800' }}>ESTRÉS PROMEDIO</span>
                      <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#ef4444', marginTop: '4px' }}>
                        {currentReport.estres_promedio !== null ? `${currentReport.estres_promedio}%` : 'Sin datos suficientes'}
                      </h3>
                    </div>
                    <div className="futuristic-card-item">
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800' }}>MOTIVACIÓN PROMEDIO</span>
                      <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#10b981', marginTop: '4px' }}>
                        {currentReport.motivacion_promedio !== null ? `${currentReport.motivacion_promedio}%` : 'Sin datos suficientes'}
                      </h3>
                    </div>
                    <div className="futuristic-card-item">
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800' }}>RIESGO DE BURNOUT</span>
                      <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#f59e0b', marginTop: '4px' }}>
                        {currentReport.burnout_promedio !== null ? `${currentReport.burnout_promedio}%` : 'Sin datos suficientes'}
                      </h3>
                    </div>
                    <div className="futuristic-card-item">
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800' }}>TOTAL EVALUACIONES</span>
                      <h3 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--primary)', marginTop: '4px' }}>
                        {currentReport.total_reflexiones || 0}
                      </h3>
                    </div>
                  </>
                )}

                {safeReportId === 'reporte_2_alertas' && (
                  <>
                    <div className="futuristic-card-item">
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800' }}>TOTAL ALERTAS</span>
                      <h3 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--primary)', marginTop: '4px' }}>{currentReport.total_alertas || 0}</h3>
                    </div>
                    <div className="futuristic-card-item">
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800' }}>ALERTAS ACTIVAS</span>
                      <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#ef4444', marginTop: '4px' }}>{currentReport.activas || 0}</h3>
                    </div>
                    <div className="futuristic-card-item">
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800' }}>ALERTAS ATENDIDAS</span>
                      <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#10b981', marginTop: '4px' }}>{currentReport.atendidas || 0}</h3>
                    </div>
                    <div className="futuristic-card-item">
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800' }}>TIEMPO PROMEDIO ATENCIÓN</span>
                      <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#3b82f6', marginTop: '6px' }}>
                        {currentReport.tiempo_promedio_horas !== null ? `${currentReport.tiempo_promedio_horas} hrs` : 'Sin datos suficientes'}
                      </h3>
                    </div>
                  </>
                )}

                {safeReportId === 'reporte_3_tareas' && (
                  <>
                    <div className="futuristic-card-item">
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800' }}>TOTAL TAREAS</span>
                      <h3 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--primary)', marginTop: '4px' }}>{currentReport.total_tareas || 0}</h3>
                    </div>
                    <div className="futuristic-card-item">
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800' }}>COMPLETADAS</span>
                      <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#10b981', marginTop: '4px' }}>{currentReport.completadas || 0}</h3>
                    </div>
                    <div className="futuristic-card-item">
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800' }}>PENDIENTES</span>
                      <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#f59e0b', marginTop: '4px' }}>{currentReport.pendientes || 0}</h3>
                    </div>
                    <div className="futuristic-card-item">
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800' }}>% CUMPLIMIENTO</span>
                      <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#10b981', marginTop: '4px' }}>
                        {currentReport.porcentaje_cumplimiento !== null ? `${currentReport.porcentaje_cumplimiento}%` : 'Sin datos'}
                      </h3>
                    </div>
                  </>
                )}

                {safeReportId === 'reporte_4_citas' && (
                  <>
                    <div className="futuristic-card-item">
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800' }}>TOTAL CITAS</span>
                      <h3 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--primary)', marginTop: '4px' }}>{currentReport.total_citas || 0}</h3>
                    </div>
                    <div className="futuristic-card-item">
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800' }}>PROGRAMADAS</span>
                      <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#3b82f6', marginTop: '4px' }}>{currentReport.programadas || 0}</h3>
                    </div>
                    <div className="futuristic-card-item">
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800' }}>COMPLETADAS</span>
                      <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#10b981', marginTop: '4px' }}>{currentReport.completadas || 0}</h3>
                    </div>
                    <div className="futuristic-card-item">
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800' }}>% ASISTENCIA</span>
                      <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#10b981', marginTop: '4px' }}>
                        {currentReport.porcentaje_asistencia !== null ? `${currentReport.porcentaje_asistencia}%` : 'Sin datos'}
                      </h3>
                    </div>
                  </>
                )}

                {safeReportId !== 'reporte_1_clima' && safeReportId !== 'reporte_2_alertas' && safeReportId !== 'reporte_3_tareas' && safeReportId !== 'reporte_4_citas' && (
                  <>
                    <div className="futuristic-card-item">
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800' }}>REGISTROS FILTRADOS</span>
                      <h3 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--primary)', marginTop: '4px' }}>{detailList.length}</h3>
                    </div>
                    <div className="futuristic-card-item">
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800' }}>ESTADO DE AUDITORÍA</span>
                      <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#10b981', marginTop: '8px' }}>AUDITADO OK</h3>
                    </div>
                    <div className="futuristic-card-item">
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800' }}>VALIDEZ INSTITUCIONAL</span>
                      <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--primary)', marginTop: '8px' }}>VIGENTE</h3>
                    </div>
                    <div className="futuristic-card-item">
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '800' }}>NIVEL DE PRIVACIDAD</span>
                      <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#f59e0b', marginTop: '8px' }}>CONFIDENCIAL (RBAC)</h3>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* SECCIÓN DE ANÁLISIS GRÁFICO (RECHARTS) */}
            {safeReportId === 'reporte_1_clima' && currentReport.evolucion_temporal?.length > 0 && (
              <div className="glass-card" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border)', padding: '20px 14px', width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <TrendingUp size={16} style={{ color: 'var(--primary)' }} /> Evolución Temporal del Clima Emocional ({scopeData.etiqueta})
                </h4>
                <AutoResponsiveContainer height={260}>
                  <LineChart
                    data={currentReport.evolucion_temporal}
                    margin={{ top: 10, right: 15, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                    <XAxis dataKey="fecha" stroke="var(--text-muted)" fontSize={11} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '12px' }} />
                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="estres" name="Estrés Promedio (%)" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="motivacion" name="Motivación (%)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="burnout" name="Burnout (%)" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
                  </LineChart>
                </AutoResponsiveContainer>
              </div>
            )}

            {safeReportId === 'reporte_1_clima' && scopeData.tipo !== 'user' && currentReport.distribucion_departamentos?.length > 0 && (
              <div className="glass-card" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border)', padding: '20px 14px', width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BarChart3 size={16} style={{ color: 'var(--primary)' }} /> Comparativo de Indicadores por Departamento
                </h4>
                <AutoResponsiveContainer height={260}>
                  <BarChart
                    data={currentReport.distribucion_departamentos}
                    margin={{ top: 10, right: 15, left: -20, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                    <XAxis dataKey="departamento" stroke="var(--text-muted)" fontSize={10} interval={0} angle={-15} textAnchor="end" />
                    <YAxis stroke="var(--text-muted)" fontSize={11} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '12px' }} />
                    <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="estres" name="Estrés (%)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="motivacion" name="Motivación (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="burnout" name="Burnout (%)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </AutoResponsiveContainer>
              </div>
            )}

            {/* TABLA CON EL DETALLE CONSOLIDADO */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border)', padding: '18px', overflowX: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-primary)' }}>
                  Detalle Consolidado de Registros en el Reporte ({detailList.length} registros)
                </h4>
                <span className="duo-pill" style={{ fontSize: '11px' }}>
                  {scopeData.etiqueta || 'Institución'}
                </span>
              </div>

              {detailList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
                  <Info size={28} style={{ margin: '0 auto 8px auto', opacity: 0.6 }} />
                  <p style={{ fontSize: '13.5px', fontWeight: '700' }}>Sin resultados para los filtros seleccionados.</p>
                  <button
                    type="button"
                    onClick={onClearFilters}
                    className="btn btn-primary"
                    style={{ marginTop: '12px', padding: '6px 14px', fontSize: '12px', borderRadius: '10px' }}
                  >
                    Limpiar Filtros
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', minWidth: '600px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '10px 12px' }}>#</th>
                        <th style={{ padding: '10px 12px' }}>CONCEPTO / REGISTRO</th>
                        <th style={{ padding: '10px 12px' }}>DEPARTAMENTO / CATEGORÍA</th>
                        <th style={{ padding: '10px 12px' }}>ESTADO / CONDICIÓN</th>
                        <th style={{ padding: '10px 12px' }}>FECHA DE REGISTRO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailList.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '10px 12px', fontWeight: '700', color: 'var(--text-muted)' }}>{idx + 1}</td>
                          <td style={{ padding: '10px 12px', fontWeight: '700', color: 'var(--text-primary)' }}>
                            {item.title || item.titulo || item.usuario || item.paciente || item.destinatario || item.nombre_completo || item.accion || item.recomendacion || item.nombre || `Registro #${idx + 1}`}
                          </td>
                          <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                            {item.departamento || item.categoria || item.departamento_origen || item.rol || 'General'}
                          </td>
                          <td style={{ padding: '10px 12px' }}>
                            <span className="duo-pill" style={{
                              padding: '2px 8px',
                              fontSize: '10.5px',
                              fontWeight: '800',
                              backgroundColor: (item.estado === 'Completada' || item.estado === 'ACTIVO' || item.estado === 'completada') ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-primary)',
                              color: (item.estado === 'Completada' || item.estado === 'ACTIVO' || item.estado === 'completada') ? '#10b981' : 'var(--text-primary)'
                            }}>
                              {item.estado || item.prioridad || item.tipo_insignia || item.sentimiento || 'Vigente'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>
                            {item.fecha || item.fecha_creacion || item.fecha_hora || item.fecha_registro
                              ? new Date(item.fecha || item.fecha_creacion || item.fecha_hora || item.fecha_registro).toLocaleDateString()
                              : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* OBSERVACIONES ANALÍTICAS */}
            <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '14px', border: '1px solid var(--border)', padding: '16px 20px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '8px', textTransform: 'uppercase' }}>
                Observaciones y Conclusiones del Periodo ({scopeData.etiqueta})
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.55', margin: 0 }}>
                {currentReport.observaciones || 'Se recopilaron los datos del periodo seleccionado conforme a los protocolos institucionales de auditoría y análisis de bienestar.'}
              </p>
              {currentReport.nota_aclaratoria && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '8px', fontStyle: 'italic' }}>
                  <Info size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  <span>{currentReport.nota_aclaratoria}</span>
                </div>
              )}
            </div>

            {/* CLÁUSULA DE CONFIDENCIALIDAD Y RESPONSABLE */}
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '16px',
              border: '1.5px solid var(--border)',
              padding: '20px 24px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '20px',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  EMISIÓN ELECTRÓNICA & GOBERNANZA DE DATOS (RBAC)
                </span>
                <div style={{ marginTop: '16px', borderTop: '2px solid var(--primary)', paddingTop: '10px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>
                    Documento generado electrónicamente por EquilibrIA
                  </p>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '3px' }}>
                    Sistema de Gestión de Bienestar Integral & Analítica Institucional
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Fecha y hora de emisión: {allReportsData.fecha_generacion}
                  </p>
                </div>
              </div>

              <div style={{
                border: '1.5px dashed var(--primary)',
                borderRadius: '14px',
                padding: '16px',
                textAlign: 'center',
                backgroundColor: 'var(--primary-light)'
              }}>
                <ShieldCheck size={26} style={{ color: 'var(--primary)', margin: '0 auto 6px auto' }} />
                <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--primary)', display: 'block', textTransform: 'uppercase' }}>
                  VALIDACIÓN Y CONFIDENCIALIDAD
                </span>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
                  La información de este reporte ha sido validada conforme a las directrices de privacidad y control de acceso basado en roles ({scopeData.etiqueta}).
                </p>
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
};

export default InstitutionalReportView;
