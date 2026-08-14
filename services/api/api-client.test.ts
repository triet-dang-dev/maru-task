import {
  AxiosError,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppApiError } from "./api-error";
import { createApiClient } from "./api-client";

function createResponse<TData>(
  config: InternalAxiosRequestConfig,
  data: TData,
  status = 200,
): AxiosResponse<TData> {
  return {
    config,
    data,
    headers: {},
    request: {},
    status,
    statusText: status >= 400 ? "Error" : "OK",
  };
}

function rejectWithStatus<TData>(
  config: InternalAxiosRequestConfig,
  status: number,
  data: TData,
  headers: Record<string, string> = {},
): never {
  const response = {
    ...createResponse(config, data, status),
    headers,
  };

  throw new AxiosError(
    `Request failed with status code ${status}`,
    undefined,
    config,
    {},
    response,
  );
}

describe("createApiClient", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("configures base URL, timeout, cookie credentials, and request IDs", async () => {
    const seenConfigs: InternalAxiosRequestConfig[] = [];
    const adapter: AxiosAdapter = async (config) => {
      seenConfigs.push(config);
      return createResponse(config, { ok: true });
    };
    const requestIdGenerator = vi.fn(() => "request-id-1");
    const apiClient = createApiClient({
      adapter,
      baseURL: "https://api.example.com",
      requestIdGenerator,
      timeout: 12_000,
    });

    await expect(apiClient.get("/health")).resolves.toMatchObject({
      data: { ok: true },
    });

    expect(apiClient.defaults.baseURL).toBe("https://api.example.com");
    expect(apiClient.defaults.timeout).toBe(12_000);
    expect(apiClient.defaults.withCredentials).toBe(true);
    expect(seenConfigs[0]?.headers.get("Authorization")).toBeUndefined();
    expect(seenConfigs[0]?.headers.get("X-Request-ID")).toBe("request-id-1");
    expect(requestIdGenerator).toHaveBeenCalledTimes(1);
  });

  it("normalizes API error responses into AppApiError", async () => {
    const adapter: AxiosAdapter = async (config) => {
      rejectWithStatus(
        config,
        422,
        {
          error: {
            code: "VALIDATION_ERROR",
            details: { field: "email" },
            message: "Email is invalid",
            requestId: "response-request-id",
          },
        },
        { "x-request-id": "header-request-id" },
      );
    };
    const apiClient = createApiClient({
      adapter,
      baseURL: "https://api.example.com",
      requestIdGenerator: () => "request-id-1",
    });

    await expect(apiClient.post("/users", { email: "bad" })).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      details: { field: "email" },
      message: "Email is invalid",
      requestId: "response-request-id",
      status: 422,
    });

    await expect(apiClient.post("/users", { email: "bad" })).rejects.toBeInstanceOf(AppApiError);
  });

  it("refreshes an expired cookie session and replays the original request", async () => {
    let sessionIsFresh = false;
    const adapter: AxiosAdapter = async (config) => {
      if (!sessionIsFresh) {
        rejectWithStatus(config, 401, {
          error: {
            code: "UNAUTHENTICATED",
            message: "Session expired",
          },
        });
      }

      return createResponse(config, { ok: true });
    };
    const refreshSession = vi.fn(async () => {
      sessionIsFresh = true;
      return true;
    });
    const apiClient = createApiClient({
      adapter,
      baseURL: "https://api.example.com",
      refreshSession,
      requestIdGenerator: () => "request-id-1",
    });

    await expect(apiClient.get("/profile")).resolves.toMatchObject({
      data: { ok: true },
    });

    expect(refreshSession).toHaveBeenCalledTimes(1);
  });

  it("uses one refresh request for parallel 401 responses and replays the queued requests", async () => {
    let sessionIsFresh = false;
    const replayedUrls: string[] = [];
    const adapter: AxiosAdapter = async (config) => {
      if (!sessionIsFresh) {
        rejectWithStatus(config, 401, {
          error: {
            code: "UNAUTHENTICATED",
            message: "Session expired",
          },
        });
      }

      replayedUrls.push(config.url ?? "");
      return createResponse(config, { url: config.url });
    };
    const refreshSession = vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      sessionIsFresh = true;
      return true;
    });
    const apiClient = createApiClient({
      adapter,
      baseURL: "https://api.example.com",
      refreshSession,
      requestIdGenerator: () => "request-id-1",
    });

    const [first, second] = await Promise.all([apiClient.get("/first"), apiClient.get("/second")]);

    expect(first.data).toEqual({ url: "/first" });
    expect(second.data).toEqual({ url: "/second" });
    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(replayedUrls).toEqual(["/first", "/second"]);
  });

  it("rejects queued requests when cookie refresh fails", async () => {
    const adapter: AxiosAdapter = async (config) => {
      rejectWithStatus(config, 401, {
        error: {
          code: "UNAUTHENTICATED",
          message: "Session expired",
        },
      });
    };
    const refreshSession = vi.fn(async () => {
      throw new AppApiError({
        code: "UNAUTHENTICATED",
        message: "Refresh failed",
        status: 401,
      });
    });
    const apiClient = createApiClient({
      adapter,
      baseURL: "https://api.example.com",
      refreshSession,
      requestIdGenerator: () => "request-id-1",
    });

    const [first, second] = await Promise.allSettled([
      apiClient.get("/first"),
      apiClient.get("/second"),
    ]);

    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(first.status).toBe("rejected");
    expect(second.status).toBe("rejected");
    if (first.status === "rejected" && second.status === "rejected") {
      expect(first.reason).toMatchObject({
        code: "AUTH_REFRESH_FAILED",
        message: "Unable to refresh the session. Please sign in again.",
        status: 401,
      });
      expect(second.reason).toMatchObject({
        code: "AUTH_REFRESH_FAILED",
        message: "Unable to refresh the session. Please sign in again.",
        status: 401,
      });
    }
  });

  it("announces session expiry when a replay remains unauthorized", async () => {
    const expiredListener = vi.fn();
    window.addEventListener("maru:session-expired", expiredListener, { once: true });
    const adapter: AxiosAdapter = async (config) => {
      rejectWithStatus(config, 401, {
        error: { code: "UNAUTHENTICATED", message: "Session expired" },
      });
    };
    const apiClient = createApiClient({
      adapter,
      baseURL: "https://api.example.com",
      refreshSession: async () => true,
      requestIdGenerator: () => "request-id-1",
    });

    await expect(apiClient.get("/profile")).rejects.toBeInstanceOf(AppApiError);
    expect(expiredListener).toHaveBeenCalledTimes(1);
  });
});
