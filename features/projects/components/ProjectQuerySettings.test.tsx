import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ProjectQuerySettings } from "./ProjectQuerySettings";

describe("ProjectQuerySettings", () => {
  it("opens the source-aligned table configuration and applies query changes", async () => {
    const user = userEvent.setup();
    const { container } = render(<ProjectQuerySettings />);

    const serializedQuery = container.querySelector<HTMLInputElement>(
      'input[name="defaultWorkPackageQuery"]',
    );
    expect(serializedQuery?.value).toContain('"field":"status"');

    await user.click(screen.getByRole("button", { name: "Edit query" }));

    expect(screen.getByRole("dialog", { name: "Table configuration" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Filters" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Columns" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Sort by" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Display settings" })).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Filter field"), "assignee");
    await user.selectOptions(screen.getByLabelText("Filter value"), "me");
    await user.click(screen.getByRole("button", { name: "Add filter" }));
    await user.click(screen.getByRole("button", { name: "Apply" }));

    expect(screen.queryByRole("dialog", { name: "Table configuration" })).not.toBeInTheDocument();
    expect(screen.getByText(/2 active filters/)).toBeInTheDocument();
    expect(serializedQuery?.value).toContain('"field":"assignee"');
  });

  it("discards draft changes when the modal is cancelled", async () => {
    const user = userEvent.setup();
    const { container } = render(<ProjectQuerySettings />);
    const serializedQuery = container.querySelector<HTMLInputElement>(
      'input[name="defaultWorkPackageQuery"]',
    );
    const initialValue = serializedQuery?.value;

    await user.click(screen.getByRole("button", { name: "Edit query" }));
    await user.click(screen.getByRole("tab", { name: "Columns" }));
    await user.click(screen.getByRole("checkbox", { name: "Assignee" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(serializedQuery).toHaveValue(initialValue);
  });
});
