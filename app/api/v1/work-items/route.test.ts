// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

import { GET, POST } from "./route";

describe("work-items BFF route", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("maps the .NET work-package envelope into the browser work-item view model", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            success: true,
            errorCode: null,
            data: {
              items: [
                {
                  workPackageId: 101,
                  projectId: 42,
                  projectName: "Migration",
                  subject: "Map the work package API",
                  status: "Open",
                  priority: "Normal",
                  assigneeUserId: null,
                  assignee: null,
                  updatedAt: "2026-08-12T10:00:00Z",
                },
              ],
              totalCount: 1,
              page: 1,
              pageSize: 25,
            },
          }),
      }),
    );

    const response = await GET(new Request("http://localhost:3000/api/v1/work-items?projectId=42"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      items: [
        {
          assignee: "",
          assigneeUserId: null,
          id: "101",
          priority: "Normal",
          projectId: "42",
          projectName: "Migration",
          status: "Open",
          subject: "Map the work package API",
          updatedAt: "2026-08-12T10:00:00Z",
        },
      ],
      page: 1,
      pageSize: 25,
      total: 1,
    });
  });

  it("returns development mock work items without calling the .NET API", async () => {
    vi.stubEnv("USE_MOCK_API", "true");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(new Request("http://localhost:3000/api/v1/work-items?projectId=42"));

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.items[0]).toMatchObject({
      assigneeUserId: null,
      priority: expect.any(String),
      projectId: "42",
      projectName: expect.any(String),
      subject: expect.any(String),
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards the documented work-package query parameters to the upstream API", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          success: true,
          data: { items: [], totalCount: 0, page: 1, pageSize: 10 },
        }),
    });

    vi.stubGlobal("fetch", fetchMock);

    await GET(
      new Request(
        "http://localhost:3000/api/v1/work-items?projectId=42&take=10&lastWorkPackageId=101&cursorAction=next&status=Open&assignee=7&sortBy=updatedAt&sortDir=asc",
      ),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [upstreamUrl] = fetchMock.mock.calls[0];
    expect(upstreamUrl.toString()).toContain("/work-packages");
    expect(upstreamUrl.toString()).toContain("ProjectId=42");
    expect(upstreamUrl.toString()).toContain("Take=10");
    expect(upstreamUrl.toString()).toContain("LastWorkPackageId=101");
    expect(upstreamUrl.toString()).toContain("CursorAction=next");
    expect(upstreamUrl.toString()).toContain("Status=Open");
    expect(upstreamUrl.toString()).toContain("Assignee=7");
    expect(upstreamUrl.toString()).toContain("SortBy=updatedAt");
    expect(upstreamUrl.toString()).toContain("SortDir=asc");
    expect(upstreamUrl.toString()).not.toContain("Page=");
  });

  it("returns a stable gateway error when the upstream API is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("connect ECONNREFUSED")));

    const response = await GET(new Request("http://localhost:3000/api/v1/work-items?projectId=42"));

    expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({
      error: "upstream_work_items_unavailable",
      message: "The .NET API could not process the work item request.",
      requestId: expect.any(String),
    });
  });

  it("maps the browser create input to the .NET work-package request", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ success: true, data: { workPackageId: 101 } }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      new Request("http://localhost:3000/api/v1/work-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: "jwt_token=work-item-access",
        },
        body: JSON.stringify({
          assigneeUserId: "7",
          description: "Full backend contract",
          dueDate: "2026-09-01T00:00:00Z",
          originalEstimateMinutes: 120,
          parentWorkPackageId: "100",
          priorityId: "3",
          projectId: "42",
          remainingEstimateMinutes: 90,
          sprintId: "9",
          statusId: "2",
          storyPoint: 5,
          subject: "New item",
          timeSpentMinutes: 30,
          typeId: "1",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [upstreamUrl, requestInit] = fetchMock.mock.calls[0];
    expect(upstreamUrl.toString()).toContain("/work-packages");
    expect(requestInit?.method).toBe("POST");
    expect(new Headers(requestInit?.headers).get("cookie")).toBe("jwt_token=work-item-access");
    expect(JSON.parse(String(requestInit?.body))).toEqual({
      assigneeUserId: 7,
      description: "Full backend contract",
      dueDate: "2026-09-01T00:00:00Z",
      originalEstimateMinutes: 120,
      parentWorkPackageId: 100,
      priorityId: 3,
      projectId: 42,
      remainingEstimateMinutes: 90,
      sprintId: 9,
      statusId: 2,
      storyPoint: 5,
      subject: "New item",
      timeSpentMinutes: 30,
      typeId: 1,
    });
  });

  it.each([
    [401, "unauthorized", "Your session is not authorized to access work items."],
    [403, "forbidden", "You do not have permission to access work items."],
    [409, "concurrency_conflict", "The work item changed before the request could be completed."],
    [422, "validation_failed", "The work item request is invalid."],
  ])("maps upstream %s to a stable BFF error contract", async (status, error, message) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status,
        text: async () => JSON.stringify({ message: "upstream validation failed" }),
      }),
    );

    const response = await POST(
      new Request("http://localhost:3000/api/v1/work-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Bad item", projectId: "42" }),
      }),
    );

    expect(response.status).toBe(status);
    const payload = await response.json();

    expect(payload).toMatchObject({
      error,
      message,
    });
    expect(payload.requestId).toEqual(expect.any(String));
  });
});
