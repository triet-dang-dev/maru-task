import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ComponentShowcase } from "./ComponentShowcase";

describe("ComponentShowcase", () => {
  it("renders the component catalog and opens the confirmation dialog", async () => {
    const user = userEvent.setup();

    render(<ComponentShowcase />);

    expect(screen.getByRole("heading", { name: "Component library" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Assign owner" })).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Component example breadcrumbs" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open confirmation dialog" }));

    expect(screen.getByRole("dialog", { name: "Delete example record?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
  });

  it("switches tab content", async () => {
    const user = userEvent.setup();

    render(<ComponentShowcase />);

    await user.click(screen.getByRole("tab", { name: "Usage" }));

    expect(
      screen.getByText("Use composable primitives for product-specific workflows."),
    ).toBeVisible();
  });
});
