import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WorkItemAttachmentsList } from "./WorkItemAttachmentsList";

describe("WorkItemAttachmentsList", () => {
  it("renders attachment name, type, size, and upload state", () => {
    render(
      <WorkItemAttachmentsList
        attachments={[
          {
            contentType: "application/pdf",
            fileName: "migration-plan.pdf",
            id: "attachment-1",
            size: "2 MB",
            uploadState: "Uploaded",
          },
        ]}
      />,
    );

    expect(screen.getByRole("region", { name: "Attachments" })).toBeInTheDocument();
    expect(screen.getByText("migration-plan.pdf")).toBeInTheDocument();
    expect(screen.getByText("application/pdf · 2 MB")).toBeInTheDocument();
    expect(screen.getByText("Uploaded")).toBeInTheDocument();
  });

  it("renders loading and empty states", () => {
    const { rerender } = render(<WorkItemAttachmentsList attachments={[]} isLoading />);

    expect(screen.getByRole("status", { name: "Loading attachments" })).toBeInTheDocument();

    rerender(<WorkItemAttachmentsList attachments={[]} />);

    expect(screen.getByText("No attachments yet")).toBeInTheDocument();
  });
});
