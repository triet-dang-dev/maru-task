import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WorkItemActivityTimeline } from "./WorkItemActivityTimeline";

describe("WorkItemActivityTimeline", () => {
  it("renders OpenProject-style activity metadata and comment content", () => {
    render(
      <WorkItemActivityTimeline
        events={[
          {
            action: "commented",
            actor: "Dana Chen",
            body: "The release checklist is ready for review.",
            id: "activity-1",
            timestamp: "18 minutes ago",
          },
          {
            action: "changed the status to In progress",
            actor: "Riley Park",
            id: "activity-2",
            timestamp: "Yesterday",
          },
        ]}
      />,
    );

    expect(screen.getByRole("feed", { name: "Work package activity" })).toBeInTheDocument();
    expect(screen.getByText("Dana Chen")).toBeInTheDocument();
    expect(screen.getByText("commented")).toBeInTheDocument();
    expect(screen.getByText("18 minutes ago")).toBeInTheDocument();
    expect(screen.getByText("The release checklist is ready for review.")).toBeInTheDocument();
    expect(screen.getByText("changed the status to In progress")).toBeInTheDocument();
  });

  it("renders loading and empty states without activity entries", () => {
    const { rerender } = render(<WorkItemActivityTimeline events={[]} isLoading />);

    expect(screen.getByRole("status", { name: "Loading activity" })).toBeInTheDocument();

    rerender(<WorkItemActivityTimeline events={[]} />);

    expect(screen.getByText("No activity yet")).toBeInTheDocument();
    expect(screen.queryByRole("feed", { name: "Work package activity" })).not.toBeInTheDocument();
  });
});
