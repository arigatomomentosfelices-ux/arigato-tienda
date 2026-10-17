
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
  const [fotoSeleccionada, setFotoSeleccionada] = useState("");
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    let activa = true;

    setCargando(true);
    setError("");
    setProducto(null);
    setFotoSeleccionada("");
    setCantidad(1);

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

  const imagenPrincipal = fotos.includes(fotoSeleccionada)
    ? fotoSeleccionada
    : fotos[0] ?? "";

  const precioUnitario = producto ? Number(producto.price) : 0;
  const stock = producto?.available_quantity ?? 0;

  const formatoPrecio = (valor: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: producto?.currency_id || "ARS",
      maximumFractionDigits: 2,
    }).format(valor);

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
        href={
          producto?.arigato_category?.trim().toLowerCase() === "marcadores"
            ? "/productos/marcadores"
            : "/productos"
        }
        style={{ color: "#69645d", textDecoration: "none" }}
      >
        ← Volver a productos
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
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
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
              {imagenPrincipal ? (
                <img
                  src={imagenPrincipal}
                  alt={producto.title}
                  style={{
                    display: "block",
                    width: "100%",
                    height: "420px",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <div
                  style={{
                    height: "300px",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  Imagen próximamente
                </div>
              )}
            </div>

            {fotos.length > 0 && (
              <div
                aria-label="Fotos del producto"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(76px, 1fr))",
                  gap: "10px",
                  marginTop: "12px",
                }}
              >
                {fotos.map((foto, index) => {
                  const seleccionada = imagenPrincipal === foto;

                  return (
                    <button
                      key={`${foto}-${index}`}
                      type="button"
                      onClick={() => setFotoSeleccionada(foto)}
                      aria-label={`Ver foto ${index + 1}`}
                      aria-pressed={seleccionada}
                      style={{
                        cursor: "pointer",
                        background: "#fff",
                        border: seleccionada
                          ? "2px solid #292521"
                          : "1px solid #e8e0d5",
                        borderRadius: "8px",
                        padding: "5px",
                        height: "88px",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={foto}
                        alt={`${producto.title}, foto ${index + 1}`}
                        loading="lazy"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </button>
                  );
                })}
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
              {formatoPrecio(precioUnitario)}
            </p>

            <p style={{ color: "#69645d", lineHeight: 1.6 }}>
              {stock > 0
                ? `Disponible · ${stock} unidades en stock`
                : "Sin stock disponible"}
            </p>

            <div
              style={{
                borderTop: "1px solid #e8e0d5",
                margin: "24px 0",
                paddingTop: "20px",
              }}
            >
              <h2 style={{ fontSize: "18px", marginBottom: "14px" }}>
                ¿Cuántas unidades querés?
              </h2>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "18px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    border: "1px solid #e8e0d5",
                    borderRadius: "8px",
                    overflow: "hidden",
                  }}
                >
                  <button
                    type="button"
                    aria-label="Restar una unidad"
                    disabled={cantidad <= 1}
                    onClick={() =>
                      setCantidad((actual) => Math.max(1, actual - 1))
                    }
                    style={{
                      width: "44px",
                      height: "44px",
                      border: "none",
                      background: "#f8f6f1",
                      fontSize: "22px",
                      cursor: cantidad <= 1 ? "not-allowed" : "pointer",
                      opacity: cantidad <= 1 ? 0.4 : 1,
                    }}
                  >
                    −
                  </button>

                  <span
                    aria-live="polite"
                    style={{
                      minWidth: "48px",
                      textAlign: "center",
                      fontSize: "18px",
                      fontWeight: 700,
                    }}
                  >
                    {cantidad}
                  </span>

                  <button
                    type="button"
                    aria-label="Sumar una unidad"
                    disabled={cantidad >= stock}
                    onClick={() =>
                      setCantidad((actual) => Math.min(stock, actual + 1))
                    }
                    style={{
                      width: "44px",
                      height: "44px",
                      border: "none",
                      background: "#f8f6f1",
                      fontSize: "22px",
                      cursor: cantidad >= stock ? "not-allowed" : "pointer",
                      opacity: cantidad >= stock ? 0.4 : 1,
                    }}
                  >
                    +
                  </button>
                </div>

                <span style={{ fontSize: "13px", color: "#777064" }}>
                  Máximo: {stock} unidades
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                  marginTop: "22px",
                  paddingTop: "18px",
                  borderTop: "1px solid #e8e0d5",
                }}
              >
                <span>Subtotal ({cantidad} {cantidad === 1 ? "unidad" : "unidades"})</span>
                <strong style={{ fontSize: "20px" }}>
                  {formatoPrecio(precioUnitario * cantidad)}
                </strong>
              </div>
            </div>

            <div
              style={{
                borderTop: "1px solid #e8e0d5",
                paddingTop: "20px",
              }}
            >
              <h2 style={{ fontSize: "18px" }}>Sobre este producto</h2>
              <p style={{ color: "#69645d", lineHeight: 1.7 }}>
                {producto.title}. Estamos preparando la descripción completa
                para que conozcas sus características y detalles.
              </p>
            </div>

            <p style={{ fontSize: "13px", color: "#777064", lineHeight: 1.5 }}>
              La compra directa desde ARIGATO estará disponible próximamente.
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
