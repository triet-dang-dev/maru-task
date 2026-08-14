import { notFound } from "next/navigation";

import { PageContainer, PageHeader } from "@/components/layout";
import { WorkItemDetailPageContent } from "@/features/work-items/components/WorkItemDetailPageContent";

const supportedTabs = ["activity", "files", "relations", "watchers"] as const;
type SupportedTab = (typeof supportedTabs)[number];

interface WorkItemDetailTabPageProps {
  params: Promise<{ projectId: string; workItemId: string; tab: string }>;
}

export default async function WorkItemDetailTabPage({ params }: WorkItemDetailTabPageProps) {
  const { projectId, tab, workItemId } = await params;

  if (!supportedTabs.includes(tab as SupportedTab)) {
    notFound();
  }

  return (
    <PageContainer>
      <PageHeader description={`View and update work item #${workItemId}.`} title="Work item" />
      <div className="mt-8">
        <WorkItemDetailPageContent
          activeTab={tab as SupportedTab}
          projectId={projectId}
          workItemId={workItemId}
        />
      </div>
    </PageContainer>
  );
}
