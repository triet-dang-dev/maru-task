import { PageContainer } from "@/components/layout";
import { ProjectNews } from "@/features/projects/components/ProjectNews";

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectNewsPage({ params }: Props) {
  const { projectId } = await params;
  return (
    <PageContainer>
      <ProjectNews projectId={projectId} />
    </PageContainer>
  );
}
