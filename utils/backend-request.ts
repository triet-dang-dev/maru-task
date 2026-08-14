interface BackendHeaderOptions {
  contentType?: string;
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

  if (cookie) headers.Cookie = cookie;
  if (userAgent) headers["User-Agent"] = userAgent;
  if (options.contentType) headers["Content-Type"] = options.contentType;

  return headers;
}
