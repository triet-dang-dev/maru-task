import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProjectBoard } from "./ProjectBoard";

describe("ProjectBoard", () => {
  it("renders a read-only Kanban board with stable status lanes", () => {
    render(<ProjectBoard projectId="proj-1" />);

    expect(screen.getByRole("heading", { name: "Delivery board" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Kanban board" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Open 3" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "In progress 2" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Done 2" })).toBeInTheDocument();
    expect(screen.getByText("Review the release checklist")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open work packages" })).toHaveAttribute(
      "href",
      "/projects/proj-1/work-items",
    );
  });
});
