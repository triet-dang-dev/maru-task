import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Breadcrumbs } from "./Breadcrumbs";

describe("Breadcrumbs", () => {
  it("renders linked ancestors and marks the current page", () => {
    render(
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/projects", label: "Projects" },
          { label: "Northstar" },
        ]}
      />,
    );

    expect(screen.getByRole("navigation", { name: "Breadcrumbs" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute("href", "/projects");
    expect(screen.getByText("Northstar")).toHaveAttribute("aria-current", "page");
  });

  it("supports custom navigation labels and separators", () => {
    render(
      <Breadcrumbs
        aria-label="Project path"
        items={[{ href: "/projects", label: "Projects" }, { label: "Settings" }]}
        separator="/"
      />,
    );

    expect(screen.getByRole("navigation", { name: "Project path" })).toBeInTheDocument();
    expect(screen.getByText("/")).toHaveAttribute("aria-hidden", "true");
  });
});
