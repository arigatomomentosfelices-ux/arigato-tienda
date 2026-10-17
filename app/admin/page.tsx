
"use client";

import { useCallback, useEffect, useState } from "react";

type Product = {
  item_id: string;
  title: string | null;
  price: number | string | null;
  currency_id: string | null;
  available_quantity: number | null;
  status: string | null;
  permalink: string | null;
  thumbnail: string | null;
  pictures: { url?: string | null }[] | null;
  selected_for_store: boolean;
  arigato_category: string | null;
};

const PAGE_SIZE = 20;

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [saving, setSaving] = useState<string | null>(null);

  const loadProducts = useCallback(async (currentPage: number) => {
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `/api/admin/products?page=${currentPage}`,
        { cache: "no-store" }
      );
      const data = await response.json();

      if (response.status === 401) {
        setAuthenticated(false);
        setProducts([]);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "No se pudieron cargar los productos.");
      }

      setProducts(data.productos || []);
      setTotal(Number(data.total || 0));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar los productos."
      );
    } finally {
      setLoading(false);
    }
  }, []);

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

  useEffect(() => {
    if (authenticated) {
      void loadProducts(page);
    }
  }, [authenticated, page, loadProducts]);

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
      setPage(1);
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
      setProducts([]);
      setPassword("");
      setNotice("");
      setError("");
    }
  }

  function editProduct(itemId: string, changes: Partial<Product>) {
    setProducts((current) =>
      current.map((product) =>
        product.item_id === itemId ? { ...product, ...changes } : product
      )
    );
  }

  async function saveProduct(product: Product) {
    setSaving(product.item_id);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id: product.item_id,
          arigato_category: product.arigato_category,
          selected_for_store: product.selected_for_store,
        }),
        cache: "no-store",
      });
      const data = await response.json();

      if (response.status === 401) {
        setAuthenticated(false);
        setProducts([]);
        throw new Error("La sesión venció. Ingresá nuevamente.");
      }

      if (!response.ok) {
        throw new Error(data.error || "No se pudieron guardar los cambios.");
      }

      setNotice(`Cambios guardados: ${product.title || product.item_id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar los cambios."
      );
    } finally {
      setSaving(null);
    }
  }

  if (checking) {
    return <main style={styles.page}>Verificando sesión...</main>;
  }

  if (!authenticated) {
    return (
      <main style={styles.page}>
        <section style={styles.loginCard}>
          <h1>ARIGATO</h1>
          <p>Administración de la tienda</p>
          <form onSubmit={login}>
            <label htmlFor="admin-password">Contraseña de administración</label>
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
            <button disabled={loading} type="submit" style={styles.button}>
              {loading ? "Verificando..." : "Ingresar"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1>ARIGATO</h1>
          <p>Administración del catálogo</p>
        </div>
        <button onClick={logout} style={styles.secondaryButton}>
          Cerrar sesión
        </button>
      </header>

      <section style={styles.catalog}>
        <h2>Productos de Mercado Libre</h2>
        <p>
          Encontrados en la base de datos: <strong>{total}</strong>.
          Elegí una categoría propia y marcá qué productos querés mostrar.
          Cada cambio se guarda al presionar «Guardar».
        </p>

        {error && <p role="alert" style={styles.error}>{error}</p>}
        {notice && <p role="status" style={styles.success}>{notice}</p>}
        {loading && <p>Cargando productos...</p>}

        {!loading && products.length === 0 && (
          <p>No hay productos para mostrar en esta página.</p>
        )}

        <div style={styles.grid}>
          {products.map((product) => {
            const image =
              product.thumbnail ||
              product.pictures?.find((picture) => picture.url)?.url ||
              null;

            return (
              <article key={product.item_id} style={styles.product}>
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt={product.title || "Producto"}
                    style={styles.image}
                    loading="lazy"
                  />
                ) : (
                  <div style={styles.noImage}>Sin imagen</div>
                )}

                <div style={styles.productBody}>
                  <h3>{product.title || "Producto sin título"}</h3>
                  <p style={styles.price}>
                    {product.currency_id || "$"}{" "}
                    {product.price == null
                      ? "Precio no disponible"
                      : Number(product.price).toLocaleString("es-AR")}
                  </p>
                  <p style={styles.meta}>
                    ID: {product.item_id}
                  </p>
                  <p style={styles.meta}>
                    Stock: {product.available_quantity ?? 0} · Estado ML:{" "}
                    {product.status || "sin estado"}
                  </p>

                  {product.permalink && (
                    <a
                      href={product.permalink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ver en Mercado Libre
                    </a>
                  )}

                  <label style={styles.label}>
                    Categoría de ARIGATO
                    <input
                      type="text"
                      maxLength={80}
                      value={product.arigato_category || ""}
                      placeholder="Ej.: Pizarras, Fotolibros..."
                      onChange={(event) =>
                        editProduct(product.item_id, {
                          arigato_category: event.target.value,
                        })
                      }
                      style={styles.input}
                    />
                  </label>

                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={product.selected_for_store}
                      onChange={(event) =>
                        editProduct(product.item_id, {
                          selected_for_store: event.target.checked,
                        })
                      }
                    />
                    Mostrar en la tienda ARIGATO
                  </label>

                  <button
                    onClick={() => void saveProduct(product)}
                    disabled={saving === product.item_id}
                    style={styles.button}
                  >
                    {saving === product.item_id ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <nav style={styles.pagination} aria-label="Paginación del catálogo">
          <button
            style={styles.secondaryButton}
            disabled={page <= 1 || loading}
            onClick={() => setPage((current) => current - 1)}
          >
            Anterior
          </button>
          <span>
            Página {page} de {totalPages}
          </span>
          <button
            style={styles.secondaryButton}
            disabled={page >= totalPages || loading}
            onClick={() => setPage((current) => current + 1)}
          >
            Siguiente
          </button>
        </nav>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "24px",
    background: "#f8f6f1",
    color: "#242424",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    maxWidth: "1200px",
    margin: "0 auto 24px",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
  },
  catalog: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "24px",
    background: "#fff",
    borderRadius: "12px",
  },
  loginCard: {
    maxWidth: "420px",
    margin: "50px auto",
    padding: "32px",
    borderRadius: "12px",
    background: "#fff",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
    marginTop: "24px",
  },
  product: {
    minWidth: 0,
    overflow: "hidden",
    border: "1px solid #e5e0d8",
    borderRadius: "10px",
    background: "#fff",
  },
  image: {
    width: "100%",
    height: "200px",
    objectFit: "contain",
    background: "#fff",
  },
  noImage: {
    height: "200px",
    display: "grid",
    placeItems: "center",
    background: "#f1eee8",
    color: "#777",
  },
  productBody: {
    display: "grid",
    gap: "10px",
    padding: "16px",
  },
  price: { fontSize: "18px", fontWeight: 700, margin: 0 },
  meta: { fontSize: "12px", color: "#666", margin: 0, overflowWrap: "anywhere" },
  label: { display: "grid", gap: "6px", fontSize: "14px" },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    marginTop: "6px",
    padding: "11px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "16px",
  },
  button: {
    padding: "11px 14px",
    border: "none",
    borderRadius: "6px",
    background: "#222",
    color: "#fff",
    fontSize: "14px",
    cursor: "pointer",
  },
  secondaryButton: {
    padding: "10px 14px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    background: "#fff",
    color: "#222",
    cursor: "pointer",
  },
  pagination: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: "16px",
    padding: "24px 0 8px",
  },
  error: { color: "#b42318" },
  success: { color: "#187344" },
};
