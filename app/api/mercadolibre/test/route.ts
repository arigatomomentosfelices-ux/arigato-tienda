
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.ML_TEST_SECRET;
  const provided = request.headers.get("x-test-secret");

  if (!secret || provided !== secret) {
    return NextResponse.json(
      { error: "No autorizado." },
      { status: 401 }
    );
  }
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return NextResponse.json(
      { conectado: false, error: "Falta DATABASE_URL." },
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

    if (!rows.length) {
      return NextResponse.json(
        { conectado: false, error: "No hay una cuenta guardada." },
        { status: 404 }
      );
    }

    const cuenta = rows[0];

    const response = await fetch(
      `https://api.mercadolibre.com/users/${cuenta.seller_id}`,
      {
        headers: {
          Authorization: `Bearer ${cuenta.access_token}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("Prueba de Mercado Libre fallida:", {
        status: response.status,
      });

      return NextResponse.json(
        {
          conectado: false,
          error: "Mercado Libre no aceptó la consulta.",
          status: response.status,
        },
        { status: 502 }
      );
    }

    const usuario = await response.json();

    return NextResponse.json({
      conectado: true,
      seller_id: String(usuario.id),
      nickname: usuario.nickname ?? null,
      mensaje: "La cuenta de Mercado Libre respondió correctamente.",
    });
  } catch (error) {
    console.error("Error en prueba de Mercado Libre:", error);

    return NextResponse.json(
      { conectado: false, error: "Falló la prueba de conexión." },
      { status: 500 }
    );
  }
}
