"use client";

import Dialog, { type DialogProps } from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { X } from "lucide-react";
import { type ReactNode, useId } from "react";

import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/utils/cn";

export interface ModalProps extends Omit<DialogProps, "children" | "onClose" | "open" | "title"> {
  actions?: ReactNode;
  children: ReactNode;
  closeDisabled?: boolean;
  closeLabel?: string;
  onClose: () => void;
  open: boolean;
  title: ReactNode;
}

export function Modal({
  actions,
  children,
  className,
  closeDisabled = false,
  closeLabel = "Close dialog",
  maxWidth = "sm",
  onClose,
  open,
  title,
  ...props
}: ModalProps) {
  const titleId = useId();

  return (
    <Dialog
      aria-labelledby={titleId}
      className={className}
      fullWidth
      maxWidth={maxWidth}
      onClose={onClose}
      open={open}
      {...props}
    >
      <div className="flex items-start justify-between gap-4 border-b border-[var(--mui-palette-divider)] px-5 py-4 sm:px-6">
        <DialogTitle className="p-0" id={titleId} variant="h4">
          {title}
        </DialogTitle>
        <IconButton
          aria-label={closeLabel}
          className="h-9 w-9 text-[var(--mui-palette-text-secondary)] hover:bg-[var(--mui-palette-action-hover)] hover:text-[var(--mui-palette-text-primary)]"
          disabled={closeDisabled}
          onClick={onClose}
          type="button"
        >
          <X aria-hidden="true" className="h-5 w-5" />
        </IconButton>
      </div>

      <DialogContent className={cn("px-5 py-5 text-[var(--mui-palette-text-primary)] sm:px-6")}>
        {children}
      </DialogContent>
      {actions ? (
        <DialogActions className="gap-2 border-t border-[var(--mui-palette-divider)] px-5 py-4 sm:px-6">
          {actions}
        </DialogActions>
      ) : null}
    </Dialog>
  );
}
