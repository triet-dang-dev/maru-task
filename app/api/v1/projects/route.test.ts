// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

describe("projects BFF route", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("maps project summaries and browser query parameters to the .NET projects API", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          success: true,
          errorCode: "",
          data: {
            items: [
              {
                code: "MIG",
                name: "Migration",
                projectId: 42,
                status: "Active",
                updatedAt: "2026-08-12T10:00:00Z",
              },
            ],
            page: 2,
            pageSize: 10,
            totalCount: 1,
          },
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(
      new Request(
        "http://localhost:3000/api/v1/projects?take=10&lastProjectId=42&cursorAction=next&search=Migration&sortBy=name&sortDir=asc",
        { headers: { Cookie: "jwt_token=project-list-access" } },
      ),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      items: [
        {
          code: "MIG",
          id: "42",
          name: "Migration",
          status: "Active",
          updatedAt: "2026-08-12T10:00:00Z",
        },
      ],
      page: 2,
      pageSize: 10,
      total: 1,
    });

    const [upstreamUrl, requestInit] = fetchMock.mock.calls[0];
    expect(upstreamUrl.toString()).toContain("/projects");
    expect(upstreamUrl.toString()).toContain("Take=10");
    expect(upstreamUrl.toString()).toContain("LastProjectId=42");
    expect(upstreamUrl.toString()).toContain("CursorAction=next");
    expect(upstreamUrl.toString()).not.toContain("Page=");
    expect(upstreamUrl.toString()).toContain("Search=Migration");
    expect(upstreamUrl.toString()).toContain("SortBy=name");
    expect(upstreamUrl.toString()).toContain("SortDir=asc");
    expect(new Headers(requestInit?.headers).get("cookie")).toBe("jwt_token=project-list-access");
  });

  it("returns development mock projects without calling the .NET API", async () => {
    vi.stubEnv("USE_MOCK_API", "true");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(new Request("http://localhost:3000/api/v1/projects"));

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.items[0]).toMatchObject({ id: expect.any(String), name: expect.any(String) });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
