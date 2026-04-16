import { useMemo } from "react";
import { useLocation } from "react-router-dom";

function formatSegment(segment: string): string {
  return segment
    .replace(/[-_]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function DynamicMenuRoutePage() {
  const location = useLocation();

  const title = useMemo(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    if (parts.length === 0) {
      return "Modulo";
    }

    return parts.map(formatSegment).join(" / ");
  }, [location.pathname]);

  return (
    <section style={styles.wrapper}>
      <h1 style={styles.title}>{title}</h1>
      <p style={styles.subtitle}>
        La ruta esta habilitada en el menu. Puedes reemplazar esta vista por una pagina especifica
        cuando el modulo este implementado.
      </p>
      <div style={styles.pathBox}>{location.pathname}</div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
  },
  title: {
    margin: 0,
    fontSize: 30,
    lineHeight: 1.15,
    fontWeight: 800,
    color: "#0F172A",
  },
  subtitle: {
    marginTop: 10,
    marginBottom: 18,
    color: "#475569",
    fontSize: 15,
    lineHeight: 1.55,
    maxWidth: 760,
  },
  pathBox: {
    display: "inline-block",
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    color: "#0F172A",
    borderRadius: 10,
    padding: "8px 12px",
    fontSize: 13,
    fontWeight: 700,
  },
};
