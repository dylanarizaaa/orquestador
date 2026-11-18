import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrnCalendarRange } from '@brain/calendar';
import { HlmCalendarRange } from './hlm-calendar-range';

describe('HlmCalendarRange', () => {
    let fixture: ComponentFixture<HlmCalendarRange<Date>>;

    const cellButtons = () => fixture.debugElement.queryAll(By.css('button[brnCalendarCellButton]'));
    const brn = () =>
        fixture.debugElement.query(By.directive(BrnCalendarRange)).injector.get(BrnCalendarRange) as BrnCalendarRange<Date>;
    const headerButtons = () =>
        fixture.debugElement
            .queryAll(By.css('button'))
            .filter((b) => b.nativeElement.querySelector('span.font-semibold'));
    const prevButtons = () =>
        fixture.debugElement.queryAll(By.css('button[aria-label="Go to the previous month"]'));
    const nextButtons = () => fixture.debugElement.queryAll(By.css('button[aria-label="Go to the next month"]'));

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HlmCalendarRange] });
        fixture = TestBed.createComponent(HlmCalendarRange<Date>);
        fixture.componentRef.setInput('defaultFocusedDate', new Date(2026, 5, 15));
        fixture.detectChanges();
    });

    it('renderiza dos paneles de días con encabezados de semana', () => {
        const grids = fixture.debugElement.queryAll(By.css('table[role="grid"]'));
        expect(grids.length).toBe(2);
        expect(cellButtons().length).toBeGreaterThan(40);
    });

    it('seleccionar inicio y fin define el rango', () => {
        const cells = cellButtons();
        const startCell = cells.find((c) => c.nativeElement.getAttribute('tabindex') === '0')!.nativeElement;
        startCell.click();
        fixture.detectChanges();
        expect(brn().startDate()).toBeDefined();

        cells[cells.length - 1].nativeElement.click();
        fixture.detectChanges();
        expect(brn().endDate()).toBeDefined();
    });

    it('los botones prev/next desplazan el mes en la vista de días', () => {
        prevButtons()[0].nativeElement.click();
        fixture.detectChanges();
        expect(brn().focusedDate().getMonth()).toBe(4);

        nextButtons()[0].nativeElement.click();
        nextButtons()[0].nativeElement.click();
        fixture.detectChanges();
        expect(brn().focusedDate().getMonth()).toBe(6);
    });

    describe('drill-down de ambos paneles', () => {
        it('días -> meses -> años', () => {
            headerButtons()[0].nativeElement.click();
            fixture.detectChanges();
            expect(fixture.debugElement.queryAll(By.css('hlm-calendar-month-view')).length).toBe(2);

            headerButtons()[0].nativeElement.click();
            fixture.detectChanges();
            expect(fixture.debugElement.queryAll(By.css('hlm-calendar-year-view')).length).toBe(2);
        });

        it('seleccionar un mes vuelve a la vista de días', () => {
            headerButtons()[0].nativeElement.click();
            fixture.detectChanges();
            const monthBtn = fixture.debugElement
                .queryAll(By.css('hlm-calendar-month-view button'))
                .find((b) => !b.nativeElement.disabled)!.nativeElement;
            monthBtn.click();
            fixture.detectChanges();
            expect(fixture.debugElement.queryAll(By.css('table[role="grid"]')).length).toBe(2);
        });

        it('seleccionar un año vuelve a la vista de meses', () => {
            headerButtons()[0].nativeElement.click();
            fixture.detectChanges();
            headerButtons()[0].nativeElement.click();
            fixture.detectChanges();
            const yearBtn = fixture.debugElement
                .queryAll(By.css('hlm-calendar-year-view button'))
                .find((b) => !b.nativeElement.disabled)!.nativeElement;
            yearBtn.click();
            fixture.detectChanges();
            expect(fixture.debugElement.queryAll(By.css('hlm-calendar-month-view')).length).toBe(2);
        });

        it('resalta el rango seleccionado en las vistas de meses y años', () => {
            const cells = cellButtons();
            cells.find((c) => c.nativeElement.getAttribute('tabindex') === '0')!.nativeElement.click();
            fixture.detectChanges();
            cells[cells.length - 1].nativeElement.click();
            fixture.detectChanges();

            headerButtons()[0].nativeElement.click();
            fixture.detectChanges();
            expect(fixture.debugElement.queryAll(By.css('hlm-calendar-month-view button')).length).toBeGreaterThan(0);

            headerButtons()[0].nativeElement.click();
            fixture.detectChanges();
            expect(fixture.debugElement.queryAll(By.css('hlm-calendar-year-view button')).length).toBeGreaterThan(0);
        });

        it('prev/next desplazan año en meses y década en años', () => {
            headerButtons()[0].nativeElement.click();
            fixture.detectChanges();
            prevButtons()[0].nativeElement.click();
            fixture.detectChanges();
            expect(brn().focusedDate().getFullYear()).toBe(2025);

            headerButtons()[0].nativeElement.click();
            fixture.detectChanges();
            nextButtons()[0].nativeElement.click();
            fixture.detectChanges();
            expect(brn().focusedDate().getFullYear()).toBe(2035);
        });
    });
});
