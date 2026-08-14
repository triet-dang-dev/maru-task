import { PageContainer } from "@/components/layout";
import { ProjectWorkspaceNavigation } from "@/features/projects/components/ProjectWorkspaceNavigation";
import { ProjectWorkspaceOverview } from "@/features/projects/components/ProjectWorkspaceOverview";
import { ProjectWorkspaceSummary } from "@/features/projects/components/ProjectWorkspaceSummary";

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;

  return (
    <PageContainer>
      <ProjectWorkspaceSummary projectId={projectId} />
      <ProjectWorkspaceNavigation projectId={projectId} />
      <ProjectWorkspaceOverview projectId={projectId} />
    </PageContainer>
  );
}
