import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HlmCalendarMonthView } from './hlm-calendar-month-view';
import { HlmCalendarYearView } from './hlm-calendar-year-view';

describe('HlmCalendarMonthView', () => {
    let fixture: ComponentFixture<HlmCalendarMonthView<Date>>;
    const buttons = () => fixture.debugElement.queryAll(By.css('button'));

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HlmCalendarMonthView] });
        fixture = TestBed.createComponent(HlmCalendarMonthView<Date>);
    });

    it('resalta el rango y deshabilita los meses fuera de min/max', () => {
        fixture.componentRef.setInput('focusedDate', new Date(2026, 5, 15));
        fixture.componentRef.setInput('rangeStart', new Date(2026, 2, 1));
        fixture.componentRef.setInput('rangeEnd', new Date(2026, 8, 1));
        fixture.componentRef.setInput('min', new Date(2026, 3, 1));
        fixture.componentRef.setInput('max', new Date(2026, 9, 1));
        fixture.detectChanges();

        expect(buttons().length).toBe(12);
        expect(fixture.debugElement.query(By.css('button[data-range-start]'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('button[data-range-end]'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('button[data-range-between]'))).toBeTruthy();
        expect(buttons().some((b) => b.nativeElement.disabled)).toBe(true);
    });

    it('sin rango marca el mes enfocado como seleccionado', () => {
        fixture.componentRef.setInput('focusedDate', new Date(2026, 5, 15));
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('button[data-selected]'))).toBeTruthy();
    });

    it('emite monthSelected al hacer click', () => {
        fixture.componentRef.setInput('focusedDate', new Date(2026, 5, 15));
        fixture.detectChanges();
        let emitted: Date | undefined;
        fixture.componentInstance.monthSelected.subscribe((d) => (emitted = d));
        buttons()[0].nativeElement.click();
        expect(emitted).toBeDefined();
    });
});

describe('HlmCalendarYearView', () => {
    let fixture: ComponentFixture<HlmCalendarYearView<Date>>;
    const buttons = () => fixture.debugElement.queryAll(By.css('button'));

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HlmCalendarYearView] });
        fixture = TestBed.createComponent(HlmCalendarYearView<Date>);
    });

    it('resalta rango, años fuera de la década y deshabilita fuera de min/max', () => {
        fixture.componentRef.setInput('focusedDate', new Date(2026, 5, 15));
        fixture.componentRef.setInput('rangeStart', new Date(2022, 0, 1));
        fixture.componentRef.setInput('rangeEnd', new Date(2028, 0, 1));
        fixture.componentRef.setInput('min', new Date(2021, 0, 1));
        fixture.componentRef.setInput('max', new Date(2029, 0, 1));
        fixture.detectChanges();

        expect(buttons().length).toBe(12);
        expect(fixture.debugElement.query(By.css('button[data-range-start]'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('button[data-range-end]'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('button[data-range-between]'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('button[data-outside]'))).toBeTruthy();
        expect(buttons().some((b) => b.nativeElement.disabled)).toBe(true);
    });

    it('sin rango marca el año enfocado y emite yearSelected', () => {
        fixture.componentRef.setInput('focusedDate', new Date(2026, 5, 15));
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('button[data-selected]'))).toBeTruthy();

        let emitted: Date | undefined;
        fixture.componentInstance.yearSelected.subscribe((d) => (emitted = d));
        buttons()[2].nativeElement.click();
        expect(emitted).toBeDefined();
    });
});
