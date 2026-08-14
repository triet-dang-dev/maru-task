// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

const context = { params: Promise.resolve({ workItemId: "101" }) };

describe("work-item watchers BFF route", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("maps browser watcher input to the .NET work-package watcher contract", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          success: true,
          errorCode: null,
          data: {
            subscribedAt: "2026-08-13T10:15:00Z",
            userId: 7,
            watcherId: 401,
            workPackageId: 101,
          },
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      new Request("http://localhost:3000/api/v1/work-items/101/watchers", {
        body: JSON.stringify({ userId: "7" }),
        headers: {
          "Content-Type": "application/json",
          Cookie: "jwt_token=watcher-access",
        },
        method: "POST",
      }),
      context,
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      id: "401",
      subscribedAt: "2026-08-13T10:15:00Z",
      userId: "7",
      workItemId: "101",
    });
    const [upstreamUrl, requestInit] = fetchMock.mock.calls[0];
    expect(upstreamUrl.toString()).toContain("/work-packages/101/watchers");
    expect(requestInit?.body).toBe(JSON.stringify({ userId: 7 }));
    expect(requestInit?.method).toBe("POST");
    expect(new Headers(requestInit?.headers).get("cookie")).toBe("jwt_token=watcher-access");
  });
});
