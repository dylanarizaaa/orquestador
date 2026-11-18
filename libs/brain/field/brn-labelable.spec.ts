import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { injectBrnLabelable } from './brn-labelable';

describe('brn-labelable', () => {
    it('injectBrnLabelable devuelve null cuando no hay proveedor', () => {
        TestBed.configureTestingModule({});
        const labelable = TestBed.runInInjectionContext(() => injectBrnLabelable());
        expect(labelable).toBeNull();
    });
});
