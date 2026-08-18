// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

import { GET, POST } from "./route";

describe("auth BFF route", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("validates and forwards an email login while preserving backend session cookies", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, errorCode: "", data: null }), {
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": "jwt_token=opaque; HttpOnly; Secure; Path=/auth; SameSite=Strict",
        },
        status: 200,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      new Request("http://localhost:3000/api/v1/auth/login/web-app", {
        body: JSON.stringify({ email: "person@example.com", password: "not-logged" }),
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Maru Browser Test",
        },
        method: "POST",
      }),
      { params: Promise.resolve({ action: ["login", "web-app"] }) },
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("jwt_token=opaque");
    expect(response.headers.get("set-cookie")).toContain("Path=/");
    expect(response.headers.get("set-cookie")).not.toContain("Path=/auth");
    expect(response.headers.get("set-cookie")).not.toContain("Secure");
    expect(await response.json()).toEqual({ success: true, errorCode: "", data: null });

    const [upstreamUrl, requestInit] = fetchMock.mock.calls[0];
    expect(upstreamUrl.toString()).toContain("/auth/login/web-app");
    expect(requestInit).toMatchObject({
      body: JSON.stringify({ email: "person@example.com", password: "not-logged" }),
      method: "POST",
    });
    expect(requestInit.headers).toMatchObject({ "User-Agent": "Maru Browser Test" });
  });

  it("forwards the browser session cookie to the authenticated user endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          errorCode: "",
          data: { displayName: "Pat Lee", role: "Developer", userId: 7 },
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": "jwt_token=rotated; HttpOnly; Path=/; SameSite=Strict",
          },
          status: 200,
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(
      new Request("http://localhost:3000/api/v1/auth/me", {
        headers: { Cookie: "jwt_token=opaque" },
      }),
      { params: Promise.resolve({ action: ["me"] }) },
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("jwt_token=rotated");
    expect(await response.json()).toEqual({ displayName: "Pat Lee", id: "7", role: "Developer" });
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      headers: expect.objectContaining({ Cookie: "jwt_token=opaque" }),
      method: "GET",
    });
  });

  it("normalizes comma-joined auth cookies before forwarding an authenticated request", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, errorCode: "", data: true }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await GET(
      new Request("http://localhost:3000/api/v1/auth/me", {
        headers: { Cookie: "jwt_token=access,refresh_token=refresh" },
      }),
      { params: Promise.resolve({ action: ["me"] }) },
    );

    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      headers: expect.objectContaining({ Cookie: "jwt_token=access; refresh_token=refresh" }),
      method: "GET",
    });
  });

  it("requires the mock session cookie and maps the current user to a browser session", async () => {
    vi.stubEnv("USE_MOCK_API", "true");

    const anonymousResponse = await GET(new Request("http://localhost:3000/api/v1/auth/me"), {
      params: Promise.resolve({ action: ["me"] }),
    });
    expect(anonymousResponse.status).toBe(401);

    const sessionResponse = await GET(
      new Request("http://localhost:3000/api/v1/auth/me", {
        headers: { Cookie: "jwt_token=mock-session" },
      }),
      { params: Promise.resolve({ action: ["me"] }) },
    );

    expect(sessionResponse.status).toBe(200);
    expect(await sessionResponse.json()).toEqual({
      displayName: "Morgan Chen",
      id: "1",
      role: "ProjectManager",
    });
  });

  it("provides the development mock session without a session cookie when mock auth is enabled", async () => {
    vi.stubEnv("MOCK_AUTH", "true");

    const response = await GET(new Request("http://localhost:3000/api/v1/auth/me"), {
      params: Promise.resolve({ action: ["me"] }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      displayName: "Morgan Chen",
      id: "1",
      role: "ProjectManager",
    });
  });

  it("maps an upstream forbidden response to the stable browser auth error contract", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "tenant restricted" }), {
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": "jwt_token=; HttpOnly; Max-Age=0; Path=/; SameSite=Strict",
          },
          status: 403,
        }),
      ),
    );

    const response = await POST(
      new Request("http://localhost:3000/api/v1/auth/login/web-app", {
        body: JSON.stringify({ email: "person@example.com", password: "wrong-password" }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      }),
      { params: Promise.resolve({ action: ["login", "web-app"] }) },
    );

    expect(response.status).toBe(403);
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
    expect(await response.json()).toMatchObject({
      error: "forbidden",
      message: "You do not have permission to access this resource.",
      requestId: expect.any(String),
    });
  });

  it("maps an upstream revoked session response to unauthorized and relays cookie clearing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "refresh token revoked" }), {
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": "jwt_token=; HttpOnly; Max-Age=0; Path=/; SameSite=Strict",
          },
          status: 401,
        }),
      ),
    );

    const response = await GET(
      new Request("http://localhost:3000/api/v1/auth/me", {
        headers: { Cookie: "jwt_token=opaque" },
      }),
      { params: Promise.resolve({ action: ["me"] }) },
    );

    expect(response.status).toBe(401);
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
    expect(await response.json()).toMatchObject({
      error: "unauthorized",
      message: "Your session is not authorized.",
      requestId: expect.any(String),
    });
  });

  it("returns a stable gateway error when upstream current-user payload is invalid", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ success: true, data: { unexpected: true } }), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        }),
      ),
    );

    const response = await GET(
      new Request("http://localhost:3000/api/v1/auth/me", {
        headers: { Cookie: "jwt_token=opaque" },
      }),
      { params: Promise.resolve({ action: ["me"] }) },
    );

    expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({
      error: "upstream_auth_unavailable",
      message: "The authentication service is unavailable.",
      requestId: expect.any(String),
    });
  });

  it("forwards logout without a request payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(null, {
        headers: {
          "Set-Cookie":
            "jwt_token=; HttpOnly; Secure; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/auth",
        },
        status: 200,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      new Request("http://localhost:3000/api/v1/auth/logout", {
        body: JSON.stringify({ ignored: true }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      }),
      { params: Promise.resolve({ action: ["logout"] }) },
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("jwt_token=");
    expect(response.headers.get("set-cookie")).toContain("refresh_token=");
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0; Path=/");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ body: undefined, method: "POST" });
  });

  it("starts Entra OIDC through the backend and relays its authorization redirect", async () => {
    vi.stubEnv("DOTNET_API_BASE_URL", "http://localhost:5000");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(null, {
        headers: { Location: "https://login.microsoftonline.com/tenant/oauth2/v2.0/authorize" },
        status: 302,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(new Request("http://localhost:3000/api/v1/auth/oidc/entra/start"), {
      params: Promise.resolve({ action: ["oidc", "entra", "start"] }),
    });

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe(
      "https://login.microsoftonline.com/tenant/oauth2/v2.0/authorize",
    );
    expect(fetchMock.mock.calls[0][0].toString()).toBe(
      "http://localhost:5000/api/v1/auth/oidc/entra/start",
    );
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: "GET", redirect: "manual" });
  });

  it("returns the authorization URL as JSON for an OIDC start preflight request", async () => {
    vi.stubEnv("DOTNET_API_BASE_URL", "http://localhost:5000");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(null, {
          headers: { Location: "https://login.microsoftonline.com/tenant/oauth2/v2.0/authorize" },
          status: 302,
        }),
      ),
    );

    const response = await GET(
      new Request("http://localhost:3000/api/v1/auth/oidc/entra/start", {
        headers: { "X-OIDC-Start-Mode": "preflight" },
      }),
      { params: Promise.resolve({ action: ["oidc", "entra", "start"] }) },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      redirectUrl: "https://login.microsoftonline.com/tenant/oauth2/v2.0/authorize",
    });
  });

  it("forwards the Entra callback query and relays backend session cookies to the browser", async () => {
    vi.stubEnv("DOTNET_API_BASE_URL", "http://localhost:5000");
    const upstreamHeaders = new Headers({ Location: "https://app.example.test/home" });
    upstreamHeaders.append(
      "Set-Cookie",
      "jwt_token=access; HttpOnly; Secure; SameSite=Strict; Path=/",
    );
    upstreamHeaders.append(
      "Set-Cookie",
      "refresh_token=refresh; HttpOnly; Secure; SameSite=Strict; Path=/",
    );
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { headers: upstreamHeaders, status: 302 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(
      new Request(
        "http://localhost:3000/api/v1/auth/oidc/entra/callback?state=opaque-state&code=opaque-code&session_state=entra-session",
      ),
      { params: Promise.resolve({ action: ["oidc", "entra", "callback"] }) },
    );

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://app.example.test/home");
    expect(response.headers.get("set-cookie")).toContain("jwt_token=access");
    expect(response.headers.get("set-cookie")).toContain("refresh_token=refresh");
    expect(response.headers.get("set-cookie")).toContain("SameSite=Lax");
    expect(response.headers.get("set-cookie")).not.toContain("SameSite=Strict");
    expect(fetchMock.mock.calls[0][0].toString()).toBe(
      "http://localhost:5000/api/v1/auth/oidc/entra/callback?state=opaque-state&code=opaque-code&session_state=entra-session",
    );
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: "GET", redirect: "manual" });
  });

  it("rejects a non-HTTP redirect returned by the backend", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(null, { headers: { Location: "javascript:alert(1)" }, status: 302 }),
        ),
    );

    const response = await GET(new Request("http://localhost:3000/api/v1/auth/oidc/entra/start"), {
      params: Promise.resolve({ action: ["oidc", "entra", "start"] }),
    });

    expect(response.status).toBe(502);
    expect(response.headers.get("location")).toBeNull();
  });

  it("maps the backend's current authenticated-only /auth/me response to a pending profile", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ success: true, errorCode: "", data: true }), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        }),
      ),
    );

    const response = await GET(
      new Request("http://localhost:3000/api/v1/auth/me", {
        headers: { Cookie: "jwt_token=opaque" },
      }),
      { params: Promise.resolve({ action: ["me"] }) },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      displayName: "Signed in user",
      id: "pending",
      role: "",
    });
  });

  it("refreshes the cookie session without a request payload and relays rotated cookies", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, errorCode: "", data: true }), {
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": "jwt_token=rotated; HttpOnly; Secure; SameSite=Strict; Path=/auth",
        },
        status: 200,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      new Request("http://localhost:3000/api/v1/auth/refresh", {
        body: JSON.stringify({ ignored: true }),
        headers: { Cookie: "jwt_token=expired; refresh_token=refresh" },
        method: "POST",
      }),
      { params: Promise.resolve({ action: ["refresh"] }) },
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("jwt_token=rotated");
    expect(response.headers.get("set-cookie")).toContain("Path=/");
    expect(response.headers.get("set-cookie")).not.toContain("Path=/auth");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ body: undefined, method: "POST" });
    expect(fetchMock.mock.calls[0][1].headers).toMatchObject({
      Cookie: "jwt_token=expired; refresh_token=refresh",
    });
  });

  it("clears the browser session when backend refresh rejects the cookie pair", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ success: false, errorCode: "100006", data: null }), {
          headers: { "Content-Type": "application/json" },
          status: 400,
        }),
      ),
    );

    const response = await POST(
      new Request("https://app.example.test/api/v1/auth/refresh", {
        headers: { Cookie: "jwt_token=expired; refresh_token=expired" },
        method: "POST",
      }),
      { params: Promise.resolve({ action: ["refresh"] }) },
    );

    expect(response.status).toBe(401);
    expect(response.headers.get("set-cookie")).toContain("jwt_token=");
    expect(response.headers.get("set-cookie")).toContain("refresh_token=");
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0; Path=/");
    expect(response.headers.get("set-cookie")).toContain("Secure");
  });

  it("maps the implemented admin registration contract without exposing a public page", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, errorCode: "", data: true }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      new Request("http://localhost:3000/api/v1/auth/register", {
        body: JSON.stringify({
          displayName: "Taylor Morgan",
          email: "taylor@example.com",
          role: "Developer",
        }),
        headers: {
          "Content-Type": "application/json",
          Cookie: "jwt_token=admin-access",
        },
        method: "POST",
      }),
      { params: Promise.resolve({ action: ["register"] }) },
    );

    expect(response.status).toBe(200);
    expect(fetchMock.mock.calls[0][0].toString()).toBe(
      "http://localhost:5000/api/v1/auth/register",
    );
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      body: JSON.stringify({
        displayName: "Taylor Morgan",
        email: "taylor@example.com",
        role: "Developer",
      }),
      method: "POST",
    });
    expect(fetchMock.mock.calls[0][1].headers).toMatchObject({ Cookie: "jwt_token=admin-access" });
  });
});
