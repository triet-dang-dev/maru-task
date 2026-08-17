import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WorkItemWatchersList } from "./WorkItemWatchersList";

describe("WorkItemWatchersList", () => {
  it("renders watcher identity and subscription state", () => {
    render(
      <WorkItemWatchersList
        watchers={[
          {
            id: "watcher-1",
            name: "Dana Chen",
            subscribedAt: "Subscribed 18 minutes ago",
          },
        ]}
      />,
    );

    expect(screen.getByRole("region", { name: "Watchers" })).toBeInTheDocument();
    expect(screen.getByText("Dana Chen")).toBeInTheDocument();
    expect(screen.getByText("Subscribed 18 minutes ago")).toBeInTheDocument();
  });

  it("renders loading and empty states", () => {
    const { rerender } = render(<WorkItemWatchersList isLoading watchers={[]} />);

    expect(screen.getByRole("status", { name: "Loading watchers" })).toBeInTheDocument();

    rerender(<WorkItemWatchersList watchers={[]} />);

    expect(screen.getByText("No watchers yet")).toBeInTheDocument();
  });
});
