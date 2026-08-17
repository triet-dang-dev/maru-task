import { createBackendApiOperation } from "./client";

export const wikiPagesApiService = {
  create: createBackendApiOperation("POST", "/api/v1/projects/{projectId}/wiki/pages"),
  get: createBackendApiOperation("GET", "/api/v1/projects/{projectId}/wiki/pages/{slug}"),
  list: createBackendApiOperation("GET", "/api/v1/projects/{projectId}/wiki/pages"),
  update: createBackendApiOperation("PATCH", "/api/v1/projects/{projectId}/wiki/pages/{slug}"),
};
