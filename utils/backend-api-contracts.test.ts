// @vitest-environment node

import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { backendApiContracts } from "./backend-api-contracts";

describe("backendApiContracts", () => {
  it("inventories every .NET controller method/path contract", () => {
    expect(backendApiContracts).toHaveLength(73);

    const countsByDomain = backendApiContracts.reduce<Record<string, number>>(
      (counts, contract) => ({
        ...counts,
        [contract.domain]: (counts[contract.domain] ?? 0) + 1,
      }),
      {},
    );
    expect(countsByDomain).toEqual({
      activityFeed: 1,
      agile: 6,
      authentication: 7,
      costEntries: 6,
      health: 1,
      navigation: 1,
      notifications: 3,
      projects: 6,
      reports: 1,
      search: 1,
      sprints: 6,
      timeEntries: 6,
      users: 5,
      wiki: 4,
      workItems: 19,
    });
  });

  it("contains no duplicate backend or frontend method/path contracts", () => {
    const backendKeys = backendApiContracts.map(
      ({ backendPath, method }) => `${method} ${backendPath}`,
    );
    const frontendKeys = backendApiContracts.map(
      ({ frontendPath, method }) => `${method} ${frontendPath}`,
    );

    expect(new Set(backendKeys).size).toBe(backendKeys.length);
    expect(new Set(frontendKeys).size).toBe(frontendKeys.length);
  });

  it("maps every non-auth passthrough contract below the same-origin /api/v1 boundary", () => {
    const passthroughContracts = backendApiContracts.filter(
      (contract) => contract.transport === "passthrough",
    );

    expect(passthroughContracts).toHaveLength(51);
    expect(
      passthroughContracts.every((contract) => contract.frontendPath.startsWith("/api/v1/")),
    ).toBe(true);
  });

  it("keeps the documented transport and UI coverage totals stable", () => {
    const countBy = (field: "transport" | "ui") =>
      Object.fromEntries(
        Object.entries(
          backendApiContracts.reduce<Record<string, number>>((counts, contract) => {
            const value = contract[field];
            counts[value] = (counts[value] ?? 0) + 1;
            return counts;
          }, {}),
        ).sort(([left], [right]) => left.localeCompare(right)),
      );

    expect(countBy("transport")).toEqual({ passthrough: 51, specialized: 22 });
    expect(countBy("ui")).toEqual({
      "adapter-only": 3,
      infrastructure: 1,
      "live-ui": 19,
      "no-ui": 45,
      "ui-not-integrated": 5,
    });
  });

  it("keeps every backend endpoint visible in the frontend coverage document", () => {
    const coverageDocument = readFileSync(
      new URL("../docs/specs/backend-api-coverage.md", import.meta.url),
      "utf8",
    );

    backendApiContracts.forEach((contract) => {
      expect(coverageDocument).toContain(`\`${contract.id}\``);
    });
  });
});
