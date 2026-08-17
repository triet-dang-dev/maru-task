import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ToastProvider } from "@/components/ui/Toast";
import { AddBoardLaneModal } from "./AddBoardLaneModal";

describe("AddBoardLaneModal", () => {
  it("allows adding a preset lane to the board", async () => {
    const user = userEvent.setup();
    const handleAddLane = vi.fn();
    const handleClose = vi.fn();

    render(
      <ToastProvider>
        <AddBoardLaneModal
          existingLaneLabels={["Open", "In progress", "Done"]}
          onAddLane={handleAddLane}
          onClose={handleClose}
          open={true}
        />
      </ToastProvider>,
    );

    expect(screen.getByRole("heading", { name: "Add list to board" })).toBeInTheDocument();

    // Select preset
    await user.click(screen.getByLabelText("Choose lane"));
    await user.click(screen.getByRole("option", { name: "Needs review" }));

    // Click Add list
    await user.click(screen.getByRole("button", { name: "Add list" }));

    expect(handleAddLane).toHaveBeenCalledWith({
      label: "Needs review",
      tone: "warning",
    });
    expect(handleClose).toHaveBeenCalled();
  });

  it("allows typing a custom lane name", async () => {
    const user = userEvent.setup();
    const handleAddLane = vi.fn();
    const handleClose = vi.fn();

    render(
      <ToastProvider>
        <AddBoardLaneModal
          existingLaneLabels={["Open", "In progress"]}
          onAddLane={handleAddLane}
          onClose={handleClose}
          open={true}
        />
      </ToastProvider>,
    );

    const customInput = screen.getByLabelText("Lane name");
    await user.type(customInput, "QA Testing");

    await user.click(screen.getByRole("button", { name: "Add list" }));

    expect(handleAddLane).toHaveBeenCalledWith({
      label: "QA Testing",
      tone: "info",
    });
  });
});
