import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

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

  it("renders scoped work-package result metadata and follows the keyboard selection", async () => {
    const user = userEvent.setup();
    const onResultSelect = vi.fn();

    render(
      <GlobalSearch
        onResultSelect={onResultSelect}
        results={[
          {
            id: "WP-142",
            project: "Migration",
            status: "In progress",
            subject: "Review the release checklist",
            type: "Task",
          },
        ]}
      />,
    );

    const searchInput = screen.getByRole("searchbox", { name: "Search work packages" });
    await user.click(searchInput);
    await user.type(searchInput, "release");

    expect(screen.getByRole("combobox", { name: "Search scope" })).toBeInTheDocument();
    expect(screen.getByRole("listbox", { name: "Search results" })).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: /WP-142.*Migration.*Review the release checklist/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("In progress")).toBeInTheDocument();

    await user.keyboard("{Enter}");

    expect(onResultSelect).toHaveBeenCalledWith("WP-142");
  });

  it("renders loading, empty, and error result states", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<GlobalSearch isLoading results={[]} />);
    const searchInput = screen.getByRole("searchbox", { name: "Search work packages" });

    await user.click(searchInput);
    await user.type(searchInput, "release");
    expect(screen.getByRole("status", { name: "Loading search results" })).toBeInTheDocument();

    rerender(<GlobalSearch results={[]} />);
    expect(screen.getByText("No work packages found")).toBeInTheDocument();

    rerender(<GlobalSearch error="Search is temporarily unavailable." results={[]} />);
    expect(screen.getByText("Search is temporarily unavailable.")).toBeInTheDocument();
  });
});
