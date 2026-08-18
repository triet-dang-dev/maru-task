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

  it("renders OpenProject-style primary navigation without a second project menu", () => {
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
    expect(screen.getByRole("combobox", { name: "Project scope" })).toHaveTextContent(
      "All projects",
    );

    const workPackageMenu = screen.getAllByRole("button", { name: "Open Work packages menu" });
    expect(workPackageMenu.every((item) => item.getAttribute("aria-current") !== "page")).toBe(
      true,
    );

    expect(screen.getAllByRole("button", { name: "Open Projects menu" })).not.toHaveLength(0);

    expect(
      screen.queryByRole("navigation", { name: "Project navigation" }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Boards" })[0]).toHaveAttribute(
      "href",
      "/projects/42/boards",
    );
  });

  it("maps a legacy project-local URL to its matching global module", () => {
    pathname = "/projects/42/boards";

    render(
      <NavigationShell>
        <h1>Boards</h1>
      </NavigationShell>,
    );

    const boardsLinks = screen.getAllByRole("link", { name: "Boards" });
    expect(boardsLinks.some((link) => link.getAttribute("aria-current") === "page")).toBe(true);
    expect(
      screen.getAllByRole("button", { name: "Open Work packages menu" })[0],
    ).not.toHaveAttribute("aria-current", "page");
    expect(screen.getAllByRole("button", { name: "Open Projects menu" })[0]).not.toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("marks only My page active at its OpenProject route", () => {
    pathname = "/my/page";

    render(
      <NavigationShell>
        <h1>My page</h1>
      </NavigationShell>,
    );

    expect(screen.getAllByRole("link", { name: "My page" })[0]).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getAllByRole("link", { name: "Home" })[0]).not.toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByText("Personal workspace")).toBeInTheDocument();
  });

  it("marks only Home active at its own route", () => {
    pathname = "/home";

    render(
      <NavigationShell>
        <h1>Home</h1>
      </NavigationShell>,
    );

    expect(screen.getAllByRole("link", { name: "Home" })[0]).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getAllByRole("link", { name: "My page" })[0]).not.toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("routes the global work package menu to the canonical all-open view", () => {
    render(
      <NavigationShell>
        <h1>My work</h1>
      </NavigationShell>,
    );

    expect(screen.getAllByRole("button", { name: "Open Work packages menu" })).not.toHaveLength(0);
  });

  it("exposes the complete OpenProject primary navigation", () => {
    pathname = "/";

    render(
      <NavigationShell>
        <h1>Home</h1>
      </NavigationShell>,
    );

    [
      "Home",
      "My page",
      "My time tracking",
      "Portfolios",
      "Projects",
      "Work packages",
      "Gantt charts",
      "Boards",
      "Meetings",
      "News",
      "Time and costs",
      "Wiki",
      "Requirements",
    ].forEach((label) => {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    });
  });

  it("does not duplicate project-local modules below the primary navigation", () => {
    render(
      <NavigationShell>
        <h1>Project overview</h1>
      </NavigationShell>,
    );

    expect(
      screen.queryByRole("navigation", { name: "Project navigation" }),
    ).not.toBeInTheDocument();
  });
});
