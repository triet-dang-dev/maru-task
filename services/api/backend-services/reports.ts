import { createBackendApiOperation } from "./client";

export const reportsApiService = {
  getProjectTimeCost: createBackendApiOperation(
    "GET",
    "/api/v1/reports/projects/{projectId}/time-cost",
  ),
};
