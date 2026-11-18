import { signal } from '@angular/core';
import type { NgControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { createStateTracker } from './create-state-tracker';
import { ReactiveStateTracker } from './reactive-state-tracker';
import { SignalStateTracker } from './signal-state-tracker';

function tracker(control: unknown) {
    return createStateTracker({ control } as unknown as NgControl, null, null, null);
}

describe('createStateTracker', () => {
    it('crea un SignalStateTracker cuando el control expone un field signal', () => {
        const result = tracker({ field: signal(null) });
        expect(result).toBeInstanceOf(SignalStateTracker);
    });

    it('crea un ReactiveStateTracker cuando field no es una signal', () => {
        const result = tracker({ field: 'no-signal', events: new Subject() });
        expect(result).toBeInstanceOf(ReactiveStateTracker);
        result.destroy();
    });

    it('crea un ReactiveStateTracker cuando el control no tiene field', () => {
        const result = tracker({ events: new Subject() });
        expect(result).toBeInstanceOf(ReactiveStateTracker);
        result.destroy();
    });

    it('crea un ReactiveStateTracker cuando no hay control', () => {
        const result = tracker(null);
        expect(result).toBeInstanceOf(ReactiveStateTracker);
        result.destroy();
    });
});
