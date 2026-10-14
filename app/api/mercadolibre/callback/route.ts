
import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.json(
      { error: "Mercado Libre no autorizó la conexión." },
      { status: 400 }
    );
  }

  if (!code) {
    return NextResponse.json(
      { error: "No se recibió el código de autorización." },
      { status: 400 }
    );
  }

  const clientId = process.env.ML_CLIENT_ID;
  const clientSecret = process.env.ML_CLIENT_SECRET;
  const redirectUri = process.env.ML_REDIRECT_URI;
  const databaseUrl = process.env.DATABASE_URL;

  if (!clientId || !clientSecret || !redirectUri || !databaseUrl) {
    return NextResponse.json(
      { error: "Falta configurar una variable de entorno requerida." },
      { status: 500 }
    );
  }

  try {
    const tokenResponse = await fetch(
      "https://api.mercadolibre.com/oauth/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
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
      console.error("Error al obtener tokens de Mercado Libre:", {
        status: tokenResponse.status,
        error: tokenData.error,
      });

      return NextResponse.json(
        { error: "No se pudo completar la autorización con Mercado Libre." },
        { status: 502 }
      );
    }

    const sql = neon(databaseUrl);

    const expiresAt = new Date(
      Date.now() + Number(tokenData.expires_in || 0) * 1000
    );

    await sql`
      INSERT INTO mercadolibre_connections (
        seller_id,
        access_token,
        refresh_token,
        token_type,
        expires_at,
        scope,
        updated_at
      )
      VALUES (
        ${String(tokenData.user_id)},
        ${tokenData.access_token},
        ${tokenData.refresh_token},
        ${tokenData.token_type || "Bearer"},
        ${expiresAt},
        ${tokenData.scope || null},
        NOW()
      )
      ON CONFLICT (seller_id)
      DO UPDATE SET
        access_token = EXCLUDED.access_token,
        refresh_token = EXCLUDED.refresh_token,
        token_type = EXCLUDED.token_type,
        expires_at = EXCLUDED.expires_at,
        scope = EXCLUDED.scope,
        updated_at = NOW()
    `;

    return NextResponse.redirect(
      new URL("/?mercadolibre=conectado", request.url)
    );
  } catch (err) {
    console.error("Error interno en callback de Mercado Libre:", err);

    return NextResponse.json(
      { error: "Ocurrió un error al guardar la conexión." },
      { status: 500 }
    );
  }
}
