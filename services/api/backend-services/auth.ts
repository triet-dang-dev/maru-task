import { createBackendApiOperation } from "./client";

export const authApiService = {
  getCurrentUser: createBackendApiOperation("GET", "/api/auth/me"),
  loginWebApp: createBackendApiOperation("POST", "/api/auth/login/web-app"),
  logout: createBackendApiOperation("POST", "/api/auth/logout"),
  register: createBackendApiOperation("POST", "/api/auth/register"),
};
