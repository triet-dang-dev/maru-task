import { createBackendApiOperation } from "./client";

export const searchApiService = { search: createBackendApiOperation("GET", "/api/v1/search") };
