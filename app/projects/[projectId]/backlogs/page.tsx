import { PageContainer } from "@/components/layout";
import { ProjectBacklog } from "@/features/projects/components/ProjectBacklog";
import { ProjectWorkspaceNavigation } from "@/features/projects/components/ProjectWorkspaceNavigation";

interface ProjectBacklogsPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectBacklogsPage({ params }: ProjectBacklogsPageProps) {
  const { projectId } = await params;

  return (
    <PageContainer>
      <ProjectWorkspaceNavigation activeItem="/backlogs" projectId={projectId} />
      <ProjectBacklog projectId={projectId} />
    </PageContainer>
  );
}