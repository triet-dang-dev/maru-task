"use client";

import { useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const calendarEvents = [
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
      </Stack>

      <Paper sx={{ minHeight: 520, p: { xs: 2, sm: 3 } }} variant="outlined">
        <Stack
          direction={{ sm: "row" }}
          spacing={2}
          sx={{ alignItems: "center", justifyContent: "space-between", mb: 3 }}
        >
          <Stack direction="row" spacing={1}>
            <Button
              aria-label={view === "month" ? "Previous month" : "Previous week"}
              onClick={() => changeDateRange(-1)}
              size="small"
              variant="outlined"
            >
              <ChevronLeft aria-hidden="true" size={17} />
            </Button>
            <Button
              aria-label={view === "month" ? "Next month" : "Next week"}
              onClick={() => changeDateRange(1)}
              size="small"
              variant="outlined"
            >
              <ChevronRight aria-hidden="true" size={17} />
            </Button>
            <Button
              onClick={() => setCurrentDate(new Date(Date.UTC(2026, 7, 11)))}
              size="small"
              variant="outlined"
            >
              Today
            </Button>
          </Stack>
          <Typography component="h2" variant="h5">
            {view === "month" ? formatMonth(currentDate) : formatWeek(days)}
          </Typography>
          <ToggleButtonGroup
            aria-label="Calendar view"
            exclusive
            onChange={(_, nextView: "month" | "week" | null) => nextView && setView(nextView)}
            size="small"
            value={view}
          >
            <ToggleButton value="month">Month</ToggleButton>
            <ToggleButton value="week">Week</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        <Box
          aria-label="Work package calendar"
          role="grid"
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(7rem, 1fr))",
            minWidth: 784,
            overflowX: "auto",
          }}
        >
          {weekdays.map((weekday) => (
            <Box
              key={weekday}
              role="columnheader"
              sx={{ borderBottom: 1, borderColor: "divider", p: 1, textAlign: "center" }}
            >
              <Typography color="text.secondary" variant="caption">
                {weekday}
              </Typography>
            </Box>
          ))}
          {days.map((day) => {
            const isCurrentMonth = day.getUTCMonth() === currentMonth;
            const events = calendarEvents.filter((event) => event.date === dateKey(day));

            return (
              <Box
                aria-label={dateKey(day)}
                key={dateKey(day)}
                role="gridcell"
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                  borderRight: 1,
                  minHeight: 92,
                  p: 1,
                  ...(isCurrentMonth ? {} : { bgcolor: "action.hover", color: "text.disabled" }),
                }}
              >
                <Typography sx={{ fontWeight: 700 }} variant="caption">
                  {day.getUTCDate()}
                </Typography>
                <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                  {events.map((event) => (
                    <Box
                      component={Link}
                      href={`/projects/${projectId}/work-items/${event.id}`}
                      key={event.id}
                      sx={{
                        backgroundColor: "primary.main",
                        borderRadius: 1,
                        color: "primary.contrastText",
                        display: "block",
                        fontSize: "0.75rem",
                        overflow: "hidden",
                        px: 0.75,
                        py: 0.5,
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        "&:focus-visible": {
                          outline: "3px solid",
                          outlineColor: "primary.light",
                          outlineOffset: 2,
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
