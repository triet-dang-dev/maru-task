import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/work-items/components/WorkItemDetailPageContent", () => ({
  WorkItemDetailPageContent: ({
    projectId,
    workItemId,
  }: {
    projectId: string;
    workItemId: string;
  }) => (
    <p>
      Detail {workItemId} in {projectId}
    </p>
  ),
}));

import WorkItemDetailPage from "./page";

describe("WorkItemDetailPage", () => {
  it("renders the project-scoped work-item detail route", async () => {
    const page = await WorkItemDetailPage({
      params: Promise.resolve({ projectId: "42", workItemId: "101" }),
    });

    render(page);

    expect(screen.getByRole("heading", { name: "Work item" })).toBeInTheDocument();
    expect(screen.getByText("Detail 101 in 42")).toBeInTheDocument();
  });
});
