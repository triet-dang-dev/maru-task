import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/projects/components/ProjectGantt", () => ({
  ProjectGantt: ({ projectId }: { projectId: string }) => <p>Gantt for {projectId}</p>,
}));

import ProjectGanttPage from "./page";

describe("ProjectGanttPage", () => {
  it("renders the project Gantt workspace", async () => {
    const page = await ProjectGanttPage({ params: Promise.resolve({ projectId: "proj-1" }) });

    render(page);

    expect(screen.getByText("Gantt for proj-1")).toBeInTheDocument();
  });
});
