import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/projects/components/ProjectBoard", () => ({
  ProjectBoard: ({ projectId }: { projectId: string }) => <p>Board for {projectId}</p>,
}));

import ProjectBoardsPage from "./page";

describe("ProjectBoardsPage", () => {
  it("renders the project boards workspace with active navigation", async () => {
    const page = await ProjectBoardsPage({ params: Promise.resolve({ projectId: "proj-1" }) });

    render(page);

    expect(screen.getByRole("navigation", { name: "Project navigation" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Boards" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("Board for proj-1")).toBeInTheDocument();
  });
});
