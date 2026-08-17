import { PageContainer } from "@/components/layout";
import { ProjectCalendar } from "@/features/projects/components/ProjectCalendar";

interface ProjectCalendarPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectCalendarPage({ params }: ProjectCalendarPageProps) {
  const { projectId } = await params;

  return (
    <PageContainer>
      <ProjectCalendar projectId={projectId} />
    </PageContainer>
  );
}
