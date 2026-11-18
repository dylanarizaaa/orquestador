import { createMenuPosition } from './menu-align';

describe('createMenuPosition', () => {
    it('side "top" ancla el origen arriba y el overlay abajo', () => {
        const [primary, fallback] = createMenuPosition('start', 'top');
        expect(primary).toEqual({ originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' });
        expect(fallback).toEqual({ originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' });
    });

    it('side "bottom" ancla el origen abajo y el overlay arriba', () => {
        const [primary] = createMenuPosition('end', 'bottom');
        expect(primary).toEqual({ originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' });
    });

    it('side "left" deriva el verticalAlign del align', () => {
        expect(createMenuPosition('start', 'left')[0]).toEqual({
            originX: 'start',
            originY: 'top',
            overlayX: 'end',
            overlayY: 'top',
        });
        expect(createMenuPosition('end', 'left')[0].originY).toBe('bottom');
        expect(createMenuPosition('center', 'left')[0].originY).toBe('center');
    });

    it('side "right" usa verticalAlign center para align center', () => {
        const [primary] = createMenuPosition('center', 'right');
        expect(primary).toEqual({ originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center' });
    });

    it('siempre devuelve una posición primaria y su alternativa', () => {
        expect(createMenuPosition('center', 'top')).toHaveLength(2);
        expect(createMenuPosition('start', 'right')).toHaveLength(2);
    });
});
