import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProjectSprintsPanel } from "./ProjectSprintsPanel";

describe("ProjectSprintsPanel", () => {
  it("renders project sprints with their dates and status", () => {
    render(
      <ProjectSprintsPanel
        data={{
          items: [
            {
              endDate: "2026-09-14T00:00:00Z",
              id: "7",
              name: "September delivery",
              startDate: "2026-09-01T00:00:00Z",
              status: "Active",
            },
          ],
          page: 1,
          pageSize: 25,
          total: 1,
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "Sprints" })).toBeInTheDocument();
    expect(screen.getByText("September delivery")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Sep 1, 2026 - Sep 14, 2026")).toBeInTheDocument();
  });
});