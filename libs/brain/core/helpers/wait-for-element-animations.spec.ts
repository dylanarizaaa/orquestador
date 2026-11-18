import { getActiveElementAnimations, waitForAnimations, waitForElementAnimations } from './wait-for-element-animations';

describe('getActiveElementAnimations', () => {
    it('ignora elementos nulos o indefinidos', () => {
        expect(getActiveElementAnimations([null, undefined])).toEqual([]);
    });

    it('devuelve [] cuando el elemento no expone getAnimations', () => {
        expect(getActiveElementAnimations([{} as unknown as HTMLElement])).toEqual([]);
    });

    it('recolecta solo las animaciones que no han finalizado', () => {
        const el = document.createElement('div');
        const running = { playState: 'running' } as Animation;
        const finished = { playState: 'finished' } as Animation;
        (el as unknown as { getAnimations: () => Animation[] }).getAnimations = () => [running, finished];

        expect(getActiveElementAnimations([el])).toEqual([running]);
    });
});

describe('waitForAnimations', () => {
    it('resuelve de inmediato si no hay animaciones', async () => {
        await expect(waitForAnimations([])).resolves.toBeUndefined();
    });

    it('espera a que terminen las animaciones (sin endTime usa el timeout máximo)', async () => {
        const anim = { finished: Promise.resolve(), effect: null } as unknown as Animation;
        await expect(waitForAnimations([anim])).resolves.toBeUndefined();
    });

    it('usa el endTime de la animación más larga para calcular el timeout', async () => {
        const anim = {
            finished: Promise.resolve(),
            effect: { getComputedTiming: () => ({ endTime: 100 }) },
        } as unknown as Animation;
        await expect(waitForAnimations([anim])).resolves.toBeUndefined();
    });
});

describe('waitForElementAnimations', () => {
    it('resuelve para un elemento sin animaciones activas', async () => {
        await expect(waitForElementAnimations(document.createElement('div'))).resolves.toBeUndefined();
    });
});
