"use client";

import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Bell, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

interface WorkItemReminderModalProps {
  currentReminderDate?: string;
  currentReminderNote?: string;
  onClose: () => void;
  onSaveReminder?: (reminder: { date: string; note: string }) => void;
  open: boolean;
  workItemId: string;
  workItemSubject?: string;
}

export function WorkItemReminderModal({
  currentReminderDate = "",
  currentReminderNote = "",
  onClose,
  onSaveReminder,
  open,
  workItemId,
  workItemSubject = "Work Package",
}: WorkItemReminderModalProps) {
  const { success } = useToast();
  const [preset, setPreset] = useState<string>("tomorrow");
  const [customDate, setCustomDate] = useState<string>(
    () => currentReminderDate || new Date(Date.now() + 86400000).toISOString().slice(0, 16),
  );
  const [note, setNote] = useState<string>(currentReminderNote);
  const [hasExistingReminder, setHasExistingReminder] = useState<boolean>(Boolean(currentReminderDate));

  const handleSave = () => {
    const reminderDate = preset === "custom" ? customDate : getPresetDate(preset);
    onSaveReminder?.({ date: reminderDate, note });
    setHasExistingReminder(true);
    success(`Reminder set for #${workItemId} on ${reminderDate}.`);
    onClose();
  };

  const handleClear = () => {
    onSaveReminder?.({ date: "", note: "" });
    setHasExistingReminder(false);
    setNote("");
    success(`Reminder cleared for #${workItemId}.`);
    onClose();
  };

  const getPresetDate = (selectedPreset: string) => {
    const now = new Date();
    if (selectedPreset === "tomorrow") {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      return tomorrow.toLocaleString();
    }
    if (selectedPreset === "in_2_days") {
      const twoDays = new Date(now);
      twoDays.setDate(twoDays.getDate() + 2);
      twoDays.setHours(9, 0, 0, 0);
      return twoDays.toLocaleString();
    }
    if (selectedPreset === "next_week") {
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      nextWeek.setHours(9, 0, 0, 0);
      return nextWeek.toLocaleString();
    }
    return customDate;
  };

  return (
    <Modal
      actions={
        <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", width: "100%" }}>
          <Box>
            {hasExistingReminder ? (
              <Button
                color="error"
                onClick={handleClear}
                startIcon={<Trash2 size={16} />}
                variant="ghost"
              >
                Delete reminder
              </Button>
            ) : null}
          </Box>
          <Stack direction="row" spacing={1}>
            <Button onClick={onClose} variant="ghost">
              Cancel
            </Button>
            <Button onClick={handleSave} startIcon={<Bell size={16} />} variant="solid">
              Set reminder
            </Button>
          </Stack>
        </Stack>
      }
      onClose={onClose}
      open={open}
      title={`Set personal reminder for #${workItemId}`}
    >
      <Stack spacing={3}>
        <Typography color="text.secondary" variant="body2">
          Receive a notification for &quot;{workItemSubject}&quot; at a specified time.
        </Typography>

        <FormControl fullWidth size="small">
          <InputLabel id="reminder-preset-label">When</InputLabel>
          <Select
            label="When"
            labelId="reminder-preset-label"
            onChange={(e) => setPreset(e.target.value)}
            value={preset}
          >
            <MenuItem value="tomorrow">Tomorrow morning (9:00 AM)</MenuItem>
            <MenuItem value="in_2_days">In 2 days (9:00 AM)</MenuItem>
            <MenuItem value="next_week">Next week (Monday 9:00 AM)</MenuItem>
            <MenuItem value="custom">Custom date and time...</MenuItem>
          </Select>
        </FormControl>

        {preset === "custom" ? (
          <TextField
            aria-label="Custom reminder date and time"
            fullWidth
            label="Date and time"
            onChange={(e) => setCustomDate(e.target.value)}
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
            type="datetime-local"
            value={customDate}
          />
        ) : null}

        <TextField
          fullWidth
          label="Personal note (optional)"
          multiline
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g., Follow up on stakeholder approval"
          rows={3}
          value={note}
        />
      </Stack>
    </Modal>
  );
}
