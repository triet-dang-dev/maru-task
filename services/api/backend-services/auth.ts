import { createBackendApiOperation } from "./client";

export const authApiService = {
  getCurrentUser: createBackendApiOperation("GET", "/api/v1/auth/me"),
  loginWebApp: createBackendApiOperation("POST", "/api/v1/auth/login/web-app"),
  logout: createBackendApiOperation("POST", "/api/v1/auth/logout"),
  register: createBackendApiOperation("POST", "/api/v1/auth/register"),
};
