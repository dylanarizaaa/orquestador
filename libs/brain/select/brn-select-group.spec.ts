import { Component } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrnSelectGroup } from './brn-select-group';
import { BrnSelectLabel } from './brn-select-label';

@Component({
    template: `
        <div brnSelectGroup>
            <span brnSelectLabel id="grupo-label">Grupo</span>
        </div>
    `,
    imports: [BrnSelectGroup, BrnSelectLabel],
})
class WithLabelHostComponent {}

@Component({
    template: `<div brnSelectGroup></div>`,
    imports: [BrnSelectGroup],
})
class WithoutLabelHostComponent {}

describe('BrnSelectGroup', () => {
    const groupOf = (fixture: ComponentFixture<unknown>) =>
        fixture.debugElement.query(By.directive(BrnSelectGroup)).nativeElement as HTMLElement;

    it('usa el id de la etiqueta para aria-labelledby cuando hay BrnSelectLabel', () => {
        TestBed.configureTestingModule({ imports: [WithLabelHostComponent] });
        const fixture = TestBed.createComponent(WithLabelHostComponent);
        fixture.detectChanges();
        expect(groupOf(fixture).getAttribute('aria-labelledby')).toBe('grupo-label');
    });

    it('no fija aria-labelledby cuando no hay etiqueta', () => {
        TestBed.configureTestingModule({ imports: [WithoutLabelHostComponent] });
        const fixture = TestBed.createComponent(WithoutLabelHostComponent);
        fixture.detectChanges();
        expect(groupOf(fixture).getAttribute('aria-labelledby')).toBeNull();
    });
});
