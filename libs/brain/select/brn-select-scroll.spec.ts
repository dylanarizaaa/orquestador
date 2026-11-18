import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrnSelect, BrnSelectContent, BrnSelectScrollDown, BrnSelectScrollUp } from './index';

@Component({
    template: `
        <div brnSelect>
            <div brnSelectContent style="height:50px;overflow:auto">
                <div style="height:200px">items</div>
                <div brnSelectScrollUp data-testid="scroll-up"></div>
                <div brnSelectScrollDown data-testid="scroll-down"></div>
            </div>
        </div>
    `,
    imports: [BrnSelect, BrnSelectContent, BrnSelectScrollUp, BrnSelectScrollDown],
})
class HostComponent {}

describe('BrnSelectScroll directives', () => {
    let fixture: ComponentFixture<HostComponent>;
    let contentEl: HTMLElement;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        fixture.detectChanges();
        contentEl = fixture.debugElement.query(By.directive(BrnSelectContent)).nativeElement;
        Object.defineProperty(contentEl, 'scrollHeight', { value: 200, configurable: true });
        Object.defineProperty(contentEl, 'clientHeight', { value: 50, configurable: true });
        Object.defineProperty(contentEl, 'scrollTop', { value: 0, writable: true, configurable: true });
        (contentEl as unknown as { scrollBy: jest.Mock }).scrollBy = jest.fn();
    });

    it('scroll down inicia el intervalo al mouseenter y se detiene al mouseleave', fakeAsync(() => {
        const scrollDown = fixture.debugElement.query(By.css('[data-testid="scroll-down"]')).nativeElement as HTMLElement;
        scrollDown.dispatchEvent(new MouseEvent('mouseenter'));
        tick(30);
        scrollDown.dispatchEvent(new MouseEvent('mouseleave'));
        tick(30);
        expect((contentEl as unknown as { scrollBy: jest.Mock }).scrollBy).toHaveBeenCalled();
    }));

    it('scroll up inicia el intervalo al mouseenter y se detiene al mouseleave', fakeAsync(() => {
        Object.defineProperty(contentEl, 'scrollTop', { value: 50, writable: true, configurable: true });
        const scrollUp = fixture.debugElement.query(By.css('[data-testid="scroll-up"]')).nativeElement as HTMLElement;
        scrollUp.dispatchEvent(new MouseEvent('mouseenter'));
        tick(30);
        scrollUp.dispatchEvent(new MouseEvent('mouseleave'));
        tick(30);
        expect((contentEl as unknown as { scrollBy: jest.Mock }).scrollBy).toHaveBeenCalled();
    }));
});
