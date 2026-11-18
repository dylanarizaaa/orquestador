import {
  calendarI18nConfig,
  datePickerConfig,
  datePickerMultiConfig,
  dateProviderConfig,
  dateRangePickerConfig,
  formatDate,
} from './date.provider';

describe('date.provider', () => {
  const jan5 = new Date(2026, 0, 5);
  const jan10 = new Date(2026, 0, 10);

  describe('formatDate', () => {
    it('formats a JS date as dd/MM/yyyy', () => {
      expect(formatDate(jan5)).toBe('05/01/2026');
    });
  });

  describe('calendarI18nConfig', () => {
    it('maps weekday indexes to short and long Spanish labels', () => {
      expect(calendarI18nConfig.formatWeekdayName(0)).toBe('DOM');
      expect(calendarI18nConfig.formatWeekdayName(6)).toBe('SAB');
      expect(calendarI18nConfig.labelWeekday(1)).toBe('Lunes');
    });

    it('exposes the short month labels', () => {
      const months = calendarI18nConfig.months();
      expect(months[0]).toBe('Ene');
      expect(months[11]).toBe('Dic');
      expect(calendarI18nConfig.formatMonth(2)).toBe('Mar');
    });

    it('builds an inclusive year range from the given bounds', () => {
      expect(calendarI18nConfig.years(2000, 2002)).toEqual([2000, 2001, 2002]);
    });

    it('defaults the year range from 1925 to next year', () => {
      const years = calendarI18nConfig.years();
      expect(years[0]).toBe(1925);
      expect(years[years.length - 1]).toBe(new Date().getFullYear() + 1);
    });

    it('formats header, year and navigation labels', () => {
      expect(calendarI18nConfig.formatHeader(0, 2026)).toBe('Enero 2026');
      expect(calendarI18nConfig.formatYear(2026)).toBe('2026');
      expect(calendarI18nConfig.labelPrevious()).toBe('Ir al mes anterior');
      expect(calendarI18nConfig.labelNext()).toBe('Ir al mes siguiente');
      expect(calendarI18nConfig.firstDayOfWeek()).toBe(0);
    });
  });

  describe('dateRangePickerConfig', () => {
    it('formats a full range', () => {
      expect(dateRangePickerConfig.formatDates([jan5, jan10])).toBe('05/01/2026 - 10/01/2026');
    });

    it('uses the DD/MM/AAAA placeholder for missing bounds', () => {
      expect(dateRangePickerConfig.formatDates([undefined, undefined])).toBe('DD/MM/AAAA - DD/MM/AAAA');
      expect(dateRangePickerConfig.formatDates([jan5, undefined])).toBe('05/01/2026 - DD/MM/AAAA');
    });
  });

  describe('datePickerMultiConfig', () => {
    it('joins multiple formatted dates with commas', () => {
      expect(datePickerMultiConfig.formatDates([jan5, jan10])).toBe('05/01/2026, 10/01/2026');
    });
  });

  describe('datePickerConfig', () => {
    it('reuses the shared dd/MM/yyyy formatter', () => {
      expect(datePickerConfig.formatDate(jan10)).toBe('10/01/2026');
    });
  });

  it('exposes the four date-related providers', () => {
    expect(dateProviderConfig).toHaveLength(4);
  });
});
