import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ToastProvider } from "@/components/ui/Toast";

const { getProjects, createProject, routerPush, routerReplace } = vi.hoisted(() => ({
  createProject: vi.fn(),
  getProjects: vi.fn(),
  routerPush: vi.fn(),
  routerReplace: vi.fn(),
}));

vi.mock("../service", () => ({
  createProject,
  getProjects,
}));

let mockSearchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush, replace: routerReplace }),
  useSearchParams: () => mockSearchParams,
}));

import { ProjectsPageContent } from "./ProjectsPageContent";

const mockProjects = {
  items: [
    {
      code: "WEB",
      id: "project-1",
      name: "Website Redesign",
      status: "On track",
      updatedAt: "2026-08-18T10:00:00Z",
    },
    {
      code: "MOB",
      id: "project-2",
      name: "Mobile Application",
      status: "At risk",
      updatedAt: "2026-08-17T10:00:00Z",
    },
    {
      code: "ARC",
      id: "project-3",
      name: "Old Legacy System",
      status: "Archived",
      updatedAt: "2026-08-01T10:00:00Z",
    },
  ],
  page: 1,
  pageSize: 10,
  total: 3,
};

describe("ProjectsPageContent", () => {
  beforeEach(() => {
    localStorage.clear();
    mockSearchParams = new URLSearchParams();
    vi.clearAllMocks();
    getProjects.mockResolvedValue(mockProjects);
    createProject.mockResolvedValue({
      code: "NEW-PRJ",
      createdAt: "2026-08-18T00:00:00Z",
      description: "New platform project",
      id: "project-new",
      name: "New Project",
      status: "Active",
      updatedAt: "2026-08-18T00:00:00Z",
    });
  });

  it("renders active projects in the data table by default", async () => {
    render(
      <ToastProvider>
        <ProjectsPageContent />
      </ToastProvider>,
    );

    expect(await screen.findByRole("link", { name: "Website Redesign" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Mobile Application" })).toBeInTheDocument();
    // Archived is filtered out of Active view
    expect(screen.queryByRole("link", { name: "Old Legacy System" })).not.toBeInTheDocument();
  });

  it("toggles between Table view and Grid Card view", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ProjectsPageContent />
      </ToastProvider>,
    );

    await screen.findByRole("link", { name: "Website Redesign" });
    const cardViewBtn = screen.getByRole("button", { name: "Grid card view" });
    await user.click(cardViewBtn);

    // Cards render Overview and Work items buttons per card
    const overviewButtons = screen.getAllByRole("link", { name: "Overview" });
    expect(overviewButtons.length).toBeGreaterThan(0);
  });

  it("filters by status when status button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ProjectsPageContent />
      </ToastProvider>,
    );

    await screen.findByRole("link", { name: "Website Redesign" });
    const atRiskBtn = screen.getByRole("button", { name: "At risk" });
    await user.click(atRiskBtn);

    expect(routerReplace).toHaveBeenCalledWith("/projects?status=at-risk");
  });

  it("toggles star favorite and persists to localStorage", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ProjectsPageContent />
      </ToastProvider>,
    );

    await screen.findByRole("link", { name: "Website Redesign" });
    const favButtons = screen.getAllByRole("button", { name: "Mark as favorite" });
    await user.click(favButtons[0]);

    expect(localStorage.getItem("maru_task_favorite_projects")).toContain("project-1");
  });

  it("opens Create Project modal and submits a new project", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ProjectsPageContent />
      </ToastProvider>,
    );

    await screen.findByRole("link", { name: "Website Redesign" });
    const createBtn = screen.getByRole("button", { name: "Create project" });
    await user.click(createBtn);

    const dialog = screen.getByRole("dialog", { name: "Create project" });
    expect(dialog).toBeInTheDocument();

    const nameInput = within(dialog).getByLabelText(/Project name/i);
    await user.type(nameInput, "Alpha Hub");

    const descriptionInput = within(dialog).getByLabelText(/Description/i);
    await user.type(descriptionInput, "Centralized operations hub");

    const submitBtn = within(dialog).getByRole("button", { name: "Create project" });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(createProject).toHaveBeenCalledWith({
        code: "alpha-hub",
        description: "Centralized operations hub",
        name: "Alpha Hub",
      });
      expect(routerPush).toHaveBeenCalledWith("/projects/project-new");
    });
  });
});
