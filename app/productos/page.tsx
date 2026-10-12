
const categorias = [
  {
    nombre: "Pizarras personalizadas",
    descripcion: "Souvenirs para jugar, dibujar y recordar.",
    color: "beige",
  },
  {
    nombre: "Identificadores de mochila",
    descripcion: "Detalles personalizados para cada invitado.",
    color: "sage",
  },
  {
    nombre: "Bolsitas golosineras",
    descripcion: "Personalizadas con nombre y temática.",
    color: "rosa",
  },
  {
    nombre: "Libritos para colorear",
    descripcion: "Un recuerdo creativo para los chicos.",
    color: "beige",
  },
  {
    nombre: "Kits de arte",
    descripcion: "Materiales para crear y pintar.",
    color: "sage",
  },
  {
    nombre: "Marcadores",
    descripcion: "Colores para acompañar cada aventura.",
    color: "rosa",
  },
  {
    nombre: "Combos para cumpleaños",
    descripcion: "Opciones para armar un festejo especial.",
    color: "beige",
  },
];

export default function ProductosPage() {
  return (
    <main className="products-page">
      <section className="products-intro">
        <span className="eyebrow">ARIGATO · Momentos felices</span>
        <h1>Encontrá ese detalle especial</h1>
        <p>
          Souvenirs personalizados y propuestas creativas
          para celebrar momentos inolvidables.
        </p>
      </section>

      <section className="products-catalog">
        <div className="products-heading">
          <div>
            <span className="eyebrow">NUESTRO CATÁLOGO</span>
            <h2>Productos para celebrar</h2>
          </div>
          <p>Elegí la categoría que estás buscando.</p>
        </div>

        <div className="category-grid">
         
{categorias.map((categoria) => {
  const destinos: Record<string, string> = {
    "Pizarras personalizadas": "/productos/pizarras",
    "Identificadores de mochila": "/productos/identificadores",
    "Bolsitas golosineras": "/productos/bolsitas-golosineras",
    "Libritos para colorear": "/productos/libritos-para-colorear",
    "Kits de arte": "/productos/kits-de-arte",
    "Marcadores": "/productos/marcadores",
    "Combos para cumpleaños": "/productos/combos",
  };

  return (
    <a
      className={`catalog-category ${categoria.color}`}
      key={categoria.nombre}
      href={destinos[categoria.nombre] || "/productos"}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <span className="category-symbol">✦</span>
      <h3>{categoria.nombre}</h3>
      <p>{categoria.descripcion}</p>
      <span className="category-arrow">Ver categoría →</span>
    </a>
  );
})}

        </div>
      </section>
    </main>
  );
}
