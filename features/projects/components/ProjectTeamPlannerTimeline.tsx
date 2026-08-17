import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { UserRound, X } from "lucide-react";
import Link from "next/link";

import {
  dateKey,
  type TeamPlannerAssignee,
  type TeamPlannerWorkPackage,
} from "./project-team-planner-model";

function dayLabel(day: Date) {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    timeZone: "UTC",
    weekday: "short",
  }).format(day);
}

function fullDayLabel(day: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeZone: "UTC",
  }).format(day);
}

function eventPlacement(workPackage: TeamPlannerWorkPackage, days: Date[]) {
  const visibleIndexes = days.flatMap((day, index) => {
    const key = dateKey(day);
    return key >= workPackage.startDate && key <= workPackage.dueDate ? [index] : [];
  });
  if (visibleIndexes.length === 0) return null;
  return { span: visibleIndexes.length, start: visibleIndexes[0] };
}

function WorkPackageCard({
  days,
  projectId,
  workPackage,
}: {
  days: Date[];
  projectId: string;
  workPackage: TeamPlannerWorkPackage;
}) {
  const placement = eventPlacement(workPackage, days);
  if (!placement) return null;

  return (
    <Box
      role="gridcell"
      sx={{
        alignSelf: "center",
        gridColumn: `${placement.start + 2} / span ${placement.span}`,
        gridRow: 1,
        minWidth: 0,
        mx: 1,
        zIndex: 1,
      }}
    >
      <Box
        component={Link}
        href={`/projects/${projectId}/work-items/${workPackage.id}`}
        sx={{
          bgcolor: "background.paper",
          border: 1,
          borderColor: "divider",
          borderRadius: 0.5,
          boxShadow: "1px 1px 3px rgba(0, 0, 0, 0.14)",
          color: "text.primary",
          display: "block",
          minWidth: 0,
          overflow: "hidden",
          px: 2.5,
          py: 2,
          position: "relative",
          "&::before": {
            bgcolor: "primary.main",
            content: '\"\"',
            height: 2,
            left: 0,
            position: "absolute",
            right: 0,
            top: 0,
          },
          "&:focus-visible": {
            boxShadow: "0 0 0 3px rgba(26, 103, 163, 0.25)",
            outline: "none",
          },
          "&:hover": { borderColor: "primary.main" },
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 0 }}>
          <Typography color="text.secondary" sx={{ flexShrink: 0 }} variant="caption">
            WP-{workPackage.id}
          </Typography>
          <Typography noWrap sx={{ fontWeight: 650, minWidth: 0 }} variant="body2">
            {workPackage.subject}
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}

export function ProjectTeamPlannerTimeline({
  assignees,
  days,
  onRemoveAssignee,
  projectId,
}: {
  assignees: TeamPlannerAssignee[];
  days: Date[];
  onRemoveAssignee: (assigneeId: string) => void;
  projectId: string;
}) {
  const columns = `180px repeat(${days.length}, minmax(80px, 1fr))`;

  return (
    <Box sx={{ overflowX: "auto" }}>
      <Box
        aria-label="Team planner schedule"
        role="grid"
        sx={{ border: 1, borderColor: "divider", minWidth: 180 + days.length * 80 }}
      >
        <Box
          role="row"
          sx={{ bgcolor: "action.hover", display: "grid", gridTemplateColumns: columns }}
        >
          <Box
            aria-label="Assignee"
            role="columnheader"
            sx={{
              alignItems: "center",
              borderRight: 1,
              borderColor: "divider",
              display: "flex",
              gap: 2,
              px: 3,
            }}
          >
            <UserRound aria-hidden="true" size={16} />
            <Typography sx={{ fontWeight: 700 }} variant="caption">
              Assignee
            </Typography>
          </Box>
          {days.map((day) => (
            <Box
              aria-label={fullDayLabel(day)}
              key={dateKey(day)}
              role="columnheader"
              sx={{ borderRight: 1, borderColor: "divider", py: 2, textAlign: "center" }}
            >
              <Typography sx={{ fontWeight: 700 }} variant="caption">
                {dayLabel(day)}
              </Typography>
            </Box>
          ))}
        </Box>

        {assignees.map((assignee) => (
          <Box
            key={assignee.id}
            role="row"
            sx={{
              borderTop: 1,
              borderColor: "divider",
              display: "grid",
              gridTemplateColumns: columns,
              minHeight: 82,
            }}
          >
            <Stack
              aria-label={assignee.name}
              direction="row"
              role="rowheader"
              spacing={2}
              sx={{
                alignItems: "center",
                borderRight: 1,
                borderColor: "divider",
                minWidth: 0,
                px: 3,
              }}
            >
              <Avatar
                aria-hidden="true"
                sx={{
                  bgcolor: "primary.light",
                  color: "primary.dark",
                  fontSize: 12,
                  height: 28,
                  width: 28,
                }}
              >
                {assignee.initials}
              </Avatar>
              <Typography noWrap sx={{ flex: 1, fontWeight: 650 }} variant="body2">
                {assignee.name}
              </Typography>
              <IconButton
                aria-label={`Remove ${assignee.name}`}
                onClick={() => onRemoveAssignee(assignee.id)}
                size="small"
                sx={{ color: "text.secondary" }}
              >
                <X aria-hidden="true" size={15} />
              </IconButton>
            </Stack>
            {days.map((day) => (
              <Box
                aria-label={`${assignee.name}, ${fullDayLabel(day)}`}
                key={dateKey(day)}
                role="gridcell"
                sx={{ borderRight: 1, borderColor: "divider", gridRow: 1 }}
              />
            ))}
            {assignee.workPackages.map((workPackage) => (
              <WorkPackageCard
                days={days}
                key={workPackage.id}
                projectId={projectId}
                workPackage={workPackage}
              />
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
