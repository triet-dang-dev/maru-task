import { describe, expect, it } from "vitest";

import { buildAzureSignInUrl } from "./azure";

describe("Azure browser handoff", () => {
  it("starts a top-level navigation through the same-origin OIDC BFF", () => {
    expect(buildAzureSignInUrl()).toBe("/api/v1/auth/oidc/entra/start");
  });
});
