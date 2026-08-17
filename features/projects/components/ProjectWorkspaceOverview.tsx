"use client";

import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  SectionCard,
  SectionCardContent,
  SectionCardHeader,
  SectionCardTitle,
} from "@/components/ui/SectionCard/SectionCard";
import { StatusChip } from "@/components/ui/StatusChip/StatusChip";
import { getWorkItems } from "@/features/work-items/service";
import type { WorkItemListItem } from "@/features/work-items/types";

const defaultStatusSummary = [
  { color: "#327bac", count: 8, label: "Open" },
  { color: "#f99601", count: 5, label: "In progress" },
  { color: "#1f883d", count: 14, label: "Closed" },
];

const defaultRecentWork = [
  { id: "WP-142", status: "In progress", subject: "Review the release checklist" },
  { id: "WP-138", status: "Open", subject: "Confirm project stakeholder access" },
  { id: "WP-131", status: "Closed", subject: "Publish the sprint retrospective" },
];

const activity = [
  { actor: "Riley Park", detail: "updated the due date", item: "WP-142", time: "18 minutes ago" },
  { actor: "Dana Chen", detail: "completed", item: "WP-131", time: "Yesterday" },
  { actor: "Morgan Tate", detail: "added a comment on", item: "WP-138", time: "Monday" },
];

function getStatusTone(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "closed" || normalized === "done") return "success" as const;
  if (normalized === "in progress" || normalized === "in_progress") return "warning" as const;
  return "info" as const;
}

export function ProjectWorkspaceOverview({ projectId }: { projectId: string }) {
  const workPackagesHref = `/projects/${projectId}/work-items`;
  const [items, setItems] = useState<WorkItemListItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    getWorkItems(projectId)
      .then((res) => {
        if (isMounted && res.items && res.items.length > 0) {
          setItems(res.items);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const { completionRate, openCount, recentItems, statusCounts, totalCount } = useMemo(() => {
    if (items.length === 0) {
      return {
        completionRate: 52,
        openCount: 13,
        recentItems: defaultRecentWork,
        statusCounts: defaultStatusSummary,
        totalCount: 27,
      };
    }

    let open = 0;
    let inProgress = 0;
    let closed = 0;

    items.forEach((item) => {
      const st = item.status.toLowerCase();
      if (st === "closed" || st === "done") {
        closed += 1;
      } else if (st === "in progress" || st === "in_progress") {
        inProgress += 1;
      } else {
        open += 1;
      }
    });

    const total = items.length;
    const rate = total > 0 ? Math.round((closed / total) * 100) : 0;

    return {
      completionRate: rate,
      openCount: open + inProgress,
      recentItems: items.slice(0, 5).map((it) => ({
        id: it.id,
        status: it.status,
        subject: it.subject,
      })),
      statusCounts: [
        { color: "#327bac", count: open, label: "Open" },
        { color: "#f99601", count: inProgress, label: "In progress" },
        { color: "#1f883d", count: closed, label: "Closed" },
      ],
      totalCount: total,
    };
  }, [items]);

  return (
    <Box>
      <Stack
        direction={{ sm: "row" }}
        spacing={2}
        sx={{ alignItems: { sm: "baseline" }, justifyContent: "space-between", mb: 5 }}
      >
        <Box>
          <Typography component="h1" variant="h1">
            Project overview
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            A focused view of the project&apos;s current delivery health.
          </Typography>
        </Box>
        <Typography
          component={Link}
          href={workPackagesHref}
          sx={{ color: "primary.main", fontWeight: 700 }}
        >
          Open work packages
        </Typography>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gap: 4,
          gridTemplateColumns: { lg: "minmax(0, 2fr) minmax(280px, 1fr)" },
        }}
      >
        <Stack spacing={4}>
          <SectionCard>
            <SectionCardHeader>
              <Box>
                <SectionCardTitle>Project health</SectionCardTitle>
                <Typography color="text.secondary" variant="body2">
                  Current scope and delivery position
                </Typography>
              </Box>
              <StatusChip
                label="On track"
                tone="success"
              />
            </SectionCardHeader>
            <SectionCardContent>
              <Box
                sx={{
                  display: "grid",
                  gap: 4,
                  gridTemplateColumns: { sm: "repeat(3, minmax(0, 1fr))" },
                }}
              >
                <Box>
                  <Typography color="text.secondary" variant="caption">
                    Completion
                  </Typography>
                  <Typography sx={{ fontWeight: 700, mt: 1 }} variant="h3">
                    {completionRate}%
                  </Typography>
                  <LinearProgress
                    aria-label="Project completion"
                    sx={{ mt: 2 }}
                    value={completionRate}
                    variant="determinate"
                  />
                </Box>
                <Box>
                  <Typography color="text.secondary" variant="caption">
                    Target date
                  </Typography>
                  <Typography sx={{ fontWeight: 700, mt: 1 }} variant="h3">
                    28 Aug 2026
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    15 days remaining
                  </Typography>
                </Box>
                <Box>
                  <Typography color="text.secondary" variant="caption">
                    Open work
                  </Typography>
                  <Typography sx={{ fontWeight: 700, mt: 1 }} variant="h3">
                    {openCount}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Total {totalCount} work packages
                  </Typography>
                </Box>
              </Box>
            </SectionCardContent>
          </SectionCard>

          <SectionCard>
            <SectionCardHeader>
              <SectionCardTitle>Recent work packages</SectionCardTitle>
              <Typography
                component={Link}
                href={workPackagesHref}
                sx={{ color: "primary.main", fontSize: "0.875rem", fontWeight: 700 }}
              >
                View all
              </Typography>
            </SectionCardHeader>
            <SectionCardContent sx={{ p: 0 }}>
              <Stack divider={<Box sx={{ borderTop: 1, borderColor: "divider" }} />}>
                {recentItems.map((item) => (
                  <Stack
                    direction={{ sm: "row" }}
                    key={item.id}
                    spacing={2}
                    sx={{
                      alignItems: { sm: "center" },
                      justifyContent: "space-between",
                      px: 5,
                      py: 3,
                    }}
                  >
                    <Box>
                      <Typography color="primary.main" variant="caption">
                        {item.id}
                      </Typography>
                      <Typography sx={{ fontWeight: 600 }}>{item.subject}</Typography>
                    </Box>
                    <StatusChip label={item.status} tone={getStatusTone(item.status)} />
                  </Stack>
                ))}
              </Stack>
            </SectionCardContent>
          </SectionCard>
        </Stack>

        <Stack spacing={4}>
          <SectionCard>
            <SectionCardHeader>
              <SectionCardTitle>Work packages by status</SectionCardTitle>
            </SectionCardHeader>
            <SectionCardContent>
              <Stack spacing={3}>
                {statusCounts.map((item) => (
                  <Box key={item.label}>
                    <Stack direction="row" sx={{ justifyContent: "space-between", mb: 1 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <Box
                          sx={{
                            backgroundColor: item.color,
                            borderRadius: "50%",
                            height: 8,
                            width: 8,
                          }}
                        />
                        <Typography variant="body2">{item.label}</Typography>
                      </Stack>
                      <Typography sx={{ fontWeight: 700 }} variant="body2">
                        {item.count}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      sx={{ "& .MuiLinearProgress-bar": { backgroundColor: item.color } }}
                      value={totalCount > 0 ? (item.count / totalCount) * 100 : 0}
                      variant="determinate"
                    />
                  </Box>
                ))}
              </Stack>
            </SectionCardContent>
          </SectionCard>

          <SectionCard>
            <SectionCardHeader>
              <SectionCardTitle>Recent activity</SectionCardTitle>
            </SectionCardHeader>
            <SectionCardContent>
              <Stack spacing={3}>
                {activity.map((entry) => (
                  <Box key={`${entry.actor}-${entry.item}`}>
                    <Typography variant="body2">
                      <Box component="span" sx={{ fontWeight: 700 }}>
                        {entry.actor}
                      </Box>{" "}
                      {entry.detail}{" "}
                      <Box component="span" sx={{ color: "primary.main", fontWeight: 700 }}>
                        {entry.item}
                      </Box>
                    </Typography>
                    <Typography color="text.secondary" variant="caption">
                      {entry.time}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </SectionCardContent>
          </SectionCard>
        </Stack>
      </Box>
    </Box>
  );
}
