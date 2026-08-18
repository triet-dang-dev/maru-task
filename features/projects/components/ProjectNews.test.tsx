import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ToastProvider } from "@/components/ui/Toast";

import { ProjectNews } from "./ProjectNews";

describe("ProjectNews", () => {
  it("renders news items and allows adding a new project announcement", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ProjectNews projectId="project-1" />
      </ToastProvider>,
    );

    expect(screen.getByRole("heading", { name: "News" })).toBeInTheDocument();
    expect(screen.getByText("Migration phase complete")).toBeInTheDocument();

    const addBtn = screen.getByRole("button", { name: "Add news" });
    await user.click(addBtn);

    const dialog = screen.getByRole("dialog", { name: "Add project announcement" });
    expect(dialog).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Title/i), "Release v2 is live");
    await user.type(screen.getByLabelText(/Content/i), "All services have upgraded successfully.");
    await user.click(screen.getByRole("button", { name: "Publish news" }));

    expect(await screen.findByText("Release v2 is live")).toBeInTheDocument();
  });
});
