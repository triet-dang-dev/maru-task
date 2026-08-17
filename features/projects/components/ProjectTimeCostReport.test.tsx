import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProjectTimeCostReport } from "./ProjectTimeCostReport";

describe("ProjectTimeCostReport", () => {
  it("renders date filters, totals, and time-cost report rows", () => {
    render(<ProjectTimeCostReport projectId="42" />);

    expect(screen.getByRole("heading", { name: "Time and cost report" })).toBeInTheDocument();
    expect(screen.getByLabelText("From date")).toBeInTheDocument();
    expect(screen.getByLabelText("To date")).toBeInTheDocument();
    expect(screen.getByText("18.5 h")).toBeInTheDocument();
    expect(screen.getByText("$775.00")).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Project time and cost entries" })).toBeInTheDocument();
    expect(screen.getByText("Review the release checklist")).toBeInTheDocument();
  });
});