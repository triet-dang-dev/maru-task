import { PageContainer } from "@/components/layout";
import { ProjectBacklog } from "@/features/projects/components/ProjectBacklog";

interface ProjectBacklogsPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectBacklogsPage({ params }: ProjectBacklogsPageProps) {
  const { projectId } = await params;

  return (
    <PageContainer>
      <ProjectBacklog projectId={projectId} />
    </PageContainer>
  );
}
