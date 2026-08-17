"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { getWorkItems } from "@/features/work-items/service";
import type { WorkItemListItem } from "@/features/work-items/types";

const timelineDays = ["11 Aug", "12 Aug", "13 Aug", "14 Aug", "15 Aug", "16 Aug", "17 Aug"];

const defaultScheduledWorkPackages = [
  {
    duration: 4,
    id: "101",
    startOffset: 0,
    status: "In progress",
    subject: "Map the project list contract",
  },
  {
    duration: 3,
    id: "102",
    startOffset: 2,
    status: "Open",
    subject: "Migrate the work-item table",
  },
  {
    duration: 2,
    id: "103",
    startOffset: 4,
    status: "Open",
    subject: "Create the authentication screen",
  },
];

export function ProjectGantt({ projectId }: { projectId: string }) {
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

  const scheduledWorkPackages = useMemo(() => {
    if (items.length === 0) return defaultScheduledWorkPackages;
    return items.map((it, idx) => ({
      duration: Math.max(2, 5 - (idx % 3)),
      id: it.id,
      startOffset: (idx * 2) % 5,
      status: it.status,
      subject: it.subject,
    }));
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
            Gantt
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Schedule work packages against a shared timeline.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <Button size="small" variant="outlined">
            Today
          </Button>
          <Typography
            component={Link}
            href={workPackagesHref}
            sx={{ color: "primary.main", fontWeight: 700 }}
          >
            Open work packages
          </Typography>
        </Stack>
      </Stack>

      <Paper sx={{ minWidth: 0, overflow: "hidden" }} variant="outlined">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { lg: "minmax(20rem, 1fr) minmax(34rem, 1.5fr)" },
          }}
        >
          <Box sx={{ overflowX: "auto" }}>
            <table
              aria-label="Scheduled work packages"
              className="w-full border-collapse text-left"
            >
              <thead>
                <tr className="border-b border-[var(--mui-palette-divider)] bg-[var(--mui-palette-action-hover)]">
                  <th className="px-4 py-3 text-xs font-semibold">ID</th>
                  <th className="px-4 py-3 text-xs font-semibold">Subject</th>
                  <th className="px-4 py-3 text-xs font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {scheduledWorkPackages.map((workPackage) => (
                  <tr className="border-b border-[var(--mui-palette-divider)]" key={workPackage.id}>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-[var(--mui-palette-text-secondary)]">
                      #{workPackage.id}
                    </td>
                    <td className="px-4 py-4 text-sm font-medium">{workPackage.subject}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-[var(--mui-palette-text-secondary)]">
                      {workPackage.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>

          <Box
            aria-label="Work package timeline"
            component="section"
            sx={{ borderColor: "divider", borderLeft: { lg: 3 }, overflowX: "auto" }}
          >
            <div className="min-w-[34rem] p-4">
              <div className="grid grid-cols-7 border-b border-[var(--mui-palette-divider)] pb-3 text-center text-xs font-semibold text-[var(--mui-palette-text-secondary)]">
                {timelineDays.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
              <div className="mt-4 space-y-4">
                {scheduledWorkPackages.map((workPackage) => {
                  const leftPercentage = (workPackage.startOffset / timelineDays.length) * 100;
                  const widthPercentage = (workPackage.duration / timelineDays.length) * 100;

                  return (
                    <div
                      className="relative h-10 rounded bg-[var(--mui-palette-action-hover)]"
                      key={workPackage.id}
                    >
                      <div
                        className="absolute top-1 flex h-8 items-center truncate rounded bg-[var(--mui-palette-primary-main)] px-3 text-xs font-semibold text-white shadow-sm"
                        style={{
                          left: `${leftPercentage}%`,
                          width: `${Math.min(widthPercentage, 100 - leftPercentage)}%`,
                        }}
                      >
                        {workPackage.subject}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
