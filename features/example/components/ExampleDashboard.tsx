import { Blocks, LayoutDashboard, Palette, Plus, Settings, TableProperties } from "lucide-react";

import { AppShell, PageContainer, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/Button";
import { StatusChip } from "@/components/ui/StatusChip";

import { DashboardOverview } from "./DashboardOverview";
import { DashboardTopbarActions } from "./DashboardTopbarActions";
import { ComponentShowcase } from "./ComponentShowcase";
import { RecordWorkspace } from "./RecordWorkspace";

const iconProps = { size: 19, strokeWidth: 1.8 } as const;

export function ExampleDashboard() {
  return (
    <AppShell
      actions={<DashboardTopbarActions />}
      brand="Northstar UI"
      contextLabel="Design system / Overview"
      navigation={[
        {
          active: true,
          href: "/",
          icon: <LayoutDashboard aria-hidden="true" {...iconProps} />,
          label: "Overview",
        },
        {
          href: "/#foundation",
          icon: <Palette aria-hidden="true" {...iconProps} />,
          label: "Foundation",
        },
        {
          href: "/#components",
          icon: <Blocks aria-hidden="true" {...iconProps} />,
          label: "Components",
        },
        {
          href: "/#records",
          icon: <TableProperties aria-hidden="true" {...iconProps} />,
          label: "Data patterns",
        },
        {
          href: "/#settings",
          icon: <Settings aria-hidden="true" {...iconProps} />,
          label: "Settings",
        },
      ]}
      sidebarFooter={
        <div className="space-y-2 px-2">
          <StatusChip label="Foundation ready" tone="success" />
          <p className="text-xs leading-5 text-slate-500">MUI v9 · Tailwind v4 · Next.js 16</p>
        </div>
      }
    >
      <PageContainer>
        <div className="flex flex-col gap-12 lg:gap-16">
          <PageHeader
            actions={
              <>
                <Button href="#foundation" variant="outline">
                  View tokens
                </Button>
                <Button
                  href="#create-record"
                  startIcon={<Plus aria-hidden="true" {...iconProps} />}
                >
                  Create record
                </Button>
              </>
            }
            description="A production-ready reference for color, typography, responsive layout, form validation, server state, and data-heavy application patterns."
            eyebrow="Enterprise frontend boilerplate"
            title="Example workspace"
          />

          <DashboardOverview />
          <ComponentShowcase />
          <RecordWorkspace />
        </div>
      </PageContainer>
    </AppShell>
  );
}
