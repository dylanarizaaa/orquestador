import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { createPageArray, HlmNumberedPagination, outOfBoundCorrection } from './hlm-numbered-pagination';

describe('outOfBoundCorrection', () => {
    it('devuelve totalPages cuando currentPage lo excede', () => {
        expect(outOfBoundCorrection(100, 10, 50)).toBe(10);
    });

    it('devuelve 1 cuando currentPage es menor que 1', () => {
        expect(outOfBoundCorrection(100, 10, 0)).toBe(1);
    });

    it('devuelve currentPage cuando está dentro de rango', () => {
        expect(outOfBoundCorrection(100, 10, 5)).toBe(5);
    });

    it('devuelve 1 cuando no hay items (totalPages = 0)', () => {
        expect(outOfBoundCorrection(0, 10, 1)).toBe(1);
    });
});

describe('createPageArray', () => {
    it('lista todas las páginas sin elipsis cuando caben', () => {
        expect(createPageArray(1, 10, 30, 7)).toEqual([1, 2, 3]);
    });

    it('al menos una página cuando no hay items', () => {
        expect(createPageArray(1, 10, 0, 7)).toEqual([1]);
    });

    it('inserta elipsis de cierre al inicio del rango', () => {
        const pages = createPageArray(1, 10, 200, 7);
        expect(pages.length).toBe(7);
        expect(pages[0]).toBe(1);
        expect(pages[pages.length - 1]).toBe(20);
        expect(pages).toContain('...');
    });

    it('inserta elipsis de apertura y cierre en el medio', () => {
        const pages = createPageArray(10, 10, 200, 7);
        expect(pages[0]).toBe(1);
        expect(pages[pages.length - 1]).toBe(20);
        expect(pages.filter((p) => p === '...').length).toBe(2);
    });

    it('inserta elipsis de apertura al final del rango', () => {
        const pages = createPageArray(20, 10, 200, 7);
        expect(pages[0]).toBe(1);
        expect(pages[pages.length - 1]).toBe(20);
        expect(pages).toContain('...');
    });
});

describe('HlmNumberedPagination', () => {
    let fixture: ComponentFixture<HlmNumberedPagination>;
    let component: HlmNumberedPagination;

    const setup = (currentPage: number, itemsPerPage = 10, totalItems = 100) => {
        fixture = TestBed.createComponent(HlmNumberedPagination);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('currentPage', currentPage);
        fixture.componentRef.setInput('itemsPerPage', itemsPerPage);
        fixture.componentRef.setInput('totalItems', totalItems);
        fixture.detectChanges();
    };

    const items = () => fixture.debugElement.queryAll(By.css('li[hlmPaginationItem]'));

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HlmNumberedPagination],
            providers: [provideRouter([])],
        });
    });

    it('muestra el número de la última página', () => {
        setup(5);
        const lastPage = fixture.debugElement.query(By.css('span')).nativeElement.textContent.trim();
        expect(lastPage).toBe('10');
    });

    it('goToPrevious y goToNext mueven la página', () => {
        setup(5);
        items()[0].nativeElement.click(); // previous
        fixture.detectChanges();
        expect(component.currentPage()).toBe(4);

        items()[1].nativeElement.click(); // next
        fixture.detectChanges();
        expect(component.currentPage()).toBe(5);
    });

    it('no baja de la primera página ni sube de la última', () => {
        setup(1);
        items()[0].nativeElement.click();
        fixture.detectChanges();
        expect(component.currentPage()).toBe(1);

        fixture.componentRef.setInput('currentPage', 10);
        fixture.detectChanges();
        items()[1].nativeElement.click();
        fixture.detectChanges();
        expect(component.currentPage()).toBe(10);
    });

    it('goToFirst y goToLast saltan a los extremos', () => {
        setup(5);
        (component as unknown as { goToFirst(): void }).goToFirst();
        expect(component.currentPage()).toBe(1);
        (component as unknown as { goToLast(): void }).goToLast();
        expect(component.currentPage()).toBe(10);
    });

    it('_lastPageNumber es 1 cuando no hay items', () => {
        setup(1, 10, 0);
        expect((component as unknown as { _lastPageNumber(): number })._lastPageNumber()).toBe(1);
    });

    it('_pageSizesWithCurrent incluye el tamaño actual ordenado', () => {
        setup(1, 15);
        expect((component as unknown as { _pageSizesWithCurrent(): number[] })._pageSizesWithCurrent()).toEqual([
            10, 15, 20, 50, 100,
        ]);
        fixture.componentRef.setInput('itemsPerPage', 20);
        fixture.detectChanges();
        expect((component as unknown as { _pageSizesWithCurrent(): number[] })._pageSizesWithCurrent()).toEqual([
            10, 20, 50, 100,
        ]);
    });

    it('_pages corrige la página fuera de rango', () => {
        setup(50, 10, 100);
        const pages = (component as unknown as { _pages(): Array<number | '...'> })._pages();
        expect(pages.length).toBeGreaterThan(0);
        expect(component.currentPage()).toBe(10);
    });
});
