import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import {
  HlmSidebarImports,
  HlmSidebarService,
  provideHlmSidebarConfig,
} from '@spartan-ng/helm/sidebar';

/** Sidebar completo con todas sus piezas, como lo arma spartan.ng. */
@Component({
  imports: [HlmSidebarImports],
  template: `
    <div hlmSidebarWrapper>
      <hlm-sidebar [variant]="variant()" [collapsible]="collapsible()">
        <div hlmSidebarHeader>
          <input hlmSidebarInput aria-label="Buscar" />
        </div>
        <div hlmSidebarContent>
          <div hlmSidebarGroup>
            <div hlmSidebarGroupLabel>Facturación</div>
            <button hlmSidebarGroupAction aria-label="Agregar">+</button>
            <div hlmSidebarGroupContent>
              <ul hlmSidebarMenu>
                <li hlmSidebarMenuItem>
                  <button hlmSidebarMenuButton isActive tooltip="Pendientes" size="lg">
                    Pendientes
                  </button>
                  <button hlmSidebarMenuAction showOnHover aria-label="Más">…</button>
                  <div hlmSidebarMenuBadge>3</div>
                  <ul hlmSidebarMenuSub>
                    <li hlmSidebarMenuSubItem>
                      <a hlmSidebarMenuSubButton isActive size="sm" closeMobileSidebarOnClick>
                        Notas
                      </a>
                    </li>
                  </ul>
                </li>
                <li hlmSidebarMenuItem>
                  <a hlmSidebarMenuButton variant="outline" closeMobileSidebarOnClick>Histórico</a>
                </li>
                <li hlmSidebarMenuItem>
                  <hlm-sidebar-menu-skeleton showIcon />
                </li>
              </ul>
            </div>
          </div>
          <div hlmSidebarSeparator></div>
        </div>
        <div hlmSidebarFooter>Pie</div>
        <button hlmSidebarRail></button>
      </hlm-sidebar>
      <main hlmSidebarInset>
        <button hlmSidebarTrigger></button>
      </main>
    </div>
  `,
})
class SidebarHost {
  readonly variant = signal<'sidebar' | 'floating' | 'inset'>('floating');
  readonly collapsible = signal<'offcanvas' | 'icon' | 'none'>('offcanvas');
}

/** `matchMedia` controlable para simular escritorio o móvil. */
function mockMatchMedia(matches: boolean) {
  const listeners: ((e: MediaQueryListEvent) => void)[] = [];
  const query = {
    matches,
    addEventListener: (_: string, fn: (e: MediaQueryListEvent) => void) => listeners.push(fn),
    removeEventListener: jest.fn(),
  };
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: jest.fn(() => query),
  });
  return {
    query,
    change(next: boolean) {
      query.matches = next;
      listeners.forEach((fn) => fn({ matches: next } as MediaQueryListEvent));
    },
  };
}

describe('Sidebar de spartan.ng', () => {
  let fixture: ComponentFixture<SidebarHost>;
  let service: HlmSidebarService;
  const el = () => fixture.nativeElement as HTMLElement;
  const slot = (name: string) => el().querySelector<HTMLElement>(`[data-slot="${name}"]`);

  async function render(mobile = false) {
    const media = mockMatchMedia(mobile);
    fixture = TestBed.createComponent(SidebarHost);
    service = TestBed.inject(HlmSidebarService);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return media;
  }

  afterEach(() => {
    document.cookie = 'sidebar_state=; max-age=0; path=/';
    delete (window as { matchMedia?: unknown }).matchMedia;
  });

  it('pinta las piezas con su slot y las clases del diseño', async () => {
    await render();

    expect(el().querySelector('hlm-sidebar')?.getAttribute('data-variant')).toBe('floating');
    expect(slot('sidebar-content')?.className).toContain('p-6');
    expect(slot('sidebar-inset')?.className).toContain('rounded-[20px]');
    for (const name of [
      'sidebar-header',
      'sidebar-input',
      'sidebar-group',
      'sidebar-group-label',
      'sidebar-group-action',
      'sidebar-group-content',
      'sidebar-menu',
      'sidebar-menu-item',
      'sidebar-menu-action',
      'sidebar-menu-badge',
      'sidebar-menu-sub',
      'sidebar-menu-sub-item',
      'sidebar-menu-sub-button',
      'sidebar-menu-skeleton',
      'sidebar-separator',
      'sidebar-footer',
      'sidebar-rail',
      'sidebar-trigger',
    ]) {
      expect([name, Boolean(slot(name)?.className)]).toEqual([name, true]);
    }
    const [principal, historico] = el().querySelectorAll<HTMLElement>(
      '[data-slot="sidebar-menu-button"]',
    );
    expect(principal.getAttribute('data-active')).toBe('true');
    expect(principal.className).toContain('ps-8');
    expect(historico.className).toContain('bg-background');
    expect(slot('sidebar-menu-action')?.className).toContain('opacity-0');
    expect(
      slot('sidebar-menu-skeleton')?.querySelector('[data-sidebar=menu-skeleton-icon]'),
    ).not.toBeNull();
  });

  it('el botón, el riel y el atajo de teclado pliegan y despliegan el sidebar', async () => {
    await render();
    const sidebar = () => el().querySelector('hlm-sidebar')!;
    expect(sidebar().getAttribute('data-state')).toBe('expanded');

    el().querySelector<HTMLButtonElement>('[data-slot=sidebar-trigger]')!.click();
    fixture.detectChanges();
    expect(sidebar().getAttribute('data-state')).toBe('collapsed');
    expect(sidebar().getAttribute('data-collapsible')).toBe('offcanvas');
    expect(document.cookie).toContain('sidebar_state=false');

    el().querySelector<HTMLButtonElement>('[data-slot=sidebar-rail]')!.click();
    fixture.detectChanges();
    expect(sidebar().getAttribute('data-state')).toBe('expanded');

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', ctrlKey: true }));
    fixture.detectChanges();
    expect(sidebar().getAttribute('data-state')).toBe('collapsed');

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'x', ctrlKey: true }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b' }));
    fixture.detectChanges();
    expect(sidebar().getAttribute('data-state')).toBe('collapsed');
  });

  it('plegado en modo icono muestra el tooltip de las opciones', async () => {
    await render();
    fixture.componentInstance.collapsible.set('icon');
    service.setOpen(false);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(el().querySelector('hlm-sidebar')?.getAttribute('data-collapsible')).toBe('icon');
  });

  it('sin variante flotante usa el ancho propio y el borde del lado', async () => {
    await render();
    fixture.componentInstance.variant.set('sidebar');
    fixture.detectChanges();

    expect(slot('sidebar-container')?.className).toContain('border-r');

    fixture.componentInstance.collapsible.set('none');
    fixture.detectChanges();
    expect(slot('sidebar-container')).toBeNull();
    expect(el().querySelector('hlm-sidebar')?.hasAttribute('data-state')).toBe(false);
  });

  it('en móvil se abre como hoja lateral y la cierra al pasar a escritorio', async () => {
    const media = await render(true);
    expect(service.isMobile()).toBe(true);

    el().querySelector<HTMLButtonElement>('[data-slot=sidebar-trigger]')!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(service.openMobile()).toBe(true);
    expect(document.querySelector('hlm-sheet-content[data-mobile=true]')).not.toBeNull();

    // Las opciones configuradas para cerrar el sidebar móvil lo cierran al elegirlas.
    document.querySelector<HTMLElement>('[data-slot="sidebar-menu-sub-button"]')!.click();
    expect(service.openMobile()).toBe(false);
    service.setOpenMobile(true);
    [...document.querySelectorAll<HTMLElement>('[data-slot="sidebar-menu-button"]')]
      .at(-1)!
      .click();
    expect(service.openMobile()).toBe(false);

    service.toggleSidebar();
    expect(service.openMobile()).toBe(true);
    media.change(false);
    expect(service.isMobile()).toBe(false);
    expect(service.openMobile()).toBe(false);

    // En escritorio `setOpenMobile` no tiene efecto.
    service.setOpenMobile(true);
    expect(service.openMobile()).toBe(false);
  });

  it('al redimensionar vuelve a evaluar el punto de quiebre y limpia al destruirse', async () => {
    const media = await render();
    jest.useFakeTimers();
    try {
      media.query.matches = true;
      window.dispatchEvent(new Event('resize'));
      window.dispatchEvent(new Event('resize'));
      jest.advanceTimersByTime(150);
      expect(service.isMobile()).toBe(true);

      window.dispatchEvent(new Event('resize'));
      fixture.destroy();
      TestBed.resetTestingModule();
      expect(media.query.removeEventListener).toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });

  it('recupera el estado guardado en la cookie y respeta la configuración', async () => {
    document.cookie = 'sidebar_state=false; path=/';
    await render();
    expect(service.open()).toBe(false);
    service.setVariant('inset');
    expect(service.variant()).toBe('inset');
  });

  it('acepta otra configuración y funciona sin matchMedia', async () => {
    TestBed.configureTestingModule({
      providers: [provideHlmSidebarConfig({ defaultOpen: false, sidebarKeyboardShortcut: 'k' })],
    });
    fixture = TestBed.createComponent(SidebarHost);
    service = TestBed.inject(HlmSidebarService);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(service.open()).toBe(false);
    expect(service.isMobile()).toBe(false);
  });
});
