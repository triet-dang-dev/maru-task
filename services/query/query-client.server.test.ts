// @vitest-environment node

import { describe, expect, it } from "vitest";

import { getQueryClient } from "./query-client";

describe("query client on the server", () => {
  it("returns a fresh QueryClient per server call", () => {
    expect(getQueryClient()).not.toBe(getQueryClient());
  });
});
