/**
 * Sistema Inteligente de Programación y Detección Automática de Temáticas de EquilibrIA
 * Determina qué temática corresponde a cada fecha del año, dando prioridad máxima
 * al cumpleaños del usuario activo, festividades y estaciones.
 */

/**
 * Verifica si una fecha corresponde al cumpleaños del usuario (mismo mes y día).
 */
export const isUserBirthday = (user, referenceDate = new Date()) => {
  if (!user || !user.birth_date) return false;
  try {
    const parts = user.birth_date.split('-');
    if (parts.length !== 3) return false;
    const birthMonth = parseInt(parts[1], 10) - 1; // 0-indexed
    const birthDay = parseInt(parts[2], 10);

    const targetMonth = referenceDate.getMonth();
    const targetDay = referenceDate.getDate();

    return birthMonth === targetMonth && birthDay === targetDay;
  } catch {
    return false;
  }
};

/**
 * Resuelve la temática automática correspondiente a la fecha actual y al perfil del usuario.
 * @param {Object} user - Datos del usuario en sesión (incluye birth_date)
 * @param {Date} [referenceDate=new Date()] - Fecha a evaluar
 * @returns {Object} { themeId, reason, icon, isBirthday, detail }
 */
export const resolveAutomatedTheme = (user, referenceDate = new Date()) => {
  const month = referenceDate.getMonth() + 1; // 1-12
  const day = referenceDate.getDate();

  // 1. PRIORIDAD MÁXIMA: Cumpleaños del usuario
  if (isUserBirthday(user, referenceDate)) {
    const firstName = user?.first_name ? ` ¡Feliz Cumpleaños, ${user.first_name}!` : ' ¡Feliz Cumpleaños!';
    return {
      themeId: 'birthday',
      reason: firstName,
      icon: '🎂',
      isBirthday: true,
      detail: 'Hoy es tu día especial y EquilibrIA se viste de fiesta para celebrarte.'
    };
  }

  // 2. DÍAS FESTIVOS Y TEMÁTICAS ESPECIALES POR CALENDARIO

  // Año Nuevo (31 de Diciembre al 6 de Enero)
  if ((month === 12 && day === 31) || (month === 1 && day <= 6)) {
    return {
      themeId: 'newyear',
      reason: 'Año Nuevo y Nuevos Comienzos',
      icon: '🎆',
      isBirthday: false,
      detail: 'Iniciando el año con esperanza, metas claras y nuevos horizontes.'
    };
  }

  // San Valentín y Empatía (7 al 17 de Febrero)
  if (month === 2 && day >= 7 && day <= 17) {
    return {
      themeId: 'valentines',
      reason: 'San Valentín y Amor Propio',
      icon: '💗',
      isBirthday: false,
      detail: 'Semana de conexión humana sana, gratitud y autocuidado personal.'
    };
  }

  // Aniversario de EquilibrIA (1 al 10 de Marzo)
  if (month === 3 && day >= 1 && day <= 10) {
    return {
      themeId: 'anniversary',
      reason: 'Aniversario de EquilibrIA',
      icon: '🎉',
      isBirthday: false,
      detail: 'Conmemorando nuestro compromiso continuo con tu bienestar mental y equilibrio.'
    };
  }

  // Día del Medio Ambiente (1 al 10 de Junio)
  if (month === 6 && day >= 1 && day <= 10) {
    return {
      themeId: 'environment',
      reason: 'Día del Medio Ambiente',
      icon: '🌱',
      isBirthday: false,
      detail: 'Promoviendo armonía ecológica, aire puro y conexión con la naturaleza.'
    };
  }

  // Mes de la Independencia de Guatemala (Todo Septiembre: 1 al 30 de Septiembre)
  if (month === 9) {
    return {
      themeId: 'guatemala',
      reason: 'Mes de la Independencia y Orgullo Patrio',
      icon: '🇬🇹',
      isBirthday: false,
      detail: 'Honrando la libertad y la riqueza cultural de Guatemala.'
    };
  }

  // Mes de Halloween (1 de Octubre al 2 de Noviembre)
  if (month === 10 || (month === 11 && day <= 2)) {
    return {
      themeId: 'halloween',
      reason: 'Temporada de Halloween Mágico',
      icon: '🎃',
      isBirthday: false,
      detail: 'Creatividad, magia y diversión festiva en el mes de octubre.'
    };
  }

  // Temporada de Graduación y Cierre Académico (3 al 25 de Noviembre)
  if (month === 11 && day >= 3 && day <= 25) {
    return {
      themeId: 'graduation',
      reason: 'Temporada de Graduación y Triunfo',
      icon: '🎓',
      isBirthday: false,
      detail: 'Celebrando el esfuerzo académico, metas cumplidas y nuevos logros.'
    };
  }

  // Mes de Navidad y Paz (1 al 30 de Diciembre)
  if (month === 12 && day <= 30) {
    return {
      themeId: 'christmas',
      reason: 'Mes de Navidad y Paz',
      icon: '🎄',
      isBirthday: false,
      detail: 'Espíritu de gratitud, calma interior, descanso y unión con los seres queridos.'
    };
  }

  // 3. ESTACIONES DEL AÑO (Cuando no hay una festividad específica activa)

  // Primavera: 20 de Marzo al 20 de Junio
  if ((month === 3 && day >= 20) || month === 4 || month === 5 || (month === 6 && day <= 20)) {
    return {
      themeId: 'spring',
      reason: 'Estación de Primavera',
      icon: '🌸',
      isBirthday: false,
      detail: 'Época de florecimiento, energía renovada y serenidad floral.'
    };
  }

  // Verano: 21 de Junio al 21 de Septiembre
  if ((month === 6 && day >= 21) || month === 7 || month === 8 || (month === 9 && day <= 21)) {
    return {
      themeId: 'summer',
      reason: 'Estación de Verano',
      icon: '☀️',
      isBirthday: false,
      detail: 'Vitalidad, brillo solar y motivación radiante para cada día.'
    };
  }

  // Otoño: 22 de Septiembre al 20 de Diciembre
  if ((month === 9 && day >= 22) || month === 10 || month === 11 || (month === 12 && day <= 20)) {
    return {
      themeId: 'autumn',
      reason: 'Estación de Otoño',
      icon: '🍂',
      isBirthday: false,
      detail: 'Tonos cálidos, introspección pacífica y cosecha de bienestar.'
    };
  }

  // Invierno: 21 de Diciembre al 19 de Marzo
  return {
    themeId: 'winter',
    reason: 'Estación de Invierno',
    icon: '❄️',
    isBirthday: false,
    detail: 'Claridad cristalina, sosiego y descanso reconfortante.'
  };
};

/**
 * Resumen de todas las fechas automáticas del año para consulta o ayuda en la UI.
 */
export const THEME_CALENDAR_SCHEDULE = [
  { themeId: 'birthday', name: 'Cumpleaños Festivo', icon: '🎂', dates: 'El día del cumpleaños de cada usuario', category: 'Personal' },
  { themeId: 'newyear', name: 'Año Nuevo: Nuevos Comienzos', icon: '🎆', dates: '31 Dic - 6 Ene', category: 'Festividad' },
  { themeId: 'valentines', name: 'San Valentín y Empatía', icon: '💗', dates: '7 Feb - 17 Feb', category: 'Festividad' },
  { themeId: 'anniversary', name: 'Aniversario de EquilibrIA', icon: '🎉', dates: '1 Mar - 10 Mar', category: 'Oficial' },
  { themeId: 'spring', name: 'Primavera', icon: '🌸', dates: '20 Mar - 20 Jun', category: 'Estación' },
  { themeId: 'environment', name: 'Día del Medio Ambiente', icon: '🌱', dates: '1 Jun - 10 Jun', category: 'Conciencia' },
  { themeId: 'summer', name: 'Verano', icon: '☀️', dates: '21 Jun - 31 Ago', category: 'Estación' },
  { themeId: 'guatemala', name: 'Orgullo e Independencia', icon: '🇬🇹', dates: '1 Sep - 30 Sep (Mes Patrio)', category: 'Cultural' },
  { themeId: 'halloween', name: 'Halloween Mágico', icon: '🎃', dates: '1 Oct - 2 Nov (Mes de Halloween)', category: 'Festividad' },
  { themeId: 'graduation', name: 'Graduación y Logro', icon: '🎓', dates: '3 Nov - 25 Nov', category: 'Logro' },
  { themeId: 'autumn', name: 'Otoño', icon: '🍂', dates: '26 Nov - 30 Nov', category: 'Estación' },
  { themeId: 'christmas', name: 'Navidad y Paz', icon: '🎄', dates: '1 Dic - 30 Dic (Mes Navideño)', category: 'Festividad' },
  { themeId: 'winter', name: 'Invierno', icon: '❄️', dates: 'Enero - Marzo (Resto)', category: 'Estación' }
];
