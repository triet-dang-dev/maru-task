"use client";

import { useEffect, useState, type KeyboardEvent, type PointerEvent } from "react";
import { useForm } from "react-hook-form";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Link from "next/link";

import { createColumnHelper } from "@tanstack/react-table";

import { EmptyState } from "@/components/common/EmptyState";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/DropdownMenu";
import { InputField } from "@/components/ui/InputField";
import { SelectBox } from "@/components/ui/SelectBox";
import {
  SectionCard,
  SectionCardContent,
  SectionCardDescription,
  SectionCardHeader,
  SectionCardTitle,
} from "@/components/ui/SectionCard";
import { useToast } from "@/components/ui/Toast";
import {
  ExternalLink,
  Filter,
  LayoutGrid,
  Plus,
  Settings2,
  Table as TableIcon,
  X,
} from "lucide-react";

import { WorkItemCardView } from "./WorkItemCardView";
import { WorkItemContextMenu } from "./WorkItemContextMenu";
import { WorkItemCopyModal } from "./WorkItemCopyModal";
import { WorkItemFilterBar, type FilterCriteria } from "./WorkItemFilterBar";
import { WorkItemReminderModal } from "./WorkItemReminderModal";
import { WorkItemShareModal } from "./WorkItemShareModal";
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

function getColumns(
  onSelectWorkItem: (workItem: WorkItemListItem) => void,
  onShareWorkItem?: (workItem: WorkItemListItem) => void,
  onReminderWorkItem?: (workItem: WorkItemListItem) => void,
  onCopyWorkItem?: (workItem: WorkItemListItem) => void,
) {
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
      header: "Updated at",
    }),
    columnHelper.display({
      id: "actions",
      cell: (info) => (
        <WorkItemContextMenu
          onCopy={() => onCopyWorkItem?.(info.row.original)}
          onOpenDetails={() => onSelectWorkItem(info.row.original)}
          onReminder={() => onReminderWorkItem?.(info.row.original)}
          onShare={() => onShareWorkItem?.(info.row.original)}
          workItemId={info.row.original.id}
        />
      ),
      header: "",
    }),
  ];
}

export function WorkItemsPanelClient({ data, onRefresh, projectId }: WorkItemsPanelClientProps) {
  const { error: toastError } = useToast();
  const [selectedWorkItem, setSelectedWorkItem] = useState<WorkItemListItem | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "table">("table");
  const [showInlineAdd, setShowInlineAdd] = useState(false);
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<FilterCriteria[]>([]);
  const [inlineTitle, setInlineTitle] = useState("");
  const [inlineStatus, setInlineStatus] = useState("Open");
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareModalItem, setShareModalItem] = useState<WorkItemListItem | null>(null);
  const [reminderModalItem, setReminderModalItem] = useState<WorkItemListItem | null>(null);
  const [copyModalItem, setCopyModalItem] = useState<WorkItemListItem | null>(null);
  const [detailWidth, setDetailWidth] = useState(getStoredDetailWidth);
  const { control, handleSubmit, reset } = useForm<CreateWorkItemFormValues>({
    defaultValues: { title: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const columns = getColumns(
    setSelectedWorkItem,
    (item) => setShareModalItem(item),
    (item) => setReminderModalItem(item),
    (item) => setCopyModalItem(item),
  );
  const [visibleColumnIds, setVisibleColumnIds] = useState(columns.map((column) => column.id));
  const statusOptions = [
    { label: "All statuses", value: "" },
    ...Array.from(new Set(data.items.map((item) => item.status))).map((status) => ({
      label: status,
      value: status,
    })),
  ];

  useEffect(() => {
    if (error) toastError(error);
  }, [error, toastError]);

  const visibleItems = data.items.filter((item) => {
    if (statusFilter && item.status !== statusFilter) {
      return false;
    }

    for (const filter of advancedFilters) {
      if (!filter.value) continue;
      if (filter.field === "status") {
        if (filter.operator === "is" && item.status !== filter.value) return false;
        if (filter.operator === "is_not" && item.status === filter.value) return false;
      } else if (filter.field === "subject") {
        if (!item.subject.toLowerCase().includes(filter.value.toLowerCase())) return false;
      } else if (filter.field === "priority") {
        const itemPriority = (item as unknown as { priority?: string }).priority || "Normal";
        if (filter.operator === "is" && itemPriority !== filter.value) return false;
        if (filter.operator === "is_not" && itemPriority === filter.value) return false;
      } else if (filter.field === "assignee") {
        const itemAssignee = (item as unknown as { assignee?: string }).assignee || "Riley Park";
        if (filter.operator === "is" && itemAssignee !== filter.value) return false;
        if (filter.operator === "is_not" && itemAssignee === filter.value) return false;
      }
    }
    return true;
  });

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

  const handleInlineCreate = async () => {
    if (!inlineTitle.trim()) {
      setInlineError("Please enter a title.");
      return;
    }
    setIsCreating(true);
    setInlineError(null);
    try {
      await createWorkItem({ projectId, title: inlineTitle.trim() });
      setInlineTitle("");
      setShowInlineAdd(false);
      await onRefresh();
    } catch (err) {
      setInlineError(err instanceof Error ? err.message : "Unable to create work item.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <SectionCard>
      <SectionCardHeader>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ alignItems: { sm: "center" }, justifyContent: "space-between", width: "100%" }}
        >
          <div>
            <SectionCardTitle>Work items</SectionCardTitle>
            <SectionCardDescription>
              Browse and create work items in project {projectId}.
            </SectionCardDescription>
          </div>

          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Button
              aria-label="Toggle filters"
              onClick={() => setShowFilterBar((prev) => !prev)}
              size="small"
              startIcon={<Filter aria-hidden="true" size={16} />}
              variant={showFilterBar || advancedFilters.length > 0 ? "solid" : "outline"}
            >
              Filters{advancedFilters.length > 0 ? ` (${advancedFilters.length})` : ""}
            </Button>

            <ToggleButtonGroup
              aria-label="View mode"
              exclusive
              onChange={(_, nextView) => {
                if (nextView) setViewMode(nextView);
              }}
              size="small"
              value={viewMode}
            >
              <ToggleButton aria-label="Table view" value="table">
                <TableIcon size={16} />
              </ToggleButton>
              <ToggleButton aria-label="Card view" value="card">
                <LayoutGrid size={16} />
              </ToggleButton>
            </ToggleButtonGroup>

            <DropdownMenu
              trigger={
                <Button
                  aria-label="Configure columns"
                  size="small"
                  startIcon={<Settings2 aria-hidden="true" size={16} />}
                  variant="outline"
                >
                  Columns
                </Button>
              }
            >
              {columns
                .filter(
                  (column): column is typeof column & { id: string } =>
                    Boolean(column.id) && column.id !== "actions",
                )
                .map((column) => {
                  const isVisible = visibleColumnIds.includes(column.id);
                  const headerLabel = typeof column.header === "string" ? column.header : column.id;
                  return (
                    <DropdownMenuItem
                      aria-checked={isVisible}
                      key={column.id}
                      onSelect={() => toggleColumn(column.id)}
                      role="menuitemcheckbox"
                    >
                      <span className="flex items-center gap-2">
                        <input
                          checked={isVisible}
                          className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          onChange={() => toggleColumn(column.id)}
                          tabIndex={-1}
                          type="checkbox"
                        />
                        <span>{headerLabel}</span>
                      </span>
                    </DropdownMenuItem>
                  );
                })}
            </DropdownMenu>
          </Stack>
        </Stack>
      </SectionCardHeader>

      <SectionCardContent className="flex flex-col gap-6">
        <form
          aria-label="Create work item"
          className="flex gap-2 md:flex-row md:items-start"
          noValidate
          onSubmit={handleSubmit(handleCreate)}
        >
          <div className="flex-1">
            <InputField
              control={control}
              disabled={isCreating}
              id="work-item-title"
              label="New work item"
              name="title"
              placeholder="e.g., Implement OpenProject-aligned navigation"
              rules={{
                required: "Please enter a work item title.",
                validate: (value) => value.trim().length > 0 || "Please enter a work item title.",
              }}
            />
          </div>

          <Button
            className="self-stretch"
            disabled={isCreating}
            id="create-work-item-button"
            isLoading={isCreating}
            type="submit"
          >
            Create
          </Button>
        </form>

        {/* OpenProject Advanced Query Filter Bar */}
        {showFilterBar ? (
          <WorkItemFilterBar
            filters={advancedFilters}
            onFiltersChange={setAdvancedFilters}
            statusOptions={statusOptions.filter((s) => Boolean(s.value)).map((s) => s.value)}
          />
        ) : null}

        <div className="flex flex-col gap-3 rounded-md border border-[var(--mui-palette-divider)] bg-[var(--mui-palette-action-hover)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-[var(--mui-palette-text-secondary)]">
            OpenProject Work Package Table
          </p>
          <div className="w-full sm:w-64">
            <SelectBox
              aria-label="Filter by status"
              id="work-item-status-filter"
              label="Status"
              name="status-filter"
              onChange={(event) => setStatusFilter(event.target.value)}
              options={statusOptions}
              value={statusFilter}
            />
          </div>
        </div>

        {visibleItems.length === 0 ? (
          <EmptyState
            description={
              statusFilter || advancedFilters.length > 0
                ? "No work items found matching the selected filters. Try adjusting your filters."
                : "Create a work item to begin tracking project tasks."
            }
            title={
              statusFilter || advancedFilters.length > 0
                ? "No matching work items"
                : "No work items yet"
            }
          />
        ) : (
          <div
            className="flex flex-col overflow-hidden rounded-md border border-[var(--mui-palette-divider)] lg:flex-row"
            data-testid="work-items-split-view"
          >
            <Box
              className="min-w-0 flex-1 overflow-x-auto p-4"
              sx={{
                flexBasis: selectedWorkItem ? `calc(100% - ${detailWidth}px)` : "100%",
                transition: "flex-basis 120ms ease-out",
              }}
            >
              {viewMode === "table" ? (
                <>
                  <DataTable
                    columns={visibleColumns}
                    data={visibleItems}
                    globalFilterPlaceholder="Filter work items"
                  />

                  {/* OpenProject wp-inline-create row at bottom of table */}
                  <Box
                    className="op-wp-inline-create"
                    data-test-selector="op-wp-inline-create"
                    sx={{
                      borderTop: "1px dashed",
                      borderColor: "divider",
                      mt: 1,
                      pt: 1.5,
                    }}
                  >
                    {showInlineAdd ? (
                      <Box
                        sx={{
                          bgcolor: "background.paper",
                          border: "1px solid",
                          borderColor: "primary.main",
                          borderRadius: 1,
                          p: 2,
                        }}
                      >
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                          <InputField
                            autoFocus
                            disabled={isCreating}
                            id="inline-work-item-title"
                            label="Inline work package title"
                            name="inline-title"
                            onChange={(e) => setInlineTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                void handleInlineCreate();
                              }
                            }}
                            placeholder="Work package subject..."
                            slotProps={{ htmlInput: { "aria-label": "Inline work package title" } }}
                            value={inlineTitle}
                          />
                          <SelectBox
                            disabled={isCreating}
                            id="inline-work-item-status"
                            label="Status"
                            name="inline-status"
                            onChange={(e) => setInlineStatus(e.target.value)}
                            options={statusOptions.filter((s) => Boolean(s.value))}
                            value={inlineStatus}
                          />
                        </Stack>
                        {inlineError ? (
                          <p className="text-xs text-red-600 mt-1">{inlineError}</p>
                        ) : null}
                        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                          <Button
                            disabled={isCreating}
                            isLoading={isCreating}
                            onClick={handleInlineCreate}
                            size="small"
                          >
                            Save
                          </Button>
                          <Button
                            disabled={isCreating}
                            onClick={() => {
                              setShowInlineAdd(false);
                              setInlineError(null);
                            }}
                            size="small"
                            variant="ghost"
                          >
                            Cancel
                          </Button>
                        </Stack>
                      </Box>
                    ) : (
                      <Button
                        aria-label="Create new work package"
                        onClick={() => setShowInlineAdd(true)}
                        size="small"
                        startIcon={<Plus aria-hidden="true" size={14} />}
                        variant="ghost"
                      >
                        Create new work package
                      </Button>
                    )}
                  </Box>
                </>
              ) : (
                <WorkItemCardView
                  items={visibleItems}
                  onCopyWorkItem={(item) => setCopyModalItem(item)}
                  onReminderWorkItem={(item) => setReminderModalItem(item)}
                  onSelectWorkItem={setSelectedWorkItem}
                  onShareWorkItem={(item) => setShareModalItem(item)}
                  projectId={projectId}
                />
              )}
            </Box>

            {selectedWorkItem ? (
              <>
                <div
                  aria-controls="work-item-detail-pane"
                  aria-label="Resize work package details"
                  aria-orientation="vertical"
                  aria-valuenow={detailWidth}
                  className="hidden w-2 cursor-col-resize items-center justify-center bg-slate-100 hover:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 lg:flex"
                  onKeyDown={resizeWithKeyboard}
                  onPointerDown={startResizing}
                  role="separator"
                  tabIndex={0}
                >
                  <span className="h-8 w-0.5 rounded-full bg-slate-400" />
                </div>

                <div
                  aria-label="Work package details"
                  className="min-w-0 border-t border-slate-200 p-4 lg:border-t-0 lg:border-l"
                  id="work-item-detail-pane"
                  role="region"
                  style={{ flexBasis: `${detailWidth}px` }}
                >
                  <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Work package details
                      </p>
                      <h3 className="truncate font-semibold text-slate-900">
                        #{selectedWorkItem.id} {selectedWorkItem.subject}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        aria-label="Open full work package"
                        className="inline-flex items-center gap-1.5 rounded-md border border-[var(--mui-palette-divider)] px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        href={`/projects/${projectId}/work-items/${selectedWorkItem.id}`}
                      >
                        <ExternalLink aria-hidden="true" className="size-3.5" />
                        <span>Full view</span>
                      </Link>
                      <Button
                        aria-label="Close work package details"
                        onClick={() => setSelectedWorkItem(null)}
                        size="small"
                        variant="ghost"
                      >
                        <X aria-hidden="true" className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Subject</dt>
                      <dd className="font-medium text-slate-900">{selectedWorkItem.subject}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Status</dt>
                      <dd className="font-medium text-slate-900">{selectedWorkItem.status}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Updated</dt>
                      <dd className="text-slate-700">
                        {formatUpdatedAt(selectedWorkItem.updatedAt)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </>
            ) : null}
          </div>
        )}
      </SectionCardContent>

      {/* Wave 7 OpenProject Work Package Action Modals */}
      {shareModalItem ? (
        <WorkItemShareModal
          onClose={() => setShareModalItem(null)}
          open={Boolean(shareModalItem)}
          projectId={projectId}
          workItemId={shareModalItem.id}
          workItemSubject={shareModalItem.subject}
        />
      ) : null}

      {reminderModalItem ? (
        <WorkItemReminderModal
          onClose={() => setReminderModalItem(null)}
          open={Boolean(reminderModalItem)}
          workItemId={reminderModalItem.id}
          workItemSubject={reminderModalItem.subject}
        />
      ) : null}

      {copyModalItem ? (
        <WorkItemCopyModal
          onClose={() => setCopyModalItem(null)}
          open={Boolean(copyModalItem)}
          projectId={projectId}
          workItemId={copyModalItem.id}
          workItemSubject={copyModalItem.subject}
        />
      ) : null}
    </SectionCard>
  );
}
