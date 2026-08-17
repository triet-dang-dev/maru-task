import { createBackendApiOperation } from "./client";

export const agileApiService = {
  getActiveSprintBoard: createBackendApiOperation("GET", "/api/v1/agile/sprints/active/board"),
  getBoard: createBackendApiOperation("GET", "/api/v1/agile/boards"),
  getSprintBurndown: createBackendApiOperation("GET", "/api/v1/agile/sprints/{sprintId}/burndown"),
  listBacklogs: createBackendApiOperation("GET", "/api/v1/agile/backlogs"),
  moveBoardItem: createBackendApiOperation("PATCH", "/api/v1/agile/boards/move"),
  reorderBacklogs: createBackendApiOperation("PATCH", "/api/v1/agile/backlogs/reorder"),
};
