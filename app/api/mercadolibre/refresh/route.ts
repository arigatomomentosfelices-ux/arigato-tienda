
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

export async function POST() {
  const databaseUrl = process.env.DATABASE_URL;
  const clientId = process.env.ML_CLIENT_ID;
  const clientSecret = process.env.ML_CLIENT_SECRET;

  if (!databaseUrl || !clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Falta configurar una variable de entorno requerida." },
      { status: 500 }
    );
  }

  try {
    const sql = neon(databaseUrl);

    const rows = await sql`
      SELECT seller_id, refresh_token
      FROM mercadolibre_connections
      ORDER BY updated_at DESC
      LIMIT 1
    `;

    if (!rows.length || !rows[0].refresh_token) {
      return NextResponse.json(
        { error: "No hay una conexión con token de renovación guardado." },
        { status: 404 }
      );
    }

    const cuenta = rows[0];

    const tokenResponse = await fetch(
      "https://api.mercadolibre.com/oauth/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: cuenta.refresh_token,
        }),
        cache: "no-store",
      }
    );

    const tokenData = await tokenResponse.json();

    if (
      !tokenResponse.ok ||
      !tokenData.access_token ||
      !tokenData.refresh_token ||
      !tokenData.user_id
    ) {
      console.error("Falló la renovación OAuth:", {
        status: tokenResponse.status,
        error: tokenData.error ?? null,
        error_description: tokenData.error_description ?? null,
      });

      return NextResponse.json(
        { error: "Mercado Libre no pudo renovar el acceso." },
        { status: 502 }
      );
    }

    if (String(tokenData.user_id) !== String(cuenta.seller_id)) {
      return NextResponse.json(
        { error: "El vendedor devuelto no coincide con la conexión guardada." },
        { status: 409 }
      );
    }

    const expiresAt = new Date(
      Date.now() + Number(tokenData.expires_in || 0) * 1000
    );

    await sql`
      UPDATE mercadolibre_connections
      SET
        access_token = ${tokenData.access_token},
        refresh_token = ${tokenData.refresh_token},
        token_type = ${tokenData.token_type || "Bearer"},
        expires_at = ${expiresAt},
        scope = ${tokenData.scope || null},
        updated_at = NOW()
      WHERE seller_id = ${String(cuenta.seller_id)}
    `;

    return NextResponse.json({
      renovado: true,
      seller_id: String(cuenta.seller_id),
      expires_at: expiresAt.toISOString(),
      mensaje: "Los tokens se renovaron y guardaron correctamente.",
    });
  } catch (error) {
    console.error("Error interno al renovar Mercado Libre:", error);

    return NextResponse.json(
      { error: "Ocurrió un error al renovar el acceso." },
      { status: 500 }
    );
  }
}
