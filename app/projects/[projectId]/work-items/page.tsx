import { PageContainer, PageHeader } from "@/components/layout";
import { ProjectWorkspaceNavigation } from "@/features/projects/components/ProjectWorkspaceNavigation";
import { WorkItemsPageContent } from "@/features/work-items/components/WorkItemsPageContent";

interface ProjectWorkItemsPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectWorkItemsPage({ params }: ProjectWorkItemsPageProps) {
  const { projectId } = await params;

  return (
    <PageContainer>
      <ProjectWorkspaceNavigation activeItem="/work-items" projectId={projectId} />
      <PageHeader
        description="View, filter, and create work items for this project."
        title="Work packages"
      />
      <div className="mt-8">
        <WorkItemsPageContent projectId={projectId} />
      </div>
    </PageContainer>
  );
}
