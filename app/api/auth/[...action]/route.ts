import { NextResponse } from "next/server";
import { z } from "zod";

import { getMockAuthData } from "@/app/api/mock-data";
import { createBackendHeaders } from "@/utils/backend-request";
import { getServerEnv } from "@/utils/env.server";

type RouteContext = { params: Promise<{ action: string[] }> };

const emailLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  displayName: z.string().trim().min(1),
  email: z.string().trim().email(),
  role: z.enum(["Admin", "ProjectManager", "Developer", "Viewer"]),
});

const postRoutes = {
  "login/web-app": emailLoginSchema,
  logout: null,
  refresh: null,
  register: registerSchema,
} as const;

const currentUserSchema = z.object({
  success: z.literal(true),
  data: z.object({
    displayName: z.string().nullable(),
    role: z.string().nullable(),
    userId: z.number().int().positive(),
  }),
});

const authenticatedOnlySchema = z.object({
  success: z.literal(true),
  data: z.literal(true),
});

const oidcRedirectRoutes = new Set(["oidc/entra/start", "oidc/entra/callback"]);
const redirectStatuses = new Set([301, 302, 303, 307, 308]);

function errorResponse(status: number, requestId: string, headers?: Headers) {
  const detail =
    status === 400 || status === 422
      ? { error: "validation_failed", message: "The authentication request is invalid." }
      : status === 401
        ? { error: "unauthorized", message: "Your session is not authorized." }
        : status === 403
          ? { error: "forbidden", message: "You do not have permission to access this resource." }
          : status === 409
            ? {
                error: "conflict",
                message: "The authentication request conflicts with existing data.",
              }
            : status === 429
              ? {
                  error: "rate_limited",
                  message: "Too many authentication requests. Try again later.",
                }
              : {
                  error: "upstream_auth_unavailable",
                  message: "The authentication service is unavailable.",
                };

  const responseHeaders = new Headers(headers);
  responseHeaders.set("Cache-Control", "no-store");
  responseHeaders.set("X-Request-ID", requestId);

  return NextResponse.json({ ...detail, requestId }, { headers: responseHeaders, status });
}

function hasMockSession(request: Request, cookieName: string) {
  return request.headers
    .get("cookie")
    ?.split(";")
    .some((cookie) => cookie.trim() === `${cookieName}=mock-session`);
}

function isMockAuthEnabled() {
  return process.env.NODE_ENV !== "production" && process.env.MOCK_AUTH === "true";
}

function toBrowserSession(payload: unknown) {
  const parsed = currentUserSchema.safeParse(payload);
  if (parsed.success) {
    return {
      displayName: parsed.data.data.displayName ?? "",
      id: String(parsed.data.data.userId),
      role: parsed.data.data.role ?? "",
    };
  }

  if (authenticatedOnlySchema.safeParse(payload).success) {
    return {
      displayName: "Signed in user",
      id: "pending",
      role: "",
    };
  }

  return null;
}

function normalizeBrowserCookie(setCookie: string, request: Request) {
  let normalized = setCookie.replace(/;\s*Path=\/auth(?=;|$)/gi, "; Path=/");
  const isLocalHttp =
    process.env.NODE_ENV !== "production" && new URL(request.url).protocol === "http:";
  if (isLocalHttp) normalized = normalized.replace(/;\s*Secure(?=;|$)/gi, "");
  return normalized;
}

function appendSetCookies(headers: Headers, upstreamHeaders: Headers, request: Request) {
  const setCookieHeaders =
    (upstreamHeaders as Headers & { getSetCookie?: () => string[] }).getSetCookie?.() ??
    [upstreamHeaders.get("set-cookie")].filter((value): value is string => Boolean(value));

  setCookieHeaders.forEach((setCookie) =>
    headers.append("Set-Cookie", normalizeBrowserCookie(setCookie, request)),
  );
}

function appendBrowserSessionClears(headers: Headers, request: Request, accessCookieName: string) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  [accessCookieName, "refresh_token"].forEach((cookieName) => {
    headers.append(
      "Set-Cookie",
      `${cookieName}=; HttpOnly; Max-Age=0; Path=/; SameSite=Strict${secure}`,
    );
  });
}

async function proxyOidcRedirect(request: Request, actionPath: string, requestId: string) {
  const env = getServerEnv();
  const requestUrl = new URL(request.url);
  const upstreamUrl = new URL(`${env.DOTNET_API_BASE_URL.replace(/\/$/, "")}/auth/${actionPath}`);

  if (actionPath.endsWith("/callback")) {
    requestUrl.searchParams.forEach((value, key) => upstreamUrl.searchParams.append(key, value));
  }

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      headers: createBackendHeaders(request, requestId),
      method: "GET",
      redirect: "manual",
      signal: AbortSignal.timeout(env.DOTNET_API_TIMEOUT_MS),
    });
  } catch {
    return errorResponse(502, requestId);
  }

  const responseHeaders = new Headers({
    "Cache-Control": "no-store",
    "X-Request-ID": requestId,
  });
  appendSetCookies(responseHeaders, upstream.headers, request);

  const location = upstream.headers.get("location");
  if (!redirectStatuses.has(upstream.status) || !location) {
    return errorResponse(upstream.ok ? 502 : upstream.status, requestId, responseHeaders);
  }

  let redirectUrl: URL;
  try {
    redirectUrl = new URL(location, requestUrl.origin);
  } catch {
    return errorResponse(502, requestId, responseHeaders);
  }

  if (redirectUrl.protocol !== "http:" && redirectUrl.protocol !== "https:") {
    return errorResponse(502, requestId, responseHeaders);
  }

  responseHeaders.set("Location", redirectUrl.toString());
  return new NextResponse(null, { headers: responseHeaders, status: upstream.status });
}

async function proxy(request: Request, context: RouteContext, method: "GET" | "POST") {
  const { action } = await context.params;
  const actionPath = action.join("/");
  const requestId = crypto.randomUUID();
  const isOidcRedirect = method === "GET" && oidcRedirectRoutes.has(actionPath);
  const inputSchema =
    method === "POST" ? postRoutes[actionPath as keyof typeof postRoutes] : undefined;

  if (
    (method === "GET" && actionPath !== "me" && !isOidcRedirect) ||
    (method === "POST" && inputSchema === undefined)
  ) {
    return errorResponse(404, requestId);
  }

  if (isOidcRedirect) return proxyOidcRedirect(request, actionPath, requestId);

  let body: string | undefined;

  if (inputSchema) {
    const input = inputSchema.safeParse(await request.json().catch(() => null));
    if (!input.success) return errorResponse(422, requestId);
    body = JSON.stringify(input.data);
  }

  const env = getServerEnv();
  if (actionPath === "me" && isMockAuthEnabled()) {
    const headers = new Headers({ "Cache-Control": "no-store", "X-Request-ID": requestId });
    const session = toBrowserSession(getMockAuthData(actionPath));
    return session ? NextResponse.json(session, { headers }) : errorResponse(502, requestId);
  }

  if (env.USE_MOCK_API) {
    const headers = new Headers({ "Cache-Control": "no-store", "X-Request-ID": requestId });
    if (actionPath === "me") {
      if (!hasMockSession(request, env.AUTH_COOKIE_NAME)) {
        return errorResponse(401, requestId);
      }

      const session = toBrowserSession(getMockAuthData(actionPath));
      return session ? NextResponse.json(session, { headers }) : errorResponse(502, requestId);
    }
    if (actionPath === "login/web-app") {
      headers.set(
        "Set-Cookie",
        `${env.AUTH_COOKIE_NAME}=mock-session; HttpOnly; Path=/; SameSite=Lax`,
      );
    }
    if (actionPath === "logout") {
      headers.set(
        "Set-Cookie",
        `${env.AUTH_COOKIE_NAME}=; HttpOnly; Max-Age=0; Path=/; SameSite=Lax`,
      );
    }
    return NextResponse.json(getMockAuthData(actionPath), { headers });
  }

  const headers = createBackendHeaders(request, requestId, {
    contentType: body ? "application/json" : undefined,
  });

  let upstream: Response;
  try {
    upstream = await fetch(
      new URL(`${env.DOTNET_API_BASE_URL.replace(/\/$/, "")}/auth/${actionPath}`),
      {
        body,
        headers,
        method,
        next: { revalidate: 0 },
        signal: AbortSignal.timeout(env.DOTNET_API_TIMEOUT_MS),
      },
    );
  } catch {
    return errorResponse(502, requestId);
  }

  const responseHeaders = new Headers({
    "Cache-Control": "no-store",
    "X-Request-ID": requestId,
  });
  const contentType = upstream.headers.get("content-type");
  if (contentType) responseHeaders.set("Content-Type", contentType);
  appendSetCookies(responseHeaders, upstream.headers, request);

  const bodyText = await upstream.text();
  if (!upstream.ok) {
    if (actionPath === "refresh") {
      appendBrowserSessionClears(responseHeaders, request, env.AUTH_COOKIE_NAME);
      return errorResponse(401, requestId, responseHeaders);
    }
    return errorResponse(upstream.status, requestId, responseHeaders);
  }

  if (actionPath === "logout") {
    appendBrowserSessionClears(responseHeaders, request, env.AUTH_COOKIE_NAME);
  }

  if (actionPath === "me" && upstream.ok) {
    const session = toBrowserSession(
      bodyText
        ? (() => {
            try {
              return JSON.parse(bodyText);
            } catch {
              return null;
            }
          })()
        : null,
    );
    if (!session) return errorResponse(502, requestId);
    return NextResponse.json(session, { headers: responseHeaders });
  }

  return new NextResponse(bodyText, {
    headers: responseHeaders,
    status: 200,
  });
}

export function GET(request: Request, context: RouteContext) {
  return proxy(request, context, "GET");
}

export function POST(request: Request, context: RouteContext) {
  return proxy(request, context, "POST");
}
