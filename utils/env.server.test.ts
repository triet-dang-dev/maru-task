// @vitest-environment node

import { describe, expect, it } from "vitest";

import { getServerEnv } from "./env.server";

describe("getServerEnv", () => {
  it("returns public values with server-only defaults", () => {
    expect(
      getServerEnv({
        NEXT_PUBLIC_API_BASE_URL: "https://api.example.com",
        NEXT_PUBLIC_APP_ENV: "test",
      }),
    ).toEqual({
      AUTH_COOKIE_NAME: "jwt_token",
      DOTNET_API_BASE_URL: "http://localhost:5000",
      DOTNET_API_TIMEOUT_MS: 15000,
      NEXT_PUBLIC_API_BASE_URL: "https://api.example.com",
      NEXT_PUBLIC_APP_ENV: "test",
      MOCK_AUTH: false,
      USE_MOCK_API: false,
    });
  });

  it("enables BFF mock responses when explicitly configured", () => {
    expect(getServerEnv({ USE_MOCK_API: "true" })).toMatchObject({ USE_MOCK_API: true });
  });

  it("enables mock auth only when explicitly configured", () => {
    expect(getServerEnv({ MOCK_AUTH: "true" })).toMatchObject({ MOCK_AUTH: true });
  });

  it("coerces the .NET timeout to a positive integer", () => {
    expect(
      getServerEnv({
        DOTNET_API_TIMEOUT_MS: "2000",
      }),
    ).toMatchObject({
      DOTNET_API_TIMEOUT_MS: 2000,
    });
  });
});
