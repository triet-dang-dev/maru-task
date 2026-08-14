import axios, {
  AxiosHeaders,
  type AxiosAdapter,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

import { getPublicEnv } from "@/utils/env";

import { createAuthRefreshError, normalizeApiError } from "./api-error";
import { requestTokenRefresh, type RefreshSession } from "./refresh-token";
import { notifySessionExpired } from "./session-fetch";

const DEFAULT_TIMEOUT_MS = 15_000;

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  __isRetryRequest?: boolean;
}

interface RefreshSessionContext {
  baseURL: string;
  refreshEndpoint?: string;
  timeout: number;
}

export interface ApiClientOptions {
  adapter?: AxiosAdapter;
  baseURL?: string;
  refreshAdapter?: AxiosAdapter;
  refreshEndpoint?: string;
  refreshSession?: (context: RefreshSessionContext) => Promise<boolean>;
  requestIdGenerator?: () => string;
  timeout?: number;
}

function createRequestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function ensureHeaders(config: InternalAxiosRequestConfig) {
  config.headers = AxiosHeaders.from(config.headers);
  return config.headers;
}

function getStatus(error: unknown) {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}

function getOriginalRequest(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return undefined;
  }

  return error.config as RetryableRequestConfig | undefined;
}

export function createApiClient({
  adapter,
  baseURL = getPublicEnv().NEXT_PUBLIC_API_BASE_URL,
  refreshAdapter,
  refreshEndpoint,
  refreshSession,
  requestIdGenerator = createRequestId,
  timeout = DEFAULT_TIMEOUT_MS,
}: ApiClientOptions = {}): AxiosInstance {
  const apiClient = axios.create({
    adapter,
    baseURL,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    timeout,
    withCredentials: true,
  });
  const refreshSessionRequest: RefreshSession = () =>
    refreshSession
      ? refreshSession({ baseURL, refreshEndpoint, timeout })
      : requestTokenRefresh({
          adapter: refreshAdapter,
          baseURL,
          refreshEndpoint,
          timeout,
        });
  let refreshPromise: Promise<boolean> | undefined;

  function refreshOnce() {
    refreshPromise ??= refreshSessionRequest().finally(() => {
      refreshPromise = undefined;
    });

    return refreshPromise;
  }

  apiClient.interceptors.request.use((config) => {
    const headers = ensureHeaders(config);

    headers.set("X-Request-ID", requestIdGenerator());
    headers.delete("Authorization");

    return config;
  });

  apiClient.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      const status = getStatus(error);
      const originalRequest = getOriginalRequest(error);

      if (status !== 401 || !originalRequest) {
        throw normalizeApiError(error);
      }

      if (originalRequest.__isRetryRequest) {
        notifySessionExpired();
        throw normalizeApiError(error);
      }

      originalRequest.__isRetryRequest = true;

      try {
        const refreshed = await refreshOnce();

        if (!refreshed) {
          throw new Error("Session refresh was rejected.");
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        notifySessionExpired();
        throw createAuthRefreshError(refreshError);
      }
    },
  );

  return apiClient;
}

export const apiClient = createApiClient();
