import { NextResponse } from "next/server";

import { getServerEnv } from "@/utils/env.server";

// Sets a mock session cookie and redirects to the dashboard.
// Only available when USE_MOCK_API is true (local development).
export async function GET(request: Request) {
  const env = getServerEnv();

  if (!env.USE_MOCK_API) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const next = new URL(request.url).searchParams.get("next") ?? "/";
  const redirectTo = next.startsWith("/") ? next : "/";

  const response = NextResponse.redirect(new URL(redirectTo, request.url));
  response.headers.set(
    "Set-Cookie",
    `${env.AUTH_COOKIE_NAME}=mock-session; HttpOnly; Path=/; SameSite=Lax`,
  );
  return response;
}
