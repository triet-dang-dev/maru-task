import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ToastProvider } from "@/components/ui/Toast";
import { MyPageDashboard } from "./MyPageDashboard";

describe("MyPageDashboard", () => {
  it("renders the source-aligned personal widget grid", () => {
    render(<MyPageDashboard />);

    expect(screen.getByRole("heading", { name: "My page" })).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Work packages assigned to me" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "My spent time" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Favorite projects" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Review the release checklist/ })).toHaveAttribute(
      "href",
      "/projects/42/work-items/WP-142",
    );
  });

  it("adds an available widget from the add-widget dialog", async () => {
    const user = userEvent.setup();
    render(<MyPageDashboard />);

    await user.click(screen.getByRole("button", { name: "Add widget" }));
    const dialog = screen.getByRole("dialog", { name: "Add widget" });
    await user.click(within(dialog).getByRole("button", { name: "Calendar" }));

    expect(screen.queryByRole("dialog", { name: "Add widget" })).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Calendar" })).toBeInTheDocument();
  });

  it("supports keyboard-friendly widget ordering and removal", async () => {
    const user = userEvent.setup();
    render(<MyPageDashboard />);

    await user.click(screen.getByRole("button", { name: "Move My spent time earlier" }));
    const widgets = screen
      .getAllByRole("region")
      .map((widget) => widget.getAttribute("aria-label"));
    expect(widgets.slice(0, 2)).toEqual(["My spent time", "Work packages assigned to me"]);

    await user.click(screen.getByRole("button", { name: "Remove My spent time widget" }));
    expect(screen.queryByRole("region", { name: "My spent time" })).not.toBeInTheDocument();
  });

  it("covers loading, toast error, and empty grid states", async () => {
    const { rerender } = render(
      <ToastProvider>
        <MyPageDashboard isLoading />
      </ToastProvider>,
    );
    expect(screen.getByRole("status", { name: "Loading my page" })).toBeInTheDocument();

    rerender(
      <ToastProvider>
        <MyPageDashboard errorMessage="The personal grid is unavailable." />
      </ToastProvider>,
    );
    expect(await screen.findByText("The personal grid is unavailable.")).toBeInTheDocument();

    rerender(
      <ToastProvider>
        <MyPageDashboard initialWidgets={[]} key="empty" />
      </ToastProvider>,
    );
    expect(screen.getByText("Your page has no widgets yet")).toBeInTheDocument();
  });
});
