import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Modal } from "./Modal";

describe("Modal", () => {
  it("renders dialog content and closes from the close button", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <Modal onClose={onClose} open title="Invite teammate">
        <p>Send an invite to a teammate.</p>
      </Modal>,
    );

    expect(screen.getByRole("dialog", { name: "Invite teammate" })).toBeInTheDocument();
    expect(screen.getByText("Send an invite to a teammate.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close dialog" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
