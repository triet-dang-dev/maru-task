import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProjectWorkspaceOverview } from "./ProjectWorkspaceOverview";

describe("ProjectWorkspaceOverview", () => {
  it("renders a project health snapshot, current work, and activity", () => {
    render(<ProjectWorkspaceOverview projectId="proj-1" />);

    expect(screen.getByRole("heading", { name: "Project overview" })).toBeInTheDocument();
    expect(screen.getByText("Project health")).toBeInTheDocument();
    expect(screen.getByText("On track")).toBeInTheDocument();
    expect(screen.getByText("Work packages by status")).toBeInTheDocument();
    expect(screen.getByText("Recent work packages")).toBeInTheDocument();
    expect(screen.getByText("Recent activity")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open work packages" })).toHaveAttribute(
      "href",
      "/projects/proj-1/work-items",
    );
  });
});
