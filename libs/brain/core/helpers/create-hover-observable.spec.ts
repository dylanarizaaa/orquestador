import type { NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import { createHoverObservable, isElement } from './create-hover-observable';

describe('isElement', () => {
    it('devuelve true para elementos del DOM', () => {
        expect(isElement(document.createElement('div'))).toBe(true);
    });

    it('devuelve false para null y undefined', () => {
        expect(isElement(null)).toBe(false);
        expect(isElement(undefined)).toBe(false);
    });

    it('devuelve false para nodos que no son elementos', () => {
        expect(isElement(document.createTextNode('texto'))).toBe(false);
    });
});

describe('createHoverObservable', () => {
    const zone = {
        run: (fn: () => unknown) => fn(),
        runOutsideAngular: (fn: () => unknown) => fn(),
    } as unknown as NgZone;

    it('emite hover=true al entrar y hover=false al salir', () => {
        const el = document.createElement('div');
        document.body.appendChild(el);
        const destroyed$ = new Subject<void>();
        const emissions: Array<{ hover: boolean }> = [];

        const sub = createHoverObservable(el, zone, destroyed$).subscribe((value) => emissions.push(value));

        el.dispatchEvent(new MouseEvent('mouseenter'));
        el.dispatchEvent(new MouseEvent('mouseleave'));

        expect(emissions[0]).toEqual({ hover: true });
        expect(emissions.some((e) => e.hover === false)).toBe(true);

        destroyed$.next();
        destroyed$.complete();
        sub.unsubscribe();
        el.remove();
    });

    it('mouseout hacia fuera del elemento emite hover=false', () => {
        const el = document.createElement('div');
        document.body.appendChild(el);
        const destroyed$ = new Subject<void>();
        const emissions: Array<{ hover: boolean }> = [];

        const sub = createHoverObservable(el, zone, destroyed$).subscribe((value) => emissions.push(value));
        el.dispatchEvent(new MouseEvent('mouseout', { relatedTarget: null, bubbles: true }));

        expect(emissions.some((e) => e.hover === false)).toBe(true);

        destroyed$.next();
        destroyed$.complete();
        sub.unsubscribe();
        el.remove();
    });

    it('mouseout hacia un elemento fuera del contenedor emite hover=false', () => {
        const el = document.createElement('div');
        const outside = document.createElement('span');
        document.body.append(el, outside);
        const destroyed$ = new Subject<void>();
        const emissions: Array<{ hover: boolean }> = [];

        const sub = createHoverObservable(el, zone, destroyed$).subscribe((value) => emissions.push(value));
        // relatedTarget es un elemento real NO contenido: recorre todos los operandos de movedOut.
        el.dispatchEvent(new MouseEvent('mouseout', { relatedTarget: outside, bubbles: true }));

        expect(emissions.some((e) => e.hover === false)).toBe(true);

        destroyed$.next();
        destroyed$.complete();
        sub.unsubscribe();
        el.remove();
        outside.remove();
    });

    it('mouseout hacia un hijo contenido no emite (movedOut=false)', () => {
        const el = document.createElement('div');
        const child = document.createElement('span');
        el.appendChild(child);
        document.body.appendChild(el);
        const destroyed$ = new Subject<void>();
        const emissions: Array<{ hover: boolean }> = [];

        const sub = createHoverObservable(el, zone, destroyed$).subscribe((value) => emissions.push(value));
        // relatedTarget contenido => currentTarget.contains(relatedTarget) === true => movedOut === false.
        el.dispatchEvent(new MouseEvent('mouseout', { relatedTarget: child, bubbles: true }));

        expect(emissions).toHaveLength(0);

        destroyed$.next();
        destroyed$.complete();
        sub.unsubscribe();
        el.remove();
    });

    it('deja de emitir tras notificar destroyed$', () => {
        const el = document.createElement('div');
        document.body.appendChild(el);
        const destroyed$ = new Subject<void>();
        const emissions: Array<{ hover: boolean }> = [];

        const sub = createHoverObservable(el, zone, destroyed$).subscribe((value) => emissions.push(value));
        destroyed$.next();

        el.dispatchEvent(new MouseEvent('mouseenter'));

        expect(emissions).toHaveLength(0);

        sub.unsubscribe();
        el.remove();
    });
});
