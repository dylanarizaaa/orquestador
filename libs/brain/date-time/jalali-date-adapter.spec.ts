import { BrnJalaliDateAdapter } from './jalali-date-adapter';
import { JalaliDate } from './jalali-date';
import { PersianDate } from './persian-date';

describe('BrnJalaliDateAdapter', () => {
    let adapter: BrnJalaliDateAdapter;

    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(2026, 5, 15)); // 15-jun-2026
        adapter = new BrnJalaliDateAdapter();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('now() / create()', () => {
        it('now() devuelve una JalaliDate válida para la fecha actual', () => {
            const now = adapter.now();
            expect(now).toBeInstanceOf(JalaliDate);
            const [jy, jm, jd] = PersianDate.gregorianToJalali(2026, 6, 15);
            expect([now.year, now.month, now.day]).toEqual([jy, jm, jd]);
        });

        it('create() con year/month/day aplica el offset de mes (+1) y conserva el año', () => {
            const date = adapter.create({ year: 1405, month: 2, day: 10 });
            expect(date.year).toBe(1405);
            expect(date.month).toBe(3); // month 2 (0-based) -> 3 (1-based)
            expect(date.day).toBe(10);
        });

        it('create({}) cae en los valores de "hoy"', () => {
            const date = adapter.create({});
            const now = adapter.now();
            expect(date.year).toBe(now.year);
            expect(date.month).toBe(now.month);
            expect(date.day).toBe(now.day);
        });

        it('create() restringe el día al máximo del mes', () => {
            const date = adapter.create({ year: 1404, month: 11, day: 31 }); // mes 12 común -> máx 29
            expect(date.month).toBe(12);
            expect(date.day).toBe(29);
        });
    });

    describe('set()', () => {
        const base = new JalaliDate(1405, 3, 15);

        it('reemplaza solo las unidades provistas (month con offset +1)', () => {
            const result = adapter.set(base, { month: 5 });
            expect(result.year).toBe(1405);
            expect(result.month).toBe(6);
            expect(result.day).toBe(15);
        });

        it('conserva la fecha si no se pasa ninguna unidad', () => {
            const result = adapter.set(base, {});
            expect([result.year, result.month, result.day]).toEqual([1405, 3, 15]);
        });

        it('restringe el día tras el cambio', () => {
            const result = adapter.set(new JalaliDate(1404, 12, 29), { day: 30 });
            expect(result.day).toBe(29);
        });
    });

    describe('add()', () => {
        it('suma años', () => {
            const result = adapter.add(new JalaliDate(1405, 3, 15), { years: 2 });
            expect(result.year).toBe(1407);
            expect(result.month).toBe(3);
        });

        it('maneja desbordamiento de meses hacia adelante', () => {
            const result = adapter.add(new JalaliDate(1405, 11, 15), { months: 3 });
            expect(result.year).toBe(1406);
            expect(result.month).toBe(2);
            expect(result.day).toBe(15);
        });

        it('maneja desbordamiento de meses hacia atrás', () => {
            const result = adapter.add(new JalaliDate(1405, 2, 15), { months: -4 });
            expect(result.year).toBe(1404);
            expect(result.month).toBe(10);
            expect(result.day).toBe(15);
        });

        it('suma días convirtiendo a gregoriano y de vuelta', () => {
            const result = adapter.add(new JalaliDate(1405, 1, 1), { days: 5 });
            expect(result.year).toBe(1405);
            expect(result.month).toBe(1);
            expect(result.day).toBe(6);
        });

        it('sin duración devuelve la misma fecha', () => {
            const result = adapter.add(new JalaliDate(1405, 1, 1), {});
            expect([result.year, result.month, result.day]).toEqual([1405, 1, 1]);
        });
    });

    describe('subtract()', () => {
        it('resta delegando en add() con duraciones negadas', () => {
            const result = adapter.subtract(new JalaliDate(1407, 3, 15), { years: 2 });
            expect(result.year).toBe(1405);
        });

        it('sin duración devuelve la misma fecha', () => {
            const result = adapter.subtract(new JalaliDate(1405, 1, 10), {});
            expect([result.year, result.month, result.day]).toEqual([1405, 1, 10]);
        });
    });

    describe('comparadores', () => {
        const a = new JalaliDate(1405, 1, 1);
        const b = new JalaliDate(1405, 1, 2);

        it('compare() devuelve 0 / 1 / -1', () => {
            expect(adapter.compare(a, new JalaliDate(1405, 1, 1))).toBe(0);
            expect(adapter.compare(b, a)).toBe(1);
            expect(adapter.compare(a, b)).toBe(-1);
        });

        it('isEqual / isBefore / isAfter', () => {
            expect(adapter.isEqual(a, new JalaliDate(1405, 1, 1))).toBe(true);
            expect(adapter.isEqual(a, b)).toBe(false);
            expect(adapter.isBefore(a, b)).toBe(true);
            expect(adapter.isAfter(b, a)).toBe(true);
        });

        it('isSameDay / isSameMonth / isSameYear', () => {
            expect(adapter.isSameDay(a, new JalaliDate(1405, 1, 1))).toBe(true);
            expect(adapter.isSameDay(a, b)).toBe(false);
            expect(adapter.isSameMonth(a, b)).toBe(true);
            expect(adapter.isSameMonth(a, new JalaliDate(1405, 2, 1))).toBe(false);
            expect(adapter.isSameYear(a, new JalaliDate(1405, 12, 1))).toBe(true);
            expect(adapter.isSameYear(a, new JalaliDate(1406, 1, 1))).toBe(false);
        });
    });

    describe('getters', () => {
        const date = new JalaliDate(1405, 3, 25);

        it('getYear / getMonth (0-based) / getDate', () => {
            expect(adapter.getYear(date)).toBe(1405);
            expect(adapter.getMonth(date)).toBe(2); // 1-based 3 -> 0-based 2
            expect(adapter.getDate(date)).toBe(25);
        });

        it('getDay() devuelve el día de la semana gregoriano (0-6)', () => {
            const day = adapter.getDay(date);
            expect(day).toBeGreaterThanOrEqual(0);
            expect(day).toBeLessThanOrEqual(6);
        });

        it('las unidades de tiempo siempre son 0', () => {
            expect(adapter.getHours(date)).toBe(0);
            expect(adapter.getMinutes(date)).toBe(0);
            expect(adapter.getSeconds(date)).toBe(0);
            expect(adapter.getMilliseconds(date)).toBe(0);
        });

        it('getTime() coincide con valueOf()', () => {
            expect(adapter.getTime(date)).toBe(date.valueOf());
        });
    });

    describe('límites de mes y día', () => {
        const date = new JalaliDate(1405, 3, 25);

        it('startOfMonth() devuelve el día 1', () => {
            expect(adapter.startOfMonth(date)).toEqual(new JalaliDate(1405, 3, 1));
        });

        it('endOfMonth() devuelve el último día del mes', () => {
            const result = adapter.endOfMonth(date);
            expect(result.day).toBe(PersianDate.getDaysInMonth(1405, 3));
        });

        it('startOfDay() y endOfDay() devuelven la misma fecha (sin componente horario)', () => {
            expect(adapter.startOfDay(date)).toBe(date);
            expect(adapter.endOfDay(date)).toBe(date);
        });
    });
});
