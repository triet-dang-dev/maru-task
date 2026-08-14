import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

export interface PageHeaderProps {
  actions?: ReactNode;
  description: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
}

export function PageHeader({ actions, description, eyebrow, title }: PageHeaderProps) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={{ xs: 5, md: 8 }}
      sx={{ alignItems: { md: "flex-end" }, justifyContent: "space-between" }}
    >
      <Box sx={{ maxWidth: 720 }}>
        {eyebrow ? (
          <Typography color="primary.main" sx={{ fontWeight: 750, mb: 2 }} variant="body2">
            {eyebrow}
          </Typography>
        ) : null}
        <Typography component="h1" variant="h1">
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 4, maxWidth: 640 }} variant="body1">
          {description}
        </Typography>
      </Box>
      {actions ? (
        <Box sx={{ display: "flex", flexShrink: 0, gap: 2, flexWrap: "wrap" }}>{actions}</Box>
      ) : null}
    </Stack>
  );
}
