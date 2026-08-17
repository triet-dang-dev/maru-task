import { createBackendApiOperation } from "./client";

export const usersApiService = {
  delete: createBackendApiOperation("DELETE", "/api/v1/users/{userId}"),
  get: createBackendApiOperation("GET", "/api/v1/users/{userId}"),
  invite: createBackendApiOperation("POST", "/api/v1/users/invite"),
  list: createBackendApiOperation("GET", "/api/v1/users"),
  update: createBackendApiOperation("PUT", "/api/v1/users/{userId}"),
};
