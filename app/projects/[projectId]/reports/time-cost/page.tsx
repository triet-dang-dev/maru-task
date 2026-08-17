import { PageContainer } from "@/components/layout";
import { ProjectTimeCostReport } from "@/features/projects/components/ProjectTimeCostReport";
import { ProjectWorkspaceNavigation } from "@/features/projects/components/ProjectWorkspaceNavigation";

interface ProjectTimeCostReportPageProps { params: Promise<{ projectId: string }>; }

export default async function ProjectTimeCostReportPage({ params }: ProjectTimeCostReportPageProps) {
  const { projectId } = await params;
  return <PageContainer><ProjectWorkspaceNavigation projectId={projectId} /><ProjectTimeCostReport projectId={projectId} /></PageContainer>;
}