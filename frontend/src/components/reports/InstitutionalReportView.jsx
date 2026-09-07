import React, { useState } from 'react';
import {
  FileSpreadsheet, Download, Printer, RotateCcw, Calendar, Sliders,
  BarChart3, AlertTriangle, CheckSquare, Heart, Award, Users,
  ClipboardList, ShieldCheck, Sparkles, TrendingUp, Activity,
  Clock, Shield, Info, CheckCircle2, XCircle, ChevronRight, ChevronLeft, UserCheck,
  Building, User, AlertCircle, Tv, Maximize2, Minimize2
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

  // Modo Presentación para Juntas Ejecutivas (Estilo Diapositivas / PowerPoint)
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideTablePage, setSlideTablePage] = useState(0);
  const [showAllInSlide, setShowAllInSlide] = useState(false);

  // Reiniciar diapositiva y paginador al cambiar de reporte o diapositiva
  React.useEffect(() => {
    setCurrentSlide(0);
    setSlideTablePage(0);
    setShowAllInSlide(false);
  }, [safeReportId]);

  React.useEffect(() => {
    setSlideTablePage(0);
  }, [currentSlide]);

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPresentationMode) return;
      if (e.key === 'Escape') {
        setIsPresentationMode(false);
      } else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        setCurrentSlide((prev) => Math.min(prev + 1, 4));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresentationMode]);

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

  // Títulos oficiales de las 5 diapositivas estilo PowerPoint
  const SLIDE_TITLES = [
    'Portada Institucional & Ficha',
    'Resumen de Indicadores Clave',
    'Visualización Analítica & Gráfica',
    'Muestra de Registros Auditados',
    'Conclusiones & Validación RBAC'
  ];

  // RENDERIZADO DE LAS DIAPOSITIVAS DEL MODO PROYECTOR
  const renderPresentationDeck = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '14px', color: 'var(--primary)' }}>
          <Activity className="animate-spin" size={38} />
          <span style={{ fontWeight: '800', fontSize: '16px' }}>Cargando diapositivas ejecutivas...</span>
        </div>
      );
    }

    if (!allReportsData) {
      return (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Info size={40} style={{ margin: '0 auto 12px auto' }} />
          <h4 style={{ fontSize: '17px', fontWeight: '800' }}>Sin datos disponibles para proyectar</h4>
        </div>
      );
    }

    const currentTypeInfo = REPORT_TYPES.find((r) => r.id === safeReportId) || REPORT_TYPES[0];

    // Conteo para gráfico dinámico de distribución si no es Clima ni Alertas
    const countMap = {};
    detailList.forEach((item) => {
      const key = item.departamento || item.categoria || item.rol || item.tipo || item.prioridad || 'General';
      countMap[key] = (countMap[key] || 0) + 1;
    });
    const summaryChartData = Object.entries(countMap)
      .map(([name, total]) => ({
        name: name.length > 18 ? name.substring(0, 16) + '...' : name,
        total
      }))
      .slice(0, 8);

    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', width: '100%', minHeight: 'calc(100vh - 180px)', justifyContent: 'space-between' }}>
        {/* Flecha Flotante Izquierda */}
        <button
          type="button"
          onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
          disabled={currentSlide === 0}
          aria-label="Diapositiva anterior"
          style={{
            position: 'fixed',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1000,
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-secondary)',
            border: '1.5px solid var(--border)',
            color: currentSlide > 0 ? 'var(--primary)' : 'var(--text-muted)',
            opacity: currentSlide > 0 ? 1 : 0.25,
            cursor: currentSlide > 0 ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            transition: 'all 0.2s ease'
          }}
        >
          <ChevronLeft size={28} />
        </button>

        {/* Flecha Flotante Derecha */}
        <button
          type="button"
          onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, 4))}
          disabled={currentSlide === 4}
          aria-label="Diapositiva siguiente"
          style={{
            position: 'fixed',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1000,
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-secondary)',
            border: '1.5px solid var(--border)',
            color: currentSlide < 4 ? 'var(--primary)' : 'var(--text-muted)',
            opacity: currentSlide < 4 ? 1 : 0.25,
            cursor: currentSlide < 4 ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            transition: 'all 0.2s ease'
          }}
        >
          <ChevronRight size={28} />
        </button>

        {/* CONTENEDOR DE LA DIAPOSITIVA ACTIVA (CANVAS ESTILO SLIDE) */}
        <div style={{
          flex: 1,
          maxWidth: '1240px',
          width: '100%',
          margin: '0 auto',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '24px',
          border: '1.5px solid var(--border)',
          padding: '36px 42px',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '520px',
          boxSizing: 'border-box'
        }}>
          {/* SLIDE 0: PORTADA INSTITUCIONAL & FICHA TÉCNICA */}
          {currentSlide === 0 && (
            <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--primary)', paddingBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <img src="/logo.png" alt="EquilibrIA" style={{ height: '52px', objectFit: 'contain' }} />
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                      INFORME OFICIAL INSTITUCIONAL • PRESENTACIÓN EJECUTIVA
                    </span>
                    <h1 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-primary)', margin: '4px 0 0 0' }}>
                      {currentReport.titulo || 'Informe Consolidado'}
                    </h1>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '900', color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '6px 14px', borderRadius: '12px' }}>
                    {currentTypeInfo.code} • {currentTypeInfo.category}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Emisión: {allReportsData.fecha_generacion}
                  </span>
                </div>
              </div>

              {/* Ficha Técnica de 4 Tarjetas */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '18px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                    Alcance del Análisis
                  </span>
                  <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--primary)', marginTop: '6px' }}>
                    {scopeData.etiqueta || 'Toda la institución'}
                  </h3>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px', display: 'block' }}>
                    Población auditada en la muestra
                  </span>
                </div>

                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '18px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                    Periodo Evaluado
                  </span>
                  <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-primary)', marginTop: '6px' }}>
                    {appliedFilters.fecha_inicio || 'Inicio'} al {appliedFilters.fecha_fin || 'Actual'}
                  </h3>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px', display: 'block' }}>
                    {appliedFilters.periodo_rapido ? `Preset: ${appliedFilters.periodo_rapido}` : 'Rango personalizado'}
                  </span>
                </div>

                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '18px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                    Total de Registros
                  </span>
                  <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#10b981', marginTop: '2px' }}>
                    {detailList.length}
                  </h3>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'block' }}>
                    Registros procesados y consolidados
                  </span>
                </div>

                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '18px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                    Protocolo de Privacidad
                  </span>
                  <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#f59e0b', marginTop: '6px' }}>
                    CONFIDENCIAL (RBAC)
                  </h3>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px', display: 'block' }}>
                    Acceso protegido según rol activo
                  </span>
                </div>
              </div>

              {/* Mensaje Informativo & Guía de Navegación */}
              <div style={{ backgroundColor: 'var(--primary-light)', borderRadius: '16px', padding: '18px 22px', border: '1.5px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Sparkles size={24} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '900', color: 'var(--primary)' }}>
                      Presentación Interactiva para Comités y Juntas
                    </h4>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                      Navega con las flechas laterales, los botones inferiores o usando las teclas ← y → de tu teclado.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentSlide(1)}
                  className="btn btn-primary"
                  style={{ padding: '8px 18px', fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  Ver Resumen de KPIs <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* SLIDE 1: RESUMEN EJECUTIVO DE INDICADORES (KPIS) */}
          {currentSlide === 1 && (
            <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: '20px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  DIAPOSITIVA 2 • INDICADORES CLAVE
                </span>
                <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-primary)', margin: '4px 0 0 0' }}>
                  Resumen Ejecutivo de Indicadores ({scopeData.etiqueta || 'Toda la institución'})
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Métricas de alto impacto calculadas en tiempo real para el periodo seleccionado.
                </p>
              </div>

              {/* Tarjetas Gigantes de KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '18px' }}>
                {safeReportId === 'reporte_1_clima' && (
                  <>
                    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '24px', borderRadius: '20px', border: '1.5px solid #ef4444', textAlign: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>ESTRÉS PROMEDIO</span>
                      <h2 style={{ fontSize: '44px', fontWeight: '900', color: '#ef4444', margin: '10px 0' }}>
                        {currentReport.estres_promedio !== null ? `${currentReport.estres_promedio}%` : 'S/D'}
                      </h2>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: '600' }}>Nivel de tensión percibida</span>
                    </div>

                    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '24px', borderRadius: '20px', border: '1.5px solid #10b981', textAlign: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>MOTIVACIÓN PROMEDIO</span>
                      <h2 style={{ fontSize: '44px', fontWeight: '900', color: '#10b981', margin: '10px 0' }}>
                        {currentReport.motivacion_promedio !== null ? `${currentReport.motivacion_promedio}%` : 'S/D'}
                      </h2>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: '600' }}>Compromiso y energía</span>
                    </div>

                    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '24px', borderRadius: '20px', border: '1.5px solid #f59e0b', textAlign: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>RIESGO DE BURNOUT</span>
                      <h2 style={{ fontSize: '44px', fontWeight: '900', color: '#f59e0b', margin: '10px 0' }}>
                        {currentReport.burnout_promedio !== null ? `${currentReport.burnout_promedio}%` : 'S/D'}
                      </h2>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: '600' }}>Probabilidad de agotamiento</span>
                    </div>

                    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '24px', borderRadius: '20px', border: '1.5px solid var(--primary)', textAlign: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>TOTAL EVALUACIONES</span>
                      <h2 style={{ fontSize: '44px', fontWeight: '900', color: 'var(--primary)', margin: '10px 0' }}>
                        {currentReport.total_reflexiones || 0}
                      </h2>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: '600' }}>Reflexiones emocionales emitidas</span>
                    </div>
                  </>
                )}

                {safeReportId === 'reporte_2_alertas' && (
                  <>
                    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '24px', borderRadius: '20px', border: '1.5px solid var(--primary)', textAlign: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>TOTAL ALERTAS</span>
                      <h2 style={{ fontSize: '44px', fontWeight: '900', color: 'var(--primary)', margin: '10px 0' }}>{currentReport.total_alertas || 0}</h2>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: '600' }}>Registradas en el periodo</span>
                    </div>
                    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '24px', borderRadius: '20px', border: '1.5px solid #ef4444', textAlign: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>ALERTAS ACTIVAS</span>
                      <h2 style={{ fontSize: '44px', fontWeight: '900', color: '#ef4444', margin: '10px 0' }}>{currentReport.activas || 0}</h2>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: '600' }}>Requieren intervención</span>
                    </div>
                    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '24px', borderRadius: '20px', border: '1.5px solid #10b981', textAlign: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>ALERTAS ATENDIDAS</span>
                      <h2 style={{ fontSize: '44px', fontWeight: '900', color: '#10b981', margin: '10px 0' }}>{currentReport.atendidas || 0}</h2>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: '600' }}>Gestionadas exitosamente</span>
                    </div>
                    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '24px', borderRadius: '20px', border: '1.5px solid #3b82f6', textAlign: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>TIEMPO ATENCIÓN</span>
                      <h2 style={{ fontSize: '38px', fontWeight: '900', color: '#3b82f6', margin: '12px 0' }}>
                        {currentReport.tiempo_promedio_horas !== null ? `${currentReport.tiempo_promedio_horas}h` : 'S/D'}
                      </h2>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: '600' }}>Promedio de respuesta</span>
                    </div>
                  </>
                )}

                {safeReportId === 'reporte_3_tareas' && (
                  <>
                    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '24px', borderRadius: '20px', border: '1.5px solid var(--primary)', textAlign: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>TOTAL TAREAS</span>
                      <h2 style={{ fontSize: '44px', fontWeight: '900', color: 'var(--primary)', margin: '10px 0' }}>{currentReport.total_tareas || 0}</h2>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: '600' }}>Tareas asignadas</span>
                    </div>
                    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '24px', borderRadius: '20px', border: '1.5px solid #10b981', textAlign: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>COMPLETADAS</span>
                      <h2 style={{ fontSize: '44px', fontWeight: '900', color: '#10b981', margin: '10px 0' }}>{currentReport.completadas || 0}</h2>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: '600' }}>Entregadas a tiempo</span>
                    </div>
                    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '24px', borderRadius: '20px', border: '1.5px solid #f59e0b', textAlign: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>PENDIENTES</span>
                      <h2 style={{ fontSize: '44px', fontWeight: '900', color: '#f59e0b', margin: '10px 0' }}>{currentReport.pendientes || 0}</h2>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: '600' }}>En progreso o retraso</span>
                    </div>
                    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '24px', borderRadius: '20px', border: '1.5px solid #10b981', textAlign: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>% CUMPLIMIENTO</span>
                      <h2 style={{ fontSize: '44px', fontWeight: '900', color: '#10b981', margin: '10px 0' }}>
                        {currentReport.porcentaje_cumplimiento !== null ? `${currentReport.porcentaje_cumplimiento}%` : '0%'}
                      </h2>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: '600' }}>Tasa de efectividad</span>
                    </div>
                  </>
                )}

                {safeReportId === 'reporte_4_citas' && (
                  <>
                    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '24px', borderRadius: '20px', border: '1.5px solid var(--primary)', textAlign: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>TOTAL CITAS</span>
                      <h2 style={{ fontSize: '44px', fontWeight: '900', color: 'var(--primary)', margin: '10px 0' }}>{currentReport.total_citas || 0}</h2>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: '600' }}>Sesiones agendadas</span>
                    </div>
                    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '24px', borderRadius: '20px', border: '1.5px solid #3b82f6', textAlign: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>PROGRAMADAS</span>
                      <h2 style={{ fontSize: '44px', fontWeight: '900', color: '#3b82f6', margin: '10px 0' }}>{currentReport.programadas || 0}</h2>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: '600' }}>Próximas sesiones</span>
                    </div>
                    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '24px', borderRadius: '20px', border: '1.5px solid #10b981', textAlign: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>COMPLETADAS</span>
                      <h2 style={{ fontSize: '44px', fontWeight: '900', color: '#10b981', margin: '10px 0' }}>{currentReport.completadas || 0}</h2>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: '600' }}>Sesiones concluidas</span>
                    </div>
                    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '24px', borderRadius: '20px', border: '1.5px solid #10b981', textAlign: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>% ASISTENCIA</span>
                      <h2 style={{ fontSize: '44px', fontWeight: '900', color: '#10b981', margin: '10px 0' }}>
                        {currentReport.porcentaje_asistencia !== null ? `${currentReport.porcentaje_asistencia}%` : '0%'}
                      </h2>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: '600' }}>Adherencia a programas</span>
                    </div>
                  </>
                )}

                {safeReportId !== 'reporte_1_clima' && safeReportId !== 'reporte_2_alertas' && safeReportId !== 'reporte_3_tareas' && safeReportId !== 'reporte_4_citas' && (
                  <>
                    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '24px', borderRadius: '20px', border: '1.5px solid var(--primary)', textAlign: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>REGISTROS TOTALES</span>
                      <h2 style={{ fontSize: '44px', fontWeight: '900', color: 'var(--primary)', margin: '10px 0' }}>{detailList.length}</h2>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: '600' }}>Filtrados para el alcance</span>
                    </div>
                    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '24px', borderRadius: '20px', border: '1.5px solid #10b981', textAlign: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>ESTADO AUDITORÍA</span>
                      <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#10b981', margin: '20px 0' }}>AUDITADO OK</h2>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: '600' }}>Trazabilidad validada</span>
                    </div>
                    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '24px', borderRadius: '20px', border: '1.5px solid var(--primary)', textAlign: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>VALIDEZ</span>
                      <h2 style={{ fontSize: '26px', fontWeight: '900', color: 'var(--primary)', margin: '20px 0' }}>VIGENTE</h2>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: '600' }}>Parámetros actualizados</span>
                    </div>
                    <div style={{ backgroundColor: 'var(--bg-primary)', padding: '24px', borderRadius: '20px', border: '1.5px solid #f59e0b', textAlign: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>PRIVACIDAD</span>
                      <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#f59e0b', margin: '20px 0' }}>RBAC SEGURO</h2>
                      <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: '600' }}>Control de acceso estricto</span>
                    </div>
                  </>
                )}
              </div>

              {/* Banner de Diagnóstico */}
              <div style={{ backgroundColor: 'var(--bg-primary)', padding: '14px 20px', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Diagnóstico Ejecutivo:</strong> Los indicadores analizados se encuentran debidamente auditados en PostgreSQL y reflejan el comportamiento poblacional del alcance seleccionado.
                </span>
              </div>
            </div>
          )}

          {/* SLIDE 2: VISUALIZACIÓN ANALÍTICA & GRÁFICA INTERACTIVA */}
          {currentSlide === 2 && (
            <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  DIAPOSITIVA 3 • VISUALIZACIÓN ANALÍTICA
                </span>
                <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-primary)', margin: '4px 0 0 0' }}>
                  Comportamiento y Distribución de Datos ({scopeData.etiqueta || 'Institucional'})
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Gráficas interactivas con granularidad visual optimizada para salas de juntas y proyector.
                </p>
              </div>

              {/* Gráfica Recharts Principal */}
              <div style={{ backgroundColor: 'var(--bg-primary)', padding: '20px 16px', borderRadius: '20px', border: '1px solid var(--border)', flex: 1, minHeight: '340px' }}>
                {safeReportId === 'reporte_1_clima' && currentReport.evolucion_temporal?.length > 0 ? (
                  <AutoResponsiveContainer height={330}>
                    <LineChart data={currentReport.evolucion_temporal} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                      <XAxis dataKey="fecha" stroke="var(--text-muted)" fontSize={12} />
                      <YAxis stroke="var(--text-muted)" fontSize={12} domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '13px', fontWeight: '700' }} />
                      <Legend verticalAlign="top" height={38} iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: '700' }} />
                      <Line type="monotone" dataKey="estres" name="Estrés Promedio (%)" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 7 }} />
                      <Line type="monotone" dataKey="motivacion" name="Motivación (%)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 7 }} />
                      <Line type="monotone" dataKey="burnout" name="Burnout (%)" stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 4 }} />
                    </LineChart>
                  </AutoResponsiveContainer>
                ) : safeReportId === 'reporte_1_clima' && currentReport.distribucion_departamentos?.length > 0 ? (
                  <AutoResponsiveContainer height={330}>
                    <BarChart data={currentReport.distribucion_departamentos} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                      <XAxis dataKey="departamento" stroke="var(--text-muted)" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                      <YAxis stroke="var(--text-muted)" fontSize={12} domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '13px', fontWeight: '700' }} />
                      <Legend verticalAlign="top" height={38} iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: '700' }} />
                      <Bar dataKey="estres" name="Estrés (%)" fill="#ef4444" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="motivacion" name="Motivación (%)" fill="#10b981" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="burnout" name="Burnout (%)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </AutoResponsiveContainer>
                ) : summaryChartData.length > 0 ? (
                  <AutoResponsiveContainer height={330}>
                    <BarChart data={summaryChartData} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                      <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                      <YAxis stroke="var(--text-muted)" fontSize={12} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '13px', fontWeight: '700' }} />
                      <Legend verticalAlign="top" height={38} iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: '700' }} />
                      <Bar dataKey="total" name="Registros Consolidados" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </AutoResponsiveContainer>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                    <BarChart3 size={40} style={{ margin: '0 auto 10px auto', opacity: 0.6 }} />
                    <p style={{ fontSize: '14px', fontWeight: '700' }}>Sin datos gráficos disponibles para este reporte en el periodo.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SLIDE 3: DETALLE DE REGISTROS Y MUESTRA AUDITADA */}
          {currentSlide === 3 && (() => {
            const PAGE_SIZE = 6;
            const totalTablePages = Math.ceil(detailList.length / PAGE_SIZE) || 1;
            const currentTablePage = Math.min(slideTablePage, totalTablePages - 1);
            const displayedItems = showAllInSlide
              ? detailList
              : detailList.slice(currentTablePage * PAGE_SIZE, (currentTablePage + 1) * PAGE_SIZE);

            return (
              <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                      DIAPOSITIVA 4 • MUESTRA DE REGISTROS
                    </span>
                    <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-primary)', margin: '4px 0 0 0' }}>
                      Muestra Auditada de Registros Recientes ({detailList.length} registros totales)
                    </h2>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Detalle consolidado con trazabilidad en PostgreSQL para revisión del comité directivo.
                    </p>
                  </div>

                  {/* Controles de Navegación de Tabla */}
                  {detailList.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => setShowAllInSlide(!showAllInSlide)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '10px',
                          border: '1px solid var(--border)',
                          backgroundColor: showAllInSlide ? 'var(--primary)' : 'var(--bg-primary)',
                          color: showAllInSlide ? '#ffffff' : 'var(--text-secondary)',
                          fontSize: '11.5px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        title="Alternar entre ver todos los registros o paginados de 6 en 6"
                      >
                        {showAllInSlide ? 'Ver Paginado (6 por página)' : `Ver todos (${detailList.length})`}
                      </button>

                      {!showAllInSlide && totalTablePages > 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--bg-primary)', padding: '2px 6px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                          <button
                            type="button"
                            onClick={() => setSlideTablePage((p) => Math.max(p - 1, 0))}
                            disabled={currentTablePage === 0}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              border: 'none',
                              backgroundColor: currentTablePage > 0 ? 'var(--primary-light)' : 'transparent',
                              color: currentTablePage > 0 ? 'var(--primary)' : 'var(--text-muted)',
                              cursor: currentTablePage > 0 ? 'pointer' : 'not-allowed',
                              fontSize: '11px',
                              fontWeight: '800'
                            }}
                            title="Página anterior de registros"
                          >
                            ◀
                          </button>
                          <span style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--text-primary)', padding: '0 4px' }}>
                            Pág. {currentTablePage + 1} de {totalTablePages}
                          </span>
                          <button
                            type="button"
                            onClick={() => setSlideTablePage((p) => Math.min(p + 1, totalTablePages - 1))}
                            disabled={currentTablePage >= totalTablePages - 1}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              border: 'none',
                              backgroundColor: currentTablePage < totalTablePages - 1 ? 'var(--primary-light)' : 'transparent',
                              color: currentTablePage < totalTablePages - 1 ? 'var(--primary)' : 'var(--text-muted)',
                              cursor: currentTablePage < totalTablePages - 1 ? 'pointer' : 'not-allowed',
                              fontSize: '11px',
                              fontWeight: '800'
                            }}
                            title="Página siguiente de registros"
                          >
                            ▶
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Tabla Ejecutiva de Diapositiva */}
                <div style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: '18px',
                  border: '1px solid var(--border)',
                  padding: '14px',
                  overflowX: 'auto',
                  overflowY: showAllInSlide ? 'auto' : 'visible',
                  maxHeight: showAllInSlide ? '330px' : 'none',
                  flex: 1
                }}>
                  {detailList.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
                      <Info size={32} style={{ margin: '0 auto 10px auto', opacity: 0.6 }} />
                      <p style={{ fontSize: '14px', fontWeight: '700' }}>No se encontraron registros para los filtros seleccionados.</p>
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '8px 12px' }}>#</th>
                          <th style={{ padding: '8px 12px' }}>CONCEPTO / REGISTRO</th>
                          <th style={{ padding: '8px 12px' }}>DEPARTAMENTO / CATEGORÍA</th>
                          <th style={{ padding: '8px 12px' }}>ESTADO / CONDICIÓN</th>
                          <th style={{ padding: '8px 12px' }}>FECHA</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedItems.map((item, idx) => {
                          const globalIdx = showAllInSlide ? (idx + 1) : (currentTablePage * PAGE_SIZE + idx + 1);
                          const label = item.usuario || item.title || item.titulo || item.usuario_nombre || item.paciente || item.destinatario || item.nombre_completo || item.accion || item.recomendacion || item.nombre || `Registro #${globalIdx}`;
                          const dept = item.departamento || item.categoria || item.departamento_origen || item.rol || 'General';
                          
                          let status = item.estado;
                          if (!status) {
                            if (item.sentimiento) {
                              status = item.sentimiento;
                            } else if (item.estres !== undefined) {
                              status = `Estrés: ${item.estres}%`;
                            } else if (item.prioridad) {
                              status = item.prioridad;
                            } else if (item.tipo_insignia) {
                              status = item.tipo_insignia;
                            } else if (item.nivel_riesgo) {
                              status = item.nivel_riesgo;
                            } else {
                              status = 'Completado';
                            }
                          }

                          const rawDate = item.fecha || item.fecha_hora || item.fecha_creacion || item.fecha_registro;
                          let formattedDate = 'Reciente';
                          if (rawDate) {
                            try {
                              const d = new Date(rawDate);
                              if (!isNaN(d.getTime())) {
                                formattedDate = d.toLocaleString('es-GT', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                });
                              } else {
                                formattedDate = String(rawDate);
                              }
                            } catch (e) {
                              formattedDate = String(rawDate);
                            }
                          }

                          const sLower = String(status).toLowerCase();
                          const isHighRisk = sLower.includes('alto') || sLower.includes('activa') || sLower.includes('estrés alto') || sLower.includes('urgente') || sLower.includes('burnout');
                          const isSuccess = sLower.includes('completad') || sLower.includes('positiv') || sLower.includes('calma') || sLower.includes('bajo') || sLower.includes('resuelta') || sLower.includes('asistio');
                          const isWarning = sLower.includes('medio') || sLower.includes('moderado') || sLower.includes('pendiente');

                          const badgeBg = isHighRisk ? 'rgba(239, 68, 68, 0.15)' : (isSuccess ? 'rgba(16, 185, 129, 0.15)' : (isWarning ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)'));
                          const badgeColor = isHighRisk ? '#ef4444' : (isSuccess ? '#10b981' : (isWarning ? '#f59e0b' : '#3b82f6'));

                          return (
                            <tr key={idx} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s ease' }}>
                              <td style={{ padding: '8px 12px', fontWeight: '800', color: 'var(--text-muted)' }}>{globalIdx}</td>
                              <td style={{ padding: '8px 12px', fontWeight: '800', color: 'var(--text-primary)' }}>{label}</td>
                              <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{dept}</td>
                              <td style={{ padding: '8px 12px' }}>
                                <span style={{
                                  padding: '3px 10px',
                                  borderRadius: '12px',
                                  fontSize: '11px',
                                  fontWeight: '800',
                                  backgroundColor: badgeBg,
                                  color: badgeColor
                                }}>
                                  {status}
                                </span>
                              </td>
                              <td style={{ padding: '8px 12px', color: 'var(--text-muted)', fontSize: '11.5px' }}>{formattedDate}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span>
                    {showAllInSlide 
                      ? `Mostrando los ${detailList.length} registros totales consolidados en PostgreSQL.` 
                      : `Mostrando registros ${currentTablePage * PAGE_SIZE + 1} a ${Math.min((currentTablePage + 1) * PAGE_SIZE, detailList.length)} de ${detailList.length} registros totales.`
                    }
                  </span>
                  <span style={{ fontWeight: '700', color: 'var(--primary)' }}>
                    {totalTablePages > 1 && !showAllInSlide 
                      ? `Página ${currentTablePage + 1} de ${totalTablePages} (usa ◀ y ▶ para paginar)` 
                      : 'Exporta el libro Excel para la nómina y auditoría completa.'
                    }
                  </span>
                </div>
              </div>
            );
          })()}

          {/* SLIDE 4: CONCLUSIONES, OBSERVACIONES & FIRMA DIGITAL */}
          {currentSlide === 4 && (
            <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: '20px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  DIAPOSITIVA 5 • CONCLUSIONES & GOBERNANZA
                </span>
                <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-primary)', margin: '4px 0 0 0' }}>
                  Observaciones Estratégicas y Validación Digital
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Dictamen institucional emitido para la toma de decisiones organizacionales y comités de bienestar.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', flex: 1, alignItems: 'stretch' }}>
                {/* Caja de Observaciones */}
                <div style={{ backgroundColor: 'var(--bg-primary)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', textTransform: 'uppercase' }}>
                      <ClipboardList size={18} /> Observaciones del Periodo
                    </h4>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                      {currentReport.observaciones || 'Se recopilaron y validaron los datos del periodo seleccionado conforme a los protocolos institucionales de auditoría y análisis de bienestar.'}
                    </p>
                    {currentReport.nota_aclaratoria && (
                      <div style={{ marginTop: '14px', padding: '10px 14px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <Info size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        <span>{currentReport.nota_aclaratoria}</span>
                      </div>
                    )}
                  </div>

                  {/* Descarga Rápida en Presentación */}
                  <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => exportReportToExcel(allReportsData, safeReportId)}
                      className="btn btn-primary"
                      style={{ padding: '8px 14px', fontSize: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderColor: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <FileSpreadsheet size={14} /> Descargar Excel (.xlsx)
                    </button>
                    <button
                      type="button"
                      onClick={() => exportReportToPDF(allReportsData, safeReportId)}
                      className="btn btn-primary"
                      style={{ padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Download size={14} /> Descargar PDF
                    </button>
                  </div>
                </div>

                {/* Sello y Certificación RBAC */}
                <div style={{ backgroundColor: 'var(--primary-light)', padding: '24px', borderRadius: '20px', border: '1.5px dashed var(--primary)', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', gap: '14px' }}>
                  <ShieldCheck size={44} style={{ color: 'var(--primary)', margin: '0 auto' }} />
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'var(--primary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      VALIDACIÓN ELECTRÓNICA & CONFIDENCIALIDAD
                    </h3>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.5' }}>
                      La información expuesta en esta sesión ha sido generada automáticamente por el motor analítico de EquilibrIA con base en consultas parametrizadas en PostgreSQL, aplicando estrictas directrices de control de acceso RBAC ({scopeData.etiqueta}).
                    </p>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid rgba(126, 34, 206, 0.2)', paddingTop: '10px' }}>
                    Fecha y hora oficial de emisión: <strong>{allReportsData.fecha_generacion}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BARRA INFERIOR DE NAVEGACIÓN DOCK (BOTTOM DOCK CON DOTS) */}
        <div style={{
          position: 'sticky',
          bottom: '16px',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          marginTop: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1.5px solid var(--border)',
            padding: '8px 22px',
            borderRadius: '40px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            <button
              type="button"
              onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
              disabled={currentSlide === 0}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid var(--border)',
                backgroundColor: currentSlide > 0 ? 'var(--bg-primary)' : 'transparent',
                color: currentSlide > 0 ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: '700',
                cursor: currentSlide > 0 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <ChevronLeft size={16} /> Anterior
            </button>

            {/* Dots */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {SLIDE_TITLES.map((title, idx) => {
                const isActive = currentSlide === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    title={`${idx + 1}. ${title}`}
                    style={{
                      width: isActive ? '28px' : '10px',
                      height: '10px',
                      borderRadius: '5px',
                      backgroundColor: isActive ? 'var(--primary)' : 'var(--border)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease'
                    }}
                  />
                );
              })}
            </div>

            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)' }}>
              {currentSlide + 1} / 5 • {SLIDE_TITLES[currentSlide]}
            </span>

            <button
              type="button"
              onClick={() => {
                if (currentSlide < 4) {
                  setCurrentSlide((prev) => prev + 1);
                } else {
                  setIsPresentationMode(false);
                }
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: 'none',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 8px var(--primary-light)'
              }}
            >
              {currentSlide < 4 ? (
                <>Siguiente <ChevronRight size={16} /></>
              ) : (
                <>Finalizar <Minimize2 size={14} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`institutional-reports-module animate-fade ${isPresentationMode ? 'presentation-mode-active' : ''}`}
      style={isPresentationMode ? {
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'var(--bg-primary)',
        padding: '24px 32px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      } : { display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', minWidth: 0, overflow: 'visible' }}
    >
      {isPresentationMode && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          padding: '14px 22px',
          borderRadius: '16px',
          backgroundColor: 'var(--primary)',
          color: '#ffffff',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Tv size={22} />
              <div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '900' }}>MODO PROYECTOR EJECUTIVO • EQUILIBRIA</h4>
                <span style={{ fontSize: '11px', opacity: 0.9 }}>Vista ampliada de alta fidelidad para juntas directivas y comités</span>
              </div>
            </div>

            {/* Selector directo de reporte en modo proyector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', opacity: 0.9 }}>Reporte:</span>
              <select
                value={safeReportId}
                onChange={(e) => onSelectReport(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  fontSize: '12px',
                  fontWeight: '800',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {REPORT_TYPES.map((r) => (
                  <option key={r.id} value={r.id} style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                    {r.code}: {r.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '11.5px', padding: '4px 10px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.2)', fontWeight: '800' }}>
              {scopeData.etiqueta || 'Toda la institución'}
            </span>
            <button
              type="button"
              onClick={() => setIsPresentationMode(false)}
              style={{
                padding: '7px 16px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                fontWeight: '800',
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Salir de la pantalla completa del proyector (Esc)"
            >
              <Minimize2 size={15} /> Salir del Modo Proyector (Esc)
            </button>
          </div>
        </div>
      )}
      
      {/* 1. HEADER Y BARRA DE HERRAMIENTAS PRINCIPAL (SOLO MODO NORMAL) */}
      {!isPresentationMode && (
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

          {/* Botones de Exportación Multiformato y Proyector */}
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
                color: '#ffffff',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
                cursor: 'pointer'
              }}
            >
              <FileSpreadsheet size={15} /> Exportar en Excel (.xlsx)
            </button>
            <button
              type="button"
              onClick={() => exportReportToPDF(allReportsData, safeReportId)}
              className="btn btn-primary"
              title="Generar documento oficial para impresión / PDF"
              style={{
                padding: '8px 14px',
                fontSize: '12px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: '800',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
                borderColor: 'var(--primary-hover)',
                color: '#ffffff',
                boxShadow: '0 2px 8px var(--primary-light)',
                cursor: 'pointer'
              }}
            >
              <Printer size={15} /> Exportar en PDF
            </button>
            <button
              type="button"
              onClick={() => exportReportToCSV(allReportsData, safeReportId)}
              className="btn btn-primary"
              title="Descargar datos en CSV delimitado por punto y coma"
              style={{
                padding: '8px 14px',
                fontSize: '12px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                borderColor: '#1e40af',
                color: '#ffffff',
                boxShadow: '0 2px 8px rgba(30, 58, 138, 0.25)',
                cursor: 'pointer'
              }}
            >
              <Download size={14} /> Exportar en CSV
            </button>
            <button
              type="button"
              onClick={() => exportReportToJSON(allReportsData, safeReportId)}
              className="btn btn-primary"
              title="Descargar estructura en JSON"
              style={{
                padding: '8px 14px',
                fontSize: '12px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: '800',
                background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
                borderColor: '#0284c7',
                color: '#ffffff',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
                cursor: 'pointer'
              }}
            >
              <FileSpreadsheet size={14} /> Exportar en JSON
            </button>
            <button
              type="button"
              onClick={() => setIsPresentationMode(true)}
              className="duo-pill"
              title="Proyectar reporte en pantalla completa para juntas ejecutivas"
              style={{
                padding: '8px 14px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                fontWeight: '800',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)'
              }}
            >
              <Tv size={14} />
              <span>Modo Proyector</span>
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
      )}

      {/* 4. VISTA DEL INFORME: MODO DIAPOSITIVAS (PROYECTOR) O DOCUMENTO COMPLETO */}
      {isPresentationMode ? (
        renderPresentationDeck()
      ) : (
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

            {/* GRÁFICO REPORTE 2: ALERTAS INSTITUCIONALES */}
            {safeReportId === 'reporte_2_alertas' && (
              <div className="glass-card" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border)', padding: '20px 14px', width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={16} style={{ color: '#ef4444' }} /> Distribución y Estado de Alertas Institucionales
                </h4>
                <AutoResponsiveContainer height={260}>
                  <BarChart
                    data={[
                      { estado: 'Activas / Pendientes', cantidad: currentReport.activas || 0, fill: '#ef4444' },
                      { estado: 'En Atención / Proceso', cantidad: currentReport.atendidas || 0, fill: '#f59e0b' },
                      { estado: 'Resueltas / Cerradas', cantidad: currentReport.resueltas || 0, fill: '#10b981' }
                    ]}
                    margin={{ top: 10, right: 15, left: -20, bottom: 15 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                    <XAxis dataKey="estado" stroke="var(--text-muted)" fontSize={11} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '12px' }} />
                    <Bar dataKey="cantidad" name="Total Alertas" radius={[6, 6, 0, 0]}>
                      <Cell fill="#ef4444" />
                      <Cell fill="#f59e0b" />
                      <Cell fill="#10b981" />
                    </Bar>
                  </BarChart>
                </AutoResponsiveContainer>
              </div>
            )}

            {/* GRÁFICO REPORTE 3: CUMPLIMIENTO DE TAREAS */}
            {safeReportId === 'reporte_3_tareas' && (
              <div className="glass-card" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border)', padding: '20px 14px', width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckSquare size={16} style={{ color: '#10b981' }} /> Cumplimiento de Tareas Asignadas
                </h4>
                <AutoResponsiveContainer height={260}>
                  <BarChart
                    data={[
                      { estado: 'Completadas', cantidad: currentReport.completadas || 0, fill: '#10b981' },
                      { estado: 'Pendientes', cantidad: currentReport.pendientes || 0, fill: '#f59e0b' }
                    ]}
                    margin={{ top: 10, right: 15, left: -20, bottom: 15 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                    <XAxis dataKey="estado" stroke="var(--text-muted)" fontSize={11} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '12px' }} />
                    <Bar dataKey="cantidad" name="Total Tareas" radius={[6, 6, 0, 0]}>
                      <Cell fill="#10b981" />
                      <Cell fill="#f59e0b" />
                    </Bar>
                  </BarChart>
                </AutoResponsiveContainer>
              </div>
            )}

            {/* GRÁFICO REPORTE 4: CITAS CLÍNICAS DE APOYO */}
            {safeReportId === 'reporte_4_citas' && (
              <div className="glass-card" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border)', padding: '20px 14px', width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={16} style={{ color: '#3b82f6' }} /> Estado de Citas y Sesiones de Apoyo
                </h4>
                <AutoResponsiveContainer height={260}>
                  <BarChart
                    data={[
                      { estado: 'Programadas', cantidad: currentReport.programadas || 0, fill: '#3b82f6' },
                      { estado: 'Completadas', cantidad: currentReport.completadas || 0, fill: '#10b981' },
                      { estado: 'Canceladas / No Asistió', cantidad: currentReport.canceladas || 0, fill: '#ef4444' }
                    ]}
                    margin={{ top: 10, right: 15, left: -20, bottom: 15 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                    <XAxis dataKey="estado" stroke="var(--text-muted)" fontSize={11} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '12px' }} />
                    <Bar dataKey="cantidad" name="Total Citas" radius={[6, 6, 0, 0]}>
                      <Cell fill="#3b82f6" />
                      <Cell fill="#10b981" />
                      <Cell fill="#ef4444" />
                    </Bar>
                  </BarChart>
                </AutoResponsiveContainer>
              </div>
            )}

            {/* GRÁFICO PARA REPORTES 5 AL 10: DISTRIBUCIÓN POR CATEGORÍA / DEPARTAMENTO */}
            {safeReportId !== 'reporte_1_clima' && safeReportId !== 'reporte_2_alertas' && safeReportId !== 'reporte_3_tareas' && safeReportId !== 'reporte_4_citas' && detailList.length > 0 && (() => {
              const countMap = {};
              detailList.forEach((item) => {
                const key = item.departamento || item.categoria || item.rol || item.accion || item.modulo || item.tipo_insignia || item.estado || 'General';
                countMap[key] = (countMap[key] || 0) + 1;
              });
              const summaryChartData = Object.entries(countMap)
                .map(([name, total]) => ({
                  name: name.length > 18 ? name.substring(0, 16) + '...' : name,
                  total
                }))
                .slice(0, 8);

              return (
                <div className="glass-card" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border)', padding: '20px 14px', width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                  <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BarChart3 size={16} style={{ color: 'var(--primary)' }} /> Distribución Analítica por Segmento ({scopeData.etiqueta})
                  </h4>
                  <AutoResponsiveContainer height={260}>
                    <BarChart
                      data={summaryChartData}
                      margin={{ top: 10, right: 15, left: -20, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                      <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} interval={0} angle={-15} textAnchor="end" />
                      <YAxis stroke="var(--text-muted)" fontSize={11} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '12px' }} />
                      <Bar dataKey="total" name="Registros" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </AutoResponsiveContainer>
                </div>
              );
            })()}

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
      )}

    </div>
  );
};

export default InstitutionalReportView;
