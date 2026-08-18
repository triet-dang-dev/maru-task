"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Calendar, Check, Search } from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useState } from "react";

import type { TeamPlannerAssignee, TeamPlannerWorkPackage } from "./project-team-planner-model";

interface ProjectTeamPlannerAddPaneProps {
  assignees?: TeamPlannerAssignee[];
  onScheduleWorkPackage?: (workPackageId: string, assigneeId: string, date: string) => Promise<void> | void;
  projectId: string;
  workPackages: TeamPlannerWorkPackage[];
}

export function ProjectTeamPlannerAddPane({
  assignees = [],
  onScheduleWorkPackage,
  projectId,
  workPackages,
}: ProjectTeamPlannerAddPaneProps) {
  const [search, setSearch] = useState("");
  const [schedulingId, setSchedulingId] = useState<string | null>(null);
  const [selectedAssignee, setSelectedAssignee] = useState(assignees[0]?.id ?? "");
  const [scheduleDate, setScheduleDate] = useState("2026-08-18");

  const deferredSearch = useDeferredValue(search.trim().toLocaleLowerCase());
  const results = deferredSearch
    ? workPackages.filter(
        (workPackage) =>
          workPackage.subject.toLocaleLowerCase().includes(deferredSearch) ||
          workPackage.id.toLocaleLowerCase().includes(deferredSearch),
      )
    : [];

  const handleConfirmSchedule = async (workPackageId: string) => {
    if (!selectedAssignee || !scheduleDate || !onScheduleWorkPackage) return;
    await onScheduleWorkPackage(workPackageId, selectedAssignee, scheduleDate);
    setSchedulingId(null);
  };

  return (
    <Box
      aria-label="Available work packages"
      component="aside"
      role="region"
      sx={{
        bgcolor: "action.hover",
        border: 1,
        borderColor: "divider",
        flex: { md: "0 0 280px" },
        minHeight: 420,
        p: 2,
      }}
    >
      <TextField
        fullWidth
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search..."
        size="small"
        slotProps={{
          htmlInput: {
            "aria-label": "Search existing work packages",
            type: "search",
          },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search aria-hidden="true" size={16} />
              </InputAdornment>
            ),
          },
        }}
        value={search}
      />

      {!deferredSearch ? (
        <Stack spacing={2} sx={{ alignItems: "center", px: 3, py: 10, textAlign: "center" }}>
          <Box
            aria-hidden="true"
            sx={{
              alignItems: "center",
              bgcolor: "primary.light",
              borderRadius: "50%",
              color: "primary.dark",
              display: "flex",
              height: 64,
              justifyContent: "center",
              width: 64,
            }}
          >
            <Search size={26} strokeWidth={1.5} />
          </Box>
          <Typography color="text.secondary" variant="body2">
            Search for work packages to add them to the planner.
          </Typography>
        </Stack>
      ) : results.length > 0 ? (
        <Stack spacing={2} sx={{ mt: 2 }}>
          {results.map((workPackage) => (
            <Paper
              key={workPackage.id}
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 0.5,
                boxShadow: "1px 1px 3px rgba(0, 0, 0, 0.12)",
                display: "block",
                p: 2,
                position: "relative",
                "&::before": {
                  bgcolor: "primary.main",
                  content: '\"\"',
                  height: 2,
                  left: 0,
                  position: "absolute",
                  right: 0,
                  top: 0,
                },
                "&:hover": { borderColor: "primary.main" },
              }}
              variant="outlined"
            >
              <Stack direction="row" spacing={1}>
                <Typography color="text.secondary" variant="caption">
                  WP-{workPackage.id}
                </Typography>
                <Typography color="text.secondary" variant="caption">
                  {workPackage.type}
                </Typography>
              </Stack>
              <Typography
                component={Link}
                href={`/projects/${projectId}/work-items/${workPackage.id}`}
                sx={{
                  color: "text.primary",
                  display: "block",
                  fontWeight: 650,
                  mt: 0.5,
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
                variant="body2"
              >
                {workPackage.subject}
              </Typography>

              {onScheduleWorkPackage && assignees.length > 0 ? (
                <Box sx={{ mt: 1.5, pt: 1, borderTop: 1, borderColor: "divider" }}>
                  {schedulingId === workPackage.id ? (
                    <Stack spacing={1}>
                      <FormControl fullWidth size="small">
                        <InputLabel id={`assignee-select-label-${workPackage.id}`}>Assignee</InputLabel>
                        <Select
                          label="Assignee"
                          labelId={`assignee-select-label-${workPackage.id}`}
                          onChange={(e) => setSelectedAssignee(e.target.value)}
                          value={selectedAssignee}
                        >
                          {assignees.map((a) => (
                            <MenuItem key={a.id} value={a.id}>
                              {a.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField
                        fullWidth
                        label="Date"
                        onChange={(e) => setScheduleDate(e.target.value)}
                        size="small"
                        type="date"
                        value={scheduleDate}
                      />
                      <Stack direction="row" spacing={1}>
                        <Button
                          fullWidth
                          onClick={() => handleConfirmSchedule(workPackage.id)}
                          size="small"
                          startIcon={<Check size={14} />}
                          variant="contained"
                        >
                          Schedule
                        </Button>
                        <Button
                          fullWidth
                          onClick={() => setSchedulingId(null)}
                          size="small"
                          variant="outlined"
                        >
                          Cancel
                        </Button>
                      </Stack>
                    </Stack>
                  ) : (
                    <Button
                      fullWidth
                      onClick={() => {
                        setSelectedAssignee(assignees[0]?.id ?? "");
                        setSchedulingId(workPackage.id);
                      }}
                      size="small"
                      startIcon={<Calendar size={14} />}
                      variant="text"
                    >
                      Schedule on timeline
                    </Button>
                  )}
                </Box>
              ) : null}
            </Paper>
          ))}
        </Stack>
      ) : (
        <Typography
          color="text.secondary"
          sx={{ px: 2, py: 8, textAlign: "center" }}
          variant="body2"
        >
          No work packages found.
        </Typography>
      )}
    </Box>
  );
}
