import { describe, expect, it } from "vitest";

import { resolvePassthroughBackendEndpoint } from "./backend-endpoint-resolver";

describe("resolvePassthroughBackendEndpoint", () => {
  it("resolves a direct backend path", () => {
    expect(resolvePassthroughBackendEndpoint("GET", "/api/v1/activity-feed")).toMatchObject({
      backendPath: "/activity-feed",
      id: "activity-feed.list",
    });
  });

  it("maps the frontend work-item alias to the backend work-package path", () => {
    expect(
      resolvePassthroughBackendEndpoint("DELETE", "/api/v1/work-items/12/labels/9"),
    ).toMatchObject({
      backendPath: "/work-packages/12/labels/9",
      id: "work-items.labels.remove",
    });
  });

  it("maps project and sprint identifiers without changing their order", () => {
    expect(
      resolvePassthroughBackendEndpoint("PATCH", "/api/v1/projects/42/sprints/8"),
    ).toMatchObject({
      backendPath: "/projects/42/sprints/8",
      id: "sprints.update.patch",
    });
  });

  it("accepts a wiki slug while keeping numeric identifiers strict", () => {
    expect(
      resolvePassthroughBackendEndpoint("GET", "/api/v1/projects/42/wiki/pages/getting-started"),
    ).toMatchObject({
      backendPath: "/projects/42/wiki/pages/getting-started",
      id: "wiki.detail",
    });
  });

  it("rejects unsupported methods, invalid identifiers, and specialized routes", () => {
    expect(resolvePassthroughBackendEndpoint("POST", "/api/v1/activity-feed")).toBeNull();
    expect(resolvePassthroughBackendEndpoint("GET", "/api/v1/projects/0/members")).toBeNull();
    expect(
      resolvePassthroughBackendEndpoint("GET", "/api/v1/projects/not-a-number/members"),
    ).toBeNull();
    expect(resolvePassthroughBackendEndpoint("GET", "/api/v1/projects")).toBeNull();
  });
});
