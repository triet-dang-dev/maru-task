import Stack from "@mui/material/Stack";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

import type { MyPageWidgetDefinition } from "./my-page-model";

export function MyPageAddWidgetDialog({
  availableWidgets,
  onCancel,
  onSelect,
}: {
  availableWidgets: MyPageWidgetDefinition[];
  onCancel: () => void;
  onSelect: (widget: MyPageWidgetDefinition) => void;
}) {
  return (
    <Modal
      actions={
        <Button onClick={onCancel} variant="ghost">
          Cancel
        </Button>
      }
      onClose={onCancel}
      open
      title="Add widget"
    >
      <Stack component="ul" spacing={1} sx={{ listStyle: "none", m: 0, p: 0 }}>
        {availableWidgets.map((widget) => (
          <li key={widget.id}>
            <Button
              fullWidth
              onClick={() => onSelect(widget)}
              sx={{ justifyContent: "flex-start" }}
              variant="text"
            >
              {widget.title}
            </Button>
          </li>
        ))}
      </Stack>
    </Modal>
  );
}
