"use client";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";

const timelineDays = ["11 Aug", "12 Aug", "13 Aug", "14 Aug", "15 Aug", "16 Aug", "17 Aug"];

const scheduledWorkPackages = [
  {
    duration: 4,
    id: "101",
    startOffset: 0,
    status: "In progress",
    subject: "Map the project list contract",
  },
  {
    duration: 3,
    id: "102",
    startOffset: 2,
    status: "Open",
    subject: "Migrate the work-item table",
  },
  {
    duration: 2,
    id: "103",
    startOffset: 4,
    status: "Open",
    subject: "Create the authentication screen",
  },
];

export function ProjectGantt({ projectId }: { projectId: string }) {
  const workPackagesHref = `/projects/${projectId}/work-items`;

  return (
    <Box>
      <Stack
        direction={{ sm: "row" }}
        spacing={2}
        sx={{ alignItems: { sm: "baseline" }, justifyContent: "space-between", mb: 5 }}
      >
        <Box>
          <Typography component="h1" variant="h1">
            Gantt
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Schedule work packages against a shared timeline.
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

      <Paper sx={{ minWidth: 0, overflow: "hidden" }} variant="outlined">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { lg: "minmax(20rem, 1fr) minmax(34rem, 1.5fr)" },
          }}
        >
          <Box sx={{ overflowX: "auto" }}>
            <table
              aria-label="Scheduled work packages"
              className="w-full border-collapse text-left"
            >
              <thead>
                <tr className="border-b border-[var(--mui-palette-divider)] bg-[var(--mui-palette-action-hover)]">
                  <th className="px-4 py-3 text-xs font-semibold">ID</th>
                  <th className="px-4 py-3 text-xs font-semibold">Subject</th>
                  <th className="px-4 py-3 text-xs font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {scheduledWorkPackages.map((workPackage) => (
                  <tr className="border-b border-[var(--mui-palette-divider)]" key={workPackage.id}>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-[var(--mui-palette-text-secondary)]">
                      #{workPackage.id}
                    </td>
                    <td className="px-4 py-4 text-sm font-medium">{workPackage.subject}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-[var(--mui-palette-text-secondary)]">
                      {workPackage.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>

          <Box
            aria-label="Work package timeline"
            component="section"
            sx={{ borderColor: "divider", borderLeft: { lg: 3 }, overflowX: "auto" }}
          >
            <Box sx={{ minWidth: 560, position: "relative" }}>
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(80px, 1fr))" }}>
                {timelineDays.map((day) => (
                  <Typography
                    key={day}
                    sx={{ borderBottom: 1, borderColor: "divider", p: 1.5, textAlign: "center" }}
                    variant="caption"
                  >
                    {day}
                  </Typography>
                ))}
              </Box>
              <Box
                aria-label="Today"
                sx={{
                  borderColor: "error.main",
                  borderLeft: 2,
                  bottom: 0,
                  left: "28.57%",
                  position: "absolute",
                  top: 0,
                }}
              >
                <Typography
                  color="error.main"
                  sx={{ left: 4, position: "absolute", top: 4, whiteSpace: "nowrap" }}
                  variant="caption"
                >
                  Today
                </Typography>
              </Box>
              {scheduledWorkPackages.map((workPackage) => (
                <Box
                  key={workPackage.id}
                  sx={{ borderBottom: 1, borderColor: "divider", height: 57, position: "relative" }}
                >
                  <Box
                    aria-label={`${workPackage.subject} schedule`}
                    sx={{
                      alignItems: "center",
                      backgroundColor: "primary.main",
                      borderRadius: 1,
                      color: "primary.contrastText",
                      display: "flex",
                      fontSize: "0.75rem",
                      height: 24,
                      left: `${(workPackage.startOffset / timelineDays.length) * 100}%`,
                      overflow: "hidden",
                      px: 1,
                      position: "absolute",
                      textOverflow: "ellipsis",
                      top: 16,
                      whiteSpace: "nowrap",
                      width: `${(workPackage.duration / timelineDays.length) * 100}%`,
                    }}
                  >
                    {workPackage.subject}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
