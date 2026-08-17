"use client";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/Button";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { LoadingState } from "@/components/ui/LoadingState";
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
  const [anchorDate, setAnchorDate] = useState(() => new Date(Date.UTC(2026, 7, 17)));
  const [view, setView] = useState<TeamPlannerView>("workWeek");
  const [isAddPaneOpen, setIsAddPaneOpen] = useState(false);
  const [isAssigneePickerOpen, setIsAssigneePickerOpen] = useState(false);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState("");
  const [addedAssignees, setAddedAssignees] = useState<TeamPlannerAssignee[]>([]);
  const [removedAssigneeIds, setRemovedAssigneeIds] = useState<string[]>([]);
  const [dynamicAssignees, setDynamicAssignees] = useState<TeamPlannerAssignee[] | null>(null);

  useEffect(() => {
    if (!projectId) return;
    let isMounted = true;

    projectsApiService
      .listMembers({ pathParams: { projectId } })
      .then((res: unknown) => {
        if (!isMounted) return;
        if (
          res &&
          typeof res === "object" &&
          "items" in res &&
          Array.isArray((res as { items: unknown[] }).items)
        ) {
          const rawItems = (res as { items: Array<{ id?: string; name: string; userId?: string }> }).items;
          const mapped: TeamPlannerAssignee[] = rawItems.map((member) => ({
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
          setDynamicAssignees(mapped);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const activeBaseAssignees =
    assignees !== defaultTeamPlannerAssignees ? assignees : (dynamicAssignees ?? assignees);

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

      {errorMessage ? (
        <Box sx={{ mt: 3 }}>
          <InlineAlert title="Unable to update team planner" tone="error">
            {errorMessage}
          </InlineAlert>
        </Box>
      ) : null}

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
            projectId={projectId}
            workPackages={unscheduledWorkPackages}
          />
        ) : null}
      </Stack>
    </Box>
  );
}
