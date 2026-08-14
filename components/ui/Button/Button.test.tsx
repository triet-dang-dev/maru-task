import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "./Button";

describe("Button", () => {
  it("disables the button and shows a loading indicator while loading", () => {
    render(<Button isLoading>Save changes</Button>);

    const button = screen.getByRole("button", { name: "Save changes" });

    expect(button).toBeDisabled();
    expect(screen.getByTestId("button-loading-icon")).toBeInTheDocument();
  });

  it("passes className and icon props through to the MUI button", () => {
    render(
      <Button className="custom-class" startIcon={<span data-testid="start-icon" />}>
        Create
      </Button>,
    );

    expect(screen.getByRole("button", { name: "Create" })).toHaveClass("custom-class");
    expect(screen.getByTestId("start-icon")).toBeInTheDocument();
  });
});
