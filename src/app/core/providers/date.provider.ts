import { provideHlmDatePickerConfig, provideHlmDatePickerMultiConfig, provideHlmDateRangePickerConfig } from '@spartan-ng/helm/date-picker';
import { provideBrnCalendarI18n, type BrnCalendarI18n, type MonthLabels } from '@spartan-ng/brain/calendar';

import { DateTime } from 'luxon';
import { Provider } from '@angular/core';

const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'] as MonthLabels;
const MONTHS_LONG = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const WEEKDAYS_SHORT = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
const WEEKDAYS_LONG = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

/** Formatea una fecha JS al patrón dd/MM/yyyy usado en todo el portal. */
export const formatDate = (date: Date): string => DateTime.fromJSDate(date).toFormat('dd/MM/yyyy');

/** Configuración i18n (español) del calendario de Brain. */
export const calendarI18nConfig: BrnCalendarI18n = {
    formatWeekdayName: (index: number) => WEEKDAYS_SHORT[index],
    labelWeekday: (index: number) => WEEKDAYS_LONG[index],
    months: () => MONTHS_SHORT,
    years: (startYear = 1925, endYear = new Date().getFullYear() + 1) =>
        Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i),
    formatHeader: (month: number, year: number) => `${MONTHS_LONG[month]} ${year}`,
    formatMonth: (month: number) => MONTHS_SHORT[month],
    formatYear: (year: number) => `${year}`,
    labelPrevious: () => 'Ir al mes anterior',
    labelNext: () => 'Ir al mes siguiente',
    firstDayOfWeek: () => 0,
};

/** Formato del rango de fechas: "dd/MM/yyyy - dd/MM/yyyy" (con placeholder si falta alguno). */
export const dateRangePickerConfig = {
    formatDates: ([start, end]: [Date | null | undefined, Date | null | undefined]) => {
        const fmt = (d: Date | null | undefined) => (d ? formatDate(d) : 'DD/MM/AAAA');
        return `${fmt(start)} - ${fmt(end)}`;
    },
};

/** Formato de selección múltiple de fechas, separadas por coma. */
export const datePickerMultiConfig = {
    formatDates: (dates: Date[]) => dates.map(formatDate).join(', '),
};

/** Formato de fecha simple. */
export const datePickerConfig = {
    formatDate,
};

export const dateProviderConfig: Provider[] = [
    provideBrnCalendarI18n(calendarI18nConfig),
    provideHlmDateRangePickerConfig(dateRangePickerConfig),
    provideHlmDatePickerMultiConfig(datePickerMultiConfig),
    provideHlmDatePickerConfig(datePickerConfig),
];
