import { PageContainer } from "@/components/layout";
import { ProjectBoard } from "@/features/projects/components/ProjectBoard";

interface ProjectBoardsPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectBoardsPage({ params }: ProjectBoardsPageProps) {
  const { projectId } = await params;

  return (
    <PageContainer>
      <ProjectBoard projectId={projectId} />
    </PageContainer>
  );
}
