"use client";

import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { Modal, type ModalProps } from "@/components/ui/Modal";

export interface ConfirmDialogProps extends Omit<
  ModalProps,
  "actions" | "children" | "onClose" | "title"
> {
  cancelLabel?: string;
  children?: ReactNode;
  confirmLabel?: string;
  description?: ReactNode;
  intent?: "default" | "destructive";
  isConfirming?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: ReactNode;
}

export function ConfirmDialog({
  cancelLabel = "Cancel",
  children,
  confirmLabel,
  description,
  intent = "default",
  isConfirming = false,
  onCancel,
  onConfirm,
  title,
  ...props
}: ConfirmDialogProps) {
  const resolvedConfirmLabel = confirmLabel ?? (intent === "destructive" ? "Delete" : "Confirm");

  return (
    <Modal
      {...props}
      actions={
        <>
          <Button autoFocus disabled={isConfirming} onClick={onCancel} variant="outline">
            {cancelLabel}
          </Button>
          <Button
            color={intent === "destructive" ? "error" : "primary"}
            isLoading={isConfirming}
            onClick={onConfirm}
          >
            {resolvedConfirmLabel}
          </Button>
        </>
      }
      closeDisabled={isConfirming}
      onClose={isConfirming ? () => undefined : onCancel}
      title={title}
    >
      {description ? (
        <Typography color="text.secondary" variant="body2">
          {description}
        </Typography>
      ) : null}
      {children}
    </Modal>
  );
}
