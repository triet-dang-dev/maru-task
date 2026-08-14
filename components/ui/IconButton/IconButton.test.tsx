import { render, screen } from "@testing-library/react";
import { RefreshCw } from "lucide-react";
import { describe, expect, it } from "vitest";

import { IconButton } from "./IconButton";

describe("IconButton", () => {
  it("forwards its accessible name and disables interaction while loading", () => {
    render(
      <IconButton aria-label="Refresh records" isLoading>
        <RefreshCw aria-hidden="true" />
      </IconButton>,
    );

    const button = screen.getByRole("button", { name: "Refresh records" });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(screen.getByTestId("icon-button-loading-icon")).toBeInTheDocument();
  });
});
