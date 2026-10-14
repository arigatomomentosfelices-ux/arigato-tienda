
import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.ML_CLIENT_ID;
  const redirectUri = process.env.ML_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Falta configurar ML_CLIENT_ID o ML_REDIRECT_URI en Vercel." },
      { status: 500 }
    );
  }

  const authorizationUrl = new URL(
    "https://auth.mercadolibre.com.ar/authorization"
  );

  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("client_id", clientId);
  authorizationUrl.searchParams.set("redirect_uri", redirectUri);

  return NextResponse.redirect(authorizationUrl);
}
