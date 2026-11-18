import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrnField, BrnFieldA11yService } from '@brain/field';
import { HlmFieldDescription } from './hlm-field-description';
import { HlmFieldError } from './hlm-field-error';

function fakeControl(spartanInvalid: boolean, errors: Record<string, unknown> | null) {
    return {
        ngControl: {},
        controlState: signal({ invalid: true, spartanInvalid, dirty: true, touched: true, errors }),
        id: signal('c1'),
        errors: signal(errors),
    };
}

@Component({
    template: `<brn-field>
        <hlm-field-description id="desc-1">descripción</hlm-field-description>
        <hlm-field-error id="err-1" [validator]="validator()" [forceShow]="forceShow()">error</hlm-field-error>
    </brn-field>`,
    imports: [BrnField, HlmFieldError, HlmFieldDescription],
})
class HostComponent {
    validator = signal<string | undefined>('required');
    forceShow = signal(false);
}

describe('HlmFieldError / HlmFieldDescription', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;
    let field: BrnField;

    const errorEl = () => fixture.debugElement.query(By.css('hlm-field-error')).nativeElement as HTMLElement;
    const a11y = () => fixture.debugElement.query(By.directive(BrnField)).injector.get(BrnFieldA11yService);

    const registerControl = (spartanInvalid: boolean, errors: Record<string, unknown> | null) => {
        field.registerFieldControl(fakeControl(spartanInvalid, errors) as never);
        fixture.detectChanges();
    };

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
        field = fixture.debugElement.query(By.directive(BrnField)).injector.get(BrnField);
    });

    it('la descripción registra su id en el servicio de accesibilidad', () => {
        expect(a11y().describedBy()).toContain('desc-1');
    });

    it('muestra el error y lo registra cuando el validador coincide y es spartanInvalid', () => {
        registerControl(true, { required: true });
        expect(errorEl().hidden).toBe(false);
        expect(a11y().describedBy()).toContain('err-1');
    });

    it('oculta el error cuando el control no es spartanInvalid', () => {
        registerControl(false, { required: true });
        expect(errorEl().hidden).toBe(true);
    });

    it('muestra el error para cualquier error cuando no se especifica validador', () => {
        host.validator.set(undefined);
        fixture.detectChanges();
        registerControl(true, { minlength: true });
        expect(errorEl().hidden).toBe(false);
    });

    it('forceShow muestra el error aunque no haya error de validación', () => {
        host.forceShow.set(true);
        fixture.detectChanges();
        expect(errorEl().hidden).toBe(false);
    });
});
