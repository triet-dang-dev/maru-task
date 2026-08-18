"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { CalendarDays, Plus } from "lucide-react";

import { Button } from "@/components/ui/Button";

const meetings = [
  { date: "Aug 20, 2026, 10:00", duration: "1h", id: "m1", project: "Migration", recurring: false, title: "Sprint Planning" },
  { date: "Aug 21, 2026, 14:00", duration: "30m", id: "m2", project: "Infrastructure", recurring: true, title: "Weekly sync" },
  { date: "Aug 22, 2026, 09:00", duration: "2h", id: "m3", project: "Customer Growth", recurring: false, title: "Quarterly review" },
];

export function MeetingsPage() {
  return (
    <Stack spacing={0}>
      <Stack direction={{ sm: "row" }} spacing={2} sx={{ alignItems: { sm: "center" }, justifyContent: "space-between", mb: 5 }}>
        <Box>
          <Typography component="h1" variant="h1">Meetings</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>Manage and track all project meetings.</Typography>
        </Box>
        <Button startIcon={<Plus aria-hidden="true" size={16} />}>New meeting</Button>
      </Stack>

      <Stack spacing={2}>
        {meetings.map((m) => (
          <Box key={m.id} sx={{ border: 1, borderColor: "divider", borderRadius: 2, p: 3, "&:hover": { bgcolor: "action.hover" } }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center", justifyContent: "space-between" }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <CalendarDays aria-hidden="true" size={18} />
                <Typography sx={{ fontWeight: 700 }} variant="body1">{m.title}</Typography>
                {m.recurring && <Chip label="Recurring" size="small" variant="outlined" />}
              </Stack>
              <Typography color="text.secondary" variant="caption">{m.duration}</Typography>
            </Stack>
            <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="body2">{m.date} · {m.project}</Typography>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
