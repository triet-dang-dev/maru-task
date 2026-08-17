import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import HomePage from "./page";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("HomePage", () => {
  it("renders the personal widget grid instead of redirecting to a demo project", async () => {
    const { redirect } = await import("next/navigation");

    render(<HomePage />);

    expect(screen.getByRole("heading", { name: "My page" })).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Work packages assigned to me" }),
    ).toBeInTheDocument();
    expect(redirect).not.toHaveBeenCalled();
  });
});
