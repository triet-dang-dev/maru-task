"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { EmptyState } from "@/components/common/EmptyState";
import { DataTable } from "@/components/ui/DataTable";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { LoadingState } from "@/components/ui/LoadingState";

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
  const [data, setData] = useState<ProjectsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) return <LoadingState label="Loading projects" />;

  if (error) {
    return (
      <InlineAlert title="Unable to load projects" tone="error">
        {error}
      </InlineAlert>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <EmptyState
        description="No projects are available for your current account."
        title="No projects found"
      />
    );
  }

  return (
    <DataTable
      columns={columns}
      data={data.items}
      globalFilterPlaceholder="Filter projects"
      initialPageSize={data.pageSize}
    />
  );
}
