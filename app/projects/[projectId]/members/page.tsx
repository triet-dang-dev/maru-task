import { PageContainer } from "@/components/layout";
import { ProjectSettingsWorkspace } from "@/features/projects/components/ProjectSettingsWorkspace";

interface Props {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectMembersPage({ params }: Props) {
  const { projectId } = await params;
  return (
    <PageContainer>
      <ProjectSettingsWorkspace projectId={projectId} />
    </PageContainer>
  );
}
