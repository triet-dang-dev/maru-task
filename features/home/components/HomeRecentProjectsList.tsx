"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ChevronRight, FolderKanban, Plus, Star } from "lucide-react";
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
import type { HomeRecentProject } from "../types";

export interface HomeRecentProjectsListProps {
  onCreateProject?: () => void;
  projects: HomeRecentProject[];
}

export function HomeRecentProjectsList({
  onCreateProject,
  projects,
}: HomeRecentProjectsListProps) {
  return (
    <SectionCard
      aria-labelledby="recent-projects-heading"
      component="section"
      data-testid="home-recent-projects"
    >
      <SectionCardHeader
        action={
          onCreateProject ? (
            <Button
              onClick={onCreateProject}
              size="small"
              startIcon={<Plus aria-hidden="true" className="h-4 w-4" />}
              variant="ghost"
            >
              New project
            </Button>
          ) : null
        }
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <FolderKanban aria-hidden="true" className="h-5 w-5 text-[var(--mui-palette-primary-main)]" />
          <SectionCardTitle id="recent-projects-heading">
            Projects & Workspaces
          </SectionCardTitle>
        </Stack>
      </SectionCardHeader>

      <SectionCardContent sx={{ p: 0 }}>
        {projects.length === 0 ? (
          <Box sx={{ p: 4 }}>
            <EmptyState
              description="Add one or multiple projects to get started with your tasks, boards, and timelines."
              title="No projects available"
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
            {projects.map((project) => (
              <Box
                component="li"
                key={project.id}
                sx={{
                  "&:hover": { bgcolor: "action.hover" },
                  borderBottom: "1px solid var(--mui-palette-divider)",
                  "&:last-child": { borderBottom: "none" },
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
                    padding: "12px 20px",
                    textDecoration: "none",
                    width: "100%",
                  }}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", minWidth: 0 }}>
                    <Star
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 fill-amber-400 text-amber-500"
                    />
                    <Box sx={{ minWidth: 0 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          variant="body1"
                        >
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
                              px: 1,
                              py: 0.25,
                            }}
                            variant="caption"
                          >
                            {project.code}
                          </Typography>
                        ) : null}
                      </Stack>
                      {project.description ? (
                        <Typography
                          color="text.secondary"
                          sx={{
                            fontSize: "0.8125rem",
                            mt: 0.25,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          variant="body2"
                        >
                          {project.description}
                        </Typography>
                      ) : null}
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexShrink: 0, ml: 2 }}>
                    <StatusChip
                      label={project.statusLabel || "Active"}
                      size="small"
                      tone={project.statusTone || "info"}
                    />
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
            Showing {projects.length} project{projects.length === 1 ? "" : "s"}
          </Typography>
          <Button
            component={Link}
            href="/projects"
            size="small"
            variant="ghost"
          >
            View all projects
          </Button>
        </Stack>
      </SectionCardFooter>
    </SectionCard>
  );
}
