import { BrnFieldA11yService } from './brn-field-aria.service';

describe('BrnFieldA11yService', () => {
    let service: BrnFieldA11yService;

    beforeEach(() => {
        service = new BrnFieldA11yService();
    });

    it('describedBy es null sin descripciones ni errores', () => {
        expect(service.describedBy()).toBeNull();
    });

    it('combina descripciones y errores únicos separados por espacio', () => {
        service.registerDescription('desc-1');
        service.registerError('err-1');
        expect(service.describedBy()).toBe('desc-1 err-1');
    });

    it('no duplica ids ya registrados', () => {
        service.registerDescription('desc-1');
        service.registerDescription('desc-1');
        service.registerError('err-1');
        service.registerError('err-1');
        expect(service.describedBy()).toBe('desc-1 err-1');
    });

    it('elimina descripciones y errores al desregistrarlos', () => {
        service.registerDescription('desc-1');
        service.registerError('err-1');
        service.unregisterDescription('desc-1');
        expect(service.describedBy()).toBe('err-1');
        service.unregisterError('err-1');
        expect(service.describedBy()).toBeNull();
    });
});
