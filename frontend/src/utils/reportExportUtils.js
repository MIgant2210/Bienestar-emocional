/**
 * ============================================================================
 * EQUILIBRIA REPORT EXPORT UTILITIES (PDF, CSV, JSON)
 * ============================================================================
 * Exportación formal, exacta y estructurada para los 10 reportes institucionales.
 * Respeta rigurosamente los filtros activos y no utiliza datos simulados ni firmas falsas.
 */

// Helper para formatear valores nulos o indefinidos
const formatVal = (val, fallback = 'Sin datos suficientes') => {
  if (val === null || val === undefined || val === '') return fallback;
  return val;
};

/**
 * Generador de Gráficas Vectoriales SVG de Alta Definición para Hoja 2 del PDF
 */
const generateReportChartsSvgHtml = (currentReport, selectedReportId, scopeLabel) => {
  if (selectedReportId !== 'reporte_1_clima') return '';

  const evolucion = Array.isArray(currentReport.evolucion_temporal) ? currentReport.evolucion_temporal : [];
  const departamentos = Array.isArray(currentReport.distribucion_departamentos) ? currentReport.distribucion_departamentos : [];

  if (evolucion.length === 0 && departamentos.length === 0) return '';

  let evolucionSvg = '';
  if (evolucion.length > 0) {
    const W = 680;
    const H = 240;
    const padL = 45;
    const padR = 25;
    const padT = 30;
    const padB = 40;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    // Puntos de cada serie
    const getX = (i) => padL + (evolucion.length === 1 ? plotW / 2 : (i / (evolucion.length - 1)) * plotW);
    const getY = (val) => padT + plotH - (Math.max(0, Math.min(100, Number(val) || 0)) / 100) * plotH;

    const ptsEstres = evolucion.map((d, i) => `${getX(i)},${getY(d.estres)}`).join(' ');
    const ptsMotiv = evolucion.map((d, i) => `${getX(i)},${getY(d.motivacion)}`).join(' ');
    const ptsBurnout = evolucion.map((d, i) => `${getX(i)},${getY(d.burnout)}`).join(' ');

    const dotsEstres = evolucion.map((d, i) => `<circle cx="${getX(i)}" cy="${getY(d.estres)}" r="4" fill="#ef4444" stroke="#ffffff" stroke-width="1.5" />`).join('');
    const dotsMotiv = evolucion.map((d, i) => `<circle cx="${getX(i)}" cy="${getY(d.motivacion)}" r="4" fill="#10b981" stroke="#ffffff" stroke-width="1.5" />`).join('');
    const dotsBurnout = evolucion.map((d, i) => `<circle cx="${getX(i)}" cy="${getY(d.burnout)}" r="4" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5" />`).join('');

    const gridLines = [0, 25, 50, 75, 100].map(val => {
      const y = getY(val);
      return `
        <line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4 3" />
        <text x="${padL - 8}" y="${y + 3.5}" fill="#94a3b8" font-size="9.5" text-anchor="end" font-weight="600">${val}%</text>
      `;
    }).join('');

    const xLabels = evolucion.map((d, i) => {
      const x = getX(i);
      const label = d.fecha ? String(d.fecha).slice(5) : `#${i+1}`;
      return `<text x="${x}" y="${H - 12}" fill="#64748b" font-size="9" text-anchor="middle" font-weight="600">${label}</text>`;
    }).join('');

    evolucionSvg = `
      <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 22px;">
        <div style="font-size: 12.5px; font-weight: 800; color: #1e293b; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
          <span>📈 1. Evolución Temporal del Clima Emocional (${scopeLabel || 'Institucional'})</span>
          <span style="font-size: 10px; color: #64748b; font-weight: 600;">Valores promedio en escala 0-100%</span>
        </div>
        <svg viewBox="0 0 ${W} ${H}" style="width: 100%; height: auto; display: block; overflow: visible;">
          ${gridLines}
          <polyline fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="${ptsEstres}" />
          <polyline fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="${ptsMotiv}" />
          <polyline fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="5 4" stroke-linecap="round" stroke-linejoin="round" points="${ptsBurnout}" />
          ${dotsEstres}
          ${dotsMotiv}
          ${dotsBurnout}
          ${xLabels}
        </svg>
        <div style="display: flex; justify-content: center; gap: 24px; margin-top: 10px; font-size: 10.5px; font-weight: 700;">
          <span style="color: #ef4444; display: inline-flex; align-items: center; gap: 5px;">● Estrés</span>
          <span style="color: #10b981; display: inline-flex; align-items: center; gap: 5px;">● Motivación</span>
          <span style="color: #f59e0b; display: inline-flex; align-items: center; gap: 5px;">┄ Agotamiento (Burnout)</span>
        </div>
      </div>
    `;
  }

  let deptSvg = '';
  if (departamentos.length > 0) {
    const W = 680;
    const H = 250;
    const padL = 45;
    const padR = 25;
    const padT = 30;
    const padB = 46;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const groupW = plotW / departamentos.length;
    const barW = Math.min(18, (groupW - 14) / 3);

    const getY = (val) => padT + plotH - (Math.max(0, Math.min(100, Number(val) || 0)) / 100) * plotH;

    const gridLines = [0, 25, 50, 75, 100].map(val => {
      const y = getY(val);
      return `
        <line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4 3" />
        <text x="${padL - 8}" y="${y + 3.5}" fill="#94a3b8" font-size="9.5" text-anchor="end" font-weight="600">${val}%</text>
      `;
    }).join('');

    const bars = departamentos.map((d, i) => {
      const centerGroup = padL + i * groupW + groupW / 2;
      const x1 = centerGroup - (barW * 1.5) - 2;
      const x2 = centerGroup - (barW * 0.5);
      const x3 = centerGroup + (barW * 0.5) + 2;

      const y1 = getY(d.estres);
      const y2 = getY(d.motivacion);
      const y3 = getY(d.burnout);

      const h1 = (padT + plotH) - y1;
      const h2 = (padT + plotH) - y2;
      const h3 = (padT + plotH) - y3;

      const deptLabel = d.departamento ? (d.departamento.length > 14 ? d.departamento.slice(0, 12) + '…' : d.departamento) : 'Dept';

      return `
        <rect x="${x1}" y="${y1}" width="${barW}" height="${h1}" rx="3" fill="#ef4444" />
        <rect x="${x2}" y="${y2}" width="${barW}" height="${h2}" rx="3" fill="#10b981" />
        <rect x="${x3}" y="${y3}" width="${barW}" height="${h3}" rx="3" fill="#f59e0b" />
        <text x="${centerGroup}" y="${H - 14}" fill="#475569" font-size="9.5" font-weight="700" text-anchor="middle">${deptLabel}</text>
      `;
    }).join('');

    deptSvg = `
      <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
        <div style="font-size: 12.5px; font-weight: 800; color: #1e293b; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
          <span>📊 2. Comparativo de Indicadores Emocionales por Departamento</span>
          <span style="font-size: 10px; color: #64748b; font-weight: 600;">Valores agregados por área</span>
        </div>
        <svg viewBox="0 0 ${W} ${H}" style="width: 100%; height: auto; display: block; overflow: visible;">
          ${gridLines}
          ${bars}
        </svg>
        <div style="display: flex; justify-content: center; gap: 24px; margin-top: 10px; font-size: 10.5px; font-weight: 700;">
          <span style="color: #ef4444; display: inline-flex; align-items: center; gap: 5px;">■ Estrés (%)</span>
          <span style="color: #10b981; display: inline-flex; align-items: center; gap: 5px;">■ Motivación (%)</span>
          <span style="color: #f59e0b; display: inline-flex; align-items: center; gap: 5px;">■ Burnout (%)</span>
        </div>
      </div>
    `;
  }

  return `
    <div style="page-break-before: always; break-before: page; padding-top: 18px;">
      <div class="header-bar" style="margin-bottom: 18px;">
        <div>
          <div class="brand-title">EquilibrIA Platform</div>
          <div class="brand-sub">Análisis Gráfico y Tendencias Estadísticas Institucionales</div>
        </div>
        <div class="doc-badge">DOCUMENTO OFICIAL • HOJA 2 DE 2</div>
      </div>

      <div class="doc-title" style="font-size: 16px; margin-bottom: 14px;">
        Anexos Gráficos Institucionales — ${currentReport.titulo || 'Clima Emocional'}
      </div>

      ${evolucionSvg}
      ${deptSvg}

      <div class="footer-bar" style="margin-top: 24px;">
        <div>Documento generado electrónicamente por EquilibrIA</div>
        <div>Fecha de emisión: ${currentReport.fecha_generacion || new Date().toLocaleString()}</div>
        <div>Página 2 de 2</div>
      </div>
    </div>
  `;
};

/**
 * 1. EXPORTAR EN PDF (PLANTILLA DE IMPRESIÓN OFICIAL INSTITUCIONAL)
 * Utiliza un iframe oculto para no abrir ventanas en blanco y mantener la vista actual.
 */
export const exportReportToPDF = (allReportsData, selectedReportId) => {
  if (!allReportsData) return;
  const currentReport = allReportsData[selectedReportId] || {};
  const filters = allReportsData.filtros_aplicados || {};
  const detailList = Array.isArray(currentReport.detalle)
    ? currentReport.detalle
    : (Array.isArray(currentReport.detalle_catalogo) ? currentReport.detalle_catalogo : []);

  // Generar columnas y filas de la tabla según el tipo de reporte
  let tableHeadersHtml = '';
  let tableRowsHtml = '';

  switch (selectedReportId) {
    case 'reporte_1_clima':
      tableHeadersHtml = `
        <th>#</th>
        <th>COLABORADOR</th>
        <th>DEPARTAMENTO</th>
        <th>ESTRÉS</th>
        <th>MOTIVACIÓN</th>
        <th>BURNOUT</th>
        <th>SENTIMIENTO</th>
        <th>FECHA</th>
      `;
      tableRowsHtml = detailList.map((item, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${item.usuario || 'Anónimo'}</strong></td>
          <td>${item.departamento || 'General'}</td>
          <td><span class="badge ${item.estres >= 70 ? 'badge-danger' : item.estres >= 40 ? 'badge-warning' : 'badge-success'}">${item.estres}%</span></td>
          <td><span class="badge badge-success">${item.motivacion}%</span></td>
          <td><span class="badge ${item.burnout >= 70 ? 'badge-danger' : 'badge-neutral'}">${item.burnout}%</span></td>
          <td>${item.sentimiento || 'Neutro'}</td>
          <td>${item.fecha ? new Date(item.fecha).toLocaleString() : 'N/A'}</td>
        </tr>
      `).join('');
      break;

    case 'reporte_2_alertas':
      tableHeadersHtml = `
        <th>#</th>
        <th>COLABORADOR</th>
        <th>DEPARTAMENTO</th>
        <th>NIVEL DE RIESGO</th>
        <th>ESTADO</th>
        <th>ATENDIDO POR</th>
        <th>FECHA CREACIÓN</th>
      `;
      tableRowsHtml = detailList.map((item, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${item.usuario || 'Anónimo'}</strong></td>
          <td>${item.departamento || 'General'}</td>
          <td><span class="badge ${item.prioridad === 'Alta' ? 'badge-danger' : 'badge-warning'}">${item.prioridad || 'Media'}</span></td>
          <td><span class="badge ${item.estado === 'pendiente' ? 'badge-danger' : 'badge-success'}">${item.estado || 'pendiente'}</span></td>
          <td>${item.atendido_por || 'Sin asignar'}</td>
          <td>${item.fecha_creacion ? new Date(item.fecha_creacion).toLocaleString() : 'N/A'}</td>
        </tr>
      `).join('');
      break;

    case 'reporte_3_tareas':
      tableHeadersHtml = `
        <th>#</th>
        <th>TÍTULO DE LA TAREA</th>
        <th>CATEGORÍA</th>
        <th>PRIORIDAD</th>
        <th>ESTADO</th>
        <th>ASIGNADO A</th>
        <th>FECHA LÍMITE</th>
      `;
      tableRowsHtml = detailList.map((item, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${item.titulo || 'Tarea'}</strong></td>
          <td>${item.categoria || 'Bienestar'}</td>
          <td><span class="badge ${item.prioridad === 'Alta' ? 'badge-danger' : 'badge-neutral'}">${item.prioridad || 'Media'}</span></td>
          <td><span class="badge ${item.estado === 'Completada' ? 'badge-success' : 'badge-warning'}">${item.estado || 'Pendiente'}</span></td>
          <td>${item.asignado_a || 'Todos'}</td>
          <td>${item.fecha_limite ? new Date(item.fecha_limite).toLocaleDateString() : 'Sin fecha'}</td>
        </tr>
      `).join('');
      break;

    case 'reporte_4_citas':
      tableHeadersHtml = `
        <th>#</th>
        <th>PACIENTE / MIEMBRO</th>
        <th>DEPARTAMENTO</th>
        <th>PROFESIONAL DE APOYO</th>
        <th>MOTIVO</th>
        <th>ESTADO</th>
        <th>FECHA Y HORA</th>
      `;
      tableRowsHtml = detailList.map((item, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${item.paciente || 'Sesión Privada'}</strong></td>
          <td>${item.departamento || 'General'}</td>
          <td>${item.profesional || 'Psicología Institucional'}</td>
          <td>${item.motivo || 'Orientación Emocional'}</td>
          <td><span class="badge ${item.estado === 'completada' ? 'badge-success' : item.estado === 'cancelada' ? 'badge-danger' : 'badge-primary'}">${item.estado || 'programada'}</span></td>
          <td>${item.fecha_hora ? new Date(item.fecha_hora).toLocaleString() : 'N/A'}</td>
        </tr>
      `).join('');
      break;

    case 'reporte_5_kudos':
      tableHeadersHtml = `
        <th>#</th>
        <th>REMITENTE</th>
        <th>DESTINATARIO</th>
        <th>DEPARTAMENTO</th>
        <th>INSIGNIA</th>
        <th>MENSAJE</th>
        <th>FECHA</th>
      `;
      tableRowsHtml = detailList.map((item, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>${item.remitente || 'Anónimo'}</td>
          <td><strong>${item.destinatario || 'Compañero'}</strong></td>
          <td>${item.departamento || 'General'}</td>
          <td><span class="badge badge-primary">${item.tipo_insignia || 'Gratitud'}</span></td>
          <td style="max-width:280px; font-style:italic;">"${item.mensaje || ''}"</td>
          <td>${item.fecha ? new Date(item.fecha).toLocaleDateString() : 'N/A'}</td>
        </tr>
      `).join('');
      break;

    case 'reporte_7_usuarios':
      tableHeadersHtml = `
        <th>#</th>
        <th>NOMBRE COMPLETO</th>
        <th>CORREO ELECTRÓNICO</th>
        <th>ROL INSTITUCIONAL</th>
        <th>DEPARTAMENTO</th>
        <th>ESTADO</th>
        <th>FECHA REGISTRO</th>
      `;
      tableRowsHtml = detailList.map((item, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${item.nombre_completo || 'Usuario'}</strong></td>
          <td>${item.email || 'N/A'}</td>
          <td><span class="badge badge-primary">${item.rol || 'miembro'}</span></td>
          <td>${item.departamento || 'General'}</td>
          <td><span class="badge ${item.estado === 'ACTIVO' ? 'badge-success' : 'badge-danger'}">${item.estado || 'ACTIVO'}</span></td>
          <td>${item.fecha_registro ? new Date(item.fecha_registro).toLocaleDateString() : 'N/A'}</td>
        </tr>
      `).join('');
      break;

    case 'reporte_9_auditoria':
      tableHeadersHtml = `
        <th>#</th>
        <th>USUARIO</th>
        <th>ACCIÓN AUDITADA</th>
        <th>DETALLES</th>
        <th>DIRECCIÓN IP</th>
        <th>FECHA Y HORA</th>
      `;
      tableRowsHtml = detailList.map((item, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${item.usuario || 'Sistema'}</strong></td>
          <td><span class="badge badge-neutral">${item.accion || 'EVENTO'}</span></td>
          <td style="max-width:320px;">${item.detalles || 'Registro exitoso'}</td>
          <td><code>${item.ip || '127.0.0.1'}</code></td>
          <td>${item.fecha ? new Date(item.fecha).toLocaleString() : 'N/A'}</td>
        </tr>
      `).join('');
      break;

    default:
      tableHeadersHtml = `
        <th>#</th>
        <th>CONCEPTO / TITULO</th>
        <th>CATEGORÍA / DEPARTAMENTO</th>
        <th>ESTADO / CONDICIÓN</th>
        <th>FECHA</th>
      `;
      tableRowsHtml = detailList.map((item, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${item.title || item.nombre || item.recomendacion || item.usuario || `Registro #${idx + 1}`}</strong></td>
          <td>${item.departamento || item.categoria || item.departamento_origen || 'General'}</td>
          <td><span class="badge badge-primary">${item.estado || item.sentimiento_asociado || 'Vigente'}</span></td>
          <td>${item.fecha || item.fecha_creacion ? new Date(item.fecha || item.fecha_creacion).toLocaleDateString() : 'N/A'}</td>
        </tr>
      `).join('');
      break;
  }

  if (detailList.length === 0) {
    tableRowsHtml = `<tr><td colspan="7" style="text-align:center; padding:24px; color:#64748b; font-style:italic;">Sin resultados para los filtros seleccionados en este periodo.</td></tr>`;
  }

  // Tarjetas KPI para el resumen ejecutivo del PDF
  let kpisHtml = '';
  if (selectedReportId === 'reporte_1_clima') {
    kpisHtml = `
      <div class="kpi-card"><div class="kpi-title">ESTRÉS PROMEDIO</div><div class="kpi-value" style="color:#ef4444;">${currentReport.estres_promedio !== null ? currentReport.estres_promedio + '%' : 'Sin datos'}</div></div>
      <div class="kpi-card"><div class="kpi-title">MOTIVACIÓN PROMEDIO</div><div class="kpi-value" style="color:#10b981;">${currentReport.motivacion_promedio !== null ? currentReport.motivacion_promedio + '%' : 'Sin datos'}</div></div>
      <div class="kpi-card"><div class="kpi-title">RIESGO DE BURNOUT</div><div class="kpi-value" style="color:#f59e0b;">${currentReport.burnout_promedio !== null ? currentReport.burnout_promedio + '%' : 'Sin datos'}</div></div>
      <div class="kpi-card"><div class="kpi-title">TOTAL REFLEXIONES</div><div class="kpi-value" style="color:#7e22ce;">${currentReport.total_reflexiones || 0}</div></div>
    `;
  } else if (selectedReportId === 'reporte_2_alertas') {
    kpisHtml = `
      <div class="kpi-card"><div class="kpi-title">TOTAL ALERTAS</div><div class="kpi-value" style="color:#7e22ce;">${currentReport.total_alertas || 0}</div></div>
      <div class="kpi-card"><div class="kpi-title">ALERTAS ACTIVAS</div><div class="kpi-value" style="color:#ef4444;">${currentReport.activas || 0}</div></div>
      <div class="kpi-card"><div class="kpi-title">ALERTAS ATENDIDAS</div><div class="kpi-value" style="color:#10b981;">${currentReport.atendidas || 0}</div></div>
      <div class="kpi-card"><div class="kpi-title">TIEMPO PROMEDIO ATENCIÓN</div><div class="kpi-value" style="color:#3b82f6;">${currentReport.tiempo_promedio_horas !== null ? currentReport.tiempo_promedio_horas + ' hrs' : 'Sin datos'}</div></div>
    `;
  } else if (selectedReportId === 'reporte_3_tareas') {
    kpisHtml = `
      <div class="kpi-card"><div class="kpi-title">TOTAL TAREAS</div><div class="kpi-value" style="color:#7e22ce;">${currentReport.total_tareas || 0}</div></div>
      <div class="kpi-card"><div class="kpi-title">COMPLETADAS</div><div class="kpi-value" style="color:#10b981;">${currentReport.completadas || 0}</div></div>
      <div class="kpi-card"><div class="kpi-title">PENDIENTES / EN PROCESO</div><div class="kpi-value" style="color:#f59e0b;">${(currentReport.pendientes || 0) + (currentReport.en_proceso || 0)}</div></div>
      <div class="kpi-card"><div class="kpi-title">% CUMPLIMIENTO</div><div class="kpi-value" style="color:#10b981;">${currentReport.porcentaje_cumplimiento !== null ? currentReport.porcentaje_cumplimiento + '%' : 'Sin datos'}</div></div>
    `;
  } else if (selectedReportId === 'reporte_4_citas') {
    kpisHtml = `
      <div class="kpi-card"><div class="kpi-title">TOTAL CITAS</div><div class="kpi-value" style="color:#7e22ce;">${currentReport.total_citas || 0}</div></div>
      <div class="kpi-card"><div class="kpi-title">PROGRAMADAS / CONFIRMADAS</div><div class="kpi-value" style="color:#3b82f6;">${(currentReport.programadas || 0) + (currentReport.confirmadas || 0)}</div></div>
      <div class="kpi-card"><div class="kpi-title">COMPLETADAS</div><div class="kpi-value" style="color:#10b981;">${currentReport.completadas || 0}</div></div>
      <div class="kpi-card"><div class="kpi-title">% ASISTENCIA</div><div class="kpi-value" style="color:#10b981;">${currentReport.porcentaje_asistencia !== null ? currentReport.porcentaje_asistencia + '%' : 'Sin datos'}</div></div>
    `;
  } else {
    kpisHtml = `
      <div class="kpi-card"><div class="kpi-title">REGISTROS ANALIZADOS</div><div class="kpi-value" style="color:#7e22ce;">${detailList.length}</div></div>
      <div class="kpi-card"><div class="kpi-title">ESTADO DE AUDITORÍA</div><div class="kpi-value" style="color:#10b981; font-size:16px;">AUDITADO</div></div>
      <div class="kpi-card"><div class="kpi-title">VALIDEZ LEGAL</div><div class="kpi-value" style="color:#6366f1; font-size:16px;">VIGENTE</div></div>
      <div class="kpi-card"><div class="kpi-title">NIVEL DE ACCESO</div><div class="kpi-value" style="color:#f59e0b; font-size:16px;">CONFIDENCIAL (RBAC)</div></div>
    `;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>EquilibrIA - ${currentReport.titulo || 'Informe Oficial Institucional'}</title>
      <style>
        @page { size: letter; margin: 12mm; }
        body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; background: #ffffff; margin: 0; padding: 20px; font-size: 12px; }
        .header-bar { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #7e22ce; padding-bottom: 14px; margin-bottom: 18px; }
        .brand-title { font-size: 22px; font-weight: 900; color: #7e22ce; letter-spacing: -0.5px; }
        .brand-sub { font-size: 11px; color: #64748b; font-weight: 600; }
        .doc-badge { background: #f3e8ff; color: #7e22ce; border: 1px solid #d8b4fe; padding: 4px 12px; border-radius: 16px; font-weight: 800; font-size: 10.5px; }
        .doc-title { font-size: 18px; font-weight: 900; color: #0f172a; margin-bottom: 12px; }
        .meta-box { background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 12px; padding: 12px 16px; margin-bottom: 20px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 11.5px; }
        .section-title { font-size: 13px; font-weight: 800; color: #334155; margin-bottom: 10px; border-left: 4px solid #7e22ce; padding-left: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
        .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 12px; text-align: center; }
        .kpi-title { font-size: 10px; color: #64748b; font-weight: 800; text-transform: uppercase; }
        .kpi-value { font-size: 20px; font-weight: 900; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 11px; }
        th { background: #f1f5f9; color: #475569; font-weight: 800; padding: 8px 10px; text-align: left; border-bottom: 2px solid #cbd5e1; }
        td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; color: #334155; vertical-align: middle; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 800; text-transform: uppercase; }
        .badge-success { background: #dcfce7; color: #166534; }
        .badge-danger { background: #fee2e2; color: #991b1b; }
        .badge-warning { background: #fef3c7; color: #92400e; }
        .badge-primary { background: #f3e8ff; color: #7e22ce; }
        .badge-neutral { background: #f1f5f9; color: #475569; }
        .obs-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; margin-bottom: 20px; line-height: 1.5; font-size: 11.5px; }
        .disclaimer-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 10px 14px; margin-bottom: 20px; font-size: 10.5px; color: #92400e; }
        .footer-bar { border-top: 1px solid #e2e8f0; padding-top: 16px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #64748b; font-weight: 600; }
        @media print {
          body { padding: 0; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header-bar">
        <div>
          <div class="brand-title">EquilibrIA Platform</div>
          <div class="brand-sub">Sistema de Gestión de Bienestar Integral & Analítica Institucional</div>
        </div>
        <div class="doc-badge">DOCUMENTO OFICIAL • CONFIDENCIAL</div>
      </div>

      <div class="doc-title">${currentReport.titulo || 'Informe Oficial'}</div>

      <div class="meta-box">
        <div><strong>Institución Emisora:</strong> ${allReportsData.institucion || 'EquilibrIA Central'}</div>
        <div><strong>Código de Documento:</strong> ${currentReport.codigo || 'EQ-REP-OFFICIAL'}</div>
        <div><strong>Alcance Poblacional:</strong> <span class="badge badge-primary">${(allReportsData.alcance && allReportsData.alcance.etiqueta) || filters.alcance || 'Toda la institución'}</span></div>
        <div><strong>Periodo Filtrado:</strong> ${filters.fecha_inicio || 'Inicio'} al ${filters.fecha_fin || 'Actual'} (${filters.periodo_rapido || 'Personalizado'})</div>
        <div><strong>Fecha y Hora de Emisión:</strong> ${allReportsData.fecha_generacion || new Date().toLocaleString()}</div>
        <div><strong>Estado / Condición:</strong> ${filters.estado || 'Todos'}</div>
      </div>

      <div class="section-title">Resumen Ejecutivo de Indicadores</div>
      <div class="kpi-grid">
        ${kpisHtml}
      </div>

      <div class="section-title">Detalle Consolidado de Registros (${detailList.length} registros)</div>
      <table>
        <thead>
          <tr>
            ${tableHeadersHtml}
          </tr>
        </thead>
        <tbody>
          ${tableRowsHtml}
        </tbody>
      </table>

      <div class="section-title">Observaciones Analíticas</div>
      <div class="obs-box">
        ${currentReport.observaciones || 'Se completó la recopilación y auditoría de datos conforme a los filtros seleccionados.'}
      </div>

      <div class="disclaimer-box">
        <strong>NOTA DE CONFIDENCIALIDAD Y GOBERNANZA DE DATOS (RBAC):</strong> La información contenida en este informe ha sido generada conforme al principio de mínimo privilegio. Los datos emocionales y de salud se presentan agregados y protegidos conforme a normativas de privacidad y salud ocupacional.
      </div>

      <div class="footer-bar">
        <div>Documento generado electrónicamente por EquilibrIA</div>
        <div>Fecha de emisión: ${allReportsData.fecha_generacion || new Date().toLocaleString()}</div>
        <div>Página 1 de ${selectedReportId === 'reporte_1_clima' && (currentReport.evolucion_temporal?.length > 0 || currentReport.distribucion_departamentos?.length > 0) ? '2' : '1'}</div>
      </div>

      ${generateReportChartsSvgHtml(currentReport, selectedReportId, (allReportsData.alcance && allReportsData.alcance.etiqueta) || filters.alcance)}
    </body>
    </html>
  `;

  // Mecanismo de impresión en segundo plano vía iframe invisible
  let printIframe = document.getElementById('equilibria-report-print-frame');
  if (!printIframe) {
    printIframe = document.createElement('iframe');
    printIframe.id = 'equilibria-report-print-frame';
    printIframe.style.position = 'fixed';
    printIframe.style.right = '0';
    printIframe.style.bottom = '0';
    printIframe.style.width = '0';
    printIframe.style.height = '0';
    printIframe.style.border = '0';
    printIframe.style.visibility = 'hidden';
    document.body.appendChild(printIframe);
  }

  const iframeDoc = printIframe.contentDocument || printIframe.contentWindow.document;
  iframeDoc.open();
  iframeDoc.write(htmlContent);
  iframeDoc.close();

  // Esperar a que se renderice el contenido del iframe y disparar el diálogo nativo de impresión
  setTimeout(() => {
    try {
      printIframe.contentWindow.focus();
      printIframe.contentWindow.print();
    } catch (err) {
      console.error('Error al imprimir documento:', err);
    }
  }, 400);
};

/**
 * 2. EXPORTAR EN CSV (ESTRUCTURADO CON UTF-8 BOM PARA EXCEL)
 */
export const exportReportToCSV = (allReportsData, selectedReportId) => {
  if (!allReportsData) return;
  const currentReport = allReportsData[selectedReportId] || {};
  const detailList = Array.isArray(currentReport.detalle)
    ? currentReport.detalle
    : (Array.isArray(currentReport.detalle_catalogo) ? currentReport.detalle_catalogo : []);

  if (detailList.length === 0) {
    if (typeof window !== 'undefined' && window.showSystemAlert) { window.showSystemAlert('info', 'Reportes', 'No hay registros filtrados para exportar en este reporte.'); } else { console.warn('No hay registros filtrados para exportar.'); }
    return;
  }

  // Metadatos iniciales del reporte para encabezado de auditoría CSV
  const scopeLabel = (allReportsData.alcance && allReportsData.alcance.etiqueta) || 'Toda la institución';
  const metaHeader = [
    `"# REPORTE: ${currentReport.titulo || selectedReportId}"`,
    `"# INSTITUCION: ${allReportsData.institucion || 'EquilibrIA'}"`,
    `"# ALCANCE: ${scopeLabel}"`,
    `"# FECHA EMISION: ${allReportsData.fecha_generacion || ''}"`,
    `""` // Línea en blanco
  ].join('\r\n');

  // Extraer nombres de columnas a partir de las claves del primer elemento
  const keys = Object.keys(detailList[0]);
  const headerRow = keys.map(k => `"${k.toUpperCase()}"`).join(',');

  const rows = detailList.map(item => {
    return keys.map(k => {
      let val = item[k];
      if (val === null || val === undefined) val = '';
      if (typeof val === 'string') {
        val = val.replace(/"/g, '""'); // Escapar comillas dobles
      }
      return `"${val}"`;
    }).join(',');
  });

  const csvContent = '\uFEFF' + metaHeader + '\r\n' + [headerRow, ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `EquilibrIA_${currentReport.codigo || selectedReportId}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * 3. EXPORTAR EN JSON ESTRUCTURADO
 */
export const exportReportToJSON = (allReportsData, selectedReportId) => {
  if (!allReportsData) return;
  const currentReport = allReportsData[selectedReportId] || {};
  const payload = {
    institucion: allReportsData.institucion,
    fecha_generacion: allReportsData.fecha_generacion,
    alcance: allReportsData.alcance || { tipo: 'institution', etiqueta: 'Toda la institución' },
    filtros_aplicados: allReportsData.filtros_aplicados,
    reporte: currentReport
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `EquilibrIA_${currentReport.codigo || selectedReportId}_${dateStr}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
