import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ColumnDef } from "@tanstack/react-table";
import { describe, expect, it } from "vitest";

import { DataTable } from "./DataTable";

interface ProjectRow {
  name: string;
  owner: string;
}

const columns: Array<ColumnDef<ProjectRow>> = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "owner",
    header: "Owner",
  },
];

const rows: ProjectRow[] = [
  { name: "Zeta", owner: "Nina" },
  { name: "Alpha", owner: "Ari" },
  { name: "Beta", owner: "Lee" },
];

function getBodyRows() {
  return screen.getAllByTestId("data-table-row");
}

describe("DataTable", () => {
  it("sorts rows when a sortable header is clicked", async () => {
    const user = userEvent.setup();

    render(<DataTable columns={columns} data={rows} />);

    await user.click(screen.getByRole("button", { name: "Name" }));

    expect(within(getBodyRows()[0]).getByText("Alpha")).toBeInTheDocument();
    expect(within(getBodyRows()[1]).getByText("Beta")).toBeInTheDocument();
  });

  it("filters rows with the global search field", async () => {
    const user = userEvent.setup();

    render(<DataTable columns={columns} data={rows} />);

    await user.type(screen.getByLabelText("Search table"), "alpha");

    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.queryByText("Zeta")).not.toBeInTheDocument();
  });

  it("paginates rows", async () => {
    const user = userEvent.setup();

    render(<DataTable columns={columns} data={rows} initialPageSize={1} />);

    expect(screen.getByText("Zeta")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Go to next page" }));

    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.queryByText("Zeta")).not.toBeInTheDocument();
  });

  it("keeps a custom initial page size available in the pagination control", async () => {
    const user = userEvent.setup();

    render(<DataTable columns={columns} data={rows} initialPageSize={3} />);

    await user.click(screen.getByRole("combobox", { name: "Rows per page:" }));

    expect(await screen.findByRole("option", { name: "3" })).toBeInTheDocument();
  });

  it("renders loading and empty states", () => {
    const { rerender } = render(<DataTable columns={columns} data={[]} isLoading />);

    expect(screen.getByText("Loading data...")).toBeInTheDocument();
    expect(screen.getByRole("table")).toHaveAttribute("aria-busy", "true");

    rerender(<DataTable columns={columns} data={[]} />);

    expect(screen.getByText("No records found.")).toBeInTheDocument();
    expect(screen.getByRole("table")).toHaveAttribute("aria-busy", "false");
  });
});
