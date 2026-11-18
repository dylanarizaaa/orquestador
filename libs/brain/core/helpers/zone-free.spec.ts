import { of, throwError } from 'rxjs';
import { toArray } from 'rxjs/operators';
import { brnZoneFree, brnZoneFull, brnZoneOptimized } from './zone-free';

function mockZone() {
    return {
        run: jest.fn((fn: () => unknown) => fn()),
        runOutsideAngular: jest.fn((fn: () => unknown) => fn()),
    } as unknown as import('@angular/core').NgZone & {
        run: jest.Mock;
        runOutsideAngular: jest.Mock;
    };
}

describe('zone-free operators', () => {
    it('brnZoneFull reemite los valores ejecutando next dentro de la zona', (done) => {
        const zone = mockZone();
        of(1, 2)
            .pipe(brnZoneFull(zone), toArray())
            .subscribe((values) => {
                expect(values).toEqual([1, 2]);
                expect(zone.run).toHaveBeenCalled();
                done();
            });
    });

    it('brnZoneFull propaga el error dentro de la zona', (done) => {
        const zone = mockZone();
        throwError(() => new Error('boom'))
            .pipe(brnZoneFull(zone))
            .subscribe({
                error: (err: Error) => {
                    expect(err.message).toBe('boom');
                    expect(zone.run).toHaveBeenCalled();
                    done();
                },
            });
    });

    it('brnZoneFree se suscribe fuera de la zona de Angular', (done) => {
        const zone = mockZone();
        of('a')
            .pipe(brnZoneFree(zone))
            .subscribe((value) => {
                expect(value).toBe('a');
                expect(zone.runOutsideAngular).toHaveBeenCalled();
                done();
            });
    });

    it('brnZoneOptimized combina runOutsideAngular y run', (done) => {
        const zone = mockZone();
        of(5)
            .pipe(brnZoneOptimized(zone))
            .subscribe((value) => {
                expect(value).toBe(5);
                expect(zone.runOutsideAngular).toHaveBeenCalled();
                expect(zone.run).toHaveBeenCalled();
                done();
            });
    });
});
