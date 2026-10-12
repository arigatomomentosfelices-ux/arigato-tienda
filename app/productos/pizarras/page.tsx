
const productos = [
  {
    nombre: "Pizarra personalizada infantil",
    descripcion:
      "Un souvenir para dibujar, jugar y recordar. Personalizada con el diseño de tu elección.",
    imagen: "/pizarra-bosque-marie.png",
    alt: "Pizarra infantil personalizada con animales del bosque, sobre una mesa de madera",
  },
];

export default function PizarrasPage() {
  return (
    <main
      style={{
        background: "#f8f4ee",
        color: "#443b36",
        minHeight: "100vh",
        padding: "64px 24px 80px",
      }}
    >
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
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

        <header style={{ textAlign: "center", padding: "48px 0" }}>
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
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 360px))",
            justifyContent: "center",
            gap: "24px",
          }}
        >
          {productos.map((producto) => (
            <article
              key={producto.nombre}
              style={{
                background: "#fff",
                borderRadius: "22px",
                overflow: "hidden",
                border: "1px solid #e9dfd4",
              }}
            >
              <img
                src={producto.imagen}
                alt={producto.alt}
                style={{
                  display: "block",
                  width: "100%",
                  aspectRatio: "4 / 3",
                  objectFit: "cover",
                }}
              />

              <div style={{ padding: "24px" }}>
                <h2
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: "24px",
                    fontWeight: 600,
                  }}
                >
                  {producto.nombre}
                </h2>

                <p style={{ color: "#7c7068", lineHeight: 1.8 }}>
                  {producto.descripcion}
                </p>

                <a
                  href="/#contacto"
                  style={{
                    display: "inline-block",
                    marginTop: "12px",
                    color: "#bd8172",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Consultar personalización →
                </a>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
