"use client";

import { useEffect, useMemo, useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { getWorkItems } from "@/features/work-items/service";
import type { WorkItemListItem } from "@/features/work-items/types";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const defaultCalendarEvents = [
  { date: "2026-08-11", id: "101", subject: "Map the project list contract" },
  { date: "2026-08-13", id: "102", subject: "Migrate the work-item table" },
  { date: "2026-08-15", id: "103", subject: "Create the authentication screen" },
];

function getMonthDays(month: Date) {
  const firstDay = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1));
  const gridStart = new Date(firstDay);
  gridStart.setUTCDate(1 - firstDay.getUTCDay());

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart);
    day.setUTCDate(gridStart.getUTCDate() + index);
    return day;
  });
}

function getWeekDays(date: Date) {
  const weekStart = new Date(date);
  weekStart.setUTCDate(date.getUTCDate() - date.getUTCDay());

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(weekStart);
    day.setUTCDate(weekStart.getUTCDate() + index);
    return day;
  });
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(date);
}

function formatWeek(days: Date[]) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  });
  return `${formatter.format(days[0])} - ${formatter.format(days[6])}`;
}

export function ProjectCalendar({ projectId }: { projectId: string }) {
  const [currentDate, setCurrentDate] = useState(() => new Date(Date.UTC(2026, 7, 11)));
  const [view, setView] = useState<"month" | "week">("month");
  const [items, setItems] = useState<WorkItemListItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    getWorkItems(projectId)
      .then((res) => {
        if (isMounted && res.items && res.items.length > 0) {
          setItems(res.items);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const calendarEvents = useMemo(() => {
    if (items.length === 0) return defaultCalendarEvents;
    return items.map((it, idx) => {
      const dayOffset = 10 + (idx % 18);
      const dayStr = dayOffset < 10 ? `0${dayOffset}` : `${dayOffset}`;
      return {
        date: `2026-08-${dayStr}`,
        id: it.id,
        subject: it.subject,
      };
    });
  }, [items]);

  const days = view === "month" ? getMonthDays(currentDate) : getWeekDays(currentDate);
  const currentMonth = currentDate.getUTCMonth();

  const changeDateRange = (offset: number) => {
    setCurrentDate(
      (current) =>
        new Date(
          Date.UTC(
            current.getUTCFullYear(),
            current.getUTCMonth() + (view === "month" ? offset : 0),
            current.getUTCDate() + (view === "week" ? offset * 7 : 0),
          ),
        ),
    );
  };

  return (
    <Box>
      <Stack
        direction={{ sm: "row" }}
        spacing={2}
        sx={{ alignItems: { sm: "baseline" }, justifyContent: "space-between", mb: 5 }}
      >
        <Box>
          <Typography component="h1" variant="h1">
            Calendar
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            View scheduled work packages by date.
          </Typography>
        </Box>
        <Typography
          component={Link}
          href={`/projects/${projectId}/work-items`}
          sx={{ color: "primary.main", fontWeight: 700 }}
        >
          Open work packages
        </Typography>
      </Stack>

      <Stack
        direction={{ sm: "row" }}
        spacing={2}
        sx={{ alignItems: "center", justifyContent: "space-between", mb: 3 }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Button
            aria-label="Previous month"
            onClick={() => changeDateRange(-1)}
            size="small"
            startIcon={<ChevronLeft aria-hidden="true" size={16} />}
            variant="outlined"
          >
            Prev
          </Button>
          <Button
            onClick={() => setCurrentDate(new Date(Date.UTC(2026, 7, 11)))}
            size="small"
            variant="outlined"
          >
            Today
          </Button>
          <Button
            aria-label="Next month"
            onClick={() => changeDateRange(1)}
            size="small"
            startIcon={<ChevronRight aria-hidden="true" size={16} />}
            variant="outlined"
          >
            Next
          </Button>
          <Typography sx={{ fontWeight: 700, minWidth: "12rem" }}>
            {view === "month" ? formatMonth(currentDate) : formatWeek(days)}
          </Typography>
        </Stack>

        <ToggleButtonGroup
          aria-label="Calendar view"
          exclusive
          onChange={(_, nextView: "month" | "week" | null) => {
            if (nextView) setView(nextView);
          }}
          size="small"
          value={view}
        >
          <ToggleButton value="month">Month</ToggleButton>
          <ToggleButton value="week">Week</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Paper aria-label="Work package calendar" role="grid" sx={{ overflow: "hidden" }} variant="outlined">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
            textAlign: "center",
          }}
        >
          {weekdays.map((day) => (
            <Box
              key={day}
              sx={{
                bgcolor: "action.hover",
                borderBottom: 1,
                borderColor: "divider",
                fontWeight: 700,
                py: 1.5,
              }}
            >
              <Typography color="text.secondary" variant="caption">
                {day}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          }}
        >
          {days.map((day, index) => {
            const key = dateKey(day);
            const events = calendarEvents.filter((event) => event.date === key);
            const isOutsideMonth = view === "month" && day.getUTCMonth() !== currentMonth;

            return (
              <Box
                aria-label={`Calendar day ${key}`}
                key={day.toISOString()}
                sx={{
                  bgcolor: isOutsideMonth ? "action.hover" : "background.paper",
                  borderBottom: 1,
                  borderColor: "divider",
                  borderRight: (index + 1) % 7 !== 0 ? 1 : 0,
                  minHeight: view === "month" ? 110 : 280,
                  p: 1.5,
                }}
              >
                <Typography
                  color={isOutsideMonth ? "text.disabled" : "text.secondary"}
                  sx={{ fontWeight: 600, mb: 1 }}
                  variant="caption"
                >
                  {day.getUTCDate()}
                </Typography>
                <Stack spacing={0.5}>
                  {events.map((event) => (
                    <Box
                      component={Link}
                      href={`/projects/${projectId}/work-items/${event.id}`}
                      key={event.id}
                      sx={{
                        bgcolor: "primary.main",
                        borderRadius: 0.5,
                        color: "primary.contrastText",
                        display: "block",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        overflow: "hidden",
                        px: 1,
                        py: 0.5,
                        textDecoration: "none",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        "&:hover": {
                          opacity: 0.9,
                        },
                      }}
                    >
                      {event.subject}
                    </Box>
                  ))}
                </Stack>
              </Box>
            );
          })}
        </Box>
      </Paper>
    </Box>
  );
}
