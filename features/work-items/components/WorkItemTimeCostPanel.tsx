"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";

import { Button } from "@/components/ui/Button";

export interface WorkItemTimeEntry {
  date: string;
  hours: number;
  id: string;
  note: string;
}

export interface WorkItemCostEntry {
  amount: number;
  date: string;
  id: string;
  note: string;
}

interface WorkItemTimeCostPanelProps {
  costEntries: WorkItemCostEntry[];
  timeEntries: WorkItemTimeEntry[];
}

export function WorkItemTimeCostPanel({ costEntries, timeEntries }: WorkItemTimeCostPanelProps) {
  const [localTimeEntries, setLocalTimeEntries] = useState(timeEntries);
  const [hours, setHours] = useState("");
  const [note, setNote] = useState("");

  const addTimeEntry = () => {
    const parsedHours = Number(hours);
    if (!note.trim() || !Number.isFinite(parsedHours) || parsedHours <= 0) return;
    setLocalTimeEntries((entries) => [
      ...entries,
      {
        date: "Today",
        hours: parsedHours,
        id: `local-time-${entries.length + 1}`,
        note: note.trim(),
      },
    ]);
    setHours("");
    setNote("");
  };

  return (
    <Stack spacing={5}>
      <Box>
        <Typography component="h3" sx={{ fontWeight: 700, mb: 2 }} variant="subtitle1">
          Time entries
        </Typography>
        <table aria-label="Time entries" className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--mui-palette-divider)] text-xs">
              <th className="py-2">Date</th>
              <th className="py-2">Hours</th>
              <th className="py-2">Comment</th>
            </tr>
          </thead>
          <tbody>
            {localTimeEntries.map((entry) => (
              <tr className="border-b border-[var(--mui-palette-divider)]" key={entry.id}>
                <td className="py-2 text-sm">{entry.date}</td>
                <td className="py-2 text-sm">{entry.hours} h</td>
                <td className="py-2 text-sm">{entry.note}</td>
              </tr>
            ))}
            {localTimeEntries.length === 0 ? (
              <tr>
                <td className="py-4 text-sm text-[var(--mui-palette-text-secondary)]" colSpan={3}>
                  No time entries yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
        <Stack direction={{ sm: "row" }} spacing={2} sx={{ mt: 2 }}>
          <TextField
            label="Hours"
            onChange={(event) => setHours(event.target.value)}
            size="small"
            type="number"
            value={hours}
          />
          <TextField
            fullWidth
            label="Time entry note"
            onChange={(event) => setNote(event.target.value)}
            size="small"
            value={note}
          />
          <Button onClick={addTimeEntry}>Add time entry</Button>
        </Stack>
      </Box>
      <Box>
        <Typography component="h3" sx={{ fontWeight: 700, mb: 2 }} variant="subtitle1">
          Cost entries
        </Typography>
        <table aria-label="Cost entries" className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--mui-palette-divider)] text-xs">
              <th className="py-2">Date</th>
              <th className="py-2">Amount</th>
              <th className="py-2">Comment</th>
            </tr>
          </thead>
          <tbody>
            {costEntries.map((entry) => (
              <tr className="border-b border-[var(--mui-palette-divider)]" key={entry.id}>
                <td className="py-2 text-sm">{entry.date}</td>
                <td className="py-2 text-sm">${entry.amount.toFixed(2)}</td>
                <td className="py-2 text-sm">{entry.note}</td>
              </tr>
            ))}
            {costEntries.length === 0 ? (
              <tr>
                <td className="py-4 text-sm text-[var(--mui-palette-text-secondary)]" colSpan={3}>
                  No cost entries yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Box>
    </Stack>
  );
}
