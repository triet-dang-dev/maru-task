"use client";

import { useState, type KeyboardEvent, type PointerEvent } from "react";
import { useForm } from "react-hook-form";

import Link from "next/link";

import { createColumnHelper } from "@tanstack/react-table";

import { EmptyState } from "@/components/common/EmptyState";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/DropdownMenu";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { InputField } from "@/components/ui/InputField";
import { SelectBox } from "@/components/ui/SelectBox";
import {
  SectionCard,
  SectionCardContent,
  SectionCardDescription,
  SectionCardHeader,
  SectionCardTitle,
} from "@/components/ui/SectionCard";
import { ExternalLink, Settings2, X } from "lucide-react";

import { createWorkItem } from "../service";
import type { WorkItemListItem, WorkItemsViewModel } from "../types";

interface WorkItemsPanelClientProps {
  data: WorkItemsViewModel;
  onRefresh: () => Promise<void>;
  projectId: string;
}

type CreateWorkItemFormValues = {
  title: string;
};

const columnHelper = createColumnHelper<WorkItemListItem>();
const splitViewStorageKey = "openProject-splitViewFlexBasis";
const minimumDetailWidth = 430;

function formatUpdatedAt(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function getStoredDetailWidth() {
  if (typeof window === "undefined") {
    return minimumDetailWidth;
  }

  const storedWidth = Number.parseInt(window.localStorage.getItem(splitViewStorageKey) ?? "", 10);
  return Number.isNaN(storedWidth) ? minimumDetailWidth : Math.max(minimumDetailWidth, storedWidth);
}

function getColumns(onSelectWorkItem: (workItem: WorkItemListItem) => void) {
  return [
    columnHelper.accessor("id", {
      id: "id",
      cell: (info) => `#${info.getValue()}`,
      header: "ID",
    }),
    columnHelper.accessor("subject", {
      id: "subject",
      cell: (info) => (
        <button
          aria-label={`Open ${info.getValue()}`}
          className="font-medium text-blue-700 underline-offset-4 hover:underline"
          onClick={() => onSelectWorkItem(info.row.original)}
          type="button"
        >
          {info.getValue()}
        </button>
      ),
      header: "Subject",
    }),
    columnHelper.accessor("status", {
      id: "status",
      cell: (info) => info.getValue(),
      header: "Status",
    }),
    columnHelper.accessor("updatedAt", {
      id: "updatedAt",
      cell: (info) => formatUpdatedAt(info.getValue()),
      header: "Updated",
    }),
  ];
}

export function WorkItemsPanelClient({ data, onRefresh, projectId }: WorkItemsPanelClientProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedWorkItem, setSelectedWorkItem] = useState<WorkItemListItem | null>(null);
  const [detailWidth, setDetailWidth] = useState(getStoredDetailWidth);
  const { control, handleSubmit, reset } = useForm<CreateWorkItemFormValues>({
    defaultValues: { title: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const columns = getColumns(setSelectedWorkItem);
  const [visibleColumnIds, setVisibleColumnIds] = useState(columns.map((column) => column.id));
  const statusOptions = [
    { label: "All statuses", value: "" },
    ...Array.from(new Set(data.items.map((item) => item.status))).map((status) => ({
      label: status,
      value: status,
    })),
  ];
  const visibleItems = statusFilter
    ? data.items.filter((item) => item.status === statusFilter)
    : data.items;
  const visibleColumns = columns.filter((column) => visibleColumnIds.includes(column.id));

  const toggleColumn = (columnId: string) => {
    setVisibleColumnIds((current) =>
      current.includes(columnId) ? current.filter((id) => id !== columnId) : [...current, columnId],
    );
  };

  const updateDetailWidth = (width: number) => {
    const nextWidth = Math.max(minimumDetailWidth, width);
    setDetailWidth(nextWidth);
    window.localStorage.setItem(splitViewStorageKey, String(nextWidth));
  };

  const startResizing = (event: PointerEvent<HTMLDivElement>) => {
    const initialX = event.clientX;
    const initialWidth = detailWidth;

    const resize = (moveEvent: globalThis.PointerEvent) => {
      updateDetailWidth(initialWidth + initialX - moveEvent.clientX);
    };
    const stopResizing = () => {
      window.removeEventListener("pointermove", resize);
      window.removeEventListener("pointerup", stopResizing);
    };

    event.preventDefault();
    window.addEventListener("pointermove", resize);
    window.addEventListener("pointerup", stopResizing);
  };

  const resizeWithKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
      return;
    }

    event.preventDefault();
    updateDetailWidth(detailWidth + (event.key === "ArrowLeft" ? 16 : -16));
  };

  const handleCreate = async ({ title }: CreateWorkItemFormValues) => {
    setIsCreating(true);
    setError(null);
    try {
      await createWorkItem({ projectId, title: title.trim() });
      reset();
      await onRefresh();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to create work item.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <SectionCard>
      <SectionCardHeader>
        <div>
          <SectionCardTitle>Work items</SectionCardTitle>
          <SectionCardDescription>
            Browse and create work items in project {projectId}.
          </SectionCardDescription>
        </div>
      </SectionCardHeader>
      <SectionCardContent>
        <form
          noValidate
          onSubmit={handleSubmit(handleCreate)}
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 16,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <InputField
            control={control}
            label="New work item"
            name="title"
            placeholder="Enter title"
            rules={{
              validate: (value) => value.trim().length > 0 || "Please enter a work item title.",
            }}
          />
          <Button disabled={isCreating} type="submit">
            {isCreating ? "Creating..." : "Create"}
          </Button>
        </form>
        {error ? (
          <div style={{ marginBottom: 16 }}>
            <InlineAlert title="Unable to create work item" tone="error">
              {error}
            </InlineAlert>
          </div>
        ) : null}
        <div style={{ marginBottom: 16, maxWidth: 240 }}>
          <SelectBox
            label="Status"
            name="statusFilter"
            onChange={(event) => setStatusFilter(event.target.value)}
            options={statusOptions}
            size="small"
            value={statusFilter}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <DropdownMenu
            trigger={
              <Button
                startIcon={<Settings2 aria-hidden="true" size={16} />}
                type="button"
                variant="outline"
              >
                Configure columns
              </Button>
            }
          >
            {columns.map((column) => {
              const columnId = column.id;

              if (!columnId) {
                return null;
              }

              const label = typeof column.header === "string" ? column.header : columnId;
              const isVisible = visibleColumnIds.includes(columnId);

              return (
                <DropdownMenuItem
                  aria-checked={isVisible}
                  key={columnId}
                  onSelect={() => toggleColumn(columnId)}
                  role="menuitemcheckbox"
                >
                  {label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenu>
        </div>
        {!data.hasItems ? (
          <EmptyState
            description="There are no visible work items in this project yet."
            title="No work items"
          />
        ) : (
          <div
            className={
              selectedWorkItem
                ? "grid gap-0 lg:grid-cols-[minmax(0,1fr)_var(--split-view-detail-width)]"
                : undefined
            }
            style={
              selectedWorkItem
                ? ({ "--split-view-detail-width": `${detailWidth}px` } as React.CSSProperties)
                : undefined
            }
          >
            <DataTable
              columns={visibleColumns}
              data={visibleItems}
              emptyMessage="No work items found for this project."
              globalFilterPlaceholder="Filter work items"
              initialPageSize={5}
              pageSizeOptions={[5, 10, 25]}
            />
            {selectedWorkItem ? (
              <section
                aria-label="Work package details"
                className="relative flex min-h-80 flex-col border-t-2 border-[var(--mui-palette-divider)] bg-[var(--mui-palette-background-paper)] lg:border-l-2 lg:border-t-0"
              >
                <div
                  aria-label="Resize work package details"
                  aria-orientation="vertical"
                  aria-valuemin={minimumDetailWidth}
                  aria-valuenow={detailWidth}
                  className="absolute -left-1.5 top-0 z-10 hidden h-full w-3 cursor-col-resize touch-none lg:block"
                  onKeyDown={resizeWithKeyboard}
                  onPointerDown={startResizing}
                  role="separator"
                  tabIndex={0}
                />
                <div className="flex items-start justify-between gap-3 border-b border-[var(--mui-palette-divider)] px-5 py-4">
                  <div className="min-w-0">
                    <p className="text-sm text-[var(--mui-palette-text-secondary)]">
                      #{selectedWorkItem.id} | {selectedWorkItem.status}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold">{selectedWorkItem.subject}</h2>
                  </div>
                  <Button
                    aria-label="Close work package details"
                    onClick={() => setSelectedWorkItem(null)}
                    size="small"
                    startIcon={<X aria-hidden="true" size={16} />}
                    type="button"
                    variant="text"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <p className="text-sm text-[var(--mui-palette-text-secondary)]">
                    Updated {formatUpdatedAt(selectedWorkItem.updatedAt)}
                  </p>
                  <div className="mt-auto">
                    <Link
                      className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 underline-offset-4 hover:underline"
                      href={`/projects/${projectId}/work-items/${selectedWorkItem.id}`}
                    >
                      Open full work package
                      <ExternalLink aria-hidden="true" size={15} />
                    </Link>
                  </div>
                </div>
              </section>
            ) : null}
          </div>
        )}
      </SectionCardContent>
    </SectionCard>
  );
}
