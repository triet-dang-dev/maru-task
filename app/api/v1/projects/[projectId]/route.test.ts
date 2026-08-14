// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

describe("project detail BFF route", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("returns a mock project detail without calling .NET in development mock mode", async () => {
    vi.stubEnv("USE_MOCK_API", "true");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(new Request("http://localhost:3000/api/v1/projects/42"), {
      params: Promise.resolve({ projectId: "42" }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      code: "MIG",
      createdAt: expect.any(String),
      id: "42",
      name: "Next.js migration",
      status: "Active",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards the browser session cookie to the protected .NET project endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          success: true,
          data: {
            code: "MIG",
            description: "Migration project",
            name: "Migration",
            projectId: 42,
            status: "Active",
            createdAt: "2026-08-01T10:00:00Z",
            updatedAt: "2026-08-12T10:00:00Z",
          },
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(
      new Request("http://localhost:3000/api/v1/projects/42", {
        headers: { Cookie: "jwt_token=project-detail-access" },
      }),
      { params: Promise.resolve({ projectId: "42" }) },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      createdAt: "2026-08-01T10:00:00Z",
      id: "42",
    });
    const [, requestInit] = fetchMock.mock.calls[0];
    expect(new Headers(requestInit?.headers).get("cookie")).toBe("jwt_token=project-detail-access");
  });
});
