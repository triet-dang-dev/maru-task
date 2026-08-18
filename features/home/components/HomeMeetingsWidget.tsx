"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Calendar, ChevronRight, Clock, MapPin, Users } from "lucide-react";
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
import type { HomeMeeting } from "../types";

export interface HomeMeetingsWidgetProps {
  meetings: HomeMeeting[];
}

export function HomeMeetingsWidget({ meetings }: HomeMeetingsWidgetProps) {
  return (
    <SectionCard
      aria-labelledby="upcoming-meetings-heading"
      component="section"
      data-testid="home-meetings-widget"
    >
      <SectionCardHeader>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Calendar aria-hidden="true" className="h-5 w-5 text-[var(--mui-palette-primary-main)]" />
          <SectionCardTitle id="upcoming-meetings-heading">
            Upcoming Meetings
          </SectionCardTitle>
        </Stack>
      </SectionCardHeader>

      <SectionCardContent sx={{ p: 0 }}>
        {meetings.length === 0 ? (
          <Box sx={{ p: 4 }}>
            <EmptyState
              description="No upcoming meetings scheduled for today or tomorrow."
              title="No scheduled meetings"
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
            {meetings.map((meeting) => (
              <Box
                component="li"
                key={meeting.id}
                sx={{
                  "&:hover": { bgcolor: "action.hover" },
                  borderBottom: "1px solid var(--mui-palette-divider)",
                  "&:last-child": { borderBottom: "none" },
                  transition: "background-color 0.15s ease-in-out",
                }}
              >
                <Link
                  href="/meetings"
                  style={{
                    alignItems: "center",
                    color: "inherit",
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "12px 20px",
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
                      {meeting.title}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{ alignItems: "center", mt: 0.5 }}
                    >
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                        <Clock aria-hidden="true" className="h-3.5 w-3.5 text-[var(--mui-palette-text-secondary)]" />
                        <Typography color="text.secondary" sx={{ fontSize: "0.75rem" }} variant="caption">
                          {meeting.startAt} {meeting.endAt ? `- ${meeting.endAt}` : ""}
                        </Typography>
                      </Stack>
                      {meeting.location ? (
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                          <MapPin aria-hidden="true" className="h-3.5 w-3.5 text-[var(--mui-palette-text-secondary)]" />
                          <Typography color="text.secondary" sx={{ fontSize: "0.75rem" }} variant="caption">
                            {meeting.location}
                          </Typography>
                        </Stack>
                      ) : null}
                    </Stack>
                  </Box>

                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexShrink: 0 }}>
                    {meeting.participantsCount ? (
                      <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", color: "text.secondary" }}>
                        <Users aria-hidden="true" className="h-3.5 w-3.5" />
                        <Typography sx={{ fontSize: "0.75rem" }} variant="caption">
                          {meeting.participantsCount}
                        </Typography>
                      </Stack>
                    ) : null}
                    <ChevronRight aria-hidden="true" className="h-4 w-4 text-[var(--mui-palette-text-secondary)]" />
                  </Stack>
                </Link>
              </Box>
            ))}
          </Box>
        )}
      </SectionCardContent>

      <SectionCardFooter>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
          <Typography color="text.secondary" variant="body2">
            Stay aligned with your sprint discussions
          </Typography>
          <Button component={Link} href="/meetings" size="small" variant="ghost">
            View all meetings
          </Button>
        </Stack>
      </SectionCardFooter>
    </SectionCard>
  );
}
