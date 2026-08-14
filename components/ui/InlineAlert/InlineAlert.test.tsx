import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { InlineAlert } from "./InlineAlert";

describe("InlineAlert", () => {
  it("uses urgency-aware roles and renders supporting content", () => {
    const { rerender } = render(
      <InlineAlert title="Saved" tone="success">
        Workspace settings were updated.
      </InlineAlert>,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Saved");

    rerender(
      <InlineAlert title="Unable to save" tone="error">
        Check the highlighted fields.
      </InlineAlert>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Check the highlighted fields.");
  });

  it("supports actions and accessible dismissal", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();

    render(
      <InlineAlert
        action={<button type="button">Retry</button>}
        dismissLabel="Dismiss warning"
        onDismiss={onDismiss}
        tone="warning"
      >
        Connection interrupted.
      </InlineAlert>,
    );

    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Dismiss warning" }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
