import { describe, expect, it } from "vitest";

import { getPublicEnv } from "./env";

describe("getPublicEnv", () => {
  it("returns safe local defaults for optional public values", () => {
    expect(getPublicEnv({})).toEqual({
      NEXT_PUBLIC_API_BASE_URL: "/api",
      NEXT_PUBLIC_APP_ENV: "development",
    });
  });

  it("accepts a root-relative same-origin API base URL", () => {
    expect(getPublicEnv({ NEXT_PUBLIC_API_BASE_URL: "/api" })).toMatchObject({
      NEXT_PUBLIC_API_BASE_URL: "/api",
    });
  });

  it("rejects invalid public URLs", () => {
    expect(() =>
      getPublicEnv({
        NEXT_PUBLIC_API_BASE_URL: "not-a-url",
      }),
    ).toThrow("NEXT_PUBLIC_API_BASE_URL");
  });
});
