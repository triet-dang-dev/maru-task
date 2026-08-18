"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Clock } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";

const defaultEntries = [
  { date: "Aug 18, 2026", hours: 3, id: "t1", project: "Migration", task: "WP-144 · Confirm incident runbook" },
  { date: "Aug 17, 2026", hours: 5, id: "t2", project: "Migration", task: "WP-142 · Review the release checklist" },
  { date: "Aug 16, 2026", hours: 2.5, id: "t3", project: "Migration", task: "WP-138 · Stakeholder access" },
];

export function MyTimeTracking() {
  return (
    <Stack spacing={0}>
      <Box sx={{ mb: 5 }}>
        <Typography component="h1" variant="h1">My time tracking</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Log and review your personal time entries across projects.
        </Typography>
      </Box>

      <Box sx={{ border: 1, borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "action.hover", display: "grid", gridTemplateColumns: "1fr 2fr auto auto", gap: 2, px: 3, py: 1.5 }}>
          {["Date", "Task", "Project", "Hours"].map((h) => (
            <Typography key={h} sx={{ fontWeight: 600 }} variant="caption">{h}</Typography>
          ))}
        </Box>
        {defaultEntries.map((entry) => (
          <Box key={entry.id} sx={{ borderBottom: 1, borderColor: "divider", display: "grid", gridTemplateColumns: "1fr 2fr auto auto", gap: 2, px: 3, py: 2, "&:last-child": { borderBottom: 0 }, "&:hover": { bgcolor: "action.hover" } }}>
            <Typography variant="body2">{entry.date}</Typography>
            <Typography variant="body2">{entry.task}</Typography>
            <Typography variant="body2">{entry.project}</Typography>
            <Typography sx={{ fontWeight: 600 }} variant="body2">{entry.hours}h</Typography>
          </Box>
        ))}
      </Box>
    </Stack>
  );
}
