/**
 * Calendario de Temporadas y Temáticas de EquilibrIA
 * Sincronizado con la detección inteligente por fecha, festividades y cumpleaños.
 */
import { resolveAutomatedTheme, THEME_CALENDAR_SCHEDULE } from '../utils/themeSchedule';
import { THEMES } from './themeConfig';

export const SEASONAL_SCHEDULE = THEME_CALENDAR_SCHEDULE;

/**
 * Obtiene la temática de temporada activa según la fecha actual y el usuario en sesión.
 * @param {Object} [user=null]
 * @param {Date} [date=new Date()]
 * @returns {Object} { id, name, icon, title, isBirthday, detail }
 */
export const getActiveSeasonalTheme = (user = null, date = new Date()) => {
  const resolved = resolveAutomatedTheme(user, date);
  const themeObj = THEMES.find(t => t.id === resolved.themeId);
  return {
    id: resolved.themeId,
    name: themeObj ? themeObj.name : resolved.reason,
    icon: resolved.icon,
    title: resolved.reason,
    isBirthday: resolved.isBirthday,
    detail: resolved.detail
  };
};
