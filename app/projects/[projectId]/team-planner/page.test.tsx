import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/projects/components/ProjectTeamPlanner", () => ({
  ProjectTeamPlanner: ({ projectId }: { projectId: string }) => <p>Team planner for {projectId}</p>,
}));

import ProjectTeamPlannerPage from "./page";

describe("ProjectTeamPlannerPage", () => {
  it("renders the team planner workspace", async () => {
    const page = await ProjectTeamPlannerPage({
      params: Promise.resolve({ projectId: "proj-1" }),
    });

    render(page);

    expect(screen.getByText("Team planner for proj-1")).toBeInTheDocument();
  });
});
