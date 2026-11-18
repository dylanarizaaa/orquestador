import { OVERLAY_DEFAULT_CONFIG } from '@angular/cdk/overlay';
import { Component, PLATFORM_ID, signal, viewChild } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButton, HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCollapsibleImports } from '@spartan-ng/helm/collapsible';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmPopoverImports } from '@spartan-ng/helm/popover';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSheetImports } from '@spartan-ng/helm/sheet';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { classes, provideSpartanHlm } from '@spartan-ng/helm/utils';

/**
 * Piezas de spartan.ng (`libs/ui`) que el orquestador usa a través del sidebar o de los
 * selectores de fecha: se verifica que pinten su `data-slot` y sus clases base.
 */
@Component({
  imports: [
    HlmBadgeImports,
    HlmButtonImports,
    HlmCollapsibleImports,
    HlmInputGroupImports,
    HlmPopoverImports,
    HlmSelectImports,
    HlmSheetImports,
    HlmTextareaImports,
    HlmTooltipImports,
  ],
  template: `
    <span hlmBadge variant="tertiary" size="xs">Administrador</span>

    <div hlmCollapsible [expanded]="false">
      <button hlmCollapsibleTrigger>Abrir</button>
      <div hlmCollapsibleContent>Contenido</div>
    </div>

    <div hlmInputGroup>
      <span hlmInputGroupText>$</span>
      <textarea hlmInputGroupTextarea aria-label="Nota"></textarea>
    </div>
    <textarea hlmTextarea aria-label="Comentario"></textarea>

    <div hlmPopoverHeader>
      <p hlmPopoverTitle>Título</p>
      <p hlmPopoverDescription>Descripción</p>
    </div>

    <div hlmSelectLabel>Grupo</div>
    <div hlmSelectSeparator></div>
    <div hlmSelectValuesContent>Valores</div>

    <div hlmSheetFooter>Pie</div>

    <button hlmBtn #extra hlmTooltip="Ayuda">Extra</button>
  `,
})
class PiezasHost {
  readonly boton = viewChild.required('extra', { read: HlmButton });
}

/** Select múltiple con placeholder, flechas de desplazamiento y `aria-invalid` manual. */
@Component({
  imports: [HlmSelectImports],
  template: `
    <hlm-select-multiple [(value)]="valores" aria-label="Meses">
      <hlm-select-trigger [aria-invalid]="invalido()" buttonId="meses">
        <span hlmSelectPlaceholder>Elige meses</span>
        <span *hlmSelectValues="let meses">{{ meses.join(', ') }}</span>
      </hlm-select-trigger>
      <hlm-select-content *hlmSelectPortal>
        <hlm-select-scroll-up />
        <hlm-select-group>
          <hlm-select-item value="ene">Enero</hlm-select-item>
          <hlm-select-item value="feb">Febrero</hlm-select-item>
        </hlm-select-group>
        <hlm-select-scroll-down />
      </hlm-select-content>
    </hlm-select-multiple>
  `,
})
class SelectMultipleHost {
  readonly valores = signal<string[]>([]);
  readonly invalido = signal<boolean | string | undefined>(undefined);
}

/** Elemento con una transición propia: `classes()` la suspende y luego la restaura. */
@Component({
  selector: 'app-con-transicion',
  template: '',
  host: { style: 'transition: opacity 1s' },
})
class ConTransicion {
  constructor() {
    classes(() => 'block');
  }
}

@Component({
  imports: [ConTransicion],
  template: `<app-con-transicion class="externa" />`,
})
class TransicionHost {}

async function render<T>(component: new () => T): Promise<ComponentFixture<T>> {
  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture;
}

const slot = (root: ParentNode, name: string) =>
  root.querySelector<HTMLElement>(`[data-slot="${name}"]`);

describe('Piezas de spartan.ng', () => {
  it('pintan el slot y las clases base', async () => {
    const fixture = await render(PiezasHost);
    const el = fixture.nativeElement as HTMLElement;

    for (const name of [
      'popover-header',
      'popover-title',
      'popover-description',
      'select-label',
      'select-separator',
      'sheet-footer',
      'collapsible-content',
    ]) {
      // El nombre va en la aserción para saber qué pieza falló.
      expect([name, Boolean(slot(el, name)?.className)]).toEqual([name, true]);
    }

    expect(slot(el, 'badge')?.className).toContain('text-tertiary');
    expect(slot(el, 'badge')?.className).toContain('h-5');
    expect(slot(el, 'collapsible-content')?.className).toContain('data-[state=closed]:hidden');
    expect(el.querySelector('[hlmSelectValuesContent]')?.className).toBe('gap-2 flex');
    expect(el.querySelector('[hlmInputGroupText]')?.className).toContain('text-muted-foreground');
    expect(el.querySelector('textarea[hlmInputGroupTextarea]')?.className).toContain('resize-none');
    expect(el.querySelector('textarea[hlmTextarea]')?.className).toContain('border-input');
  });

  it('el botón usa el estilo del portal y acepta clases adicionales', async () => {
    const fixture = await render(PiezasHost);
    const boton = (fixture.nativeElement as HTMLElement).querySelector('button[hlmBtn]')!;
    expect(boton.className).toContain('h-10');
    expect(boton.className).toContain('font-semibold');

    fixture.componentInstance.boton().setClass('clase-extra');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(boton.classList).toContain('clase-extra');
  });

  it('el select múltiple muestra el placeholder, respeta aria-invalid y lista sus opciones', async () => {
    const fixture = await render(SelectMultipleHost);
    const el = fixture.nativeElement as HTMLElement;
    const trigger = () => el.querySelector<HTMLButtonElement>('#meses')!;

    expect(slot(el, 'select')?.classList).toContain('block');
    expect(el.textContent).toContain('Elige meses');
    expect(trigger().hasAttribute('aria-invalid')).toBe(false);

    fixture.componentInstance.invalido.set('true');
    fixture.detectChanges();
    expect(trigger().getAttribute('aria-invalid')).toBe('true');

    fixture.componentInstance.invalido.set('');
    fixture.detectChanges();
    expect(trigger().hasAttribute('aria-invalid')).toBe(false);

    trigger().click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.querySelector('hlm-select-scroll-up')?.className).toContain('sticky');
    expect(document.querySelector('hlm-select-scroll-down')?.className).toContain('sticky');
    expect(document.querySelector('hlm-select-content')?.className).toContain('bg-popover');

    document.querySelector<HTMLElement>('hlm-select-item')!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.valores()).toEqual(['ene']);
    expect(trigger().textContent).toContain('ene');
  });

  it('classes() restaura la transición propia y conserva las clases añadidas desde fuera', async () => {
    const fixture = await render(TransicionHost);
    const elemento = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      'app-con-transicion',
    )!;

    expect(elemento.classList).toContain('block');
    expect(elemento.classList).toContain('externa');
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(elemento.style.getPropertyValue('transition')).toBe('opacity 1s');

    elemento.classList.add('agregada');
    await new Promise((resolve) => setTimeout(resolve));
    expect(elemento.classList).toContain('agregada');
    expect(elemento.classList).toContain('block');
  });

  it('classes() restaura la transición si el elemento se destruye antes de pintarse', async () => {
    // Destruido antes de escribir sus clases: la transición sigue suspendida y se restaura.
    const sinPintar = TestBed.createComponent(TransicionHost);
    const elemento = (sinPintar.nativeElement as HTMLElement).querySelector<HTMLElement>(
      'app-con-transicion',
    )!;
    sinPintar.destroy();
    expect(elemento.style.getPropertyValue('transition')).toBe('opacity 1s');

    // Destruido con la restauración pendiente para el siguiente cuadro: se cancela.
    const cancelar = jest.spyOn(globalThis, 'cancelAnimationFrame');
    const pintado = TestBed.createComponent(TransicionHost);
    pintado.detectChanges();
    pintado.destroy();
    expect(cancelar).toHaveBeenCalled();
    cancelar.mockRestore();
  });

  it('classes() no suspende transiciones fuera del navegador', async () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const fixture = await render(TransicionHost);
    const elemento = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      'app-con-transicion',
    )!;

    expect(elemento.classList).toContain('block');
    expect(elemento.style.getPropertyValue('transition')).toBe('opacity 1s');
  });

  it('provideSpartanHlm desactiva el modo popover del overlay de CDK', () => {
    TestBed.configureTestingModule({ providers: [provideSpartanHlm()] });

    expect(TestBed.inject(OVERLAY_DEFAULT_CONFIG)).toEqual({ usePopover: false });
  });
});
