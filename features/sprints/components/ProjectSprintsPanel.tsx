import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { EmptyState } from "@/components/common/EmptyState";

import type { SprintsResponse } from "../types";

function formatDateRange(startDate: string | null, endDate: string | null) {
  if (!startDate || !endDate) return "Dates not set";

  const format = (date: string) =>
    new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(date));

  return `${format(startDate)} - ${format(endDate)}`;
}

export function ProjectSprintsPanel({ data }: { data: SprintsResponse }) {
  return (
    <section aria-labelledby="sprints-heading">
      <Stack direction="row" sx={{ alignItems: "baseline", justifyContent: "space-between", mb: 2 }}>
        <Typography component="h2" id="sprints-heading" variant="h4">
          Sprints
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {data.total} total
        </Typography>
      </Stack>
      {data.items.length === 0 ? (
        <EmptyState description="Create a sprint to plan work in this project." title="No sprints yet" />
      ) : (
        <Stack spacing={2}>
          {data.items.map((sprint) => (
            <Paper key={sprint.id} sx={{ p: 2 }} variant="outlined">
              <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <Typography sx={{ fontWeight: 700 }}>
                    {sprint.name || "Untitled sprint"}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    {formatDateRange(sprint.startDate, sprint.endDate)}
                  </Typography>
                </div>
                <Chip label={sprint.status || "Unknown"} size="small" variant="outlined" />
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </section>
  );
}