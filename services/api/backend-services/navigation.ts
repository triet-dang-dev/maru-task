import { createBackendApiOperation } from "./client";

export const navigationApiService = { get: createBackendApiOperation("GET", "/api/v1/navigation") };
