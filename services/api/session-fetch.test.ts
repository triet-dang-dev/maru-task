import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchWithSession, SESSION_EXPIRED_EVENT } from "./session-fetch";

describe("fetchWithSession", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("refreshes a cookie session once and retries parallel unauthorized requests", async () => {
    let sessionIsFresh = false;
    const fetchMock = vi.fn(async (input: string | URL) => {
      const url = input.toString();
      if (url === "/api/auth/refresh") {
        await new Promise((resolve) => setTimeout(resolve, 10));
        sessionIsFresh = true;
        return new Response(null, { status: 200 });
      }

      return new Response(null, { status: sessionIsFresh ? 200 : 401 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const [projects, workItems] = await Promise.all([
      fetchWithSession("/api/v1/projects"),
      fetchWithSession("/api/v1/work-items?projectId=42"),
    ]);

    expect(projects.status).toBe(200);
    expect(workItems.status).toBe(200);
    expect(fetchMock.mock.calls.filter(([input]) => input === "/api/auth/refresh")).toHaveLength(1);
  });

  it("returns the original unauthorized response when refresh fails", async () => {
    const expiredListener = vi.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT, expiredListener, { once: true });
    const fetchMock = vi.fn(async (input: string | URL) =>
      input.toString() === "/api/auth/refresh"
        ? new Response(null, { status: 401 })
        : new Response("original unauthorized", { status: 401 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await fetchWithSession("/api/v1/projects");

    expect(response.status).toBe(401);
    expect(await response.text()).toBe("original unauthorized");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(expiredListener).toHaveBeenCalledTimes(1);
  });

  it("announces session expiry when the retried request remains unauthorized", async () => {
    const expiredListener = vi.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT, expiredListener, { once: true });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("initial unauthorized", { status: 401 }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(new Response("retry unauthorized", { status: 401 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await fetchWithSession("/api/v1/projects");

    expect(response.status).toBe(401);
    expect(await response.text()).toBe("retry unauthorized");
    expect(expiredListener).toHaveBeenCalledTimes(1);
  });
});
