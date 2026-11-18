import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

setupZoneTestEnv();

// jsdom no implementa ResizeObserver ni scrollIntoView, usados por overlays/listboxes (select, popover).
if (typeof (globalThis as { ResizeObserver?: unknown }).ResizeObserver === 'undefined') {
    (globalThis as { ResizeObserver: unknown }).ResizeObserver = class {
        observe(): void {}
        unobserve(): void {}
        disconnect(): void {}
    };
}

if (typeof Element.prototype.scrollIntoView !== 'function') {
    Element.prototype.scrollIntoView = function (): void {};
}

const activeAnimations = new WeakMap<Element, Animation[]>();

function trackAnimation(element: Element, animation: Animation) {
    const current = activeAnimations.get(element) ?? [];
    activeAnimations.set(element, [...current, animation]);
}

if (typeof Element.prototype.animate === 'undefined') {
    Element.prototype.animate = function (_keyframes, options) {
        const duration = typeof options?.duration === 'number' ? options.duration : 0;
        const animation = {
            playState: 'running',
            finished: Promise.resolve(undefined as unknown as Animation),
            cancel: () => {
                animation.playState = 'finished';
            },
            finish: () => {
                animation.playState = 'finished';
            },
            pause: () => {
                animation.playState = 'paused';
            },
            play: () => {
                animation.playState = 'running';
            },
            reverse: () => undefined,
            addEventListener: () => undefined,
            removeEventListener: () => undefined,
            dispatchEvent: () => true,
            effect: {
                getComputedTiming: () => ({ endTime: duration }),
            },
            timeline: null,
            startTime: 0,
            currentTime: 0,
            playbackRate: 1,
            pending: false,
            replaceState: 'active',
            id: '',
            oncancel: null,
            onfinish: null,
            onremove: null,
            ready: Promise.resolve(undefined as unknown as Animation),
        } as unknown as Animation;

        animation.finished = new Promise((resolve) => {
            setTimeout(() => {
                animation.playState = 'finished';
                resolve(animation);
            }, duration);
        });

        trackAnimation(this, animation);
        return animation;
    };
}

const originalGetAnimations = Element.prototype.getAnimations;

Element.prototype.getAnimations = function (options?: { subtree?: boolean }) {
    const nativeAnimations =
        typeof originalGetAnimations === 'function' ? originalGetAnimations.call(this, options) : [];
    const tracked = activeAnimations.get(this) ?? [];
    const synthetic = [...nativeAnimations, ...tracked];

    if (this instanceof HTMLElement && this.getAttribute('data-state') === 'closed') {
        const computed = getComputedStyle(this);
        const hasStylesheetExitAnimation = Array.from(document.querySelectorAll('style')).some(
            (style) => style.textContent?.includes('brn-test-popover-exit') && this.classList.contains('cdk-overlay-pane'),
        );
        const hasExitAnimation =
            (computed.animationName && computed.animationName !== 'none') || hasStylesheetExitAnimation;

        if (hasExitAnimation) {
            synthetic.push({
                playState: 'running',
                finished: new Promise((resolve) => {
                    setTimeout(() => resolve({} as Animation), 150);
                }),
                cancel: () => undefined,
                finish: () => undefined,
                pause: () => undefined,
                effect: {
                    getComputedTiming: () => ({ endTime: 150 }),
                },
            } as unknown as Animation);
        }
    }

    if (!options?.subtree) {
        return synthetic;
    }

    const subtreeAnimations = [...synthetic];
    this.querySelectorAll('*').forEach((child) => {
        subtreeAnimations.push(...(activeAnimations.get(child) ?? []));
        if (typeof originalGetAnimations === 'function') {
            subtreeAnimations.push(...originalGetAnimations.call(child, options));
        }
    });
    return subtreeAnimations;
};
