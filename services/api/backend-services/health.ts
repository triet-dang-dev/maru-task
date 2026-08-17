import { createBackendApiOperation } from "./client";

export const healthApiService = { get: createBackendApiOperation("GET", "/api/v1/health") };
