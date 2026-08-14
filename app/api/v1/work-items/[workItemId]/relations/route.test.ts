// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

const context = { params: Promise.resolve({ workItemId: "101" }) };

describe("work-item relations BFF route", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("maps browser relation input to the .NET work-package relation contract", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          success: true,
          errorCode: null,
          data: {
            createdAt: "2026-08-13T10:00:00Z",
            relationId: 301,
            relationType: "relates",
            sourceWorkPackageId: 101,
            targetWorkPackageId: 102,
          },
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      new Request("http://localhost:3000/api/v1/work-items/101/relations", {
        body: JSON.stringify({ relatedWorkItemId: "102", relationType: "relates" }),
        headers: {
          "Content-Type": "application/json",
          Cookie: "jwt_token=relation-access",
        },
        method: "POST",
      }),
      context,
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      createdAt: "2026-08-13T10:00:00Z",
      id: "301",
      relationType: "relates",
      sourceWorkItemId: "101",
      targetWorkItemId: "102",
    });
    const [upstreamUrl, requestInit] = fetchMock.mock.calls[0];
    expect(upstreamUrl.toString()).toContain("/work-packages/101/relations");
    expect(requestInit?.body).toBe(
      JSON.stringify({ relatedWorkPackageId: 102, relationType: "relates" }),
    );
    expect(requestInit?.method).toBe("POST");
    expect(new Headers(requestInit?.headers).get("cookie")).toBe("jwt_token=relation-access");
  });

  it("requires the relation type implemented by the backend validator", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      new Request("http://localhost:3000/api/v1/work-items/101/relations", {
        body: JSON.stringify({ relatedWorkItemId: "102" }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      }),
      context,
    );

    expect(response.status).toBe(422);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
