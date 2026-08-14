import { z } from "zod";

import { getPublicEnv, type PublicEnv } from "./env";

type EnvSource = Record<string, string | undefined>;

const serverOnlyEnvSchema = z.object({
  AUTH_COOKIE_NAME: z.string().default("jwt_token"),
  DOTNET_API_BASE_URL: z.string().url().default("http://localhost:5000"),
  DOTNET_API_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  MOCK_AUTH: z.stringbool().default(false),
  USE_MOCK_API: z.stringbool().default(process.env.NODE_ENV === "development"),
});

export type ServerEnv = PublicEnv & z.infer<typeof serverOnlyEnvSchema>;

function formatEnvError(error: z.ZodError) {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "env";
      return `${path}: ${issue.message}`;
    })
    .join("; ");
}

function pickServerEnv(source: EnvSource) {
  return {
    AUTH_COOKIE_NAME: source.AUTH_COOKIE_NAME,
    DOTNET_API_BASE_URL: source.DOTNET_API_BASE_URL,
    DOTNET_API_TIMEOUT_MS: source.DOTNET_API_TIMEOUT_MS,
    MOCK_AUTH: source.MOCK_AUTH,
    USE_MOCK_API: source.USE_MOCK_API,
  };
}

function getDefaultServerEnvSource(): EnvSource {
  return {
    AUTH_COOKIE_NAME: process.env.AUTH_COOKIE_NAME,
    DOTNET_API_BASE_URL: process.env.DOTNET_API_BASE_URL,
    DOTNET_API_TIMEOUT_MS: process.env.DOTNET_API_TIMEOUT_MS,
    MOCK_AUTH: process.env.MOCK_AUTH,
    USE_MOCK_API: process.env.USE_MOCK_API,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  };
}

export function getServerEnv(source?: EnvSource): ServerEnv {
  if (typeof window !== "undefined") {
    throw new Error("getServerEnv can only be called from server-side code.");
  }

  const envSource = source ?? getDefaultServerEnvSource();
  const parsed = serverOnlyEnvSchema.safeParse(pickServerEnv(envSource));

  if (!parsed.success) {
    throw new Error(`Invalid server environment variables: ${formatEnvError(parsed.error)}`);
  }

  return {
    ...getPublicEnv(envSource),
    ...parsed.data,
  };
}
