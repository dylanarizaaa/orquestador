import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrnSelect } from './brn-select';
import { BrnSelectContent } from './brn-select-content';

@Component({
    template: `<div brnSelect><div brnSelectContent>contenido</div></div>`,
    imports: [BrnSelect, BrnSelectContent],
})
class HostComponent {}

describe('BrnSelectContent', () => {
    let fixture: ComponentFixture<HostComponent>;
    let content: BrnSelectContent;
    let el: HTMLElement;

    const setScroll = (top: number, scrollHeight = 100, clientHeight = 50) => {
        Object.defineProperty(el, 'scrollHeight', { value: scrollHeight, configurable: true });
        Object.defineProperty(el, 'clientHeight', { value: clientHeight, configurable: true });
        Object.defineProperty(el, 'scrollTop', { value: top, writable: true, configurable: true });
    };

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        fixture.detectChanges();
        const de = fixture.debugElement.query(By.directive(BrnSelectContent));
        content = de.injector.get(BrnSelectContent);
        el = de.nativeElement;
        (el as unknown as { scrollBy: () => void }).scrollBy = jest.fn();
    });

    it('handleScroll actualiza showScrollUp/showScrollDown', () => {
        setScroll(0);
        content.handleScroll();
        expect(content.showScrollUp()).toBe(false);
        expect(content.showScrollDown()).toBe(true);

        setScroll(10);
        content.handleScroll();
        expect(content.showScrollUp()).toBe(true);
    });

    it('scrollDown llama a stop al llegar al final', () => {
        const stop = jest.fn();
        setScroll(50); // ya en el máximo (scrollHeight 100 - clientHeight 50)
        content.scrollDown(stop);
        expect(el.scrollBy).toHaveBeenCalled();
        expect(stop).toHaveBeenCalled();
    });

    it('scrollDown no detiene si aún hay recorrido', () => {
        const stop = jest.fn();
        setScroll(0);
        content.scrollDown(stop);
        expect(stop).not.toHaveBeenCalled();
    });

    it('scrollUp llama a stop al llegar arriba', () => {
        const stop = jest.fn();
        setScroll(0);
        content.scrollUp(stop);
        expect(stop).toHaveBeenCalled();
    });

    it('scrollUp no detiene si no está arriba del todo', () => {
        const stop = jest.fn();
        setScroll(20);
        content.scrollUp(stop);
        expect(stop).not.toHaveBeenCalled();
    });
});
