// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

import { DELETE, GET, PATCH, PUT } from "./route";

const context = { params: Promise.resolve({ workItemId: "101" }) };

describe("work-item detail BFF route", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("maps the .NET work-package detail envelope into a browser view model", async () => {
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
              workPackageId: 101,
              projectId: 42,
              projectName: "Migration",
              subject: "Map the work package API",
              description: "Define the BFF contract.",
              status: "Open",
              priority: "Normal",
              type: "Task",
              authorUserId: 4,
              author: "Morgan Chen",
              assigneeUserId: 7,
              assignee: "Jamie Lee",
              dueDate: null,
              parentSummary: null,
              relationCount: 2,
              commentCount: 1,
              createdAt: "2026-08-11T10:00:00Z",
              updatedAt: "2026-08-12T10:00:00Z",
            },
          }),
      }),
    );

    const response = await GET(new Request("http://localhost:3000/api/v1/work-items/101"), context);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      id: "101",
      projectId: "42",
      projectName: "Migration",
      subject: "Map the work package API",
      description: "Define the BFF contract.",
      status: "Open",
      priority: "Normal",
      type: "Task",
      authorUserId: "4",
      author: "Morgan Chen",
      assigneeUserId: "7",
      assignee: "Jamie Lee",
      dueDate: null,
      parentSummary: null,
      relationCount: 2,
      commentCount: 1,
      createdAt: "2026-08-11T10:00:00Z",
      updatedAt: "2026-08-12T10:00:00Z",
    });
  });

  it("forwards a partial browser edit as a .NET PATCH request", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ success: true, errorCode: null, data: {} }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await PATCH(
      new Request("http://localhost:3000/api/v1/work-items/101", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: "jwt_token=detail-access",
        },
        body: JSON.stringify({ description: "Updated contract.", subject: "Map the API boundary" }),
      }),
      context,
    );

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [upstreamUrl, requestInit] = fetchMock.mock.calls[0];
    expect(upstreamUrl.toString()).toContain("/work-packages/101");
    expect(requestInit?.method).toBe("PATCH");
    expect(new Headers(requestInit?.headers).get("cookie")).toBe("jwt_token=detail-access");
    expect(requestInit?.body).toBe(
      JSON.stringify({ description: "Updated contract.", subject: "Map the API boundary" }),
    );
  });

  it("maps the backend PUT alias through the specialized work-item adapter", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ success: true, errorCode: null, data: {} }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await PUT(
      new Request("http://localhost:3000/api/v1/work-items/101", {
        body: JSON.stringify({ subject: "Replace the complete work item" }),
        headers: { "Content-Type": "application/json" },
        method: "PUT",
      }),
      context,
    );

    expect(response.status).toBe(200);
    expect(fetchMock.mock.calls[0][1]?.method).toBe("PUT");
  });

  it("forwards a priority identifier as a .NET PATCH request", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ success: true, errorCode: null, data: {} }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await PATCH(
      new Request("http://localhost:3000/api/v1/work-items/101", {
        body: JSON.stringify({ priorityId: "3" }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      }),
      context,
    );

    expect(response.status).toBe(200);
    expect(fetchMock.mock.calls[0][1]?.body).toBe(JSON.stringify({ priorityId: 3 }));
  });

  it("forwards an assignee identifier as a .NET PATCH request", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ success: true, errorCode: null, data: {} }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await PATCH(
      new Request("http://localhost:3000/api/v1/work-items/101", {
        body: JSON.stringify({ assigneeUserId: "8" }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      }),
      context,
    );

    expect(response.status).toBe(200);
    expect(fetchMock.mock.calls[0][1]?.body).toBe(JSON.stringify({ assigneeUserId: 8 }));
  });

  it("forwards an ISO due date as a .NET PATCH request", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ success: true, errorCode: null, data: {} }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await PATCH(
      new Request("http://localhost:3000/api/v1/work-items/101", {
        body: JSON.stringify({ dueDate: "2026-09-01T00:00:00.000Z" }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      }),
      context,
    );

    expect(response.status).toBe(200);
    expect(fetchMock.mock.calls[0][1]?.body).toBe(
      JSON.stringify({ dueDate: "2026-09-01T00:00:00.000Z" }),
    );
  });

  it("accepts every mutable field implemented by the backend update contract", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);

    const response = await PATCH(
      new Request("http://localhost:3000/api/v1/work-items/101", {
        body: JSON.stringify({
          assigneeUserId: "8",
          description: "Complete mapping",
          dueDate: "2026-09-01T00:00:00Z",
          originalEstimateMinutes: 120,
          parentWorkPackageId: "99",
          priorityId: "3",
          remainingEstimateMinutes: 90,
          sprintId: "7",
          statusId: "2",
          storyPoint: 8,
          subject: "Mapped",
          timeSpentMinutes: 30,
          typeId: "1",
        }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      }),
      context,
    );

    expect(response.status).toBe(200);
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({
      assigneeUserId: 8,
      description: "Complete mapping",
      dueDate: "2026-09-01T00:00:00Z",
      originalEstimateMinutes: 120,
      parentWorkPackageId: 99,
      priorityId: 3,
      remainingEstimateMinutes: 90,
      sprintId: 7,
      statusId: 2,
      storyPoint: 8,
      subject: "Mapped",
      timeSpentMinutes: 30,
      typeId: 1,
    });
  });

  it("forwards a browser delete to the .NET work-package resource", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ success: true, errorCode: null, data: {} }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await DELETE(
      new Request("http://localhost:3000/api/v1/work-items/101", { method: "DELETE" }),
      context,
    );

    expect(response.status).toBe(204);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [upstreamUrl, requestInit] = fetchMock.mock.calls[0];
    expect(upstreamUrl.toString()).toContain("/work-packages/101");
    expect(requestInit?.method).toBe("DELETE");
  });
});
