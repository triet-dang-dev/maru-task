// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

const context = { params: Promise.resolve({ workItemId: "101" }) };

describe("work-item comments BFF route", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("maps browser comment input to the .NET work-package comment contract", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          success: true,
          errorCode: null,
          data: {
            authorUserId: 7,
            body: "The API boundary is ready for review.",
            commentId: 501,
            createdAt: "2026-08-13T09:30:00Z",
            isDeleted: false,
            updatedAt: null,
            workPackageId: 101,
          },
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      new Request("http://localhost:3000/api/v1/work-items/101/comments", {
        body: JSON.stringify({ body: "The API boundary is ready for review." }),
        headers: {
          "Content-Type": "application/json",
          Cookie: "jwt_token=comment-access",
        },
        method: "POST",
      }),
      context,
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      authorUserId: "7",
      body: "The API boundary is ready for review.",
      createdAt: "2026-08-13T09:30:00Z",
      id: "501",
      isDeleted: false,
      updatedAt: null,
      workItemId: "101",
    });
    const [upstreamUrl, requestInit] = fetchMock.mock.calls[0];
    expect(upstreamUrl.toString()).toContain("/work-packages/101/comments");
    expect(requestInit?.body).toBe(
      JSON.stringify({ body: "The API boundary is ready for review." }),
    );
    expect(requestInit?.method).toBe("POST");
    expect(new Headers(requestInit?.headers).get("cookie")).toBe("jwt_token=comment-access");
  });
});
