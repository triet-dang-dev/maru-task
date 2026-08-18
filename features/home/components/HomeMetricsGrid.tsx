"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AlertCircle, CheckCircle2, FolderKanban, ListTodo, Zap } from "lucide-react";
import Link from "next/link";

import { SectionCard, SectionCardContent } from "@/components/ui/SectionCard";
import type { HomeMetrics } from "../types";

export interface HomeMetricsGridProps {
  metrics: HomeMetrics;
}

export function HomeMetricsGrid({ metrics }: HomeMetricsGridProps) {
  const cards = [
    {
      description: "Accessible workspaces",
      href: "/projects",
      icon: <FolderKanban aria-hidden="true" className="h-5 w-5 text-[var(--mui-palette-primary-main)]" />,
      label: "Active Projects",
      testId: "metric-active-projects",
      value: metrics.activeProjectsCount,
    },
    {
      description: "Open in all projects",
      href: "/projects",
      icon: <ListTodo aria-hidden="true" className="h-5 w-5 text-[var(--mui-palette-info-main)]" />,
      label: "Open Work Packages",
      testId: "metric-open-work-packages",
      value: metrics.openWorkPackagesCount,
    },
    {
      description: "Immediate & high priority",
      href: "/my/page",
      icon: <AlertCircle aria-hidden="true" className="h-5 w-5 text-[var(--mui-palette-warning-main)]" />,
      label: "Urgent & Due Today",
      testId: "metric-due-today",
      value: metrics.dueTodayCount,
    },
    {
      description: "In progress cycles",
      href: "/projects",
      icon: <Zap aria-hidden="true" className="h-5 w-5 text-[var(--mui-palette-success-main)]" />,
      label: "Active Sprints",
      testId: "metric-active-sprints",
      value: metrics.activeSprintsCount,
    },
  ];

  return (
    <Box
      data-testid="home-metrics-grid"
      sx={{
        display: "grid",
        gap: { xs: 2, sm: 3 },
        gridTemplateColumns: {
          sm: "repeat(2, minmax(0, 1fr))",
          xs: "1fr",
          lg: "repeat(4, minmax(0, 1fr))",
        },
      }}
    >
      {cards.map((card) => (
        <Link
          data-testid={card.testId}
          href={card.href}
          key={card.label}
          style={{ textDecoration: "none", color: "inherit", display: "block" }}
        >
          <SectionCard
            className="transition-all hover:border-[var(--mui-palette-primary-main)] hover:shadow-sm"
            sx={{ height: "100%" }}
          >
          <SectionCardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography color="text.secondary" sx={{ fontWeight: 600, fontSize: "0.8125rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {card.label}
                </Typography>
                <Typography sx={{ fontSize: "1.75rem", fontWeight: 700, mt: 0.5 }} variant="h3">
                  {card.value}
                </Typography>
                <Typography color="text.secondary" sx={{ fontSize: "0.8125rem", mt: 0.5 }}>
                  {card.description}
                </Typography>
              </Box>
              <Box
                sx={{
                  alignItems: "center",
                  bgcolor: "action.hover",
                  borderRadius: 2,
                  display: "flex",
                  height: 44,
                  justifyContent: "center",
                  width: 44,
                  flexShrink: 0,
                }}
              >
                {card.icon}
              </Box>
            </Stack>
          </SectionCardContent>
          </SectionCard>
        </Link>
      ))}
    </Box>
  );
}
