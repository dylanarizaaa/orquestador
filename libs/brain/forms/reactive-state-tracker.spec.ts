import type { NgControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { ReactiveStateTracker } from './reactive-state-tracker';

function makeTracker(
    control: Record<string, unknown> | null,
    matcher: { isInvalid: jest.Mock } | null = null,
) {
    return new ReactiveStateTracker({ control } as unknown as NgControl, matcher as never, null, null);
}

describe('ReactiveStateTracker', () => {
    it('controlState refleja el control y usa el matcher', () => {
        const control = { dirty: true, invalid: true, touched: false, errors: { required: true }, events: new Subject() };
        const matcher = { isInvalid: jest.fn(() => true) };
        const tracker = makeTracker(control, matcher);

        expect(tracker.controlState()).toEqual({
            dirty: true,
            errors: { required: true },
            invalid: true,
            spartanInvalid: true,
            touched: false,
        });
        expect(tracker.errors()).toEqual({ required: true });
        expect(tracker.dirty()).toBe(true);
        expect(tracker.invalid()).toBe(true);
        expect(tracker.touched()).toBe(false);
        expect(tracker.spartanInvalid()).toBe(true);
        tracker.destroy();
    });

    it('controlState es null sin control', () => {
        const tracker = makeTracker(null);
        expect(tracker.controlState()).toBeNull();
        expect(tracker.errors()).toBeNull();
        expect(tracker.dirty()).toBeNull();
        expect(tracker.invalid()).toBeNull();
        expect(tracker.spartanInvalid()).toBeNull();
        expect(tracker.touched()).toBeNull();
        tracker.destroy();
    });

    it('spartanInvalid es false sin matcher', () => {
        const control = { dirty: false, invalid: false, touched: false, errors: null, events: new Subject() };
        const tracker = makeTracker(control, null);
        expect(tracker.controlState()?.spartanInvalid).toBe(false);
        tracker.destroy();
    });

    it('reacciona a los eventos del control', () => {
        const events = new Subject<unknown>();
        const control = { dirty: false, invalid: false, touched: false, errors: null, events };
        const tracker = makeTracker(control);
        expect(tracker.controlState()).toBeTruthy();
        events.next({});
        expect(tracker.controlState()).toBeTruthy();
        tracker.destroy();
    });
});
