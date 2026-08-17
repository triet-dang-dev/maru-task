import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/work-items/components/WorkItemsPageContent", () => ({
  WorkItemsPageContent: ({ projectId }: { projectId: string }) => (
    <p>Work items panel for {projectId}</p>
  ),
}));

import ProjectWorkItemsPage from "./page";

describe("ProjectWorkItemsPage", () => {
  it("renders the project work-packages workspace", async () => {
    const page = await ProjectWorkItemsPage({ params: Promise.resolve({ projectId: "proj-1" }) });

    render(page);

    expect(screen.getByRole("heading", { name: "Work packages" })).toBeInTheDocument();
    expect(screen.getByText("Work items panel for proj-1")).toBeInTheDocument();
  });
});
