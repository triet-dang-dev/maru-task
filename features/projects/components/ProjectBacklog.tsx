"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ArrowDown, ArrowUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { agileApiService } from "@/services/api/backend-services/agile";

export interface BacklogWorkPackage {
  id: string;
  points: number;
  priority: "High" | "Normal" | "Low";
  subject: string;
}

interface ProjectBacklogProps {
  burndownData?: number[];
  isBurndownLoading?: boolean;
  items?: BacklogWorkPackage[];
  projectId: string;
}

const defaultItems: BacklogWorkPackage[] = [
  { id: "WP-147", points: 8, priority: "High", subject: "Schedule release readiness review" },
  { id: "WP-144", points: 5, priority: "High", subject: "Prepare customer onboarding notes" },
  { id: "WP-145", points: 3, priority: "Normal", subject: "Verify the project data import" },
  { id: "WP-138", points: 2, priority: "Normal", subject: "Confirm project stakeholder access" },
];

const burndownDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const idealPoints = [18, 15, 12, 9, 6, 3, 0];
const actualPoints = [18, 18, 14, 14, 10, 7, 5];
const priorityColor = { High: "error", Low: "default", Normal: "primary" } as const;

function toChartPoints(values: number[], maxValue: number) {
  const chartHeight = 180;
  const width = 600;
  const paddingX = 42;
  const paddingY = 22;

  return values
    .map((value, index) => {
      const x = paddingX + (index / (values.length - 1)) * (width - paddingX * 2);
      const y = paddingY + (1 - value / maxValue) * (chartHeight - paddingY * 2);
      return `${x},${y}`;
    })
    .join(" ");
}

export function ProjectBacklog({
  burndownData = actualPoints,
  isBurndownLoading = false,
  items = defaultItems,
  projectId,
}: ProjectBacklogProps) {
  const [backlogItems, setBacklogItems] = useState(items);
  const [selectedSprint, setSelectedSprint] = useState("");
  const workItemsHref = `/projects/${projectId}/work-items`;
  const maxPoints = Math.max(...idealPoints, ...burndownData, 1);

  const moveItem = (itemId: string, direction: -1 | 1) => {
    setBacklogItems((currentItems) => {
      const index = currentItems.findIndex((item) => item.id === itemId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= currentItems.length) return currentItems;
      const reordered = [...currentItems];
      [reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]];

      if (projectId) {
        agileApiService
          .reorderBacklogs({
            body: {
              items: reordered.map((it, idx) => ({ id: it.id, position: idx })),
              projectId,
            },
          })
          .catch(() => {
            // Fallback in mock mode
          });
      }

      return reordered;
    });
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
            Backlog
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Prioritize upcoming work and track the sprint burn-down.
          </Typography>
        </Box>
        <Typography
          component={Link}
          href={workItemsHref}
          sx={{ color: "primary.main", fontWeight: 700 }}
        >
          Open work packages
        </Typography>
      </Stack>

      {backlogItems.length === 0 ? (
        <Paper role="status" sx={{ p: 6, textAlign: "center" }} variant="outlined">
          <Typography sx={{ fontWeight: 700 }}>No work packages in this backlog</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">
            Add work packages to start planning the next sprint.
          </Typography>
        </Paper>
      ) : (
        <Box
          sx={{
            display: "grid",
            gap: 4,
            gridTemplateColumns: { lg: "minmax(0, 1fr) minmax(22rem, 0.9fr)" },
          }}
        >
          <Paper component="section" sx={{ overflow: "hidden" }} variant="outlined">
            <Stack
              direction={{ sm: "row" }}
              spacing={2}
              sx={{
                alignItems: { sm: "center" },
                borderBottom: 1,
                borderColor: "divider",
                justifyContent: "space-between",
                px: 4,
                py: 3,
              }}
            >
              <Typography component="h2" sx={{ fontWeight: 700 }} variant="subtitle1">
                Prioritized work packages
              </Typography>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel id="sprint-select-label">Sprint</InputLabel>
                  <Select
                    label="Sprint"
                    labelId="sprint-select-label"
                    onChange={(event) => setSelectedSprint(event.target.value)}
                    value={selectedSprint}
                  >
                    <MenuItem value="">No sprint</MenuItem>
                    <MenuItem value="sprint-12">Sprint 12</MenuItem>
                  </Select>
                </FormControl>
                <Button disabled={!selectedSprint} size="small" variant="outline">
                  Plan sprint
                </Button>
              </Stack>
            </Stack>
            {selectedSprint ? (
              <Typography
                color="text.secondary"
                role="status"
                sx={{ px: 4, pt: 2 }}
                variant="caption"
              >
                Sprint 12 is planned
              </Typography>
            ) : null}
            <Stack
              aria-label="Prioritized work packages"
              component="ol"
              divider={<Box sx={{ borderTop: 1, borderColor: "divider" }} />}
              sx={{ listStylePosition: "inside", m: 0, p: 0 }}
            >
              {backlogItems.map((item, index) => (
                <Stack
                  component="li"
                  direction="row"
                  key={item.id}
                  spacing={2}
                  sx={{ alignItems: "center", justifyContent: "space-between", px: 4, py: 3 }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography color="primary.main" variant="caption">
                      {item.id}
                    </Typography>
                    <Typography sx={{ fontWeight: 600 }} variant="body2">
                      {item.subject}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexShrink: 0 }}>
                    <Chip
                      color={priorityColor[item.priority]}
                      label={item.priority}
                      size="small"
                      variant="outlined"
                    />
                    <Typography color="text.secondary" variant="caption">
                      {item.points} pts
                    </Typography>
                    <IconButton
                      aria-label={`Move ${item.id} up`}
                      disabled={index === 0}
                      onClick={() => moveItem(item.id, -1)}
                      size="small"
                    >
                      <ArrowUp aria-hidden="true" size={16} />
                    </IconButton>
                    <IconButton
                      aria-label={`Move ${item.id} down`}
                      disabled={index === backlogItems.length - 1}
                      onClick={() => moveItem(item.id, 1)}
                      size="small"
                    >
                      <ArrowDown aria-hidden="true" size={16} />
                    </IconButton>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Paper>

          <Paper aria-label="Sprint burndown" component="section" sx={{ p: 4 }} variant="outlined">
            <Stack direction="row" sx={{ alignItems: "baseline", justifyContent: "space-between" }}>
              <Typography component="h2" sx={{ fontWeight: 700 }} variant="subtitle1">
                Sprint burndown
              </Typography>
              <Typography color="text.secondary" variant="caption">
                Points
              </Typography>
            </Stack>
            {isBurndownLoading ? (
              <Stack aria-label="Loading sprint burndown" role="status" spacing={1} sx={{ mt: 3 }}>
                <Skeleton height={180} variant="rounded" />
              </Stack>
            ) : burndownData.length === 0 ? (
              <Box role="status" sx={{ py: 8, textAlign: "center" }}>
                <Typography sx={{ fontWeight: 600 }}>No burndown data yet</Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }} variant="body2">
                  Sprint progress will appear when work starts.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ mt: 3, overflowX: "auto" }}>
                <svg aria-label="Burndown chart" height="230" viewBox="0 0 600 230" width="100%">
                  {[0, 6, 12, 18].map((value) => {
                    const y = 22 + (1 - value / 18) * 136;
                    return (
                      <g key={value}>
                        <line
                          stroke="currentColor"
                          strokeOpacity="0.14"
                          x1="42"
                          x2="558"
                          y1={y}
                          y2={y}
                        />
                        <text fill="currentColor" fontSize="11" textAnchor="end" x="34" y={y + 4}>
                          {value}
                        </text>
                      </g>
                    );
                  })}
                  <polyline
                    fill="none"
                    points={toChartPoints(idealPoints, maxPoints)}
                    stroke="#7f8c8d"
                    strokeDasharray="6 4"
                    strokeWidth="2"
                  />
                  <polyline
                    fill="none"
                    points={toChartPoints(burndownData, maxPoints)}
                    stroke="#1a67a3"
                    strokeWidth="3"
                  />
                  {burndownDays.map((day, index) => (
                    <text
                      fill="currentColor"
                      fontSize="11"
                      key={day}
                      textAnchor="middle"
                      x={42 + (index / 6) * 516}
                      y="184"
                    >
                      {day}
                    </text>
                  ))}
                  <text fill="currentColor" fontSize="12" textAnchor="middle" x="300" y="218">
                    Day
                  </text>
                </svg>
              </Box>
            )}
            <Stack direction="row" spacing={3} sx={{ color: "text.secondary", mt: 1 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Box
                  sx={{ borderTop: 2, borderColor: "#7f8c8d", borderStyle: "dashed", width: 22 }}
                />
                <Typography variant="caption">Ideal remaining</Typography>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <Box sx={{ borderTop: 3, borderColor: "primary.main", width: 22 }} />
                <Typography variant="caption">Actual remaining</Typography>
              </Stack>
            </Stack>
          </Paper>
        </Box>
      )}
    </Box>
  );
}
