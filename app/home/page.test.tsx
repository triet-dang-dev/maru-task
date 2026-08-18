import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import HomePage from "./page";

vi.mock("@/features/home/components/HomePageContent", () => ({
  HomePageContent: () => <div data-testid="home-page-content">Home Content</div>,
}));

describe("HomePage route (/home)", () => {
  it("renders HomePageContent inside PageContainer", () => {
    render(<HomePage />);
    expect(screen.getByTestId("home-page-content")).toBeInTheDocument();
  });
});
