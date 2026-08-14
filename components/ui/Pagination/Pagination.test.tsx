import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Pagination } from "./Pagination";

describe("Pagination", () => {
  it("exposes current-page semantics and reports page changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<Pagination count={4} onChange={onChange} page={1} />);

    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "page 1" })).toHaveAttribute("aria-current", "page");

    await user.click(screen.getByRole("button", { name: "Go to page 2" }));
    expect(onChange).toHaveBeenCalledWith(expect.anything(), 2);
  });

  it("supports disabled collections and custom labels", () => {
    render(<Pagination aria-label="Search results pages" count={3} disabled />);

    expect(screen.getByRole("navigation", { name: "Search results pages" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go to page 2" })).toBeDisabled();
  });
});
