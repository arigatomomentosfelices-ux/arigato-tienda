
import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const SELLER_ID = "457163596";
const LOTE = 10;

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

  if (!databaseUrl) {
    return NextResponse.json(
      { error: "Falta configurar DATABASE_URL." },
      { status: 500 }
    );
  }

  try {
    const sql = neon(databaseUrl);

    // Bloqueo atómico: evita que dos solicitudes tomen el mismo lote.
    const acquired = await sql`
      INSERT INTO mercadolibre_description_import (
        id, next_offset, completed, locked_until, updated_at
      )
      VALUES (1, 20, false, NOW() + INTERVAL '2 minutes', NOW())
      ON CONFLICT (id) DO UPDATE
      SET locked_until = NOW() + INTERVAL '2 minutes',
          updated_at = NOW()
      WHERE mercadolibre_description_import.locked_until < NOW()
        AND mercadolibre_description_import.completed = false
      RETURNING next_offset
    `;

    if (!acquired.length) {
      return NextResponse.json(
        {
          error:
            "La importación está ocupada o ya terminó. Intentá más tarde.",
        },
        { status: 409 }
      );
    }

    const offset = Number(acquired[0].next_offset);

    try {
      const accounts = await sql`
        SELECT access_token
        FROM mercadolibre_connections
        WHERE seller_id = ${SELLER_ID}
        LIMIT 1
      `;

      if (!accounts.length || !accounts[0].access_token) {
        throw new Error("No hay token de acceso guardado.");
      }

      const accessToken = String(accounts[0].access_token);

      const products = await sql`
        SELECT item_id
        FROM mercadolibre_products
        WHERE seller_id = ${SELLER_ID}
        ORDER BY item_id
        LIMIT ${LOTE}
        OFFSET ${offset}
      `;

      const errors: string[] = [];
      let saved = 0;
      let withoutDescription = 0;

      for (const product of products) {
        const itemId = String(product.item_id);

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
            withoutDescription++;
            continue;
          }

          if (!response.ok) {
            errors.push(itemId);
            continue;
          }

          const data = await response.json();
          const description =
            typeof data.plain_text === "string"
              ? data.plain_text
              : typeof data.text === "string"
                ? data.text
                : "";

          await sql`
            UPDATE mercadolibre_products
            SET description = ${description || null},
                updated_at = NOW()
            WHERE item_id = ${itemId}
              AND seller_id = ${SELLER_ID}
          `;

          if (description.trim()) {
            saved++;
          } else {
            withoutDescription++;
          }
        } catch {
          errors.push(itemId);
        }
      }

      const totals = await sql`
        SELECT COUNT(*)::int AS total
        FROM mercadolibre_products
        WHERE seller_id = ${SELLER_ID}
      `;

      const total = Number(totals[0]?.total ?? 0);
      const nextOffset = offset + products.length;
      const completed = nextOffset >= total;

      if (errors.length === 0) {
        await sql`
          UPDATE mercadolibre_description_import
          SET next_offset = ${nextOffset},
              completed = ${completed},
              updated_at = NOW()
          WHERE id = 1
        `;
      }

      return NextResponse.json({
        correcto: errors.length === 0,
        offset,
        procesados: products.length,
        descripciones_guardadas: saved,
        sin_descripcion: withoutDescription,
        errores: errors.length,
        items_con_error: errors,
        total_productos: total,
        siguiente_offset: errors.length ? offset : completed ? null : nextOffset,
        completado: completed && errors.length === 0,
        mensaje:
          errors.length > 0
            ? "Hubo errores. El progreso no avanzó; revisá los productos informados."
            : completed
              ? "Importación de descripciones completada."
              : "Lote procesado. Ejecutá nuevamente para continuar.",
      });
    } finally {
      await sql`
        UPDATE mercadolibre_description_import
        SET locked_until = '-infinity',
            updated_at = NOW()
        WHERE id = 1
      `;
    }
  } catch (error) {
    console.error("Error en la importación automática:", error);

    return NextResponse.json(
      { error: "No se pudo procesar el lote. Revisá los registros de Vercel." },
      { status: 500 }
    );
  }
}
