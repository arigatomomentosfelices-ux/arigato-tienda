import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.json(
      { error: "Mercado Libre no autorizó la conexión." },
      { status: 400 }
    );
  }

  if (!code) {
    return NextResponse.json(
      { error: "No se recibió el código de autorización." },
      { status: 400 }
    );
  }

  return NextResponse.json({
    message:
      "Autorización recibida. El intercambio seguro del código por el token todavía no está configurado.",
  });
}
