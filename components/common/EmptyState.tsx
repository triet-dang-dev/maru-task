import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

export interface EmptyStateProps {
  action?: ReactNode;
  description: ReactNode;
  icon?: ReactNode;
  title: ReactNode;
}

export function EmptyState({ action, description, icon, title }: EmptyStateProps) {
  return (
    <Stack
      className="items-start"
      role="status"
      spacing={3}
      sx={{
        bgcolor: "action.hover",
        border: "1px dashed",
        borderColor: "divider",
        borderRadius: 1,
        p: { xs: 4, sm: 5 },
      }}
    >
      {icon ? (
        <span className="grid size-10 place-items-center rounded bg-[var(--mui-palette-primary-light)] text-[var(--mui-palette-primary-dark)]">
          {icon}
        </span>
      ) : null}
      <Stack spacing={1}>
        <Typography component="h3" variant="h4">
          {title}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {description}
        </Typography>
      </Stack>
      {action}
    </Stack>
  );
}
