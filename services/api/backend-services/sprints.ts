import { createBackendApiOperation } from "./client";

export const sprintsApiService = {
  create: createBackendApiOperation("POST", "/api/v1/projects/{projectId}/sprints"),
  delete: createBackendApiOperation("DELETE", "/api/v1/projects/{projectId}/sprints/{sprintId}"),
  get: createBackendApiOperation("GET", "/api/v1/projects/{projectId}/sprints/{sprintId}"),
  list: createBackendApiOperation("GET", "/api/v1/projects/{projectId}/sprints"),
  updatePatch: createBackendApiOperation(
    "PATCH",
    "/api/v1/projects/{projectId}/sprints/{sprintId}",
  ),
  updatePut: createBackendApiOperation("PUT", "/api/v1/projects/{projectId}/sprints/{sprintId}"),
};
