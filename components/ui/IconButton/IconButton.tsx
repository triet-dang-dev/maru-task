"use client";

import MuiIconButton, {
  type IconButtonProps as MuiIconButtonProps,
} from "@mui/material/IconButton";
import { LoaderCircle } from "lucide-react";
import { forwardRef } from "react";

import { cn } from "@/utils/cn";

type AccessibleName =
  | { "aria-label": string; "aria-labelledby"?: string }
  | { "aria-label"?: string; "aria-labelledby": string };

export type IconButtonProps = Omit<MuiIconButtonProps, "aria-label" | "aria-labelledby"> &
  AccessibleName & {
    isLoading?: boolean;
  };

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ children, className, disabled, isLoading = false, ...props }, ref) => (
    <MuiIconButton
      {...props}
      aria-busy={isLoading || undefined}
      className={cn("shrink-0", className)}
      disabled={disabled || isLoading}
      ref={ref}
    >
      {isLoading ? (
        <LoaderCircle
          aria-hidden="true"
          className="h-5 w-5 animate-spin"
          data-testid="icon-button-loading-icon"
        />
      ) : (
        children
      )}
    </MuiIconButton>
  ),
);

IconButton.displayName = "IconButton";
