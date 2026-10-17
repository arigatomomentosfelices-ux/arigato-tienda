
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Foto = {
  id: string | null;
  url: string | null;
};

type Producto = {
  item_id: string;
  title: string;
  price: number | string;
  currency_id: string;
  available_quantity: number;
  status: string;
  permalink: string;
  thumbnail: string | null;
  pictures: Foto[];
  arigato_category: string | null;
};

export default function ProductoPage() {
  const params = useParams<{ item_id: string }>();
  const itemId = params.item_id;

  const [producto, setProducto] = useState<Producto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activa = true;

    fetch("/api/store-products", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("No se pudo consultar el catálogo.");
        }

        return response.json();
      })
      .then((data) => {
        if (!activa) return;

        const encontrado = (data.productos ?? []).find(
          (item: Producto) => item.item_id === itemId
        );

        if (!encontrado) {
          setError(
            "Este producto no está disponible actualmente en nuestra tienda."
          );
          return;
        }

        setProducto(encontrado);
      })
      .catch(() => {
        if (activa) {
          setError("No pudimos cargar el producto. Intentá nuevamente.");
        }
      })
      .finally(() => {
        if (activa) setCargando(false);
      });

    return () => {
      activa = false;
    };
  }, [itemId]);

  const precio = producto
    ? new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: producto.currency_id || "ARS",
        maximumFractionDigits: 2,
      }).format(Number(producto.price))
    : "";

  const fotos = producto
    ? [
        ...new Set(
          [
            ...(producto.pictures ?? []).map((foto) => foto.url),
            producto.thumbnail,
          ].filter((url): url is string => Boolean(url))
        ),
      ]
    : [];

  return (
    <main
      style={{
        maxWidth: "1120px",
        margin: "0 auto",
        padding: "36px 24px 64px",
        fontFamily: "Arial, sans-serif",
        color: "#292521",
      }}
    >
      <a
        href="/productos/marcadores"
        style={{ color: "#69645d", textDecoration: "none" }}
      >
        ← Volver a Marcadores
      </a>

      {cargando ? (
        <p style={{ marginTop: "32px" }}>Cargando producto...</p>
      ) : error ? (
        <section
          style={{
            marginTop: "32px",
            padding: "24px",
            background: "#fff",
            border: "1px solid #e8e0d5",
            borderRadius: "12px",
          }}
        >
          <h1>Producto no disponible</h1>
          <p>{error}</p>
          <a href="/productos">Ver catálogo completo</a>
        </section>
      ) : producto ? (
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
            gap: "40px",
            marginTop: "32px",
            alignItems: "start",
          }}
        >
          <div>
            <div
              style={{
                background: "#fff",
                border: "1px solid #e8e0d5",
                borderRadius: "14px",
                padding: "24px",
              }}
            >
              {fotos[0] ? (
                <img
                  src={fotos[0]}
                  alt={producto.title}
                  style={{
                    display: "block",
                    width: "100%",
                    maxHeight: "480px",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <p>Imagen próximamente</p>
              )}
            </div>

            {fotos.length > 1 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(76px, 1fr))",
                  gap: "10px",
                  marginTop: "12px",
                }}
              >
                {fotos.slice(1).map((foto, index) => (
                  <div
                    key={`${foto}-${index}`}
                    style={{
                      background: "#fff",
                      border: "1px solid #e8e0d5",
                      borderRadius: "8px",
                      padding: "6px",
                    }}
                  >
                    <img
                      src={foto}
                      alt={`${producto.title} - foto ${index + 2}`}
                      loading="lazy"
                      style={{
                        width: "100%",
                        height: "76px",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #e8e0d5",
              borderRadius: "14px",
              padding: "28px",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                letterSpacing: "2px",
                color: "#777064",
              }}
            >
              ARIGATO · MOMENTOS FELICES
            </span>

            <h1
              style={{
                fontSize: "clamp(26px, 4vw, 36px)",
                lineHeight: 1.25,
                margin: "16px 0",
              }}
            >
              {producto.title}
            </h1>

            <p style={{ fontSize: "30px", fontWeight: 700, margin: "20px 0" }}>
              {precio}
            </p>

            <p style={{ color: "#69645d", lineHeight: 1.6 }}>
              {producto.available_quantity > 0
                ? `Disponible · ${producto.available_quantity} unidades en stock`
                : "Consultanos por disponibilidad."}
            </p>

            <div
              style={{
                borderTop: "1px solid #e8e0d5",
                margin: "24px 0",
                paddingTop: "20px",
              }}
            >
              <h2 style={{ fontSize: "18px" }}>Sobre este producto</h2>
              <p style={{ color: "#69645d", lineHeight: 1.7 }}>
                {producto.title}. Consultanos si necesitás más información
                sobre sus características, personalización o disponibilidad.
              </p>
            </div>

            <p style={{ fontSize: "13px", color: "#777064", lineHeight: 1.5 }}>
              Estamos preparando nuestra experiencia de compra directa.
              Próximamente vas a poder completar tu pedido desde ARIGATO.
            </p>

            <a
              href="/productos"
              style={{
                display: "block",
                textAlign: "center",
                padding: "14px",
                marginTop: "20px",
                borderRadius: "7px",
                background: "#292521",
                color: "#fff",
                textDecoration: "none",
              }}
            >
              Seguir explorando
            </a>
          </div>
        </section>
      ) : null}
    </main>
  );
}
