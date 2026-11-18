import { Component, signal } from '@angular/core';
import { FocusMonitor } from '@angular/cdk/a11y';
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrnCheckbox } from './brn-checkbox';

@Component({
    template: `<label>
        <brn-checkbox
            [checked]="checked()"
            [indeterminate]="indeterminate()"
            [disabled]="disabled()"
            [id]="id()"
            [name]="name()"
            [forceInvalid]="forceInvalid()"
            (checkedChange)="last = $event"
            >texto</brn-checkbox
        >
    </label>`,
    imports: [BrnCheckbox],
})
class HostComponent {
    checked = signal(false);
    indeterminate = signal(false);
    disabled = signal(false);
    id = signal<string | null>('cb1');
    name = signal<string | null>('grupo');
    forceInvalid = signal(false);
    last?: boolean;
}

describe('BrnCheckbox', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;
    let checkbox: BrnCheckbox;

    const button = () => fixture.debugElement.query(By.css('button[role="checkbox"]')).nativeElement as HTMLButtonElement;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
        checkbox = fixture.debugElement.query(By.directive(BrnCheckbox)).componentInstance as BrnCheckbox;
    });

    it('marca el id del botón quitando el sufijo -checkbox', () => {
        expect(button().getAttribute('id')).toBe('cb1');
        expect(button().getAttribute('name')).toBe('grupo');
    });

    it('toggle marca/desmarca y emite checkedChange', () => {
        button().click();
        fixture.detectChanges();
        expect(checkbox.isChecked()).toBe(true);
        expect(host.last).toBe(true);
        expect(button().getAttribute('aria-checked')).toBe('true');

        button().click();
        fixture.detectChanges();
        expect(checkbox.isChecked()).toBe(false);
    });

    it('el estado indeterminado se refleja en aria y data-state', () => {
        host.indeterminate.set(true);
        fixture.detectChanges();
        expect(button().getAttribute('aria-checked')).toBe('mixed');
        expect(button().getAttribute('data-state')).toBe('indeterminate');

        button().click(); // desde indeterminado pasa a checked
        fixture.detectChanges();
        expect(checkbox.isChecked()).toBe(true);
        expect(checkbox.indeterminate()).toBe(false);
    });

    it('deshabilitado no permite toggle', () => {
        host.disabled.set(true);
        fixture.detectChanges();
        expect(button().disabled).toBe(true);
        button().click();
        fixture.detectChanges();
        expect(checkbox.isChecked()).toBe(false);
    });

    it('ControlValueAccessor: writeValue, onChange, setDisabledState', () => {
        const onChange = jest.fn();
        const onTouched = jest.fn();
        checkbox.registerOnChange(onChange);
        checkbox.registerOnTouched(onTouched);

        checkbox.writeValue(true);
        fixture.detectChanges();
        expect(checkbox.isChecked()).toBe(true);

        button().click();
        expect(onChange).toHaveBeenCalled();
        expect(onTouched).toHaveBeenCalled();

        checkbox.setDisabledState(true);
        fixture.detectChanges();
        expect(button().disabled).toBe(true);
    });

    it('forceInvalid marca el estado inválido', () => {
        host.forceInvalid.set(true);
        fixture.detectChanges();
        expect(checkbox.spartanInvalid()).toBe(true);
    });

    it('asocia el label envolvente (data-disabled e id)', () => {
        const label = fixture.debugElement.query(By.css('label')).nativeElement as HTMLElement;
        expect(label.getAttribute('data-disabled')).toBe('false');
        expect(label.id).toBe('cb1-checkbox-label');
        expect(checkbox.mutableAriaLabelledby()).toBe('cb1-checkbox-label');
    });

    it('actualiza focus visible y emite touched al perder el foco por teclado', fakeAsync(() => {
        const focusMonitor = TestBed.inject(FocusMonitor);
        const touched = jest.fn();
        checkbox.touched.subscribe(touched);
        const btn = button();

        focusMonitor.focusVia(btn, 'keyboard');
        fixture.detectChanges();
        expect(btn.getAttribute('data-focus-visible')).toBe('true');

        btn.blur();
        flush();
        tick();
        fixture.detectChanges();
        expect(touched).toHaveBeenCalled();
    }));
});
