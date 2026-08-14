"use client";

import MuiButton, { type ButtonProps as MuiButtonProps } from "@mui/material/Button";
import { LoaderCircle } from "lucide-react";
import { forwardRef } from "react";

import { cn } from "@/utils/cn";

type ButtonVariant = "solid" | "outline" | "ghost" | "text";

export interface ButtonProps extends Omit<MuiButtonProps, "variant"> {
  isLoading?: boolean;
  variant?: ButtonVariant;
}

const muiVariant: Record<ButtonVariant, MuiButtonProps["variant"]> = {
  ghost: "text",
  outline: "outlined",
  solid: "contained",
  text: "text",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { children, className, disabled, isLoading = false, startIcon, variant = "solid", ...props },
    ref,
  ) => (
    <MuiButton
      className={cn("text-sm", className)}
      color={props.color ?? (variant === "ghost" || variant === "text" ? "secondary" : "primary")}
      disabled={disabled || isLoading}
      ref={ref}
      startIcon={
        isLoading ? (
          <LoaderCircle
            aria-hidden="true"
            className="h-4 w-4 animate-spin"
            data-testid="button-loading-icon"
          />
        ) : (
          startIcon
        )
      }
      sx={
        variant === "ghost"
          ? { "&:hover": { bgcolor: "action.hover" } }
          : variant === "text"
            ? { minWidth: "auto", px: 2 }
            : undefined
      }
      variant={muiVariant[variant]}
      {...props}
    >
      {children}
    </MuiButton>
  ),
);

Button.displayName = "Button";
