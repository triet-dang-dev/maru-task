import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import { SwitchField } from "./SwitchField";

function SwitchForm({ onSubmit }: { onSubmit: (values: { notifications: boolean }) => void }) {
  const { control, handleSubmit } = useForm<{ notifications: boolean }>({
    defaultValues: { notifications: false },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <SwitchField
        control={control}
        helperText="Send updates to the workspace owner."
        label="Email notifications"
        name="notifications"
      />
      <button type="submit">Save</button>
    </form>
  );
}

describe("SwitchField", () => {
  it("associates helper text and submits controlled boolean values", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<SwitchForm onSubmit={onSubmit} />);

    const input = screen.getByRole("switch", { name: "Email notifications" });
    expect(input).toHaveAccessibleDescription("Send updates to the workspace owner.");

    await user.click(input);
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onSubmit).toHaveBeenCalledWith({ notifications: true }, expect.anything());
  });
});
