import { PageContainer } from "@/components/layout";
import { ProjectWikiWorkspace } from "@/features/projects/components/ProjectWikiWorkspace";

export default async function ProjectWikiPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return (
    <PageContainer>
      <ProjectWikiWorkspace projectId={projectId} />
    </PageContainer>
  );
}
