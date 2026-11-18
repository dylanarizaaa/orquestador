import { JalaliDate } from './jalali-date';
import { PersianDate } from './persian-date';

describe('JalaliDate', () => {
    it('expone year, month y day del constructor', () => {
        const date = new JalaliDate(1405, 3, 25);
        expect(date.year).toBe(1405);
        expect(date.month).toBe(3);
        expect(date.day).toBe(25);
    });

    it('valueOf() devuelve el timestamp gregoriano equivalente', () => {
        const date = new JalaliDate(1405, 3, 25);
        const [gy, gm, gd] = PersianDate.jalaliToGregorian(1405, 3, 25);
        expect(date.valueOf()).toBe(new Date(gy, gm - 1, gd).getTime());
    });

    it('toString() formatea como YYYY/MM/DD con relleno de ceros', () => {
        expect(new JalaliDate(1405, 3, 5).toString()).toBe('1405/03/05');
        expect(new JalaliDate(1405, 12, 29).toString()).toBe('1405/12/29');
    });

    it('permite comparaciones numéricas a través de valueOf()', () => {
        const earlier = new JalaliDate(1405, 1, 1);
        const later = new JalaliDate(1405, 1, 2);
        expect(earlier.valueOf()).toBeLessThan(later.valueOf());
        expect(later > earlier).toBe(true);
    });
});
