// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

describe("users BFF route", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("maps the .NET user list envelope into the browser user view model", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          success: true,
          errorCode: null,
          data: {
            items: [
              {
                userId: 1,
                displayName: "Morgan Chen",
                email: "mchen@example.com",
                role: 1,
                roleName: "Admin",
                isActive: true,
                isEmailConfirmed: true,
                lastLoginAt: "2026-08-12T08:00:00Z",
                createdAt: "2026-01-01T00:00:00Z",
              },
              {
                userId: 2,
                displayName: "Jamie Lee",
                email: "jlee@example.com",
                role: 2,
                roleName: "Member",
                isActive: true,
                isEmailConfirmed: false,
                lastLoginAt: null,
                createdAt: "2026-02-01T00:00:00Z",
              },
            ],
            totalCount: 2,
            page: 1,
            pageSize: 20,
          },
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(
      new Request("http://localhost:3000/api/v1/users", {
        headers: { Cookie: "jwt_token=user-list-access" },
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      items: [
        {
          id: "1",
          name: "Morgan Chen",
          email: "mchen@example.com",
          role: 1,
          roleName: "Admin",
          isActive: true,
          isEmailConfirmed: true,
          lastLoginAt: "2026-08-12T08:00:00Z",
          createdAt: "2026-01-01T00:00:00Z",
        },
        {
          id: "2",
          name: "Jamie Lee",
          email: "jlee@example.com",
          role: 2,
          roleName: "Member",
          isActive: true,
          isEmailConfirmed: false,
          lastLoginAt: null,
          createdAt: "2026-02-01T00:00:00Z",
        },
      ],
      page: 1,
      pageSize: 20,
      total: 2,
    });
    const [, requestInit] = fetchMock.mock.calls[0];
    expect(new Headers(requestInit?.headers).get("cookie")).toBe("jwt_token=user-list-access");
  });

  it("returns development mock users without calling the .NET API", async () => {
    vi.stubEnv("USE_MOCK_API", "true");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(new Request("http://localhost:3000/api/v1/users"));

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.items.length).toBeGreaterThan(0);
    expect(payload.items[0]).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      role: expect.any(Number),
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("filters mock users by search query", async () => {
    vi.stubEnv("USE_MOCK_API", "true");

    const response = await GET(new Request("http://localhost:3000/api/v1/users?search=morgan"));

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.items).toHaveLength(1);
    expect(payload.items[0].name).toBe("Morgan Chen");
  });

  it("forwards documented query parameters to the upstream API", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          success: true,
          data: { items: [], totalCount: 0, page: 1, pageSize: 20 },
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await GET(
      new Request(
        "http://localhost:3000/api/v1/users?search=alice&page=2&pageSize=10&role=2&isActive=false",
      ),
    );

    const url = new URL(fetchMock.mock.calls[0][0] as string);
    expect(url.searchParams.get("search")).toBe("alice");
    expect(url.searchParams.get("page")).toBe("2");
    expect(url.searchParams.get("pageSize")).toBe("10");
    expect(url.searchParams.get("role")).toBe("2");
    expect(url.searchParams.get("isActive")).toBe("false");
  });

  it("returns 401 when the upstream returns 401", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 401 }));

    const response = await GET(new Request("http://localhost:3000/api/v1/users"));
    expect(response.status).toBe(401);
    expect((await response.json()).error).toBe("unauthorized");
  });
});
