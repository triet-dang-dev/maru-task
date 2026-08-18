import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ProjectScopeSelector } from "./ProjectScopeSelector";

describe("ProjectScopeSelector", () => {
  it("defaults to All projects and exposes accessible project choices", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <ProjectScopeSelector
        onChange={onChange}
        projects={[{ id: "42", name: "Platform" }]}
        value={null}
      />,
    );

    expect(screen.getByRole("combobox", { name: "Project scope" })).toHaveTextContent(
      "All projects",
    );
    expect(document.getElementById("project-scope-label")).toHaveClass("MuiInputLabel-shrink");

    await user.click(screen.getByRole("combobox", { name: "Project scope" }));
    await user.click(screen.getByRole("option", { name: "Platform" }));

    expect(onChange).toHaveBeenCalledWith("42");
  });
});
