import { PageContainer } from "@/components/layout";
import { ProjectWikiWorkspace } from "@/features/projects/components/ProjectWikiWorkspace";
import { ProjectWorkspaceNavigation } from "@/features/projects/components/ProjectWorkspaceNavigation";

export default async function ProjectWikiPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return (
    <PageContainer>
      <ProjectWorkspaceNavigation projectId={projectId} />
      <ProjectWikiWorkspace />
    </PageContainer>
  );
}
