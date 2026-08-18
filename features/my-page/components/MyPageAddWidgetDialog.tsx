"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

import type { MyPageWidgetDefinition } from "./my-page-model";

export interface MyPageAddWidgetDialogProps {
  availableWidgets: MyPageWidgetDefinition[];
  onCancel: () => void;
  onSelect: (widget: MyPageWidgetDefinition) => void;
}

export function MyPageAddWidgetDialog({
  availableWidgets,
  onCancel,
  onSelect,
}: MyPageAddWidgetDialogProps) {
  return (
    <Modal
      actions={
        <Button onClick={onCancel} variant="ghost">
          Close
        </Button>
      }
      onClose={onCancel}
      open
      title="Add widget to My page"
    >
      {availableWidgets.length === 0 ? (
        <Box sx={{ py: 3, textAlign: "center" }}>
          <Typography color="text.secondary" variant="body2">
            All available widgets have already been added to your dashboard.
          </Typography>
        </Box>
      ) : (
        <Stack
          component="ul"
          spacing={1.5}
          sx={{ listStyle: "none", m: 0, p: 0 }}
        >
          {availableWidgets.map((widget) => (
            <Box
              component="li"
              key={widget.id}
              sx={{
                border: "1px solid var(--mui-palette-divider)",
                borderRadius: 2,
                p: 2,
                transition: "all 0.15s ease-in-out",
                "&:hover": {
                  bgcolor: "action.hover",
                  borderColor: "primary.main",
                },
              }}
            >
              <Stack
                direction="row"
                spacing={2}
                sx={{ alignItems: "center", justifyContent: "space-between" }}
              >
                <Box sx={{ minWidth: 0, pr: 2 }}>
                  <Typography sx={{ fontWeight: 650 }} variant="subtitle2">
                    {widget.title}
                  </Typography>
                  {widget.description ? (
                    <Typography color="text.secondary" sx={{ fontSize: "0.8125rem", mt: 0.25 }} variant="body2">
                      {widget.description}
                    </Typography>
                  ) : null}
                </Box>
                <Button
                  onClick={() => onSelect(widget)}
                  size="small"
                  startIcon={<Plus aria-hidden="true" className="h-4 w-4" />}
                  variant="outline"
                >
                  Add
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Modal>
  );
}
