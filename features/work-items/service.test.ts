import { describe, expect, it, vi } from "vitest";

import { createWorkItem } from "./service";

describe("work-items service", () => {
  it("posts a new work item to the BFF endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await createWorkItem({ projectId: "42", title: "New item" });

    expect(result).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/v1/work-items");
    expect(init?.method).toBe("POST");
    expect(init?.body).toContain("New item");
  });
});
