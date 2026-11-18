import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrnCalendarRange } from './brn-calendar-range';

@Component({
    template: `<div
        brnCalendarRange
        [(startDate)]="startDate"
        [(endDate)]="endDate"
        [min]="min()"
        [max]="max()"
        [disabled]="disabled()"
        [dateDisabled]="dateDisabled()"
        [weekStartsOn]="weekStartsOn()"
        [defaultFocusedDate]="defaultFocusedDate()"
    ></div>`,
    imports: [BrnCalendarRange],
})
class HostComponent {
    startDate = signal<Date | undefined>(undefined);
    endDate = signal<Date | undefined>(undefined);
    min = signal<Date | undefined>(undefined);
    max = signal<Date | undefined>(undefined);
    disabled = signal(false);
    dateDisabled = signal<(d: Date) => boolean>(() => false);
    weekStartsOn = signal<number | undefined>(undefined);
    defaultFocusedDate = signal<Date | undefined>(new Date(2026, 5, 15));
}

const d = (day: number) => new Date(2026, 5, day);

describe('BrnCalendarRange', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;
    let calendar: BrnCalendarRange<Date>;

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
            .query(By.directive(BrnCalendarRange))
            .injector.get(BrnCalendarRange) as BrnCalendarRange<Date>;
    });

    describe('selectDate', () => {
        it('el primer click fija el inicio del rango', () => {
            select(10);
            expect(calendar.startDate()).toEqual(d(10));
            expect(calendar.endDate()).toBeUndefined();
        });

        it('un segundo click posterior fija el fin del rango', () => {
            select(10);
            select(15);
            expect(calendar.startDate()).toEqual(d(10));
            expect(calendar.endDate()).toEqual(d(15));
        });

        it('un segundo click anterior intercambia inicio y fin', () => {
            select(15);
            select(10);
            expect(calendar.startDate()).toEqual(d(10));
            expect(calendar.endDate()).toEqual(d(15));
        });

        it('un segundo click sobre el inicio fija el fin igual al inicio', () => {
            select(15);
            select(15);
            expect(calendar.endDate()).toEqual(d(15));
        });

        it('con rango completo, un nuevo click reinicia la selección', () => {
            select(10);
            select(15);
            select(20);
            expect(calendar.startDate()).toEqual(d(20));
            expect(calendar.endDate()).toBeUndefined();
        });
    });

    describe('predicados de rango', () => {
        beforeEach(() => {
            select(10);
            select(20);
        });

        it('isSelected reconoce inicio y fin pero no intermedios', () => {
            expect(calendar.isSelected(d(10))).toBe(true);
            expect(calendar.isSelected(d(20))).toBe(true);
            expect(calendar.isSelected(d(15))).toBe(false);
        });

        it('isStartOfRange / isEndOfRange', () => {
            expect(calendar.isStartOfRange(d(10))).toBe(true);
            expect(calendar.isStartOfRange(d(20))).toBe(false);
            expect(calendar.isEndOfRange(d(20))).toBe(true);
            expect(calendar.isEndOfRange(d(10))).toBe(false);
        });

        it('isBetweenRange solo para fechas estrictamente intermedias', () => {
            expect(calendar.isBetweenRange(d(15))).toBe(true);
            expect(calendar.isBetweenRange(d(10))).toBe(false);
            expect(calendar.isBetweenRange(d(20))).toBe(false);
        });
    });

    describe('predicados sin selección', () => {
        it('isSelected es false sin inicio ni fin', () => {
            expect(calendar.isSelected(d(15))).toBe(false);
        });

        it('isStartOfRange / isEndOfRange son false sin selección', () => {
            expect(calendar.isStartOfRange(d(15))).toBe(false);
            expect(calendar.isEndOfRange(d(15))).toBe(false);
        });

        it('isBetweenRange es false si falta el fin', () => {
            select(10);
            expect(calendar.isBetweenRange(d(15))).toBe(false);
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

        it('getMonthDays/days devuelven una cuadrícula completa', () => {
            const days = calendar.days();
            expect(days.length % 7).toBe(0);
            expect(days.some((x) => x.getMonth() === 5 && x.getDate() === 1)).toBe(true);
        });

        it('setFocusedDate ignora fechas deshabilitadas y acepta válidas', () => {
            host.disabled.set(true);
            fixture.detectChanges();
            const before = calendar.focusedDate();
            calendar.setFocusedDate(d(1));
            expect(calendar.focusedDate()).toBe(before);

            host.disabled.set(false);
            fixture.detectChanges();
            calendar.setFocusedDate(d(20));
            fixture.detectChanges();
            expect(calendar.focusedDate()).toEqual(d(20));
        });
    });
});
