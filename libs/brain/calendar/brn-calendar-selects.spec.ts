import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrnSelect } from '@brain/select';
import { HlmSelectImports } from '@helm/select';
import { BrnCalendar } from './brn-calendar';
import { BrnCalendarMonthSelect } from './brn-calendar-month-select';
import { BrnCalendarYearSelect } from './brn-calendar-year-select';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

@Component({
    template: `<div brnCalendar [defaultFocusedDate]="focus()">
        <hlm-select brnCalendarMonthSelect>
            <hlm-select-trigger><hlm-select-value /></hlm-select-trigger>
            <hlm-select-content *hlmSelectPortal>
                @for (m of months; track m) {
                    <hlm-select-item [value]="m">{{ m }}</hlm-select-item>
                }
            </hlm-select-content>
        </hlm-select>
    </div>`,
    imports: [BrnCalendar, BrnCalendarMonthSelect, HlmSelectImports],
})
class MonthHost {
    focus = signal(new Date(2026, 5, 15));
    months = MONTHS;
}

@Component({
    template: `<div brnCalendar [defaultFocusedDate]="focus()">
        <hlm-select brnCalendarYearSelect>
            <hlm-select-trigger><hlm-select-value /></hlm-select-trigger>
            <hlm-select-content *hlmSelectPortal>
                @for (y of years; track y) {
                    <hlm-select-item [value]="y">{{ y }}</hlm-select-item>
                }
            </hlm-select-content>
        </hlm-select>
    </div>`,
    imports: [BrnCalendar, BrnCalendarYearSelect, HlmSelectImports],
})
class YearHost {
    focus = signal(new Date(2026, 5, 15));
    years = [2024, 2025, 2026, 2027, 2028];
}

describe('BrnCalendarMonthSelect', () => {
    let fixture: ComponentFixture<MonthHost>;
    let select: BrnSelect<string>;
    let calendar: BrnCalendar<Date>;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [MonthHost] });
        fixture = TestBed.createComponent(MonthHost);
        fixture.detectChanges();
        select = fixture.debugElement.query(By.css('hlm-select')).injector.get(BrnSelect) as BrnSelect<string>;
        calendar = fixture.debugElement.query(By.directive(BrnCalendar)).injector.get(BrnCalendar) as BrnCalendar<Date>;
    });

    it('sincroniza el mes enfocado en el select', () => {
        expect(select.value()).toBe('Jun');
    });

    it('al elegir un mes actualiza el mes enfocado del calendario', () => {
        select.select('Mar');
        fixture.detectChanges();
        expect(calendar.focusedDate().getMonth()).toBe(2);
    });
});

describe('BrnCalendarYearSelect', () => {
    let fixture: ComponentFixture<YearHost>;
    let select: BrnSelect<number>;
    let calendar: BrnCalendar<Date>;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [YearHost] });
        fixture = TestBed.createComponent(YearHost);
        fixture.detectChanges();
        select = fixture.debugElement.query(By.css('hlm-select')).injector.get(BrnSelect) as BrnSelect<number>;
        calendar = fixture.debugElement.query(By.directive(BrnCalendar)).injector.get(BrnCalendar) as BrnCalendar<Date>;
    });

    it('sincroniza el año enfocado en el select', () => {
        expect(select.value()).toBe(2026);
    });

    it('al elegir un año actualiza el año enfocado del calendario', () => {
        select.select(2024);
        fixture.detectChanges();
        expect(calendar.focusedDate().getFullYear()).toBe(2024);
    });
});
