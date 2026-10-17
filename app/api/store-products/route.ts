
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return NextResponse.json(
      { error: "El catálogo no está disponible." },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }

  try {
    const sql = neon(databaseUrl);

    const products = await sql`
      SELECT
        item_id,
        title,
        price,
        currency_id,
        available_quantity,
        status,
        permalink,
        thumbnail,
        pictures,
        arigato_category
      FROM mercadolibre_products
      WHERE seller_id = '457163596'
        AND selected_for_store = TRUE
        AND status = 'active'
        AND available_quantity > 0
      ORDER BY title ASC NULLS LAST
    `;

    return NextResponse.json(
      {
        correcto: true,
        productos: products,
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("Error al consultar el catálogo público:", error);

    return NextResponse.json(
      { error: "No se pudo cargar el catálogo." },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}
