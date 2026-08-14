import { PageContainer } from "@/components/layout";
import { ProjectGantt } from "@/features/projects/components/ProjectGantt";
import { ProjectWorkspaceNavigation } from "@/features/projects/components/ProjectWorkspaceNavigation";

interface ProjectGanttPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectGanttPage({ params }: ProjectGanttPageProps) {
  const { projectId } = await params;

  return (
    <PageContainer>
      <ProjectWorkspaceNavigation activeItem="/gantt" projectId={projectId} />
      <ProjectGantt projectId={projectId} />
    </PageContainer>
  );
}
