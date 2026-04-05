import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthUser } from "../utils/authStorage";
import { loadDashboardMenus } from "../features/dashboard/services/dashboardMenuService";
import type { DashboardGroup } from "../features/dashboard/services/dashboardMenuService";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [dashboardMenus, setDashboardMenus] = useState<DashboardGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMenus = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const authUser = getAuthUser();
        if (!authUser?.usuario) {
          throw new Error("Usuario no autenticado");
        }

        const menus = await loadDashboardMenus(authUser.usuario);
        setDashboardMenus(menus);
      } catch (err) {
        console.error("Error loading dashboard menus:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Error al cargar los menús del dashboard"
        );
        setDashboardMenus([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadMenus();
  }, []);

  if (isLoading) {
    return (
      <div style={styles.page}>
        <div style={styles.hero}>
          <div>
            <h1 style={styles.heroTitle}>Panel principal</h1>
            <p style={styles.heroText}>Cargando menús...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.hero}>
          <div>
            <h1 style={styles.heroTitle}>Panel principal</h1>
            <p style={{ ...styles.heroText, color: "#ff6b6b" }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div>
          <h1 style={styles.heroTitle}>Panel principal</h1>
          <p style={styles.heroText}>
            Seleccione un módulo para continuar con la operación del sistema.
          </p>
        </div>
      </div>

      {dashboardMenus.map((grupo) => (
        <section key={grupo.titulo} style={styles.section}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>{grupo.titulo}</h2>
              <div style={styles.sectionSubtitle}>{grupo.subtitulo}</div>
            </div>
          </div>

          <div style={styles.tilesGrid}>
            {grupo.tiles.map((tile) => (
              <button
                key={tile.path}
                style={{
                  ...styles.tile,
                  borderTop: `5px solid ${grupo.color}`,
                }}
                onClick={() => navigate(tile.path)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 14px 28px rgba(23,20,58,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 18px rgba(23,20,58,0.05)";
                }}
              >
                <div style={styles.tileTop}>
                  <div
                    style={{
                      ...styles.tileIcon,
                      background: grupo.color,
                    }}
                  >
                    {grupo.titulo.substring(0, 1)}
                  </div>
                </div>

                <div style={styles.tileLabel}>{tile.label}</div>
                <div style={styles.tileAction}>Abrir módulo</div>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: 28,
  },
  hero: {
    background: "linear-gradient(135deg, #17143A 0%, #2A2460 100%)",
    color: "#FFFFFF",
    borderRadius: 20,
    padding: "28px 30px",
    boxShadow: "0 10px 30px rgba(23,20,58,0.15)",
  },
  heroTitle: {
    margin: 0,
    fontSize: 28,
    fontWeight: 800,
  },
  heroText: {
    marginTop: 10,
    marginBottom: 0,
    fontSize: 15,
    opacity: 0.95,
  },
  section: {
    background: "#FFFFFF",
    borderRadius: 18,
    padding: 22,
    boxShadow: "0 8px 24px rgba(23,20,58,0.06)",
  },
  sectionHeader: {
    marginBottom: 18,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 800,
    color: "#17143A",
  },
  sectionSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: "#6B7280",
  },
  tilesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 16,
  },
  tile: {
    border: "1px solid #E5E7EB",
    borderRadius: 16,
    background: "#FFFFFF",
    minHeight: 150,
    padding: 18,
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 6px 18px rgba(23,20,58,0.05)",
    transition: "transform 0.18s ease, box-shadow 0.18s ease",
  },
  tileTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  tileIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 18,
  },
  tileLabel: {
    fontSize: 16,
    fontWeight: 800,
    color: "#17143A",
    lineHeight: 1.35,
    minHeight: 48,
  },
  tileAction: {
    marginTop: 16,
    fontSize: 12,
    fontWeight: 700,
    color: "#6B7280",
  },
};