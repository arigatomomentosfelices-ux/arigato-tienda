
import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { isAdminAuthenticated } from "../../../../lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SELLER_ID = "457163596";
const PAGE_SIZE = 20;

function jsonError(message: string, status: number) {
  const response = NextResponse.json({ error: message }, { status });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function GET(request: NextRequest) {
  if (!isAdminAuthenticated(request)) {
    return jsonError("No autorizado.", 401);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return jsonError("Falta configurar DATABASE_URL.", 500);
  }

  const page = Number(request.nextUrl.searchParams.get("page") || "1");

  if (!Number.isSafeInteger(page) || page < 1 || page > 100000) {
    return jsonError("El número de página no es válido.", 400);
  }

  try {
    const sql = neon(databaseUrl);
    const offset = (page - 1) * PAGE_SIZE;

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
        category_id,
        arigato_category
      FROM mercadolibre_products
      WHERE seller_id = ${SELLER_ID}
      ORDER BY title ASC NULLS LAST, item_id ASC
      LIMIT ${PAGE_SIZE}
      OFFSET ${offset}
    `;

    const totals = await sql`
      SELECT COUNT(*)::int AS total
      FROM mercadolibre_products
      WHERE seller_id = ${SELLER_ID}
    `;

    const response = NextResponse.json({
      correcto: true,
      pagina: page,
      por_pagina: PAGE_SIZE,
      total: Number(totals[0]?.total ?? 0),
      productos: products,
    });

    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error("Error al consultar productos de administración:", error);
    return jsonError("No se pudieron consultar los productos.", 500);
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAdminAuthenticated(request)) {
    return jsonError("No autorizado.", 401);
  }

  // Comprobar el origen cuando el navegador lo envía.
  const origin = request.headers.get("origin");
  const expectedOrigin = new URL(request.url).origin;

  if (origin && origin !== expectedOrigin) {
    return jsonError("Origen no permitido.", 403);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return jsonError("Falta configurar DATABASE_URL.", 500);
  }

  let body: {
    item_id?: unknown;
    arigato_category?: unknown;
    selected_for_store?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return jsonError("El cuerpo de la solicitud no es válido.", 400);
  }

  if (
    typeof body.item_id !== "string" ||
    body.item_id.length < 1 ||
    body.item_id.length > 100
  ) {
    return jsonError("El identificador del producto no es válido.", 400);
  }

  const hasCategory = Object.prototype.hasOwnProperty.call(
    body,
    "arigato_category"
  );
  const hasSelection = Object.prototype.hasOwnProperty.call(
    body,
    "selected_for_store"
  );

  if (!hasCategory && !hasSelection) {
    return jsonError("No hay cambios para guardar.", 400);
  }

  let category: string | null = null;

  if (hasCategory) {
    if (body.arigato_category === null) {
      category = null;
    } else if (typeof body.arigato_category === "string") {
      category = body.arigato_category.trim();

      if (category.length > 80) {
        return jsonError("La categoría no puede superar 80 caracteres.", 400);
      }

      if (category === "") {
        category = null;
      }
    } else {
      return jsonError("La categoría no es válida.", 400);
    }
  }

  if (
    hasSelection &&
    typeof body.selected_for_store !== "boolean"
  ) {
    return jsonError("El estado de publicación no es válido.", 400);
  }

  try {
    const sql = neon(databaseUrl);

    let updated;

    if (hasCategory && hasSelection) {
      updated = await sql`
        UPDATE mercadolibre_products
        SET
          arigato_category = ${category},
          selected_for_store = ${body.selected_for_store as boolean},
          updated_at = NOW()
        WHERE item_id = ${body.item_id}
          AND seller_id = ${SELLER_ID}
        RETURNING item_id, arigato_category, selected_for_store
      `;
    } else if (hasCategory) {
      updated = await sql`
        UPDATE mercadolibre_products
        SET
          arigato_category = ${category},
          updated_at = NOW()
        WHERE item_id = ${body.item_id}
          AND seller_id = ${SELLER_ID}
        RETURNING item_id, arigato_category, selected_for_store
      `;
    } else {
      updated = await sql`
        UPDATE mercadolibre_products
        SET
          selected_for_store = ${body.selected_for_store as boolean},
          updated_at = NOW()
        WHERE item_id = ${body.item_id}
          AND seller_id = ${SELLER_ID}
        RETURNING item_id, arigato_category, selected_for_store
      `;
    }

    if (!updated.length) {
      return jsonError("No se encontró ese producto.", 404);
    }

    const response = NextResponse.json({
      correcto: true,
      producto: updated[0],
      mensaje: "Cambios guardados correctamente.",
    });

    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error("Error al actualizar producto de administración:", error);
    return jsonError("No se pudieron guardar los cambios.", 500);
  }
}
