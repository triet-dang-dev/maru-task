import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const defaultAuthCookieName = "jwt_token";
const entraCallbackAliasPath = "/oauth/callback/azure-ad";

function isPublicPath(pathname: string) {
  return (
    pathname.startsWith("/api/auth/") ||
    pathname === "/api/v1/health" ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico"
  );
}

function isPrivateApiPath(pathname: string) {
  return pathname.startsWith("/api/v1/");
}

function isMockAuthEnabled() {
  return (
    (process.env.NODE_ENV !== "production" && process.env.MOCK_AUTH === "true") ||
    process.env.NEXT_PUBLIC_BYPASS_AUTH === "true" ||
    process.env.NEXT_PUBLIC_MOCK_AUTH === "true"
  );
}

function buildLoginRedirect(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  if (nextPath && nextPath !== "/") {
    loginUrl.searchParams.set("next", nextPath);
  }

  return NextResponse.redirect(loginUrl);
}

function buildApiUnauthorizedResponse(requestId: string) {
  return NextResponse.json(
    {
      error: "unauthorized",
      message: "Your session is not authorized.",
      requestId,
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "X-Request-ID": requestId,
      },
      status: 401,
    },
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === entraCallbackAliasPath) {
    const callbackUrl = new URL("/api/auth/oidc/entra/callback", request.url);
    callbackUrl.search = request.nextUrl.search;
    return NextResponse.redirect(callbackUrl);
  }

  if (isMockAuthEnabled()) return NextResponse.next();

  const cookieName = process.env.AUTH_COOKIE_NAME ?? defaultAuthCookieName;
  const hasSessionCookie = Boolean(request.cookies.get(cookieName)?.value);

  if (pathname === "/login") {
    return hasSessionCookie
      ? NextResponse.redirect(new URL("/", request.url))
      : NextResponse.next();
  }

  if (isPublicPath(pathname)) return NextResponse.next();

  if (hasSessionCookie) {
    return NextResponse.next();
  }

  if (isPrivateApiPath(pathname)) {
    return buildApiUnauthorizedResponse(crypto.randomUUID());
  }

  return buildLoginRedirect(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
