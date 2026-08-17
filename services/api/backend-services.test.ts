// @vitest-environment node

import { readFileSync } from "node:fs";

import { afterEach, describe, expect, it, vi } from "vitest";

import { costEntriesApiService } from "./backend-services/cost-entries";
import { backendApiServices } from "./backend-services/index";
import { projectDocumentsApiService } from "./backend-services/project-documents";

const httpMethods = ["get", "post", "put", "patch", "delete"] as const;

function normalizePath(path: string) {
  const backendPath =
    path === "/api/v1/health"
      ? "/api/health"
      : path.replace(/^\/api\/v1/, "").replace(/^\/api\/auth/, "/auth");

  return backendPath.replace("/work-items", "/work-packages").replace(/\{[^}]+\}/g, "{}");
}

describe("backend API services", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("builds a project document request from its mapped endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ items: [] }), {
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await projectDocumentsApiService.list<{ items: unknown[] }>({
      pathParams: { projectId: 42 },
      query: { Search: "road map", Take: 25 },
    });

    expect(result).toEqual({ items: [] });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/projects/42/documents?Search=road+map&Take=25",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("serializes write payloads for mapped cost-entry endpoints", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await costEntriesApiService.createForWorkPackage({
      body: { amount: 120 },
      pathParams: { workPackageId: 42 },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/cost-entries/work-packages/42",
      expect.objectContaining({
        body: JSON.stringify({ amount: 120 }),
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        method: "POST",
      }),
    );
  });

  it("provides one concrete service method for every OpenAPI operation, grouped by tag", () => {
    const openApi = JSON.parse(
      readFileSync(new URL("../../be-integrate.json", import.meta.url), "utf8"),
    ) as {
      paths: Record<string, Record<string, { tags?: string[] }>>;
      tags: Array<{ name: string }>;
    };
    const mappedOperations = Object.values(backendApiServices)
      .flatMap((service) => Object.values(service))
      .map((operation) => `${operation.method} ${normalizePath(operation.path)}`)
      .sort();
    const openApiOperations = Object.entries(openApi.paths)
      .flatMap(([path, operations]) =>
        httpMethods
          .filter((method) => method in operations)
          .map((method) => `${method.toUpperCase()} ${normalizePath(path)}`),
      )
      .sort();

    expect(Object.keys(backendApiServices).sort()).toEqual(
      openApi.tags.map(({ name }) => name).sort(),
    );
    expect(mappedOperations).toEqual(openApiOperations);
  });
});
