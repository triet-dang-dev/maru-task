import { PageContainer } from "@/components/layout";
import { ProjectDocumentsPanel } from "@/features/projects/components/ProjectDocumentsPanel";
import { ProjectWorkspaceNavigation } from "@/features/projects/components/ProjectWorkspaceNavigation";

export default async function ProjectDocumentsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return (
    <PageContainer>
      <ProjectWorkspaceNavigation projectId={projectId} />
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
      />
    </PageContainer>
  );
}
