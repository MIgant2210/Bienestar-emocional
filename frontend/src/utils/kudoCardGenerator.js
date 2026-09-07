/**
 * ============================================================================
 * EQUILIBRIA KUDO CARD GENERATOR (CANVAS HD 1080x1080)
 * ============================================================================
 * Genera una tarjeta postal visual elegante y de alta resolución en formato PNG
 * con la identidad corporativa de EquilibrIA para compartir reconocimientos en
 * redes, canales institucionales (Teams, Slack) o guardar como recuerdo.
 */

export const generateAndDownloadKudoCard = (kudo) => {
  if (!kudo) return;

  const canvas = document.createElement('canvas');
  const size = 1080;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. FONDO CON DEGRADADO PROFUNDO Y ELEGANTE
  const bgGrad = ctx.createLinearGradient(0, 0, size, size);
  bgGrad.addColorStop(0, '#1e1b4b');   // Indigo muy oscuro
  bgGrad.addColorStop(0.5, '#312e81'); // Indigo 900
  bgGrad.addColorStop(1, '#0f172a');   // Slate 900
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, size, size);

  // Halo luminoso central
  const glowGrad = ctx.createRadialGradient(size / 2, size / 2, 80, size / 2, size / 2, 480);
  glowGrad.addColorStop(0, 'rgba(99, 102, 241, 0.28)'); // Indigo 500 glow
  glowGrad.addColorStop(0.7, 'rgba(168, 85, 247, 0.12)'); // Purple glow
  glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, size, size);

  // 2. MARCO EXTERNO DECORATIVO CON BORDES REDONDEADOS
  const margin = 50;
  const cardRadius = 36;
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(margin, margin, size - margin * 2, size - margin * 2, cardRadius);
  ctx.stroke();

  // Esquinas doradas ornamentales
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 4;
  const cornerLen = 50;
  // Superior izquierda
  ctx.beginPath();
  ctx.moveTo(margin, margin + cornerLen);
  ctx.lineTo(margin, margin);
  ctx.lineTo(margin + cornerLen, margin);
  ctx.stroke();
  // Superior derecha
  ctx.beginPath();
  ctx.moveTo(size - margin - cornerLen, margin);
  ctx.lineTo(size - margin, margin);
  ctx.lineTo(size - margin, margin + cornerLen);
  ctx.stroke();
  // Inferior izquierda
  ctx.beginPath();
  ctx.moveTo(margin, size - margin - cornerLen);
  ctx.lineTo(margin, size - margin);
  ctx.lineTo(margin + cornerLen, size - margin);
  ctx.stroke();
  // Inferior derecha
  ctx.beginPath();
  ctx.moveTo(size - margin - cornerLen, size - margin);
  ctx.lineTo(size - margin, size - margin);
  ctx.lineTo(size - margin, size - margin - cornerLen);
  ctx.stroke();
  ctx.restore();

  // 3. ENCABEZADO: LOGOTIPO & TÍTULO INSTITUCIONAL
  ctx.textAlign = 'center';
  ctx.fillStyle = '#a5b4fc';
  ctx.font = 'bold 24px "Segoe UI", Roboto, sans-serif';
  ctx.fillText('EQUILIBRIA PLATFORM • RECONOCIMIENTO INSTITUCIONAL', size / 2, 130);

  ctx.fillStyle = '#f8fafc';
  ctx.font = '900 48px "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Muro de Gratitud & Cultura Positiva', size / 2, 190);

  // 4. CHIP DE INSIGNIA DESTACADA
  const badgeType = kudo.badge_type || kudo.tipo_insignia || 'Gratitud';
  ctx.save();
  const badgeY = 250;
  const badgeW = 340;
  const badgeH = 56;
  const badgeGrad = ctx.createLinearGradient((size - badgeW) / 2, badgeY, (size + badgeW) / 2, badgeY);
  badgeGrad.addColorStop(0, '#6366f1');
  badgeGrad.addColorStop(1, '#8b5cf6');
  ctx.fillStyle = badgeGrad;
  ctx.beginPath();
  ctx.roundRect((size - badgeW) / 2, badgeY, badgeW, badgeH, 28);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`✨ Insignia: ${badgeType}`, size / 2, badgeY + 36);
  ctx.restore();

  // 5. DESTINATARIO
  const receiver = kudo.receiver_name || kudo.destinatario || 'Compañero';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 22px "Segoe UI", Roboto, sans-serif';
  ctx.fillText('OTORGADO CON GRATITUD A:', size / 2, 380);

  ctx.fillStyle = '#38bdf8'; // Celeste brillante
  ctx.font = '900 52px "Segoe UI", Roboto, sans-serif';
  ctx.fillText(receiver, size / 2, 440);

  // 6. CAJA DE MENSAJE (COMILLAS Y TEXTO CON AUTO-WRAP)
  const message = kudo.message || kudo.mensaje || '¡Gracias por tu apoyo incondicional y gran actitud en el equipo!';
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 72px Georgia, serif';
  ctx.fillText('“', size / 2, 530);

  ctx.fillStyle = '#f1f5f9';
  ctx.font = 'italic 500 30px "Segoe UI", Roboto, sans-serif';
  
  // Función de salto de línea automático
  const maxWidth = 820;
  const lineHeight = 44;
  const words = message.split(' ');
  let line = '';
  const lines = [];

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      lines.push(line);
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  // Renderizar máximo 5 líneas
  const startY = 580;
  lines.slice(0, 5).forEach((l, idx) => {
    ctx.fillText(l.trim(), size / 2, startY + idx * lineHeight);
  });

  // 7. REMITENTE Y DEPARTAMENTO
  const sender = kudo.sender_name || kudo.remitente || 'Anónimo';
  const dept = kudo.department || kudo.departamento || 'Comunidad EquilibrIA';

  const footerBoxY = 820;
  ctx.fillStyle = '#64748b';
  ctx.font = '600 20px "Segoe UI", Roboto, sans-serif';
  ctx.fillText('MENSAJE ENVIADO POR:', size / 2, footerBoxY);

  ctx.fillStyle = '#f8fafc';
  ctx.font = '800 32px "Segoe UI", Roboto, sans-serif';
  ctx.fillText(sender, size / 2, footerBoxY + 42);

  ctx.fillStyle = '#a5b4fc';
  ctx.font = '600 20px "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`Área: ${dept}`, size / 2, footerBoxY + 76);

  // 8. PIE DE PÁGINA CON FECHA Y CERTIFICACIÓN
  const dateStr = kudo.created_at ? new Date(kudo.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('es-ES');
  ctx.fillStyle = '#475569';
  ctx.font = '16px "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`Emitido el ${dateStr} • Reconocimiento autenticado en EquilibrIA`, size / 2, 980);

  // DESCARGAR COMO PNG
  try {
    const dataUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.download = `Kudo_EquilibrIA_${receiver.replace(/\s+/g, '_')}.png`;
    downloadLink.href = dataUrl;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  } catch (err) {
    console.error('Error al generar tarjeta de Kudo:', err);
  }
};
