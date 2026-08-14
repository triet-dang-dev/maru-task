import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ActionMenu, DropdownMenuItem } from "./DropdownMenu";

describe("DropdownMenu", () => {
  it("opens an action menu, selects enabled items, and closes afterward", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(
      <ActionMenu label="Record actions">
        <DropdownMenuItem onSelect={onEdit}>Edit record</DropdownMenuItem>
        <DropdownMenuItem disabled onSelect={vi.fn()}>
          Archive record
        </DropdownMenuItem>
      </ActionMenu>,
    );

    await user.click(screen.getByRole("button", { name: "Record actions" }));

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Archive record" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );

    await user.click(screen.getByRole("menuitem", { name: "Edit record" }));

    expect(onEdit).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("supports keyboard navigation and Escape dismissal", async () => {
    const user = userEvent.setup();

    render(
      <ActionMenu label="More options">
        <DropdownMenuItem onSelect={vi.fn()}>Duplicate</DropdownMenuItem>
        <DropdownMenuItem destructive onSelect={vi.fn()}>
          Delete
        </DropdownMenuItem>
      </ActionMenu>,
    );

    const trigger = screen.getByRole("button", { name: "More options" });
    await user.click(trigger);
    await user.keyboard("{ArrowDown}");

    expect(screen.getByRole("menuitem", { name: "Delete" })).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
  });
});
