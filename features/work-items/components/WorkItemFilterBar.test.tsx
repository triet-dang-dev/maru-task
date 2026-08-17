import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { WorkItemFilterBar, type FilterCriteria } from "./WorkItemFilterBar";

describe("WorkItemFilterBar", () => {
  it("renders active filters and calls onFiltersChange when a new filter is added", async () => {
    const user = userEvent.setup();
    const handleFiltersChange = vi.fn();
    const initialFilters: FilterCriteria[] = [
      {
        field: "status",
        id: "filter-1",
        operator: "is",
        value: "Open",
      },
    ];

    render(
      <WorkItemFilterBar
        filters={initialFilters}
        onFiltersChange={handleFiltersChange}
        statusOptions={["Open", "In progress", "Done"]}
      />,
    );

    expect(screen.getByText("Active Filters")).toBeInTheDocument();
    expect(screen.getByText("1 active")).toBeInTheDocument();

    // Remove existing filter
    await user.click(screen.getByRole("button", { name: "Remove filter Status" }));
    expect(handleFiltersChange).toHaveBeenCalledWith([]);
  });

  it("clears all active filters when Clear all is clicked", async () => {
    const user = userEvent.setup();
    const handleFiltersChange = vi.fn();
    const initialFilters: FilterCriteria[] = [
      { field: "status", id: "filter-1", operator: "is", value: "Open" },
      { field: "priority", id: "filter-2", operator: "is", value: "High" },
    ];

    render(
      <WorkItemFilterBar
        filters={initialFilters}
        onFiltersChange={handleFiltersChange}
      />,
    );

    expect(screen.getByText("2 active")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear all" }));
    expect(handleFiltersChange).toHaveBeenCalledWith([]);
  });
});
