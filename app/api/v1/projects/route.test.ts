// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

import { GET, POST } from "./route";

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

  it("creates a project by forwarding the request to the .NET projects API", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          success: true,
          errorCode: "",
          data: {
            projectId: 99,
            code: "NEW",
            name: "New project",
            description: "Created via API",
            status: "Active",
            createdAt: "2026-08-18T00:00:00Z",
            updatedAt: "2026-08-18T00:00:00Z",
          },
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      new Request("http://localhost:3000/api/v1/projects", {
        method: "POST",
        headers: { Cookie: "jwt_token=project-create-access", "Content-Type": "application/json" },
        body: JSON.stringify({
          code: "NEW",
          description: "Created via API",
          name: "New project",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      code: "NEW",
      createdAt: "2026-08-18T00:00:00Z",
      description: "Created via API",
      id: "99",
      name: "New project",
      status: "Active",
      updatedAt: "2026-08-18T00:00:00Z",
    });

    const [upstreamUrl, requestInit] = fetchMock.mock.calls[0];
    expect(upstreamUrl.toString()).toContain("/projects");
    expect(requestInit?.method).toBe("POST");
    expect(JSON.parse(String(requestInit?.body))).toMatchObject({
      code: "NEW",
      description: "Created via API",
      name: "New project",
    });
    expect(new Headers(requestInit?.headers).get("cookie")).toBe("jwt_token=project-create-access");
  });
});
