import { createBackendApiOperation } from "./client";

export const projectDocumentsApiService = {
  create: createBackendApiOperation("POST", "/api/v1/projects/{projectId}/documents"),
  createUploadUrl: createBackendApiOperation(
    "POST",
    "/api/v1/projects/{projectId}/documents/upload-url",
  ),
  delete: createBackendApiOperation(
    "DELETE",
    "/api/v1/projects/{projectId}/documents/{documentId}",
  ),
  get: createBackendApiOperation("GET", "/api/v1/projects/{projectId}/documents/{documentId}"),
  list: createBackendApiOperation("GET", "/api/v1/projects/{projectId}/documents"),
};
