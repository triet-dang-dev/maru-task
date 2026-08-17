import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { useUiStore } from "@/stores/use-ui-store";

import { AppShell } from "./AppShell";

describe("AppShell", () => {
  afterEach(() => {
    useUiStore.setState({ isSidebarOpen: false });
  });

  it("exposes the active route and mobile navigation controls", async () => {
    const user = userEvent.setup();

    render(
      <AppShell
        brand="Maru Task"
        navigation={[
          { active: true, href: "/", label: "Overview" },
          { href: "/settings", label: "Settings" },
        ]}
      >
        <h1>Workspace</h1>
      </AppShell>,
    );

    expect(screen.getAllByRole("link", { name: "Overview" })[0]).toHaveAttribute(
      "aria-current",
      "page",
    );

    const menuButton = screen.getByRole("button", { name: "Open navigation" });
    await user.click(menuButton);
    expect(screen.getByRole("button", { name: "Close navigation" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close navigation" }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Open navigation" })).toBeInTheDocument();
    });
  });

  it("opens a project submenu and returns to the main menu", async () => {
    const user = userEvent.setup();

    render(
      <AppShell
        brand="Maru Task"
        navigation={[
          { href: "/", label: "Home" },
          {
            href: "/projects",
            label: "Projects",
            submenu: {
              items: [
                { active: true, href: "/projects", label: "Active projects" },
                { href: "/projects?view=mine", label: "My projects" },
                { href: "/projects?view=favorites", label: "Favorite projects" },
              ],
              searchPlaceholder: "Search by name",
              title: "Projects",
            },
          },
        ]}
      >
        <h1>Workspace</h1>
      </AppShell>,
    );

    await user.click(screen.getAllByRole("button", { name: "Open Projects menu" })[0]);

    expect(screen.getAllByRole("heading", { name: "Projects" })[0]).toBeInTheDocument();
    expect(screen.getAllByRole("textbox", { name: "Search by name" })[0]).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Active projects" })[0]).toHaveAttribute(
      "aria-current",
      "page",
    );

    await user.click(screen.getAllByRole("button", { name: "Back to main menu" })[0]);

    expect(screen.getAllByRole("link", { name: "Home" })[0]).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "Search by name" })).not.toBeInTheDocument();
  });
});
