
import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = process.env.ML_REFRESH_SECRET;
  const provided = request.headers.get("x-refresh-secret");

  if (!secret || provided !== secret) {
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

  try {
    const sql = neon(databaseUrl);

    const rows = await sql`
      SELECT seller_id, access_token
      FROM mercadolibre_connections
      ORDER BY updated_at DESC
      LIMIT 1
    `;

    if (!rows.length || !rows[0].access_token) {
      return NextResponse.json(
        { error: "No hay una conexión de Mercado Libre guardada." },
        { status: 404 }
      );
    }

    const cuenta = rows[0];
    const sellerId = String(cuenta.seller_id);
    const accessToken = String(cuenta.access_token);

    const response = await fetch(
      `https://api.mercadolibre.com/users/${sellerId}/items/search?limit=50`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Error al consultar publicaciones de Mercado Libre:", {
        status: response.status,
        error: data.error ?? null,
        message: data.message ?? null,
      });

      return NextResponse.json(
        { error: "No se pudieron consultar las publicaciones de Mercado Libre." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      conectado: true,
      seller_id: sellerId,
      total: data.paging?.total ?? data.results?.length ?? 0,
      publicaciones: data.results ?? [],
    });
  } catch (error) {
    console.error("Error al consultar el catálogo:", error);

    return NextResponse.json(
      { error: "Ocurrió un error al consultar el catálogo." },
      { status: 500 }
    );
  }
}
