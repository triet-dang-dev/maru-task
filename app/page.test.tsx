import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import HomePage from "./page";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("HomePage", () => {
  it("renders the dashboard instead of redirecting to a demo project", async () => {
    const { redirect } = await import("next/navigation");

    render(<HomePage />);

    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(redirect).not.toHaveBeenCalled();
  });
});
