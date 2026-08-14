// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

import { GET, POST } from "./route";

describe("project sprints BFF route", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("maps the .NET sprint page into a stable browser view model", async () => {
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
                sprintId: 7,
                projectId: 42,
                name: "September delivery",
                statusId: 2,
                status: "Active",
                startDate: "2026-09-01T00:00:00Z",
                endDate: "2026-09-14T00:00:00Z",
                createdAt: "2026-08-13T10:00:00Z",
              },
            ],
            totalCount: 1,
            page: 1,
            pageSize: 25,
          },
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(
      new Request(
        "http://localhost:3000/api/v1/projects/42/sprints?take=25&lastSprintId=7&cursorAction=previous",
      ),
      { params: Promise.resolve({ projectId: "42" }) },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      items: [
        {
          endDate: "2026-09-14T00:00:00Z",
          id: "7",
          name: "September delivery",
          projectId: "42",
          startDate: "2026-09-01T00:00:00Z",
          status: "Active",
          statusId: 2,
          createdAt: "2026-08-13T10:00:00Z",
        },
      ],
      page: 1,
      pageSize: 25,
      total: 1,
    });

    const upstreamUrl = new URL(fetchMock.mock.calls[0][0]);
    expect(upstreamUrl.searchParams.get("Take")).toBe("25");
    expect(upstreamUrl.searchParams.get("LastSprintId")).toBe("7");
    expect(upstreamUrl.searchParams.get("CursorAction")).toBe("previous");
    expect(upstreamUrl.searchParams.has("Page")).toBe(false);
  });

  it("rejects an invalid project identifier before making an upstream request", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(new Request("http://localhost:3000/api/v1/projects/nope/sprints"), {
      params: Promise.resolve({ projectId: "nope" }),
    });

    expect(response.status).toBe(422);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps mock sprint items aligned with the real browser response", async () => {
    vi.stubEnv("USE_MOCK_API", "true");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(new Request("http://localhost:3000/api/v1/projects/42/sprints"), {
      params: Promise.resolve({ projectId: "42" }),
    });

    expect(response.status).toBe(200);
    expect((await response.json()).items[0]).toMatchObject({
      createdAt: expect.any(String),
      projectId: "42",
      statusId: expect.any(Number),
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps browser sprint create input to the documented upstream contract", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          success: true,
          data: {
            sprintId: 22,
            projectId: 42,
            name: "October sprint",
            status: "Planned",
            startDate: "2026-10-01T00:00:00Z",
            endDate: "2026-10-15T00:00:00Z",
            createdAt: "2026-09-25T09:00:00Z",
          },
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      new Request("http://localhost:3000/api/v1/projects/42/sprints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: "jwt_token=sprint-access",
        },
        body: JSON.stringify({
          name: "October sprint",
          startDate: "2026-10-01T00:00:00Z",
          endDate: "2026-10-15T00:00:00Z",
        }),
      }),
      { params: Promise.resolve({ projectId: "42" }) },
    );

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [upstreamUrl, requestInit] = fetchMock.mock.calls[0];
    expect(upstreamUrl.toString()).toContain("/projects/42/sprints");
    expect(requestInit?.method).toBe("POST");
    expect(new Headers(requestInit?.headers).get("cookie")).toBe("jwt_token=sprint-access");
    expect(JSON.parse(String(requestInit?.body))).toEqual({
      endDate: "2026-10-15T00:00:00Z",
      name: "October sprint",
      startDate: "2026-10-01T00:00:00Z",
    });
  });

  it("rejects sprint create when end date is earlier than start date", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      new Request("http://localhost:3000/api/v1/projects/42/sprints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Bad sprint",
          startDate: "2026-10-15T00:00:00Z",
          endDate: "2026-10-01T00:00:00Z",
        }),
      }),
      { params: Promise.resolve({ projectId: "42" }) },
    );

    expect(response.status).toBe(422);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects equal sprint dates because the backend requires endDate to be later", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      new Request("http://localhost:3000/api/v1/projects/42/sprints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Zero-length sprint",
          startDate: "2026-10-15T00:00:00Z",
          endDate: "2026-10-15T00:00:00Z",
        }),
      }),
      { params: Promise.resolve({ projectId: "42" }) },
    );

    expect(response.status).toBe(422);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
