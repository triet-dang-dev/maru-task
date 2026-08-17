"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/Button";

export interface WorkItemEditActionsBarProps {
  disabled?: boolean;
  isSaving?: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export function WorkItemEditActionsBar({
  disabled = false,
  isSaving = false,
  onCancel,
  onSave,
}: WorkItemEditActionsBarProps) {
  return (
    <Box
      className="work-packages--edit-actions"
      data-test-selector="work-packages--edit-actions"
      sx={{
        alignItems: "center",
        bgcolor: "background.paper",
        borderTop: 1,
        borderColor: "divider",
        bottom: 0,
        boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.08)",
        display: "flex",
        justifyContent: "flex-end",
        p: 2,
        position: "sticky",
        zIndex: 10,
      }}
    >
      <Stack direction="row" spacing={1.5}>
        <Button
          disabled={disabled || isSaving}
          id="work-packages--edit-actions-cancel"
          onClick={onCancel}
          size="small"
          startIcon={<X aria-hidden="true" size={16} />}
          type="button"
          variant="outline"
        >
          Cancel
        </Button>
        <Button
          disabled={disabled || isSaving}
          id="work-packages--edit-actions-save"
          onClick={onSave}
          size="small"
          startIcon={<Check aria-hidden="true" size={16} />}
          type="submit"
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </Stack>
    </Box>
  );
}
