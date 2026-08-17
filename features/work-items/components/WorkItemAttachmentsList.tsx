import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { FileText } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";

export interface WorkItemAttachmentListItem {
  contentType: string;
  fileName: string;
  id: string;
  size: string;
  uploadState: string;
}

interface WorkItemAttachmentsListProps {
  attachments: WorkItemAttachmentListItem[];
  isLoading?: boolean;
}

export function WorkItemAttachmentsList({
  attachments,
  isLoading = false,
}: WorkItemAttachmentsListProps) {
  if (isLoading) {
    return (
      <Stack aria-label="Loading attachments" role="status" spacing={2} sx={{ py: 2 }}>
        {[1, 2].map((item) => (
          <Skeleton height={58} key={item} variant="rounded" />
        ))}
      </Stack>
    );
  }

  if (attachments.length === 0) {
    return (
      <EmptyState
        description="Linked files and uploads will appear here."
        title="No attachments yet"
      />
    );
  }

  return (
    <Stack aria-label="Attachments" component="section" role="region" spacing={1}>
      {attachments.map((attachment) => (
        <Stack
          direction="row"
          key={attachment.id}
          spacing={2}
          sx={{ alignItems: "center", border: 1, borderColor: "divider", borderRadius: 1, p: 2 }}
        >
          <FileText aria-hidden="true" color="var(--mui-palette-primary-main)" size={20} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography noWrap sx={{ fontWeight: 600 }} variant="body2">
              {attachment.fileName}
            </Typography>
            <Typography color="text.secondary" variant="caption">
              {attachment.contentType} · {attachment.size}
            </Typography>
          </Box>
          <Chip label={attachment.uploadState} size="small" variant="outlined" />
        </Stack>
      ))}
    </Stack>
  );
}