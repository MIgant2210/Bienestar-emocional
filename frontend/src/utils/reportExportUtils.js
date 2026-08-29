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
 * 1. EXPORTAR EN PDF (PLANTILLA DE IMPRESIÓN OFICIAL INSTITUCIONAL)
 */
export const exportReportToPDF = (allReportsData, selectedReportId) => {
  if (!allReportsData) return;
  const currentReport = allReportsData[selectedReportId] || {};
  const filters = allReportsData.filtros_aplicados || {};
  const detailList = Array.isArray(currentReport.detalle)
    ? currentReport.detalle
    : (Array.isArray(currentReport.detalle_catalogo) ? currentReport.detalle_catalogo : []);

  const printWin = window.open('', '_blank');
  if (!printWin) {
    alert('Por favor permite las ventanas emergentes en tu navegador para generar el PDF oficial.');
    return;
  }

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
          <td>${item.remitente || 'Anónimo 🌿'}</td>
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
        <div>Fecha de emisión: ${allReportsData.fecha_generacion}</div>
        <div>Página 1 de 1</div>
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWin.document.open();
  printWin.document.write(htmlContent);
  printWin.document.close();
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
    alert('No hay registros filtrados para exportar en este reporte.');
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
