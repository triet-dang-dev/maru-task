import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusChip } from "./StatusChip";

describe("StatusChip", () => {
  it("renders a readable status label with a semantic tone", () => {
    render(<StatusChip label="Active" tone="success" />);

    const status = screen.getByText("Active");

    expect(status).toBeInTheDocument();
    expect(status.closest(".MuiChip-root")).toHaveAttribute("data-tone", "success");
  });
});
