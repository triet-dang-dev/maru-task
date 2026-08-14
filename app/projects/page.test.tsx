import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/projects/components/ProjectsPageContent", () => ({
  ProjectsPageContent: () => <p>Project list content</p>,
}));

import ProjectsPage from "./page";

describe("ProjectsPage", () => {
  it("renders the project list route backed by the projects feature", () => {
    render(<ProjectsPage />);

    expect(screen.getByRole("heading", { name: "Projects" })).toBeInTheDocument();
    expect(screen.getByText("Project list content")).toBeInTheDocument();
  });
});
