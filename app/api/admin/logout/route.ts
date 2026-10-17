
import { NextRequest, NextResponse } from "next/server";
import { clearAdminSession } from "../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = clearAdminSession();

  const response = NextResponse.json({
    correcto: true,
    mensaje: "Sesión cerrada correctamente.",
  });

  response.cookies.set(
    session.name,
    session.value,
    session.options
  );

  response.headers.set("Cache-Control", "no-store");

  return response;
}
