import { PageContainer } from "@/components/layout";
import { ProjectDocumentsPanel } from "@/features/projects/components/ProjectDocumentsPanel";

export default async function ProjectDocumentsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return (
    <PageContainer>
      <ProjectDocumentsPanel projectId={projectId} />
    </PageContainer>
  );
}
