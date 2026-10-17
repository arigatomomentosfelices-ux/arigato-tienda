
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authenticated = isAdminAuthenticated(request);

  const response = NextResponse.json({
    autenticado: authenticated,
  });

  response.headers.set("Cache-Control", "no-store");

  return response;
}
