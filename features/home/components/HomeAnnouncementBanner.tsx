"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Info, X } from "lucide-react";
import { useState } from "react";

import { IconButton } from "@/components/ui/IconButton";
import type { HomeAnnouncement } from "../types";

export interface HomeAnnouncementBannerProps {
  announcement: HomeAnnouncement;
}

export function HomeAnnouncementBanner({ announcement }: HomeAnnouncementBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <Box
      data-testid="home-announcement-banner"
      role="region"
      aria-label="System announcement"
      sx={{
        bgcolor: "primary.50",
        border: "1px solid",
        borderColor: "primary.200",
        borderRadius: 2,
        p: { xs: 2, sm: 2.5 },
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start", minWidth: 0 }}>
          <Box
            sx={{
              alignItems: "center",
              bgcolor: "primary.100",
              borderRadius: 1.5,
              display: "flex",
              height: 32,
              justifyContent: "center",
              width: 32,
              flexShrink: 0,
              mt: 0.25,
            }}
          >
            <Info aria-hidden="true" className="h-4 w-4 text-[var(--mui-palette-primary-main)]" />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 650, fontSize: "0.875rem", color: "primary.900" }} variant="subtitle2">
              {announcement.title}
            </Typography>
            <Typography sx={{ fontSize: "0.8125rem", color: "primary.800", mt: 0.25 }} variant="body2">
              {announcement.message}
            </Typography>
          </Box>
        </Stack>

        <IconButton
          aria-label="Dismiss announcement"
          onClick={() => setIsDismissed(true)}
          size="small"
          sx={{ color: "primary.700", "&:hover": { bgcolor: "primary.100" } }}
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </IconButton>
      </Stack>
    </Box>
  );
}
