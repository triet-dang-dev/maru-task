import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getWorkItems } = vi.hoisted(() => ({ getWorkItems: vi.fn() }));

vi.mock("@/features/work-items/service", () => ({ getWorkItems }));

import { ProjectActivity } from "./ProjectActivity";

describe("ProjectActivity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getWorkItems.mockResolvedValue({
      hasItems: true,
      items: [
        {
          id: "work-10",
          projectId: "project-1",
          status: "In progress",
          subject: "Setup deployment pipeline",
        },
      ],
      page: 1,
      pageSize: 10,
      total: 1,
    });
  });

  it("renders the Activity heading and loads work-item events for the project", async () => {
    render(<ProjectActivity projectId="project-1" />);

    expect(screen.getByRole("heading", { name: "Activity" })).toBeInTheDocument();
    expect(
      await screen.findByText(/#work-10 · Setup deployment pipeline/),
    ).toBeInTheDocument();
  });
});
