import { Component } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrnField } from '../field';
import { BrnLabel } from './brn-label';

@Component({
    template: `<label brnLabel for="control-x">Etiqueta</label>`,
    imports: [BrnLabel],
})
class StandaloneHostComponent {}

@Component({
    template: `
        <div brnField>
            <label brnLabel>Etiqueta dentro de un field</label>
        </div>
    `,
    imports: [BrnLabel, BrnField],
})
class FieldHostComponent {}

describe('BrnLabel', () => {
    const labelOf = (fixture: ComponentFixture<unknown>) =>
        fixture.debugElement.query(By.directive(BrnLabel)).nativeElement as HTMLElement;

    it('usa el atributo for explícito cuando se provee', () => {
        TestBed.configureTestingModule({ imports: [StandaloneHostComponent] });
        const fixture = TestBed.createComponent(StandaloneHostComponent);
        fixture.detectChanges();
        expect(labelOf(fixture).getAttribute('for')).toBe('control-x');
        expect(labelOf(fixture).id).toContain('brn-label-');
    });

    it('consulta el labelableId del BrnField ancestro cuando no hay for explícito', () => {
        TestBed.configureTestingModule({ imports: [FieldHostComponent] });
        const fixture = TestBed.createComponent(FieldHostComponent);
        fixture.detectChanges();
        // Sin control asociado el id es indefinido, pero se ejercita la rama con BrnField presente.
        expect(labelOf(fixture).getAttribute('for')).toBeNull();
    });
});
