import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { EmptyState } from "@/components/common/EmptyState";

export interface WorkItemRelationListItem {
  id: string;
  relationType: string;
  workItemId: string;
  workItemStatus: string;
  workItemSubject: string;
}

interface WorkItemRelationsListProps {
  isLoading?: boolean;
  relations: WorkItemRelationListItem[];
}

function getGroupLabel(relationType: string) {
  return relationType
    .split(" ")
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export function WorkItemRelationsList({
  isLoading = false,
  relations,
}: WorkItemRelationsListProps) {
  if (isLoading) {
    return (
      <Stack aria-label="Loading relations" role="status" spacing={3} sx={{ py: 2 }}>
        {[1, 2].map((item) => (
          <Box key={item}>
            <Skeleton height={20} variant="text" width="25%" />
            <Skeleton height={52} sx={{ mt: 1 }} variant="rounded" />
          </Box>
        ))}
      </Stack>
    );
  }

  if (relations.length === 0) {
    return (
      <EmptyState
        description="Linked dependencies and related work packages will appear here."
        title="No related work packages"
      />
    );
  }

  const groups = relations.reduce<Map<string, WorkItemRelationListItem[]>>((result, relation) => {
    const group = result.get(relation.relationType) ?? [];
    group.push(relation);
    result.set(relation.relationType, group);
    return result;
  }, new Map());

  return (
    <Stack aria-label="Work package relations" component="section" role="region" spacing={4}>
      {[...groups.entries()].map(([relationType, group]) => (
        <Box key={relationType}>
          <Typography component="h3" sx={{ fontWeight: 700, mb: 1.5 }} variant="subtitle2">
            {getGroupLabel(relationType)}
          </Typography>
          <Stack
            component="ul"
            divider={<Box sx={{ borderTop: 1, borderColor: "divider" }} />}
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              listStyle: "none",
              m: 0,
              p: 0,
            }}
          >
            {group.map((relation) => (
              <Stack
                component="li"
                direction={{ sm: "row" }}
                key={relation.id}
                spacing={1}
                sx={{ alignItems: { sm: "center" }, justifyContent: "space-between", p: 2 }}
              >
                <Box>
                  <Typography color="primary.main" variant="caption">
                    #{relation.workItemId}
                  </Typography>
                  <Typography sx={{ fontWeight: 600 }} variant="body2">
                    {relation.workItemSubject}
                  </Typography>
                </Box>
                <Typography color="text.secondary" variant="caption">
                  {relation.workItemStatus}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
