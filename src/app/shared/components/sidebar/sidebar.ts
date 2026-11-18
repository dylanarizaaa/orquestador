import { ChangeDetectionStrategy, Component, Signal, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown, lucideChevronLeft } from '@ng-icons/lucide';
import { HlmCollapsibleImports } from '@spartan-ng/helm/collapsible';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { RoleMenu } from '../../../core/models/menu.model';
import { SidebarItem, SidebarSubItem } from './sidebar.model';
import { barLineChartIcon, electronicInvoicingIcon, historicalIcon } from 'src/app/core/config/icons';
import { AuthService } from 'src/app/core/services/auth.service';

interface TreeNode extends RoleMenu {
  children: RoleMenu[];
}

@Component({
  selector: 'app-sidebar',
  imports: [
    HlmSidebarImports, HlmCollapsibleImports, NgIcon, RouterModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.html',
  viewProviders: [
    provideIcons({
      lucideChevronLeft,
      lucideChevronDown,
      electronicInvoicingIcon,
      historicalIcon,
      barLineChartIcon
    })
  ]
})
export class Sidebar {
  private readonly auth = inject(AuthService);

  /**
   * Acciones para items que no navegan a una ruta sino que ejecutan una función.
   * La clave es el `MENNombre` del item. Ej.: { 'Notificaciones': () => ... }.
   */
  private readonly actions: Record<string, () => void> = {};

  // El menú lo carga el authGuard; aquí solo se consume desde el estado del servicio.
  readonly menu: Signal<SidebarItem[]> = computed(() =>
    this.mapToSidebar(this.auth.roleMenu(), this.actions)
  );

  private mapToSidebar(
    items: RoleMenu[],
    actions: Record<string, () => void> = {}
  ): SidebarItem[] {
    const tree: Record<number, TreeNode> = {};

    // Nodos raíz (sin padre).
    items.forEach(item => {
      if (item.MENIdMenuPadre === 0) {
        tree[item.MENIdMenu] = { ...item, children: [] };
      }
    });

    // Hijos colgados de su padre.
    items.forEach(item => {
      if (item.MENIdMenuPadre !== 0 && tree[item.MENIdMenuPadre]) {
        tree[item.MENIdMenuPadre].children.push(item);
      }
    });

    return Object.values(tree).map(parent => {
      if (parent.children.length === 0) {
        return {
          title: parent.MENNombre,
          ...this.iconFor(parent.MENIcono),
          ...this.target(parent.MENNombre, parent.MENUrl, actions),
        };
      }

      return {
        title: parent.MENNombre,
        ...this.iconFor(parent.MENIcono),
        expanded: true,
        subItems: parent.children.map(child =>
        ({
          title: child.MENNombre,
          ...this.target(child.MENNombre, child.MENUrl, actions),
        })
        ),
      };
    });
  }

  /**
   * Resuelve el icono según el contenido de `MENIcono`:
   * - si trae markup SVG, se renderiza dinámicamente vía `[svg]`;
   * - si trae un nombre, se usa como icono registrado vía `[name]`.
   */
  private iconFor(raw: string): Pick<SidebarItem, 'icon' | 'iconSvg'> {
    const value = raw?.trim() ?? '';
    if (!value) return {};
    return value.includes('<svg') ? { iconSvg: value } : { icon: value };
  }

  /** Devuelve `action` si el item tiene una acción asociada; si no, `route`. */
  private target(
    name: string,
    url: string,
    actions: Record<string, () => void>
  ): Pick<SidebarSubItem, 'action'> | Pick<SidebarSubItem, 'route'> {
    return name in actions ? { action: actions[name] } : { route: url };
  }
}
