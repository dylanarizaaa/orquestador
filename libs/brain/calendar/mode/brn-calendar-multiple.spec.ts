import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrnCalendarMulti } from './brn-calendar-multiple';

@Component({
    template: `<div
        brnCalendarMulti
        [(date)]="dates"
        [min]="min()"
        [max]="max()"
        [disabled]="disabled()"
        [dateDisabled]="dateDisabled()"
        [minSelection]="minSelection()"
        [maxSelection]="maxSelection()"
        [weekStartsOn]="weekStartsOn()"
        [defaultFocusedDate]="defaultFocusedDate()"
    ></div>`,
    imports: [BrnCalendarMulti],
})
class HostComponent {
    dates = signal<Date[] | undefined>(undefined);
    min = signal<Date | undefined>(undefined);
    max = signal<Date | undefined>(undefined);
    disabled = signal(false);
    dateDisabled = signal<(d: Date) => boolean>(() => false);
    minSelection = signal<number | undefined>(undefined);
    maxSelection = signal<number | undefined>(undefined);
    weekStartsOn = signal<number | undefined>(undefined);
    defaultFocusedDate = signal<Date | undefined>(new Date(2026, 5, 15));
}

const d = (day: number) => new Date(2026, 5, day);

describe('BrnCalendarMulti', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;
    let calendar: BrnCalendarMulti<Date>;

    const select = (day: number) => {
        calendar.selectDate(d(day));
        fixture.detectChanges();
    };

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
        calendar = fixture.debugElement
            .query(By.directive(BrnCalendarMulti))
            .injector.get(BrnCalendarMulti) as BrnCalendarMulti<Date>;
    });

    describe('selectDate', () => {
        it('agrega fechas a la selección', () => {
            select(10);
            expect(calendar.date()).toEqual([d(10)]);
            select(15);
            expect(calendar.date()).toEqual([d(10), d(15)]);
        });

        it('al hacer click sobre una fecha seleccionada la quita', () => {
            select(10);
            select(15);
            select(10);
            expect(calendar.date()).toEqual([d(15)]);
        });

        it('al alcanzar maxSelection un nuevo click reinicia la selección', () => {
            host.maxSelection.set(2);
            fixture.detectChanges();
            select(10);
            select(15);
            select(20); // supera el máximo -> reinicia a [20]
            expect(calendar.date()).toEqual([d(20)]);
        });

        it('al alcanzar minSelection no permite deseleccionar', () => {
            host.minSelection.set(1);
            fixture.detectChanges();
            select(10);
            select(10); // intento de deseleccionar bloqueado
            expect(calendar.date()).toEqual([d(10)]);
        });
    });

    describe('isSelected', () => {
        it('false cuando no hay selección', () => {
            expect(calendar.isSelected(d(10))).toBe(false);
        });

        it('true para una fecha incluida en la selección', () => {
            select(10);
            expect(calendar.isSelected(d(10))).toBe(true);
            expect(calendar.isSelected(d(11))).toBe(false);
        });
    });

    describe('stubs de rango (siempre false)', () => {
        it('isStartOfRange / isEndOfRange / isBetweenRange', () => {
            expect(calendar.isStartOfRange(d(10))).toBe(false);
            expect(calendar.isEndOfRange(d(10))).toBe(false);
            expect(calendar.isBetweenRange(d(10))).toBe(false);
        });
    });

    describe('lógica compartida', () => {
        it('constrainDate respeta min y max', () => {
            host.min.set(d(10));
            host.max.set(d(20));
            fixture.detectChanges();
            expect(calendar.constrainDate(d(5))).toEqual(d(10));
            expect(calendar.constrainDate(d(25))).toEqual(d(20));
            expect(calendar.constrainDate(d(15))).toEqual(d(15));
        });

        it('isDateDisabled cubre disabled, min, max y dateDisabled', () => {
            expect(calendar.isDateDisabled(d(15))).toBe(false);
            host.min.set(d(10));
            host.max.set(d(20));
            fixture.detectChanges();
            expect(calendar.isDateDisabled(d(5))).toBe(true);
            expect(calendar.isDateDisabled(d(25))).toBe(true);
            host.dateDisabled.set((date) => date.getDate() === 15);
            fixture.detectChanges();
            expect(calendar.isDateDisabled(d(15))).toBe(true);
            host.disabled.set(true);
            fixture.detectChanges();
            expect(calendar.isDateDisabled(d(12))).toBe(true);
        });

        it('days() devuelve una cuadrícula completa', () => {
            const days = calendar.days();
            expect(days.length % 7).toBe(0);
            expect(days.some((x) => x.getMonth() === 5 && x.getDate() === 30)).toBe(true);
        });

        it('setFocusedDate ignora deshabilitadas y acepta válidas', () => {
            calendar.setFocusedDate(d(20));
            fixture.detectChanges();
            expect(calendar.focusedDate()).toEqual(d(20));
        });
    });
});
