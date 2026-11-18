import { serializeValue, stringifyAsLabel } from './resolve-value-label';

describe('serializeValue', () => {
    it('devuelve cadena vacía para null y undefined', () => {
        expect(serializeValue(null)).toBe('');
        expect(serializeValue(undefined)).toBe('');
    });

    it('devuelve la misma cadena tal cual', () => {
        expect(serializeValue('hola')).toBe('hola');
    });

    it('serializa números y objetos a JSON', () => {
        expect(serializeValue(42)).toBe('42');
        expect(serializeValue({ a: 1 })).toBe('{"a":1}');
    });

    it('cae en String() ante estructuras no serializables (referencia cíclica)', () => {
        const obj: Record<string, unknown> = {};
        obj['self'] = obj;
        expect(serializeValue(obj)).toBe('[object Object]');
    });
});

describe('stringifyAsLabel', () => {
    it('usa itemToStringLabel cuando se provee y el item no es nulo', () => {
        expect(stringifyAsLabel({ x: 1 }, (i) => `id:${i.x}`)).toBe('id:1');
    });

    it('si itemToStringLabel devuelve null cae en cadena vacía', () => {
        expect(stringifyAsLabel({ x: 1 }, () => null as unknown as string)).toBe('');
    });

    it('no invoca itemToStringLabel si el item es null', () => {
        expect(stringifyAsLabel(null, () => 'x')).toBe('');
    });

    it('prioriza la propiedad label de un objeto', () => {
        expect(stringifyAsLabel({ label: 'Etiqueta', value: 2 })).toBe('Etiqueta');
    });

    it('usa value cuando no hay label', () => {
        expect(stringifyAsLabel({ value: 7 })).toBe('7');
    });

    it('serializa el objeto si no tiene label ni value', () => {
        expect(stringifyAsLabel({ foo: 'bar' })).toBe('{"foo":"bar"}');
    });

    it('serializa primitivos', () => {
        expect(stringifyAsLabel('texto')).toBe('texto');
        expect(stringifyAsLabel(123)).toBe('123');
        expect(stringifyAsLabel(null)).toBe('');
    });
});
