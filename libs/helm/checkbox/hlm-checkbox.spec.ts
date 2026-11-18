import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HlmCheckbox } from './hlm-checkbox';

@Component({
    template: `<hlm-checkbox
        [checked]="checked()"
        [indeterminate]="indeterminate()"
        [disabled]="disabled()"
        [forceInvalid]="forceInvalid()"
        (checkedChange)="last = $event"
    />`,
    imports: [HlmCheckbox],
})
class HostComponent {
    checked = signal(false);
    indeterminate = signal(false);
    disabled = signal(false);
    forceInvalid = signal(false);
    last?: boolean;
}

describe('HlmCheckbox', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;
    let checkbox: HlmCheckbox;

    const button = () => fixture.debugElement.query(By.css('button[role="checkbox"]')).nativeElement as HTMLButtonElement;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
        checkbox = fixture.debugElement.query(By.directive(HlmCheckbox)).componentInstance as HlmCheckbox;
    });

    it('el click propaga el cambio de estado', () => {
        button().click();
        fixture.detectChanges();
        expect(checkbox.checked()).toBe(true);
        expect(host.last).toBe(true);
    });

    it('muestra el icono cuando está marcado o indeterminado', () => {
        host.indeterminate.set(true);
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('ng-icon'))).toBeTruthy();
    });

    it('deshabilitado ignora _handleChange', () => {
        host.disabled.set(true);
        fixture.detectChanges();
        (checkbox as unknown as { _handleChange(v: boolean): void })._handleChange(true);
        expect(checkbox.checked()).toBe(false);
    });

    it('forceInvalid aplica la clase de error', () => {
        host.forceInvalid.set(true);
        fixture.detectChanges();
        expect((checkbox as unknown as { _errorStateClass(): string })._errorStateClass()).toContain('border-destructive');
    });

    it('ControlValueAccessor: writeValue / onChange / setDisabledState', () => {
        const onChange = jest.fn();
        checkbox.registerOnChange(onChange);
        checkbox.registerOnTouched(jest.fn());

        checkbox.writeValue(true);
        fixture.detectChanges();
        expect(checkbox.checked()).toBe(true);

        button().click();
        expect(onChange).toHaveBeenCalled();

        checkbox.setDisabledState(true);
        fixture.detectChanges();
        expect(button().disabled).toBe(true);
    });
});
