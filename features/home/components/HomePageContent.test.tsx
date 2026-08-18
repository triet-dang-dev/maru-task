import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ToastProvider } from "@/components/ui/Toast";
import type { HomeData } from "../types";

const { loadHomeData } = vi.hoisted(() => ({ loadHomeData: vi.fn() }));
const { createProject, createWorkItem, routerPush } = vi.hoisted(() => ({
  createProject: vi.fn(),
  createWorkItem: vi.fn(),
  routerPush: vi.fn(),
}));

vi.mock("../service", () => ({ loadHomeData }));
vi.mock("@/features/projects/service", () => ({ createProject }));
vi.mock("@/features/work-items/service", () => ({ createWorkItem }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: routerPush }) }));

import { HomePageContent } from "./HomePageContent";

const mockHomeData: HomeData = {
  announcement: {
    id: "announcement-1",
    message: "System maintenance scheduled for Sunday at 02:00 UTC.",
    title: "Scheduled Maintenance",
    type: "info",
  },
  assignedTasks: [
    {
      dueDate: "2026-08-20",
      id: "work-1",
      priorityLabel: "High",
      priorityTone: "warning",
      projectId: "project-1",
      projectName: "Website Redesign",
      status: "In Progress",
      statusTone: "info",
      subject: "Design system dark mode audit",
    },
  ],
  meetings: [
    {
      endAt: "11:00 AM",
      id: "meeting-1",
      location: "Room Alpha",
      participantsCount: 5,
      startAt: "Today, 10:00 AM",
      title: "Sprint Review & Demo",
    },
  ],
  metrics: {
    activeProjectsCount: 4,
    activeSprintsCount: 2,
    dueTodayCount: 1,
    openWorkPackagesCount: 12,
  },
  news: [
    {
      authorName: "Admin",
      id: "news-1",
      publishedAt: "Today",
      summary: "Maru Task 2.0 release overview",
      title: "New Navigation and Modules Released",
    },
  ],
  recentProjects: [
    {
      code: "WEB",
      description: "Company main website project",
      id: "project-1",
      isFavorite: true,
      name: "Website Redesign",
      statusLabel: "On track",
      statusTone: "info",
      updatedAt: "2026-08-18",
    },
  ],
  resourceLinks: [
    {
      description: "Learn how to manage projects and workflows.",
      external: false,
      href: "/docs/user-guides",
      iconName: "book-open",
      title: "User guides",
    },
    {
      description: "Quick commands and keyboard navigation.",
      external: false,
      href: "/docs/shortcuts",
      iconName: "keyboard",
      title: "Keyboard shortcuts",
    },
  ],
};

describe("HomePageContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createProject.mockResolvedValue({
      code: "NEW-PRJ",
      createdAt: "2026-08-18T00:00:00Z",
      description: "New project description",
      id: "project-new",
      name: "New Project",
      status: "Active",
      updatedAt: "2026-08-18T00:00:00Z",
    });
    createWorkItem.mockResolvedValue(undefined);
    loadHomeData.mockResolvedValue(mockHomeData);
  });

  it("renders the Home landing page with metrics, announcement, and widgets", async () => {
    render(
      <ToastProvider>
        <HomePageContent />
      </ToastProvider>,
    );

    expect(await screen.findByRole("heading", { level: 1, name: "Home" })).toBeInTheDocument();
    expect(screen.getByText("Scheduled Maintenance")).toBeInTheDocument();
    expect(screen.getByText("System maintenance scheduled for Sunday at 02:00 UTC.")).toBeInTheDocument();

    // KPI Metrics
    expect(screen.getByTestId("metric-active-projects")).toHaveTextContent("4");
    expect(screen.getByTestId("metric-open-work-packages")).toHaveTextContent("12");
    expect(screen.getByTestId("metric-due-today")).toHaveTextContent("1");
    expect(screen.getByTestId("metric-active-sprints")).toHaveTextContent("2");

    // Recent Projects
    const recentProjectsWidget = screen.getByTestId("home-recent-projects");
    expect(within(recentProjectsWidget).getByRole("heading", { name: "Projects & Workspaces" })).toBeInTheDocument();
    expect(within(recentProjectsWidget).getByRole("link", { name: /Website Redesign/ })).toHaveAttribute(
      "href",
      "/projects/project-1",
    );

    // Assigned Tasks
    const assignedTasksWidget = screen.getByTestId("home-assigned-tasks");
    expect(within(assignedTasksWidget).getByRole("heading", { name: "Work Packages & Tasks" })).toBeInTheDocument();
    expect(within(assignedTasksWidget).getByRole("link", { name: /Design system dark mode audit/ })).toHaveAttribute(
      "href",
      "/projects/project-1/work-items",
    );

    // Meetings
    expect(screen.getByRole("heading", { name: "Upcoming Meetings" })).toBeInTheDocument();
    expect(screen.getByText("Sprint Review & Demo")).toBeInTheDocument();

    // News
    expect(screen.getByRole("heading", { name: "News & Updates" })).toBeInTheDocument();
    expect(screen.getByText("New Navigation and Modules Released")).toBeInTheDocument();

    // Resource links
    expect(screen.getByRole("heading", { name: "Guides, Documentation & Community" })).toBeInTheDocument();
    expect(screen.getByText("User guides")).toBeInTheDocument();
    expect(screen.getByText("Keyboard shortcuts")).toBeInTheDocument();
  });

  it("opens the Create Project modal and redirects on successful submit", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <HomePageContent />
      </ToastProvider>,
    );

    await screen.findByRole("heading", { level: 1, name: "Home" });
    const createProjectBtn = screen.getAllByRole("button", { name: "New project" })[0];
    await user.click(createProjectBtn);

    const modal = screen.getByRole("dialog", { name: "Create project" });
    expect(modal).toBeInTheDocument();

    const nameInput = within(modal).getByLabelText(/Project name/i);
    await user.type(nameInput, "Alpha Platform");

    const descriptionInput = within(modal).getByLabelText(/Description/i);
    await user.type(descriptionInput, "Main platform core engineering");

    const submitBtn = within(modal).getByRole("button", { name: "Create project" });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(createProject).toHaveBeenCalledWith({
        code: "alpha-platform",
        description: "Main platform core engineering",
        name: "Alpha Platform",
      });
      expect(routerPush).toHaveBeenCalledWith("/projects/project-new");
    });
  });

  it("opens the Create Work Item modal and submits a new task", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <HomePageContent />
      </ToastProvider>,
    );

    await screen.findByRole("heading", { level: 1, name: "Home" });
    const createWorkItemBtn = screen.getAllByRole("button", { name: "New work item" })[0];
    await user.click(createWorkItemBtn);

    const modal = screen.getByRole("dialog", { name: "Create work item" });
    expect(modal).toBeInTheDocument();

    const titleInput = within(modal).getByLabelText(/Work item title \/ subject/i);
    await user.type(titleInput, "Audit API rate limits");

    const submitBtn = within(modal).getByRole("button", { name: "Create work item" });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(createWorkItem).toHaveBeenCalledWith({
        projectId: "project-1",
        title: "Audit API rate limits",
      });
    });
  });

  it("renders error state with retry when data loading fails", async () => {
    loadHomeData.mockRejectedValueOnce(new Error("Network Error"));

    render(
      <ToastProvider>
        <HomePageContent />
      </ToastProvider>,
    );

    expect(await screen.findByRole("heading", { name: "Workspace unavailable" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });
});
