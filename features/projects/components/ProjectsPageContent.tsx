"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Archive,
  ArrowRight,
  ChevronRight,
  Columns3,
  FolderKanban,
  LayoutGrid,
  List,
  Plus,
  Settings,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { IconButton } from "@/components/ui/IconButton";
import { InputField } from "@/components/ui/InputField";
import { LoadingState } from "@/components/ui/LoadingState";
import { Modal } from "@/components/ui/Modal";
import { StatusChip } from "@/components/ui/StatusChip";
import { useToast } from "@/components/ui/Toast";
import type { StatusTone } from "@/theme/tokens";

import { createProject, getProjects } from "../service";
import type { ProjectListItem, ProjectsResponse } from "../types";

type CreateProjectFormValues = {
  description: string;
  name: string;
};

const FAVORITES_STORAGE_KEY = "maru_task_favorite_projects";

function getStoredFavorites(): string[] {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
  }
  return [];
}

function mapStatusTone(status?: string): StatusTone {
  if (!status) return "neutral";
  const normalized = status.toLowerCase().replace(/[\s_]+/g, "-");
  if (["closed", "completed", "done", "resolved"].includes(normalized)) return "success";
  if (["on-track", "in-progress", "open", "active"].includes(normalized)) return "info";
  if (["at-risk", "review", "testing", "pending"].includes(normalized)) return "warning";
  if (["off-track", "blocked", "rejected", "failed"].includes(normalized)) return "error";
  return "neutral";
}

function toProjectCode(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

export function ProjectsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { error: toastError, success: toastSuccess } = useToast();

  const [data, setData] = useState<ProjectsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [favorites, setFavorites] = useState<string[]>(getStoredFavorites);

  // Create Project Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { control, handleSubmit, reset, watch } = useForm<CreateProjectFormValues>({
    defaultValues: { description: "", name: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const projectCode = toProjectCode(watch("name"));

  const statusParam = searchParams.get("status")?.toLowerCase() || "";
  const viewParam = searchParams.get("view")?.toLowerCase() || "active";

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setData(await getProjects());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load projects.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await load();
    })();
  }, [load]);

  useEffect(() => {
    if (error) toastError(error);
  }, [error, toastError]);

  const toggleFavorite = (projectId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const isFav = favorites.includes(projectId);
    const updated = isFav ? favorites.filter((id) => id !== projectId) : [...favorites, projectId];
    setFavorites(updated);
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    toastSuccess(isFav ? "Removed from favorites." : "Added to favorites.");
  };

  const setViewFilter = (nextView: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextView === "active") params.delete("view");
    else params.set("view", nextView);
    const qs = params.toString();
    router.replace(qs ? `/projects?${qs}` : "/projects");
  };

  const setStatusFilter = (nextStatus: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!nextStatus) params.delete("status");
    else params.set("status", nextStatus);
    const qs = params.toString();
    router.replace(qs ? `/projects?${qs}` : "/projects");
  };

  const handleCreateProject = async ({ description, name }: CreateProjectFormValues) => {
    setIsCreating(true);
    try {
      const project = await createProject({
        code: projectCode || null,
        description: description.trim() || null,
        name: name.trim(),
      });
      toastSuccess(`Project "${project.name}" created.`);
      reset();
      setIsCreateOpen(false);
      router.push(`/projects/${project.id}`);
    } catch (submitError) {
      toastError(submitError instanceof Error ? submitError.message : "Unable to create project.");
    } finally {
      setIsCreating(false);
    }
  };

  const items = data?.items || [];

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. View tab filtering
      if (viewParam === "archived") {
        if (item.status.toLowerCase() !== "archived") return false;
      } else {
        if (item.status.toLowerCase() === "archived") return false;
        if (viewParam === "favorites" && !favorites.includes(item.id)) return false;
        // "mine" view shows all active or user's projects
      }

      // 2. Status pill filtering
      if (statusParam) {
        const normalizedParam = statusParam.replace(/-/g, " ");
        const normalizedItemStatus = item.status.toLowerCase().replace(/-/g, " ");
        if (!normalizedItemStatus.includes(normalizedParam)) return false;
      }

      return true;
    });
  }, [items, viewParam, favorites, statusParam]);

  const columns: Array<ColumnDef<ProjectListItem>> = useMemo(
    () => [
      {
        accessorKey: "favorite",
        cell: ({ row }) => {
          const isFav = favorites.includes(row.original.id);
          return (
            <IconButton
              aria-label={isFav ? "Remove favorite" : "Mark as favorite"}
              onClick={(e) => toggleFavorite(row.original.id, e)}
              size="small"
            >
              <Star
                aria-hidden="true"
                className={`h-4 w-4 ${isFav ? "fill-amber-400 text-amber-500" : "text-[var(--mui-palette-text-secondary)]"}`}
              />
            </IconButton>
          );
        },
        header: "",
        size: 40,
      },
      {
        accessorKey: "code",
        cell: ({ getValue }) => {
          const val = getValue<string>();
          return val ? (
            <Typography
              color="text.secondary"
              sx={{
                bgcolor: "action.selected",
                borderRadius: 1,
                display: "inline-block",
                fontSize: "0.75rem",
                fontWeight: 600,
                px: 1,
                py: 0.25,
              }}
              variant="caption"
            >
              {val}
            </Typography>
          ) : (
            "—"
          );
        },
        header: "Code",
      },
      {
        accessorKey: "name",
        cell: ({ row }) => (
          <Link
            className="font-semibold text-[var(--mui-palette-primary-main)] hover:underline"
            href={`/projects/${row.original.id}`}
          >
            {row.original.name || "Untitled project"}
          </Link>
        ),
        header: "Project Name",
      },
      {
        accessorKey: "status",
        cell: ({ getValue }) => {
          const val = getValue<string>() || "Active";
          return <StatusChip label={val} size="small" tone={mapStatusTone(val)} />;
        },
        header: "Status",
      },
      {
        accessorKey: "updatedAt",
        cell: ({ getValue }) => {
          const raw = getValue<string>();
          if (!raw) return "—";
          try {
            return new Date(raw).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
          } catch {
            return raw;
          }
        },
        header: "Last Updated",
      },
      {
        accessorKey: "actions",
        cell: ({ row }) => (
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Button
              component={Link}
              href={`/projects/${row.original.id}/work-items`}
              size="small"
              variant="ghost"
            >
              Work packages
            </Button>
            <Link
              aria-label={`Open ${row.original.name} settings`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--mui-palette-text-secondary)] hover:bg-[var(--mui-palette-action-hover)] hover:text-[var(--mui-palette-text-primary)]"
              href={`/projects/${row.original.id}/settings`}
            >
              <Settings aria-hidden="true" className="h-4 w-4" />
            </Link>
          </Stack>
        ),
        header: "Quick Actions",
      },
    ],
    [favorites],
  );

  if (isLoading) return <LoadingState label="Loading projects" />;

  if (error) {
    return (
      <EmptyState
        action={
          <Button onClick={load} variant="solid">
            Retry
          </Button>
        }
        description="Projects could not be loaded. Please try again later."
        title="Projects are unavailable"
      />
    );
  }

  const activeCount = items.filter((i) => i.status.toLowerCase() !== "archived").length;
  const favoritesCount = items.filter((i) => favorites.includes(i.id)).length;
  const archivedCount = items.filter((i) => i.status.toLowerCase() === "archived").length;

  return (
    <Box>
      {/* 1. Submenu Tabs & Toolbar */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{
          alignItems: { md: "center" },
          borderBottom: "1px solid var(--mui-palette-divider)",
          justifyContent: "space-between",
          mb: 3,
          pb: 1,
        }}
      >
        <Tabs
          aria-label="Project view filters"
          onChange={(_, val) => setViewFilter(val)}
          sx={{ minHeight: "auto" }}
          value={viewParam}
        >
          <Tab label={`Active (${activeCount})`} value="active" />
          <Tab label="My projects" value="mine" />
          <Tab label={`Favorites (${favoritesCount})`} value="favorites" />
          <Tab label={`Archived (${archivedCount})`} value="archived" />
        </Tabs>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          {/* View Mode Toggle */}
          <Stack
            direction="row"
            sx={{
              bgcolor: "action.hover",
              borderRadius: 1.5,
              border: "1px solid var(--mui-palette-divider)",
              p: 0.5,
            }}
          >
            <IconButton
              aria-label="Table view"
              onClick={() => setViewMode("table")}
              size="small"
              sx={{
                bgcolor: viewMode === "table" ? "background.paper" : "transparent",
                boxShadow: viewMode === "table" ? 1 : 0,
              }}
            >
              <List aria-hidden="true" className="h-4 w-4" />
            </IconButton>
            <IconButton
              aria-label="Grid card view"
              onClick={() => setViewMode("cards")}
              size="small"
              sx={{
                bgcolor: viewMode === "cards" ? "background.paper" : "transparent",
                boxShadow: viewMode === "cards" ? 1 : 0,
              }}
            >
              <LayoutGrid aria-hidden="true" className="h-4 w-4" />
            </IconButton>
          </Stack>

          {/* Create Project Button */}
          <Button
            onClick={() => setIsCreateOpen(true)}
            startIcon={<Plus aria-hidden="true" className="h-4 w-4" />}
            variant="solid"
          >
            Create project
          </Button>
        </Stack>
      </Stack>

      {/* 2. Status Quick Filters */}
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: "center", flexWrap: "wrap", mb: 3 }}
      >
        <Typography color="text.secondary" sx={{ fontSize: "0.8125rem", fontWeight: 600, mr: 1 }} variant="caption">
          Status filter:
        </Typography>
        {[
          { label: "All Statuses", value: "" },
          { label: "On track", value: "on-track" },
          { label: "At risk", value: "at-risk" },
          { label: "Off track", value: "off-track" },
        ].map((statusChoice) => {
          const isSelected = statusParam === statusChoice.value;
          return (
            <Button
              key={statusChoice.value}
              onClick={() => setStatusFilter(statusChoice.value)}
              size="small"
              sx={{ borderRadius: 4, px: 1.75 }}
              variant={isSelected ? "solid" : "outline"}
            >
              {statusChoice.label}
            </Button>
          );
        })}
      </Stack>

      {/* 3. Projects List (Table or Grid Cards) */}
      {filteredItems.length === 0 ? (
        <EmptyState
          action={
            <Button onClick={() => setIsCreateOpen(true)} variant="solid">
              Create project
            </Button>
          }
          description={
            statusParam || viewParam !== "active"
              ? "No projects found matching the selected view or status filter."
              : "You do not have any projects yet. Create your first project to start planning, assigning work, and tracking progress."
          }
          title={statusParam || viewParam !== "active" ? "No matching projects" : "No projects yet"}
        />
      ) : viewMode === "table" ? (
        <DataTable
          columns={columns}
          data={filteredItems}
          globalFilterPlaceholder="Filter projects by name or code..."
          initialPageSize={data?.pageSize || 10}
        />
      ) : (
        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },
          }}
        >
          {filteredItems.map((project) => {
            const isFav = favorites.includes(project.id);
            return (
              <Card
                className="transition-all hover:border-[var(--mui-palette-primary-main)] hover:shadow-md"
                key={project.id}
                sx={{
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
                variant="outlined"
              >
                <CardHeader
                  action={
                    <IconButton
                      aria-label={isFav ? "Remove favorite" : "Mark as favorite"}
                      onClick={(e) => toggleFavorite(project.id, e)}
                      size="small"
                    >
                      <Star
                        aria-hidden="true"
                        className={`h-4 w-4 ${isFav ? "fill-amber-400 text-amber-500" : "text-[var(--mui-palette-text-secondary)]"}`}
                      />
                    </IconButton>
                  }
                  avatar={
                    <Box
                      sx={{
                        alignItems: "center",
                        bgcolor: "action.selected",
                        borderRadius: 1.5,
                        display: "flex",
                        height: 40,
                        justifyContent: "center",
                        width: 40,
                      }}
                    >
                      <FolderKanban aria-hidden="true" className="h-5 w-5 text-[var(--mui-palette-primary-main)]" />
                    </Box>
                  }
                  subheader={
                    project.code ? (
                      <Typography color="text.secondary" sx={{ fontSize: "0.75rem", fontWeight: 600 }} variant="caption">
                        {project.code}
                      </Typography>
                    ) : null
                  }
                  title={
                    <Link
                      href={`/projects/${project.id}`}
                      style={{
                        color: "inherit",
                        fontWeight: 700,
                        fontSize: "1rem",
                        textDecoration: "none",
                      }}
                    >
                      {project.name}
                    </Link>
                  }
                />
                <CardContent sx={{ pt: 0 }}>
                  <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                    <StatusChip
                      label={project.status || "Active"}
                      size="small"
                      tone={mapStatusTone(project.status || "active")}
                    />
                    <Typography color="text.secondary" sx={{ fontSize: "0.75rem" }} variant="caption">
                      Updated {new Date(project.updatedAt).toLocaleDateString()}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} sx={{ pt: 1, borderTop: "1px solid var(--mui-palette-divider)" }}>
                    <Button
                      component={Link}
                      fullWidth
                      href={`/projects/${project.id}`}
                      size="small"
                      variant="outline"
                    >
                      Overview
                    </Button>
                    <Button
                      component={Link}
                      fullWidth
                      href={`/projects/${project.id}/work-items`}
                      size="small"
                      variant="solid"
                    >
                      Work items
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Create Project Modal */}
      {isCreateOpen ? (
        <Modal
          actions={
            <>
              <Button disabled={isCreating} onClick={() => setIsCreateOpen(false)} variant="ghost">
                Cancel
              </Button>
              <Button
                disabled={isCreating}
                form="create-project-list"
                type="submit"
                variant="solid"
              >
                {isCreating ? "Creating..." : "Create project"}
              </Button>
            </>
          }
          closeDisabled={isCreating}
          onClose={() => setIsCreateOpen(false)}
          open
          title="Create project"
        >
          <Stack
            component="form"
            id="create-project-list"
            noValidate
            onSubmit={handleSubmit(handleCreateProject)}
            spacing={3}
          >
            <InputField
              autoFocus
              control={control}
              label="Project name"
              name="name"
              rules={{
                validate: (value) => value.trim().length > 0 || "Please enter a project name.",
              }}
            />
            <InputField disabled label="Project code" name="code" value={projectCode} />
            <InputField
              control={control}
              label="Description"
              minRows={3}
              multiline
              name="description"
            />
          </Stack>
        </Modal>
      ) : null}
    </Box>
  );
}
