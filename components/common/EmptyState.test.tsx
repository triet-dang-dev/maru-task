import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("announces its content and renders an optional action", () => {
    render(
      <EmptyState
        action={<button type="button">Create project</button>}
        description="Start by adding your first project."
        title="No projects yet"
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("No projects yet");
    expect(screen.getByRole("button", { name: "Create project" })).toBeInTheDocument();
  });
});
