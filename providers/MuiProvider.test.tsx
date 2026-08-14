import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MuiProvider } from "./MuiProvider";

describe("MuiProvider", () => {
  it("renders children within the MUI theme boundary", () => {
    render(
      <MuiProvider>
        <span>Theme child</span>
      </MuiProvider>,
    );

    expect(screen.getByText("Theme child")).toBeInTheDocument();
  });
});
