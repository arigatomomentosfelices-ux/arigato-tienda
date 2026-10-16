
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

const MARGEN_RENOVACION_MS = 60 * 60 * 1000;
const BLOQUEO_MS = 2 * 60 * 1000;

export async function POST(request: Request) {
  const secret = process.env.ML_REFRESH_SECRET;
  const provided = request.headers.get("x-refresh-secret");

  if (!secret || provided !== secret) {
    return NextResponse.json(
      { error: "No autorizado." },
      { status: 401 }
    );
  }

  const databaseUrl = process.env.DATABASE_URL;
  const clientId = process.env.ML_CLIENT_ID;
  const clientSecret = process.env.ML_CLIENT_SECRET;

  if (!databaseUrl || !clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Falta configurar una variable de entorno requerida." },
      { status: 500 }
    );
  }

  const sql = neon(databaseUrl);
  let bloqueoAdquirido = false;

  try {
    const lockRows = await sql`
      UPDATE mercadolibre_refresh_lock
      SET locked_until = NOW() + (${BLOQUEO_MS} * INTERVAL '1 millisecond'),
          locked_at = NOW()
      WHERE id = 1
        AND locked_until < NOW()
      RETURNING id
    `;

    if (!lockRows.length) {
      return NextResponse.json(
        {
          renovado: false,
          ocupado: true,
          mensaje: "Ya hay una renovación en curso. Intentá más tarde.",
        },
        { status: 409 }
      );
    }

    bloqueoAdquirido = true;

    const rows = await sql`
      SELECT seller_id, refresh_token, expires_at
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
    const vencimiento = cuenta.expires_at
      ? new Date(cuenta.expires_at).getTime()
      : 0;

    if (
      Number.isFinite(vencimiento) &&
      vencimiento > Date.now() + MARGEN_RENOVACION_MS
    ) {
      return NextResponse.json({
        renovado: false,
        omitido: true,
        seller_id: String(cuenta.seller_id),
        expires_at: new Date(vencimiento).toISOString(),
        mensaje: "El acceso todavía tiene más de una hora de vigencia.",
      });
    }

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

    if (
      !Number.isFinite(expiresAt.getTime()) ||
      Number(tokenData.expires_in) <= 0
    ) {
      return NextResponse.json(
        { error: "Mercado Libre devolvió un vencimiento inválido." },
        { status: 502 }
      );
    }

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
  } finally {
    if (bloqueoAdquirido) {
      try {
        await sql`
          UPDATE mercadolibre_refresh_lock
          SET locked_until = '-infinity'
          WHERE id = 1
        `;
      } catch (error) {
        console.error("No se pudo liberar el bloqueo:", error);
      }
    }
  }
}
