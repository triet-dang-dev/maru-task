"use client";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  CalendarDays,
  Clock,
  ExternalLink,
  FolderKanban,
  GripVertical,
  ListTodo,
  Megaphone,
  Star,
  X,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { StatusChip } from "@/components/ui/StatusChip";

import type {
  MyPageCalendarEvent,
  MyPageWidgetData,
  MyPageWidgetDefinition,
  MyPageWidgetType,
  MyPageWorkPackageItem,
} from "./my-page-model";

function getWidgetIcon(type: MyPageWidgetType): ReactNode {
  const iconProps = { className: "h-4 w-4 shrink-0", "aria-hidden": true };
  switch (type) {
    case "workPackagesAssigned":
      return <ListTodo {...iconProps} className="h-4 w-4 text-[var(--mui-palette-primary-main)]" />;
    case "workPackagesCreated":
      return <ListTodo {...iconProps} className="h-4 w-4 text-[var(--mui-palette-info-main)]" />;
    case "spentTime":
      return <Clock {...iconProps} className="h-4 w-4 text-[var(--mui-palette-success-main)]" />;
    case "favoriteProjects":
      return <FolderKanban {...iconProps} className="h-4 w-4 text-[var(--mui-palette-warning-main)]" />;
    case "calendar":
      return <CalendarDays {...iconProps} className="h-4 w-4 text-[var(--mui-palette-secondary-main)]" />;
    case "news":
      return <Megaphone {...iconProps} className="h-4 w-4 text-amber-500" />;
    case "customText":
      return <BookOpen {...iconProps} className="h-4 w-4 text-purple-500" />;
    default:
      return <ListTodo {...iconProps} />;
  }
}

function WorkPackageWidget({ data, type }: { data: MyPageWidgetData; type: MyPageWidgetType }) {
  const items: MyPageWorkPackageItem[] =
    type === "workPackagesCreated" ? data.workPackages.slice(1) : data.workPackages;

  if (items.length === 0) {
    return (
      <Box sx={{ px: 3, py: 4, textAlign: "center" }}>
        <Typography color="text.secondary" variant="body2">
          {type === "workPackagesCreated"
            ? "You haven't created any work packages yet."
            : "No open work packages assigned to you."}
        </Typography>
      </Box>
    );
  }

  return (
    <Stack divider={<Divider flexItem />}>
      {items.map((item) => (
        <Box
          key={item.id}
          sx={{
            "&:hover": { bgcolor: "action.hover" },
            px: 3,
            py: 2,
            transition: "background-color 0.15s ease-in-out",
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                component={Link}
                href={`/projects/${encodeURIComponent(item.projectId)}/work-items`}
                sx={{
                  color: "primary.main",
                  fontWeight: 650,
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                variant="body2"
              >
                {item.id} · {item.subject}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", mt: 0.5 }}>
                {item.projectName ? (
                  <Typography color="text.secondary" sx={{ fontSize: "0.75rem", fontWeight: 500 }} variant="caption">
                    {item.projectName}
                  </Typography>
                ) : null}
                {item.dueDate ? (
                  <Typography color="text.secondary" sx={{ fontSize: "0.75rem" }} variant="caption">
                    • Due {item.dueDate}
                  </Typography>
                ) : null}
              </Stack>
            </Box>

            <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexShrink: 0, ml: 1 }}>
              {item.priority ? (
                <StatusChip
                  label={item.priority}
                  size="small"
                  tone={item.priorityTone || "neutral"}
                />
              ) : null}
              <StatusChip
                label={item.status}
                size="small"
                tone={item.statusTone || "info"}
              />
            </Stack>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}

function WidgetContent({ data, type }: { data: MyPageWidgetData; type: MyPageWidgetType }) {
  if (type === "workPackagesAssigned" || type === "workPackagesCreated") {
    return <WorkPackageWidget data={data} type={type} />;
  }

  if (type === "spentTime") {
    const totalHours = data.spentTime.reduce((total, entry) => total + entry.hours, 0);
    return (
      <Box sx={{ px: 3, py: 2.5 }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: "flex-end",
            justifyContent: "space-between",
            mb: 2,
            pt: 1,
          }}
        >
          {data.spentTime.map((entry) => {
            const heightPercent = Math.min(100, Math.max(15, (entry.hours / 10) * 100));
            return (
              <Stack
                key={entry.day}
                spacing={0.75}
                sx={{ alignItems: "center", flex: 1 }}
              >
                <Typography sx={{ fontSize: "0.75rem", fontWeight: 700 }}>
                  {entry.hours}h
                </Typography>
                <Box
                  sx={{
                    bgcolor: "action.hover",
                    borderRadius: 1,
                    height: 50,
                    position: "relative",
                    width: 24,
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: "primary.main",
                      borderRadius: 1,
                      bottom: 0,
                      height: `${heightPercent}%`,
                      position: "absolute",
                      width: "100%",
                    }}
                  />
                </Box>
                <Typography color="text.secondary" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                  {entry.day}
                </Typography>
              </Stack>
            );
          })}
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
          <Typography color="text.secondary" variant="body2">
            Weekly logged: <strong>{totalHours.toFixed(1)} hours</strong>
          </Typography>
          <Button component={Link} href="/my/time-tracking" size="small" variant="ghost">
            Open time tracking
          </Button>
        </Stack>
      </Box>
    );
  }

  if (type === "favoriteProjects") {
    if (data.favoriteProjects.length === 0) {
      return (
        <Box sx={{ px: 3, py: 4, textAlign: "center" }}>
          <Typography color="text.secondary" variant="body2">
            You have no favorite projects yet.
          </Typography>
        </Box>
      );
    }
    return (
      <Stack divider={<Divider flexItem />}>
        {data.favoriteProjects.map((project) => (
          <Box
            key={project.id}
            sx={{
              "&:hover": { bgcolor: "action.hover" },
              px: 3,
              py: 2,
              transition: "background-color 0.15s ease-in-out",
            }}
          >
            <Link
              href={`/projects/${encodeURIComponent(project.id)}`}
              style={{
                alignItems: "center",
                color: "inherit",
                display: "flex",
                justifyContent: "space-between",
                textDecoration: "none",
                width: "100%",
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", minWidth: 0 }}>
                <Star aria-hidden="true" className="h-4 w-4 shrink-0 fill-amber-400 text-amber-500" />
                <Typography sx={{ color: "primary.main", fontWeight: 650 }} variant="body2">
                  {project.name}
                </Typography>
                {project.code ? (
                  <Typography
                    color="text.secondary"
                    sx={{
                      bgcolor: "action.selected",
                      borderRadius: 1,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      px: 0.75,
                      py: 0.1,
                    }}
                    variant="caption"
                  >
                    {project.code}
                  </Typography>
                ) : null}
              </Stack>
              {project.status ? (
                <StatusChip
                  label={project.status}
                  size="small"
                  tone={project.statusTone || "info"}
                />
              ) : null}
            </Link>
          </Box>
        ))}
      </Stack>
    );
  }

  if (type === "calendar") {
    if (data.calendarEvents.length === 0) {
      return (
        <Box sx={{ px: 3, py: 4, textAlign: "center" }}>
          <Typography color="text.secondary" variant="body2">
            No upcoming events or milestones.
          </Typography>
        </Box>
      );
    }

    return (
      <Stack divider={<Divider flexItem />}>
        {data.calendarEvents.map((event) => {
          if (typeof event === "string") {
            return (
              <Box key={event} sx={{ px: 3, py: 2 }}>
                <Typography color="text.secondary" variant="body2">
                  {event}
                </Typography>
              </Box>
            );
          }

          return (
            <Box
              key={event.id}
              sx={{
                "&:hover": { bgcolor: "action.hover" },
                px: 3,
                py: 2,
                transition: "background-color 0.15s ease-in-out",
              }}
            >
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", justifyContent: "space-between" }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", minWidth: 0 }}>
                  <Box
                    sx={{
                      alignItems: "center",
                      bgcolor: "action.selected",
                      borderRadius: 1,
                      display: "flex",
                      flexDirection: "column",
                      height: 36,
                      justifyContent: "center",
                      minWidth: 42,
                      px: 1,
                    }}
                  >
                    <Calendar aria-hidden="true" className="h-3.5 w-3.5 text-[var(--mui-palette-primary-main)]" />
                    <Typography sx={{ fontSize: "0.6875rem", fontWeight: 700 }} variant="caption">
                      {event.date}
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      component={event.href ? Link : "span"}
                      href={event.href}
                      sx={{
                        color: event.href ? "primary.main" : "inherit",
                        fontWeight: 600,
                        textDecoration: "none",
                        "&:hover": event.href ? { textDecoration: "underline" } : undefined,
                      }}
                      variant="body2"
                    >
                      {event.title}
                    </Typography>
                    {event.projectName ? (
                      <Typography color="text.secondary" sx={{ display: "block", fontSize: "0.75rem" }} variant="caption">
                        {event.projectName}
                      </Typography>
                    ) : null}
                  </Box>
                </Stack>
              </Stack>
            </Box>
          );
        })}
      </Stack>
    );
  }

  if (type === "news") {
    const newsList = data.news || [];
    if (newsList.length === 0) {
      return (
        <Box sx={{ px: 3, py: 4, textAlign: "center" }}>
          <Typography color="text.secondary" variant="body2">
            No subscribed news articles available.
          </Typography>
        </Box>
      );
    }
    return (
      <Stack divider={<Divider flexItem />}>
        {newsList.map((item) => (
          <Box
            key={item.id}
            sx={{
              "&:hover": { bgcolor: "action.hover" },
              px: 3,
              py: 2,
              transition: "background-color 0.15s ease-in-out",
            }}
          >
            <Link href="/news" style={{ color: "inherit", textDecoration: "none" }}>
              <Typography sx={{ fontWeight: 650, color: "primary.main" }} variant="body2">
                {item.title}
              </Typography>
              <Typography
                color="text.secondary"
                sx={{
                  display: "-webkit-box",
                  fontSize: "0.8125rem",
                  mt: 0.25,
                  overflow: "hidden",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                }}
                variant="body2"
              >
                {item.summary}
              </Typography>
              <Typography color="text.secondary" sx={{ display: "block", fontSize: "0.75rem", mt: 0.5 }} variant="caption">
                {item.author ? `${item.author} · ` : ""}{item.date}
              </Typography>
            </Link>
          </Box>
        ))}
      </Stack>
    );
  }

  return (
    <Box sx={{ px: 3, py: 3 }}>
      <Typography color="text.primary" sx={{ lineHeight: 1.6 }} variant="body2">
        {data.customText || "Click configure to add your own personal notes and quick links."}
      </Typography>
    </Box>
  );
}

export function MyPageWidgetCard({
  data,
  index,
  onMove,
  onRemove,
  total,
  widget,
}: {
  data: MyPageWidgetData;
  index: number;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  total: number;
  widget: MyPageWidgetDefinition;
}) {
  return (
    <Paper
      aria-label={widget.title}
      component="section"
      data-testid={`my-page-widget-${widget.id}`}
      sx={{
        borderRadius: 2,
        minWidth: 0,
        overflow: "hidden",
      }}
      variant="outlined"
    >
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          bgcolor: "action.hover",
          borderBottom: "1px solid var(--mui-palette-divider)",
          justifyContent: "space-between",
          px: 2.5,
          py: 1.5,
        }}
      >
        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", minWidth: 0 }}>
          <GripVertical aria-hidden="true" className="h-4 w-4 text-[var(--mui-palette-text-secondary)] shrink-0" />
          {getWidgetIcon(widget.type)}
          <Typography component="h2" noWrap sx={{ fontWeight: 700 }} variant="subtitle1">
            {widget.title}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
          <IconButton
            aria-label={`Move ${widget.title} earlier`}
            disabled={index === 0}
            onClick={() => onMove(-1)}
            size="small"
          >
            <ArrowLeft aria-hidden="true" size={15} />
          </IconButton>
          <IconButton
            aria-label={`Move ${widget.title} later`}
            disabled={index === total - 1}
            onClick={() => onMove(1)}
            size="small"
          >
            <ArrowRight aria-hidden="true" size={15} />
          </IconButton>
          <IconButton
            aria-label={`Remove ${widget.title} widget`}
            onClick={onRemove}
            size="small"
            sx={{ "&:hover": { color: "error.main" } }}
          >
            <X aria-hidden="true" size={16} />
          </IconButton>
        </Stack>
      </Stack>

      <WidgetContent data={data} type={widget.type} />
    </Paper>
  );
}
