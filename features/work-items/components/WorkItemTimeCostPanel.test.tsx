import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { WorkItemTimeCostPanel } from "./WorkItemTimeCostPanel";

describe("WorkItemTimeCostPanel", () => {
  it("lists time and cost entries and adds a local time entry", async () => {
    const user = userEvent.setup();

    render(
      <WorkItemTimeCostPanel
        costEntries={[{ amount: 125, date: "2026-08-14", id: "cost-1", note: "Research materials" }]}
        timeEntries={[{ date: "2026-08-13", hours: 2.5, id: "time-1", note: "Reviewed API contract" }]}
      />,
    );

    expect(screen.getByRole("table", { name: "Time entries" })).toBeInTheDocument();
    expect(screen.getByText("2.5 h")).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Cost entries" })).toBeInTheDocument();
    expect(screen.getByText("$125.00")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Hours"), "1.5");
    await user.type(screen.getByLabelText("Time entry note"), "Prepared release notes");
    await user.click(screen.getByRole("button", { name: "Add time entry" }));

    expect(screen.getByText("Prepared release notes")).toBeInTheDocument();
    expect(screen.getByText("1.5 h")).toBeInTheDocument();
  });
});