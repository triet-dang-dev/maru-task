import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ProjectBacklog } from "./ProjectBacklog";

describe("ProjectBacklog", () => {
  it("renders the ordered backlog alongside the OpenProject-style burndown chart", () => {
    render(<ProjectBacklog projectId="42" />);

    expect(screen.getByRole("heading", { name: "Backlog" })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Prioritized work packages" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Sprint burndown" })).toBeInTheDocument();
    expect(screen.getByText("Ideal remaining")).toBeInTheDocument();
    expect(screen.getByText("Actual remaining")).toBeInTheDocument();
    expect(screen.getByText("Points")).toBeInTheDocument();
  });

  it("shows an empty state instead of a chart when the backlog has no work packages", () => {
    render(<ProjectBacklog items={[]} projectId="42" />);

    expect(screen.getByText("No work packages in this backlog")).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Sprint burndown" })).not.toBeInTheDocument();
  });

  it("reorders work packages with keyboard-accessible controls and shows sprint assignment", async () => {
    const user = userEvent.setup();

    render(<ProjectBacklog projectId="42" />);

    await user.click(screen.getByRole("button", { name: "Move WP-144 up" }));
    expect(screen.getAllByRole("listitem")[0]).toHaveTextContent("WP-144");

    await user.click(screen.getByRole("combobox", { name: "Sprint" }));
    await user.click(screen.getByRole("option", { name: "Sprint 12" }));
    expect(screen.getByText("Sprint 12 is planned")).toBeInTheDocument();
  });

  it("renders burndown loading and empty-data states", () => {
    const { rerender } = render(<ProjectBacklog isBurndownLoading projectId="42" />);

    expect(screen.getByRole("status", { name: "Loading sprint burndown" })).toBeInTheDocument();

    rerender(<ProjectBacklog burndownData={[]} projectId="42" />);

    expect(screen.getByText("No burndown data yet")).toBeInTheDocument();
    expect(screen.queryByLabelText("Burndown chart")).not.toBeInTheDocument();
  });
});
