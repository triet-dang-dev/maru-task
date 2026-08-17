"use client";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";

const reportRows = [
  { cost: 125, date: "2026-08-14", hours: 2.5, workItem: "Review the release checklist" },
  { cost: 350, date: "2026-08-13", hours: 8, workItem: "Validate the integration contract" },
  { cost: 300, date: "2026-08-12", hours: 8, workItem: "Confirm project stakeholder access" },
];

export function ProjectTimeCostReport({ projectId }: { projectId: string }) {
  const [fromDate, setFromDate] = useState("2026-08-01");
  const [toDate, setToDate] = useState("2026-08-31");
  const totalHours = reportRows.reduce((total, row) => total + row.hours, 0);
  const totalCost = reportRows.reduce((total, row) => total + row.cost, 0);

  return (
    <Box>
      <Typography component="h1" variant="h1">
        Time and cost report
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        Review recorded effort and cost for this project.
      </Typography>
      <Stack direction={{ sm: "row" }} spacing={2} sx={{ mt: 4 }}>
        <TextField
          label="From date"
          onChange={(event) => setFromDate(event.target.value)}
          size="small"
          type="date"
          value={fromDate}
        />
        <TextField
          label="To date"
          onChange={(event) => setToDate(event.target.value)}
          size="small"
          type="date"
          value={toDate}
        />
      </Stack>
      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { sm: "repeat(2, minmax(0, 1fr))" },
          mt: 4,
        }}
      >
        <Paper sx={{ p: 3 }} variant="outlined">
          <Typography color="text.secondary" variant="caption">
            Total time
          </Typography>
          <Typography sx={{ fontWeight: 700, mt: 1 }} variant="h3">
            {totalHours} h
          </Typography>
        </Paper>
        <Paper sx={{ p: 3 }} variant="outlined">
          <Typography color="text.secondary" variant="caption">
            Total cost
          </Typography>
          <Typography sx={{ fontWeight: 700, mt: 1 }} variant="h3">
            ${totalCost.toFixed(2)}
          </Typography>
        </Paper>
      </Box>
      <Paper sx={{ mt: 4, overflow: "hidden" }} variant="outlined">
        <table
          aria-label="Project time and cost entries"
          className="w-full border-collapse text-left"
        >
          <thead>
            <tr className="border-b border-[var(--mui-palette-divider)] bg-[var(--mui-palette-action-hover)] text-xs">
              <th className="p-3">Date</th>
              <th className="p-3">Work package</th>
              <th className="p-3">Hours</th>
              <th className="p-3">Cost</th>
            </tr>
          </thead>
          <tbody>
            {reportRows.map((row) => (
              <tr
                className="border-b border-[var(--mui-palette-divider)]"
                key={`${projectId}-${row.date}-${row.workItem}`}
              >
                <td className="p-3 text-sm">{row.date}</td>
                <td className="p-3 text-sm">{row.workItem}</td>
                <td className="p-3 text-sm">{row.hours} h</td>
                <td className="p-3 text-sm">${row.cost.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Paper>
    </Box>
  );
}
