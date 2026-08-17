import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ProjectDocumentsPanel } from "./ProjectDocumentsPanel";

describe("ProjectDocumentsPanel", () => {
  it("renders project documents, upload progress, and deletion confirmation", async () => {
    const user = userEvent.setup();

    render(
      <ProjectDocumentsPanel
        documents={[
          {
            fileName: "release-plan.pdf",
            id: "document-1",
            size: "2 MB",
            status: "Uploaded",
            uploadedAt: "18 minutes ago",
          },
        ]}
      />,
    );

    expect(screen.getByRole("list", { name: "Project documents" })).toBeInTheDocument();
    expect(screen.getByText("release-plan.pdf")).toBeInTheDocument();
    expect(screen.getByText("2 MB · 18 minutes ago")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Upload document" }));
    expect(screen.getByRole("status", { name: "Uploading document" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Delete release-plan.pdf" }));
    expect(screen.getByRole("dialog", { name: "Delete document?" })).toBeInTheDocument();
  });
});
