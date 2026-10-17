
import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { isAdminAuthenticated } from "../../../../lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json(
      { error: "No autorizado." },
      { status: 401 }
    );
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return NextResponse.json(
      { error: "Falta configurar DATABASE_URL." },
      { status: 500 }
    );
  }

  const pageParam = Number(
    request.nextUrl.searchParams.get("page") || "1"
  );

  if (!Number.isInteger(pageParam) || pageParam < 1) {
    return NextResponse.json(
      { error: "El número de página no es válido." },
      { status: 400 }
    );
  }

  const limit = 20;
  const offset = (pageParam - 1) * limit;

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
        selected_for_store,
        category_id
      FROM mercadolibre_products
      WHERE seller_id = '457163596'
      ORDER BY title ASC NULLS LAST, item_id ASC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const totals = await sql`
      SELECT COUNT(*)::int AS total
      FROM mercadolibre_products
      WHERE seller_id = '457163596'
    `;

    const response = NextResponse.json({
      correcto: true,
      pagina: pageParam,
      por_pagina: limit,
      total: Number(totals[0]?.total ?? 0),
      productos: products,
    });

    response.headers.set("Cache-Control", "no-store");

    return response;
  } catch (error) {
    console.error("Error al consultar productos de administración:", error);

    return NextResponse.json(
      { error: "No se pudieron consultar los productos." },
      { status: 500 }
    );
  }
}
