import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrnFieldA11yService } from './brn-field-aria.service';
import { BrnFieldControlDescribedBy } from './brn-field-control-described-by';

@Component({
    template: `<input brnFieldControlDescribedBy [aria-describedby]="manual()" />`,
    imports: [BrnFieldControlDescribedBy],
})
class HostComponent {
    readonly manual = signal<string | null>(null);
}

describe('BrnFieldControlDescribedBy', () => {
    let fixture: ComponentFixture<HostComponent>;
    let host: HostComponent;
    let a11y: BrnFieldA11yService;
    const input = () => fixture.debugElement.query(By.directive(BrnFieldControlDescribedBy)).nativeElement as HTMLElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HostComponent],
            providers: [BrnFieldA11yService],
        });
        fixture = TestBed.createComponent(HostComponent);
        host = fixture.componentInstance;
        a11y = TestBed.inject(BrnFieldA11yService);
        fixture.detectChanges();
    });

    it('sin describedby manual ni del servicio no fija aria-describedby', () => {
        expect(input().getAttribute('aria-describedby')).toBeNull();
    });

    it('combina el describedby manual con los ids registrados en el servicio sin duplicar', () => {
        a11y.registerDescription('desc-1');
        host.manual.set('manual-1 desc-1');
        fixture.detectChanges();

        const value = input().getAttribute('aria-describedby');
        expect(value).toBe('manual-1 desc-1');
    });
});
