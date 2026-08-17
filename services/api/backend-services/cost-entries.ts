import { createBackendApiOperation } from "./client";

export const costEntriesApiService = {
  createForWorkPackage: createBackendApiOperation(
    "POST",
    "/api/v1/cost-entries/work-packages/{workPackageId}",
  ),
  deleteForWorkPackage: createBackendApiOperation(
    "DELETE",
    "/api/v1/cost-entries/work-packages/{workPackageId}/{costEntryId}",
  ),
  listForActor: createBackendApiOperation("GET", "/api/v1/cost-entries/actors/{actorUserId}"),
  listForProject: createBackendApiOperation("GET", "/api/v1/cost-entries/projects/{projectId}"),
  listForWorkPackage: createBackendApiOperation(
    "GET",
    "/api/v1/cost-entries/work-packages/{workPackageId}",
  ),
  updateForWorkPackage: createBackendApiOperation(
    "PATCH",
    "/api/v1/cost-entries/work-packages/{workPackageId}/{costEntryId}",
  ),
};
