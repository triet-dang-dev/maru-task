// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

const context = { params: Promise.resolve({ workItemId: "101" }) };

describe("work-item attachments BFF route", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("maps uploaded attachment metadata to the .NET work-package attachment contract", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          success: true,
          errorCode: null,
          data: {
            attachmentId: 601,
            contentType: "application/pdf",
            fileName: "migration-plan.pdf",
            linkedAt: "2026-08-13T10:30:00Z",
            linkedByUserId: 7,
            sizeInBytes: 2048,
            storagePath: "work-items/101/migration-plan.pdf",
            workPackageId: 101,
          },
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const input = {
      contentType: "application/pdf",
      fileName: "migration-plan.pdf",
      sizeInBytes: 2048,
      storagePath: "work-items/101/migration-plan.pdf",
    };
    const response = await POST(
      new Request("http://localhost:3000/api/v1/work-items/101/attachments", {
        body: JSON.stringify(input),
        headers: {
          "Content-Type": "application/json",
          Cookie: "jwt_token=attachment-access",
        },
        method: "POST",
      }),
      context,
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      contentType: "application/pdf",
      fileName: "migration-plan.pdf",
      id: "601",
      linkedAt: "2026-08-13T10:30:00Z",
      linkedByUserId: "7",
      sizeInBytes: 2048,
      storagePath: "work-items/101/migration-plan.pdf",
      workItemId: "101",
    });
    const [upstreamUrl, requestInit] = fetchMock.mock.calls[0];
    expect(upstreamUrl.toString()).toContain("/work-packages/101/attachments");
    expect(requestInit?.body).toBe(JSON.stringify(input));
    expect(requestInit?.method).toBe("POST");
    expect(new Headers(requestInit?.headers).get("cookie")).toBe("jwt_token=attachment-access");
  });

  it("rejects an empty attachment because the backend requires a positive size", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      new Request("http://localhost:3000/api/v1/work-items/101/attachments", {
        body: JSON.stringify({
          contentType: "text/plain",
          fileName: "empty.txt",
          sizeInBytes: 0,
          storagePath: "work-items/101/empty.txt",
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      }),
      context,
    );

    expect(response.status).toBe(422);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
