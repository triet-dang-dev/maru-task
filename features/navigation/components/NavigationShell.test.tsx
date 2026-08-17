import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

let pathname = "/projects/42";
vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock("@/features/auth/components/SessionGate", () => ({
  SessionGate: ({
    children,
  }: {
    children: (session: { displayName: string; role: string }) => React.ReactNode;
  }) => children({ displayName: "Riley Park", role: "Member" }),
}));

import { NavigationShell } from "./NavigationShell";

describe("NavigationShell", () => {
  afterEach(() => {
    pathname = "/projects/42";
  });

  it("renders OpenProject-style workspace navigation and marks the current project workspace active", () => {
    render(
      <NavigationShell>
        <h1>Work items</h1>
      </NavigationShell>,
    );

    expect(screen.getAllByText("Maru Task").length).toBeGreaterThan(0);
    expect(screen.getByText("Project workspace")).toBeInTheDocument();
    expect(screen.getByLabelText("Riley Park")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Work items" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Search work packages" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Notifications (2 unread)" })).toBeInTheDocument();

    const projectWorkspaceLinks = screen.getAllByRole("link", { name: "My work" });
    expect(
      projectWorkspaceLinks.every((link) => link.getAttribute("aria-current") !== "page"),
    ).toBe(true);

    expect(screen.getAllByRole("button", { name: "Open Projects menu" })).not.toHaveLength(0);

    const projectNavigation = screen.getByRole("navigation", { name: "Project navigation" });
    expect(projectNavigation).toBeInTheDocument();

    const overviewLinks = screen.getAllByRole("link", { name: "Overview" });
    expect(overviewLinks.some((link) => link.getAttribute("aria-current") === "page")).toBe(true);

    expect(screen.getAllByRole("link", { name: "Boards" })[0]).toHaveAttribute(
      "href",
      "/projects/42/boards",
    );
  });

  it("marks only the current project module active", () => {
    pathname = "/projects/42/boards";

    render(
      <NavigationShell>
        <h1>Boards</h1>
      </NavigationShell>,
    );

    const boardsLinks = screen.getAllByRole("link", { name: "Boards" });
    expect(boardsLinks.some((link) => link.getAttribute("aria-current") === "page")).toBe(true);
    expect(
      screen
        .getAllByRole("link", { name: "Overview" })
        .every((link) => link.getAttribute("aria-current") !== "page"),
    ).toBe(true);
    expect(screen.getAllByRole("link", { name: "My work" })[0]).not.toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getAllByRole("button", { name: "Open Projects menu" })[0]).not.toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
