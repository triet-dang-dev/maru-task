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
});
