import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ToastProvider } from "@/components/ui/Toast";
import { ProjectBoard } from "./ProjectBoard";

describe("ProjectBoard", () => {
  it("renders a read-only Kanban board with stable status lanes", () => {
    render(<ProjectBoard projectId="proj-1" />);

    expect(screen.getByRole("heading", { name: "Delivery board" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Kanban board" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Open 3" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "In progress 2" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Done 2" })).toBeInTheDocument();
    expect(screen.getByText("Review the release checklist")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open work packages" })).toHaveAttribute(
      "href",
      "/projects/proj-1/work-items",
    );
  });

  it("switches boards and filters visible lanes by status", async () => {
    const user = userEvent.setup();

    render(<ProjectBoard projectId="proj-1" />);

    await user.click(screen.getByRole("combobox", { name: "Board" }));
    await user.click(screen.getByRole("option", { name: "Release readiness" }));
    expect(screen.getByRole("heading", { name: "Release readiness" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open" }));

    expect(screen.getByRole("button", { name: "Open", pressed: true })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Open 1" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /In progress/ })).not.toBeInTheDocument();
  });

  it("renders explicit loading and empty board states", () => {
    const { rerender } = render(<ProjectBoard isLoading projectId="proj-1" />);

    expect(screen.getByRole("status", { name: "Loading board" })).toBeInTheDocument();

    rerender(
      <ProjectBoard
        key="empty-board"
        boards={[{ id: "empty", lanes: [], name: "Empty board" }]}
        projectId="proj-1"
      />,
    );

    expect(screen.getByText("No work packages on this board")).toBeInTheDocument();
  });

  it("saves board configuration locally", () => {
    render(<ProjectBoard projectId="proj-1" />);

    fireEvent.click(screen.getByRole("button", { name: "Configure board" }));
    expect(screen.getByRole("dialog", { name: "Configure board" })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Board name"), {
      target: { value: "Delivery planning" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(screen.getByText("Delivery planning", { selector: "h1" })).toBeInTheDocument();
  });

  it("validates and adds an inline work package locally", async () => {
    const user = userEvent.setup();

    render(<ProjectBoard projectId="proj-1" />);

    await user.click(screen.getByRole("button", { name: "Add work package" }));
    await user.click(screen.getByRole("button", { name: "Add to board" }));
    expect(screen.getByText("Subject is required.")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Work package subject"), "Confirm incident runbook");
    await user.click(screen.getByRole("button", { name: "Add to board" }));
    expect(screen.getByText("Confirm incident runbook")).toBeInTheDocument();
  });

  it("moves a work package to the next lane and shows feedback", async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <ProjectBoard projectId="proj-1" />
      </ToastProvider>,
    );

    const moveButton = screen.getByRole("button", { name: "Move WP-138 to In progress" });
    await user.click(moveButton);

    expect(await screen.findByText("Moved WP-138 to In progress")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "In progress 3" })).toBeInTheDocument();
  });
});
