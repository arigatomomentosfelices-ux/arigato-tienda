
import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const LOTE = 10;
const SELLER_ID = "457163596";

export async function POST(request: NextRequest) {
  const secret = process.env.ML_REFRESH_SECRET;

  if (
    !secret ||
    request.headers.get("x-refresh-secret") !== secret
  ) {
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

  const offset = Number(
    request.nextUrl.searchParams.get("offset") || "0"
  );

  if (
    !Number.isSafeInteger(offset) ||
    offset < 0 ||
    offset > 100000
  ) {
    return NextResponse.json(
      { error: "El parámetro offset no es válido." },
      { status: 400 }
    );
  }

  try {
    const sql = neon(databaseUrl);

    const cuentas = await sql`
      SELECT seller_id, access_token, expires_at
      FROM mercadolibre_connections
      WHERE seller_id = ${SELLER_ID}
      LIMIT 1
    `;

    if (!cuentas.length || !cuentas[0].access_token) {
      return NextResponse.json(
        { error: "No hay una conexión de Mercado Libre guardada." },
        { status: 404 }
      );
    }

    let accessToken = String(cuentas[0].access_token);
    const expiresAt = cuentas[0].expires_at
      ? new Date(cuentas[0].expires_at).getTime()
      : 0;

    if (expiresAt <= Date.now() + 5 * 60 * 1000) {
      const refreshTokenRows = await sql`
        SELECT refresh_token
        FROM mercadolibre_connections
        WHERE seller_id = ${SELLER_ID}
        LIMIT 1
      `;

      const refreshToken = refreshTokenRows[0]?.refresh_token;

      if (!refreshToken) {
        return NextResponse.json(
          { error: "No hay token de renovación disponible." },
          { status: 500 }
        );
      }

      const refreshResponse = await fetch(
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
            refresh_token: String(refreshToken),
          }),
          cache: "no-store",
        }
      );

      const refreshData = await refreshResponse.json();

      if (
        !refreshResponse.ok ||
        !refreshData.access_token ||
        !refreshData.refresh_token ||
        String(refreshData.user_id) !== SELLER_ID
      ) {
        console.error("No se pudo renovar el acceso para descripciones:", {
          status: refreshResponse.status,
          error: refreshData.error ?? null,
        });

        return NextResponse.json(
          { error: "No se pudo renovar el acceso a Mercado Libre." },
          { status: 502 }
        );
      }

      accessToken = String(refreshData.access_token);

      await sql`
        UPDATE mercadolibre_connections
        SET
          access_token = ${refreshData.access_token},
          refresh_token = ${refreshData.refresh_token},
          token_type = ${refreshData.token_type || "Bearer"},
          expires_at = ${new Date(
            Date.now() + Number(refreshData.expires_in) * 1000
          )},
          scope = ${refreshData.scope || null},
          updated_at = NOW()
        WHERE seller_id = ${SELLER_ID}
      `;
    }

    const productos = await sql`
      SELECT item_id
      FROM mercadolibre_products
      WHERE seller_id = ${SELLER_ID}
      ORDER BY item_id
      LIMIT ${LOTE}
      OFFSET ${offset}
    `;

    const errores: string[] = [];
    let actualizados = 0;
    let sinDescripcion = 0;

    for (const producto of productos) {
      const itemId = String(producto.item_id);

      try {
        const response = await fetch(
          `https://api.mercadolibre.com/items/${encodeURIComponent(itemId)}/description`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

        if (response.status === 404) {
          await sql`
            UPDATE mercadolibre_products
            SET description = NULL
            WHERE item_id = ${itemId}
              AND seller_id = ${SELLER_ID}
          `;
          sinDescripcion++;
          continue;
        }

        if (!response.ok) {
          errores.push(itemId);
          continue;
        }

        const data = await response.json();
        const descripcion =
          typeof data.plain_text === "string"
            ? data.plain_text
            : typeof data.text === "string"
              ? data.text
              : "";

        await sql`
          UPDATE mercadolibre_products
          SET
            description = ${descripcion || null},
            updated_at = NOW()
          WHERE item_id = ${itemId}
            AND seller_id = ${SELLER_ID}
        `;

        if (descripcion.trim()) {
          actualizados++;
        } else {
          sinDescripcion++;
        }
      } catch {
        errores.push(itemId);
      }
    }

    const totalRows = await sql`
      SELECT COUNT(*)::int AS total
      FROM mercadolibre_products
      WHERE seller_id = ${SELLER_ID}
    `;

    const total = Number(totalRows[0]?.total ?? 0);
    const siguienteOffset = offset + productos.length;

    return NextResponse.json({
      correcto: true,
      offset,
      procesados: productos.length,
      descripciones_guardadas: actualizados,
      sin_descripcion: sinDescripcion,
      errores: errores.length,
      items_con_error: errores,
      total_productos: total,
      siguiente_offset:
        siguienteOffset < total ? siguienteOffset : null,
      mensaje:
        siguienteOffset < total
          ? "Lote procesado. Continuá con siguiente_offset."
          : "Se llegó al final del catálogo.",
    });
  } catch (error) {
    console.error("Error al importar descripciones:", error);

    return NextResponse.json(
      { error: "No se pudieron importar las descripciones." },
      { status: 500 }
    );
  }
}
