import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ToastProvider } from "@/components/ui/Toast";
import { WorkItemCopyModal } from "./WorkItemCopyModal";
import { WorkItemReminderModal } from "./WorkItemReminderModal";
import { WorkItemShareModal } from "./WorkItemShareModal";
import { WorkItemTimerButton } from "./WorkItemTimerButton";
import { WorkItemContextMenu } from "./WorkItemContextMenu";

function renderWithToast(ui: React.ReactNode) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

describe("WorkItemShareModal", () => {
  it("renders share link, invite field, and existing shared members", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    renderWithToast(
      <WorkItemShareModal
        onClose={handleClose}
        open={true}
        projectId="proj-1"
        workItemId="101"
        workItemSubject="Prepare deployment"
      />,
    );

    expect(screen.getByText("Share #101: Prepare deployment")).toBeInTheDocument();
    expect(screen.getByDisplayValue(/projects\/proj-1\/work-items\/101/)).toBeInTheDocument();
    expect(screen.getByText("Morgan Tate")).toBeInTheDocument();
    expect(screen.getByText("Dana Chen")).toBeInTheDocument();

    const inviteInput = screen.getByLabelText("Member email address");
    await user.type(inviteInput, "alex@example.com");

    const inviteButton = screen.getByRole("button", { name: /invite/i });
    await user.click(inviteButton);

    expect(screen.getByText("alex")).toBeInTheDocument();
    expect(screen.getByText("alex@example.com")).toBeInTheDocument();

    const removeButton = screen.getByLabelText("Remove access for Dana Chen");
    await user.click(removeButton);

    expect(screen.queryByText("dana.chen@example.com")).not.toBeInTheDocument();
  });
});

describe("WorkItemReminderModal", () => {
  it("allows setting quick preset or custom date reminder", async () => {
    const user = userEvent.setup();
    const handleSave = vi.fn();
    const handleClose = vi.fn();

    renderWithToast(
      <WorkItemReminderModal
        onClose={handleClose}
        onSaveReminder={handleSave}
        open={true}
        workItemId="101"
        workItemSubject="Prepare deployment"
      />,
    );

    expect(screen.getByText("Set personal reminder for #101")).toBeInTheDocument();

    const noteInput = screen.getByLabelText("Personal note (optional)");
    await user.type(noteInput, "Check status with lead");

    const setReminderButton = screen.getByRole("button", { name: /set reminder/i });
    await user.click(setReminderButton);

    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        note: "Check status with lead",
      }),
    );
    expect(handleClose).toHaveBeenCalled();
  });
});

describe("WorkItemCopyModal", () => {
  it("allows duplicating work package with attachments and options", async () => {
    const user = userEvent.setup();
    const handleCopy = vi.fn();
    const handleClose = vi.fn();

    renderWithToast(
      <WorkItemCopyModal
        onClose={handleClose}
        onCopy={handleCopy}
        open={true}
        projectId="proj-1"
        workItemId="101"
        workItemSubject="Prepare deployment"
      />,
    );

    expect(screen.getByText("Duplicate #101: Prepare deployment")).toBeInTheDocument();

    const titleInput = screen.getByLabelText(/new work package title/i);
    expect(titleInput).toHaveValue("Copy of Prepare deployment");

    await user.clear(titleInput);
    await user.type(titleInput, "Duplicated Task");

    const duplicateButton = screen.getByRole("button", { name: /duplicate work package/i });
    await user.click(duplicateButton);

    expect(handleCopy).toHaveBeenCalledWith({
      copyAttachments: true,
      copyRelations: false,
      copySubtasks: false,
      copyWatchers: true,
      subject: "Duplicated Task",
      targetProjectId: "proj-1",
    });
    expect(handleClose).toHaveBeenCalled();
  });
});

describe("WorkItemTimerButton", () => {
  it("starts and stops timer logging elapsed time", async () => {
    const user = userEvent.setup();
    const handleTimeLogged = vi.fn();

    renderWithToast(
      <WorkItemTimerButton
        onTimeLogged={handleTimeLogged}
        workItemId="101"
        workItemSubject="Prepare deployment"
      />,
    );

    const startButton = screen.getByLabelText("Start timer for #101");
    expect(startButton).toBeInTheDocument();

    await user.click(startButton);

    const stopButton = screen.getByLabelText("Stop timer for #101");
    expect(stopButton).toBeInTheDocument();

    await user.click(stopButton);

    expect(handleTimeLogged).toHaveBeenCalled();
    expect(screen.getByLabelText("Start timer for #101")).toBeInTheDocument();
  });
});

describe("WorkItemContextMenu", () => {
  it("opens context menu and triggers callbacks", async () => {
    const user = userEvent.setup();
    const handleOpenDetails = vi.fn();
    const handleShare = vi.fn();
    const handleReminder = vi.fn();
    const handleCopy = vi.fn();

    renderWithToast(
      <WorkItemContextMenu
        onCopy={handleCopy}
        onOpenDetails={handleOpenDetails}
        onReminder={handleReminder}
        onShare={handleShare}
        workItemId="101"
      />,
    );

    const trigger = screen.getByLabelText("Actions for work package #101");
    await user.click(trigger);

    expect(screen.getByText("Open details")).toBeInTheDocument();
    expect(screen.getByText("Share...")).toBeInTheDocument();
    expect(screen.getByText("Set reminder")).toBeInTheDocument();
    expect(screen.getByText("Duplicate")).toBeInTheDocument();

    await user.click(screen.getByText("Share..."));
    expect(handleShare).toHaveBeenCalled();
  });
});
