import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { GlobalSearch } from "./GlobalSearch";

describe("GlobalSearch", () => {
  it("expands for a query and clears it when escape is pressed", async () => {
    const user = userEvent.setup();

    render(<GlobalSearch />);

    const searchInput = screen.getByRole("searchbox", { name: "Search work packages" });
    await user.click(searchInput);

    expect(screen.getByText("Recent work packages")).toBeInTheDocument();

    await user.type(searchInput, "release");

    expect(screen.getByText("Search is ready")).toBeInTheDocument();
    expect(searchInput).toHaveValue("release");

    await user.keyboard("{Escape}");

    expect(searchInput).toHaveValue("");
    expect(screen.queryByText("Recent work packages")).not.toBeInTheDocument();
  });
});
