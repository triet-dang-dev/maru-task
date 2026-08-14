import { PageContainer, PageHeader } from "@/components/layout";
import { ProjectsPageContent } from "@/features/projects/components/ProjectsPageContent";

export default function ProjectsPage() {
  return (
    <PageContainer>
      <PageHeader
        description="Browse projects you have access to and open their work items."
        title="Projects"
      />
      <div className="mt-8">
        <ProjectsPageContent />
      </div>
    </PageContainer>
  );
}
