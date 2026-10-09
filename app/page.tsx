const categories = [
  { icon: "book", title: "Fotolibros", text: "Recuerdos para guardar siempre" },
  { icon: "board", title: "Pizarras", text: "Un souvenir que sigue jugando" },
 { icon: "tag", title: "Identificadores", text: "Detalles únicos para cada invitado" },
  { icon: "palette", title: "Kits de arte", text: "Creatividad para disfrutar" },
  { icon: "pencil", title: "Para colorear", text: "Momentos de diversión" },
  { icon: "marker", title: "Marcadores", text: "Pequeños detalles, grandes sonrisas" },
];

const products = [
  {
    category: "Souvenirs",
    name: "Pizarras personalizadas",
    description: "Un recuerdo divertido y especial para cada invitado.",
  },
  {
    category: "Cumpleaños",
    name: "Identificadores de mochila",
    description: "Personalizados con el nombre de cada invitado.",
  },
  {
    category: "Creatividad",
    name: "Kit de arte",
    description: "Todo listo para crear, pintar y disfrutar.",
  },
];

function CategoryIcon({ name }: { name: string }) {
  const common = {
    viewBox: "0 0 24 24",
    width: 30,
    height: 30,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  let drawing;

  switch (name) {
    case "book":
  drawing = (
    <>
      <path d="M12 6.5C9.5 4.5 6 4 3 5v14c3-1 6.5-.5 9 1.5" />
      <path d="M12 6.5C14.5 4.5 18 4 21 5v14c-3-1-6.5-.5-9 1.5" />
      <path d="M12 6.5v14" />
      <path d="M6 8.5c1.5-.3 3-.1 4 .5" />
      <path d="M14 9c1.2-.6 2.7-.8 4-.5" />
    </>
  );
  break;

    case "board":
  drawing = (
    <>
      <rect x="3" y="3" width="18" height="14" rx="1.5" />
      <path d="M7 21l5-4 5 4" />
      <path d="M7 7h10M7 10h6" />
    </>
  );
  break;

    case "tag":
  drawing = (
    <>
      <path d="M20 12.5L12.5 20 3.5 11V4h7z" />
      <circle cx="7.5" cy="8" r="1.2" />
      <path d="M11 7.5l5 5" />
    </>
  );
  break;

    case "palette":
  drawing = (
    <>
      <path d="M12 3a9 9 0 1 0 0 18h1.2a2 2 0 0 0 1.5-3.3 1.8 1.8 0 0 1 1.4-3H18a4 4 0 0 0 4-4C22 6.6 17.5 3 12 3z" />
      <circle cx="7.5" cy="10" r="1" />
      <circle cx="10" cy="6.5" r="1" />
      <circle cx="15" cy="7" r="1" />
      <circle cx="8" cy="14" r="1" />
    </>
  );
  break;

    case "pencil":
  drawing = (
    <>
      <path d="M12 20h9" />
      <path d="M3 21l3.8-.8L19.5 7.5a2.5 2.5 0 0 0-3.5-3.5L3.3 17z" />
      <path d="M14.5 6l3.5 3.5" />
    </>
  );
  break;

    case "marker":
  drawing = (
    <>
      <path d="M4 17L15.5 5.5a2.1 2.1 0 0 1 3 3L7 20H4z" />
      <path d="M13.5 7.5l4 4" />
      <path d="M4 17l3 3" />
      <path d="M3 21h18" />
    </>
  );
  break;

    default:
      drawing = null;
  }

  return <svg {...common}>{drawing}</svg>;
}

export default function Home() {
  return (
    <main>
      {/* BARRA SUPERIOR */}
      <div className="top-bar">
  <div className="container top-bar-inner">

    <span>
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: "18px", height: "18px", flexShrink: 0 }}
      >
        <path d="M12 3l1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4L12 3z" />
        <path d="M19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15z" />
      </svg>
      Productos personalizados
    </span>

    <span>
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: "18px", height: "18px", flexShrink: 0 }}
  >
    <path d="M2.5 13.5h19" />
    <path d="M6.5 13.5l2-7h4l3.5 7" />
    <path d="M13 6.5l2.5-3" />
    <path d="M15.5 3.5l1.5 2" />
    <path d="M6.5 13.5l-2 4h15l-2-4" />
    <path d="M7 17.5v2" />
    <path d="M17 17.5v2" />
  </svg>
      Envíos a todo el país
    </span>

    <span>
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: "18px", height: "18px", flexShrink: 0 }}
      >
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M3 10h18" />
        <path d="M7 14h4" />
      </svg>
      Mercado Pago
    </span>

    <span>
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: "18px", height: "18px", flexShrink: 0 }}
      >
        <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
      </svg>
      Atención personalizada
    </span>

  </div>
</div>
      {/* HEADER */}
      <header className="site-header">
        <div className="container header-inner">
          <a href="/" className="brand">
  <img
    src="/otro%20logo.png"
    alt="ARIGATO"
    style={{
      width: "145px",
      height: "auto",
      display: "block",
    }}
  />
</a>

          <nav className="main-nav">
            <a href="#inicio">Inicio</a>
            <a href="#productos">Productos</a>
            <a href="#fotolibros">Fotolibros</a>
            <a href="#cumple">Cumpleaños</a>
            <a href="#combos">Combos</a>
            <a href="#nosotros">Nosotros</a>
            <a href="#contacto">Contacto</a>
          </nav>

          <div className="header-actions">
            <button aria-label="Buscar">⌕</button>
            <button aria-label="Carrito">🛒</button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="hero" id="inicio">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">ARIGATO · Momentos felices</span>

            <h1>
              Momentos felices
              <br />
              que se convierten
              <br />
              <em>en recuerdos.</em>
            </h1>

            <p>
              Souvenirs personalizados, fotolibros y detalles pensados
              para celebrar esos momentos que queremos guardar para siempre.
            </p>

            <div className="hero-buttons">
              <a href="#productos" className="button button-primary">
                Ver productos
              </a>

              <a href="#fotolibros" className="button button-secondary">
                Descubrir fotolibros
              </a>
            </div>

            <div className="hero-note">
              <span>♡</span>
              Hecho con mucho amor para momentos especiales.
            </div>
          </div>

          <div className="hero-art">
            <div className="hero-card hero-card-main">
              <div className="hero-card-inner">
                <span>ARIGATO</span>
                <strong>Momentos<br />felices</strong>
                <small>souvenirs · recuerdos · detalles</small>
              </div>
            </div>

            <div className="floating-card floating-card-one">
              <span>✦</span>
              Personalizado
            </div>

            <div className="floating-card floating-card-two">
              <span>♡</span>
              Hecho para vos
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="categories-section" id="productos">
        <div className="container">
          <div className="section-heading centered">
            <span className="eyebrow">Elegí tu favorito</span>
            <h2>Pequeños detalles que hacen grande un momento.</h2>
            <p>
              Encontrá souvenirs y productos pensados para celebrar,
              regalar y guardar recuerdos.
            </p>
          </div>

          <div className="categories-grid">
            {categories.map((category) => (
              <a
                href="#productos-destacados"
                className="category-card"
                key={category.title}
              >
                <div className="category-icon">
  <CategoryIcon name={category.icon} />
</div>
                <h3>{category.title}</h3>
                <p>{category.text}</p>
                <span className="category-arrow">→</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS */}
      <section className="featured-section" id="productos-destacados">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Nuestros favoritos</span>
              <h2>Productos para celebrar</h2>
            </div>

            <a href="#productos" className="text-link">
              Ver todos →
            </a>
          </div>

          <div className="products-grid">
            {products.map((product, index) => (
              <article className="product-card" key={product.name}>
                <div className={`product-image product-image-${index + 1}`}>
                  <span>{product.category}</span>
                </div>

                <div className="product-info">
                  <span className="product-category">{product.category}</span>
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>

                  <a href="#contacto" className="product-link">
                    Ver producto →
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FOTOLIBROS */}
      <section className="photobooks-section" id="fotolibros">
        <div className="container photobooks-box">
          <div className="photobooks-copy">
            <span className="eyebrow">Una historia para guardar</span>

            <h2>
              Tus fotos merecen
              <br />
              convertirse en
              <em> recuerdos.</em>
            </h2>

            <p>
              Creá tu propio fotolibro personalizado y convertí tus
              momentos favoritos en un recuerdo que puedas tocar,
              compartir y volver a mirar una y otra vez.
            </p>

            <a href="#contacto" className="button button-dark">
              Crear mi fotolibro
            </a>
          </div>

          <div className="photobooks-visual">
            <div className="book book-back"></div>

            <div className="book book-front">
              <span>ARIGATO</span>
              <strong>Mis momentos<br />felices</strong>
              <small>Mi historia · mis recuerdos</small>
            </div>

            <div className="photobook-decoration">♡</div>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="benefits-section">
        <div className="container benefits-grid">
          <div className="benefit">
            <span>🚚</span>
            <div>
              <strong>Envíos a todo el país</strong>
              <p>Recibí tu pedido donde estés.</p>
            </div>
          </div>

          <div className="benefit">
            <span>💳</span>
            <div>
              <strong>Mercado Pago</strong>
              <p>Pagá de forma segura y simple.</p>
            </div>
          </div>

          <div className="benefit">
            <span>✨</span>
            <div>
              <strong>Productos personalizados</strong>
              <p>Detalles pensados especialmente para vos.</p>
            </div>
          </div>

          <div className="benefit">
            <span>♡</span>
            <div>
              <strong>Atención personalizada</strong>
              <p>Estamos para ayudarte.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HISTORIA / MARCA */}
      <section className="about-section" id="nosotros">
        <div className="container about-grid">
          <div className="about-decoration">
            <span>ARIGATO</span>
            <strong>Momentos felices</strong>
          </div>

          <div className="about-copy">
            <span className="eyebrow">Sobre ARIGATO</span>

            <h2>
              Porque algunos momentos
              <br />
              merecen quedarse
              <em> para siempre.</em>
            </h2>

            <p>
              En ARIGATO creemos que los recuerdos más lindos están
              hechos de pequeños detalles. Por eso creamos productos
              personalizados para acompañar cumpleaños, celebraciones,
              regalos y momentos especiales.
            </p>

            <a href="#contacto" className="text-link">
              Conocé nuestra historia →
            </a>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="final-cta" id="contacto">
        <div className="container">
          <span className="eyebrow">Hagamos algo lindo juntos</span>

          <h2>
            ¿Preparados para crear
            <br />
            un momento feliz?
          </h2>

          <p>
            Descubrí nuestros productos y encontrá ese detalle
            especial para tu próxima celebración.
          </p>

          <a href="#productos" className="button button-primary">
            Ver productos
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <strong>ARIGATO</strong>
            <span>Momentos felices</span>
            <p>
              Souvenirs, recuerdos y detalles hechos para celebrar.
            </p>
          </div>

          <div>
            <h4>Comprar</h4>
            <a href="#productos">Productos</a>
            <a href="#fotolibros">Fotolibros</a>
            <a href="#productos">Cumpleaños</a>
            <a href="#productos">Combos</a>
          </div>

          <div>
            <h4>Ayuda</h4>
            <a href="#contacto">Contacto</a>
            <a href="#contacto">Preguntas frecuentes</a>
            <a href="#contacto">Envíos</a>
          </div>

          <div>
            <h4>Seguinos</h4>
            <a href="#contacto">Instagram</a>
            <a href="#contacto">WhatsApp</a>
          </div>
        </div>

        <div className="container footer-bottom">
          <span>© 2026 ARIGATO Momentos Felices</span>
          <span>Hecho con ♡</span>
        </div>
      </footer>
    </main>
  );
}
