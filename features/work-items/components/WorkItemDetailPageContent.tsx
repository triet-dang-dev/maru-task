"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { useRouter } from "next/navigation";
import Link from "next/link";

import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { InputField } from "@/components/ui/InputField";
import { LoadingState } from "@/components/ui/LoadingState";
import {
  SectionCard,
  SectionCardContent,
  SectionCardDescription,
  SectionCardHeader,
  SectionCardTitle,
} from "@/components/ui/SectionCard";
import { SelectBox, type SelectBoxOption } from "@/components/ui/SelectBox";

import {
  WorkItemActivityTimeline,
  type WorkItemActivityEvent,
} from "./WorkItemActivityTimeline";
import {
  WorkItemRelationsList,
  type WorkItemRelationListItem,
} from "./WorkItemRelationsList";
import {
  WorkItemAttachmentsList,
  type WorkItemAttachmentListItem,
} from "./WorkItemAttachmentsList";
import {
  WorkItemWatchersList,
  type WorkItemWatcherListItem,
} from "./WorkItemWatchersList";
import { WorkItemTimeCostPanel } from "./WorkItemTimeCostPanel";

import {
  createWorkItemAttachment,
  createWorkItemComment,
  createWorkItemRelation,
  createWorkItemWatcher,
  deleteWorkItem,
  getPriorities,
  getUsers,
  getWorkItem,
  updateWorkItem,
} from "../service";
import type { PriorityItem, UserItem, WorkItemDetail } from "../types";

const workPackageTabs = ["overview", "activity", "files", "relations", "watchers", "time-cost"] as const;
type WorkPackageTab = (typeof workPackageTabs)[number];

type WorkItemOverviewFormValues = {
  assigneeUserId: string;
  description: string;
  dueDate: string;
  priorityId: string;
  subject: string;
};

type CommentFormValues = { body: string };
type RelationFormValues = { relatedWorkItemId: string; relationType: string };
type WatcherFormValues = { watcherUserId: string };
type AttachmentFormValues = {
  contentType: string;
  fileName: string;
  sizeInBytes: string;
  storagePath: string;
};

const placeholderActivity: WorkItemActivityEvent[] = [
  {
    action: "updated the due date",
    actor: "Dana Chen",
    id: "activity-1",
    timestamp: "18 minutes ago",
  },
  {
    action: "commented",
    actor: "Morgan Tate",
    body: "The delivery checklist is ready for review.",
    id: "activity-2",
    timestamp: "Yesterday",
  },
  {
    action: "changed the status to In progress",
    actor: "Riley Park",
    id: "activity-3",
    timestamp: "Monday",
  },
];

const placeholderRelations: WorkItemRelationListItem[] = [
  {
    id: "relation-1",
    relationType: "blocks",
    workItemId: "102",
    workItemStatus: "Open",
    workItemSubject: "Publish the migration guide",
  },
  {
    id: "relation-2",
    relationType: "relates",
    workItemId: "103",
    workItemStatus: "In progress",
    workItemSubject: "Validate the integration contract",
  },
];

const placeholderAttachments: WorkItemAttachmentListItem[] = [
  {
    contentType: "application/pdf",
    fileName: "migration-plan.pdf",
    id: "attachment-1",
    size: "2 MB",
    uploadState: "Uploaded",
  },
];

const placeholderWatchers: WorkItemWatcherListItem[] = [
  {
    id: "watcher-1",
    name: "Dana Chen",
    subscribedAt: "Subscribed 18 minutes ago",
  },
];

const placeholderTimeEntries = [
  { date: "2026-08-13", hours: 2.5, id: "time-1", note: "Reviewed API contract" },
];

const placeholderCostEntries = [
  { amount: 125, date: "2026-08-14", id: "cost-1", note: "Research materials" },
];

interface WorkItemDetailPageContentProps {
  activeTab?: WorkPackageTab;
  projectId: string;
  workItemId: string;
}

export function WorkItemDetailPageContent({
  activeTab = "overview",
  projectId,
  workItemId,
}: WorkItemDetailPageContentProps) {
  const router = useRouter();
  const [detail, setDetail] = useState<WorkItemDetail | null>(null);
  const [initialPriorityId, setInitialPriorityId] = useState("");
  const [priorities, setPriorities] = useState<PriorityItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [isAddingRelation, setIsAddingRelation] = useState(false);
  const [relationSuccess, setRelationSuccess] = useState(false);
  const [isAddingWatcher, setIsAddingWatcher] = useState(false);
  const [watcherSuccess, setWatcherSuccess] = useState(false);
  const [isLinkingAttachment, setIsLinkingAttachment] = useState(false);
  const [attachmentSuccess, setAttachmentSuccess] = useState(false);
  const {
    control: overviewControl,
    handleSubmit: handleOverviewSubmit,
    reset: resetOverviewForm,
  } = useForm<WorkItemOverviewFormValues>({
    defaultValues: {
      assigneeUserId: "",
      description: "",
      dueDate: "",
      priorityId: "",
      subject: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const {
    control: commentControl,
    handleSubmit: handleCommentSubmit,
    reset: resetCommentForm,
  } = useForm<CommentFormValues>({ defaultValues: { body: "" }, mode: "onSubmit" });
  const {
    control: relationControl,
    handleSubmit: handleRelationSubmit,
    reset: resetRelationForm,
  } = useForm<RelationFormValues>({
    defaultValues: { relatedWorkItemId: "", relationType: "" },
    mode: "onSubmit",
  });
  const {
    control: watcherControl,
    handleSubmit: handleWatcherSubmit,
    reset: resetWatcherForm,
  } = useForm<WatcherFormValues>({ defaultValues: { watcherUserId: "" }, mode: "onSubmit" });
  const {
    control: attachmentControl,
    handleSubmit: handleAttachmentSubmit,
    reset: resetAttachmentForm,
  } = useForm<AttachmentFormValues>({
    defaultValues: { contentType: "", fileName: "", sizeInBytes: "", storagePath: "" },
    mode: "onSubmit",
  });

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [result, priorityList, userList] = await Promise.all([
        getWorkItem(workItemId),
        getPriorities(),
        getUsers(),
      ]);
      setDetail(result);
      setPriorities(priorityList);
      setUsers(userList);
      // Match the current priority name to an ID from the catalog.
      const matched = priorityList.find(
        (p) => p.name.toLowerCase() === result.priority.toLowerCase(),
      );
      const resolvedPriorityId = matched ? String(matched.id) : "";
      setInitialPriorityId(resolvedPriorityId);
      resetOverviewForm({
        assigneeUserId: result.assigneeUserId ?? "",
        description: result.description,
        dueDate: result.dueDate?.slice(0, 10) ?? "",
        priorityId: resolvedPriorityId,
        subject: result.subject,
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load work item.");
    } finally {
      setIsLoading(false);
    }
  }, [resetOverviewForm, workItemId]);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      await load();
      if (!isMounted) {
        return;
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [load]);

  const save = async ({
    assigneeUserId,
    description,
    dueDate,
    priorityId,
    subject,
  }: WorkItemOverviewFormValues) => {
    try {
      setIsSaving(true);
      setError(null);
      const input = {
        description: description.trim(),
        subject: subject.trim(),
        ...(priorityId.trim() && priorityId !== initialPriorityId
          ? { priorityId: priorityId.trim() }
          : {}),
        ...(assigneeUserId.trim() !== (detail?.assigneeUserId ?? "")
          ? { assigneeUserId: assigneeUserId.trim() }
          : {}),
        ...(dueDate !== (detail?.dueDate?.slice(0, 10) ?? "")
          ? { dueDate: dueDate ? `${dueDate}T00:00:00.000Z` : null }
          : {}),
      };
      await updateWorkItem(workItemId, input);
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to update work item.");
    } finally {
      setIsSaving(false);
    }
  };

  const remove = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      await deleteWorkItem(workItemId);
      router.replace(`/projects/${projectId}`);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete work item.");
      setIsDeleteOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const addComment = async ({ body }: CommentFormValues) => {
    try {
      setIsCommenting(true);
      setCommentSuccess(false);
      setError(null);
      await createWorkItemComment(workItemId, body.trim());
      resetCommentForm();
      setCommentSuccess(true);
    } catch (commentError) {
      setError(commentError instanceof Error ? commentError.message : "Unable to add comment.");
    } finally {
      setIsCommenting(false);
    }
  };

  const addRelation = async ({ relatedWorkItemId, relationType }: RelationFormValues) => {
    try {
      setIsAddingRelation(true);
      setRelationSuccess(false);
      setError(null);
      await createWorkItemRelation(workItemId, {
        relatedWorkItemId: relatedWorkItemId.trim(),
        relationType: relationType.trim(),
      });
      resetRelationForm();
      setRelationSuccess(true);
    } catch (relationError) {
      setError(relationError instanceof Error ? relationError.message : "Unable to add relation.");
    } finally {
      setIsAddingRelation(false);
    }
  };

  const addWatcher = async ({ watcherUserId }: WatcherFormValues) => {
    try {
      setIsAddingWatcher(true);
      setWatcherSuccess(false);
      setError(null);
      await createWorkItemWatcher(workItemId, watcherUserId.trim());
      resetWatcherForm();
      setWatcherSuccess(true);
    } catch (watcherError) {
      setError(watcherError instanceof Error ? watcherError.message : "Unable to add watcher.");
    } finally {
      setIsAddingWatcher(false);
    }
  };

  const linkAttachment = async ({
    contentType,
    fileName,
    sizeInBytes,
    storagePath,
  }: AttachmentFormValues) => {
    try {
      setIsLinkingAttachment(true);
      setAttachmentSuccess(false);
      setError(null);
      await createWorkItemAttachment(workItemId, {
        contentType: contentType.trim(),
        fileName: fileName.trim(),
        sizeInBytes: sizeInBytes.trim(),
        storagePath: storagePath.trim(),
      });
      resetAttachmentForm();
      setAttachmentSuccess(true);
    } catch (attachmentError) {
      setError(
        attachmentError instanceof Error ? attachmentError.message : "Unable to link attachment.",
      );
    } finally {
      setIsLinkingAttachment(false);
    }
  };

  if (isLoading) return <LoadingState label="Loading work item" />;
  if (error && !detail) {
    return (
      <InlineAlert title="Unable to load work item" tone="error">
        {error}
      </InlineAlert>
    );
  }
  if (!detail || detail.projectId !== projectId) {
    return (
      <EmptyState
        description="This work item is unavailable in the selected project."
        title="Work item not found"
      />
    );
  }

  return (
    <SectionCard>
      <SectionCardHeader
        action={
          <Button
            color="error"
            disabled={isSaving || isDeleting}
            onClick={() => setIsDeleteOpen(true)}
            type="button"
            variant="outline"
          >
            Delete work item
          </Button>
        }
      >
        <div>
          <SectionCardTitle>{detail.subject || "Untitled work item"}</SectionCardTitle>
          <SectionCardDescription>
            {detail.type || "Work item"} | {detail.status || "No status"} |{" "}
            {detail.priority || "No priority"}
          </SectionCardDescription>
        </div>
      </SectionCardHeader>
      <SectionCardContent>
        <nav
          aria-label="Work package tabs"
          className="border-b border-[var(--mui-palette-divider)]"
        >
          <div className="flex gap-1 overflow-x-auto" role="tablist">
            {workPackageTabs.map((tab) => {
              const isSelected = tab === activeTab;
              const label =
                tab === "files"
                  ? "Files"
                  : tab === "time-cost"
                    ? "Time & cost"
                    : `${tab.slice(0, 1).toUpperCase()}${tab.slice(1)}`;
              const href =
                tab === "overview"
                  ? `/projects/${projectId}/work-items/${workItemId}`
                  : `/projects/${projectId}/work-items/${workItemId}/${tab}`;

              return (
                <Link
                  aria-selected={isSelected}
                  className={
                    isSelected
                      ? "border-b-2 border-blue-700 px-3 py-3 text-sm font-semibold text-blue-700"
                      : "border-b-2 border-transparent px-3 py-3 text-sm text-[var(--mui-palette-text-secondary)] hover:text-[var(--mui-palette-text-primary)]"
                  }
                  href={href}
                  key={tab}
                  role="tab"
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
        {error ? (
          <div className="mb-4">
            <InlineAlert title="Unable to complete work-item action" tone="error">
              {error}
            </InlineAlert>
          </div>
        ) : null}
        <div
          aria-label={`${activeTab.slice(0, 1).toUpperCase()}${activeTab.slice(1)}`}
          className="grid gap-4 pt-6"
          role="tabpanel"
        >
          {activeTab === "overview" ? (
            <form className="grid gap-4" noValidate onSubmit={handleOverviewSubmit(save)}>
              <InputField
                control={overviewControl}
                label="Subject"
                name="subject"
                rules={{ validate: (value) => value.trim().length > 0 || "Subject is required." }}
              />
              <InputField
                control={overviewControl}
                label="Description"
                minRows={4}
                multiline
                name="description"
                rules={{
                  validate: (value) => value.trim().length > 0 || "Description is required.",
                }}
              />
              <SelectBox
                control={overviewControl}
                label="Priority"
                name="priorityId"
                options={[
                  { label: "— no priority —", value: "" },
                  ...priorities.map<SelectBoxOption>((p) => ({
                    label: p.name,
                    value: String(p.id),
                  })),
                ]}
              />
              <SelectBox
                control={overviewControl}
                label="Assignee"
                name="assigneeUserId"
                options={[
                  { label: "— unassigned —", value: "" },
                  ...users.map<SelectBoxOption>((u) => ({ label: u.name, value: u.id })),
                ]}
              />
              <InputField control={overviewControl} label="Due date" name="dueDate" type="date" />
              <div className="flex justify-end">
                <Button isLoading={isSaving} type="submit">
                  Save changes
                </Button>
              </div>
            </form>
          ) : null}
          {activeTab === "activity" ? (
            <div className="grid gap-6">
              <WorkItemActivityTimeline events={placeholderActivity} />
              <div className="border-t border-[var(--mui-palette-divider)] pt-6">
                <h3 className="text-base font-semibold">Add comment</h3>
              <form
                className="mt-4 grid gap-4"
                noValidate
                onSubmit={handleCommentSubmit(addComment)}
              >
                <InputField
                  control={commentControl}
                  label="Comment"
                  minRows={3}
                  multiline
                  name="body"
                  rules={{ validate: (value) => value.trim().length > 0 || "Comment is required." }}
                />
                {commentSuccess ? <p role="status">Comment added.</p> : null}
                <div className="flex justify-end">
                  <Button isLoading={isCommenting} type="submit">
                    Add comment
                  </Button>
                </div>
              </form>
              </div>
            </div>
          ) : null}
          {activeTab === "relations" ? (
            <div className="grid gap-6">
              <WorkItemRelationsList relations={placeholderRelations} />
              <div className="border-t border-[var(--mui-palette-divider)] pt-6">
                <h3 className="text-base font-semibold">Add relation</h3>
              <form
                className="mt-4 grid gap-4"
                noValidate
                onSubmit={handleRelationSubmit(addRelation)}
              >
                <InputField
                  control={relationControl}
                  label="Related work item ID"
                  name="relatedWorkItemId"
                  rules={{
                    validate: (value) =>
                      value.trim().length > 0 || "Related work item ID is required.",
                  }}
                />
                <InputField
                  control={relationControl}
                  label="Relation type"
                  name="relationType"
                  rules={{
                    validate: (value) => value.trim().length > 0 || "Relation type is required.",
                  }}
                />
                {relationSuccess ? <p role="status">Relation added.</p> : null}
                <div className="flex justify-end">
                  <Button isLoading={isAddingRelation} type="submit">
                    Add relation
                  </Button>
                </div>
              </form>
              </div>
            </div>
          ) : null}
          {activeTab === "watchers" ? (
            <div className="grid gap-6">
              <WorkItemWatchersList watchers={placeholderWatchers} />
              <div className="border-t border-[var(--mui-palette-divider)] pt-6">
                <h3 className="text-base font-semibold">Add watcher</h3>
              <form
                className="mt-4 grid gap-4"
                noValidate
                onSubmit={handleWatcherSubmit(addWatcher)}
              >
                <InputField
                  control={watcherControl}
                  label="Watcher user ID"
                  name="watcherUserId"
                  rules={{
                    validate: (value) => value.trim().length > 0 || "Watcher user ID is required.",
                  }}
                />
                {watcherSuccess ? <p role="status">Watcher added.</p> : null}
                <div className="flex justify-end">
                  <Button isLoading={isAddingWatcher} type="submit">
                    Add watcher
                  </Button>
                </div>
              </form>
              </div>
            </div>
          ) : null}
          {activeTab === "files" ? (
            <div className="grid gap-6">
              <WorkItemAttachmentsList attachments={placeholderAttachments} />
              <div className="border-t border-[var(--mui-palette-divider)] pt-6">
                <h3 className="text-base font-semibold">Link attachment</h3>
              <form
                className="mt-4 grid gap-4"
                noValidate
                onSubmit={handleAttachmentSubmit(linkAttachment)}
              >
                <InputField
                  control={attachmentControl}
                  label="Attachment name"
                  name="fileName"
                  rules={{
                    validate: (value) => value.trim().length > 0 || "Attachment name is required.",
                  }}
                />
                <InputField
                  control={attachmentControl}
                  label="Content type"
                  name="contentType"
                  rules={{
                    validate: (value) => value.trim().length > 0 || "Content type is required.",
                  }}
                />
                <InputField
                  control={attachmentControl}
                  label="Size in bytes"
                  name="sizeInBytes"
                  rules={{ validate: (value) => value.trim().length > 0 || "Size is required." }}
                />
                <InputField
                  control={attachmentControl}
                  label="Storage path"
                  name="storagePath"
                  rules={{
                    validate: (value) => value.trim().length > 0 || "Storage path is required.",
                  }}
                />
                {attachmentSuccess ? <p role="status">Attachment linked.</p> : null}
                <div className="flex justify-end">
                  <Button isLoading={isLinkingAttachment} type="submit">
                    Link attachment
                  </Button>
                </div>
              </form>
              </div>
            </div>
          ) : null}
          {activeTab === "time-cost" ? (
            <WorkItemTimeCostPanel
              costEntries={placeholderCostEntries}
              timeEntries={placeholderTimeEntries}
            />
          ) : null}
        </div>
      </SectionCardContent>
      <ConfirmDialog
        description="This work item will be permanently removed."
        intent="destructive"
        isConfirming={isDeleting}
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={remove}
        open={isDeleteOpen}
        title="Delete work item?"
      />
    </SectionCard>
  );
}
