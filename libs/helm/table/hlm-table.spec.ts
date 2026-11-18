import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HlmTableImports } from './index';

@Component({
    template: `
        <div hlmTableContainer>
            <table hlmTable>
                <caption hlmCaption>Resumen</caption>
                <thead hlmTHead>
                    <tr hlmTr>
                        <th hlmTh>Columna</th>
                    </tr>
                </thead>
                <tbody hlmTBody>
                    <tr hlmTr>
                        <td hlmTd>Valor</td>
                    </tr>
                </tbody>
                <tfoot hlmTFoot>
                    <tr hlmTr>
                        <td hlmTd>Total</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `,
    imports: [HlmTableImports],
})
class HostComponent {}

describe('HlmTable', () => {
    let fixture: ComponentFixture<HostComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HostComponent] });
        fixture = TestBed.createComponent(HostComponent);
        fixture.detectChanges();
    });

    it('renderiza la tabla con pie y leyenda', () => {
        const root = fixture.nativeElement as HTMLElement;
        expect(root.querySelector('caption')?.textContent).toContain('Resumen');
        expect(root.querySelector('tfoot')?.textContent).toContain('Total');
        expect(root.querySelector('tbody')?.textContent).toContain('Valor');
    });
});
