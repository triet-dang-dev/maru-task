import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ToastProvider } from "@/components/ui/Toast";

const { loadMyPageData } = vi.hoisted(() => ({ loadMyPageData: vi.fn() }));
const { createProject, routerPush } = vi.hoisted(() => ({
  createProject: vi.fn(),
  routerPush: vi.fn(),
}));

vi.mock("../service", () => ({ loadMyPageData }));
vi.mock("@/features/projects/service", () => ({ createProject }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: routerPush }) }));

import { MyPageDashboard } from "./MyPageDashboard";

describe("MyPageDashboard", () => {
  beforeEach(() => {
    createProject.mockResolvedValue({
      code: "PLT",
      createdAt: "2026-08-18T00:00:00Z",
      description: "Platform work",
      id: "project-7",
      name: "Platform",
      status: "Active",
      updatedAt: "2026-08-18T00:00:00Z",
    });
    loadMyPageData.mockResolvedValue({
      calendarEvents: [],
      favoriteProjects: [],
      spentTime: [],
      workPackages: [],
    });
  });

  it("loads projects and work packages from the API", async () => {
    loadMyPageData.mockResolvedValue({
      calendarEvents: [],
      favoriteProjects: [{ id: "project-7", name: "Platform" }],
      spentTime: [],
      workPackages: [
        {
          id: "work-24",
          projectId: "project-7",
          status: "Open",
          subject: "Implement the backend integration",
        },
      ],
    });

    render(<MyPageDashboard />);

    expect(await screen.findByRole("link", { name: "Platform" })).toHaveAttribute(
      "href",
      "/projects/project-7",
    );
    expect(screen.getByRole("link", { name: /Implement the backend integration/ })).toHaveAttribute(
      "href",
      "/projects/project-7/work-items/work-24",
    );
  });

  it("hides widgets and shows an empty state when there is no personal data", async () => {
    render(<MyPageDashboard />);

    expect(await screen.findByRole("heading", { name: "My page" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "No personal data yet" })).toBeInTheDocument();
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("shows project creation without an add-widget action", async () => {
    render(<MyPageDashboard />);

    await screen.findByRole("button", { name: "Create project" });
    expect(screen.getByRole("button", { name: "Create project" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add widget" })).not.toBeInTheDocument();
  });

  it("creates a project from My page and opens the new project", async () => {
    const user = userEvent.setup();
    render(<MyPageDashboard />);

    await user.click(await screen.findByRole("button", { name: "Create project" }));
    const dialog = screen.getByRole("dialog", { name: "Create project" });
    await user.type(within(dialog).getByRole("textbox", { name: "Project name" }), "Platform Team");
    expect(within(dialog).getByRole("textbox", { name: "Project code" })).toHaveValue(
      "platform-team",
    );
    expect(within(dialog).getByRole("textbox", { name: "Project code" })).toBeDisabled();
    await user.type(within(dialog).getByRole("textbox", { name: "Description" }), "Platform work");
    await user.click(within(dialog).getByRole("button", { name: "Create project" }));

    await waitFor(() => {
      expect(createProject).toHaveBeenCalledWith({
        code: "platform-team",
        description: "Platform work",
        name: "Platform Team",
      });
    });
    expect(routerPush).toHaveBeenCalledWith("/projects/project-7");
  });

  it("supports keyboard-friendly widget ordering and removal", async () => {
    const user = userEvent.setup();
    loadMyPageData.mockResolvedValue({
      calendarEvents: [],
      favoriteProjects: [{ id: "project-7", name: "Platform" }],
      spentTime: [{ day: "Mon", hours: 2 }],
      workPackages: [
        {
          id: "work-24",
          projectId: "project-7",
          status: "Open",
          subject: "Implement the backend integration",
        },
      ],
    });
    render(<MyPageDashboard />);

    await screen.findByRole("heading", { name: "My page" });
    await user.click(screen.getByRole("button", { name: "Move My spent time earlier" }));
    const widgets = screen
      .getAllByRole("region")
      .map((widget) => widget.getAttribute("aria-label"));
    expect(widgets.slice(0, 2)).toEqual(["My spent time", "Work packages assigned to me"]);

    await user.click(screen.getByRole("button", { name: "Remove My spent time widget" }));
    expect(screen.queryByRole("region", { name: "My spent time" })).not.toBeInTheDocument();
  });

  it("covers loading and API failure states", async () => {
    loadMyPageData.mockImplementation(() => new Promise(() => {}));
    const { rerender } = render(<MyPageDashboard />);
    expect(screen.getByRole("status", { name: "Loading my page" })).toBeInTheDocument();

    loadMyPageData.mockRejectedValueOnce(new Error("Unavailable"));
    rerender(<MyPageDashboard key="failed-request" />);
    expect(
      await screen.findByText(
        "Your personal overview could not be loaded. Please try again later.",
      ),
    ).toBeInTheDocument();
  });
});
