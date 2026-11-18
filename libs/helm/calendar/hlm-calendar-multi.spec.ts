import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrnCalendarMulti } from '@brain/calendar';
import { HlmCalendarMulti } from './hlm-calendar-multi';

describe('HlmCalendarMulti', () => {
    let fixture: ComponentFixture<HlmCalendarMulti<Date>>;

    const cellButtons = () => fixture.debugElement.queryAll(By.css('button[brnCalendarCellButton]'));
    const brn = () =>
        fixture.debugElement.query(By.directive(BrnCalendarMulti)).injector.get(BrnCalendarMulti) as BrnCalendarMulti<Date>;
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
        TestBed.configureTestingModule({ imports: [HlmCalendarMulti] });
        fixture = TestBed.createComponent(HlmCalendarMulti<Date>);
        fixture.componentRef.setInput('defaultFocusedDate', new Date(2026, 5, 15));
        fixture.detectChanges();
    });

    it('renderiza la cuadrícula de días', () => {
        expect(fixture.debugElement.query(By.css('table[brnCalendarGrid]'))).toBeTruthy();
        expect(cellButtons().length).toBeGreaterThanOrEqual(28);
    });

    it('al hacer click en días los acumula en la selección', () => {
        const focusCell = cellButtons().find((c) => c.nativeElement.getAttribute('tabindex') === '0')!.nativeElement;
        focusCell.click();
        fixture.detectChanges();
        expect(fixture.componentInstance.date()?.length).toBe(1);
    });

    describe('navegación por teclado', () => {
        it('ArrowRight / ArrowLeft / ArrowDown / ArrowUp', () => {
            dispatchKey('ArrowRight');
            expect(brn().focusedDate().getDate()).toBe(16);
            dispatchKey('ArrowLeft');
            expect(brn().focusedDate().getDate()).toBe(15);
            dispatchKey('ArrowDown');
            expect(brn().focusedDate().getDate()).toBe(22);
            dispatchKey('ArrowUp');
            expect(brn().focusedDate().getDate()).toBe(15);
        });

        it('Home / End / PageDown / PageUp', () => {
            dispatchKey('Home');
            expect(brn().focusedDate().getDate()).toBe(1);
            dispatchKey('End');
            expect(brn().focusedDate().getDate()).toBe(30);
            dispatchKey('PageDown');
            expect(brn().focusedDate().getMonth()).toBe(6);
            dispatchKey('PageUp');
            expect(brn().focusedDate().getMonth()).toBe(5);
        });
    });

    describe('drill-down y navegación', () => {
        it('días -> meses -> años y selección', () => {
            headerButton().click();
            fixture.detectChanges();
            expect(fixture.debugElement.query(By.css('hlm-calendar-month-view'))).toBeTruthy();

            headerButton().click();
            fixture.detectChanges();
            expect(fixture.debugElement.query(By.css('hlm-calendar-year-view'))).toBeTruthy();

            const yearBtn = fixture.debugElement
                .queryAll(By.css('hlm-calendar-year-view button'))
                .find((b) => !b.nativeElement.disabled)!.nativeElement;
            yearBtn.click();
            fixture.detectChanges();
            expect(fixture.debugElement.query(By.css('hlm-calendar-month-view'))).toBeTruthy();

            const monthBtn = fixture.debugElement
                .queryAll(By.css('hlm-calendar-month-view button'))
                .find((b) => !b.nativeElement.disabled)!.nativeElement;
            monthBtn.click();
            fixture.detectChanges();
            expect(fixture.debugElement.query(By.css('table[brnCalendarGrid]'))).toBeTruthy();
        });

        it('prev/next en días, meses y años', () => {
            prevButton().click();
            fixture.detectChanges();
            expect(brn().focusedDate().getMonth()).toBe(4);

            headerButton().click();
            fixture.detectChanges();
            nextButton().click();
            fixture.detectChanges();
            expect(brn().focusedDate().getFullYear()).toBe(2027);

            headerButton().click();
            fixture.detectChanges();
            prevButton().click();
            fixture.detectChanges();
            expect(brn().focusedDate().getFullYear()).toBe(2017);
        });
    });

    describe('inputs', () => {
        it('maxSelection se aplica a la directiva subyacente', () => {
            fixture.componentRef.setInput('maxSelection', 2);
            fixture.detectChanges();
            expect(brn().maxSelection()).toBe(2);
        });

        it('disabled deshabilita todas las celdas', () => {
            fixture.componentRef.setInput('disabled', true);
            fixture.detectChanges();
            expect(cellButtons().every((c) => c.nativeElement.disabled)).toBe(true);
        });
    });
});
