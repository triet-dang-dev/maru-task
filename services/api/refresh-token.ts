import axios, { type AxiosAdapter } from "axios";

interface RefreshSessionRequest {
  adapter?: AxiosAdapter;
  baseURL: string;
  refreshEndpoint?: string;
  timeout?: number;
}

export type RefreshSession = () => Promise<boolean>;

export const DEFAULT_REFRESH_ENDPOINT = "/auth/refresh";

export async function requestTokenRefresh({
  adapter,
  baseURL,
  refreshEndpoint = DEFAULT_REFRESH_ENDPOINT,
  timeout,
}: RefreshSessionRequest) {
  const refreshClient = axios.create({
    adapter,
    baseURL,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    timeout,
    withCredentials: true,
  });

  await refreshClient.post(refreshEndpoint);
  return true;
}
