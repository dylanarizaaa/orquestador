import { BrnNativeDateAdapter } from './native-date-adapter';

describe('BrnNativeDateAdapter', () => {
    let adapter: BrnNativeDateAdapter;

    // Fijamos el reloj para que las ramas `?? now.getX()` sean deterministas.
    const FIXED = new Date(2026, 5, 15, 10, 20, 30, 400); // 15-jun-2026 10:20:30.400 (local)

    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(FIXED);
        adapter = new BrnNativeDateAdapter();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('create()', () => {
        it('construye una fecha con todas las unidades provistas', () => {
            const date = adapter.create({
                year: 2020,
                month: 0,
                day: 5,
                hour: 1,
                minute: 2,
                second: 3,
                millisecond: 4,
            });
            expect(date.getFullYear()).toBe(2020);
            expect(date.getMonth()).toBe(0);
            expect(date.getDate()).toBe(5);
            expect(date.getHours()).toBe(1);
            expect(date.getMinutes()).toBe(2);
            expect(date.getSeconds()).toBe(3);
            expect(date.getMilliseconds()).toBe(4);
        });

        it('usa la fecha/hora actual para las unidades omitidas', () => {
            const date = adapter.create({});
            expect(date.getFullYear()).toBe(2026);
            expect(date.getMonth()).toBe(5);
            expect(date.getDate()).toBe(15);
            expect(date.getHours()).toBe(10);
            expect(date.getMinutes()).toBe(20);
            expect(date.getSeconds()).toBe(30);
            expect(date.getMilliseconds()).toBe(400);
        });
    });

    it('now() devuelve la fecha actual', () => {
        expect(adapter.now().getTime()).toBe(FIXED.getTime());
    });

    describe('set()', () => {
        const base = new Date(2000, 1, 2, 3, 4, 5, 6);

        it('reemplaza solo las unidades provistas', () => {
            const result = adapter.set(base, { year: 2030, day: 20 });
            expect(result.getFullYear()).toBe(2030);
            expect(result.getMonth()).toBe(1);
            expect(result.getDate()).toBe(20);
            expect(result.getHours()).toBe(3);
            expect(result.getMinutes()).toBe(4);
            expect(result.getSeconds()).toBe(5);
            expect(result.getMilliseconds()).toBe(6);
        });

        it('conserva todas las unidades de la fecha original si no se pasa ninguna', () => {
            const result = adapter.set(base, {});
            expect(result.getTime()).toBe(base.getTime());
        });
    });

    describe('add()', () => {
        const base = new Date(2026, 5, 15, 10, 0, 0, 0);

        it('suma la duración indicada', () => {
            const result = adapter.add(base, {
                years: 1,
                months: 1,
                days: 1,
                hours: 1,
                minutes: 1,
                seconds: 1,
                milliseconds: 1,
            });
            expect(result.getFullYear()).toBe(2027);
            expect(result.getMonth()).toBe(6);
            expect(result.getDate()).toBe(16);
            expect(result.getHours()).toBe(11);
            expect(result.getMinutes()).toBe(1);
            expect(result.getSeconds()).toBe(1);
            expect(result.getMilliseconds()).toBe(1);
        });

        it('trata las unidades omitidas como 0', () => {
            const result = adapter.add(base, {});
            expect(result.getTime()).toBe(base.getTime());
        });
    });

    describe('subtract()', () => {
        const base = new Date(2026, 5, 15, 10, 0, 0, 0);

        it('resta la duración indicada', () => {
            const result = adapter.subtract(base, { years: 1, months: 1, days: 1 });
            expect(result.getFullYear()).toBe(2025);
            expect(result.getMonth()).toBe(4);
            expect(result.getDate()).toBe(14);
        });

        it('trata las unidades omitidas como 0', () => {
            const result = adapter.subtract(base, {});
            expect(result.getTime()).toBe(base.getTime());
        });
    });

    describe('compare()', () => {
        it('devuelve 0 cuando son iguales', () => {
            const a = new Date(2026, 0, 1);
            expect(adapter.compare(a, new Date(2026, 0, 1))).toBe(0);
        });

        it('devuelve 1 cuando a es posterior a b', () => {
            expect(adapter.compare(new Date(2026, 0, 2), new Date(2026, 0, 1))).toBe(1);
        });

        it('devuelve -1 cuando a es anterior a b', () => {
            expect(adapter.compare(new Date(2026, 0, 1), new Date(2026, 0, 2))).toBe(-1);
        });
    });

    describe('comparadores booleanos', () => {
        const a = new Date(2026, 0, 1);
        const b = new Date(2026, 0, 2);

        it('isEqual()', () => {
            expect(adapter.isEqual(a, new Date(2026, 0, 1))).toBe(true);
            expect(adapter.isEqual(a, b)).toBe(false);
        });

        it('isBefore()', () => {
            expect(adapter.isBefore(a, b)).toBe(true);
            expect(adapter.isBefore(b, a)).toBe(false);
        });

        it('isAfter()', () => {
            expect(adapter.isAfter(b, a)).toBe(true);
            expect(adapter.isAfter(a, b)).toBe(false);
        });

        it('isSameDay()', () => {
            expect(adapter.isSameDay(new Date(2026, 0, 1, 8), new Date(2026, 0, 1, 20))).toBe(true);
            expect(adapter.isSameDay(a, b)).toBe(false);
        });

        it('isSameMonth()', () => {
            expect(adapter.isSameMonth(new Date(2026, 0, 1), new Date(2026, 0, 28))).toBe(true);
            expect(adapter.isSameMonth(new Date(2026, 0, 1), new Date(2026, 1, 1))).toBe(false);
        });

        it('isSameYear()', () => {
            expect(adapter.isSameYear(new Date(2026, 0, 1), new Date(2026, 11, 31))).toBe(true);
            expect(adapter.isSameYear(new Date(2026, 0, 1), new Date(2027, 0, 1))).toBe(false);
        });
    });

    describe('getters', () => {
        const date = new Date(2026, 5, 15, 10, 20, 30, 400); // lunes 15-jun-2026

        it('exponen cada componente de la fecha', () => {
            expect(adapter.getYear(date)).toBe(2026);
            expect(adapter.getMonth(date)).toBe(5);
            expect(adapter.getDate(date)).toBe(15);
            expect(adapter.getDay(date)).toBe(date.getDay());
            expect(adapter.getHours(date)).toBe(10);
            expect(adapter.getMinutes(date)).toBe(20);
            expect(adapter.getSeconds(date)).toBe(30);
            expect(adapter.getMilliseconds(date)).toBe(400);
            expect(adapter.getTime(date)).toBe(date.getTime());
        });
    });

    describe('límites de mes y día', () => {
        const date = new Date(2026, 1, 10, 8, 30); // febrero 2026

        it('startOfMonth() devuelve el día 1 a medianoche', () => {
            const result = adapter.startOfMonth(date);
            expect(result.getDate()).toBe(1);
            expect(result.getMonth()).toBe(1);
            expect(result.getHours()).toBe(0);
        });

        it('endOfMonth() devuelve el último día del mes', () => {
            const result = adapter.endOfMonth(date);
            expect(result.getMonth()).toBe(1);
            expect(result.getDate()).toBe(28); // 2026 no es bisiesto
        });

        it('startOfDay() pone la hora a 00:00:00.000', () => {
            const result = adapter.startOfDay(date);
            expect(result.getHours()).toBe(0);
            expect(result.getMinutes()).toBe(0);
            expect(result.getSeconds()).toBe(0);
            expect(result.getMilliseconds()).toBe(0);
        });

        it('endOfDay() pone la hora a 23:59:59.999', () => {
            const result = adapter.endOfDay(date);
            expect(result.getHours()).toBe(23);
            expect(result.getMinutes()).toBe(59);
            expect(result.getSeconds()).toBe(59);
            expect(result.getMilliseconds()).toBe(999);
        });
    });
});
