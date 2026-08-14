import { NextResponse } from "next/server";

import { createBackendHeaders } from "@/utils/backend-request";
import {
  isBackendHttpMethod,
  resolvePassthroughBackendEndpoint,
} from "@/utils/backend-endpoint-resolver";
import { getServerEnv } from "@/utils/env.server";

type RouteContext = { params: Promise<{ path: string[] }> };

function errorResponse(status: number, requestId: string, endpointId?: string) {
  const detail =
    status === 404
      ? { error: "not_found", message: "The requested backend API route is not mapped." }
      : status === 501
        ? {
            error: "mock_not_implemented",
            message: "This mapped backend endpoint has no development mock response.",
          }
        : {
            error: "upstream_api_unavailable",
            message: "The .NET API is unavailable.",
          };

  return NextResponse.json(
    { ...detail, ...(endpointId ? { endpointId } : {}), requestId },
    {
      headers: { "Cache-Control": "no-store", "X-Request-ID": requestId },
      status,
    },
  );
}

async function proxyToBackend(request: Request, context: RouteContext) {
  const requestId = crypto.randomUUID();
  const method = request.method.toUpperCase();
  if (!isBackendHttpMethod(method)) return errorResponse(404, requestId);

  const { path } = await context.params;
  const requestUrl = new URL(request.url);
  const frontendPath = `/api/v1/${path.join("/")}`;
  const resolved = resolvePassthroughBackendEndpoint(method, frontendPath);
  if (!resolved) return errorResponse(404, requestId);

  const env = getServerEnv();
  if (env.USE_MOCK_API) return errorResponse(501, requestId, resolved.id);

  const upstreamUrl = new URL(
    resolved.backendPath,
    `${env.DOTNET_API_BASE_URL.replace(/\/$/, "")}/`,
  );
  upstreamUrl.search = requestUrl.search;

  const contentType = request.headers.get("content-type") ?? undefined;
  const body = method === "GET" ? undefined : await request.text();

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      body: body || undefined,
      headers: createBackendHeaders(request, requestId, { contentType }),
      method,
      next: { revalidate: 0 },
      redirect: "manual",
      signal: AbortSignal.timeout(env.DOTNET_API_TIMEOUT_MS),
    });
  } catch {
    return errorResponse(502, requestId, resolved.id);
  }

  const responseHeaders = new Headers({
    "Cache-Control": "no-store",
    "X-Maru-Backend-Endpoint": resolved.id,
    "X-Request-ID": requestId,
  });
  const upstreamContentType = upstream.headers.get("content-type");
  if (upstreamContentType) responseHeaders.set("Content-Type", upstreamContentType);

  return new NextResponse(await upstream.arrayBuffer(), {
    headers: responseHeaders,
    status: upstream.status,
  });
}

export function GET(request: Request, context: RouteContext) {
  return proxyToBackend(request, context);
}

export function POST(request: Request, context: RouteContext) {
  return proxyToBackend(request, context);
}

export function PUT(request: Request, context: RouteContext) {
  return proxyToBackend(request, context);
}

export function PATCH(request: Request, context: RouteContext) {
  return proxyToBackend(request, context);
}

export function DELETE(request: Request, context: RouteContext) {
  return proxyToBackend(request, context);
}
