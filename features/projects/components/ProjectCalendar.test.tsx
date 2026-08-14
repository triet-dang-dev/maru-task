import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProjectCalendar } from "./ProjectCalendar";

describe("ProjectCalendar", () => {
  it("renders a month grid with work-package events and calendar navigation", () => {
    render(<ProjectCalendar projectId="42" />);

    expect(screen.getByRole("heading", { name: "Calendar" })).toBeInTheDocument();
    expect(screen.getByRole("grid", { name: "Work package calendar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous month" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next month" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Today" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Map the project list contract" })).toHaveAttribute(
      "href",
      "/projects/42/work-items/101",
    );
  });
});
