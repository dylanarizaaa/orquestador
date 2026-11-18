/** Opción simple del menú lateral: navega a una ruta o ejecuta una acción. */
export interface SidebarSubItem {
  title: string;
  route?: string;
  action?: () => void;
}

/** Item de primer nivel del menú lateral. */
export interface SidebarItem extends SidebarSubItem {
  /** Nombre de un icono registrado en `provideIcons`. */
  icon?: string;
  /** SVG crudo (cuando `MENIcono` trae el markup en vez de un nombre). */
  iconSvg?: string;
  expanded?: boolean;
  subItems?: SidebarSubItem[];
}
