import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createSprint, getSprints } from "../service";
import { ProjectSprintsPageContent } from "./ProjectSprintsPageContent";

vi.mock("../service", () => ({
  createSprint: vi.fn(),
  getSprints: vi.fn(),
}));

describe("ProjectSprintsPageContent", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("creates a sprint and reloads the list from the BFF", async () => {
    const user = userEvent.setup();

    vi.mocked(getSprints)
      .mockResolvedValueOnce({
        items: [],
        page: 1,
        pageSize: 25,
        total: 0,
      })
      .mockResolvedValueOnce({
        items: [
          {
            endDate: "2026-10-15T00:00:00.000Z",
            id: "22",
            name: "October sprint",
            startDate: "2026-10-01T00:00:00.000Z",
            status: "Planned",
          },
        ],
        page: 1,
        pageSize: 25,
        total: 1,
      });
    vi.mocked(createSprint).mockResolvedValue(undefined);

    render(<ProjectSprintsPageContent projectId="42" />);

    await screen.findByRole("heading", { name: "Sprints" });

    await user.type(screen.getByLabelText("Sprint name"), "October sprint");
    await user.type(screen.getByLabelText("Start date"), "2026-10-01");
    await user.type(screen.getByLabelText("End date"), "2026-10-15");
    await user.click(screen.getByRole("button", { name: "Create sprint" }));

    await waitFor(() => {
      expect(createSprint).toHaveBeenCalledWith("42", {
        endDate: "2026-10-15T00:00:00.000Z",
        name: "October sprint",
        startDate: "2026-10-01T00:00:00.000Z",
      });
      expect(getSprints).toHaveBeenCalledTimes(2);
    });

    expect(await screen.findByText("October sprint")).toBeInTheDocument();
  });

  it("validates sprint dates on the client before calling create", async () => {
    const user = userEvent.setup();

    vi.mocked(getSprints).mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 25,
      total: 0,
    });

    render(<ProjectSprintsPageContent projectId="42" />);

    await screen.findByRole("heading", { name: "Sprints" });

    await user.type(screen.getByLabelText("Sprint name"), "Bad sprint");
    await user.type(screen.getByLabelText("Start date"), "2026-10-20");
    await user.type(screen.getByLabelText("End date"), "2026-10-10");
    await user.click(screen.getByRole("button", { name: "Create sprint" }));

    expect(createSprint).not.toHaveBeenCalled();
    expect(
      screen.getByText("Sprint end date must be on or after the start date."),
    ).toBeInTheDocument();
  });

  it("shows a field validation error when a sprint name is empty", async () => {
    const user = userEvent.setup();

    vi.mocked(getSprints).mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 25,
      total: 0,
    });

    render(<ProjectSprintsPageContent projectId="42" />);

    await screen.findByRole("heading", { name: "Sprints" });
    await user.click(screen.getByRole("button", { name: "Create sprint" }));

    expect(await screen.findByText("Please enter a sprint name.")).toBeInTheDocument();
    expect(createSprint).not.toHaveBeenCalled();
  });
});
