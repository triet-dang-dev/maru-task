// @vitest-environment node

import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { proxy } from "./proxy";

describe("auth proxy", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("redirects anonymous protected-page requests to login with a next parameter", () => {
    const request = new NextRequest("http://localhost:3000/projects/42?tab=work-items");

    const response = proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?next=%2Fprojects%2F42%3Ftab%3Dwork-items",
    );
  });

  it("returns stable unauthorized contract for anonymous private API requests", async () => {
    const request = new NextRequest("http://localhost:3000/api/v1/projects");

    const response = proxy(request);

    expect(response.status).toBe(401);
    const payload = await response.json();
    expect(payload).toMatchObject({
      error: "unauthorized",
      message: "Your session is not authorized.",
      requestId: expect.any(String),
    });
  });

  it("allows anonymous backend health checks", () => {
    const response = proxy(new NextRequest("http://localhost:3000/api/v1/health"));

    expect(response.status).toBe(200);
  });

  it("allows authenticated protected-page requests", () => {
    const request = new NextRequest("http://localhost:3000/projects/42", {
      headers: {
        cookie: "jwt_token=opaque",
      },
    });

    const response = proxy(request);

    expect(response.status).toBe(200);
  });

  it("allows protected pages and private APIs when non-production mock auth is enabled", () => {
    vi.stubEnv("MOCK_AUTH", "true");

    const pageResponse = proxy(new NextRequest("http://localhost:3000/projects/42"));
    const apiResponse = proxy(new NextRequest("http://localhost:3000/api/v1/projects"));

    expect(pageResponse.status).toBe(200);
    expect(apiResponse.status).toBe(200);
  });

  it("does not enable mock auth in production", () => {
    vi.stubEnv("MOCK_AUTH", "true");
    vi.stubEnv("NODE_ENV", "production");

    const response = proxy(new NextRequest("http://localhost:3000/projects/42"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?next=%2Fprojects%2F42",
    );
  });

  it("redirects authenticated login requests back to dashboard", () => {
    const request = new NextRequest("http://localhost:3000/login", {
      headers: {
        cookie: "jwt_token=opaque",
      },
    });

    const response = proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/");
  });
});
