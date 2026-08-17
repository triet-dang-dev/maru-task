import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ProjectWikiWorkspace } from "./ProjectWikiWorkspace";

describe("ProjectWikiWorkspace", () => {
  it("shows wiki pages and opens a local editor for a selected page", async () => {
    const user = userEvent.setup();

    render(<ProjectWikiWorkspace />);

    expect(screen.getByRole("list", { name: "Wiki pages" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Release process" }));
    expect(screen.getByRole("heading", { name: "Release process" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Edit page" }));
    expect(screen.getByLabelText("Page content")).toBeInTheDocument();
  });

  it("shows a missing-page state", () => {
    render(<ProjectWikiWorkspace initialSlug="missing" />);

    expect(screen.getByText("Wiki page not found")).toBeInTheDocument();
  });
});
