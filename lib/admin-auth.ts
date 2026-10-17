
import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "arigato_admin_session";

export function isAdminAuthenticated(request: NextRequest): boolean {
  const secret = process.env.ADMIN_PASSWORD;

  if (!secret) {
    return false;
  }

  const session = request.cookies.get(COOKIE_NAME)?.value;

  if (!session) {
    return false;
  }

  const parts = session.split(".");

  if (parts.length !== 2) {
    return false;
  }

  const [expiresText, receivedSignature] = parts;

  if (!/^\d+$/.test(expiresText)) {
    return false;
  }

  if (!/^[a-f0-9]{64}$/.test(receivedSignature)) {
    return false;
  }

  const expiresAt = Number(expiresText);
  const now = Math.floor(Date.now() / 1000);

  if (
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= now
  ) {
    return false;
  }

  const expectedSignature = createHmac("sha256", secret)
    .update(`arigato-admin:${expiresAt}`)
    .digest("hex");

  const received = Buffer.from(receivedSignature, "hex");
  const expected = Buffer.from(expectedSignature, "hex");

  return (
    received.length === expected.length &&
    timingSafeEqual(received, expected)
  );
}

export function clearAdminSession() {
  return {
    name: COOKIE_NAME,
    value: "",
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    },
  };
}
