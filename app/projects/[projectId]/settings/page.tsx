import { PageContainer } from "@/components/layout";
import { ProjectSettingsWorkspace } from "@/features/projects/components/ProjectSettingsWorkspace";

export default async function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return (
    <PageContainer>
      <ProjectSettingsWorkspace projectId={projectId} />
    </PageContainer>
  );
}
