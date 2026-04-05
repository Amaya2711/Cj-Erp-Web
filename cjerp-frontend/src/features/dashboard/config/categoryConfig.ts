/**
 * Category color and configuration mapping
 * Maps menu codes to dashboard category colors and metadata
 */

export interface CategoryConfig {
  color: string;
  subtitle?: string;
  order: number;
}

export const CATEGORY_COLORS: Record<string, CategoryConfig> = {
  // Primary categories - these match your SegMenu.CodigoMenu values
  GESTION: {
    color: "#6E4CCB",
    subtitle: "Operaciones",
    order: 1,
  },
  FINANZAS: {
    color: "#E74C3C",
    subtitle: "Tesorería y pagos",
    order: 2,
  },
  LOGISTICA: {
    color: "#0EA5E9",
    subtitle: "Inventario y control",
    order: 3,
  },
  ADMINISTRACION: {
    color: "#22C55E",
    subtitle: "Control administrativo",
    order: 4,
  },
  SEGURIDAD: {
    color: "#F59E0B",
    subtitle: "Usuarios y permisos",
    order: 5,
  },
  PLANTA: {
    color: "#8B5CF6",
    subtitle: "Operaciones de planta",
    order: 6,
  },
  MANTENIMIENTO: {
    color: "#EC4899",
    subtitle: "Mantenimiento de equipos",
    order: 7,
  },
  PAGOS: {
    color: "#14B8A6",
    subtitle: "Gestión de pagos",
    order: 8,
  },
  INICIO: {
    color: "#3B82F6",
    subtitle: "Panel inicial",
    order: 0,
  },
  OPERACIONES: {
    color: "#0F766E",
    subtitle: "Flujo operativo",
    order: 1,
  },
  COMERCIAL: {
    color: "#7C3AED",
    subtitle: "Ventas y clientes",
    order: 4,
  },
  COMPRAS: {
    color: "#EA580C",
    subtitle: "Abastecimiento",
    order: 5,
  },
  RECURSOSHUMANOS: {
    color: "#BE185D",
    subtitle: "Gestión de personal",
    order: 6,
  },
  INFORMESEINTELIGENCIA: {
    color: "#4338CA",
    subtitle: "Reportes y analítica",
    order: 11,
  },
  INFORMES: {
    color: "#4338CA",
    subtitle: "Reportes y analítica",
    order: 11,
  },
};

const CATEGORY_ALIASES: Record<string, string> = {
  RECURSOS_HUMANOS: "RECURSOSHUMANOS",
  RECURSOSHUMANOS: "RECURSOSHUMANOS",
  INFORMES_E_INTELIGENCIA: "INFORMESEINTELIGENCIA",
  INFORMESINTELIGENCIA: "INFORMESEINTELIGENCIA",
};

function normalizeCategoryKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

/**
 * Get color configuration for a category
 * Falls back to a default color if category not found
 */
export function getCategoryConfig(codigoMenu: string | null | undefined): CategoryConfig {
  if (!codigoMenu) {
    return {
      color: "#64748B",
      order: 999,
    };
  }

  const normalized = normalizeCategoryKey(codigoMenu);
  const aliasKey = CATEGORY_ALIASES[normalized] || normalized;
  return (
    CATEGORY_COLORS[aliasKey] || {
      color: "#64748B",
      order: 999,
    }
  );
}

/**
 * Get display name for a category using its name or codigo
 */
export function getCategoryDisplayName(nombreMenu: string): string {
  return nombreMenu.charAt(0).toUpperCase() + nombreMenu.slice(1).toLowerCase();
}
