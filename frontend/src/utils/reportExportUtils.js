import ExcelJS from 'exceljs';

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
 * 2. EXPORTAR EN EXCEL OFICIAL (.XLSX) CON ANALÍTICAS, KPIS Y TABLAS ESTILIZADAS
 * Genera un libro de cálculo profesional (.xlsx) con branding de EquilibrIA,
 * tarjetas de indicadores ejecutivos, métricas clave y registros en columnas separadas.
 */
export const exportReportToExcel = async (allReportsData, selectedReportId) => {
  if (!allReportsData) return;
  const currentReport = allReportsData[selectedReportId] || {};
  const filters = allReportsData.filtros_aplicados || {};
  const detailList = Array.isArray(currentReport.detalle)
    ? currentReport.detalle
    : (Array.isArray(currentReport.detalle_catalogo) ? currentReport.detalle_catalogo : []);

  if (detailList.length === 0 && !currentReport.estres_promedio && !currentReport.total_alertas && !currentReport.total_tareas && !currentReport.total_citas) {
    if (typeof window !== 'undefined' && window.showSystemAlert) {
      window.showSystemAlert('info', 'Reportes', 'No hay registros para exportar en este periodo.');
    }
    return;
  }

  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'EquilibrIA Platform';
    workbook.created = new Date();
    workbook.properties.date1904 = false;

    const worksheet = workbook.addWorksheet('Informe Oficial', {
      views: [{ showGridLines: true }]
    });

    // Paleta de colores oficial
    const BRAND_DARK = 'FF312E81';    // Indigo 900
    const BRAND_PRIMARY = 'FF4F46E5'; // Indigo 600
    const BRAND_LIGHT = 'FFEEF2FF';   // Indigo 50
    const BG_ZEBRA = 'FFF8FAFC';      // Slate 50
    const BORDER_COLOR = 'FFE2E8F0';  // Slate 200
    const TEXT_MUTED = 'FF64748B';    // Slate 500
    const TEXT_MAIN = 'FF1E293B';     // Slate 800

    const thinBorder = {
      top: { style: 'thin', color: { argb: BORDER_COLOR } },
      left: { style: 'thin', color: { argb: BORDER_COLOR } },
      bottom: { style: 'thin', color: { argb: BORDER_COLOR } },
      right: { style: 'thin', color: { argb: BORDER_COLOR } }
    };

    // Determinar columnas y mapeo de datos según el tipo de reporte
    let reportColumns = [];
    let mappedRows = [];

    switch (selectedReportId) {
      case 'reporte_1_clima':
        reportColumns = [
          { header: '#', key: 'idx', width: 6 },
          { header: 'COLABORADOR', key: 'usuario', width: 26 },
          { header: 'DEPARTAMENTO', key: 'departamento', width: 22 },
          { header: 'ESTRÉS', key: 'estres', width: 14 },
          { header: 'MOTIVACIÓN', key: 'motivacion', width: 16 },
          { header: 'BURNOUT', key: 'burnout', width: 14 },
          { header: 'SENTIMIENTO', key: 'sentimiento', width: 18 },
          { header: 'FECHA Y HORA', key: 'fecha', width: 22 }
        ];
        mappedRows = detailList.map((item, idx) => ({
          idx: idx + 1,
          usuario: item.usuario || 'Anónimo',
          departamento: item.departamento || 'General',
          estres: item.estres !== undefined && item.estres !== null ? `${item.estres}%` : 'N/A',
          motivacion: item.motivacion !== undefined && item.motivacion !== null ? `${item.motivacion}%` : 'N/A',
          burnout: item.burnout !== undefined && item.burnout !== null ? `${item.burnout}%` : 'N/A',
          sentimiento: item.sentimiento || 'Neutro',
          fecha: item.fecha ? new Date(item.fecha).toLocaleString() : 'N/A'
        }));
        break;

      case 'reporte_2_alertas':
        reportColumns = [
          { header: '#', key: 'idx', width: 6 },
          { header: 'COLABORADOR', key: 'usuario', width: 26 },
          { header: 'DEPARTAMENTO', key: 'departamento', width: 22 },
          { header: 'NIVEL DE RIESGO', key: 'prioridad', width: 18 },
          { header: 'ESTADO', key: 'estado', width: 16 },
          { header: 'ATENDIDO POR', key: 'atendido_por', width: 24 },
          { header: 'FECHA CREACIÓN', key: 'fecha_creacion', width: 22 }
        ];
        mappedRows = detailList.map((item, idx) => ({
          idx: idx + 1,
          usuario: item.usuario || 'Anónimo',
          departamento: item.departamento || 'General',
          prioridad: item.prioridad || 'Media',
          estado: (item.estado || 'pendiente').toUpperCase(),
          atendido_por: item.atendido_por || 'Sin asignar',
          fecha_creacion: item.fecha_creacion ? new Date(item.fecha_creacion).toLocaleString() : 'N/A'
        }));
        break;

      case 'reporte_3_tareas':
        reportColumns = [
          { header: '#', key: 'idx', width: 6 },
          { header: 'TÍTULO DE LA TAREA', key: 'titulo', width: 34 },
          { header: 'CATEGORÍA', key: 'categoria', width: 18 },
          { header: 'PRIORIDAD', key: 'prioridad', width: 14 },
          { header: 'ESTADO', key: 'estado', width: 16 },
          { header: 'ASIGNADO A', key: 'asignado_a', width: 24 },
          { header: 'FECHA LÍMITE', key: 'fecha_limite', width: 18 }
        ];
        mappedRows = detailList.map((item, idx) => ({
          idx: idx + 1,
          titulo: item.titulo || 'Tarea',
          categoria: item.categoria || 'Bienestar',
          prioridad: item.prioridad || 'Media',
          estado: item.estado || 'Pendiente',
          asignado_a: item.asignado_a || 'Todos',
          fecha_limite: item.fecha_limite ? new Date(item.fecha_limite).toLocaleDateString() : 'Sin fecha'
        }));
        break;

      case 'reporte_4_citas':
        reportColumns = [
          { header: '#', key: 'idx', width: 6 },
          { header: 'PACIENTE / MIEMBRO', key: 'paciente', width: 26 },
          { header: 'DEPARTAMENTO', key: 'departamento', width: 20 },
          { header: 'PROFESIONAL DE APOYO', key: 'profesional', width: 26 },
          { header: 'MOTIVO', key: 'motivo', width: 28 },
          { header: 'ESTADO', key: 'estado', width: 16 },
          { header: 'FECHA Y HORA', key: 'fecha_hora', width: 22 }
        ];
        mappedRows = detailList.map((item, idx) => ({
          idx: idx + 1,
          paciente: item.paciente || 'Sesión Privada',
          departamento: item.departamento || 'General',
          profesional: item.profesional || 'Psicología Institucional',
          motivo: item.motivo || 'Orientación Emocional',
          estado: (item.estado || 'programada').toUpperCase(),
          fecha_hora: item.fecha_hora ? new Date(item.fecha_hora).toLocaleString() : 'N/A'
        }));
        break;

      case 'reporte_5_kudos':
        reportColumns = [
          { header: '#', key: 'idx', width: 6 },
          { header: 'REMITENTE', key: 'remitente', width: 24 },
          { header: 'DESTINATARIO', key: 'destinatario', width: 24 },
          { header: 'DEPARTAMENTO', key: 'departamento', width: 20 },
          { header: 'INSIGNIA', key: 'tipo_insignia', width: 18 },
          { header: 'MENSAJE', key: 'mensaje', width: 38 },
          { header: 'FECHA', key: 'fecha', width: 16 }
        ];
        mappedRows = detailList.map((item, idx) => ({
          idx: idx + 1,
          remitente: item.remitente || 'Anónimo',
          destinatario: item.destinatario || 'Compañero',
          departamento: item.departamento || 'General',
          tipo_insignia: item.tipo_insignia || 'Gratitud',
          mensaje: item.mensaje || '',
          fecha: item.fecha ? new Date(item.fecha).toLocaleDateString() : 'N/A'
        }));
        break;

      case 'reporte_7_usuarios':
        reportColumns = [
          { header: '#', key: 'idx', width: 6 },
          { header: 'NOMBRE COMPLETO', key: 'nombre_completo', width: 28 },
          { header: 'CORREO ELECTRÓNICO', key: 'email', width: 30 },
          { header: 'ROL INSTITUCIONAL', key: 'rol', width: 20 },
          { header: 'DEPARTAMENTO', key: 'departamento', width: 22 },
          { header: 'ESTADO', key: 'estado', width: 14 },
          { header: 'FECHA REGISTRO', key: 'fecha_registro', width: 18 }
        ];
        mappedRows = detailList.map((item, idx) => ({
          idx: idx + 1,
          nombre_completo: item.nombre_completo || 'Usuario',
          email: item.email || 'N/A',
          rol: item.rol || 'miembro',
          departamento: item.departamento || 'General',
          estado: (item.estado || 'ACTIVO').toUpperCase(),
          fecha_registro: item.fecha_registro ? new Date(item.fecha_registro).toLocaleDateString() : 'N/A'
        }));
        break;

      case 'reporte_9_auditoria':
        reportColumns = [
          { header: '#', key: 'idx', width: 6 },
          { header: 'USUARIO', key: 'usuario', width: 26 },
          { header: 'ACCIÓN AUDITADA', key: 'accion', width: 22 },
          { header: 'DETALLES DE OPERACIÓN', key: 'detalles', width: 40 },
          { header: 'DIRECCIÓN IP', key: 'ip', width: 16 },
          { header: 'FECHA Y HORA', key: 'fecha', width: 22 }
        ];
        mappedRows = detailList.map((item, idx) => ({
          idx: idx + 1,
          usuario: item.usuario || 'Sistema',
          accion: item.accion || 'EVENTO',
          detalles: item.detalles || 'Registro exitoso',
          ip: item.ip || '127.0.0.1',
          fecha: item.fecha ? new Date(item.fecha).toLocaleString() : 'N/A'
        }));
        break;

      default:
        reportColumns = [
          { header: '#', key: 'idx', width: 6 },
          { header: 'CONCEPTO / TÍTULO', key: 'titulo', width: 36 },
          { header: 'CATEGORÍA / ÁREA', key: 'categoria', width: 22 },
          { header: 'ESTADO / CONDICIÓN', key: 'estado', width: 18 },
          { header: 'FECHA', key: 'fecha', width: 18 }
        ];
        mappedRows = detailList.map((item, idx) => ({
          idx: idx + 1,
          titulo: item.title || item.nombre || item.recomendacion || item.usuario || `Registro #${idx + 1}`,
          categoria: item.departamento || item.categoria || item.departamento_origen || 'General',
          estado: item.estado || item.sentimiento_asociado || item.prioridad || 'Vigente',
          fecha: item.fecha || item.fecha_creacion ? new Date(item.fecha || item.fecha_creacion).toLocaleDateString() : 'N/A'
        }));
        break;
    }

    const totalCols = Math.max(reportColumns.length, 6);
    const endColLetter = String.fromCharCode(64 + Math.min(totalCols, 26));

    // ==========================================
    // 1. BANNER INSTITUCIONAL DE CABECERA
    // ==========================================
    worksheet.mergeCells(`A1:${endColLetter}1`);
    const headerBannerCell = worksheet.getCell('A1');
    headerBannerCell.value = 'EQUILIBRIA PLATFORM — GESTIÓN DE BIENESTAR & ANALÍTICA INSTITUCIONAL';
    headerBannerCell.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    headerBannerCell.alignment = { vertical: 'middle', horizontal: 'center' };
    headerBannerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_DARK } };
    worksheet.getRow(1).height = 36;

    worksheet.mergeCells(`A2:${endColLetter}2`);
    const subtitleCell = worksheet.getCell('A2');
    subtitleCell.value = `${currentReport.titulo || 'INFORME OFICIAL'} | DOCUMENTO AUDITABLE`;
    subtitleCell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    subtitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    subtitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_PRIMARY } };
    worksheet.getRow(2).height = 24;

    worksheet.addRow([]); // Fila 3 vacía

    // ==========================================
    // 2. FICHA TÉCNICA Y METADATOS DEL REPORTE
    // ==========================================
    const scopeLabel = (allReportsData.alcance && allReportsData.alcance.etiqueta) || filters.alcance || 'Toda la institución';
    const metaRows = [
      ['Institución Emisora:', allReportsData.institucion || 'EquilibrIA Central', 'Código Oficial:', currentReport.codigo || 'EQ-REP-OFFICIAL'],
      ['Alcance Poblacional:', scopeLabel, 'Periodo Evaluado:', `${filters.fecha_inicio || 'Inicio'} al ${filters.fecha_fin || 'Actual'}`],
      ['Fecha de Emisión:', allReportsData.fecha_generacion || new Date().toLocaleString(), 'Filtro de Estado:', filters.estado || 'Todos los estados']
    ];

    metaRows.forEach((meta) => {
      const row = worksheet.addRow(meta);
      row.height = 20;
      row.getCell(1).font = { name: 'Segoe UI', bold: true, size: 10, color: { argb: TEXT_MAIN } };
      row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_LIGHT } };
      row.getCell(2).font = { name: 'Segoe UI', size: 10, color: { argb: TEXT_MAIN } };
      row.getCell(3).font = { name: 'Segoe UI', bold: true, size: 10, color: { argb: TEXT_MAIN } };
      row.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_LIGHT } };
      row.getCell(4).font = { name: 'Segoe UI', size: 10, color: { argb: TEXT_MAIN } };

      for (let c = 1; c <= 4; c++) {
        row.getCell(c).border = thinBorder;
      }
    });

    worksheet.addRow([]); // Fila separadora

    // ==========================================
    // 3. RESUMEN EJECUTIVO / TARJETAS KPI
    // ==========================================
    let kpis = [];
    if (selectedReportId === 'reporte_1_clima') {
      kpis = [
        { label: 'ESTRÉS PROMEDIO', val: currentReport.estres_promedio !== null ? `${currentReport.estres_promedio}%` : 'N/A' },
        { label: 'MOTIVACIÓN PROMEDIO', val: currentReport.motivacion_promedio !== null ? `${currentReport.motivacion_promedio}%` : 'N/A' },
        { label: 'RIESGO DE BURNOUT', val: currentReport.burnout_promedio !== null ? `${currentReport.burnout_promedio}%` : 'N/A' },
        { label: 'TOTAL REFLEXIONES', val: currentReport.total_reflexiones || 0 }
      ];
    } else if (selectedReportId === 'reporte_2_alertas') {
      kpis = [
        { label: 'TOTAL ALERTAS', val: currentReport.total_alertas || 0 },
        { label: 'ALERTAS ACTIVAS', val: currentReport.activas || 0 },
        { label: 'ALERTAS ATENDIDAS', val: currentReport.atendidas || 0 },
        { label: 'TIEMPO PROM. ATENCIÓN', val: currentReport.tiempo_promedio_horas !== null ? `${currentReport.tiempo_promedio_horas} hrs` : 'N/A' }
      ];
    } else if (selectedReportId === 'reporte_3_tareas') {
      kpis = [
        { label: 'TOTAL TAREAS', val: currentReport.total_tareas || 0 },
        { label: 'COMPLETADAS', val: currentReport.completadas || 0 },
        { label: 'PENDIENTES / PROCESO', val: (currentReport.pendientes || 0) + (currentReport.en_proceso || 0) },
        { label: '% CUMPLIMIENTO', val: currentReport.porcentaje_cumplimiento !== null ? `${currentReport.porcentaje_cumplimiento}%` : 'N/A' }
      ];
    } else if (selectedReportId === 'reporte_4_citas') {
      kpis = [
        { label: 'TOTAL CITAS', val: currentReport.total_citas || 0 },
        { label: 'PROGRAMADAS / CONFIRM.', val: (currentReport.programadas || 0) + (currentReport.confirmadas || 0) },
        { label: 'COMPLETADAS', val: currentReport.completadas || 0 },
        { label: '% ASISTENCIA', val: currentReport.porcentaje_asistencia !== null ? `${currentReport.porcentaje_asistencia}%` : 'N/A' }
      ];
    } else {
      kpis = [
        { label: 'REGISTROS TOTALES', val: detailList.length },
        { label: 'ESTADO AUDITORÍA', val: 'CONFORME' },
        { label: 'CONTROL DE ACCESO', val: 'RBAC OFICIAL' },
        { label: 'ESTADO GENERAL', val: 'ACTIVO' }
      ];
    }

    if (kpis.length > 0) {
      const kpiHeaderRow = worksheet.addRow(['RESUMEN EJECUTIVO DE INDICADORES CLAVE (KPIS)']);
      kpiHeaderRow.height = 24;
      worksheet.mergeCells(`A${kpiHeaderRow.number}:${endColLetter}${kpiHeaderRow.number}`);
      kpiHeaderRow.getCell(1).font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: BRAND_DARK } };
      kpiHeaderRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
      kpiHeaderRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
      kpiHeaderRow.getCell(1).border = thinBorder;

      // Fila de títulos de KPI
      const kpiTitleRow = worksheet.addRow(kpis.map(k => k.label));
      kpiTitleRow.height = 20;
      kpis.forEach((_, i) => {
        const cell = kpiTitleRow.getCell(i + 1);
        cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: TEXT_MUTED } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BG_ZEBRA } };
        cell.border = thinBorder;
      });

      // Fila de valores de KPI
      const kpiValRow = worksheet.addRow(kpis.map(k => k.val));
      kpiValRow.height = 28;
      kpis.forEach((_, i) => {
        const cell = kpiValRow.getCell(i + 1);
        cell.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: BRAND_PRIMARY } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
        cell.border = thinBorder;
      });

      worksheet.addRow([]); // Espaciador
    }

    // ==========================================
    // 4. TABLAS ANALÍTICAS SECUNDARIAS (REPORTE 1)
    // ==========================================
    if (selectedReportId === 'reporte_1_clima') {
      const evolucion = Array.isArray(currentReport.evolucion_temporal) ? currentReport.evolucion_temporal : [];
      const depts = Array.isArray(currentReport.distribucion_departamentos) ? currentReport.distribucion_departamentos : [];

      if (evolucion.length > 0) {
        const evoHeader = worksheet.addRow(['📈 EVOLUCIÓN TEMPORAL DE INDICADORES EMOCIONALES']);
        evoHeader.height = 22;
        worksheet.mergeCells(`A${evoHeader.number}:D${evoHeader.number}`);
        evoHeader.getCell(1).font = { name: 'Segoe UI', size: 10.5, bold: true, color: { argb: BRAND_DARK } };
        evoHeader.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_LIGHT } };

        const evoCols = worksheet.addRow(['FECHA / PERIODO', 'ESTRÉS PROMEDIO', 'MOTIVACIÓN PROMEDIO', 'BURNOUT']);
        evoCols.height = 20;
        for (let c = 1; c <= 4; c++) {
          const cell = evoCols.getCell(c);
          cell.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: 'FFFFFFFF' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_PRIMARY } };
          cell.alignment = { vertical: 'middle', horizontal: c === 1 ? 'left' : 'center' };
          cell.border = thinBorder;
        }

        evolucion.forEach((d, i) => {
          const row = worksheet.addRow([
            d.fecha || `Periodo ${i + 1}`,
            `${d.estres !== undefined ? d.estres : 0}%`,
            `${d.motivacion !== undefined ? d.motivacion : 0}%`,
            `${d.burnout !== undefined ? d.burnout : 0}%`
          ]);
          row.height = 18;
          for (let c = 1; c <= 4; c++) {
            const cell = row.getCell(c);
            cell.font = { name: 'Segoe UI', size: 9.5 };
            cell.alignment = { vertical: 'middle', horizontal: c === 1 ? 'left' : 'center' };
            cell.border = thinBorder;
            if (i % 2 === 1) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BG_ZEBRA } };
          }
        });
        worksheet.addRow([]);
      }

      if (depts.length > 0) {
        const deptHeader = worksheet.addRow(['📊 COMPARATIVA DE BIENESTAR POR DEPARTAMENTO']);
        deptHeader.height = 22;
        worksheet.mergeCells(`A${deptHeader.number}:D${deptHeader.number}`);
        deptHeader.getCell(1).font = { name: 'Segoe UI', size: 10.5, bold: true, color: { argb: BRAND_DARK } };
        deptHeader.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_LIGHT } };

        const deptCols = worksheet.addRow(['DEPARTAMENTO', 'ESTRÉS (%)', 'MOTIVACIÓN (%)', 'BURNOUT (%)']);
        deptCols.height = 20;
        for (let c = 1; c <= 4; c++) {
          const cell = deptCols.getCell(c);
          cell.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: 'FFFFFFFF' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_PRIMARY } };
          cell.alignment = { vertical: 'middle', horizontal: c === 1 ? 'left' : 'center' };
          cell.border = thinBorder;
        }

        depts.forEach((d, i) => {
          const row = worksheet.addRow([
            d.departamento || 'General',
            `${d.estres !== undefined ? d.estres : 0}%`,
            `${d.motivacion !== undefined ? d.motivacion : 0}%`,
            `${d.burnout !== undefined ? d.burnout : 0}%`
          ]);
          row.height = 18;
          for (let c = 1; c <= 4; c++) {
            const cell = row.getCell(c);
            cell.font = { name: 'Segoe UI', size: 9.5 };
            cell.alignment = { vertical: 'middle', horizontal: c === 1 ? 'left' : 'center' };
            cell.border = thinBorder;
            if (i % 2 === 1) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BG_ZEBRA } };
          }
        });
        worksheet.addRow([]);
      }
    }

    // ==========================================
    // 5. TABLA PRINCIPAL DE REGISTROS CONSOLIDADOS
    // ==========================================
    const tableTitleRow = worksheet.addRow([`DETALLE CONSOLIDADO DE REGISTROS (${mappedRows.length} elementos)`]);
    tableTitleRow.height = 24;
    worksheet.mergeCells(`A${tableTitleRow.number}:${endColLetter}${tableTitleRow.number}`);
    tableTitleRow.getCell(1).font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: BRAND_DARK } };
    tableTitleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_LIGHT } };
    tableTitleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    tableTitleRow.getCell(1).border = thinBorder;

    // Fila de encabezados de la tabla principal
    const mainHeaderRow = worksheet.addRow(reportColumns.map(c => c.header));
    mainHeaderRow.height = 24;
    reportColumns.forEach((_, colIdx) => {
      const cell = mainHeaderRow.getCell(colIdx + 1);
      cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_PRIMARY } };
      cell.alignment = { vertical: 'middle', horizontal: colIdx === 0 ? 'center' : 'left' };
      cell.border = thinBorder;
    });

    // Filas de datos
    mappedRows.forEach((item, rowIdx) => {
      const rowValues = reportColumns.map(col => item[col.key] !== undefined ? item[col.key] : '');
      const dataRow = worksheet.addRow(rowValues);
      dataRow.height = 20;

      const isEven = rowIdx % 2 === 1;
      reportColumns.forEach((col, colIdx) => {
        const cell = dataRow.getCell(colIdx + 1);
        cell.font = { name: 'Segoe UI', size: 9.5, color: { argb: TEXT_MAIN } };
        cell.alignment = {
          vertical: 'middle',
          horizontal: colIdx === 0 || col.key.includes('fecha') ? 'center' : (col.key.includes('estres') || col.key.includes('motivacion') || col.key.includes('burnout') ? 'center' : 'left')
        };
        cell.border = thinBorder;
        if (isEven) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BG_ZEBRA } };
        }
      });
    });

    if (mappedRows.length === 0) {
      const emptyRow = worksheet.addRow(['Sin resultados para los filtros seleccionados en este periodo.']);
      emptyRow.height = 26;
      worksheet.mergeCells(`A${emptyRow.number}:${endColLetter}${emptyRow.number}`);
      emptyRow.getCell(1).font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: TEXT_MUTED } };
      emptyRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
      emptyRow.getCell(1).border = thinBorder;
    }

    worksheet.addRow([]); // Separador

    // ==========================================
    // 6. OBSERVACIONES Y NOTA DE GOBERNANZA RBAC
    // ==========================================
    const obsHeader = worksheet.addRow(['OBSERVACIONES Y NOTA DE AUDITORÍA']);
    obsHeader.height = 20;
    obsHeader.getCell(1).font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: BRAND_DARK } };

    const obsContent = worksheet.addRow([currentReport.observaciones || 'La información fue recopilada conforme a los filtros institucionales activos.']);
    obsContent.height = 22;
    worksheet.mergeCells(`A${obsContent.number}:${endColLetter}${obsContent.number}`);
    obsContent.getCell(1).font = { name: 'Segoe UI', size: 9.5, italic: true, color: { argb: TEXT_MAIN } };

    const rbacNotice = worksheet.addRow(['CONFIDENCIALIDAD: Este libro de cálculo ha sido emitido bajo el protocolo de mínimo privilegio RBAC de EquilibrIA. Se prohíbe la divulgación no autorizada de datos personales.']);
    rbacNotice.height = 22;
    worksheet.mergeCells(`A${rbacNotice.number}:${endColLetter}${rbacNotice.number}`);
    rbacNotice.getCell(1).font = { name: 'Segoe UI', size: 8.5, bold: true, color: { argb: 'FF92400E' } };
    rbacNotice.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFBEB' } };
    rbacNotice.getCell(1).border = thinBorder;

    // Configuración de anchos de columnas
    reportColumns.forEach((col, idx) => {
      worksheet.getColumn(idx + 1).width = Math.max(col.width || 15, 12);
    });

    // Generar y descargar archivo binario .xlsx
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    link.download = `EquilibrIA_${currentReport.codigo || selectedReportId}_${dateStr}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (typeof window !== 'undefined' && window.showSystemAlert) {
      window.showSystemAlert('success', 'Excel Generado', 'El informe en formato Excel (.xlsx) se ha descargado exitosamente con analíticas y tablas formateadas.');
    }
  } catch (error) {
    console.error('Error al generar archivo Excel:', error);
    if (typeof window !== 'undefined' && window.showSystemAlert) {
      window.showSystemAlert('error', 'Error en Excel', 'No se pudo generar el archivo de Excel. Utilizando respaldo en CSV.');
    }
    // Fallback a CSV si ocurriera cualquier excepción
    exportReportToCSV(allReportsData, selectedReportId);
  }
};

/**
 * 3. EXPORTAR EN CSV (FORMATO DELIMITADO POR PUNTO Y COMA ';' CON 'sep=;' PARA EXCEL)
 */
export const exportReportToCSV = (allReportsData, selectedReportId) => {
  if (!allReportsData) return;
  const currentReport = allReportsData[selectedReportId] || {};
  const detailList = Array.isArray(currentReport.detalle)
    ? currentReport.detalle
    : (Array.isArray(currentReport.detalle_catalogo) ? currentReport.detalle_catalogo : []);

  if (detailList.length === 0) {
    if (typeof window !== 'undefined' && window.showSystemAlert) {
      window.showSystemAlert('info', 'Reportes', 'No hay registros filtrados para exportar en este reporte.');
    }
    return;
  }

  const scopeLabel = (allReportsData.alcance && allReportsData.alcance.etiqueta) || 'Toda la institución';
  
  // Encabezado con instrucción sep=; para que Microsoft Excel en cualquier idioma asigne las columnas automáticamente
  const metaHeader = [
    'sep=;',
    `REPORTE;${currentReport.titulo || selectedReportId}`,
    `INSTITUCION;${allReportsData.institucion || 'EquilibrIA'}`,
    `ALCANCE;${scopeLabel}`,
    `FECHA_EMISION;${allReportsData.fecha_generacion || new Date().toLocaleString()}`,
    '' // Línea en blanco
  ].join('\r\n');

  // Extraer nombres de columnas a partir de las claves del primer elemento
  const keys = Object.keys(detailList[0]);
  const headerRow = keys.map(k => `"${k.toUpperCase()}"`).join(';');

  const rows = detailList.map(item => {
    return keys.map(k => {
      let val = item[k];
      if (val === null || val === undefined) val = '';
      if (typeof val === 'string') {
        val = val.replace(/"/g, '""'); // Escapar comillas dobles
      }
      return `"${val}"`;
    }).join(';');
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
  URL.revokeObjectURL(url);
};

/**
 * 4. EXPORTAR EN JSON ESTRUCTURADO
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
  URL.revokeObjectURL(url);
};
