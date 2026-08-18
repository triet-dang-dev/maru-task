"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Newspaper } from "lucide-react";

const news = [
  { author: "Dana Chen", content: "Version 2.0 of the platform is now live. All users have been migrated to the new system.", id: "n1", project: "Migration", publishedAt: "Aug 18, 2026", title: "Platform 2.0 launched" },
  { author: "Riley Park", content: "New CI/CD pipeline deployed. Build times reduced by 75%.", id: "n2", project: "Infrastructure", publishedAt: "Aug 15, 2026", title: "CI/CD upgrade complete" },
];

export function GlobalNewsPage() {
  return (
    <Stack spacing={0}>
      <Box sx={{ mb: 5 }}>
        <Typography component="h1" variant="h1">News</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>Latest announcements across all projects.</Typography>
      </Box>
      <Stack spacing={2}>
        {news.map((item) => (
          <Box key={item.id} sx={{ border: 1, borderColor: "divider", borderRadius: 2, p: 3, "&:hover": { bgcolor: "action.hover" } }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start", justifyContent: "space-between" }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <Newspaper aria-hidden="true" size={18} />
                <Typography sx={{ fontWeight: 700 }} variant="body1">{item.title}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexShrink: 0 }}>
                <Chip label={item.project} size="small" variant="outlined" />
                <Typography color="text.secondary" variant="caption">{item.publishedAt}</Typography>
              </Stack>
            </Stack>
            <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="caption">by {item.author}</Typography>
            <Typography sx={{ mt: 1 }} variant="body2">{item.content}</Typography>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
