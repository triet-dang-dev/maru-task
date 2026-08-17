import { PageContainer } from "@/components/layout";
import { ProjectTimeCostReport } from "@/features/projects/components/ProjectTimeCostReport";

interface ProjectTimeCostReportPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectTimeCostReportPage({
  params,
}: ProjectTimeCostReportPageProps) {
  const { projectId } = await params;
  return (
    <PageContainer>
      <ProjectTimeCostReport projectId={projectId} />
    </PageContainer>
  );
}
