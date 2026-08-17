import { PageContainer } from "@/components/layout";
import { ProjectTeamPlanner } from "@/features/projects/components/ProjectTeamPlanner";

interface ProjectTeamPlannerPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectTeamPlannerPage({ params }: ProjectTeamPlannerPageProps) {
  const { projectId } = await params;

  return (
    <PageContainer>
      <ProjectTeamPlanner projectId={projectId} />
    </PageContainer>
  );
}
