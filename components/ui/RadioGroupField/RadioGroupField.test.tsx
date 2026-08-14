import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import { RadioGroupField } from "./RadioGroupField";

function RadioForm({ onSubmit }: { onSubmit: (values: { plan: string }) => void }) {
  const { control, handleSubmit } = useForm<{ plan: string }>({ defaultValues: { plan: "" } });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <RadioGroupField
        control={control}
        label="Plan"
        name="plan"
        options={[
          { label: "Starter", value: "starter" },
          { disabled: true, label: "Enterprise", value: "enterprise" },
        ]}
        rules={{ required: "Choose a plan" }}
      />
      <button type="submit">Continue</button>
    </form>
  );
}

describe("RadioGroupField", () => {
  it("submits controlled selections and preserves disabled options", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<RadioForm onSubmit={onSubmit} />);

    expect(screen.getByRole("radio", { name: "Enterprise" })).toBeDisabled();
    await user.click(screen.getByRole("radio", { name: "Starter" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(onSubmit).toHaveBeenCalledWith({ plan: "starter" }, expect.anything());
  });

  it("renders React Hook Form validation errors", async () => {
    const user = userEvent.setup();

    render(<RadioForm onSubmit={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(await screen.findByText("Choose a plan")).toBeInTheDocument();
  });
});
