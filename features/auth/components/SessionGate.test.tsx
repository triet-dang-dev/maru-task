import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SESSION_EXPIRED_EVENT } from "@/services/api/session-fetch";

import { SessionGate } from "./SessionGate";

const { router } = vi.hoisted(() => ({ router: { replace: vi.fn() } }));

vi.mock("next/navigation", () => ({ useRouter: () => router }));

describe("SessionGate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects an anonymous user to login instead of rendering protected content", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 401 })));

    render(<SessionGate>{() => <h1>Protected workspace</h1>}</SessionGate>);

    expect(screen.getByText("Loading session")).toBeInTheDocument();
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/login"));
    expect(screen.queryByRole("heading", { name: "Protected workspace" })).not.toBeInTheDocument();
  });

  it("renders protected content after the current session is confirmed", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ displayName: "Morgan Chen", id: "1", role: "ProjectManager" }),
          {
            status: 200,
          },
        ),
      ),
    );

    render(<SessionGate>{() => <h1>Protected workspace</h1>}</SessionGate>);

    expect(await screen.findByRole("heading", { name: "Protected workspace" })).toBeInTheDocument();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("redirects when a later API request reports an unrecoverable expired session", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ displayName: "Morgan Chen", id: "1", role: "ProjectManager" }),
          {
            status: 200,
          },
        ),
      ),
    );

    render(<SessionGate>{() => <h1>Protected workspace</h1>}</SessionGate>);
    expect(await screen.findByRole("heading", { name: "Protected workspace" })).toBeInTheDocument();

    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/login"));
  });
});
