import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { clearAuthUser, getAuthUser } from "../utils/authStorage";
import {
  loadDashboardMenus,
  type DashboardGroup,
  type DashboardTile,
} from "../features/dashboard/services/dashboardMenuService";

type FooterCopy = {
  title: string;
  description: string;
};

function formatPathLabel(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/Page$/i, "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function tileMatchesPath(tile: DashboardTile, pathname: string): boolean {
  if (pathname.startsWith(tile.path)) {
    return true;
  }

  return tile.children?.some((child) => tileMatchesPath(child, pathname)) ?? false;
}

function findDeepestTileMatch(
  tiles: DashboardTile[],
  pathname: string
): DashboardTile | null {
  let bestMatch: DashboardTile | null = null;

  const visit = (tile: DashboardTile) => {
    if (pathname.startsWith(tile.path)) {
      if (!bestMatch || tile.path.length > bestMatch.path.length) {
        bestMatch = tile;
      }
    }

    tile.children?.forEach(visit);
  };

  tiles.forEach(visit);
  return bestMatch;
}

function getFooterCopy(pathname: string, menuDashboard: DashboardGroup[]): FooterCopy {
  if (pathname.startsWith("/dashboard")) {
    return {
      title: "Panel principal",
      description: "Seleccione un modulo para continuar con la operacion del sistema",
    };
  }

  type FooterMatch = { groupTitle: string; tileLabel: string; pathLength: number };
  let bestMatch: FooterMatch | null = null;

  for (const group of menuDashboard) {
    for (const tile of group.tiles) {
      const deepestMatch = findDeepestTileMatch([tile], pathname);
      if (!deepestMatch) {
        continue;
      }

      const currentMatch: FooterMatch = {
        groupTitle: group.titulo,
        tileLabel: deepestMatch.label,
        pathLength: deepestMatch.path.length,
      };

      if (!bestMatch || currentMatch.pathLength > bestMatch.pathLength) {
        bestMatch = currentMatch;
      }
    }
  }

  if (bestMatch) {
    return {
      title: `${bestMatch.groupTitle} - ${bestMatch.tileLabel}`,
      description: `Gestione ${bestMatch.tileLabel.toLowerCase()} del modulo ${bestMatch.groupTitle}.`,
    };
  }

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0) {
    const moduleTitle = formatPathLabel(segments[0]);
    const pageTitle = formatPathLabel(segments[segments.length - 1]);

    return {
      title: `${moduleTitle} - ${pageTitle}`,
      description: `Gestione ${pageTitle.toLowerCase()} del modulo ${moduleTitle}.`,
    };
  }

  return {
    title: "Portal de Aplicaciones",
    description: "Sistema ERP CJ Telecom",
  };
}

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const authUser = getAuthUser();
  const [menuDashboard, setMenuDashboard] = useState<DashboardGroup[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);

  const usuarioMostrar = (authUser?.usuario || "").toUpperCase();
  const empleadoMostrar = (authUser?.nombre || "").toUpperCase();

  useEffect(() => {
    let activo = true;

    const cargarMenu = async () => {
      setMenuLoading(true);

      if (!authUser?.usuario) {
        if (activo) {
          setMenuDashboard([]);
          setMenuLoading(false);
        }
        return;
      }

      const grupos = await loadDashboardMenus(authUser.usuario);

      if (activo) {
        setMenuDashboard(grupos.filter((grupo) => grupo.tiles.length > 0));
        setMenuLoading(false);
      }
    };

    void cargarMenu();

    return () => {
      activo = false;
    };
  }, [authUser?.usuario]);

  const cerrarSesion = () => {
    clearAuthUser();
    navigate("/");
  };

  const irDashboard = () => {
    navigate("/dashboard");
  };

  const menuActivo = menuDashboard.find((grupo) =>
    grupo.tiles.some((tile) => tileMatchesPath(tile, location.pathname))
  );

  const tileActivo = menuActivo
    ? menuActivo.tiles.find((tile) => tileMatchesPath(tile, location.pathname)) ?? null
    : null;
  const secondLevelItems = menuActivo?.tiles ?? [];
  const thirdLevelItems = tileActivo?.children ?? [];

  const footerCopy = getFooterCopy(location.pathname, menuDashboard);

  return (
    <div style={styles.wrapper}>
      <div style={styles.pageHeader}>
        <header style={styles.header}>
          <div style={styles.brandBox} onClick={irDashboard}>
            <img src={logo} alt="CJ Telecom" style={styles.logo} />
            <div>
              <div style={styles.brandTitle}></div>
              <div style={styles.brandSubtitle}>Portal de Aplicaciones</div>
            </div>
          </div>

          <div style={styles.headerRight}>
            <div style={styles.userInfoBox}>
              <div style={styles.userLabel}>Usuario: {usuarioMostrar}</div>
              <div style={styles.employeeLabel}>
                Empleado: {empleadoMostrar || "NO DEFINIDO"}
              </div>
            </div>
            <button style={styles.logoutButton} onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          </div>
        </header>

        <nav style={styles.topMenu}>
          {!menuLoading && menuDashboard.length === 0 ? (
            <div style={styles.topMenuEmpty}>
              Usuario no tiene opciones de menu configurado
            </div>
          ) : (
            menuDashboard.map((grupo) => {
              const firstPath = grupo.tiles[0]?.path || "/dashboard";
              const activo = grupo.tiles.some((tile) =>
                tileMatchesPath(tile, location.pathname)
              );

              return (
                <NavLink
                  key={grupo.titulo}
                  to={firstPath}
                  style={{
                    ...styles.topMenuItem,
                    ...(activo ? styles.topMenuItemActive : {}),
                  }}
                >
                  {grupo.titulo}
                </NavLink>
              );
            })
          )}
        </nav>

        {menuActivo && (
          <div style={styles.subMenuBar}>
            <div style={styles.subMenuSection}>
              <div style={styles.subMenuTitle}>{menuActivo.titulo}</div>
              <div style={styles.subMenuItems}>
                {secondLevelItems.map((tile) => {
                  const activo = tileMatchesPath(tile, location.pathname);

                  return (
                    <NavLink
                      key={tile.path}
                      to={tile.path}
                      style={{
                        ...styles.subMenuItem,
                        ...(activo ? styles.subMenuItemActive : {}),
                      }}
                    >
                      {tile.label}
                    </NavLink>
                  );
                })}
              </div>
            </div>

            {tileActivo && thirdLevelItems.length > 0 && (
              <div style={{ ...styles.subMenuSection, ...styles.subMenuSectionAlignedRight }}>
                <div style={styles.subMenuTitle}>{tileActivo.label}</div>
                <div style={styles.subMenuItems}>
                  {thirdLevelItems.map((tile) => {
                    const activo = tileMatchesPath(tile, location.pathname);

                    return (
                      <NavLink
                        key={tile.path}
                        to={tile.path}
                        style={{
                          ...styles.thirdMenuItem,
                          ...(activo ? styles.thirdMenuItemActive : {}),
                        }}
                      >
                        {tile.label}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <main style={styles.main}>
        <Outlet />
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <span>{footerCopy.title}</span>
          <span>{footerCopy.description}</span>
        </div>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    minHeight: "100vh",
    background: "#F3F5F9",
    display: "flex",
    flexDirection: "column",
  },
  pageHeader: {
    position: "sticky",
    top: 0,
    zIndex: 1100,
    boxShadow: "0 4px 14px rgba(23,20,58,0.08)",
  },
  header: {
    height: 88,
    background: "#17143A",
    color: "#FFFFFF",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 24px",
    boxSizing: "border-box",
    borderBottom: "3px solid #6E4CCB",
  },
  brandBox: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    cursor: "pointer",
  },
  logo: {
    height: 48,
    width: "auto",
    objectFit: "contain",
    display: "block",
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: 800,
    lineHeight: 1.1,
  },
  brandSubtitle: {
    fontSize: 17,
    fontWeight: 700,
    opacity: 0.95,
    marginTop: 2,
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 18,
  },
  userInfoBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 2,
  },
  userLabel: {
    fontSize: 14,
    fontWeight: 700,
  },
  employeeLabel: {
    fontSize: 12,
    fontWeight: 600,
    opacity: 0.9,
  },
  logoutButton: {
    border: "none",
    background: "#F5A623",
    color: "#17143A",
    padding: "12px 18px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 14,
  },
  topMenu: {
    background: "#FFFFFF",
    minHeight: 56,
    display: "flex",
    alignItems: "center",
    gap: 0,
    padding: "0 20px",
    boxSizing: "border-box",
    borderBottom: "1px solid #E5E7EB",
    overflowX: "auto",
  },
  topMenuItem: {
    textDecoration: "none",
    color: "#1F2937",
    fontWeight: 700,
    fontSize: 14,
    padding: "10px 14px",
    borderRadius: 10,
    whiteSpace: "nowrap",
  },
  topMenuItemActive: {
    background: "#6E4CCB",
    color: "#FFFFFF",
  },
  topMenuEmpty: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: 600,
    padding: "10px 14px",
    whiteSpace: "nowrap",
  },
  subMenuBar: {
    background: "#F8FAFC",
    borderBottom: "1px solid #E5E7EB",
    padding: "6px 14px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  subMenuSection: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  subMenuSectionAlignedRight: {
    marginLeft: "auto",
  },
  subMenuTitle: {
    fontWeight: 800,
    fontSize: 13,
    color: "#17143A",
    minWidth: 110,
  },
  subMenuItems: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
  },
  subMenuItem: {
    textDecoration: "none",
    color: "#374151",
    fontWeight: 600,
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 8,
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
  },
  subMenuItemActive: {
    background: "#EDE9FE",
    border: "1px solid #C4B5FD",
    color: "#17143A",
  },
  thirdMenuItem: {
    textDecoration: "none",
    color: "#4B5563",
    fontWeight: 600,
    fontSize: 11,
    padding: "5px 9px",
    borderRadius: 8,
    background: "#F9FAFB",
    border: "1px solid #E5E7EB",
  },
  thirdMenuItemActive: {
    background: "#DBEAFE",
    border: "1px solid #93C5FD",
    color: "#1E3A8A",
  },
  main: {
    flex: 1,
    padding: 12,
    paddingBottom: 82,
    boxSizing: "border-box",
  },
  footer: {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 44,
    background: "#17143A",
    borderTop: "2px solid #6E4CCB",
    color: "#E5E7EB",
    zIndex: 1200,
    display: "flex",
    alignItems: "center",
  },
  footerContent: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 24px",
    fontSize: 12,
    fontWeight: 600,
    boxSizing: "border-box",
    gap: 12,
    flexWrap: "wrap",
  },
};