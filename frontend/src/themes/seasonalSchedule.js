/**
 * Calendario de Temporadas de EquilibrIA
 * Permite definir rangos de fechas (mes/día) para activar o sugerir
 * temáticas automáticas según la época del año de forma configurable.
 */

export const SEASONAL_SCHEDULE = [
  {
    themeId: 'newyear',
    name: 'Año Nuevo',
    startMonth: 1,
    startDay: 1,
    endMonth: 1,
    endDay: 15,
    priority: 10
  },
  {
    themeId: 'valentines',
    name: 'San Valentín & Empatía',
    startMonth: 2,
    startDay: 1,
    endMonth: 2,
    endDay: 20,
    priority: 8
  },
  {
    themeId: 'spring',
    name: 'Primavera',
    startMonth: 3,
    startDay: 21,
    endMonth: 5,
    endDay: 31,
    priority: 5
  },
  {
    themeId: 'environment',
    name: 'Día del Medio Ambiente',
    startMonth: 6,
    startDay: 1,
    endMonth: 6,
    endDay: 10,
    priority: 9
  },
  {
    themeId: 'summer',
    name: 'Verano',
    startMonth: 6,
    startDay: 21,
    endMonth: 8,
    endDay: 31,
    priority: 5
  },
  {
    themeId: 'guatemala',
    name: 'Mes Patrio de Guatemala',
    startMonth: 9,
    startDay: 1,
    endMonth: 9,
    endDay: 30,
    priority: 10
  },
  {
    themeId: 'autumn',
    name: 'Otoño',
    startMonth: 9,
    startDay: 21,
    endMonth: 10,
    endDay: 20,
    priority: 5
  },
  {
    themeId: 'halloween',
    name: 'Halloween Mágico',
    startMonth: 10,
    startDay: 21,
    endMonth: 11,
    endDay: 2,
    priority: 9
  },
  {
    themeId: 'graduation',
    name: 'Graduación y Logro',
    startMonth: 11,
    startDay: 3,
    endMonth: 11,
    endDay: 30,
    priority: 7
  },
  {
    themeId: 'christmas',
    name: 'Navidad y Paz',
    startMonth: 12,
    startDay: 1,
    endMonth: 12,
    endDay: 31,
    priority: 10
  }
];

/**
 * Obtiene la temática de temporada activa según la fecha actual.
 * @param {Date} [date=new Date()]
 * @returns {string|null} ID de la temática o null si ninguna aplica
 */
export const getActiveSeasonalTheme = (date = new Date()) => {
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();

  const active = SEASONAL_SCHEDULE.filter(rule => {
    if (rule.startMonth === rule.endMonth) {
      return month === rule.startMonth && day >= rule.startDay && day <= rule.endDay;
    }
    if (rule.startMonth < rule.endMonth) {
      if (month === rule.startMonth) return day >= rule.startDay;
      if (month === rule.endMonth) return day <= rule.endDay;
      return month > rule.startMonth && month < rule.endMonth;
    }
    // Rango cruzando año nuevo (ej. Dic -> Ene)
    if (month === rule.startMonth) return day >= rule.startDay;
    if (month === rule.endMonth) return day <= rule.endDay;
    return month > rule.startMonth || month < rule.endMonth;
  });

  if (active.length === 0) return null;
  active.sort((a, b) => b.priority - a.priority);
  return active[0].themeId;
};
