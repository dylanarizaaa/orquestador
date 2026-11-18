import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrnCalendar } from './brn-calendar';
import { BrnCalendarNextButton } from './brn-calendar-next-button';
import { BrnCalendarPreviousButton } from './brn-calendar-previous-button';

@Component({
    template: `<div brnCalendar [defaultFocusedDate]="focus()" [min]="min()" [max]="max()">
        <button brnCalendarPreviousButton>prev</button>
        <button brnCalendarNextButton>next</button>
    </div>`,
    imports: [BrnCalendar, BrnCalendarNextButton, BrnCalendarPreviousButton],
})
class HostComponent {
    focus = signal<Date>(new Date(2026, 5, 15));
    min = signal<Date | undefined>(undefined);
    max = signal<Date | undefined>(undefined);
}

describe('BrnCalendarNextButton / BrnCalendarPreviousButton', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;
    let calendar: BrnCalendar<Date>;

    const next = () => fixture.debugElement.query(By.directive(BrnCalendarNextButton)).nativeElement as HTMLButtonElement;
    const prev = () =>
        fixture.debugElement.query(By.directive(BrnCalendarPreviousButton)).nativeElement as HTMLButtonElement;

    const build = () => {
        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
        calendar = fixture.debugElement.query(By.directive(BrnCalendar)).injector.get(BrnCalendar) as BrnCalendar<Date>;
    };

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
    });

    it('expone aria-labels', () => {
        build();
        expect(next().getAttribute('aria-label')).toBe('Go to the next month');
        expect(prev().getAttribute('aria-label')).toBe('Go to the previous month');
    });

    it('avanza y retrocede un mes conservando el día', () => {
        build();
        next().click();
        fixture.detectChanges();
        expect(calendar.focusedDate().getMonth()).toBe(6);
        expect(calendar.focusedDate().getDate()).toBe(15);

        prev().click();
        prev().click();
        fixture.detectChanges();
        expect(calendar.focusedDate().getMonth()).toBe(4);
    });

    it('botón siguiente recorta el día al último del mes destino (overflow)', () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        host.focus.set(new Date(2026, 0, 31)); // 31 de enero
        fixture.detectChanges();
        calendar = fixture.debugElement.query(By.directive(BrnCalendar)).injector.get(BrnCalendar) as BrnCalendar<Date>;

        next().click();
        fixture.detectChanges();
        expect(calendar.focusedDate().getMonth()).toBe(1); // febrero
        expect(calendar.focusedDate().getDate()).toBe(28); // recortado
    });

    it('botón anterior recorta el día al último del mes destino (overflow)', () => {
        build();
        host.focus.set(new Date(2026, 2, 31)); // 31 de marzo
        fixture.detectChanges();
        prev().click();
        fixture.detectChanges();
        expect(calendar.focusedDate().getMonth()).toBe(1); // febrero
        expect(calendar.focusedDate().getDate()).toBe(28);
    });

    it('cuando la fecha destino queda fuera del rango por max, enfoca la fecha sin restringir', () => {
        build();
        host.max.set(new Date(2026, 5, 10)); // max 10 de junio (mes enfocado)
        fixture.detectChanges();
        next().click(); // intenta ir a julio 15
        fixture.detectChanges();
        expect(calendar.focusedDate().getMonth()).toBe(6); // julio (target sin restringir)
    });
});
