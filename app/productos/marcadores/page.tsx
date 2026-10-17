
"use client";

import { useEffect, useState } from "react";

type Producto = {
  item_id: string;
  title: string;
  price: number | string;
  currency_id: string;
  available_quantity: number;
  status: string;
  permalink: string;
  thumbnail: string | null;
  pictures: { id: string | null; url: string | null }[];
  arigato_category: string | null;
};

export default function MarcadoresPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activa = true;

    fetch("/api/store-products", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("No pudimos cargar los productos.");
        }

        return response.json();
      })
      .then((data) => {
        if (!activa) return;

        const lista: Producto[] = data.productos ?? [];

        setProductos(
          lista.filter(
            (producto) =>
              producto.arigato_category?.trim().toLowerCase() ===
              "marcadores"
          )
        );
      })
      .catch(() => {
        if (activa) {
          setError("No pudimos cargar los marcadores. Intentá nuevamente.");
        }
      })
      .finally(() => {
        if (activa) setCargando(false);
      });

    return () => {
      activa = false;
    };
  }, []);

  const formatoPrecio = (producto: Producto) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: producto.currency_id || "ARS",
      maximumFractionDigits: 2,
    }).format(Number(producto.price));

  return (
    <main
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px 24px 64px",
        fontFamily: "Arial, sans-serif",
        color: "#292521",
      }}
    >
      <a
        href="/productos"
        style={{ color: "inherit", textDecoration: "none" }}
      >
        ← Volver a productos
      </a>

      <header style={{ margin: "32px 0" }}>
        <span
          style={{
            fontSize: "12px",
            letterSpacing: "2px",
            color: "#777064",
          }}
        >
          ARIGATO · MOMENTOS FELICES
        </span>
        <h1 style={{ fontSize: "36px", marginBottom: "12px" }}>
          Marcadores
        </h1>
        <p style={{ color: "#69645d", lineHeight: 1.6 }}>
          Marcadores para pizarras y momentos llenos de color.
        </p>
      </header>

      {cargando ? (
        <p>Cargando marcadores...</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : productos.length === 0 ? (
        <p>
          Estamos preparando esta selección. Próximamente vas a encontrar
          nuestros marcadores acá.
        </p>
      ) : (
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
            gap: "24px",
          }}
        >
          {productos.map((producto) => {
            const imagen =
              producto.thumbnail ||
              producto.pictures?.find((foto) => foto.url)?.url;

            return (
              <article
                key={producto.item_id}
                style={{
                  border: "1px solid #e8e0d5",
                  borderRadius: "12px",
                  padding: "16px",
                  background: "#fff",
                }}
              >
                <a
                  href={producto.permalink}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  <div
                    style={{
                      height: "220px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "16px",
                    }}
                  >
                    {imagen ? (
                      <img
                        src={imagen}
                        alt={producto.title}
                        loading="lazy"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <span>Imagen próximamente</span>
                    )}
                  </div>

                  <h2 style={{ fontSize: "18px", lineHeight: 1.4 }}>
                    {producto.title}
                  </h2>
                  <p style={{ fontSize: "22px", fontWeight: 700 }}>
                    {formatoPrecio(producto)}
                  </p>
                </a>

                <p style={{ fontSize: "13px", color: "#777064" }}>
                  Disponible · Stock: {producto.available_quantity}
                </p>

                <a
                  href={producto.permalink}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "12px",
                    borderRadius: "6px",
                    background: "#222",
                    color: "#fff",
                    textDecoration: "none",
                    marginTop: "16px",
                  }}
                >
                  Ver producto
                </a>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
