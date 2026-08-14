import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import { AutocompleteField } from "./AutocompleteField";

interface TeamOption {
  id: string;
  label: string;
}

const teams: TeamOption[] = [
  { id: "platform", label: "Platform" },
  { id: "product", label: "Product" },
];

function AutocompleteForm({
  onSubmit,
}: {
  onSubmit: (values: { team: TeamOption | null }) => void;
}) {
  const { control, handleSubmit } = useForm<{ team: TeamOption | null }>({
    defaultValues: { team: null },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <AutocompleteField
        control={control}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        label="Team"
        name="team"
        options={teams}
      />
      <button type="submit">Assign</button>
    </form>
  );
}

describe("AutocompleteField", () => {
  it("filters options and submits a React Hook Form value", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<AutocompleteForm onSubmit={onSubmit} />);

    await user.type(screen.getByRole("combobox", { name: "Team" }), "plat");
    await user.click(await screen.findByRole("option", { name: "Platform" }));
    await user.click(screen.getByRole("button", { name: "Assign" }));

    expect(onSubmit).toHaveBeenCalledWith({ team: teams[0] }, expect.anything());
  });

  it("shows loading and empty states", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <AutocompleteField
        getOptionLabel={(option: TeamOption) => option.label}
        label="Owner"
        loading
        name="owner"
        open
        options={[]}
      />,
    );

    expect(await screen.findByText("Loading…")).toBeInTheDocument();

    rerender(
      <AutocompleteField
        getOptionLabel={(option: TeamOption) => option.label}
        label="Owner"
        name="owner"
        noOptionsText="No teams found"
        open
        options={[]}
      />,
    );

    await user.click(screen.getByRole("combobox", { name: "Owner" }));
    expect(await screen.findByText("No teams found")).toBeInTheDocument();
  });
});
