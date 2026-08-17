import { PageContainer } from "@/components/layout";
import { ProjectSettingsWorkspace } from "@/features/projects/components/ProjectSettingsWorkspace";
import { ProjectWorkspaceNavigation } from "@/features/projects/components/ProjectWorkspaceNavigation";

export default async function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return (
    <PageContainer>
      <ProjectWorkspaceNavigation activeItem="/settings" projectId={projectId} />
      <ProjectSettingsWorkspace />
    </PageContainer>
  );
}
