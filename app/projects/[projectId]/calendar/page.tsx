import { PageContainer } from "@/components/layout";
import { ProjectCalendar } from "@/features/projects/components/ProjectCalendar";
import { ProjectWorkspaceNavigation } from "@/features/projects/components/ProjectWorkspaceNavigation";

interface ProjectCalendarPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectCalendarPage({ params }: ProjectCalendarPageProps) {
  const { projectId } = await params;

  return (
    <PageContainer>
      <ProjectWorkspaceNavigation activeItem="/calendar" projectId={projectId} />
      <ProjectCalendar projectId={projectId} />
    </PageContainer>
  );
}
