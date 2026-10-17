
"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/admin/session", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const data = await response.json();
        setAuthenticated(data.autenticado === true);
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        cache: "no-store",
      });
    } finally {
      setAuthenticated(false);
      setPassword("");
    }
  }

  if (checking) {
    return <main style={styles.main}>Verificando sesión...</main>;
  }

  return (
    <main style={styles.main}>
      <section style={styles.card}>
        <h1>ARIGATO</h1>
        <p>Administración de la tienda</p>

        {authenticated ? (
          <>
            <h2>Acceso autorizado</h2>
            <p>La sesión está activa.</p>
            <p>El catálogo de productos todavía está en preparación.</p>
            <button onClick={logout} style={styles.button}>
              Cerrar sesión
            </button>
          </>
        ) : (
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

            {error && <p role="alert" style={styles.error}>{error}</p>}

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? "Verificando..." : "Ingresar"}
            </button>
          </form>
        )}
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
    background: "#fff",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  },
  input: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    marginTop: "8px",
    marginBottom: "16px",
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "16px",
  },
  button: {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "6px",
    background: "#222",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
  },
  error: { color: "#b42318", fontSize: "14px" },
};
