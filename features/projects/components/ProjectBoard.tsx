"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { CalendarDays, UserRound } from "lucide-react";
import Link from "next/link";

const lanes = [
  {
    cards: [
      {
        assignee: "Riley Park",
        due: "18 Aug",
        id: "WP-138",
        subject: "Confirm project stakeholder access",
      },
      {
        assignee: "Morgan Tate",
        due: "22 Aug",
        id: "WP-144",
        subject: "Prepare customer onboarding notes",
      },
      {
        assignee: "Unassigned",
        due: "28 Aug",
        id: "WP-147",
        subject: "Schedule release readiness review",
      },
    ],
    label: "Open",
    tone: "info" as const,
  },
  {
    cards: [
      {
        assignee: "Dana Chen",
        due: "15 Aug",
        id: "WP-142",
        subject: "Review the release checklist",
      },
      {
        assignee: "Riley Park",
        due: "19 Aug",
        id: "WP-145",
        subject: "Verify the project data import",
      },
    ],
    label: "In progress",
    tone: "warning" as const,
  },
  {
    cards: [
      {
        assignee: "Morgan Tate",
        due: "12 Aug",
        id: "WP-131",
        subject: "Publish the sprint retrospective",
      },
      {
        assignee: "Dana Chen",
        due: "08 Aug",
        id: "WP-129",
        subject: "Document the deployment checklist",
      },
    ],
    label: "Done",
    tone: "success" as const,
  },
];

const chipColor = {
  info: "primary",
  success: "success",
  warning: "warning",
} as const;

export function ProjectBoard({ projectId }: { projectId: string }) {
  const workPackagesHref = `/projects/${projectId}/work-items`;

  return (
    <Box>
      <Stack
        direction={{ sm: "row" }}
        spacing={2}
        sx={{ alignItems: { sm: "baseline" }, justifyContent: "space-between", mb: 5 }}
      >
        <Box>
          <Typography component="h1" variant="h1">
            Delivery board
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            A read-only view of current work grouped by status.
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
        aria-label="Kanban board"
        component="section"
        sx={{ display: "flex", gap: 4, minHeight: 480, overflowX: "auto", pb: 2 }}
      >
        {lanes.map((lane) => (
          <Box key={lane.label} sx={{ flex: "0 0 300px", maxWidth: 300 }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}
            >
              <Typography component="h2" sx={{ fontWeight: 700 }} variant="subtitle1">
                {lane.label} {lane.cards.length}
              </Typography>
              <Chip
                color={chipColor[lane.tone]}
                label={lane.cards.length}
                size="small"
                variant="outlined"
              />
            </Stack>
            <Stack spacing={2}>
              {lane.cards.map((card) => (
                <Paper
                  component={Link}
                  href={workPackagesHref}
                  key={card.id}
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    display: "block",
                    p: 3,
                    transition:
                      "border-color 150ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 150ms cubic-bezier(0.16, 1, 0.3, 1)",
                    "&:focus-visible": {
                      boxShadow: "0 0 0 3px rgba(26, 103, 163, 0.25)",
                      outline: "none",
                    },
                    "&:hover": { borderColor: "primary.main", boxShadow: 1 },
                  }}
                  variant="outlined"
                >
                  <Typography color="primary.main" variant="caption">
                    {card.id}
                  </Typography>
                  <Typography sx={{ fontWeight: 700, mt: 1 }} variant="body2">
                    {card.subject}
                  </Typography>
                  <Stack spacing={1} sx={{ color: "text.secondary", mt: 3 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <UserRound aria-hidden="true" size={14} strokeWidth={1.8} />
                      <Typography variant="caption">{card.assignee}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <CalendarDays aria-hidden="true" size={14} strokeWidth={1.8} />
                      <Typography variant="caption">Due {card.due}</Typography>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
