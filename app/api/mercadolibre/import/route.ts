
import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const LOTE = 20;

export async function POST(request: NextRequest) {
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

    const sellerId = String(rows[0].seller_id);
    const accessToken = String(rows[0].access_token);

    const offsetParam = Number(
      request.nextUrl.searchParams.get("offset") || "0"
    );

    if (
      !Number.isInteger(offsetParam) ||
      offsetParam < 0 ||
      offsetParam > 100000
    ) {
      return NextResponse.json(
        { error: "El parámetro offset no es válido." },
        { status: 400 }
      );
    }

    const searchResponse = await fetch(
      `https://api.mercadolibre.com/users/${sellerId}/items/search?limit=${LOTE}&offset=${offsetParam}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    const searchData = await searchResponse.json();

    if (!searchResponse.ok) {
      console.error("Error al buscar publicaciones:", {
        status: searchResponse.status,
        error: searchData.error ?? null,
        message: searchData.message ?? null,
      });

      return NextResponse.json(
        { error: "No se pudieron obtener las publicaciones." },
        { status: 502 }
      );
    }

    const itemIds: string[] = searchData.results ?? [];
    let importados = 0;
    const errores: string[] = [];

    for (const itemId of itemIds) {
      try {
        const itemResponse = await fetch(
          `https://api.mercadolibre.com/items/${encodeURIComponent(itemId)}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

        if (!itemResponse.ok) {
          errores.push(itemId);
          continue;
        }

        const item = await itemResponse.json();

        const pictures = (item.pictures ?? []).map(
          (picture: { id?: string; url?: string; secure_url?: string }) => ({
            id: picture.id ?? null,
            url: picture.secure_url ?? picture.url ?? null,
          })
        );

        const thumbnail =
          item.thumbnail ??
          item.secure_thumbnail ??
          pictures[0]?.url ??
          null;

        await sql`
          INSERT INTO mercadolibre_products (
            item_id,
            seller_id,
            title,
            category_id,
            price,
            currency_id,
            available_quantity,
            status,
            permalink,
            thumbnail,
            pictures,
            selected_for_store,
            imported_at,
            updated_at
          )
          VALUES (
            ${String(item.id)},
            ${sellerId},
            ${item.title ?? null},
            ${item.category_id ?? null},
            ${item.price ?? null},
            ${item.currency_id ?? null},
            ${item.available_quantity ?? 0},
            ${item.status ?? null},
            ${item.permalink ?? null},
            ${thumbnail},
            ${JSON.stringify(pictures)}::jsonb,
            false,
            NOW(),
            NOW()
          )
          ON CONFLICT (item_id)
          DO UPDATE SET
            seller_id = EXCLUDED.seller_id,
            title = EXCLUDED.title,
            category_id = EXCLUDED.category_id,
            price = EXCLUDED.price,
            currency_id = EXCLUDED.currency_id,
            available_quantity = EXCLUDED.available_quantity,
            status = EXCLUDED.status,
            permalink = EXCLUDED.permalink,
            thumbnail = EXCLUDED.thumbnail,
            pictures = EXCLUDED.pictures,
            updated_at = NOW()
        `;

        importados++;
      } catch {
        errores.push(itemId);
      }
    }

    const nextOffset = offsetParam + itemIds.length;
    const total = Number(searchData.paging?.total ?? 0);

    return NextResponse.json({
      correcto: true,
      seller_id: sellerId,
      lote: LOTE,
      offset: offsetParam,
      encontrados: itemIds.length,
      importados,
      errores: errores.length,
      items_con_error: errores,
      total_publicaciones: total,
      siguiente_offset: nextOffset < total ? nextOffset : null,
      mensaje:
        nextOffset < total
          ? "Lote procesado. Continuá con siguiente_offset para importar el próximo."
          : "Se alcanzó el final de las publicaciones.",
    });
  } catch (error) {
    console.error("Error al importar el catálogo:", error);

    return NextResponse.json(
      { error: "Ocurrió un error al importar el catálogo." },
      { status: 500 }
    );
  }
}
