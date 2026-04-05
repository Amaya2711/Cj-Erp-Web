import type { MenuDto } from "../../../models/seguridad/menu.types";
import { menuService } from "../../seguridad/services/menuService";
import { getCategoryConfig } from "../config/categoryConfig";

/**
 * Dashboard representation of a menu group
 */
export interface DashboardGroup {
  titulo: string;
  subtitulo?: string;
  color: string;
  tiles: DashboardTile[];
  codigoMenu?: string;
}

/**
 * Dashboard tile (action/menu item within a group)
 */
export interface DashboardTile {
  label: string;
  path: string;
  badge?: string;
}

/**
 * Transform MenuDto[] into DashboardGroup[]
 * Groups menus by their parent (nivel 0 = categories, nivel 1+ = tiles)
 *
 * Expected hierarchy:
 * - NivelMenu 0: Categories (Gestión, Finanzas, etc.)
 *   - NivelMenu 1+: Modules/Actions (Operaciones, Depósitos, etc.)
 */
export function transformMenusToDashboard(menus: MenuDto[]): DashboardGroup[] {
  // Group menus by their parent (IdMenuPadre)
  // Category menus have IdMenuPadre = null or NivelMenu = 0
  const categoryMap = new Map<number | string, MenuDto>();
  const moduleMap = new Map<number | string, MenuDto[]>();

  // Separate categories from modules
  menus.forEach((menu) => {
    // Categories are nivel 0 or have no parent
    if (menu.nivelMenu === 0 || menu.idMenuPadre == null) {
      categoryMap.set(menu.idMenu, menu);
    } else {
      // Modules belong to a parent
      const parentId = menu.idMenuPadre || "uncategorized";
      if (!moduleMap.has(parentId)) {
        moduleMap.set(parentId, []);
      }
      moduleMap.get(parentId)!.push(menu);
    }
  });

  // Build dashboard groups from categories
  const groups: DashboardGroup[] = [];

  categoryMap.forEach((category) => {
    const categoryModules = moduleMap.get(category.idMenu) || [];

    // Sort modules by order
    categoryModules.sort((a, b) => {
      const orderA = a.ordenMenu || 0;
      const orderB = b.ordenMenu || 0;
      return orderA - orderB;
    });

    // Create tiles from modules
    const tiles: DashboardTile[] = categoryModules
      .filter((m) => m.ruta) // Only include modules with routes
      .map((module) => ({
        label: module.nombreMenu,
        path: module.ruta || "#",
        badge: module.nombreMenu.charAt(0).toUpperCase(),
      }));

    // Only add group if it has tiles (or force it anyway if NoModules)
    // Para evitar mostrar categorías vacías, ajusta esta condición
    if (tiles.length > 0 || true) {
      const config = getCategoryConfig(category.codigoMenu);
      groups.push({
        titulo: category.nombreMenu,
        subtitulo: config.subtitle,
        color: config.color,
        tiles,
        codigoMenu: category.codigoMenu || undefined,
      });
    }
  });

  // Sort groups by configured order
  groups.sort((a, b) => {
    const orderA = getCategoryConfig(a.codigoMenu).order;
    const orderB = getCategoryConfig(b.codigoMenu).order;
    return orderA - orderB;
  });

  return groups;
}

/**
 * Load dashboard menus for a specific user
 * Calls backend API to get user's permitted menus
 * Transforms them into dashboard UI structure
 */
export async function loadDashboardMenus(
  idUsuario: string
): Promise<DashboardGroup[]> {
  try {
    const menus = await menuService.obtenerPorUsuario(idUsuario);
    return transformMenusToDashboard(menus);
  } catch (error) {
    console.error("Error loading dashboard menus for user:", idUsuario, error);
    // Return empty array or default groups on error
    return [];
  }
}

/**
 * Load all dashboard menus (admin view)
 * For development/testing when user info not available
 */
export async function loadAllDashboardMenus(): Promise<DashboardGroup[]> {
  try {
    const menus = await menuService.obtenerCompleto();
    return transformMenusToDashboard(menus);
  } catch (error) {
    console.error("Error loading all dashboard menus:", error);
    return [];
  }
}
