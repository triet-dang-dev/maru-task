"use client";

import Alert, { type AlertProps } from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import { X } from "lucide-react";
import type { ReactNode } from "react";

import { IconButton } from "@/components/ui/IconButton";

export interface InlineAlertProps extends Omit<
  AlertProps,
  "onClose" | "role" | "severity" | "title"
> {
  dismissLabel?: string;
  onDismiss?: () => void;
  role?: "alert" | "status";
  title?: ReactNode;
  tone?: "error" | "info" | "success" | "warning";
}

export function InlineAlert({
  action,
  children,
  dismissLabel = "Dismiss alert",
  onDismiss,
  role,
  title,
  tone = "info",
  ...props
}: InlineAlertProps) {
  const resolvedRole = role ?? (tone === "error" ? "alert" : "status");
  const resolvedAction =
    action || onDismiss ? (
      <Box sx={{ alignItems: "center", display: "flex", gap: 1 }}>
        {action}
        {onDismiss ? (
          <IconButton aria-label={dismissLabel} onClick={onDismiss} size="small">
            <X aria-hidden="true" className="h-4 w-4" />
          </IconButton>
        ) : null}
      </Box>
    ) : undefined;

  return (
    <Alert {...props} action={resolvedAction} role={resolvedRole} severity={tone}>
      {title ? <AlertTitle>{title}</AlertTitle> : null}
      {children}
    </Alert>
  );
}
