"use client";

import Box from "@mui/material/Box";
import MuiButton from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { CalendarDays, Plus, Settings2, UserRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { Modal } from "@/components/ui/Modal";

export interface ProjectBoardCard {
  assignee: string;
  due: string;
  id: string;
  subject: string;
}

export interface ProjectBoardLane {
  cards: ProjectBoardCard[];
  label: string;
  tone: "info" | "success" | "warning";
}

export interface ProjectBoardView {
  id: string;
  lanes: ProjectBoardLane[];
  name: string;
}

const defaultBoards: ProjectBoardView[] = [
  {
    id: "delivery",
    lanes: [
      {
        cards: [
          {
            assignee: "Riley Park",
            due: "18 Aug",
            id: "WP-138",
            subject: "Confirm project stakeholder access",
          },
          {
            assignee: "Morgan Tate",
            due: "22 Aug",
            id: "WP-144",
            subject: "Prepare customer onboarding notes",
          },
          {
            assignee: "Unassigned",
            due: "28 Aug",
            id: "WP-147",
            subject: "Schedule release readiness review",
          },
        ],
        label: "Open",
        tone: "info",
      },
      {
        cards: [
          {
            assignee: "Dana Chen",
            due: "15 Aug",
            id: "WP-142",
            subject: "Review the release checklist",
          },
          {
            assignee: "Riley Park",
            due: "19 Aug",
            id: "WP-145",
            subject: "Verify the project data import",
          },
        ],
        label: "In progress",
        tone: "warning",
      },
      {
        cards: [
          {
            assignee: "Morgan Tate",
            due: "12 Aug",
            id: "WP-131",
            subject: "Publish the sprint retrospective",
          },
          {
            assignee: "Dana Chen",
            due: "08 Aug",
            id: "WP-129",
            subject: "Document the deployment checklist",
          },
        ],
        label: "Done",
        tone: "success",
      },
    ],
    name: "Delivery board",
  },
  {
    id: "release",
    lanes: [
      {
        cards: [
          {
            assignee: "Riley Park",
            due: "18 Aug",
            id: "WP-151",
            subject: "Confirm release communication owners",
          },
        ],
        label: "Open",
        tone: "info",
      },
      {
        cards: [
          {
            assignee: "Morgan Tate",
            due: "19 Aug",
            id: "WP-152",
            subject: "Run production readiness review",
          },
        ],
        label: "In progress",
        tone: "warning",
      },
      { cards: [], label: "Done", tone: "success" },
    ],
    name: "Release readiness",
  },
];

const chipColor = {
  info: "primary",
  success: "success",
  warning: "warning",
} as const;

interface ProjectBoardProps {
  boards?: ProjectBoardView[];
  isLoading?: boolean;
  projectId: string;
}

export function ProjectBoard({
  boards = defaultBoards,
  isLoading = false,
  projectId,
}: ProjectBoardProps) {
  const [boardViews, setBoardViews] = useState(boards);
  const [selectedBoardId, setSelectedBoardId] = useState(boards[0]?.id ?? "");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [isConfigurationOpen, setIsConfigurationOpen] = useState(false);
  const [isInlineCreateOpen, setIsInlineCreateOpen] = useState(false);
  const [boardNameDraft, setBoardNameDraft] = useState("");
  const [subjectDraft, setSubjectDraft] = useState("");
  const [subjectError, setSubjectError] = useState("");
  const workPackagesHref = `/projects/${projectId}/work-items`;
  const selectedBoard = boardViews.find((board) => board.id === selectedBoardId) ?? boardViews[0];
  const filters = ["All", ...(selectedBoard?.lanes.map((lane) => lane.label) ?? [])];
  const visibleLanes = selectedBoard?.lanes.filter(
    (lane) => selectedFilter === "All" || lane.label === selectedFilter,
  );

  if (isLoading) return <LoadingState label="Loading board" />;

  if (!selectedBoard || !visibleLanes?.some((lane) => lane.cards.length > 0)) {
    return (
      <Box>
        <Typography component="h1" variant="h1">
          {selectedBoard?.name ?? "Delivery board"}
        </Typography>
        <EmptyState
          description="Adjust the filter or add a work package to begin planning."
          title="No work packages on this board"
        />
      </Box>
    );
  }

  const openConfiguration = () => {
    setBoardNameDraft(selectedBoard.name);
    setIsConfigurationOpen(true);
  };

  const saveConfiguration = () => {
    const name = boardNameDraft.trim();
    if (!name) return;
    setBoardViews((currentBoards) =>
      currentBoards.map((board) => (board.id === selectedBoard.id ? { ...board, name } : board)),
    );
    setIsConfigurationOpen(false);
  };

  const addWorkPackage = () => {
    const subject = subjectDraft.trim();
    if (!subject) {
      setSubjectError("Subject is required.");
      return;
    }

    const targetLane = selectedBoard.lanes[0];
    if (!targetLane) return;
    setBoardViews((currentBoards) =>
      currentBoards.map((board) =>
        board.id === selectedBoard.id
          ? {
              ...board,
              lanes: board.lanes.map((lane) =>
                lane.label === targetLane.label
                  ? {
                      ...lane,
                      cards: [
                        ...lane.cards,
                        {
                          assignee: "Unassigned",
                          due: "No due date",
                          id: `NEW-${lane.cards.length + 1}`,
                          subject,
                        },
                      ],
                    }
                  : lane,
              ),
            }
          : board,
      ),
    );
    setSubjectDraft("");
    setSubjectError("");
    setIsInlineCreateOpen(false);
  };

  return (
    <Box>
      <Stack
        direction={{ sm: "row" }}
        spacing={2}
        sx={{ alignItems: { sm: "baseline" }, justifyContent: "space-between", mb: 5 }}
      >
        <Box>
          <Typography component="h1" variant="h1">
            {selectedBoard.name}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            A read-only view of current work grouped by status.
          </Typography>
        </Box>
        <Typography
          component={Link}
          href={workPackagesHref}
          sx={{ color: "primary.main", fontWeight: 700 }}
        >
          Open work packages
        </Typography>
      </Stack>

      <Stack
        direction={{ md: "row" }}
        spacing={2}
        sx={{ alignItems: { md: "center" }, justifyContent: "space-between", mb: 4 }}
      >
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="board-select-label">Board</InputLabel>
          <Select
            label="Board"
            labelId="board-select-label"
            onChange={(event) => {
              setSelectedBoardId(event.target.value);
              setSelectedFilter("All");
            }}
            value={selectedBoard.id}
          >
            {boards.map((board) => (
              <MenuItem key={board.id} value={board.id}>
                {board.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Stack aria-label="Board filters" direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          {filters.map((filter) => (
            <MuiButton
              aria-pressed={selectedFilter === filter}
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              size="small"
              variant={selectedFilter === filter ? "contained" : "outlined"}
            >
              {filter}
            </MuiButton>
          ))}
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            onClick={openConfiguration}
            startIcon={<Settings2 aria-hidden="true" size={16} />}
            variant="outline"
          >
            Configure board
          </Button>
          <Button
            onClick={() => setIsInlineCreateOpen((isOpen) => !isOpen)}
            startIcon={<Plus aria-hidden="true" size={16} />}
            variant="solid"
          >
            Add work package
          </Button>
        </Stack>
      </Stack>

      {isInlineCreateOpen ? (
        <Paper component="section" sx={{ mb: 4, p: 3 }} variant="outlined">
          <Stack direction={{ sm: "row" }} spacing={2} sx={{ alignItems: { sm: "flex-start" } }}>
            <TextField
              error={Boolean(subjectError)}
              fullWidth
              helperText={subjectError}
              label="Work package subject"
              onChange={(event) => {
                setSubjectDraft(event.target.value);
                if (subjectError) setSubjectError("");
              }}
              value={subjectDraft}
            />
            <Stack direction="row" spacing={1}>
              <Button onClick={() => setIsInlineCreateOpen(false)} variant="ghost">
                Cancel
              </Button>
              <Button onClick={addWorkPackage}>Add to board</Button>
            </Stack>
          </Stack>
        </Paper>
      ) : null}

      <Box
        aria-label="Kanban board"
        component="section"
        sx={{ display: "flex", gap: 4, minHeight: 480, overflowX: "auto", pb: 2 }}
      >
        {visibleLanes.map((lane) => (
          <Box key={lane.label} sx={{ flex: "0 0 300px", maxWidth: 300 }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}
            >
              <Typography component="h2" sx={{ fontWeight: 700 }} variant="subtitle1">
                {lane.label} {lane.cards.length}
              </Typography>
              <Chip
                color={chipColor[lane.tone]}
                label={lane.cards.length}
                size="small"
                variant="outlined"
              />
            </Stack>
            <Stack spacing={2}>
              {lane.cards.map((card) => (
                <Paper
                  component={Link}
                  href={workPackagesHref}
                  key={card.id}
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    display: "block",
                    p: 3,
                    transition:
                      "border-color 150ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 150ms cubic-bezier(0.16, 1, 0.3, 1)",
                    "&:focus-visible": {
                      boxShadow: "0 0 0 3px rgba(26, 103, 163, 0.25)",
                      outline: "none",
                    },
                    "&:hover": { borderColor: "primary.main", boxShadow: 1 },
                  }}
                  variant="outlined"
                >
                  <Typography color="primary.main" variant="caption">
                    {card.id}
                  </Typography>
                  <Typography sx={{ fontWeight: 700, mt: 1 }} variant="body2">
                    {card.subject}
                  </Typography>
                  <Stack spacing={1} sx={{ color: "text.secondary", mt: 3 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <UserRound aria-hidden="true" size={14} strokeWidth={1.8} />
                      <Typography variant="caption">{card.assignee}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <CalendarDays aria-hidden="true" size={14} strokeWidth={1.8} />
                      <Typography variant="caption">Due {card.due}</Typography>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Box>
        ))}
      </Box>
      <Modal
        actions={
          <>
            <Button onClick={() => setIsConfigurationOpen(false)} variant="ghost">
              Cancel
            </Button>
            <Button disabled={!boardNameDraft.trim()} onClick={saveConfiguration}>
              Apply
            </Button>
          </>
        }
        onClose={() => setIsConfigurationOpen(false)}
        open={isConfigurationOpen}
        title="Configure board"
      >
        <TextField
          autoFocus
          fullWidth
          label="Board name"
          onChange={(event) => setBoardNameDraft(event.target.value)}
          value={boardNameDraft}
        />
      </Modal>
    </Box>
  );
}
