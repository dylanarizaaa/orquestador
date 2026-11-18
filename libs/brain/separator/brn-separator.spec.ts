import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrnSeparator } from './brn-separator';

@Component({
    template: `<div brnSeparator [decorative]="decorative()" [orientation]="orientation()"></div>`,
    imports: [BrnSeparator],
})
class HostComponent {
    decorative = signal(true);
    orientation = signal<'horizontal' | 'vertical'>('horizontal');
}

describe('BrnSeparator', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;
    const el = () => fixture.debugElement.query(By.directive(BrnSeparator)).nativeElement as HTMLElement;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('decorativo usa role="none" y sin aria-orientation', () => {
        expect(el().getAttribute('role')).toBe('none');
        expect(el().getAttribute('aria-orientation')).toBeNull();
        expect(el().getAttribute('data-orientation')).toBe('horizontal');
    });

    it('no decorativo y vertical expone role="separator" y aria-orientation="vertical"', () => {
        host.decorative.set(false);
        host.orientation.set('vertical');
        fixture.detectChanges();
        expect(el().getAttribute('role')).toBe('separator');
        expect(el().getAttribute('aria-orientation')).toBe('vertical');
    });

    it('no decorativo y horizontal no expone aria-orientation', () => {
        host.decorative.set(false);
        host.orientation.set('horizontal');
        fixture.detectChanges();
        expect(el().getAttribute('role')).toBe('separator');
        expect(el().getAttribute('aria-orientation')).toBeNull();
    });
});
