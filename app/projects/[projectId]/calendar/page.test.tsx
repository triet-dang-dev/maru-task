import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/projects/components/ProjectCalendar", () => ({
  ProjectCalendar: ({ projectId }: { projectId: string }) => <p>Calendar for {projectId}</p>,
}));

import ProjectCalendarPage from "./page";

describe("ProjectCalendarPage", () => {
  it("renders the project calendar workspace with active navigation", async () => {
    const page = await ProjectCalendarPage({ params: Promise.resolve({ projectId: "proj-1" }) });

    render(page);

    expect(screen.getByRole("link", { name: "Calendar" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("Calendar for proj-1")).toBeInTheDocument();
  });
});
