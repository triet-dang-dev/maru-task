import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { NotificationCenter } from "./NotificationCenter";

describe("NotificationCenter", () => {
  it("shows the unread count and lets the user filter notifications", async () => {
    const user = userEvent.setup();

    render(
      <NotificationCenter
        notifications={[
          {
            actor: "Dana Chen",
            id: "notification-1",
            message: "mentioned you in Review the release checklist",
            read: false,
            timestamp: "18 minutes ago",
          },
          {
            actor: "Riley Park",
            id: "notification-2",
            message: "updated WP-131",
            read: true,
            timestamp: "Yesterday",
          },
        ]}
      />,
    );

    expect(screen.getByRole("button", { name: "Notifications (1 unread)" })).toHaveTextContent("1");

    await user.click(screen.getByRole("button", { name: "Notifications (1 unread)" }));

    expect(screen.getByRole("heading", { name: "Notifications" })).toBeInTheDocument();
    expect(screen.getByText("Dana Chen")).toBeInTheDocument();
    expect(screen.queryByText("Riley Park")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "All" }));

    expect(screen.getByText("Riley Park")).toBeInTheDocument();
  });

  it("renders typed entry metadata and marks an unread notification as read", async () => {
    const user = userEvent.setup();

    render(
      <NotificationCenter
        notifications={[
          {
            actor: "Dana Chen",
            id: "notification-1",
            message: "mentioned you",
            project: "Migration",
            read: false,
            reason: "Mentioned",
            status: "In progress",
            timestamp: "18 minutes ago",
            workItemId: "WP-142",
          },
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Notifications (1 unread)" }));

    expect(screen.getByText("WP-142")).toBeInTheDocument();
    expect(screen.getByText("Migration")).toBeInTheDocument();
    expect(screen.getByText("Mentioned")).toBeInTheDocument();
    expect(screen.getByText("In progress")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Mark notification as read" }));

    expect(screen.getByText("0 unread")).toBeInTheDocument();
    expect(screen.getByText("You're all caught up")).toBeInTheDocument();
  });

  it("renders loading and paginated notification states", async () => {
    const user = userEvent.setup();
    const notifications = Array.from({ length: 4 }, (_, index) => ({
      actor: `User ${index + 1}`,
      id: `notification-${index + 1}`,
      message: "updated a work package",
      read: true,
      timestamp: "Yesterday",
    }));
    const { rerender } = render(<NotificationCenter isLoading notifications={[]} />);

    await user.click(screen.getByRole("button", { name: "Notifications (0 unread)" }));
    expect(screen.getByRole("status", { name: "Loading notifications" })).toBeInTheDocument();

    rerender(<NotificationCenter notifications={notifications} />);
    await user.click(screen.getByRole("button", { name: "All" }));
    expect(screen.getByText("User 3")).toBeInTheDocument();
    expect(screen.queryByText("User 4")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Load more notifications" }));
    expect(screen.getByText("User 4")).toBeInTheDocument();
  });
});
