// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

import { DELETE, GET, PATCH } from "./route";

function context(...path: string[]) {
  return { params: Promise.resolve({ path }) };
}

describe("allowlisted backend passthrough", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("forwards query, cookie, and user agent to an allowlisted read endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: { items: [] } }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(
      new Request("http://localhost:3000/api/v1/activity-feed?take=10&scope=project", {
        headers: { Cookie: "jwt_token=access", "User-Agent": "Maru browser" },
      }),
      context("activity-feed"),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, data: { items: [] } });
    const [upstreamUrl, requestInit] = fetchMock.mock.calls[0];
    expect(upstreamUrl.toString()).toBe(
      "http://localhost:5000/api/v1/activity-feed?take=10&scope=project",
    );
    const headers = new Headers(requestInit?.headers);
    expect(headers.get("cookie")).toBe("jwt_token=access");
    expect(headers.get("user-agent")).toBe("Maru browser");
  });

  it("forwards JSON bodies to an allowlisted command endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: true }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const body = JSON.stringify({ workPackageId: 101, toColumn: "Done" });

    const response = await PATCH(
      new Request("http://localhost:3000/api/v1/agile/boards/move", {
        body,
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      }),
      context("agile", "boards", "move"),
    );

    expect(response.status).toBe(200);
    const [upstreamUrl, requestInit] = fetchMock.mock.calls[0];
    expect(upstreamUrl.toString()).toBe("http://localhost:5000/api/v1/agile/boards/move");
    expect(requestInit?.method).toBe("PATCH");
    expect(requestInit?.body).toBe(body);
    expect(new Headers(requestInit?.headers).get("content-type")).toBe("application/json");
  });

  it("maps work-item aliases and preserves upstream error status and body", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ errorCode: "Forbidden", success: false }), {
        headers: { "Content-Type": "application/json" },
        status: 403,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await DELETE(
      new Request("http://localhost:3000/api/v1/work-items/101/labels/9", {
        method: "DELETE",
      }),
      context("work-items", "101", "labels", "9"),
    );

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ errorCode: "Forbidden", success: false });
    expect(fetchMock.mock.calls[0][0].toString()).toBe(
      "http://localhost:5000/api/v1/work-packages/101/labels/9",
    );
  });

  it("rejects paths not present in the backend contract allowlist", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(
      new Request("http://localhost:3000/api/v1/internal/secrets"),
      context("internal", "secrets"),
    );

    expect(response.status).toBe(404);
    expect((await response.json()).error).toBe("not_found");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not call .NET for passthrough-only endpoints in mock mode", async () => {
    vi.stubEnv("USE_MOCK_API", "true");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(
      new Request("http://localhost:3000/api/v1/notifications"),
      context("notifications"),
    );

    expect(response.status).toBe(501);
    expect((await response.json()).error).toBe("mock_not_implemented");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns a stable gateway error when .NET is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("connection refused")));

    const response = await GET(
      new Request("http://localhost:3000/api/v1/navigation"),
      context("navigation"),
    );

    expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({
      error: "upstream_api_unavailable",
      requestId: expect.any(String),
    });
  });
});
