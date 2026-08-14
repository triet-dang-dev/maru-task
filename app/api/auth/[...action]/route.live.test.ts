// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

import { GET, POST } from "./route";

function requiredEnv(name: string) {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : null;
}

const runLiveAuthContract = process.env.AUTH_CONTRACT_LIVE === "true";
const describeLive = runLiveAuthContract ? describe : describe.skip;

describeLive("auth BFF route live .NET contract", () => {
  it("logs in with permitted credentials, returns a session cookie, and resolves /me", async () => {
    const email = requiredEnv("AUTH_CONTRACT_PERMITTED_EMAIL");
    const password = requiredEnv("AUTH_CONTRACT_PERMITTED_PASSWORD");

    if (!email || !password) {
      throw new Error(
        "Missing AUTH_CONTRACT_PERMITTED_EMAIL or AUTH_CONTRACT_PERMITTED_PASSWORD for live auth contract run.",
      );
    }

    vi.stubEnv("USE_MOCK_API", "false");

    const loginResponse = await POST(
      new Request("http://localhost:3000/api/auth/login/web-app", {
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      }),
      { params: Promise.resolve({ action: ["login", "web-app"] }) },
    );

    expect(loginResponse.status).toBe(200);
    const loginSetCookie = loginResponse.headers.get("set-cookie");
    expect(loginSetCookie).toBeTruthy();
    expect(loginSetCookie).toContain("HttpOnly");

    const meResponse = await GET(
      new Request("http://localhost:3000/api/auth/me", {
        headers: { Cookie: loginSetCookie ?? "" },
      }),
      { params: Promise.resolve({ action: ["me"] }) },
    );

    expect(meResponse.status).toBe(200);
    expect(await meResponse.json()).toMatchObject({
      displayName: expect.any(String),
      id: expect.any(String),
      role: expect.any(String),
    });
  });

  it("maps forbidden or unauthorized login to stable BFF error contract", async () => {
    const email =
      requiredEnv("AUTH_CONTRACT_FORBIDDEN_EMAIL") ?? requiredEnv("AUTH_CONTRACT_INVALID_EMAIL");
    const password =
      requiredEnv("AUTH_CONTRACT_FORBIDDEN_PASSWORD") ?? requiredEnv("AUTH_CONTRACT_INVALID_PASSWORD");

    if (!email || !password) {
      throw new Error(
        "Missing forbidden/invalid fixture credentials. Provide AUTH_CONTRACT_FORBIDDEN_* or AUTH_CONTRACT_INVALID_* variables.",
      );
    }

    vi.stubEnv("USE_MOCK_API", "false");

    const response = await POST(
      new Request("http://localhost:3000/api/auth/login/web-app", {
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      }),
      { params: Promise.resolve({ action: ["login", "web-app"] }) },
    );

    expect([401, 403]).toContain(response.status);
    expect(await response.json()).toMatchObject({
      error: response.status === 403 ? "forbidden" : "unauthorized",
      message:
        response.status === 403
          ? "You do not have permission to access this resource."
          : "Your session is not authorized.",
      requestId: expect.any(String),
    });
  });

  it("maps revoked or expired cookie fixture to unauthorized on /me", async () => {
    const revokedCookie = requiredEnv("AUTH_CONTRACT_REVOKED_COOKIE");
    if (!revokedCookie) {
      throw new Error("Missing AUTH_CONTRACT_REVOKED_COOKIE for revoked-session contract run.");
    }

    vi.stubEnv("USE_MOCK_API", "false");

    const response = await GET(
      new Request("http://localhost:3000/api/auth/me", {
        headers: { Cookie: revokedCookie },
      }),
      { params: Promise.resolve({ action: ["me"] }) },
    );

    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({
      error: "unauthorized",
      message: "Your session is not authorized.",
      requestId: expect.any(String),
    });
  });

  it("forwards logout without payload and accepts backend cookie clearing", async () => {
    vi.stubEnv("USE_MOCK_API", "false");

    const response = await POST(
      new Request("http://localhost:3000/api/auth/logout", {
        body: JSON.stringify({ ignored: true }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      }),
      { params: Promise.resolve({ action: ["logout"] }) },
    );

    expect(response.status).toBe(200);
  });
});
