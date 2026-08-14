import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProjectGantt } from "./ProjectGantt";

describe("ProjectGantt", () => {
  it("renders scheduled work packages in a table and timeline pair", () => {
    render(<ProjectGantt projectId="42" />);

    expect(screen.getByRole("heading", { name: "Gantt" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Scheduled work packages" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Work package timeline" })).toBeInTheDocument();
    expect(screen.getAllByText("Map the project list contract")).toHaveLength(2);
    expect(screen.getByText("Today")).toBeInTheDocument();
  });
});
