import { describe, expect, it } from "vitest";

import { API_V1_PREFIX, apiV1Path } from "./api-path";

describe("apiV1Path", () => {
  it("builds frontend API paths from the centralized v1 prefix", () => {
    expect(API_V1_PREFIX).toBe("/api/v1");
    expect(apiV1Path("/auth/me")).toBe("/api/v1/auth/me");
    expect(apiV1Path("/projects/{projectId}/sprints")).toBe("/api/v1/projects/{projectId}/sprints");
  });
});
