import { createBackendApiOperation } from "./client";

export const oidcApiService = {
  callback: createBackendApiOperation("GET", "/api/auth/oidc/{provider}/callback"),
  start: createBackendApiOperation("GET", "/api/auth/oidc/{provider}/start"),
};
