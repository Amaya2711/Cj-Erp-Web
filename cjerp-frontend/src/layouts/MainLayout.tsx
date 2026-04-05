import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { clearAuthUser, getAuthUser } from "../utils/authStorage";
import {
  loadDashboardMenus,
  type DashboardGroup,
} from "../features/dashboard/services/dashboardMenuService";

type FooterCopy = {
  title: string;
  description: string;
};

function getFooterCopy(pathname: string): FooterCopy {
  if (
    pathname.startsWith("/seguridad/menu") ||
    pathname.startsWith("/seguridad/SeguridadMenuPage")
  ) {
    return {
      title: "Seguridad - Menu por rol",
      description: "Asigne que opciones de menu estaran disponibles para cada rol",
    };
  }

  if (
    pathname.startsWith("/seguridad/perfiles") ||
    pathname.startsWith("/seguridad/SeguridadPerfilesPage")
  ) {
    return {
      title: "Seguridad - Perfiles",
      description: "Administracion de perfiles funcionales del sistema",
    };
  }

  if (
    pathname.startsWith("/seguridad/roles") ||
    pathname.startsWith("/seguridad/SeguridadRolesPage")
  ) {
    return {
      title: "Seguridad - Roles",
      description: "Administracion de roles y niveles de acceso del sistema",
    };
  }

  if (
    pathname.startsWith("/seguridad/usuarios") ||
    pathname.startsWith("/seguridad/SeguridadUsuariosPage")
  ) {
    return {
      title: "Seguridad - Usuarios",
      description: "Administracion de usuarios del sistema",
    };
  }

  if (
    pathname.startsWith("/seguridad/permisos") ||
    pathname.startsWith("/seguridad/SeguridadPermisosPage")
  ) {
    return {
      title: "Seguridad - Permisos",
      description: "Asigne permisos por perfil, rol y usuario",
    };
  }

  if (pathname.startsWith("/seguridad")) {
    return {
      title: "Gestion de Seguridad",
      description: "Administracion centralizada de usuarios, perfiles, roles y permisos",
    };
  }

  if (pathname.startsWith("/administracion/asistencia")) {
    return {
      title: "Administracion - Asistencia",
      description: "Gestione asistencia del personal",
    };
  }

  if (pathname.startsWith("/administracion/vacaciones")) {
    return {
      title: "Administracion - Vacaciones",
      description: "Gestione solicitudes y control de vacaciones",
    };
  }

  if (pathname.startsWith("/dashboard")) {
    return {
      title: "Panel principal",
      description: "Seleccione un modulo para continuar con la operacion del sistema",
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
    grupo.tiles.some((tile) => location.pathname.startsWith(tile.path))
  );

  const footerCopy = getFooterCopy(location.pathname);

  return (
    <div style={styles.wrapper}>
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
              location.pathname.startsWith(tile.path)
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
          <div style={styles.subMenuTitle}>{menuActivo.titulo}</div>
          <div style={styles.subMenuItems}>
            {menuActivo.tiles.map((tile) => {
              const activo = location.pathname.startsWith(tile.path);

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
      )}

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
    gap: 10,
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
    padding: "10px 20px",
    display: "flex",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  subMenuTitle: {
    fontWeight: 800,
    fontSize: 15,
    color: "#17143A",
    minWidth: 140,
  },
  subMenuItems: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  subMenuItem: {
    textDecoration: "none",
    color: "#374151",
    fontWeight: 600,
    fontSize: 13,
    padding: "8px 12px",
    borderRadius: 8,
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
  },
  subMenuItemActive: {
    background: "#EDE9FE",
    border: "1px solid #C4B5FD",
    color: "#17143A",
  },
  main: {
    flex: 1,
    padding: 24,
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