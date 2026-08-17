import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/projects/components/ProjectWorkspaceOverview", () => ({
  ProjectWorkspaceOverview: ({ projectId }: { projectId: string }) => (
    <p>Project overview dashboard for {projectId}</p>
  ),
}));

vi.mock("@/features/projects/components/ProjectWorkspaceSummary", () => ({
  ProjectWorkspaceSummary: ({ projectId }: { projectId: string }) => (
    <p>Project summary for {projectId}</p>
  ),
}));

import ProjectPage from "./page";

describe("ProjectPage", () => {
  it("renders the project overview route", async () => {
    const page = await ProjectPage({ params: Promise.resolve({ projectId: "proj-1" }) });

    render(page);

    expect(screen.getByText("Project summary for proj-1")).toBeInTheDocument();
    expect(screen.getByText("Project overview dashboard for proj-1")).toBeInTheDocument();
  });
});
