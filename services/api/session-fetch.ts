let refreshPromise: Promise<boolean> | undefined;

export const SESSION_EXPIRED_EVENT = "maru:session-expired";

export function notifySessionExpired() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }
}

function refreshSessionOnce() {
  refreshPromise ??= fetch("/api/auth/refresh", {
    headers: { Accept: "application/json" },
    method: "POST",
  })
    .then((response) => response.ok)
    .catch(() => false)
    .finally(() => {
      refreshPromise = undefined;
    });

  return refreshPromise;
}

export async function fetchWithSession(input: string | URL, init?: RequestInit): Promise<Response> {
  const response = await fetch(input, init);
  if (response.status !== 401) return response;

  if (!(await refreshSessionOnce())) {
    notifySessionExpired();
    return response;
  }

  const retriedResponse = await fetch(input, init);
  if (retriedResponse.status === 401) notifySessionExpired();
  return retriedResponse;
}
