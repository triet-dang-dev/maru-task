interface BackendHeaderOptions {
  contentType?: string;
}

// The .NET API roots all controllers under /api/v1.
export const BACKEND_API_PREFIX = "/api/v1";

export function backendUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/$/, "")}${BACKEND_API_PREFIX}${path}`;
}

function normalizeCookieHeader(cookie: string): string {
  return cookie.replace(/,\s*(?=refresh_token=)/g, "; ");
}

export function createBackendHeaders(
  request: Request,
  requestId: string,
  options: BackendHeaderOptions = {},
): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Request-ID": requestId,
  };
  const cookie = request.headers.get("cookie");
  const userAgent = request.headers.get("user-agent");

  if (cookie) headers.Cookie = normalizeCookieHeader(cookie);
  if (userAgent) headers["User-Agent"] = userAgent;
  if (options.contentType) headers["Content-Type"] = options.contentType;

  return headers;
}
