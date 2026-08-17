import { createBackendApiOperation } from "./client";

export const workPackagesApiService = {
  addAttachment: createBackendApiOperation("POST", "/api/v1/work-items/{workItemId}/attachments"),
  addLabel: createBackendApiOperation("POST", "/api/v1/work-items/{workItemId}/labels"),
  addWatcher: createBackendApiOperation("POST", "/api/v1/work-items/{workItemId}/watchers"),
  create: createBackendApiOperation("POST", "/api/v1/work-items"),
  createAttachmentUploadUrl: createBackendApiOperation(
    "POST",
    "/api/v1/work-items/{workItemId}/attachments/upload-url",
  ),
  createComment: createBackendApiOperation("POST", "/api/v1/work-items/{workItemId}/comments"),
  createRelation: createBackendApiOperation("POST", "/api/v1/work-items/{workItemId}/relations"),
  delete: createBackendApiOperation("DELETE", "/api/v1/work-items/{workItemId}"),
  deleteAttachment: createBackendApiOperation(
    "DELETE",
    "/api/v1/work-items/{workItemId}/attachments/{attachmentId}",
  ),
  deleteComment: createBackendApiOperation(
    "DELETE",
    "/api/v1/work-items/{workItemId}/comments/{commentId}",
  ),
  deleteLabel: createBackendApiOperation(
    "DELETE",
    "/api/v1/work-items/{workItemId}/labels/{labelId}",
  ),
  deleteRelation: createBackendApiOperation(
    "DELETE",
    "/api/v1/work-items/{workItemId}/relations/{relationId}",
  ),
  get: createBackendApiOperation("GET", "/api/v1/work-items/{workItemId}"),
  list: createBackendApiOperation("GET", "/api/v1/work-items"),
  removeWatcher: createBackendApiOperation(
    "DELETE",
    "/api/v1/work-items/{workItemId}/watchers/{userId}",
  ),
  updateCommentPatch: createBackendApiOperation(
    "PATCH",
    "/api/v1/work-items/{workItemId}/comments/{commentId}",
  ),
  updateCommentPut: createBackendApiOperation(
    "PUT",
    "/api/v1/work-items/{workItemId}/comments/{commentId}",
  ),
  updatePatch: createBackendApiOperation("PATCH", "/api/v1/work-items/{workItemId}"),
  updatePut: createBackendApiOperation("PUT", "/api/v1/work-items/{workItemId}"),
};
