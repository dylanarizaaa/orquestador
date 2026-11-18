import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { HlmNumberedPaginationQueryParams } from './hlm-numbered-pagination-query-params';

describe('HlmNumberedPaginationQueryParams', () => {
    let fixture: ComponentFixture<HlmNumberedPaginationQueryParams>;
    let component: HlmNumberedPaginationQueryParams;

    const setup = (currentPage: number, itemsPerPage = 10, totalItems = 100) => {
        fixture = TestBed.createComponent(HlmNumberedPaginationQueryParams);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('currentPage', currentPage);
        fixture.componentRef.setInput('itemsPerPage', itemsPerPage);
        fixture.componentRef.setInput('totalItems', totalItems);
        fixture.detectChanges();
    };

    const read = <R>(name: string): R => (component as unknown as Record<string, () => R>)[name]();

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HlmNumberedPaginationQueryParams],
            providers: [provideRouter([])],
        });
    });

    it('muestra el total de items y el número de páginas', () => {
        setup(5);
        expect(fixture.nativeElement.textContent).toContain('100');
        expect(fixture.nativeElement.textContent).toContain('10');
    });

    it('genera enlaces de página con elipsis cuando hay muchas páginas', () => {
        setup(10, 10, 200);
        const links = fixture.debugElement.queryAll(By.css('a[hlmPaginationLink]'));
        expect(links.length).toBeGreaterThan(0);
        expect(read<Array<number | '...'>>('_pages')).toContain('...');
    });

    it('refleja primera/última página activa', () => {
        setup(1);
        expect(read<boolean>('_isFirstPageActive')).toBe(true);
        setup(20, 10, 200);
        expect(read<boolean>('_isLastPageActive')).toBe(true);
    });

    it('_lastPageNumber es 1 sin items y _pageSizesWithCurrent ordena el tamaño actual', () => {
        setup(1, 15, 0);
        expect(read<number>('_lastPageNumber')).toBe(1);
        expect(read<number[]>('_pageSizesWithCurrent')).toEqual([10, 15, 20, 50, 100]);
    });

    it('_pages corrige la página fuera de rango', () => {
        setup(50, 10, 100);
        read<Array<number | '...'>>('_pages');
        expect(component.currentPage()).toBe(10);
    });
});
