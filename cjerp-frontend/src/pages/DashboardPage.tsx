import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthUser } from "../utils/authStorage";
import { loadDashboardMenus } from "../features/dashboard/services/dashboardMenuService";
import type { DashboardGroup } from "../features/dashboard/services/dashboardMenuService";

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return hex;
  }

  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

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
        <p style={styles.statusText}>Cargando menús...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <p style={{ ...styles.statusText, color: "#D14343" }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {dashboardMenus.map((grupo) => (
        <section 
          key={grupo.titulo} 
          style={{
            ...styles.section,
            borderLeft: `5px solid ${grupo.color}`,
          }}
        >
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={{...styles.sectionTitle, color: grupo.color}}>{grupo.titulo}</h2>
              <div style={styles.sectionSubtitle}>{grupo.subtitulo}</div>
            </div>
          </div>

          <div style={styles.tilesGrid}>
            {grupo.tiles.map((tile) => (
              <button
                key={tile.path}
                style={{
                  ...styles.tile,
                  background: hexToRgba(grupo.color, 0.08),
                  border: `1px solid ${hexToRgba(grupo.color, 0.35)}`,
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
                <div style={styles.tileLabel}>{tile.label}</div>
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
    gap: 4,
  },
  statusText: {
    margin: 0,
    fontSize: 15,
    color: "#374151",
    fontWeight: 600,
  },
  section: {
    background: "#FFFFFF",
    borderRadius: 18,
    padding: "12px 14px 14px 12px",
    boxShadow: "0 8px 24px rgba(23,20,58,0.06)",
  },
  sectionHeader: {
    marginBottom: 4,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 800,
    color: "#17143A",
  },
  sectionSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: "#6B7280",
  },
  tilesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 4,
  },
  tile: {
    border: "1px solid #E5E7EB",
    borderRadius: 16,
    background: "#FFFFFF",
    minHeight: 95,
    padding: 10,
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 6px 18px rgba(23,20,58,0.05)",
    transition: "transform 0.18s ease, box-shadow 0.18s ease",
  },
  tileTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
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
    minHeight: 32,
  },
  tileAction: {
    marginTop: 16,
    fontSize: 12,
    fontWeight: 700,
    color: "#6B7280",
  },
};