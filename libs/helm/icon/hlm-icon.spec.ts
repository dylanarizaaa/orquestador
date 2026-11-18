import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { HlmIcon } from './hlm-icon';

@Component({
    template: `<ng-icon hlm name="test" [size]="size()" />`,
    imports: [NgIcon, HlmIcon],
    providers: [provideIcons({ test: '<svg></svg>' })],
})
class HostComponent {
    size = signal<string>('base');
}

describe('HlmIcon', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;

    const sizeVar = () =>
        (fixture.debugElement.query(By.directive(HlmIcon)).nativeElement as HTMLElement).style.getPropertyValue(
            '--ng-icon__size',
        );

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('traduce los tamaños predefinidos a píxeles', () => {
        const cases: Array<[string, string]> = [
            ['xs', '12px'],
            ['sm', '16px'],
            ['base', '24px'],
            ['lg', '32px'],
            ['xl', '48px'],
        ];
        for (const [size, expected] of cases) {
            host.size.set(size);
            fixture.detectChanges();
            expect(sizeVar()).toBe(expected);
        }
    });

    it('usa el valor tal cual para tamaños personalizados', () => {
        host.size.set('20px');
        fixture.detectChanges();
        expect(sizeVar()).toBe('20px');
    });
});
