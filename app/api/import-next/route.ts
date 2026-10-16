
import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const LOTE = 20;
const BLOQUEO_MS = 5 * 60 * 1000;
const SELLER_ID = "457163596";

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

  const sql = neon(databaseUrl);
  let bloqueoAdquirido = false;

  try {
    await sql`
      ALTER TABLE mercadolibre_import_progress
      ADD COLUMN IF NOT EXISTS locked_until timestamptz
      NOT NULL DEFAULT '-infinity'
    `;

    const lock = await sql`
      UPDATE mercadolibre_import_progress
      SET locked_until =
            NOW() + (${BLOQUEO_MS} * INTERVAL '1 millisecond'),
          updated_at = NOW()
      WHERE seller_id = ${SELLER_ID}
        AND completed = false
        AND locked_until < NOW()
      RETURNING next_offset
    `;

    if (!lock.length) {
      const progress = await sql`
        SELECT next_offset, completed
        FROM mercadolibre_import_progress
        WHERE seller_id = ${SELLER_ID}
      `;

      if (!progress.length) {
        return NextResponse.json(
          { error: "No se encontró el progreso de importación." },
          { status: 404 }
        );
      }

      if (progress[0].completed) {
        return NextResponse.json({
          correcto: true,
          terminado: true,
          mensaje: "La importación ya está completa.",
        });
      }

      return NextResponse.json(
        {
          error: "Hay otro lote en curso o el bloqueo sigue activo.",
          mensaje: "Esperá unos minutos y volvé a intentar.",
        },
        { status: 409 }
      );
    }

    bloqueoAdquirido = true;
    const offset = Number(lock[0].next_offset);

    const connections = await sql`
      SELECT access_token
      FROM mercadolibre_connections
      WHERE seller_id = ${SELLER_ID}
      LIMIT 1
    `;

    if (!connections.length || !connections[0].access_token) {
      return NextResponse.json(
        { error: "No hay una conexión de Mercado Libre guardada." },
        { status: 404 }
      );
    }

    const accessToken = String(connections[0].access_token);

    const searchResponse = await fetch(
      `https://api.mercadolibre.com/users/${SELLER_ID}/items/search?limit=${LOTE}&offset=${offset}`,
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
    const total = Number(searchData.paging?.total ?? 0);

    let importados = 0;
    const errores: string[] = [];

    for (const itemId of itemIds) {
      try {
        const response = await fetch(
          `https://api.mercadolibre.com/items/${encodeURIComponent(itemId)}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

        if (!response.ok) {
          errores.push(itemId);
          continue;
        }

        const item = await response.json();

        const pictures = (item.pictures ?? []).map(
          (picture: {
            id?: string;
            url?: string;
            secure_url?: string;
          }) => ({
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
            ${SELLER_ID},
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

    if (errores.length > 0) {
      return NextResponse.json(
        {
          correcto: false,
          offset,
          encontrados: itemIds.length,
          importados,
          errores: errores.length,
          items_con_error: errores,
          siguiente_offset: offset,
          mensaje:
            "El progreso no avanzó porque hubo errores. El mismo lote podrá reintentarse.",
        },
        { status: 502 }
      );
    }

    const siguienteOffset = offset + itemIds.length;
    const terminado =
      siguienteOffset >= total || itemIds.length === 0;

    const actualizado = await sql`
      UPDATE mercadolibre_import_progress
      SET
        next_offset = ${siguienteOffset},
        completed = ${terminado},
        updated_at = NOW()
      WHERE seller_id = ${SELLER_ID}
        AND next_offset = ${offset}
        AND locked_until > NOW()
      RETURNING next_offset
    `;

    if (!actualizado.length) {
      return NextResponse.json(
        {
          error: "No se pudo confirmar el avance.",
          mensaje: "Verificá el progreso en Neon antes de reintentar.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      correcto: true,
      offset,
      encontrados: itemIds.length,
      importados,
      errores: 0,
      total_publicaciones: total,
      siguiente_offset: terminado ? null : siguienteOffset,
      terminado,
      mensaje: terminado
        ? "Importación finalizada."
        : "Lote procesado correctamente.",
    });
  } catch (error) {
    console.error("Error en import-next:", error);

    return NextResponse.json(
      { error: "Ocurrió un error durante la importación." },
      { status: 500 }
    );
  } finally {
    if (bloqueoAdquirido) {
      try {
        await sql`
          UPDATE mercadolibre_import_progress
          SET locked_until = '-infinity'
          WHERE seller_id = ${SELLER_ID}
        `;
      } catch (error) {
        console.error("No se pudo liberar el bloqueo:", error);
      }
    }
  }
}
