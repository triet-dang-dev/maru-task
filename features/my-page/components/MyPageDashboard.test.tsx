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
    localStorage.clear();
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
      news: [],
      spentTime: [],
      workPackages: [],
    });
  });

  it("loads projects and work packages from the API", async () => {
    loadMyPageData.mockResolvedValue({
      calendarEvents: [],
      favoriteProjects: [{ code: "PLT", id: "project-7", name: "Platform", status: "Active" }],
      news: [],
      spentTime: [],
      workPackages: [
        {
          id: "work-24",
          priority: "High",
          projectId: "project-7",
          status: "Open",
          subject: "Implement the backend integration",
        },
      ],
    });

    render(
      <ToastProvider>
        <MyPageDashboard />
      </ToastProvider>,
    );

    expect(await screen.findByRole("link", { name: /Platform/ })).toHaveAttribute(
      "href",
      "/projects/project-7",
    );
    expect(screen.getByRole("link", { name: /Implement the backend integration/ })).toHaveAttribute(
      "href",
      "/projects/project-7/work-items",
    );
  });

  it("shows Add widget and Reset layout actions in the header", async () => {
    render(
      <ToastProvider>
        <MyPageDashboard />
      </ToastProvider>,
    );

    expect(await screen.findByRole("heading", { name: "My page" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Add widget" })[0]).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset layout" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create project" })).toBeInTheDocument();
  });

  it("adds a new widget from the Add Widget dialog", async () => {
    const user = userEvent.setup();
    loadMyPageData.mockResolvedValue({
      calendarEvents: [{ date: "Aug 20", id: "1", title: "Milestone Release" }],
      favoriteProjects: [{ id: "project-7", name: "Platform" }],
      news: [{ date: "Today", id: "n1", summary: "Release 2.0", title: "News 1" }],
      spentTime: [{ day: "Mon", hours: 4 }],
      workPackages: [
        {
          id: "work-24",
          projectId: "project-7",
          status: "Open",
          subject: "Task 1",
        },
      ],
    });

    render(
      <ToastProvider>
        <MyPageDashboard />
      </ToastProvider>,
    );

    await screen.findByRole("heading", { name: "My page" });
    const addBtn = screen.getAllByRole("button", { name: "Add widget" })[0];
    await user.click(addBtn);

    const dialog = screen.getByRole("dialog", { name: "Add widget to My page" });
    expect(dialog).toBeInTheDocument();

    const newsOption = within(dialog).getByText("Subscribed news");
    expect(newsOption).toBeInTheDocument();

    // Click Add on the Subscribed news row
    const addNewsBtn = within(newsOption.closest("li")!).getByRole("button", { name: "Add" });
    await user.click(addNewsBtn);

    expect(await screen.findByRole("heading", { name: "Subscribed news" })).toBeInTheDocument();
  });

  it("creates a project from My page and opens the new project", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <MyPageDashboard />
      </ToastProvider>,
    );

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
    render(
      <ToastProvider>
        <MyPageDashboard />
      </ToastProvider>,
    );

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
    const { rerender } = render(
      <ToastProvider>
        <MyPageDashboard />
      </ToastProvider>,
    );
    expect(screen.getByRole("status", { name: "Loading my page" })).toBeInTheDocument();

    loadMyPageData.mockRejectedValueOnce(new Error("Unavailable"));
    rerender(
      <ToastProvider>
        <MyPageDashboard key="failed-request" />
      </ToastProvider>,
    );
    expect(
      await screen.findByText(
        "Your personal overview could not be loaded. Please try again later.",
      ),
    ).toBeInTheDocument();
  });
});
