import { PageContainer, PageHeader } from "@/components/layout";
import { WorkItemDetailPageContent } from "@/features/work-items/components/WorkItemDetailPageContent";

interface WorkItemDetailPageProps {
  params: Promise<{ projectId: string; workItemId: string }>;
}

export default async function WorkItemDetailPage({ params }: WorkItemDetailPageProps) {
  const { projectId, workItemId } = await params;

  return (
    <PageContainer>
      <PageHeader description={`View and update work item #${workItemId}.`} title="Work item" />
      <div className="mt-8">
        <WorkItemDetailPageContent projectId={projectId} workItemId={workItemId} />
      </div>
    </PageContainer>
  );
}
