import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createWorkItem } from "../service";
import { WorkItemsPanelClient } from "./WorkItemsPanelClient";

vi.mock("../service", () => ({
  createWorkItem: vi.fn(),
}));

describe("WorkItemsPanelClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("provides the legacy-style quick filter for the project work-item table", async () => {
    const user = userEvent.setup();

    render(
      <WorkItemsPanelClient
        data={{
          hasItems: true,
          items: [
            {
              id: "1",
              projectId: "demo-project",
              status: "Open",
              subject: "Prepare release notes",
              updatedAt: "Today",
            },
            {
              id: "2",
              projectId: "demo-project",
              status: "In progress",
              subject: "Review the migration plan",
              updatedAt: "Yesterday",
            },
          ],
          page: 1,
          pageSize: 20,
          total: 2,
        }}
        onRefresh={vi.fn().mockResolvedValue(undefined)}
        projectId="demo-project"
      />,
    );

    await user.type(screen.getByLabelText("Filter work items"), "release");

    expect(screen.getByText("Prepare release notes")).toBeInTheDocument();
    expect(screen.queryByText("Review the migration plan")).not.toBeInTheDocument();
    expect(screen.getByText("1 record")).toBeInTheDocument();
  });

  it("filters the work-item table by status", async () => {
    const user = userEvent.setup();

    render(
      <WorkItemsPanelClient
        data={{
          hasItems: true,
          items: [
            {
              id: "1",
              projectId: "demo-project",
              status: "Open",
              subject: "Prepare release notes",
              updatedAt: "Today",
            },
            {
              id: "2",
              projectId: "demo-project",
              status: "In progress",
              subject: "Review the migration plan",
              updatedAt: "Yesterday",
            },
          ],
          page: 1,
          pageSize: 20,
          total: 2,
        }}
        onRefresh={vi.fn().mockResolvedValue(undefined)}
        projectId="demo-project"
      />,
    );

    await user.click(screen.getByLabelText("Status"));
    await user.click(screen.getByRole("option", { name: "Open" }));

    expect(screen.getByText("Prepare release notes")).toBeInTheDocument();
    expect(screen.queryByText("Review the migration plan")).not.toBeInTheDocument();
  });

  it("makes each work-item subject available as a split-view selection control", () => {
    render(
      <WorkItemsPanelClient
        data={{
          hasItems: true,
          items: [
            {
              id: "101",
              projectId: "42",
              status: "Open",
              subject: "Map the API boundary",
              updatedAt: "Today",
            },
          ],
          page: 1,
          pageSize: 20,
          total: 1,
        }}
        onRefresh={vi.fn().mockResolvedValue(undefined)}
        projectId="42"
      />,
    );

    expect(screen.getByRole("button", { name: "Open Map the API boundary" })).toBeInTheDocument();
  });

  it("opens and closes the selected work package in a split detail pane", async () => {
    const user = userEvent.setup();

    render(
      <WorkItemsPanelClient
        data={{
          hasItems: true,
          items: [
            {
              id: "101",
              projectId: "42",
              status: "Open",
              subject: "Map the API boundary",
              updatedAt: "Today",
            },
          ],
          page: 1,
          pageSize: 20,
          total: 1,
        }}
        onRefresh={vi.fn().mockResolvedValue(undefined)}
        projectId="42"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Open Map the API boundary" }));

    expect(screen.getByRole("region", { name: "Work package details" })).toHaveTextContent(
      "Map the API boundary",
    );
    expect(screen.getByRole("link", { name: "Open full work package" })).toHaveAttribute(
      "href",
      "/projects/42/work-items/101",
    );

    await user.click(screen.getByRole("button", { name: "Close work package details" }));

    expect(screen.queryByRole("region", { name: "Work package details" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open Map the API boundary" })).toBeInTheDocument();
  });

  it("resizes the split detail pane and persists its width", async () => {
    const user = userEvent.setup();
    window.localStorage.clear();

    render(
      <WorkItemsPanelClient
        data={{
          hasItems: true,
          items: [
            {
              id: "101",
              projectId: "42",
              status: "Open",
              subject: "Map the API boundary",
              updatedAt: "Today",
            },
          ],
          page: 1,
          pageSize: 20,
          total: 1,
        }}
        onRefresh={vi.fn().mockResolvedValue(undefined)}
        projectId="42"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Open Map the API boundary" }));
    const resizer = screen.getByRole("separator", { name: "Resize work package details" });

    fireEvent.pointerDown(resizer, { clientX: 800, pointerId: 1 });
    fireEvent.pointerMove(window, { clientX: 900, pointerId: 1 });
    fireEvent.pointerUp(window, { pointerId: 1 });

    expect(window.localStorage.getItem("openProject-splitViewFlexBasis")).toBe("430");
  });

  it("allows users to hide a table column from the column menu", async () => {
    const user = userEvent.setup();

    render(
      <WorkItemsPanelClient
        data={{
          hasItems: true,
          items: [
            {
              id: "1",
              projectId: "demo-project",
              status: "Open",
              subject: "Prepare release notes",
              updatedAt: "Today",
            },
          ],
          page: 1,
          pageSize: 20,
          total: 1,
        }}
        onRefresh={vi.fn().mockResolvedValue(undefined)}
        projectId="demo-project"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Configure columns" }));
    await user.click(screen.getByRole("menuitemcheckbox", { name: "Status" }));

    expect(screen.queryByRole("columnheader", { name: "Status" })).not.toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Subject" })).toBeInTheDocument();
  });

  it("refreshes the list after creating a work item instead of rendering the incomplete create response", async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn().mockResolvedValue(undefined);

    vi.mocked(createWorkItem).mockResolvedValue(undefined);

    render(
      <WorkItemsPanelClient
        data={{ hasItems: false, items: [], page: 1, pageSize: 25, total: 0 }}
        onRefresh={onRefresh}
        projectId="42"
      />,
    );

    await user.type(screen.getByLabelText("New work item"), "Map the real API");
    await user.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(createWorkItem).toHaveBeenCalledWith({ projectId: "42", title: "Map the real API" });
      expect(onRefresh).toHaveBeenCalledOnce();
    });
  });

  it("shows a field validation error when the work-item title is empty", async () => {
    const user = userEvent.setup();

    render(
      <WorkItemsPanelClient
        data={{ hasItems: false, items: [], page: 1, pageSize: 25, total: 0 }}
        onRefresh={vi.fn().mockResolvedValue(undefined)}
        projectId="42"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(await screen.findByText("Please enter a work item title.")).toBeInTheDocument();
    expect(createWorkItem).not.toHaveBeenCalled();
  });

  it("switches to card view mode and renders OpenProject-style cards", async () => {
    const user = userEvent.setup();

    render(
      <WorkItemsPanelClient
        data={{
          hasItems: true,
          items: [
            {
              id: "1",
              projectId: "demo-project",
              status: "Open",
              subject: "Prepare release notes",
              updatedAt: "Today",
            },
          ],
          page: 1,
          pageSize: 20,
          total: 1,
        }}
        onRefresh={vi.fn().mockResolvedValue(undefined)}
        projectId="demo-project"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Card view" }));

    expect(screen.getByRole("region", { name: "Work packages card view" })).toBeInTheDocument();
    expect(screen.getByRole("article", { name: "Card #1: Prepare release notes" })).toBeInTheDocument();
    expect(screen.getByText("TASK")).toBeInTheDocument();
  });

  it("creates a work package via the inline create affordance", async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn().mockResolvedValue(undefined);
    vi.mocked(createWorkItem).mockResolvedValue(undefined);

    render(
      <WorkItemsPanelClient
        data={{
          hasItems: true,
          items: [
            {
              id: "1",
              projectId: "demo-project",
              status: "Open",
              subject: "Prepare release notes",
              updatedAt: "Today",
            },
          ],
          page: 1,
          pageSize: 20,
          total: 1,
        }}
        onRefresh={onRefresh}
        projectId="demo-project"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Create new work package" }));
    const inlineInput = screen.getByLabelText("Inline work package title");
    await user.type(inlineInput, "Inline subject{Enter}");

    await waitFor(() => {
      expect(createWorkItem).toHaveBeenCalledWith({ projectId: "demo-project", title: "Inline subject" });
      expect(onRefresh).toHaveBeenCalled();
    });
  });
});

