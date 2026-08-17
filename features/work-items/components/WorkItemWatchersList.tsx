import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { EmptyState } from "@/components/common/EmptyState";

export interface WorkItemWatcherListItem {
  id: string;
  name: string;
  subscribedAt: string;
}

interface WorkItemWatchersListProps {
  isLoading?: boolean;
  watchers: WorkItemWatcherListItem[];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function WorkItemWatchersList({ isLoading = false, watchers }: WorkItemWatchersListProps) {
  if (isLoading) {
    return (
      <Stack aria-label="Loading watchers" role="status" spacing={2} sx={{ py: 2 }}>
        {[1, 2].map((item) => (
          <Skeleton height={48} key={item} variant="rounded" />
        ))}
      </Stack>
    );
  }

  if (watchers.length === 0) {
    return (
      <EmptyState
        description="People following this work package will appear here."
        title="No watchers yet"
      />
    );
  }

  return (
    <Stack aria-label="Watchers" component="section" role="region" spacing={1}>
      {watchers.map((watcher) => (
        <Stack
          direction="row"
          key={watcher.id}
          spacing={2}
          sx={{ alignItems: "center", border: 1, borderColor: "divider", borderRadius: 1, p: 2 }}
        >
          <Avatar
            aria-label={watcher.name}
            sx={{ bgcolor: "secondary.main", height: 30, width: 30 }}
          >
            {getInitials(watcher.name)}
          </Avatar>
          <Box>
            <Typography sx={{ fontWeight: 600 }} variant="body2">
              {watcher.name}
            </Typography>
            <Typography color="text.secondary" variant="caption">
              {watcher.subscribedAt}
            </Typography>
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}
