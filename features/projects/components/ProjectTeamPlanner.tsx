"use client";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { useToast } from "@/components/ui/Toast";
import { getWorkItems, updateWorkItem } from "@/features/work-items/service";
import { projectsApiService } from "@/services/api/backend-services/projects";

import { ProjectTeamPlannerAddPane } from "./ProjectTeamPlannerAddPane";
import { ProjectTeamPlannerAssigneePicker } from "./ProjectTeamPlannerAssigneePicker";
import { ProjectTeamPlannerTimeline } from "./ProjectTeamPlannerTimeline";
import { ProjectTeamPlannerToolbar } from "./ProjectTeamPlannerToolbar";
import {
  defaultTeamPlannerAssignees,
  defaultUnscheduledWorkPackages,
  formatPlannerRange,
  getPlannerDays,
  plannerViewOptions,
  type TeamPlannerAssignee,
  type TeamPlannerView,
  type TeamPlannerWorkPackage,
} from "./project-team-planner-model";

const defaultAvailableAssignees: TeamPlannerAssignee[] = [
  { id: "alex", initials: "AM", name: "Alex Morgan", workPackages: [] },
  { id: "jordan", initials: "JL", name: "Jordan Lee", workPackages: [] },
];

interface ProjectTeamPlannerProps {
  assignees?: TeamPlannerAssignee[];
  availableAssignees?: TeamPlannerAssignee[];
  errorMessage?: string;
  isLoading?: boolean;
  projectId: string;
  unscheduledWorkPackages?: TeamPlannerWorkPackage[];
}

export function ProjectTeamPlanner({
  assignees = defaultTeamPlannerAssignees,
  availableAssignees = defaultAvailableAssignees,
  errorMessage,
  isLoading = false,
  projectId,
  unscheduledWorkPackages = defaultUnscheduledWorkPackages,
}: ProjectTeamPlannerProps) {
  const { error: toastError, success: toastSuccess } = useToast();
  const [anchorDate, setAnchorDate] = useState(() => new Date(Date.UTC(2026, 7, 17)));
  const [view, setView] = useState<TeamPlannerView>("workWeek");
  const [isAddPaneOpen, setIsAddPaneOpen] = useState(false);
  const [isAssigneePickerOpen, setIsAssigneePickerOpen] = useState(false);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState("");
  const [addedAssignees, setAddedAssignees] = useState<TeamPlannerAssignee[]>([]);
  const [removedAssigneeIds, setRemovedAssigneeIds] = useState<string[]>([]);
  const [dynamicAssignees, setDynamicAssignees] = useState<TeamPlannerAssignee[] | null>(null);
  const [dynamicUnscheduled, setDynamicUnscheduled] = useState<TeamPlannerWorkPackage[] | null>(null);

  useEffect(() => {
    if (!projectId) return;
    let isMounted = true;

    Promise.all([
      projectsApiService.listMembers({ pathParams: { projectId } }).catch(() => null),
      getWorkItems(projectId).catch(() => null),
    ]).then(([membersRes, workItemsRes]) => {
      if (!isMounted) return;

      let memberList: TeamPlannerAssignee[] = [];
      if (
        membersRes &&
        typeof membersRes === "object" &&
        "items" in membersRes &&
        Array.isArray((membersRes as { items: unknown[] }).items)
      ) {
        const rawItems = (membersRes as { items: Array<{ id?: string; name: string; userId?: string }> })
          .items;
        memberList = rawItems.map((member) => ({
          id: member.id || String(member.userId ?? ""),
          initials: member.name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase(),
          name: member.name,
          workPackages: [],
        }));
      }

      if (workItemsRes && workItemsRes.items && workItemsRes.items.length > 0) {
        const unscheduled: TeamPlannerWorkPackage[] = [];
        const workItems = workItemsRes.items;

        if (memberList.length === 0) {
          // Derive assignees from work items if member list was empty
          const assigneeMap = new Map<string, TeamPlannerAssignee>();
          workItems.forEach((it) => {
            const assigneeName = it.assignee ?? "";
            if (assigneeName && assigneeName !== "Unassigned") {
              const id = it.assigneeUserId || assigneeName.toLowerCase().replace(/\s+/g, "-");
              if (!assigneeMap.has(id)) {
                assigneeMap.set(id, {
                  id,
                  initials: assigneeName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase(),
                  name: assigneeName,
                  workPackages: [],
                });
              }
            }
          });
          memberList = Array.from(assigneeMap.values());
        }

        workItems.forEach((it) => {
          const hasDate = Boolean(it.dueDate);
          const assigneeName = it.assignee ?? "";
          const hasAssignee = Boolean(assigneeName && assigneeName !== "Unassigned");

          const wp: TeamPlannerWorkPackage = {
            dueDate: it.dueDate ? it.dueDate.slice(0, 10) : "",
            id: it.id,
            startDate: it.startDate ? it.startDate.slice(0, 10) : it.dueDate ? it.dueDate.slice(0, 10) : "",
            status: it.status,
            subject: it.subject,
            type: it.type || "Task",
          };

          if (hasDate && hasAssignee) {
            const member = memberList.find(
              (m) =>
                m.id === it.assigneeUserId ||
                m.name.toLowerCase() === assigneeName.toLowerCase(),
            );
            if (member) {
              member.workPackages.push(wp);
            } else {
              unscheduled.push(wp);
            }
          } else {
            unscheduled.push(wp);
          }
        });

        if (memberList.length > 0) {
          setDynamicAssignees(memberList);
        }
        if (unscheduled.length > 0) {
          setDynamicUnscheduled(unscheduled);
        }
      } else if (memberList.length > 0) {
        setDynamicAssignees(memberList);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  useEffect(() => {
    if (errorMessage) toastError(errorMessage);
  }, [errorMessage, toastError]);

  const activeBaseAssignees =
    assignees !== defaultTeamPlannerAssignees ? assignees : (dynamicAssignees ?? assignees);

  const activeUnscheduled =
    unscheduledWorkPackages !== defaultUnscheduledWorkPackages
      ? unscheduledWorkPackages
      : (dynamicUnscheduled ?? unscheduledWorkPackages);

  const visibleAssignees = useMemo(
    () => [
      ...activeBaseAssignees.filter((assignee) => !removedAssigneeIds.includes(assignee.id)),
      ...addedAssignees,
    ],
    [activeBaseAssignees, addedAssignees, removedAssigneeIds],
  );

  const assigneeCandidates = useMemo(
    () =>
      [...availableAssignees, ...activeBaseAssignees].filter(
        (candidate, index, candidates) =>
          !visibleAssignees.some((assignee) => assignee.id === candidate.id) &&
          candidates.findIndex((assignee) => assignee.id === candidate.id) === index,
      ),
    [activeBaseAssignees, availableAssignees, visibleAssignees],
  );

  const days = useMemo(() => getPlannerDays(anchorDate, view), [anchorDate, view]);
  const selectedView = plannerViewOptions.find((option) => option.value === view)!;

  const changePeriod = (direction: -1 | 1) => {
    setAnchorDate((current) => {
      const next = new Date(current);
      next.setUTCDate(current.getUTCDate() + selectedView.incrementDays * direction);
      return next;
    });
  };

  const addAssignee = () => {
    const selected = assigneeCandidates.find((candidate) => candidate.id === selectedAssigneeId);
    if (!selected) return;
    setRemovedAssigneeIds((current) => current.filter((id) => id !== selected.id));
    if (!activeBaseAssignees.some((assignee) => assignee.id === selected.id)) {
      setAddedAssignees((current) => [...current, selected]);
    }
    setSelectedAssigneeId("");
    setIsAssigneePickerOpen(false);
  };

  const removeAssignee = (assigneeId: string) => {
    if (addedAssignees.some((assignee) => assignee.id === assigneeId)) {
      setAddedAssignees((current) => current.filter((assignee) => assignee.id !== assigneeId));
      return;
    }
    setRemovedAssigneeIds((current) => [...current, assigneeId]);
  };

  const handleScheduleWorkPackage = async (
    workPackageId: string,
    assigneeId: string,
    targetDate: string,
  ) => {
    const targetWp = activeUnscheduled.find((w) => w.id === workPackageId);
    if (!targetWp) return;

    // Optimistic UI update
    const scheduledWp: TeamPlannerWorkPackage = {
      ...targetWp,
      dueDate: targetDate,
      startDate: targetDate,
    };

    setDynamicAssignees((prev) => {
      const currentList = prev ?? activeBaseAssignees;
      return currentList.map((assignee) => {
        if (assignee.id === assigneeId) {
          return {
            ...assignee,
            workPackages: [...assignee.workPackages, scheduledWp],
          };
        }
        return assignee;
      });
    });

    setDynamicUnscheduled((prev) => (prev ?? activeUnscheduled).filter((w) => w.id !== workPackageId));

    try {
      if (projectId) {
        await updateWorkItem(workPackageId, {
          assigneeUserId: assigneeId,
          dueDate: targetDate,
        });
      }
      toastSuccess("Work package scheduled on timeline");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Failed to schedule work package");
    }
  };

  if (isLoading) return <LoadingState label="Loading team planner" />;

  return (
    <Box>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ alignItems: { md: "center" }, justifyContent: "space-between", mb: 3 }}
      >
        <Box>
          <Typography component="h1" variant="h1">
            Team planner
          </Typography>
          <Typography component="h2" sx={{ fontWeight: 700, mt: 1 }} variant="h4">
            {formatPlannerRange(days)}
          </Typography>
        </Box>
        <ProjectTeamPlannerToolbar
          isAddPaneOpen={isAddPaneOpen}
          onNext={() => changePeriod(1)}
          onPrevious={() => changePeriod(-1)}
          onToday={() => setAnchorDate(new Date(Date.UTC(2026, 7, 17)))}
          onToggleAddPane={() => setIsAddPaneOpen((current) => !current)}
          onViewChange={setView}
          view={view}
        />
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ mt: 3 }}>
        <Paper sx={{ flex: 1, minWidth: 0, overflow: "hidden" }} variant="outlined">
          {visibleAssignees.length === 0 ? (
            <Box sx={{ py: 8 }}>
              <EmptyState
                action={
                  <Button
                    onClick={() => setIsAssigneePickerOpen(true)}
                    startIcon={<UserPlus aria-hidden="true" size={16} />}
                  >
                    Add assignee
                  </Button>
                }
                description="Add assignees to set up your team planner."
                title="No assignees on the planner"
              />
            </Box>
          ) : (
            <ProjectTeamPlannerTimeline
              assignees={visibleAssignees}
              days={days}
              onRemoveAssignee={removeAssignee}
              projectId={projectId}
            />
          )}

          {isAssigneePickerOpen ? (
            <ProjectTeamPlannerAssigneePicker
              candidates={assigneeCandidates}
              onAdd={addAssignee}
              onCancel={() => setIsAssigneePickerOpen(false)}
              onSelectionChange={setSelectedAssigneeId}
              selectedAssigneeId={selectedAssigneeId}
            />
          ) : null}
        </Paper>

        {isAddPaneOpen ? (
          <ProjectTeamPlannerAddPane
            assignees={visibleAssignees}
            onScheduleWorkPackage={handleScheduleWorkPackage}
            projectId={projectId}
            workPackages={activeUnscheduled}
          />
        ) : null}
      </Stack>
    </Box>
  );
}
