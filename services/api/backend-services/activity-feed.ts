import { createBackendApiOperation } from "./client";

export const activityFeedApiService = {
  list: createBackendApiOperation("GET", "/api/v1/activity-feed"),
};
