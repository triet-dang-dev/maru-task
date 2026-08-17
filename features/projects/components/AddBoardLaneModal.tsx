"use client";

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

interface AddBoardLaneModalProps {
  existingLaneLabels?: string[];
  onAddLane: (lane: { label: string; tone: "info" | "success" | "warning" }) => void;
  onClose: () => void;
  open: boolean;
}

const presetLanes = [
  { label: "Needs review", tone: "warning" as const },
  { label: "Blocked", tone: "info" as const },
  { label: "Testing", tone: "warning" as const },
  { label: "Approved", tone: "success" as const },
  { label: "Deployed", tone: "success" as const },
];

export function AddBoardLaneModal({
  existingLaneLabels = [],
  onAddLane,
  onClose,
  open,
}: AddBoardLaneModalProps) {
  const { success } = useToast();
  const [selectedPreset, setSelectedPreset] = useState<string>("custom");
  const [customLabel, setCustomLabel] = useState<string>("");
  const [tone, setTone] = useState<"info" | "success" | "warning">("info");

  const availablePresets = presetLanes.filter(
    (p) => !existingLaneLabels.includes(p.label),
  );

  const handleAdd = () => {
    const label = selectedPreset === "custom" ? customLabel.trim() : selectedPreset;
    if (!label) return;

    const matchedPreset = presetLanes.find((p) => p.label === label);
    const selectedTone = matchedPreset ? matchedPreset.tone : tone;

    onAddLane({ label, tone: selectedTone });
    success(`Added "${label}" lane to the board.`);
    onClose();
  };

  return (
    <Modal
      actions={
        <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end", width: "100%" }}>
          <Button onClick={onClose} variant="ghost">
            Cancel
          </Button>
          <Button
            disabled={selectedPreset === "custom" && !customLabel.trim()}
            onClick={handleAdd}
            startIcon={<Plus size={16} />}
            variant="solid"
          >
            Add list
          </Button>
        </Stack>
      }
      onClose={onClose}
      open={open}
      title="Add list to board"
    >
      <Stack spacing={3}>
        <FormControl fullWidth size="small">
          <InputLabel id="add-lane-preset-label">Choose lane</InputLabel>
          <Select
            label="Choose lane"
            labelId="add-lane-preset-label"
            onChange={(e) => setSelectedPreset(e.target.value)}
            value={selectedPreset}
          >
            {availablePresets.map((preset) => (
              <MenuItem key={preset.label} value={preset.label}>
                {preset.label}
              </MenuItem>
            ))}
            <MenuItem value="custom">Custom lane name...</MenuItem>
          </Select>
        </FormControl>

        {selectedPreset === "custom" ? (
          <>
            <TextField
              autoFocus
              fullWidth
              id="custom-lane-name-input"
              label="Lane name"
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="e.g., In QA"
              required
              size="small"
              slotProps={{ htmlInput: { "aria-label": "Lane name" } }}
              value={customLabel}
            />

            <FormControl fullWidth size="small">
              <InputLabel id="lane-tone-label">Tone highlight</InputLabel>
              <Select
                label="Tone highlight"
                labelId="lane-tone-label"
                onChange={(e) => setTone(e.target.value as "info" | "success" | "warning")}
                value={tone}
              >
                <MenuItem value="info">Info (Blue)</MenuItem>
                <MenuItem value="warning">Warning (Orange)</MenuItem>
                <MenuItem value="success">Success (Green)</MenuItem>
              </Select>
            </FormControl>
          </>
        ) : null}
      </Stack>
    </Modal>
  );
}
