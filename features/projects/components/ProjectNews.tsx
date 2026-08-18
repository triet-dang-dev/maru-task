"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Newspaper, Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/common/EmptyState";

interface NewsItem {
  author: string;
  content: string;
  id: string;
  publishedAt: string;
  title: string;
}

const defaultNews: NewsItem[] = [
  {
    author: "Dana Chen",
    content:
      "The team has successfully completed the migration phase. All work packages have been transferred and verified. The next sprint starts Monday.",
    id: "news-1",
    publishedAt: "Aug 15, 2026",
    title: "Migration phase complete",
  },
  {
    author: "Riley Park",
    content:
      "New CI/CD pipeline has been deployed. Deployment time reduced from 12 minutes to 3 minutes. All stages are green.",
    id: "news-2",
    publishedAt: "Aug 10, 2026",
    title: "CI/CD pipeline upgrade",
  },
];

export function ProjectNews({
  initialNews = defaultNews,
  projectId,
}: {
  initialNews?: NewsItem[];
  projectId?: string;
}) {
  const [news] = useState(initialNews);

  return (
    <Stack spacing={0}>
      <Stack
        direction={{ sm: "row" }}
        spacing={2}
        sx={{ alignItems: { sm: "center" }, justifyContent: "space-between", mb: 5 }}
      >
        <Box>
          <Typography component="h1" variant="h1">
            News
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Project announcements and updates.
          </Typography>
        </Box>
        <Button startIcon={<Plus aria-hidden="true" size={16} />}>Add news</Button>
      </Stack>

      {news.length === 0 ? (
        <EmptyState
          description="No news items yet. Add the first announcement for this project."
          icon={<Newspaper size={40} />}
          title="No news yet"
        />
      ) : (
        <Stack spacing={3}>
          {news.map((item) => (
            <Box
              key={item.id}
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 2,
                p: 3,
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start", justifyContent: "space-between" }}>
                <Typography component="h2" sx={{ fontWeight: 700 }} variant="h6">
                  {item.title}
                </Typography>
                <Chip label={item.publishedAt} size="small" variant="outlined" />
              </Stack>
              <Typography color="text.secondary" sx={{ mt: 0.5 }} variant="caption">
                by {item.author}
              </Typography>
              <Typography sx={{ mt: 1.5 }} variant="body2">
                {item.content}
              </Typography>
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
