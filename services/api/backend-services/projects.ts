import { createBackendApiOperation } from "./client";

export const projectsApiService = {
  addMember: createBackendApiOperation("POST", "/api/v1/projects/{projectId}/members"),
  get: createBackendApiOperation("GET", "/api/v1/projects/{projectId}"),
  list: createBackendApiOperation("GET", "/api/v1/projects"),
  listMembers: createBackendApiOperation("GET", "/api/v1/projects/{projectId}/members"),
  removeMember: createBackendApiOperation(
    "DELETE",
    "/api/v1/projects/{projectId}/members/{userId}",
  ),
  updateMember: createBackendApiOperation("PATCH", "/api/v1/projects/{projectId}/members/{userId}"),
};
