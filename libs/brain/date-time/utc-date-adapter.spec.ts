import { BrnUtcDateAdapter } from './utc-date-adapter';

describe('BrnUtcDateAdapter', () => {
    let adapter: BrnUtcDateAdapter;

    // Reloj fijo en UTC para que las ramas `?? now.getUTCX()` sean deterministas.
    const FIXED = new Date(Date.UTC(2026, 5, 15, 10, 20, 30, 400));

    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(FIXED);
        adapter = new BrnUtcDateAdapter();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('create()', () => {
        it('construye una fecha UTC con todas las unidades provistas', () => {
            const date = adapter.create({
                year: 2020,
                month: 0,
                day: 5,
                hour: 1,
                minute: 2,
                second: 3,
                millisecond: 4,
            });
            expect(date.getUTCFullYear()).toBe(2020);
            expect(date.getUTCMonth()).toBe(0);
            expect(date.getUTCDate()).toBe(5);
            expect(date.getUTCHours()).toBe(1);
            expect(date.getUTCMinutes()).toBe(2);
            expect(date.getUTCSeconds()).toBe(3);
            expect(date.getUTCMilliseconds()).toBe(4);
        });

        it('usa la fecha/hora UTC actual para las unidades omitidas', () => {
            const date = adapter.create({});
            expect(date.getTime()).toBe(FIXED.getTime());
        });
    });

    it('now() devuelve la fecha actual', () => {
        expect(adapter.now().getTime()).toBe(FIXED.getTime());
    });

    describe('set()', () => {
        const base = new Date(Date.UTC(2000, 1, 2, 3, 4, 5, 6));

        it('reemplaza solo las unidades provistas', () => {
            const result = adapter.set(base, { year: 2030, day: 20 });
            expect(result.getUTCFullYear()).toBe(2030);
            expect(result.getUTCMonth()).toBe(1);
            expect(result.getUTCDate()).toBe(20);
            expect(result.getUTCHours()).toBe(3);
            expect(result.getUTCMilliseconds()).toBe(6);
        });

        it('conserva la fecha original si no se pasa ninguna unidad', () => {
            expect(adapter.set(base, {}).getTime()).toBe(base.getTime());
        });
    });

    describe('add() / subtract()', () => {
        const base = new Date(Date.UTC(2026, 5, 15, 10, 0, 0, 0));

        it('add() suma la duración indicada', () => {
            const result = adapter.add(base, { years: 1, months: 1, days: 1, hours: 2, minutes: 3, seconds: 4, milliseconds: 5 });
            expect(result.getUTCFullYear()).toBe(2027);
            expect(result.getUTCMonth()).toBe(6);
            expect(result.getUTCDate()).toBe(16);
            expect(result.getUTCHours()).toBe(12);
            expect(result.getUTCMinutes()).toBe(3);
            expect(result.getUTCSeconds()).toBe(4);
            expect(result.getUTCMilliseconds()).toBe(5);
        });

        it('add() trata las unidades omitidas como 0', () => {
            expect(adapter.add(base, {}).getTime()).toBe(base.getTime());
        });

        it('subtract() resta la duración indicada', () => {
            const result = adapter.subtract(base, { years: 1, months: 1, days: 1 });
            expect(result.getUTCFullYear()).toBe(2025);
            expect(result.getUTCMonth()).toBe(4);
            expect(result.getUTCDate()).toBe(14);
        });

        it('subtract() trata las unidades omitidas como 0', () => {
            expect(adapter.subtract(base, {}).getTime()).toBe(base.getTime());
        });
    });

    describe('compare()', () => {
        const a = new Date(Date.UTC(2026, 0, 1));

        it('devuelve 0 / 1 / -1 según el orden', () => {
            expect(adapter.compare(a, new Date(Date.UTC(2026, 0, 1)))).toBe(0);
            expect(adapter.compare(new Date(Date.UTC(2026, 0, 2)), a)).toBe(1);
            expect(adapter.compare(a, new Date(Date.UTC(2026, 0, 2)))).toBe(-1);
        });
    });

    describe('comparadores booleanos', () => {
        const a = new Date(Date.UTC(2026, 0, 1));
        const b = new Date(Date.UTC(2026, 0, 2));

        it('isEqual / isBefore / isAfter', () => {
            expect(adapter.isEqual(a, new Date(Date.UTC(2026, 0, 1)))).toBe(true);
            expect(adapter.isEqual(a, b)).toBe(false);
            expect(adapter.isBefore(a, b)).toBe(true);
            expect(adapter.isBefore(b, a)).toBe(false);
            expect(adapter.isAfter(b, a)).toBe(true);
            expect(adapter.isAfter(a, b)).toBe(false);
        });

        it('isSameDay / isSameMonth / isSameYear', () => {
            expect(adapter.isSameDay(new Date(Date.UTC(2026, 0, 1, 8)), new Date(Date.UTC(2026, 0, 1, 20)))).toBe(true);
            expect(adapter.isSameDay(a, b)).toBe(false);
            expect(adapter.isSameMonth(a, new Date(Date.UTC(2026, 0, 28)))).toBe(true);
            expect(adapter.isSameMonth(a, new Date(Date.UTC(2026, 1, 1)))).toBe(false);
            expect(adapter.isSameYear(a, new Date(Date.UTC(2026, 11, 31)))).toBe(true);
            expect(adapter.isSameYear(a, new Date(Date.UTC(2027, 0, 1)))).toBe(false);
        });
    });

    describe('getters', () => {
        const date = new Date(Date.UTC(2026, 5, 15, 10, 20, 30, 400));

        it('exponen cada componente UTC de la fecha', () => {
            expect(adapter.getYear(date)).toBe(2026);
            expect(adapter.getMonth(date)).toBe(5);
            expect(adapter.getDate(date)).toBe(15);
            expect(adapter.getDay(date)).toBe(date.getUTCDay());
            expect(adapter.getHours(date)).toBe(10);
            expect(adapter.getMinutes(date)).toBe(20);
            expect(adapter.getSeconds(date)).toBe(30);
            expect(adapter.getMilliseconds(date)).toBe(400);
            expect(adapter.getTime(date)).toBe(date.getTime());
        });
    });

    describe('límites de mes y día (UTC)', () => {
        const date = new Date(Date.UTC(2026, 1, 10, 8, 30)); // febrero 2026

        it('startOfMonth()', () => {
            const result = adapter.startOfMonth(date);
            expect(result.getUTCDate()).toBe(1);
            expect(result.getUTCMonth()).toBe(1);
            expect(result.getUTCHours()).toBe(0);
        });

        it('endOfMonth()', () => {
            const result = adapter.endOfMonth(date);
            expect(result.getUTCMonth()).toBe(1);
            expect(result.getUTCDate()).toBe(28);
            expect(result.getUTCHours()).toBe(23);
        });

        it('startOfDay()', () => {
            const result = adapter.startOfDay(date);
            expect(result.getUTCHours()).toBe(0);
            expect(result.getUTCMinutes()).toBe(0);
            expect(result.getUTCSeconds()).toBe(0);
            expect(result.getUTCMilliseconds()).toBe(0);
        });

        it('endOfDay()', () => {
            const result = adapter.endOfDay(date);
            expect(result.getUTCHours()).toBe(23);
            expect(result.getUTCMinutes()).toBe(59);
            expect(result.getUTCSeconds()).toBe(59);
            expect(result.getUTCMilliseconds()).toBe(999);
        });
    });
});
