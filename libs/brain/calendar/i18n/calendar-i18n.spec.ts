import { TestBed } from '@angular/core/testing';
import { BrnCalendarI18nService, injectBrnCalendarI18n, provideBrnCalendarI18n } from './calendar-i18n';

describe('BrnCalendarI18nService', () => {
    it('la configuración por defecto formatea correctamente', () => {
        const service = new BrnCalendarI18nService();
        const config = service.config();

        expect(config.formatWeekdayName(0)).toBe('Su');
        expect(config.months()).toHaveLength(12);
        expect(config.firstDayOfWeek()).toBe(0);
        expect(config.labelWeekday(1)).toBe('Monday');
        expect(config.labelPrevious()).toContain('previous');
        expect(config.labelNext()).toContain('next');
        expect(typeof config.formatHeader(5, 2026)).toBe('string');
        expect(typeof config.formatMonth(5)).toBe('string');
        expect(typeof config.formatYear(2026)).toBe('string');

        expect(config.years()[0]).toBe(1925);
        expect(config.years(2000, 2005)).toEqual([2000, 2001, 2002, 2003, 2004, 2005]);
    });

    it('use fusiona configuración parcial conservando el resto', () => {
        const service = new BrnCalendarI18nService();
        service.use({ firstDayOfWeek: () => 1 });
        expect(service.config().firstDayOfWeek()).toBe(1);
        expect(service.config().formatWeekdayName(0)).toBe('Su');
    });

    it('provideBrnCalendarI18n crea el servicio con configuración propia', () => {
        TestBed.configureTestingModule({
            providers: [provideBrnCalendarI18n({ firstDayOfWeek: () => 3 } as never)],
        });
        const service = TestBed.runInInjectionContext(() => injectBrnCalendarI18n());
        expect(service.config().firstDayOfWeek()).toBe(3);
    });

    it('provideBrnCalendarI18n sin argumentos usa la configuración por defecto', () => {
        TestBed.configureTestingModule({ providers: [provideBrnCalendarI18n()] });
        const service = TestBed.runInInjectionContext(() => injectBrnCalendarI18n());
        expect(service.config().firstDayOfWeek()).toBe(0);
    });
});
