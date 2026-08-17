import { createBackendApiOperation } from "./client";

export const timeEntriesApiService = {
  createForWorkPackage: createBackendApiOperation(
    "POST",
    "/api/v1/time-entries/work-packages/{workPackageId}",
  ),
  deleteForWorkPackage: createBackendApiOperation(
    "DELETE",
    "/api/v1/time-entries/work-packages/{workPackageId}/{timeEntryId}",
  ),
  listForActor: createBackendApiOperation("GET", "/api/v1/time-entries/actors/{actorUserId}"),
  listForProject: createBackendApiOperation("GET", "/api/v1/time-entries/projects/{projectId}"),
  listForWorkPackage: createBackendApiOperation(
    "GET",
    "/api/v1/time-entries/work-packages/{workPackageId}",
  ),
  updateForWorkPackage: createBackendApiOperation(
    "PATCH",
    "/api/v1/time-entries/work-packages/{workPackageId}/{timeEntryId}",
  ),
};
