import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrnField } from './brn-field';

interface ProtectedField {
    _invalid(): boolean | null | undefined;
    _spartanInvalid(): boolean | null;
    _dirty(): boolean | null;
    _touched(): boolean | null;
}

function fakeControl(state: {
    invalid?: boolean;
    spartanInvalid?: boolean;
    dirty?: boolean;
    touched?: boolean;
    errors?: Record<string, unknown> | null;
    id?: string;
    withNgControl?: boolean;
}) {
    return {
        ngControl: state.withNgControl === false ? null : {},
        controlState: signal({
            invalid: state.invalid ?? false,
            spartanInvalid: state.spartanInvalid ?? false,
            dirty: state.dirty ?? false,
            touched: state.touched ?? false,
            errors: state.errors ?? null,
        }),
        id: signal(state.id ?? 'control-id'),
        errors: signal(state.errors ?? null),
    };
}

@Component({
    template: `<div brnField [forceInvalid]="forceInvalid()" [attr.data-invalid]="null" [data-invalid]="dataInvalid()"></div>`,
    imports: [BrnField],
})
class HostComponent {
    forceInvalid = signal(false);
    dataInvalid = signal(false);
}

describe('BrnField', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;
    let field: BrnField;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
        field = fixture.debugElement.query(By.directive(BrnField)).injector.get(BrnField);
    });

    const prot = () => field as unknown as ProtectedField;

    it('sin control registrado todo es falso/nulo', () => {
        expect(prot()._invalid()).toBe(false);
        expect(prot()._dirty()).toBeNull();
        expect(prot()._touched()).toBeNull();
        expect(prot()._spartanInvalid()).toBeNull();
        expect(field.errors()).toBeNull();
        expect(field.controlState()).toBeNull();
    });

    it('refleja el estado del control registrado', () => {
        field.registerFieldControl(
            fakeControl({ invalid: true, spartanInvalid: true, dirty: true, touched: true, errors: { required: true } }) as never,
        );
        fixture.detectChanges();
        expect(prot()._invalid()).toBe(true);
        expect(prot()._spartanInvalid()).toBe(true);
        expect(prot()._dirty()).toBe(true);
        expect(prot()._touched()).toBe(true);
        expect(field.errors()).toEqual({ required: true });
        expect(field.controlState()).toBeTruthy();
        expect(field.labelableId()).toBe('control-id');
    });

    it('un control sin ngControl no marca invalid', () => {
        field.registerFieldControl(fakeControl({ invalid: true, withNgControl: false }) as never);
        fixture.detectChanges();
        expect(prot()._invalid()).toBe(false);
    });

    it('forceInvalid fuerza invalid y spartanInvalid', () => {
        host.forceInvalid.set(true);
        fixture.detectChanges();
        expect(prot()._invalid()).toBe(true);
        expect(prot()._spartanInvalid()).toBe(true);
    });

    it('dataInvalid fuerza invalid', () => {
        host.dataInvalid.set(true);
        fixture.detectChanges();
        expect(prot()._invalid()).toBe(true);
    });

    it('labelableId usa el labelable cuando no hay control', () => {
        field.registerLabelable({ labelableId: signal('label-id') } as never);
        fixture.detectChanges();
        expect(field.labelableId()).toBe('label-id');
    });
});
