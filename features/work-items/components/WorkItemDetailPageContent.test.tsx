import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getPriorities, getUsers, getWorkItem, updateWorkItem } from "../service";
import { WorkItemDetailPageContent } from "./WorkItemDetailPageContent";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

vi.mock("../service", () => ({
  createWorkItemAttachment: vi.fn(),
  createWorkItemComment: vi.fn(),
  createWorkItemRelation: vi.fn(),
  createWorkItemWatcher: vi.fn(),
  deleteWorkItem: vi.fn(),
  getPriorities: vi.fn(),
  getUsers: vi.fn(),
  getWorkItem: vi.fn(),
  updateWorkItem: vi.fn(),
}));

const detail = {
  id: "101",
  projectId: "42",
  projectName: "Migration",
  subject: "Map the API boundary",
  description: "Define the BFF contract.",
  status: "Open",
  priority: "Normal",
  type: "Task",
  author: "Morgan Chen",
  assigneeUserId: "7",
  assignee: "",
  dueDate: null,
  parentSummary: null,
  relationCount: 0,
  commentCount: 0,
  createdAt: "2026-08-11T10:00:00Z",
  updatedAt: "2026-08-12T10:00:00Z",
};

const mockPriorities = [
  { id: 2, name: "Normal" },
  { id: 3, name: "High" },
];

const mockUsers = [
  { email: "mchen@example.com", id: "7", isActive: true, name: "Morgan Chen" },
  { email: "jlee@example.com", id: "2", isActive: true, name: "Jamie Lee" },
];

describe("WorkItemDetailPageContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPriorities).mockResolvedValue(mockPriorities);
    vi.mocked(getUsers).mockResolvedValue(mockUsers);
  });

  it("loads a work item and saves subject and description edits", async () => {
    const user = userEvent.setup();
    vi.mocked(getWorkItem).mockResolvedValue(detail);
    vi.mocked(updateWorkItem).mockResolvedValue(undefined);

    render(<WorkItemDetailPageContent projectId="42" workItemId="101" />);

    expect(await screen.findByDisplayValue("Map the API boundary")).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Subject"));
    await user.type(screen.getByLabelText("Subject"), "Ship the API boundary");
    await user.clear(screen.getByLabelText("Description"));
    await user.type(screen.getByLabelText("Description"), "Validate the BFF contract.");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(updateWorkItem).toHaveBeenCalledWith("101", {
        description: "Validate the BFF contract.",
        subject: "Ship the API boundary",
      });
      expect(getWorkItem).toHaveBeenCalledTimes(2);
    });
  }, 10_000);

  it("shows a field validation error instead of saving an empty subject", async () => {
    const user = userEvent.setup();
    vi.mocked(getWorkItem).mockResolvedValue(detail);

    render(<WorkItemDetailPageContent projectId="42" workItemId="101" />);

    const subject = await screen.findByLabelText("Subject");
    await user.clear(subject);
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByText("Subject is required.")).toBeInTheDocument();
    expect(updateWorkItem).not.toHaveBeenCalled();
  });

  it("renders the source-derived activity tab without overview fields", async () => {
    vi.mocked(getWorkItem).mockResolvedValue(detail);

    render(<WorkItemDetailPageContent activeTab="activity" projectId="42" workItemId="101" />);

    expect(
      await screen.findByRole("tab", { name: "Activity", selected: true }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tabpanel", { name: "Activity" })).toHaveTextContent("Add comment");
    expect(screen.queryByLabelText("Subject")).not.toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute(
      "href",
      "/projects/42/work-items/101",
    );
  });

  it("saves a priority identifier with the work-item edit form", async () => {
    const user = userEvent.setup();
    vi.mocked(getWorkItem).mockResolvedValue(detail);
    vi.mocked(updateWorkItem).mockResolvedValue(undefined);

    render(<WorkItemDetailPageContent projectId="42" workItemId="101" />);

    await screen.findByDisplayValue("Map the API boundary");
    // Open the Priority select and choose High (id 3)
    fireEvent.mouseDown(screen.getByRole("combobox", { name: /priority/i }));
    fireEvent.click(await screen.findByRole("option", { name: "High" }));
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(updateWorkItem).toHaveBeenCalledWith("101", {
        description: "Define the BFF contract.",
        priorityId: "3",
        subject: "Map the API boundary",
      });
    });
  });

  it("saves an assignee user identifier with the work-item edit form", async () => {
    const user = userEvent.setup();
    vi.mocked(getWorkItem).mockResolvedValue(detail);
    vi.mocked(updateWorkItem).mockResolvedValue(undefined);

    render(<WorkItemDetailPageContent projectId="42" workItemId="101" />);

    await screen.findByDisplayValue("Map the API boundary");
    // Open the Assignee select and choose Jamie Lee (id 2)
    fireEvent.mouseDown(screen.getByRole("combobox", { name: /assignee/i }));
    fireEvent.click(await screen.findByRole("option", { name: "Jamie Lee" }));
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(updateWorkItem).toHaveBeenCalledWith("101", {
        assigneeUserId: "2",
        description: "Define the BFF contract.",
        subject: "Map the API boundary",
      });
    });
  });

  it("saves a due date with the work-item edit form", async () => {
    const user = userEvent.setup();
    vi.mocked(getWorkItem).mockResolvedValue(detail);
    vi.mocked(updateWorkItem).mockResolvedValue(undefined);

    render(<WorkItemDetailPageContent projectId="42" workItemId="101" />);

    await screen.findByDisplayValue("Map the API boundary");
    fireEvent.change(screen.getByLabelText("Due date"), { target: { value: "2026-09-01" } });
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(updateWorkItem).toHaveBeenCalledWith("101", {
        description: "Define the BFF contract.",
        dueDate: "2026-09-01T00:00:00.000Z",
        subject: "Map the API boundary",
      });
    });
  });

  it("clears an existing due date with the work-item edit form", async () => {
    const user = userEvent.setup();
    vi.mocked(getWorkItem).mockResolvedValue({
      ...detail,
      dueDate: "2026-09-01T00:00:00.000Z",
    });
    vi.mocked(updateWorkItem).mockResolvedValue(undefined);

    render(<WorkItemDetailPageContent projectId="42" workItemId="101" />);

    expect(await screen.findByLabelText("Due date")).toHaveValue("2026-09-01");
    fireEvent.change(screen.getByLabelText("Due date"), { target: { value: "" } });
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(updateWorkItem).toHaveBeenCalledWith("101", {
        description: "Define the BFF contract.",
        dueDate: null,
        subject: "Map the API boundary",
      });
    });
  });

  it("requires confirmation before deleting and returns to the project work-items list", async () => {
    const user = userEvent.setup();
    const { deleteWorkItem } = await import("../service");
    vi.mocked(getWorkItem).mockResolvedValue(detail);
    vi.mocked(deleteWorkItem).mockResolvedValue(undefined);

    render(<WorkItemDetailPageContent projectId="42" workItemId="101" />);

    await screen.findByDisplayValue("Map the API boundary");
    await user.click(screen.getByRole("button", { name: "Delete work item" }));

    expect(screen.getByRole("dialog", { name: "Delete work item?" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(deleteWorkItem).toHaveBeenCalledWith("101");
      expect(replace).toHaveBeenCalledWith("/projects/42");
    });
  });

  it("submits a non-empty comment and confirms it was added", async () => {
    const user = userEvent.setup();
    const { createWorkItemComment } = await import("../service");
    vi.mocked(getWorkItem).mockResolvedValue(detail);
    vi.mocked(createWorkItemComment).mockResolvedValue({
      authorUserId: "1",
      body: "Ready for review.",
      createdAt: "2026-08-13T09:30:00Z",
      id: "501",
      updatedAt: null,
      workItemId: "101",
    });

    render(<WorkItemDetailPageContent activeTab="activity" projectId="42" workItemId="101" />);

    await user.type(await screen.findByLabelText("Comment"), "Ready for review.");
    await user.click(screen.getByRole("button", { name: "Add comment" }));

    await waitFor(() => {
      expect(createWorkItemComment).toHaveBeenCalledWith("101", "Ready for review.");
      expect(screen.getByText("Comment added.")).toBeInTheDocument();
    });
  });

  it("creates a relation to another work item and confirms it was added", async () => {
    const user = userEvent.setup();
    const { createWorkItemRelation } = await import("../service");
    vi.mocked(getWorkItem).mockResolvedValue(detail);
    vi.mocked(createWorkItemRelation).mockResolvedValue({
      createdAt: "2026-08-13T10:00:00Z",
      id: "301",
      relationType: "relates",
      sourceWorkItemId: "101",
      targetWorkItemId: "102",
    });

    render(<WorkItemDetailPageContent activeTab="relations" projectId="42" workItemId="101" />);

    await user.type(await screen.findByLabelText("Related work item ID"), "102");
    await user.type(screen.getByLabelText("Relation type"), "relates");
    await user.click(screen.getByRole("button", { name: "Add relation" }));

    await waitFor(() => {
      expect(createWorkItemRelation).toHaveBeenCalledWith("101", {
        relatedWorkItemId: "102",
        relationType: "relates",
      });
      expect(screen.getByText("Relation added.")).toBeInTheDocument();
    });
  });

  it("adds a watcher and confirms it was added", async () => {
    const user = userEvent.setup();
    const { createWorkItemWatcher } = await import("../service");
    vi.mocked(getWorkItem).mockResolvedValue(detail);
    vi.mocked(createWorkItemWatcher).mockResolvedValue({
      id: "401",
      subscribedAt: "2026-08-13T10:15:00Z",
      userId: "7",
      workItemId: "101",
    });

    render(<WorkItemDetailPageContent activeTab="watchers" projectId="42" workItemId="101" />);

    await user.type(await screen.findByLabelText("Watcher user ID"), "7");
    await user.click(screen.getByRole("button", { name: "Add watcher" }));

    await waitFor(() => {
      expect(createWorkItemWatcher).toHaveBeenCalledWith("101", "7");
      expect(screen.getByText("Watcher added.")).toBeInTheDocument();
    });
  });

  it("links uploaded attachment metadata and confirms it was added", async () => {
    const user = userEvent.setup();
    const { createWorkItemAttachment } = await import("../service");
    vi.mocked(getWorkItem).mockResolvedValue(detail);
    vi.mocked(createWorkItemAttachment).mockResolvedValue({
      contentType: "application/pdf",
      fileName: "migration-plan.pdf",
      id: "601",
      linkedAt: "2026-08-13T10:30:00Z",
      sizeInBytes: 2048,
      storagePath: "work-items/101/migration-plan.pdf",
      workItemId: "101",
    });

    render(<WorkItemDetailPageContent activeTab="files" projectId="42" workItemId="101" />);

    await user.type(await screen.findByLabelText("Attachment name"), "migration-plan.pdf");
    await user.type(screen.getByLabelText("Content type"), "application/pdf");
    await user.type(screen.getByLabelText("Size in bytes"), "2048");
    await user.type(screen.getByLabelText("Storage path"), "work-items/101/migration-plan.pdf");
    await user.click(screen.getByRole("button", { name: "Link attachment" }));

    await waitFor(() => {
      expect(createWorkItemAttachment).toHaveBeenCalledWith("101", {
        contentType: "application/pdf",
        fileName: "migration-plan.pdf",
        sizeInBytes: "2048",
        storagePath: "work-items/101/migration-plan.pdf",
      });
      expect(screen.getByText("Attachment linked.")).toBeInTheDocument();
    });
  });
});
