import { fetchWithSession } from "../session-fetch";

export type BackendApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type PathParameter = number | string;
type QueryParameter = boolean | number | string | null | undefined;

export interface BackendApiRequestOptions {
  body?: unknown;
  pathParams?: Record<string, PathParameter>;
  query?: Record<string, QueryParameter>;
}

export interface BackendApiOperation {
  <Response = unknown>(options?: BackendApiRequestOptions): Promise<Response>;
  readonly method: BackendApiMethod;
  readonly path: string;
}

function buildEndpointPath(
  template: string,
  pathParams: Record<string, PathParameter> | undefined,
) {
  return template.replace(/\{([A-Za-z][A-Za-z0-9]*)\}/g, (placeholder, parameterName) => {
    const value = pathParams?.[parameterName];
    if (value === undefined || value === null || value === "") {
      throw new Error(`Missing path parameter "${parameterName}" for ${template}.`);
    }

    return encodeURIComponent(String(value));
  });
}

function appendQuery(path: string, query: Record<string, QueryParameter> | undefined) {
  if (!query) return path;

  const searchParams = new URLSearchParams();
  for (const [name, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) searchParams.set(name, String(value));
  }

  const search = searchParams.toString();
  return search ? `${path}?${search}` : path;
}

export function createBackendApiOperation(method: BackendApiMethod, path: string) {
  const operation = async <Response = unknown>(options: BackendApiRequestOptions = {}) => {
    const body = options.body === undefined ? undefined : JSON.stringify(options.body);
    const response = await fetchWithSession(
      appendQuery(buildEndpointPath(path, options.pathParams), options.query),
      {
        ...(body ? { body } : {}),
        headers: {
          Accept: "application/json",
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        method,
      },
    );

    if (!response.ok) throw new Error(`Unable to call ${method} ${path}: ${response.status}`);
    if (
      response.status === 204 ||
      !response.headers.get("content-type")?.includes("application/json")
    ) {
      return undefined as Response;
    }

    return response.json() as Promise<Response>;
  };

  return Object.assign(operation, { method, path }) as BackendApiOperation;
}
