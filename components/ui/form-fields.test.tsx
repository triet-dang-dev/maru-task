import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./Button";
import { CheckboxField } from "./CheckboxField";
import { InputField } from "./InputField";
import { SelectBox } from "./SelectBox";

interface ExampleFormValues {
  acceptTerms: boolean;
  email: string;
  role: string;
}

function ExampleForm({ onSubmit }: { onSubmit: (values: ExampleFormValues) => void }) {
  const { control, handleSubmit } = useForm<ExampleFormValues>({
    defaultValues: {
      acceptTerms: false,
      email: "",
      role: "member",
    },
    mode: "onSubmit",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <InputField
        control={control}
        label="Email"
        name="email"
        rules={{ required: "Email is required" }}
      />
      <SelectBox
        control={control}
        label="Role"
        name="role"
        options={[
          { label: "Member", value: "member" },
          { label: "Admin", value: "admin" },
        ]}
      />
      <CheckboxField
        control={control}
        label="Accept terms"
        name="acceptTerms"
        rules={{ required: "Terms must be accepted" }}
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}

describe("form field primitives", () => {
  it("associates labels with uncontrolled fields", () => {
    render(<InputField label="Project name" name="projectName" />);

    expect(screen.getByLabelText("Project name")).toBeInTheDocument();
  });

  it("renders React Hook Form errors consistently", async () => {
    const user = userEvent.setup();

    render(<ExampleForm onSubmit={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Terms must be accepted")).toBeInTheDocument();
  });

  it("submits controlled field values through React Hook Form", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<ExampleForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Email"), "admin@example.com");
    await user.click(screen.getByLabelText("Accept terms"));
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(onSubmit).toHaveBeenCalledWith(
      {
        acceptTerms: true,
        email: "admin@example.com",
        role: "member",
      },
      expect.anything(),
    );
  });
});
