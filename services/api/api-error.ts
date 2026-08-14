import axios, { AxiosError, type AxiosResponse } from "axios";

import type { ApiErrorPayload } from "@/types/api";

interface AppApiErrorInput {
  code: string;
  details?: unknown;
  message: string;
  requestId?: string;
  status?: number;
  cause?: unknown;
}

export class AppApiError extends Error {
  readonly code: string;
  readonly details?: unknown;
  readonly requestId?: string;
  readonly status?: number;

  constructor({ cause, code, details, message, requestId, status }: AppApiErrorInput) {
    super(message, { cause });
    this.name = "AppApiError";
    this.code = code;
    this.details = details;
    this.requestId = requestId;
    this.status = status;
  }
}

interface ApiErrorEnvelope {
  error?: Partial<ApiErrorPayload>;
}

function getHeader(response: AxiosResponse | undefined, name: string) {
  const headers = response?.headers;

  if (!headers) {
    return undefined;
  }

  const value =
    typeof headers.get === "function"
      ? headers.get(name)
      : headers[name] || headers[name.toLowerCase()];

  return typeof value === "string" ? value : undefined;
}

function getErrorPayload(data: unknown): Partial<ApiErrorPayload> | undefined {
  if (!data || typeof data !== "object") {
    return undefined;
  }

  const envelope = data as ApiErrorEnvelope;

  if (envelope.error && typeof envelope.error === "object") {
    return envelope.error;
  }

  return data as Partial<ApiErrorPayload>;
}

function normalizeAxiosError(error: AxiosError): AppApiError {
  const response = error.response;
  const payload = getErrorPayload(response?.data);
  const status = response?.status;
  const requestId = payload?.requestId || getHeader(response, "x-request-id");

  if (status) {
    return new AppApiError({
      cause: error,
      code: payload?.code || `HTTP_${status}`,
      details: payload?.details,
      message: payload?.message || "The request failed.",
      requestId,
      status,
    });
  }

  if (error.code === AxiosError.ECONNABORTED || error.code === "ETIMEDOUT") {
    return new AppApiError({
      cause: error,
      code: "REQUEST_TIMEOUT",
      message: "The request timed out.",
      requestId,
    });
  }

  return new AppApiError({
    cause: error,
    code: "NETWORK_ERROR",
    message: "Unable to reach the API. Please check your connection.",
    requestId,
  });
}

export function normalizeApiError(error: unknown): AppApiError {
  if (error instanceof AppApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    return normalizeAxiosError(error);
  }

  if (error instanceof Error) {
    return new AppApiError({
      cause: error,
      code: "UNKNOWN_ERROR",
      message: error.message || "An unexpected error occurred.",
    });
  }

  return new AppApiError({
    cause: error,
    code: "UNKNOWN_ERROR",
    message: "An unexpected error occurred.",
  });
}

export function createAuthRefreshError(cause: unknown): AppApiError {
  return new AppApiError({
    cause,
    code: "AUTH_REFRESH_FAILED",
    message: "Unable to refresh the session. Please sign in again.",
    status: 401,
  });
}
