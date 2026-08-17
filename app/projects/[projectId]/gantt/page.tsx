import { PageContainer } from "@/components/layout";
import { ProjectGantt } from "@/features/projects/components/ProjectGantt";

interface ProjectGanttPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectGanttPage({ params }: ProjectGanttPageProps) {
  const { projectId } = await params;

  return (
    <PageContainer>
      <ProjectGantt projectId={projectId} />
    </PageContainer>
  );
}
