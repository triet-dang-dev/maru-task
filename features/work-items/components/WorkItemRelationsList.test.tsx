import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WorkItemRelationsList } from "./WorkItemRelationsList";

describe("WorkItemRelationsList", () => {
  it("groups related work packages by relation type", () => {
    render(
      <WorkItemRelationsList
        relations={[
          {
            id: "relation-1",
            relationType: "blocks",
            workItemId: "102",
            workItemStatus: "Open",
            workItemSubject: "Publish the migration guide",
          },
          {
            id: "relation-2",
            relationType: "relates",
            workItemId: "103",
            workItemStatus: "In progress",
            workItemSubject: "Validate the integration contract",
          },
        ]}
      />,
    );

    expect(screen.getByRole("region", { name: "Work package relations" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Blocks" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Relates" })).toBeInTheDocument();
    expect(screen.getByText("#102")).toBeInTheDocument();
    expect(screen.getByText("Publish the migration guide")).toBeInTheDocument();
    expect(screen.getByText("In progress")).toBeInTheDocument();
  });

  it("renders loading and empty states", () => {
    const { rerender } = render(<WorkItemRelationsList isLoading relations={[]} />);

    expect(screen.getByRole("status", { name: "Loading relations" })).toBeInTheDocument();

    rerender(<WorkItemRelationsList relations={[]} />);

    expect(screen.getByText("No related work packages")).toBeInTheDocument();
  });
});