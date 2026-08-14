// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

describe("priorities BFF route", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns the static priority catalog", async () => {
    const response = await GET(new Request("http://localhost:3000/api/v1/priorities"));

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.items).toEqual([
      { id: 1, name: "Low" },
      { id: 2, name: "Normal" },
      { id: 3, name: "High" },
      { id: 4, name: "Urgent" },
    ]);
    expect(payload.total).toBe(4);
  });

  it("returns development mock priorities without calling the .NET API", async () => {
    vi.stubEnv("USE_MOCK_API", "true");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(new Request("http://localhost:3000/api/v1/priorities"));

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.items.length).toBeGreaterThan(0);
    expect(payload.items[0]).toMatchObject({ id: expect.any(Number), name: expect.any(String) });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
