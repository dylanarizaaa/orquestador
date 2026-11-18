import type { NgControl } from '@angular/forms';
import { SignalStateTracker } from './signal-state-tracker';

interface FakeControl {
    dirty?: boolean;
    touched?: boolean;
    invalid?: boolean;
    errors?: Record<string, unknown> | null;
}

function makeTracker(
    control: FakeControl | null,
    matcher: { isInvalid: jest.Mock } | null = null,
    parentFormGroup: unknown = null,
    parentForm: unknown = null,
) {
    return new SignalStateTracker(
        { control } as unknown as NgControl,
        matcher as never,
        parentFormGroup as never,
        parentForm as never,
    );
}

describe('SignalStateTracker', () => {
    it('expone null en todas las señales cuando no hay control', () => {
        const tracker = makeTracker(null);
        expect(tracker.dirty()).toBeNull();
        expect(tracker.touched()).toBeNull();
        expect(tracker.invalid()).toBeNull();
        expect(tracker.errors()).toBeNull();
        expect(tracker.spartanInvalid()).toBeNull();
        expect(tracker.controlState()).toBeNull();
    });

    it('refleja el estado del control y arma controlState', () => {
        const errors = { required: true };
        const control: FakeControl = { dirty: true, touched: false, invalid: true, errors };
        const matcher = { isInvalid: jest.fn(() => true) };

        const tracker = makeTracker(control, matcher);

        expect(tracker.dirty()).toBe(true);
        expect(tracker.touched()).toBe(false);
        expect(tracker.invalid()).toBe(true);
        expect(tracker.errors()).toBe(errors);
        expect(tracker.spartanInvalid()).toBe(true);
        expect(matcher.isInvalid).toHaveBeenCalledWith(control, null);
        expect(tracker.controlState()).toEqual({
            dirty: true,
            errors,
            invalid: true,
            spartanInvalid: true,
            touched: false,
        });
    });

    it('spartanInvalid es false cuando no se provee matcher', () => {
        const control: FakeControl = { dirty: false, touched: false, invalid: false, errors: null };
        const tracker = makeTracker(control, null);
        expect(tracker.spartanInvalid()).toBe(false);
    });

    it('usa el FormGroup o el NgForm padre como contexto del matcher', () => {
        const control: FakeControl = { dirty: true, touched: true, invalid: true, errors: null };
        const parentForm = {};
        const matcher = { isInvalid: jest.fn(() => false) };

        const tracker = makeTracker(control, matcher, null, parentForm);
        tracker.spartanInvalid();

        expect(matcher.isInvalid).toHaveBeenCalledWith(control, parentForm);
    });

    it('destroy() es un no-op que no lanza', () => {
        expect(() => makeTracker(null).destroy()).not.toThrow();
    });
});
