
"use client";

import { useState } from "react";

const precioPorUnidad = (cantidad: number) => {
  if (cantidad <= 14) return 3675;
  if (cantidad <= 19) return 3150;
  if (cantidad <= 24) return 2995;
  return 2880;
};

const formatoPrecio = (importe: number) =>
  importe.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });

export default function PizarrasPage() {
  const [cantidad, setCantidad] = useState(12);

  const precioUnitario = precioPorUnidad(cantidad);
  const total = cantidad * precioUnitario;

  return (
    <main
      style={{
        background: "#f8f4ee",
        color: "#443b36",
        minHeight: "100vh",
        padding: "40px 24px 80px",
      }}
    >
      <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
        <a
          href="/productos"
          style={{
            color: "#bd8172",
            textDecoration: "none",
            fontSize: "14px",
          }}
        >
          ← Volver a Productos
        </a>

        <header style={{ textAlign: "center", padding: "38px 0" }}>
          <p
            style={{
              color: "#bd8172",
              fontSize: "11px",
              letterSpacing: "0.16em",
            }}
          >
            ARIGATO · MOMENTOS FELICES
          </p>

          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(34px, 5vw, 52px)",
              fontWeight: 500,
              margin: "16px 0",
            }}
          >
            Pizarras personalizadas
          </h1>

          <p style={{ color: "#7c7068", lineHeight: 1.8 }}>
            Un recuerdo especial para jugar, dibujar y crear.
          </p>
        </header>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            alignItems: "start",
            gap: "32px",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "22px",
              overflow: "hidden",
              border: "1px solid #e9dfd4",
            }}
          >
            <img
              src="/pizarra-bosque-marie.png"
              alt="Pizarra infantil personalizada con animales del bosque"
              style={{
                display: "block",
                width: "100%",
                aspectRatio: "4 / 3",
                objectFit: "contain",
                background: "#f7f2ec",
              }}
            />

            <div style={{ padding: "24px" }}>
              <h2
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "24px",
                  fontWeight: 600,
                  marginTop: 0,
                }}
              >
                Pizarra personalizada infantil
              </h2>

              <p style={{ color: "#7c7068", lineHeight: 1.8 }}>
                Personalizada con el diseño de tu elección. Ideal como
                souvenir para cumpleaños infantiles.
              </p>
            </div>
          </div>

          <section
            style={{
              background: "#fff",
              border: "1px solid #e9dfd4",
              borderRadius: "22px",
              padding: "28px",
            }}
          >
            <p
              style={{
                color: "#bd8172",
                fontSize: "11px",
                letterSpacing: "0.12em",
                fontWeight: 600,
              }}
            >
              ELEGÍ TU CANTIDAD
            </p>

            <p style={{ color: "#7c7068", fontSize: "14px" }}>
              Compra mínima: 12 unidades
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                margin: "24px 0",
              }}
            >
              <button
                type="button"
                onClick={() => setCantidad((actual) => Math.max(12, actual - 1))}
                disabled={cantidad <= 12}
                aria-label="Restar una pizarra"
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  border: "1px solid #d8c7b2",
                  background: "#f8f4ee",
                  color: "#443b36",
                  fontSize: "24px",
                  cursor: cantidad <= 12 ? "not-allowed" : "pointer",
                  opacity: cantidad <= 12 ? 0.45 : 1,
                }}
              >
                −
              </button>

              <div style={{ textAlign: "center" }}>
                <strong style={{ fontSize: "32px" }}>{cantidad}</strong>
                <div style={{ color: "#7c7068", fontSize: "13px" }}>
                  unidades
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCantidad((actual) => actual + 1)}
                aria-label="Agregar una pizarra"
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  border: "1px solid #d8c7b2",
                  background: "#f8f4ee",
                  color: "#443b36",
                  fontSize: "24px",
                  cursor: "pointer",
                }}
              >
                +
              </button>
            </div>

            <label
              htmlFor="cantidad-pizarras"
              style={{
                display: "block",
                fontSize: "13px",
                color: "#7c7068",
                marginBottom: "8px",
              }}
            >
              O ingresá la cantidad directamente
            </label>

            <input
              id="cantidad-pizarras"
              type="number"
              min={12}
              step={1}
              value={cantidad}
              onChange={(evento) => {
                const valor = Number(evento.target.value);
                if (Number.isInteger(valor) && valor >= 12) {
                  setCantidad(valor);
                }
              }}
              onBlur={() => setCantidad((actual) => Math.max(12, actual))}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #d8c7b2",
                background: "#fff",
                color: "#443b36",
                fontSize: "16px",
              }}
            />

            <div
              style={{
                borderTop: "1px solid #eee4da",
                marginTop: "26px",
                paddingTop: "22px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                  marginBottom: "12px",
                  fontSize: "14px",
                }}
              >
                <span style={{ color: "#7c7068" }}>Precio por unidad</span>
                <strong>{formatoPrecio(precioUnitario)}</strong>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <span style={{ fontWeight: 600 }}>Total del pedido</span>
                <strong style={{ fontSize: "25px", color: "#59483f" }}>
                  {formatoPrecio(total)}
                </strong>
              </div>

              <p
                style={{
                  color: "#7c7068",
                  fontSize: "12px",
                  lineHeight: 1.6,
                  marginTop: "14px",
                }}
              >
                El precio unitario se aplica a todas las pizarras según el
                tramo de cantidad alcanzado.
              </p>
            </div>

            <a
              href={`/#contacto`}
              style={{
                display: "block",
                textAlign: "center",
                marginTop: "24px",
                padding: "15px 18px",
                background: "#59483f",
                color: "#fff",
                borderRadius: "999px",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Consultar mi pedido
            </a>

            <p
              style={{
                color: "#7c7068",
                fontSize: "11px",
                lineHeight: 1.6,
                textAlign: "center",
                marginBottom: 0,
              }}
            >
              La consulta todavía no envía automáticamente la cantidad elegida.
            </p>
          </section>
        </section>
      </div>
    </main>
  );
}
