import { apiV1Path } from "@/utils/api-path";

export function buildAzureSignInUrl(): string {
  return apiV1Path("/auth/oidc/entra/start");
}
