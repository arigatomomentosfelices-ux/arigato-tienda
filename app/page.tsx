const categories = [
  { icon: "◫", title: "Fotolibros", text: "Recuerdos para guardar siempre" },
  { icon: "▱", title: "Pizarras", text: "Un souvenir que sigue jugando" },
  { icon: "◇", title: "Identificadores", text: "Detalles únicos para cada invitado" },
  { icon: "✦", title: "Kits de arte", text: "Creatividad para disfrutar" },
  { icon: "✎", title: "Para colorear", text: "Momentos de diversión" },
  { icon: "⌁", title: "Marcadores", text: "Pequeños detalles, grandes sonrisas" },
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

export default function Home() {
  return (
    <main>
      {/* BARRA SUPERIOR */}
      <div className="top-bar">
        <div className="container top-bar-inner">
          <span>
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3l1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4L12 3z" />
    <path d="M19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15z" />
  </svg>
  Productos personalizados
<span>
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
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
  >
    <path d="M3 12h13" />
    <path d="M13 6l6 6-6 6" />
    <path d="M5 7h3" />
    <path d="M5 17h3" />
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
                <div className="category-icon">{category.icon}</div>
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
