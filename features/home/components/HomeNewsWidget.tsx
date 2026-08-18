"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ChevronRight, Megaphone, User } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/Button";
import {
  SectionCard,
  SectionCardContent,
  SectionCardFooter,
  SectionCardHeader,
  SectionCardTitle,
} from "@/components/ui/SectionCard";
import type { HomeNewsItem } from "../types";

export interface HomeNewsWidgetProps {
  news: HomeNewsItem[];
}

export function HomeNewsWidget({ news }: HomeNewsWidgetProps) {
  return (
    <SectionCard
      aria-labelledby="latest-news-heading"
      component="section"
      data-testid="home-news-widget"
    >
      <SectionCardHeader>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Megaphone aria-hidden="true" className="h-5 w-5 text-[var(--mui-palette-warning-main)]" />
          <SectionCardTitle id="latest-news-heading">
            News & Updates
          </SectionCardTitle>
        </Stack>
      </SectionCardHeader>

      <SectionCardContent sx={{ p: 0 }}>
        {news.length === 0 ? (
          <Box sx={{ p: 4 }}>
            <EmptyState
              description="No announcement or news articles published yet."
              title="No news articles"
            />
          </Box>
        ) : (
          <Box
            component="ul"
            sx={{
              divideY: "1px solid var(--mui-palette-divider)",
              listStyle: "none",
              m: 0,
              p: 0,
            }}
          >
            {news.map((item) => (
              <Box
                component="li"
                key={item.id}
                sx={{
                  "&:hover": { bgcolor: "action.hover" },
                  borderBottom: "1px solid var(--mui-palette-divider)",
                  "&:last-child": { borderBottom: "none" },
                  transition: "background-color 0.15s ease-in-out",
                }}
              >
                <Link
                  href="/news"
                  style={{
                    alignItems: "flex-start",
                    color: "inherit",
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "14px 20px",
                    textDecoration: "none",
                    width: "100%",
                  }}
                >
                  <Box sx={{ minWidth: 0, pr: 2 }}>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      variant="body1"
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      sx={{
                        fontSize: "0.8125rem",
                        mt: 0.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                      variant="body2"
                    >
                      {item.summary}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{ alignItems: "center", mt: 1 }}
                    >
                      {item.authorName ? (
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                          <User aria-hidden="true" className="h-3 w-3 text-[var(--mui-palette-text-secondary)]" />
                          <Typography color="text.secondary" sx={{ fontSize: "0.75rem" }} variant="caption">
                            {item.authorName}
                          </Typography>
                        </Stack>
                      ) : null}
                      <Typography color="text.secondary" sx={{ fontSize: "0.75rem" }} variant="caption">
                        {item.publishedAt}
                      </Typography>
                    </Stack>
                  </Box>

                  <ChevronRight
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-[var(--mui-palette-text-secondary)] mt-1"
                  />
                </Link>
              </Box>
            ))}
          </Box>
        )}
      </SectionCardContent>

      <SectionCardFooter>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
          <Typography color="text.secondary" variant="body2">
            Read product announcements and project highlights
          </Typography>
          <Button component={Link} href="/news" size="small" variant="ghost">
            View all news
          </Button>
        </Stack>
      </SectionCardFooter>
    </SectionCard>
  );
}
