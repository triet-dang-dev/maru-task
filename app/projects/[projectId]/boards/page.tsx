import { PageContainer } from "@/components/layout";
import { ProjectBoard } from "@/features/projects/components/ProjectBoard";
import { ProjectWorkspaceNavigation } from "@/features/projects/components/ProjectWorkspaceNavigation";

interface ProjectBoardsPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectBoardsPage({ params }: ProjectBoardsPageProps) {
  const { projectId } = await params;

  return (
    <PageContainer>
      <ProjectWorkspaceNavigation activeItem="/boards" projectId={projectId} />
      <ProjectBoard projectId={projectId} />
    </PageContainer>
  );
}
