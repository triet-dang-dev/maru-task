"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { AlertCircle, ChevronRight, ListTodo, Plus } from "lucide-react";
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
import { StatusChip } from "@/components/ui/StatusChip";
import type { HomeAssignedTask } from "../types";

export interface HomeAssignedTasksWidgetProps {
  onCreateWorkItem?: () => void;
  tasks: HomeAssignedTask[];
}

export function HomeAssignedTasksWidget({
  onCreateWorkItem,
  tasks,
}: HomeAssignedTasksWidgetProps) {
  return (
    <SectionCard
      aria-labelledby="assigned-tasks-heading"
      component="section"
      data-testid="home-assigned-tasks"
    >
      <SectionCardHeader
        action={
          onCreateWorkItem ? (
            <Button
              onClick={onCreateWorkItem}
              size="small"
              startIcon={<Plus aria-hidden="true" className="h-4 w-4" />}
              variant="ghost"
            >
              New work item
            </Button>
          ) : null
        }
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <ListTodo aria-hidden="true" className="h-5 w-5 text-[var(--mui-palette-info-main)]" />
          <SectionCardTitle id="assigned-tasks-heading">
            Work Packages & Tasks
          </SectionCardTitle>
        </Stack>
      </SectionCardHeader>

      <SectionCardContent sx={{ p: 0 }}>
        {tasks.length === 0 ? (
          <Box sx={{ p: 4 }}>
            <EmptyState
              description="You have no pending or urgent work packages assigned at the moment."
              title="All caught up"
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
            {tasks.map((task) => (
              <Box
                component="li"
                key={task.id}
                sx={{
                  "&:hover": { bgcolor: "action.hover" },
                  borderBottom: "1px solid var(--mui-palette-divider)",
                  "&:last-child": { borderBottom: "none" },
                  transition: "background-color 0.15s ease-in-out",
                }}
              >
                <Link
                  href={`/projects/${encodeURIComponent(task.projectId)}/work-items`}
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
                      {task.subject}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: "center", mt: 0.5 }}
                    >
                      {task.projectName ? (
                        <Typography
                          color="text.secondary"
                          sx={{ fontSize: "0.75rem", fontWeight: 500 }}
                          variant="caption"
                        >
                          {task.projectName}
                        </Typography>
                      ) : null}
                      {task.dueDate ? (
                        <Typography
                          color="text.secondary"
                          sx={{ fontSize: "0.75rem" }}
                          variant="caption"
                        >
                          • Due {task.dueDate}
                        </Typography>
                      ) : null}
                    </Stack>
                  </Box>

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: "center", flexShrink: 0 }}
                  >
                    {task.priorityLabel ? (
                      <StatusChip
                        label={task.priorityLabel}
                        size="small"
                        tone={task.priorityTone || "neutral"}
                      />
                    ) : null}
                    <StatusChip
                      label={task.status}
                      size="small"
                      tone={task.statusTone || "info"}
                    />
                    <ChevronRight
                      aria-hidden="true"
                      className="h-4 w-4 text-[var(--mui-palette-text-secondary)]"
                    />
                  </Stack>
                </Link>
              </Box>
            ))}
          </Box>
        )}
      </SectionCardContent>

      <SectionCardFooter>
        <Stack
          direction="row"
          sx={{ justifyContent: "space-between", alignItems: "center" }}
        >
          <Typography color="text.secondary" variant="body2">
            Showing top {tasks.length} open item{tasks.length === 1 ? "" : "s"}
          </Typography>
          <Button component={Link} href="/my/page" size="small" variant="ghost">
            View my tasks
          </Button>
        </Stack>
      </SectionCardFooter>
    </SectionCard>
  );
}
