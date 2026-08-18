import { z } from "zod";

import { fetchWithSession } from "@/services/api/session-fetch";
import { apiV1Path } from "@/utils/api-path";

const browserSessionSchema = z.object({
  displayName: z.string(),
  id: z.string(),
  role: z.string(),
});

export type BrowserSession = z.infer<typeof browserSessionSchema>;
export type RegisterUserRole = "Admin" | "ProjectManager" | "Developer" | "Viewer";

export function navigateToAuthenticatedPath(path: string): void {
  window.location.assign(path);
}

export async function startOidcSignIn(path: string): Promise<void> {
  const response = await fetch(path, {
    headers: { Accept: "application/json", "X-OIDC-Start-Mode": "preflight" },
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      "message" in payload &&
      typeof payload.message === "string"
        ? payload.message
        : "Unable to start Microsoft sign-in.";
    throw new Error(message);
  }

  const redirectUrl =
    payload &&
    typeof payload === "object" &&
    "redirectUrl" in payload &&
    typeof payload.redirectUrl === "string"
      ? payload.redirectUrl
      : null;
  if (!redirectUrl) throw new Error("Unable to start Microsoft sign-in.");

  window.location.assign(redirectUrl);
}

export async function loginWithEmail(input: { email: string; password: string }): Promise<void> {
  const response = await fetch(apiV1Path("/auth/login/web-app"), {
    body: JSON.stringify(input),
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    method: "POST",
  });

  if (response.ok) return;

  const payload = await response.json().catch(() => null);
  const message =
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof payload.message === "string"
      ? payload.message
      : "Unable to sign in.";
  throw new Error(message);
}

export async function getCurrentSession(): Promise<BrowserSession | null> {
  const response = await fetchWithSession(apiV1Path("/auth/me"), {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) return null;

  const session = browserSessionSchema.safeParse(await response.json().catch(() => null));
  if (!session.success) throw new Error("Unable to load the current session.");
  return session.data;
}

export async function logout(): Promise<void> {
  const response = await fetchWithSession(apiV1Path("/auth/logout"), { method: "POST" });
  if (!response.ok) throw new Error("Unable to sign out.");
}

export async function registerUser(input: {
  displayName: string;
  email: string;
  role: RegisterUserRole;
}): Promise<void> {
  const response = await fetchWithSession(apiV1Path("/auth/register"), {
    body: JSON.stringify(input),
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    method: "POST",
  });
  if (!response.ok) throw new Error("Unable to register the user.");
}
