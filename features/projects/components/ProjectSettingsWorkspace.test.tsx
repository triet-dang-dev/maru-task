import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ProjectSettingsWorkspace } from "./ProjectSettingsWorkspace";

describe("ProjectSettingsWorkspace", () => {
  it("shows member role and active state, invitation, and removal confirmation", async () => {
    const user = userEvent.setup();

    render(<ProjectSettingsWorkspace />);

    expect(screen.getByRole("table", { name: "Project members" })).toBeInTheDocument();
    expect(screen.getByText("Project manager")).toBeInTheDocument();
    expect(screen.getAllByText("Active")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Invite member" }));
    expect(screen.getByRole("dialog", { name: "Invite member" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Invite member" })).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Remove Dana Chen" }));
    expect(screen.getByRole("dialog", { name: "Remove member?" })).toBeInTheDocument();
  });

  it("uses controlled preference fields", async () => {
    const user = userEvent.setup();
    render(<ProjectSettingsWorkspace />);

    const shortcuts = screen.getByRole("switch", { name: "Disable keyboard shortcuts" });
    expect(shortcuts).not.toBeChecked();
    await user.click(shortcuts);
    expect(shortcuts).toBeChecked();
  });
});
