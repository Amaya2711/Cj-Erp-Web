import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { saveAuthUser } from "../../../utils/authStorage";

export default function LoginPage() {
  const navigate = useNavigate();

  const [idUsuario, setIdUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("");

    if (!idUsuario.trim()) {
      setMensaje("Ingrese el usuario.");
      return;
    }

    if (!clave.trim()) {
      setMensaje("Ingrese la clave.");
      return;
    }

    try {
      setCargando(true);

      const response = await login({
        idUsuario: idUsuario.trim(),
        clave: clave.trim()
      });

      if (!response?.data?.token) {
        setMensaje(response?.message || "No se pudo iniciar sesión.");
        return;
      }

      const payload = response.data;

      saveAuthUser({
        token: payload.token,
        usuario: payload.idUsuario ?? "",
        nombre: payload.nombreEmpleado ?? "",
        correo: payload.correo ?? "",
        codEmp: payload.codEmp ?? "",
        codVal: payload.codVal ?? "",
        cuadrilla: payload.cuadrilla ?? ""
      });

      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error);

      const mensajeError =
        error?.response?.data?.message ||
        error?.response?.data?.mensaje ||
        "No se pudo iniciar sesión.";

      setMensaje(mensajeError);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>CJ</div>
          <div>
            <h1 style={styles.title}>CJ Telecom</h1>
            <p style={styles.subtitle}>Portal ERP</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.group}>
            <label htmlFor="idUsuario" style={styles.label}>
              Usuario
            </label>
            <input
              id="idUsuario"
              type="text"
              value={idUsuario}
              onChange={(e) => setIdUsuario(e.target.value)}
              placeholder="Ingrese su usuario"
              autoComplete="username"
              style={styles.input}
            />
          </div>

          <div style={styles.group}>
            <label htmlFor="clave" style={styles.label}>
              Clave
            </label>
            <input
              id="clave"
              type="password"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              placeholder="Ingrese su clave"
              autoComplete="current-password"
              style={styles.input}
            />
          </div>

          {mensaje ? <div style={styles.error}>{mensaje}</div> : null}

          <button type="submit" disabled={cargando} style={styles.button}>
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8fafc",
    padding: 24
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 28,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    boxSizing: "border-box"
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 24
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 14,
    background: "#0f172a",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 20
  },
  title: {
    margin: 0,
    fontSize: 24,
    color: "#0f172a"
  },
  subtitle: {
    margin: "4px 0 0 0",
    color: "#64748b",
    fontSize: 14
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16
  },
  group: {
    display: "flex",
    flexDirection: "column",
    gap: 6
  },
  label: {
    fontSize: 14,
    fontWeight: 600,
    color: "#334155"
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    outline: "none",
    fontSize: 14,
    boxSizing: "border-box"
  },
  button: {
    border: "none",
    background: "#f5a623",
    color: "#17143a",
    padding: "10px 18px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 14
  },
  error: {
    marginTop: 4,
    color: "#b91c1c",
    fontSize: 14
  }
};