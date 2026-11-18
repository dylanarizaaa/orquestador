import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrnCalendar } from '@brain/calendar';
import { HlmCalendar } from './hlm-calendar';

describe('HlmCalendar', () => {
    let fixture: ComponentFixture<HlmCalendar<Date>>;

    const cellButtons = () => fixture.debugElement.queryAll(By.css('button[brnCalendarCellButton]'));
    const brn = () =>
        fixture.debugElement.query(By.directive(BrnCalendar)).injector.get(BrnCalendar) as BrnCalendar<Date>;
    const headerButton = () =>
        fixture.debugElement.query(By.css('[brnCalendarHeader]')).nativeElement.closest('button') as HTMLButtonElement;
    const prevButton = () =>
        fixture.debugElement.query(By.css('button[aria-label="Go to the previous month"]'))
            .nativeElement as HTMLButtonElement;
    const nextButton = () =>
        fixture.debugElement.query(By.css('button[aria-label="Go to the next month"]'))
            .nativeElement as HTMLButtonElement;

    function dispatchKey(key: string): void {
        cellButtons()[0].nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
        fixture.detectChanges();
    }

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HlmCalendar] });
        fixture = TestBed.createComponent(HlmCalendar<Date>);
        fixture.componentRef.setInput('defaultFocusedDate', new Date(2026, 5, 15));
        fixture.detectChanges();
    });

    it('renderiza la cuadrícula de días del mes enfocado', () => {
        expect(fixture.debugElement.query(By.css('table[brnCalendarGrid]'))).toBeTruthy();
        expect(cellButtons().length).toBeGreaterThanOrEqual(28);
        // cabeceras de los 7 días de la semana
        expect(fixture.debugElement.queryAll(By.css('th[scope="col"]')).length).toBe(7);
    });

    it('al hacer click en un día lo selecciona', () => {
        const focusCell = cellButtons().find((c) => c.nativeElement.getAttribute('tabindex') === '0')!.nativeElement;
        focusCell.click();
        fixture.detectChanges();
        const selected = fixture.componentInstance.date();
        expect(selected).toBeDefined();
        expect(selected!.getDate()).toBe(15);
        expect(selected!.getMonth()).toBe(5);
    });

    describe('navegación por teclado en las celdas', () => {
        it('flecha derecha enfoca el día siguiente', () => {
            dispatchKey('ArrowRight');
            expect(brn().focusedDate().getDate()).toBe(16);
        });

        it('flecha izquierda enfoca el día anterior', () => {
            dispatchKey('ArrowLeft');
            expect(brn().focusedDate().getDate()).toBe(14);
        });

        it('flecha abajo enfoca la semana siguiente (+7)', () => {
            dispatchKey('ArrowDown');
            expect(brn().focusedDate().getDate()).toBe(22);
        });

        it('flecha arriba enfoca la semana anterior (-7)', () => {
            dispatchKey('ArrowUp');
            expect(brn().focusedDate().getDate()).toBe(8);
        });

        it('Home enfoca el primer día del mes', () => {
            dispatchKey('Home');
            expect(brn().focusedDate().getDate()).toBe(1);
        });

        it('End enfoca el último día del mes', () => {
            dispatchKey('End');
            expect(brn().focusedDate().getDate()).toBe(30);
        });

        it('PageDown enfoca el mes siguiente', () => {
            dispatchKey('PageDown');
            expect(brn().focusedDate().getMonth()).toBe(6);
        });

        it('PageUp enfoca el mes anterior', () => {
            dispatchKey('PageUp');
            expect(brn().focusedDate().getMonth()).toBe(4);
        });
    });

    describe('drill-down del encabezado', () => {
        it('días -> meses -> años', () => {
            headerButton().click();
            fixture.detectChanges();
            expect(fixture.debugElement.query(By.css('hlm-calendar-month-view'))).toBeTruthy();

            headerButton().click();
            fixture.detectChanges();
            expect(fixture.debugElement.query(By.css('hlm-calendar-year-view'))).toBeTruthy();
        });

        it('seleccionar un mes vuelve a la vista de días', () => {
            headerButton().click();
            fixture.detectChanges();
            const monthBtn = fixture.debugElement
                .queryAll(By.css('hlm-calendar-month-view button'))
                .find((b) => !b.nativeElement.disabled)!.nativeElement;
            monthBtn.click();
            fixture.detectChanges();
            expect(fixture.debugElement.query(By.css('table[brnCalendarGrid]'))).toBeTruthy();
        });

        it('seleccionar un año vuelve a la vista de meses', () => {
            headerButton().click();
            fixture.detectChanges();
            headerButton().click();
            fixture.detectChanges();
            const yearBtn = fixture.debugElement
                .queryAll(By.css('hlm-calendar-year-view button'))
                .find((b) => !b.nativeElement.disabled)!.nativeElement;
            yearBtn.click();
            fixture.detectChanges();
            expect(fixture.debugElement.query(By.css('hlm-calendar-month-view'))).toBeTruthy();
        });
    });

    describe('navegación con los botones prev/next', () => {
        it('en la vista de días cambia de mes', () => {
            prevButton().click();
            fixture.detectChanges();
            expect(brn().focusedDate().getMonth()).toBe(4);

            nextButton().click();
            nextButton().click();
            fixture.detectChanges();
            expect(brn().focusedDate().getMonth()).toBe(6);
        });

        it('en la vista de meses cambia de año', () => {
            headerButton().click();
            fixture.detectChanges();
            prevButton().click();
            fixture.detectChanges();
            expect(brn().focusedDate().getFullYear()).toBe(2025);
        });

        it('en la vista de años cambia de década', () => {
            headerButton().click();
            fixture.detectChanges();
            headerButton().click();
            fixture.detectChanges();
            nextButton().click();
            fixture.detectChanges();
            expect(brn().focusedDate().getFullYear()).toBe(2036);
        });
    });

    describe('inputs', () => {
        it('weekStartsOn reordena los encabezados de días', () => {
            fixture.componentRef.setInput('weekStartsOn', 1);
            fixture.detectChanges();
            const firstWeekday = fixture.debugElement.queryAll(By.css('th[scope="col"]'))[0].nativeElement;
            expect(firstWeekday.getAttribute('aria-label')).toBe('Monday');
        });

        it('highlightDays marca la celda correspondiente', () => {
            fixture.componentRef.setInput('highlightDays', [new Date(2026, 5, 15)]);
            fixture.detectChanges();
            expect(fixture.debugElement.query(By.css('button[data-highlighted]'))).toBeTruthy();
        });

        it('disabled deshabilita todas las celdas', () => {
            fixture.componentRef.setInput('disabled', true);
            fixture.detectChanges();
            expect(cellButtons().every((c) => c.nativeElement.disabled)).toBe(true);
        });

        it('min/max deshabilitan las celdas fuera de rango', () => {
            fixture.componentRef.setInput('min', new Date(2026, 5, 10));
            fixture.componentRef.setInput('max', new Date(2026, 5, 20));
            fixture.detectChanges();
            const enabled = cellButtons().filter((c) => !c.nativeElement.disabled);
            // solo deberían quedar habilitados los días dentro del rango [10, 20]
            expect(enabled.length).toBeGreaterThan(0);
            expect(enabled.every((c) => Number(c.nativeElement.textContent.trim()) >= 10)).toBe(true);
        });
    });
});
