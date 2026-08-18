import { PageContainer } from "@/components/layout";
import { ProjectActivity } from "@/features/projects/components/ProjectActivity";

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectActivityPage({ params }: Props) {
  const { projectId } = await params;
  return (
    <PageContainer>
      <ProjectActivity projectId={projectId} />
    </PageContainer>
  );
}
