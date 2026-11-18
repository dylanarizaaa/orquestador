import { PersianDate } from './persian-date';

describe('PersianDate', () => {
    describe('conversiones gregoriano <-> jalali (ida y vuelta)', () => {
        // Conjunto que cubre: años bisiestos gregorianos tras febrero, enero de bisiesto,
        // siglo no bisiesto (1900), año %400 bisiesto (2000), fechas modernas y tempranas.
        const gregorianDates: ReadonlyArray<[number, number, number]> = [
            [2026, 6, 15],
            [2024, 6, 15],
            [2024, 1, 10],
            [1900, 6, 15],
            [2000, 6, 15],
            [1700, 6, 15],
            [2026, 3, 21],
            [1979, 1, 1],
        ];

        it.each(gregorianDates)('gregorianToJalali -> jalaliToGregorian conserva %i-%i-%i', (gy, gm, gd) => {
            const [jy, jm, jd] = PersianDate.gregorianToJalali(gy, gm, gd);
            expect(jy).toBeGreaterThan(0);
            expect(jm).toBeGreaterThanOrEqual(1);
            expect(jm).toBeLessThanOrEqual(12);
            const [ry, rm, rd] = PersianDate.jalaliToGregorian(jy, jm, jd);
            expect([ry, rm, rd]).toEqual([gy, gm, gd]);
        });

        it('jalaliToGregorian -> gregorianToJalali conserva fechas jalali tempranas y modernas', () => {
            const jalaliDates: ReadonlyArray<[number, number, number]> = [
                [979, 1, 1],
                [1404, 12, 29],
                [1405, 1, 1],
                [1399, 12, 30],
            ];
            for (const [jy, jm, jd] of jalaliDates) {
                const [gy, gm, gd] = PersianDate.jalaliToGregorian(jy, jm, jd);
                expect(PersianDate.gregorianToJalali(gy, gm, gd)).toEqual([jy, jm, jd]);
            }
        });
    });

    describe('isLeapJalaliYear()', () => {
        it('reconoce años bisiestos jalali', () => {
            expect(PersianDate.isLeapJalaliYear(1403)).toBe(true); // 1403 % 33 = 17
            expect(PersianDate.isLeapJalaliYear(1399)).toBe(true); // 1399 % 33 = 13
        });

        it('reconoce años comunes', () => {
            expect(PersianDate.isLeapJalaliYear(1404)).toBe(false); // 1404 % 33 = 18
            expect(PersianDate.isLeapJalaliYear(1405)).toBe(false);
        });
    });

    describe('getDaysInMonth()', () => {
        it('los primeros 6 meses tienen 31 días', () => {
            expect(PersianDate.getDaysInMonth(1404, 1)).toBe(31);
            expect(PersianDate.getDaysInMonth(1404, 6)).toBe(31);
        });

        it('los meses 7 a 11 tienen 30 días', () => {
            expect(PersianDate.getDaysInMonth(1404, 7)).toBe(30);
            expect(PersianDate.getDaysInMonth(1404, 11)).toBe(30);
        });

        it('el mes 12 tiene 30 días en año bisiesto y 29 en común', () => {
            expect(PersianDate.getDaysInMonth(1403, 12)).toBe(30); // bisiesto
            expect(PersianDate.getDaysInMonth(1404, 12)).toBe(29); // común
        });

        it('devuelve 0 para meses fuera de rango', () => {
            expect(PersianDate.getDaysInMonth(1404, 0)).toBe(0);
            expect(PersianDate.getDaysInMonth(1404, 13)).toBe(0);
        });
    });

    describe('getDaysInYear()', () => {
        it('366 en bisiesto, 365 en común', () => {
            expect(PersianDate.getDaysInYear(1403)).toBe(366);
            expect(PersianDate.getDaysInYear(1404)).toBe(365);
        });
    });

    describe('getDayOfWeek()', () => {
        it('devuelve un día de la semana válido (0-6)', () => {
            const dow = PersianDate.getDayOfWeek(1405, 1, 1);
            expect(dow).toBeGreaterThanOrEqual(0);
            expect(dow).toBeLessThanOrEqual(6);
            const [gy, gm, gd] = PersianDate.jalaliToGregorian(1405, 1, 1);
            expect(dow).toBe(new Date(gy, gm - 1, gd).getDay());
        });
    });

    describe('isValidDate()', () => {
        it('acepta fechas válidas', () => {
            expect(PersianDate.isValidDate(1404, 1, 31)).toBe(true);
            expect(PersianDate.isValidDate(1403, 12, 30)).toBe(true);
        });

        it('rechaza año negativo', () => {
            expect(PersianDate.isValidDate(-1, 1, 1)).toBe(false);
        });

        it('rechaza mes fuera de rango', () => {
            expect(PersianDate.isValidDate(1404, 0, 1)).toBe(false);
            expect(PersianDate.isValidDate(1404, 13, 1)).toBe(false);
        });

        it('rechaza día menor a 1', () => {
            expect(PersianDate.isValidDate(1404, 1, 0)).toBe(false);
        });

        it('rechaza día que excede los días del mes', () => {
            expect(PersianDate.isValidDate(1404, 12, 30)).toBe(false); // común: máx 29
        });
    });
});
