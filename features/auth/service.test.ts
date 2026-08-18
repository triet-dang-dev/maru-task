import { describe, expect, it, vi } from "vitest";

import { getCurrentSession, logout, registerUser, startOidcSignIn } from "./service";

describe("auth service", () => {
  it("returns the browser-safe session from the same-origin BFF", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ displayName: "Morgan Chen", id: "42", role: "ProjectManager" }),
          {
            status: 200,
          },
        ),
      ),
    );

    await expect(getCurrentSession()).resolves.toEqual({
      displayName: "Morgan Chen",
      id: "42",
      role: "ProjectManager",
    });
  });

  it("rejects a failed logout request", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 502 })));

    await expect(logout()).rejects.toThrow("Unable to sign out.");
  });

  it("surfaces an OIDC start error instead of navigating away from the login page", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "The authentication service is unavailable." }), {
          status: 502,
        }),
      ),
    );

    await expect(startOidcSignIn("/api/v1/auth/oidc/entra/start")).rejects.toThrow(
      "The authentication service is unavailable.",
    );
  });

  it("maps the backend admin registration input without adding a public registration flow", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      registerUser({
        displayName: "Taylor Morgan",
        email: "taylor@example.com",
        role: "Developer",
      }),
    ).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/auth/register",
      expect.objectContaining({
        body: JSON.stringify({
          displayName: "Taylor Morgan",
          email: "taylor@example.com",
          role: "Developer",
        }),
        method: "POST",
      }),
    );
  });
});
