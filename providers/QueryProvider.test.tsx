import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { QueryProvider } from "./QueryProvider";

describe("QueryProvider", () => {
  it("renders children inside the QueryClientProvider", () => {
    render(
      <QueryProvider>
        <span>Query child</span>
      </QueryProvider>,
    );

    expect(screen.getByText("Query child")).toBeInTheDocument();
  });
});
