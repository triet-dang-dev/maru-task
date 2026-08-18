"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { EmptyState } from "@/components/common/EmptyState";
import { DataTable } from "@/components/ui/DataTable";
import { LoadingState } from "@/components/ui/LoadingState";
import { useToast } from "@/components/ui/Toast";

import { getProjects } from "../service";
import type { ProjectListItem, ProjectsResponse } from "../types";

const columns: Array<ColumnDef<ProjectListItem>> = [
  {
    accessorKey: "code",
    header: "Code",
  },
  {
    accessorKey: "name",
    cell: ({ row }) => (
      <Link
        className="font-medium text-blue-700 underline-offset-4 hover:underline"
        href={`/projects/${row.original.id}`}
      >
        {row.original.name || "Untitled project"}
      </Link>
    ),
    header: "Project",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "updatedAt",
    cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
    header: "Updated",
  },
];

export function ProjectsPageContent() {
  const searchParams = useSearchParams();
  const { error: toastError } = useToast();
  const [data, setData] = useState<ProjectsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const statusFilter = searchParams.get("status")?.toLowerCase();
  const viewFilter = searchParams.get("view")?.toLowerCase();

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

  const items = data?.items;
  const filteredItems = useMemo(() => {
    if (!items) return [];
    return items.filter((item) => {
      if (statusFilter && !item.status.toLowerCase().includes(statusFilter.replace(/-/g, " "))) {
        return false;
      }
      if (viewFilter === "archived" && item.status.toLowerCase() !== "archived") {
        return false;
      }
      return true;
    });
  }, [items, statusFilter, viewFilter]);

  if (isLoading) return <LoadingState label="Loading projects" />;

  if (!data || filteredItems.length === 0) {
    return (
      <EmptyState
        description={
          error
            ? "Projects could not be loaded. Please try again later."
            : statusFilter || viewFilter
              ? `No projects found matching the selected filter.`
              : "No projects are available for your current account."
        }
        title={error ? "Projects are unavailable" : "No projects found"}
      />
    );
  }

  return (
    <DataTable
      columns={columns}
      data={filteredItems}
      globalFilterPlaceholder="Filter projects"
      initialPageSize={data.pageSize}
    />
  );
}
