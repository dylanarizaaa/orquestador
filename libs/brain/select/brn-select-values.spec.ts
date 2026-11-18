import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrnSelect } from './brn-select';
import { BrnSelectValueTemplate } from './brn-select-value-template';
import { BrnSelectValues } from './brn-select-values';

@Component({
    template: `<div brnSelect [value]="value()">
        <span *brnSelectValueTemplate="let v" class="vt">VT:{{ v }}</span>
        <span *brnSelectValues="let vs" class="vs">VS:{{ vs.length }}</span>
    </div>`,
    imports: [BrnSelect, BrnSelectValueTemplate, BrnSelectValues],
})
class HostComponent {
    value = signal<unknown>(null);
}

describe('BrnSelectValueTemplate / BrnSelectValues', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;

    const vt = () => fixture.debugElement.query(By.css('.vt'));
    const vs = () => fixture.debugElement.query(By.css('.vs'));

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('no renderiza nada cuando no hay valor', () => {
        expect(vt()).toBeFalsy();
        expect(vs()).toBeFalsy();
    });

    it('renderiza el valor único (envuelto como arreglo en values)', () => {
        host.value.set('a');
        fixture.detectChanges();
        expect(vt().nativeElement.textContent).toContain('VT:a');
        expect(vs().nativeElement.textContent).toContain('VS:1');
    });

    it('renderiza un arreglo de valores en values', () => {
        host.value.set(['a', 'b', 'c']);
        fixture.detectChanges();
        expect(vs().nativeElement.textContent).toContain('VS:3');
    });

    it('limpia las vistas cuando el valor vuelve a null', () => {
        host.value.set('a');
        fixture.detectChanges();
        expect(vt()).toBeTruthy();

        host.value.set(null);
        fixture.detectChanges();
        expect(vt()).toBeFalsy();
        expect(vs()).toBeFalsy();
    });
});
