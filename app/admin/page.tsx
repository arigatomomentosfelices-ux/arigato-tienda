
"use client";

import { useState } from "react";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.correcto) {
        setError(data.error || "No se pudo iniciar sesión.");
        return;
      }

      setPassword("");
      setAuthenticated(true);
    } catch {
      setError("No se pudo conectar. Intentá nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", {
      method: "POST",
      cache: "no-store",
    });

    setAuthenticated(false);
    setPassword("");
    setError("");
  }

  if (authenticated) {
    return (
      <main style={styles.main}>
        <section style={styles.card}>
          <h1>Administración ARIGATO</h1>
          <p>Acceso autorizado.</p>
          <p>
            Próximamente vas a poder organizar tus productos,
            elegir categorías y decidir cuáles mostrar en la tienda.
          </p>
          <button onClick={logout} style={styles.button}>
            Cerrar sesión
          </button>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.main}>
      <section style={styles.card}>
        <h1>ARIGATO</h1>
        <p>Administración de la tienda</p>

        <form onSubmit={login}>
          <label htmlFor="admin-password">
            Contraseña de administración
          </label>

          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            style={styles.input}
          />

          {error && (
            <p role="alert" style={styles.error}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading ? "Verificando..." : "Ingresar"}
          </button>
        </form>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "70vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    fontFamily: "Arial, sans-serif",
    background: "#f8f6f1",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    padding: "32px",
    borderRadius: "12px",
    background: "#ffffff",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  },
  input: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    marginTop: "8px",
    marginBottom: "16px",
    padding: "12px",
    border: "1px solid #cccccc",
    borderRadius: "6px",
    fontSize: "16px",
  },
  button: {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "6px",
    background: "#222222",
    color: "#ffffff",
    fontSize: "16px",
    cursor: "pointer",
  },
  error: {
    color: "#b42318",
    fontSize: "14px",
  },
};
