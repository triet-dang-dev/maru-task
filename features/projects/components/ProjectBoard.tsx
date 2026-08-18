"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import MuiButton from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Columns,
  MoreHorizontal,
  Plus,
  Settings2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/LoadingState";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { UserProfilePopover } from "@/components/ui/UserProfilePopover";
import { createWorkItem, getWorkItems, updateWorkItem } from "@/features/work-items/service";
import { agileApiService } from "@/services/api/backend-services/agile";
import { AddBoardLaneModal } from "./AddBoardLaneModal";

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
    id: "assignee",
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
            assignee: "Riley Park",
            due: "19 Aug",
            id: "WP-145",
            subject: "Verify the project data import",
          },
        ],
        label: "Riley Park",
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
            assignee: "Dana Chen",
            due: "08 Aug",
            id: "WP-129",
            subject: "Document the deployment checklist",
          },
        ],
        label: "Dana Chen",
        tone: "warning",
      },
      {
        cards: [
          {
            assignee: "Morgan Tate",
            due: "22 Aug",
            id: "WP-144",
            subject: "Prepare customer onboarding notes",
          },
          {
            assignee: "Morgan Tate",
            due: "12 Aug",
            id: "WP-131",
            subject: "Publish the sprint retrospective",
          },
        ],
        label: "Morgan Tate",
        tone: "success",
      },
    ],
    name: "Assignee board",
  },
  {
    id: "subproject",
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
            assignee: "Dana Chen",
            due: "15 Aug",
            id: "WP-142",
            subject: "Review the release checklist",
          },
        ],
        label: "Core platform",
        tone: "info",
      },
      {
        cards: [
          {
            assignee: "Morgan Tate",
            due: "22 Aug",
            id: "WP-144",
            subject: "Prepare customer onboarding notes",
          },
          {
            assignee: "Riley Park",
            due: "19 Aug",
            id: "WP-145",
            subject: "Verify the project data import",
          },
        ],
        label: "Integration services",
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
        ],
        label: "Public API",
        tone: "success",
      },
    ],
    name: "Subproject board",
  },
  {
    id: "release",
    lanes: [
      {
        cards: [
          {
            assignee: "Dana Chen",
            due: "17 Aug",
            id: "WP-150",
            subject: "Tag release candidate 1.4.0",
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

const toneColors = {
  info: { bg: "#0288d1", chipBg: "rgba(2, 136, 209, 0.1)", color: "#0288d1" },
  success: { bg: "#2e7d32", chipBg: "rgba(46, 125, 50, 0.1)", color: "#2e7d32" },
  warning: { bg: "#ed6c02", chipBg: "rgba(237, 108, 2, 0.1)", color: "#ed6c02" },
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
  const { success: toastSuccess, error: toastError } = useToast();
  const [boardViews, setBoardViews] = useState(boards);
  const [selectedBoardId, setSelectedBoardId] = useState(boards[0]?.id ?? "");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [isConfigurationOpen, setIsConfigurationOpen] = useState(false);
  const [isAddLaneOpen, setIsAddLaneOpen] = useState(false);
  const [isInlineCreateOpen, setIsInlineCreateOpen] = useState(false);
  const [activeLaneIndex, setActiveLaneIndex] = useState<number | null>(null);
  const [laneInlineSubject, setLaneInlineSubject] = useState("");
  const [boardNameDraft, setBoardNameDraft] = useState("");
  const [subjectDraft, setSubjectDraft] = useState("");
  const [subjectError, setSubjectError] = useState("");
  const [dragOverLane, setDragOverLane] = useState<string | null>(null);

  const workPackagesHref = `/projects/${projectId}/work-items`;

  useEffect(() => {
    if (!projectId) return;
    let isMounted = true;
    getWorkItems(projectId)
      .then((res) => {
        if (!isMounted || !res.items || res.items.length === 0) return;
        const openCards: ProjectBoardCard[] = [];
        const inProgressCards: ProjectBoardCard[] = [];
        const doneCards: ProjectBoardCard[] = [];

        res.items.forEach((item) => {
          const card: ProjectBoardCard = {
            assignee: item.assignee || "Unassigned",
            due: item.dueDate ? item.dueDate.slice(5, 10) : "No due date",
            id: item.id.startsWith("WP-") ? item.id : `WP-${item.id}`,
            subject: item.subject,
          };
          const norm = item.status.toLowerCase();
          if (norm.includes("done") || norm.includes("closed")) {
            doneCards.push(card);
          } else if (norm.includes("progress")) {
            inProgressCards.push(card);
          } else {
            openCards.push(card);
          }
        });

        const liveDeliveryBoard: ProjectBoardView = {
          id: "delivery",
          lanes: [
            {
              cards:
                openCards.length > 0
                  ? openCards
                  : [{ assignee: "You", due: "18 Aug", id: "WP-1", subject: "Review requirements" }],
              label: "Open",
              tone: "info",
            },
            { cards: inProgressCards, label: "In progress", tone: "warning" },
            { cards: doneCards, label: "Done", tone: "success" },
          ],
          name: "Delivery board",
        };

        setBoardViews((prev) => [
          liveDeliveryBoard,
          ...prev.filter((b) => b.id !== "delivery"),
        ]);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [projectId]);

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

  const handleAddLane = (newLane: { label: string; tone: "info" | "success" | "warning" }) => {
    setBoardViews((currentBoards) =>
      currentBoards.map((board) =>
        board.id === selectedBoard.id
          ? {
              ...board,
              lanes: [...board.lanes, { cards: [], label: newLane.label, tone: newLane.tone }],
            }
          : board,
      ),
    );
  };

  const handleMoveCard = (cardId: string, toLaneLabel: string) => {
    let movedCard: ProjectBoardCard | null = null;
    let fromLaneLabel = "";

    setBoardViews((currentBoards) =>
      currentBoards.map((board) => {
        if (board.id !== selectedBoard.id) return board;

        const newLanes = board.lanes.map((lane) => {
          const card = lane.cards.find((c) => c.id === cardId);
          if (card) {
            movedCard = card;
            fromLaneLabel = lane.label;
            return {
              ...lane,
              cards: lane.cards.filter((c) => c.id !== cardId),
            };
          }
          return lane;
        });

        if (!movedCard) return board;

        return {
          ...board,
          lanes: newLanes.map((lane) => {
            if (lane.label === toLaneLabel) {
              return {
                ...lane,
                cards: [...lane.cards, movedCard!],
              };
            }
            return lane;
          }),
        };
      }),
    );

    if (projectId) {
      const cleanId = cardId.replace(/^WP-/, "");
      updateWorkItem(cleanId, { status: toLaneLabel }).catch(() => {});
      agileApiService
        .moveBoardItem({
          body: {
            cardId,
            projectId,
            targetLane: toLaneLabel,
          },
        })
        .catch(() => {});
    }

    toastSuccess(`Moved ${cardId} to ${toLaneLabel}`);
  };

  const addWorkPackage = () => {
    const subject = subjectDraft.trim();
    if (!subject) {
      setSubjectError("Subject is required.");
      return;
    }

    const targetLane = selectedBoard.lanes[0];
    if (!targetLane) return;

    const newId = `WP-${Date.now().toString().slice(-3)}`;
    const newCard: ProjectBoardCard = {
      assignee: "Unassigned",
      due: "No due date",
      id: newId,
      subject,
    };

    setBoardViews((currentBoards) =>
      currentBoards.map((board) =>
        board.id === selectedBoard.id
          ? {
              ...board,
              lanes: board.lanes.map((lane) =>
                lane.label === targetLane.label
                  ? {
                      ...lane,
                      cards: [...lane.cards, newCard],
                    }
                  : lane,
              ),
            }
          : board,
      ),
    );

    if (projectId) {
      createWorkItem({ projectId, title: subject })
        .then(() => {
          toastSuccess("Created work package");
        })
        .catch(() => {});
    }

    setSubjectDraft("");
    setSubjectError("");
    setIsInlineCreateOpen(false);
  };

  const addCardToLane = (laneIndex: number) => {
    const subject = laneInlineSubject.trim();
    if (!subject) return;

    const newId = `WP-${Date.now().toString().slice(-3)}`;
    const newCard: ProjectBoardCard = {
      assignee: "Unassigned",
      due: "No due date",
      id: newId,
      subject,
    };

    setBoardViews((currentBoards) =>
      currentBoards.map((board) =>
        board.id === selectedBoard.id
          ? {
              ...board,
              lanes: board.lanes.map((lane, idx) =>
                idx === laneIndex
                  ? {
                      ...lane,
                      cards: [...lane.cards, newCard],
                    }
                  : lane,
              ),
            }
          : board,
      ),
    );

    if (projectId) {
      createWorkItem({ projectId, title: subject })
        .then(() => {
          toastSuccess("Created work package");
        })
        .catch(() => {});
    }

    setLaneInlineSubject("");
    setActiveLaneIndex(null);
  };

  return (
    <Box className="op-boards--workspace">
      <Stack
        direction={{ sm: "row" }}
        spacing={2}
        sx={{ alignItems: { sm: "baseline" }, justifyContent: "space-between", mb: 4 }}
      >
        <Box>
          <Typography component="h1" variant="h1">
            {selectedBoard.name}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            A Kanban view of current work packages grouped by lane.
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
        sx={{ alignItems: { md: "center" }, justifyContent: "space-between", mb: 3 }}
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
            {boardViews.map((board) => (
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
            onClick={() => setIsAddLaneOpen(true)}
            startIcon={<Columns aria-hidden="true" size={16} />}
            variant="outline"
          >
            Add list
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

      {/* OpenProject Kanban Board Lanes Grid */}
      <Box
        aria-label="Kanban board"
        className="op-board"
        component="section"
        sx={{
          display: "flex",
          gap: 2.5,
          minHeight: 520,
          overflowX: "auto",
          pb: 2,
        }}
      >
        {visibleLanes.map((lane, laneIdx) => {
          const tone = toneColors[lane.tone] || toneColors.info;
          const isOver = dragOverLane === lane.label;

          return (
            <Box
              className="op-board-list"
              data-test-selector="op-board-list"
              key={lane.label}
              onDragLeave={() => setDragOverLane(null)}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverLane(lane.label);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverLane(null);
                const cardId = e.dataTransfer.getData("text/plain");
                if (cardId) {
                  handleMoveCard(cardId, lane.label);
                }
              }}
              sx={{
                bgcolor: isOver ? "action.hover" : "grey.50",
                border: "1px solid",
                borderColor: isOver ? "primary.main" : "divider",
                borderRadius: "6px",
                display: "flex",
                flex: "0 0 320px",
                flexDirection: "column",
                maxWidth: 320,
                p: 1.5,
                transition: "border-color 150ms ease, background-color 150ms ease",
              }}
            >
              {/* Lane Header matching OpenProject op-board-list--header */}
              <Stack
                className="op-board-list--header"
                data-test-selector="op-board-list--header"
                direction="row"
                spacing={1}
                sx={{
                  alignItems: "center",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  justifyContent: "space-between",
                  pb: 1.5,
                  mb: 1.5,
                }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <Typography component="h2" sx={{ fontWeight: 700, fontSize: "0.9375rem" }} variant="subtitle1">
                    {lane.label} {lane.cards.length}
                  </Typography>
                  <Chip
                    label={lane.cards.length}
                    size="small"
                    sx={{
                      bgcolor: tone.chipBg,
                      color: tone.color,
                      fontWeight: 700,
                      height: 20,
                    }}
                  />
                </Stack>

                <Stack direction="row" spacing={0.5}>
                  <IconButton
                    aria-label={`Add card to ${lane.label}`}
                    onClick={() => setActiveLaneIndex(activeLaneIndex === laneIdx ? null : laneIdx)}
                    size="small"
                  >
                    <Plus aria-hidden="true" size={16} />
                  </IconButton>
                  <IconButton aria-label="Lane actions" size="small">
                    <MoreHorizontal aria-hidden="true" size={16} />
                  </IconButton>
                </Stack>
              </Stack>

              {/* Lane Cards Container */}
              <Stack spacing={1.5} sx={{ flexGrow: 1, minHeight: 120 }}>
                {lane.cards.map((card) => {
                  const prevLane = laneIdx > 0 ? visibleLanes[laneIdx - 1]?.label : null;
                  const nextLane = laneIdx < visibleLanes.length - 1 ? visibleLanes[laneIdx + 1]?.label : null;

                  return (
                    <Paper
                      className="op-wp-single-card group"
                      data-test-selector="op-wp-single-card"
                      draggable
                      key={card.id}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", card.id);
                      }}
                      sx={{
                        bgcolor: "background.paper",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: "4px",
                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                        cursor: "grab",
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                        p: 2,
                        position: "relative",
                        transition: "all 150ms ease-in-out",
                        "&:active": { cursor: "grabbing" },
                        "&:focus-visible": {
                          boxShadow: "0 0 0 3px rgba(26, 103, 163, 0.25)",
                          outline: "none",
                        },
                        "&:hover": {
                          borderColor: "primary.main",
                          boxShadow: "0 3px 8px rgba(0, 0, 0, 0.09)",
                        },
                      }}
                      variant="outlined"
                    >
                      {/* Top Status Highlight Line */}
                      <Box
                        aria-hidden="true"
                        sx={{
                          bgcolor: tone.bg,
                          borderRadius: "4px 4px 0 0",
                          height: 3,
                          left: 0,
                          position: "absolute",
                          right: 0,
                          top: 0,
                        }}
                      />

                      {/* Card Top Row: Type Tag & ID & Move Buttons */}
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between", mt: 0.5 }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                          <Chip
                            label="TASK"
                            size="small"
                            sx={{
                              bgcolor: "grey.100",
                              color: "text.secondary",
                              fontSize: "0.6875rem",
                              fontWeight: 700,
                              height: 18,
                            }}
                          />
                          <Typography
                            component={Link}
                            href={`${workPackagesHref}/${card.id.replace(/^WP-/, "")}`}
                            sx={{
                              color: "primary.main",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              textDecoration: "none",
                              "&:hover": { textDecoration: "underline" },
                            }}
                            variant="caption"
                          >
                            {card.id}
                          </Typography>
                        </Stack>

                        <Stack direction="row" spacing={0.5}>
                          {prevLane ? (
                            <IconButton
                              aria-label={`Move ${card.id} to ${prevLane}`}
                              onClick={() => handleMoveCard(card.id, prevLane)}
                              size="small"
                              sx={{ p: 0.5 }}
                            >
                              <ArrowLeft size={13} />
                            </IconButton>
                          ) : null}
                          {nextLane ? (
                            <IconButton
                              aria-label={`Move ${card.id} to ${nextLane}`}
                              onClick={() => handleMoveCard(card.id, nextLane)}
                              size="small"
                              sx={{ p: 0.5 }}
                            >
                              <ArrowRight size={13} />
                            </IconButton>
                          ) : null}
                        </Stack>
                      </Stack>

                      {/* Subject */}
                      <Typography
                        className="op-wp-single-card--content-subject"
                        component={Link}
                        data-test-selector="op-wp-single-card--content-subject"
                        href={`${workPackagesHref}/${card.id.replace(/^WP-/, "")}`}
                        sx={{
                          color: "text.primary",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          lineHeight: 1.35,
                          textDecoration: "none",
                          "&:hover": { color: "primary.main" },
                        }}
                        variant="body2"
                      >
                        {card.subject}
                      </Typography>

                      {/* Card Footer: Assignee Avatar + Due Date */}
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between", mt: "auto", pt: 0.5 }}>
                        <Box onClick={(e) => e.stopPropagation()}>
                          <UserProfilePopover
                            projectId={projectId}
                            user={{
                              email: `${card.assignee.toLowerCase().replace(" ", ".")}@example.com`,
                              name: card.assignee,
                              role: "Project Member",
                            }}
                          >
                            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                              <Avatar
                                sx={{
                                  bgcolor: "primary.main",
                                  fontSize: "0.6875rem",
                                  fontWeight: 700,
                                  height: 22,
                                  width: 22,
                                  cursor: "pointer",
                                }}
                              >
                                {card.assignee.slice(0, 1).toUpperCase()}
                              </Avatar>
                              <Typography color="text.secondary" sx={{ fontSize: "0.75rem" }} variant="caption">
                                {card.assignee}
                              </Typography>
                            </Stack>
                          </UserProfilePopover>
                        </Box>

                        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", color: "text.secondary" }}>
                          <CalendarDays aria-hidden="true" size={13} strokeWidth={1.8} />
                          <Typography sx={{ fontSize: "0.75rem" }} variant="caption">
                            Due {card.due}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Paper>
                  );
                })}

                {/* Inline add card at bottom of lane */}
                {activeLaneIndex === laneIdx ? (
                  <Box sx={{ bgcolor: "background.paper", border: "1px dashed", borderColor: "primary.main", borderRadius: 1, p: 1.5 }}>
                    <TextField
                      autoFocus
                      fullWidth
                      onChange={(e) => setLaneInlineSubject(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addCardToLane(laneIdx);
                        if (e.key === "Escape") setActiveLaneIndex(null);
                      }}
                      placeholder="Card subject..."
                      size="small"
                      value={laneInlineSubject}
                    />
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Button onClick={() => addCardToLane(laneIdx)} size="small">
                        Add
                      </Button>
                      <Button onClick={() => setActiveLaneIndex(null)} size="small" variant="ghost">
                        Cancel
                      </Button>
                    </Stack>
                  </Box>
                ) : null}
              </Stack>
            </Box>
          );
        })}
      </Box>

      <Modal
        actions={
          <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
            <Button onClick={() => setIsConfigurationOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={saveConfiguration}>Apply</Button>
          </Stack>
        }
        onClose={() => setIsConfigurationOpen(false)}
        open={isConfigurationOpen}
        title="Configure board"
      >
        <Stack spacing={3}>
          <TextField
            autoFocus
            fullWidth
            label="Board name"
            onChange={(event) => setBoardNameDraft(event.target.value)}
            value={boardNameDraft}
          />
        </Stack>
      </Modal>

      <AddBoardLaneModal
        onAddLane={handleAddLane}
        onClose={() => setIsAddLaneOpen(false)}
        open={isAddLaneOpen}
      />
    </Box>
  );
}
