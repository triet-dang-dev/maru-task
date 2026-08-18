"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { CalendarDays, GitCommit, MessageSquare, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

const eventTypes = {
  commented: { color: "#6e7781", icon: <MessageSquare size={14} />, label: "commented on" },
  created: { color: "#1f883d", icon: <Plus size={14} />, label: "created" },
  deleted: { color: "#cf222e", icon: <Trash2 size={14} />, label: "deleted" },
  statusChanged: { color: "#9a6700", icon: <GitCommit size={14} />, label: "changed status on" },
  updated: { color: "#0969da", icon: <Pencil size={14} />, label: "updated" },
} as const;

type EventType = keyof typeof eventTypes;

interface ActivityEvent {
  actor: string;
  detail?: string;
  id: string;
  target: string;
  targetHref?: string;
  timestamp: string;
  type: EventType;
}

const defaultEvents: ActivityEvent[] = [
  {
    actor: "Dana Chen",
    detail: "Status changed from Open → In progress",
    id: "evt-1",
    target: "WP-144 · Confirm incident runbook",
    targetHref: "#",
    timestamp: "Today at 18:42",
    type: "statusChanged",
  },
  {
    actor: "You",
    id: "evt-2",
    target: "WP-142 · Review the release checklist",
    targetHref: "#",
    timestamp: "Today at 17:15",
    type: "commented",
  },
  {
    actor: "Riley Park",
    id: "evt-3",
    target: "WP-138 · Confirm project stakeholder access",
    targetHref: "#",
    timestamp: "Today at 14:00",
    type: "created",
  },
  {
    actor: "Morgan Tate",
    detail: "Changed assignee and due date",
    id: "evt-4",
    target: "WP-131 · Publish the sprint retrospective",
    targetHref: "#",
    timestamp: "Yesterday at 09:30",
    type: "updated",
  },
  {
    actor: "Dana Chen",
    id: "evt-5",
    target: "WP-120 · Archive old sprint board",
    targetHref: "#",
    timestamp: "Monday at 11:00",
    type: "deleted",
  },
];

function groupByDate(events: ActivityEvent[]) {
  const groups: { date: string; events: ActivityEvent[] }[] = [];
  for (const event of events) {
    const date = event.timestamp.includes("Today")
      ? "Today"
      : event.timestamp.includes("Yesterday")
        ? "Yesterday"
        : event.timestamp.split(" at")[0];
    const existing = groups.find((g) => g.date === date);
    if (existing) existing.events.push(event);
    else groups.push({ date, events: [event] });
  }
  return groups;
}

function ActivityRow({ event }: { event: ActivityEvent }) {
  const type = eventTypes[event.type];

  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start", py: 1.5 }}>
      {/* Avatar */}
      <Box
        aria-hidden="true"
        sx={{
          alignItems: "center",
          bgcolor: "action.selected",
          borderRadius: "50%",
          color: "text.secondary",
          display: "flex",
          flexShrink: 0,
          fontSize: 11,
          fontWeight: 700,
          height: 28,
          justifyContent: "center",
          mt: 0.3,
          width: 28,
        }}
      >
        {event.actor
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" sx={{ alignItems: "center", flexWrap: "wrap", gap: 0.5 }}>
          <Typography component="span" sx={{ fontWeight: 600 }} variant="body2">
            {event.actor}
          </Typography>
          <Box
            component="span"
            sx={{ alignItems: "center", color: type.color, display: "inline-flex", gap: 0.4 }}
          >
            {type.icon}
            <Typography color="inherit" component="span" variant="body2">
              {type.label}
            </Typography>
          </Box>
          {event.targetHref ? (
            <Typography
              component={Link}
              href={event.targetHref}
              sx={{ color: "primary.main", fontWeight: 500, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
              variant="body2"
            >
              {event.target}
            </Typography>
          ) : (
            <Typography component="span" variant="body2">
              {event.target}
            </Typography>
          )}
        </Stack>
        {event.detail ? (
          <Typography color="text.secondary" sx={{ mt: 0.3 }} variant="caption">
            {event.detail}
          </Typography>
        ) : null}
      </Box>

      <Typography color="text.secondary" sx={{ flexShrink: 0, mt: 0.3 }} variant="caption">
        {event.timestamp.includes(" at ") ? event.timestamp.split(" at ")[1] : event.timestamp}
      </Typography>
    </Stack>
  );
}

export function ProjectActivity({
  events = defaultEvents,
  projectId,
}: {
  events?: ActivityEvent[];
  projectId?: string;
}) {
  const groups = useMemo(() => groupByDate(events), [events]);

  return (
    <Stack spacing={0}>
      <Stack
        direction={{ sm: "row" }}
        spacing={2}
        sx={{ alignItems: { sm: "baseline" }, justifyContent: "space-between", mb: 5 }}
      >
        <Box>
          <Typography component="h1" variant="h1">
            Activity
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Recent changes and events in this project.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <CalendarDays aria-hidden="true" size={14} />
          <Typography color="text.secondary" variant="body2">
            Showing last 7 days
          </Typography>
        </Stack>
      </Stack>

      {groups.map((group, gi) => (
        <Box key={group.date}>
          <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 1, mt: gi > 0 ? 3 : 0 }}>
            <Chip label={group.date} size="small" sx={{ fontWeight: 600 }} variant="outlined" />
            <Divider sx={{ flex: 1 }} />
          </Stack>
          {group.events.map((event, i) => (
            <Box key={event.id}>
              <ActivityRow event={event} />
              {i < group.events.length - 1 ? <Divider /> : null}
            </Box>
          ))}
        </Box>
      ))}

      {events.length === 0 ? (
        <Box sx={{ py: 8, textAlign: "center" }}>
          <Typography color="text.secondary">No activity yet for this project.</Typography>
        </Box>
      ) : null}
    </Stack>
  );
}
