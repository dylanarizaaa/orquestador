import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrnCalendar } from './brn-calendar';

@Component({
    template: `<div
        brnCalendar
        [min]="min()"
        [max]="max()"
        [date]="date()"
        [disabled]="disabled()"
        [dateDisabled]="dateDisabled()"
        [weekStartsOn]="weekStartsOn()"
        [defaultFocusedDate]="defaultFocusedDate()"
        [highlightDays]="highlightDays()"
    ></div>`,
    imports: [BrnCalendar],
})
class HostComponent {
    min = signal<Date | undefined>(undefined);
    max = signal<Date | undefined>(undefined);
    date = signal<Date | undefined>(undefined);
    disabled = signal(false);
    dateDisabled = signal<(d: Date) => boolean>(() => false);
    weekStartsOn = signal<number | undefined>(undefined);
    defaultFocusedDate = signal<Date | undefined>(new Date(2026, 5, 15));
    highlightDays = signal<Date[]>([]);
}

describe('BrnCalendar', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;
    let calendar: BrnCalendar<Date>;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
        calendar = fixture.debugElement.query(By.directive(BrnCalendar)).injector.get(BrnCalendar) as BrnCalendar<Date>;
    });

    it('se crea y enfoca la fecha por defecto', () => {
        expect(calendar).toBeTruthy();
        expect(calendar.focusedDate().getFullYear()).toBe(2026);
        expect(calendar.focusedDate().getMonth()).toBe(5);
    });

    describe('constrainDate', () => {
        it('devuelve la fecha cuando no hay min ni max', () => {
            const d = new Date(2026, 5, 15);
            expect(calendar.constrainDate(d)).toBe(d);
        });

        it('devuelve min cuando la fecha es anterior a min', () => {
            const min = new Date(2026, 5, 10);
            host.min.set(min);
            fixture.detectChanges();
            expect(calendar.constrainDate(new Date(2026, 5, 1))).toBe(min);
        });

        it('devuelve max cuando la fecha es posterior a max', () => {
            const max = new Date(2026, 5, 20);
            host.max.set(max);
            fixture.detectChanges();
            expect(calendar.constrainDate(new Date(2026, 5, 28))).toBe(max);
        });

        it('devuelve la fecha cuando está dentro del rango', () => {
            host.min.set(new Date(2026, 5, 1));
            host.max.set(new Date(2026, 5, 30));
            fixture.detectChanges();
            const d = new Date(2026, 5, 15);
            expect(calendar.constrainDate(d)).toBe(d);
        });
    });

    describe('isDateDisabled', () => {
        it('true cuando el calendario está deshabilitado', () => {
            host.disabled.set(true);
            fixture.detectChanges();
            expect(calendar.isDateDisabled(new Date(2026, 5, 15))).toBe(true);
        });

        it('true cuando la fecha es anterior a min', () => {
            host.min.set(new Date(2026, 5, 10));
            fixture.detectChanges();
            expect(calendar.isDateDisabled(new Date(2026, 5, 5))).toBe(true);
        });

        it('true cuando la fecha es posterior a max', () => {
            host.max.set(new Date(2026, 5, 20));
            fixture.detectChanges();
            expect(calendar.isDateDisabled(new Date(2026, 5, 25))).toBe(true);
        });

        it('true cuando dateDisabled lo determina', () => {
            host.dateDisabled.set((d) => d.getDate() === 15);
            fixture.detectChanges();
            expect(calendar.isDateDisabled(new Date(2026, 5, 15))).toBe(true);
        });

        it('false para una fecha válida', () => {
            expect(calendar.isDateDisabled(new Date(2026, 5, 15))).toBe(false);
        });
    });

    describe('selección', () => {
        it('isSelected es false cuando no hay fecha seleccionada', () => {
            expect(calendar.isSelected(new Date(2026, 5, 15))).toBe(false);
        });

        it('isSelected es true para el mismo día seleccionado', () => {
            host.date.set(new Date(2026, 5, 15));
            fixture.detectChanges();
            expect(calendar.isSelected(new Date(2026, 5, 15))).toBe(true);
            expect(calendar.isSelected(new Date(2026, 5, 16))).toBe(false);
        });

        it('selectDate fija la fecha y el foco', () => {
            const d = new Date(2026, 5, 12);
            calendar.selectDate(d);
            expect(calendar.date()).toBe(d);
            expect(calendar.focusedDate()).toBe(d);
        });

        it('selectDate sobre la fecha seleccionada la limpia', () => {
            host.date.set(new Date(2026, 5, 12));
            fixture.detectChanges();
            calendar.selectDate(new Date(2026, 5, 12));
            expect(calendar.date()).toBeUndefined();
        });
    });

    describe('days()', () => {
        it('devuelve una cuadrícula completa (múltiplo de 7) que incluye el mes enfocado', () => {
            const days = calendar.days();
            expect(days.length % 7).toBe(0);
            expect(days.some((d) => d.getMonth() === 5 && d.getDate() === 1)).toBe(true);
            expect(days.some((d) => d.getMonth() === 5 && d.getDate() === 30)).toBe(true);
        });

        it('respeta weekStartsOn', () => {
            host.weekStartsOn.set(1); // lunes
            fixture.detectChanges();
            const days = calendar.days();
            expect(days[0].getDay()).toBe(1);
        });
    });

    describe('setFocusedDate', () => {
        it('no cambia el foco si la fecha está deshabilitada', () => {
            host.disabled.set(true);
            fixture.detectChanges();
            const before = calendar.focusedDate();
            calendar.setFocusedDate(new Date(2026, 5, 1));
            expect(calendar.focusedDate()).toBe(before);
        });

        it('actualiza el foco para una fecha válida', () => {
            const target = new Date(2026, 5, 20);
            calendar.setFocusedDate(target);
            fixture.detectChanges();
            expect(calendar.focusedDate()).toBe(target);
        });
    });

    describe('stubs de rango (siempre false en date picker simple)', () => {
        it('isStartOfRange / isEndOfRange / isBetweenRange devuelven false', () => {
            const d = new Date(2026, 5, 15);
            expect(calendar.isStartOfRange(d)).toBe(false);
            expect(calendar.isEndOfRange(d)).toBe(false);
            expect(calendar.isBetweenRange(d)).toBe(false);
        });
    });
});
