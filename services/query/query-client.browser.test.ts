import { describe, expect, it } from "vitest";

import { getQueryClient, makeQueryClient } from "./query-client";

describe("query client in the browser", () => {
  it("returns a stable browser QueryClient instance", () => {
    expect(getQueryClient()).toBe(getQueryClient());
  });

  it("configures sane default query options", () => {
    const queryClient = makeQueryClient();
    const defaults = queryClient.getDefaultOptions().queries;

    expect(defaults?.staleTime).toBe(60 * 1000);
    expect(defaults?.gcTime).toBe(5 * 60 * 1000);
    expect(defaults?.retry).toBe(1);
    expect(defaults?.refetchOnWindowFocus).toBe(false);
  });
});
