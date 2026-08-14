import Skeleton from "@mui/material/Skeleton";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LoadingState } from "./LoadingState";

describe("LoadingState", () => {
  it("announces loading and renders a default skeleton fallback", () => {
    render(<LoadingState label="Loading projects" />);

    const status = screen.getByRole("status", { name: "Loading projects" });
    expect(status).toHaveAttribute("aria-busy", "true");
    expect(screen.getAllByTestId("loading-state-skeleton")).toHaveLength(3);
  });

  it("accepts composed skeleton content", () => {
    render(
      <LoadingState label="Loading dashboard">
        <Skeleton data-testid="dashboard-skeleton" height={120} variant="rounded" />
      </LoadingState>,
    );

    expect(screen.getByTestId("dashboard-skeleton")).toBeInTheDocument();
    expect(screen.queryByTestId("loading-state-skeleton")).not.toBeInTheDocument();
  });
});
