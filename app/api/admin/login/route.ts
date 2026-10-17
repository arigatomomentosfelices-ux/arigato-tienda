
import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const COOKIE_NAME = "arigato_admin_session";
const SESSION_DURATION_SECONDS = 8 * 60 * 60;

function createSignature(expiresAt: number, secret: string) {
  return createHmac("sha256", secret)
    .update(`arigato-admin:${expiresAt}`)
    .digest("hex");
}

export async function POST(request: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!adminPassword || !sessionSecret || sessionSecret.length < 32) {
    return NextResponse.json(
      { error: "La autenticación no está configurada correctamente." },
      { status: 500 }
    );
  }

  let body: { password?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Solicitud no válida." },
      { status: 400 }
    );
  }

  if (
    typeof body.password !== "string" ||
    body.password.length > 1024
  ) {
    return NextResponse.json(
      { error: "Contraseña incorrecta." },
      { status: 401 }
    );
  }

  const supplied = Buffer.from(body.password);
  const expected = Buffer.from(adminPassword);

  const passwordMatches =
    supplied.length === expected.length &&
    timingSafeEqual(supplied, expected);

  if (!passwordMatches) {
    return NextResponse.json(
      { error: "Contraseña incorrecta." },
      { status: 401 }
    );
  }

  const expiresAt =
    Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;

  const signature = createSignature(expiresAt, sessionSecret);
  const session = `${expiresAt}.${signature}`;

  const response = NextResponse.json({
    correcto: true,
    mensaje: "Inicio de sesión correcto.",
  });

  response.cookies.set(COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
    expires: new Date(expiresAt * 1000),
  });

  response.headers.set("Cache-Control", "no-store");

  return response;
}
