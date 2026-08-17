import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { EmptyState } from "@/components/common/EmptyState";

export interface WorkItemActivityEvent {
  action: string;
  actor: string;
  body?: string;
  id: string;
  timestamp: string;
}

interface WorkItemActivityTimelineProps {
  events: WorkItemActivityEvent[];
  isLoading?: boolean;
}

export function WorkItemActivityTimeline({
  events,
  isLoading = false,
}: WorkItemActivityTimelineProps) {
  if (isLoading) {
    return (
      <Stack aria-label="Loading activity" role="status" spacing={3} sx={{ py: 2 }}>
        {[1, 2, 3].map((item) => (
          <Box key={item}>
            <Skeleton height={18} variant="text" width="40%" />
            <Skeleton height={56} sx={{ mt: 1 }} variant="rounded" />
          </Box>
        ))}
      </Stack>
    );
  }

  if (events.length === 0) {
    return (
      <EmptyState
        description="Updates, comments, and status changes will appear here."
        title="No activity yet"
      />
    );
  }

  return (
    <Stack aria-label="Work package activity" component="section" role="feed" spacing={0}>
      {events.map((event, index) => (
        <Stack
          component="article"
          key={event.id}
          spacing={1}
          sx={{
            borderLeft: 2,
            borderColor: index === events.length - 1 ? "transparent" : "divider",
            ml: 1,
            pb: index === events.length - 1 ? 0 : 3,
            pl: 3,
            position: "relative",
          }}
        >
          <Box
            aria-hidden="true"
            sx={{
              backgroundColor: "primary.main",
              border: 2,
              borderColor: "background.paper",
              borderRadius: "50%",
              height: 10,
              left: -6,
              position: "absolute",
              top: 5,
              width: 10,
            }}
          />
          <Typography variant="body2">
            <Box component="span" sx={{ fontWeight: 700 }}>
              {event.actor}
            </Box>{" "}
            {event.action}
          </Typography>
          <Typography color="text.secondary" variant="caption">
            {event.timestamp}
          </Typography>
          {event.body ? (
            <Box sx={{ backgroundColor: "action.hover", borderRadius: 1, mt: 1, p: 2 }}>
              <Typography variant="body2">{event.body}</Typography>
            </Box>
          ) : null}
        </Stack>
      ))}
    </Stack>
  );
}