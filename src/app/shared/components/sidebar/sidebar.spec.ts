import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { RoleMenu } from '../../../core/models/menu.model';
import { AuthService } from '../../../core/services/auth.service';
import { Sidebar } from './sidebar';
import { SidebarItem } from './sidebar.model';

function menuItem(partial: Partial<RoleMenu>): RoleMenu {
  return {
    ROLNombre: 'Admin',
    MENIdMenu: 0,
    MENNombre: 'Item',
    MENIdMenuPadre: 0,
    ACCNombre: 'Ver',
    MENUrl: '',
    MENIcono: '',
    ...partial,
  };
}

describe('Sidebar', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;
  const roleMenu = signal<RoleMenu[]>([]);

  beforeEach(async () => {
    roleMenu.set([]);
    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { roleMenu } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('returns an empty menu when the role has no items', () => {
    expect(component.menu()).toEqual([]);
  });

  it('builds a parent/children tree with an expanded group and sub-items', () => {
    roleMenu.set([
      menuItem({
        MENIdMenu: 1,
        MENIdMenuPadre: 0,
        MENNombre: 'Facturación',
        MENIcono: '<svg>icon</svg>',
      }),
      menuItem({
        MENIdMenu: 2,
        MENIdMenuPadre: 1,
        MENNombre: 'Pendientes',
        MENUrl: 'facturas-pendientes',
      }),
    ]);

    const menu = component.menu();

    expect(menu).toEqual<SidebarItem[]>([
      {
        title: 'Facturación',
        iconSvg: '<svg>icon</svg>',
        expanded: true,
        subItems: [{ title: 'Pendientes', route: 'facturas-pendientes' }],
      },
    ]);
  });

  it('maps a childless item with a named icon to a leaf route', () => {
    roleMenu.set([
      menuItem({
        MENIdMenu: 3,
        MENIdMenuPadre: 0,
        MENNombre: 'Histórico',
        MENIcono: 'historicalIcon',
        MENUrl: 'historico',
      }),
    ]);

    expect(component.menu()).toEqual<SidebarItem[]>([
      { title: 'Histórico', icon: 'historicalIcon', route: 'historico' },
    ]);
  });

  it('omits icon keys when the item has no icon', () => {
    roleMenu.set([
      menuItem({ MENIdMenu: 4, MENNombre: 'Reportes', MENUrl: 'reportes', MENIcono: '' }),
    ]);

    const [item] = component.menu();
    expect(item).toEqual({ title: 'Reportes', route: 'reportes' });
    expect('icon' in item).toBe(false);
    expect('iconSvg' in item).toBe(false);
  });

  it('ignores children whose parent is not present in the menu', () => {
    roleMenu.set([
      menuItem({ MENIdMenu: 5, MENIdMenuPadre: 99, MENNombre: 'Huérfano', MENUrl: 'x' }),
    ]);

    expect(component.menu()).toEqual([]);
  });

  describe('private mapping helpers', () => {
    // Exercised through the public template/menu, asserted here directly for the
    // action branch and icon variants that the current role menu never produces.
    type SidebarInternals = {
      mapToSidebar: (
        items: RoleMenu[],
        actions?: Record<string, () => void>
      ) => SidebarItem[];
      iconFor: (raw: string) => Partial<SidebarItem>;
      target: (
        name: string,
        url: string,
        actions: Record<string, () => void>
      ) => { action: () => void } | { route: string };
    };

    function internals(): SidebarInternals {
      return component as unknown as SidebarInternals;
    }

    it('iconFor returns an empty object for blank icons', () => {
      expect(internals().iconFor('')).toEqual({});
      expect(internals().iconFor('   ')).toEqual({});
      expect(internals().iconFor(undefined as unknown as string)).toEqual({});
    });

    it('iconFor distinguishes svg markup from icon names', () => {
      expect(internals().iconFor('<svg></svg>')).toEqual({ iconSvg: '<svg></svg>' });
      expect(internals().iconFor('barLineChartIcon')).toEqual({ icon: 'barLineChartIcon' });
    });

    it('target returns the registered action when the name has one', () => {
      const action = jest.fn();
      expect(internals().target('Salir', 'ignored', { Salir: action })).toEqual({ action });
    });

    it('target returns the route when there is no matching action', () => {
      expect(internals().target('Otro', 'la-ruta', {})).toEqual({ route: 'la-ruta' });
    });

    it('mapToSidebar defaults the actions map when omitted', () => {
      const result = internals().mapToSidebar([
        menuItem({ MENIdMenu: 1, MENNombre: 'Solo', MENUrl: 'solo' }),
      ]);
      expect(result).toEqual([{ title: 'Solo', route: 'solo' }]);
    });
  });
});
