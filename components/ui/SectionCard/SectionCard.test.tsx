import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  SectionCard,
  SectionCardContent,
  SectionCardDescription,
  SectionCardFooter,
  SectionCardHeader,
  SectionCardTitle,
} from "./SectionCard";

describe("SectionCard", () => {
  it("composes semantic headings, actions, body, and footer content", () => {
    render(
      <SectionCard>
        <SectionCardHeader action={<button type="button">Edit</button>}>
          <div>
            <SectionCardTitle component="h3">Workspace details</SectionCardTitle>
            <SectionCardDescription>Core ownership information.</SectionCardDescription>
          </div>
        </SectionCardHeader>
        <SectionCardContent>Platform team</SectionCardContent>
        <SectionCardFooter>Updated today</SectionCardFooter>
      </SectionCard>,
    );

    expect(
      screen.getByRole("heading", { level: 3, name: "Workspace details" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByText("Platform team")).toBeInTheDocument();
    expect(screen.getByText("Updated today")).toBeInTheDocument();
    expect(screen.getByText("Updated today")).toHaveClass(
      "bg-[var(--mui-palette-action-hover)]",
    );
  });
});
