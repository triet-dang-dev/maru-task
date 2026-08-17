import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ProjectTeamPlanner } from "./ProjectTeamPlanner";

describe("ProjectTeamPlanner", () => {
  it("renders the OpenProject-style assignee timeline and scheduled work packages", () => {
    render(<ProjectTeamPlanner projectId="42" />);

    expect(screen.getByRole("heading", { name: "Team planner" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add existing" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Schedule range" })).toHaveTextContent("Work week");
    expect(screen.getByRole("heading", { name: "August 17 – 21, 2026" })).toBeInTheDocument();
    expect(screen.getByRole("grid", { name: "Team planner schedule" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Assignee" })).toBeInTheDocument();
    expect(screen.getByRole("rowheader", { name: "Riley Park" })).toBeInTheDocument();
    const workPackageLink = screen.getByRole("link", {
      name: /WP-138 Confirm project stakeholder access/,
    });
    expect(workPackageLink).toHaveAttribute("href", "/projects/42/work-items/138");
    expect(workPackageLink).not.toHaveAttribute("aria-label");

    const rileyRow = screen.getByRole("row", { name: /Riley Park/ });
    expect(
      Array.from(rileyRow.children).every((child) =>
        ["gridcell", "rowheader"].includes(child.getAttribute("role") ?? ""),
      ),
    ).toBe(true);
  });

  it("opens and filters the add-existing work package pane", async () => {
    const user = userEvent.setup();
    render(<ProjectTeamPlanner projectId="42" />);

    await user.click(screen.getByRole("button", { name: "Add existing" }));

    expect(screen.getByRole("region", { name: "Available work packages" })).toBeInTheDocument();
    const search = screen.getByRole("searchbox", { name: "Search existing work packages" });
    await user.type(search, "incident");

    expect(screen.getByText("Confirm incident response owners")).toBeInTheDocument();
    expect(screen.queryByText("Prepare customer onboarding notes")).not.toBeInTheDocument();
  });

  it("switches timeline range and navigates the visible dates", async () => {
    const user = userEvent.setup();
    render(<ProjectTeamPlanner projectId="42" />);

    await user.click(screen.getByRole("combobox", { name: "Schedule range" }));
    await user.click(screen.getByRole("option", { name: "2-week" }));
    expect(screen.getAllByRole("columnheader")).toHaveLength(15);

    const initialRange = screen.getByRole("heading", { level: 2 }).textContent;
    await user.click(screen.getByRole("button", { name: "Next period" }));
    expect(screen.getByRole("heading", { level: 2 })).not.toHaveTextContent(initialRange ?? "");
  });

  it("supports loading, error, and empty planner states", () => {
    const { rerender } = render(<ProjectTeamPlanner isLoading projectId="42" />);
    expect(screen.getByRole("status", { name: "Loading team planner" })).toBeInTheDocument();

    rerender(
      <ProjectTeamPlanner errorMessage="Team planner could not be loaded." projectId="42" />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Team planner could not be loaded.");

    rerender(<ProjectTeamPlanner assignees={[]} projectId="42" />);
    expect(screen.getByText("Add assignees to set up your team planner.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add assignee" })).toBeInTheDocument();
  });

  it("adds and removes assignee rows in local planner state", async () => {
    const user = userEvent.setup();
    render(<ProjectTeamPlanner assignees={[]} projectId="42" />);

    await user.click(screen.getByRole("button", { name: "Add assignee" }));
    await user.click(screen.getByRole("combobox", { name: "Assignee" }));
    await user.click(screen.getByRole("option", { name: "Alex Morgan" }));
    await user.click(screen.getByRole("button", { name: "Add to planner" }));

    expect(screen.getByRole("rowheader", { name: "Alex Morgan" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remove Alex Morgan" }));
    expect(screen.queryByRole("rowheader", { name: "Alex Morgan" })).not.toBeInTheDocument();
  });
});
