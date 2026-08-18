import { createBackendApiOperation } from "./client";

export const oidcApiService = {
  callback: createBackendApiOperation("GET", "/api/v1/auth/oidc/{provider}/callback"),
  start: createBackendApiOperation("GET", "/api/v1/auth/oidc/{provider}/start"),
};
