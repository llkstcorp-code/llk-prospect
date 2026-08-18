import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function unauthorized(): NextResponse {
  return new NextResponse("Acesso restrito ao LLK Prospect.", {
    status: 401,
    headers: {
      "Cache-Control": "no-store",
      "WWW-Authenticate": 'Basic realm="LLK Prospect", charset="UTF-8"',
    },
  });
}

export function proxy(request: NextRequest): NextResponse {
  const username = process.env.APP_ACCESS_USERNAME?.trim() || "llk";
  const password = process.env.APP_ACCESS_PASSWORD;
  const isProduction = process.env.NODE_ENV === "production";

  if (!password) {
    if (!isProduction) return NextResponse.next();
    return new NextResponse(
      "Defina APP_ACCESS_PASSWORD no ambiente de produção.",
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Basic ")) return unauthorized();

  try {
    const credentials = atob(authorization.slice(6));
    const separator = credentials.indexOf(":");
    const receivedUsername = credentials.slice(0, separator);
    const receivedPassword = credentials.slice(separator + 1);

    if (
      separator === -1 ||
      receivedUsername !== username ||
      receivedPassword !== password
    ) {
      return unauthorized();
    }
  } catch {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
